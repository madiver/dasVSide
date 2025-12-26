import * as path from "path";
import { buildScanContext } from "./tokenizer";
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

const EXEC_HOTKEY_PATTERN =
    /ExecHotkey\s*\(\s*(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*\)/gi;
const KEYMAP_DAS_PATTERN = /([A-Za-z0-9_-]+)\.das/gi;
const KEYMAP_SCRIPT_PATTERN = /script\s*:\s*([A-Za-z0-9_-]+)/gi;

function normalizeName(name: string): string {
    return name.trim().toLowerCase();
}

function extractExecHotkeyRefs(code: string): ExecHotkeyRef[] {
    const refs: ExecHotkeyRef[] = [];
    for (const match of code.matchAll(EXEC_HOTKEY_PATTERN)) {
        if (typeof match.index !== "number") {
            continue;
        }
        const target = (match[1] ?? match[2] ?? "").trim();
        if (!target) {
            continue;
        }
        const matchText = match[0];
        const targetIndex = matchText.indexOf(target);
        const offset =
            match.index + (targetIndex >= 0 ? targetIndex : 0);
        refs.push({
            target,
            offset,
            length: target.length,
        });
    }
    return refs;
}

function parseKeymapReferences(text: string): {
    refs: Set<string>;
    duplicates: Set<string>;
} {
    const seen = new Map<string, number>();

    for (const match of text.matchAll(KEYMAP_DAS_PATTERN)) {
        const scriptName = normalizeName(match[1] ?? "");
        if (!scriptName) {
            continue;
        }
        seen.set(scriptName, (seen.get(scriptName) ?? 0) + 1);
    }

    for (const match of text.matchAll(KEYMAP_SCRIPT_PATTERN)) {
        const scriptName = normalizeName(match[1] ?? "");
        if (!scriptName) {
            continue;
        }
        seen.set(scriptName, (seen.get(scriptName) ?? 0) + 1);
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
    const execHotkeyRefs = extractExecHotkeyRefs(scan.code);
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

export function findExecHotkeyTargets(code: string): string[] {
    const targets: string[] = [];
    for (const match of code.matchAll(EXEC_HOTKEY_PATTERN)) {
        const target = (match[1] ?? match[2] ?? "").trim();
        if (target) {
            targets.push(target);
        }
    }
    return targets;
}
