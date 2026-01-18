import * as path from "path";
import { parse } from "yaml";
import { buildScanContext } from "./tokenizer";
import { findExecHotkeyRefs } from "../dependency/callPatterns";
import {
    ExecHotkeyRef,
    LintConfig,
    LintFinding,
    LintRule,
    LintRuleContext,
    LintWorkspaceContext,
    ScriptFile,
    ScriptIndexEntry,
} from "./types";
import { getLintRules } from "./rules";

const KEYMAP_DAS_PATTERN = /([A-Za-z0-9_-]+)\.das/gi;
const KEYMAP_SCRIPT_PATTERN = /script(?:Path)?\s*:\s*["']?([^"'#\r\n]+)["']?/gi;

type KeymapEntryRecord = Record<string, unknown>;

function normalizeName(name: string): string {
    return name.trim().toLowerCase();
}

function extractExecHotkeyRefs(text: string): ExecHotkeyRef[] {
    return findExecHotkeyRefs(text).map((ref) => ({
        target: ref.target,
        offset: ref.offset,
        length: ref.length,
    }));
}

function extractEntries(data: unknown): unknown[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        if (Array.isArray(record.entries)) {
            return record.entries;
        }
    }
    return [];
}

function readStringField(
    entry: KeymapEntryRecord,
    keys: string[]
): string | undefined {
    for (const key of keys) {
        const value = entry[key];
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) {
                return trimmed;
            }
        }
        if (value === null && keys.includes(key)) {
            return "";
        }
    }
    return undefined;
}

function normalizeScriptName(scriptPath: string): string | undefined {
    if (!scriptPath) {
        return undefined;
    }
    const base = path.basename(scriptPath);
    const withoutExt = base.replace(/\.das$/i, "");
    const normalized = normalizeName(withoutExt);
    return normalized || undefined;
}

function parseKeymapReferences(text: string): {
    refs: Set<string>;
    duplicates: Set<string>;
} {
    const seen = new Map<string, number>();

    const trimmedText = text.trim();
    if (trimmedText) {
        try {
            const parsed = parse(trimmedText);
            const entries = extractEntries(parsed);
            for (const entry of entries) {
                if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
                    continue;
                }
                const record = entry as KeymapEntryRecord;
                const scriptPath =
                    readStringField(record, ["scriptPath", "script"]) ?? "";
                const scriptName = normalizeScriptName(scriptPath);
                if (!scriptName) {
                    continue;
                }
                seen.set(scriptName, (seen.get(scriptName) ?? 0) + 1);
            }
        } catch {
            // Fall back to regex extraction below.
        }
    }

    if (seen.size === 0) {
        for (const match of text.matchAll(KEYMAP_DAS_PATTERN)) {
            const scriptName = normalizeName(match[1] ?? "");
            if (!scriptName) {
                continue;
            }
            seen.set(scriptName, (seen.get(scriptName) ?? 0) + 1);
        }

        for (const match of text.matchAll(KEYMAP_SCRIPT_PATTERN)) {
            const scriptPath = (match[1] ?? "").trim();
            const scriptName = normalizeScriptName(scriptPath);
            if (!scriptName) {
                continue;
            }
            seen.set(scriptName, (seen.get(scriptName) ?? 0) + 1);
        }
    }

    const refs = new Set<string>();
    const duplicates = new Set<string>();

    for (const [scriptName, count] of seen.entries()) {
        refs.add(scriptName);
        if (count > 1) {
            duplicates.add(scriptName);
        }
    }

    return { refs, duplicates };
}

export interface WorkspaceLintInputs {
    scripts: { filePath: string; content: string }[];
    keymapText?: string;
    keymapPath?: string;
}

export function buildScriptFile(
    filePath: string,
    content: string
): ScriptFile {
    const scriptName = path.basename(filePath, path.extname(filePath));
    const scan = buildScanContext(content);
    const execHotkeyRefs = extractExecHotkeyRefs(scan.text);
    return {
        filePath,
        scriptName,
        text: scan.text,
        code: scan.code,
        lineStarts: scan.lineStarts,
        execHotkeyRefs,
    };
}

function buildWorkspaceContext(
    inputs: WorkspaceLintInputs,
    config: LintConfig
): LintWorkspaceContext {
    const scripts = inputs.scripts.map((script) =>
        buildScriptFile(script.filePath, script.content)
    );

    const keymapText = inputs.keymapText ?? "";
    const keymapPresent = Boolean(inputs.keymapText);
    const { refs: keymapRefs, duplicates: keymapDuplicates } =
        parseKeymapReferences(keymapText);

    const execTargets = new Set<string>();
    for (const script of scripts) {
        for (const ref of script.execHotkeyRefs) {
            execTargets.add(normalizeName(ref.target));
        }
    }

    const scriptIndex = new Map<string, ScriptIndexEntry>();
    for (const script of scripts) {
        const key = normalizeName(script.scriptName);
        scriptIndex.set(key, {
            scriptName: script.scriptName,
            filePath: script.filePath,
            referencedByKeymap: keymapRefs.has(key),
            referencedByExecHotkey: execTargets.has(key),
        });
    }

    return {
        scripts,
        scriptIndex,
        keymapRefs,
        keymapDuplicates,
        keymapPresent,
        keymapText: inputs.keymapText,
        keymapPath: inputs.keymapPath,
        config,
    };
}

export function lintWorkspace(
    inputs: WorkspaceLintInputs,
    config: LintConfig
): LintFinding[] {
    if (!config.enabled) {
        return [];
    }

    const cappedInputs: WorkspaceLintInputs = {
        ...inputs,
        scripts: inputs.scripts.slice(0, config.maxFiles),
    };
    const context = buildWorkspaceContext(cappedInputs, config);
    const rules = getLintRules();
    const findings: LintFinding[] = [];

    for (const rule of rules) {
        const override = config.ruleOverrides[rule.id];
        if (override === "off") {
            continue;
        }

        if (rule.scope === "workspace") {
            const ruleFindings = rule.run({ workspace: context });
            for (const finding of ruleFindings) {
                findings.push({
                    ...finding,
                    ruleId: rule.id,
                    severity: override ?? finding.severity ?? rule.defaultSeverity,
                    message: finding.message || rule.message,
                    fixSuggestion: finding.fixSuggestion ?? rule.fixSuggestion,
                });
            }
            continue;
        }

        for (const script of context.scripts) {
            const ruleFindings = rule.run({
                workspace: context,
                file: script,
            });
            for (const finding of ruleFindings) {
                findings.push({
                    ...finding,
                    ruleId: rule.id,
                    severity: override ?? finding.severity ?? rule.defaultSeverity,
                    message: finding.message || rule.message,
                    fixSuggestion: finding.fixSuggestion ?? rule.fixSuggestion,
                });
            }
        }
    }

    return findings;
}

export function findExecHotkeyTargets(text: string): string[] {
    return extractExecHotkeyRefs(text).map((ref) => ref.target);
}
