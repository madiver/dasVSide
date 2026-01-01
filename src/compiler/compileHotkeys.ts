import {
    CompileResult,
    CompileWarning,
    PlaceholderWarning,
} from "./types";
import { discoverWorkspaceInputs } from "./discovery";
import { parseKeymapFile } from "./keymap";
import { loadScriptFiles } from "./loader";
import { buildHotkeyModels } from "./model";
import { aggregateHotkeys } from "./aggregate";
import { renderHotkeys } from "./renderer";
import { writeHotkeyFile } from "./writer";
import { KeymapError, ValidationError } from "./errors";
import {
    PLACEHOLDER_LABELS,
    PLACEHOLDER_TOKENS,
    PlaceholderValues,
    substitutePlaceholders,
} from "./placeholders";
import { PlaceholderWarningTracker } from "./warnings";
import { detectIgnoredScripts } from "./ignore";

export interface CompileOptions {
    workspaceRoot: string;
    outputPath: string;
    placeholderValues?: PlaceholderValues;
    failOnMissingPlaceholders?: boolean;
}

export async function compileHotkeys(
    options: CompileOptions
): Promise<CompileResult> {
    const discovery = await discoverWorkspaceInputs(options.workspaceRoot);
    const keymapEntries = await parseKeymapFile(discovery.keymapPath, {
        workspaceRoot: options.workspaceRoot,
        scriptPaths: discovery.scriptPaths,
    });
    const scriptContents = await loadScriptFiles(
        keymapEntries.map((entry) => entry.scriptPath)
    );
    const ignoredScripts = await detectIgnoredScripts(
        discovery.scriptPaths,
        scriptContents
    );
    const filteredEntries = keymapEntries.filter(
        (entry) => !ignoredScripts.has(entry.scriptPath)
    );
    if (filteredEntries.length === 0) {
        throw new KeymapError(
            "All keymap entries are ignored.",
            "No buildable scripts remain after applying // Ignore: True tags."
        );
    }
    assertNoDuplicates(filteredEntries);
    const filteredContents = selectScriptContents(
        scriptContents,
        filteredEntries
    );
    const placeholderTracker = new PlaceholderWarningTracker();
    const substitutedScripts = applyPlaceholderSubstitution(
        filteredContents,
        options.placeholderValues ?? {},
        placeholderTracker
    );
    const placeholderWarnings = placeholderTracker.buildPlaceholderWarnings();
    assertPlaceholdersSatisfied(
        placeholderWarnings,
        options.failOnMissingPlaceholders
    );
    const warnings = collectWarnings(
        discovery.warnings,
        filteredEntries,
        discovery.scriptPaths.filter(
            (scriptPath) => !ignoredScripts.has(scriptPath)
        ),
        placeholderTracker.buildWarnings()
    );
    const hotkeys = buildHotkeyModels(filteredEntries, substitutedScripts);
    const ordered = aggregateHotkeys(hotkeys);
    const rendered = renderHotkeys(ordered);
    await writeHotkeyFile(options.outputPath, rendered);

    return {
        hotkeys: ordered,
        warnings,
        errors: [],
        outputPath: options.outputPath,
        placeholderWarnings,
    };
}

function collectWarnings(
    baseWarnings: CompileWarning[],
    entries: { scriptPath: string }[],
    scriptPaths: string[],
    extraWarnings: CompileWarning[] = []
): CompileWarning[] {
    const warnings: CompileWarning[] = normalizeWarnings([
        ...baseWarnings,
        ...extraWarnings,
    ]);
    const referenced = new Set(
        entries.map((entry) => entry.scriptPath)
    );

    for (const scriptPath of scriptPaths) {
        if (!referenced.has(scriptPath)) {
            warnings.push({
                code: "UNREFERENCED_SCRIPT",
                message: `Script ${scriptPath} is not referenced by keymap.yaml.`,
                sourcePath: scriptPath,
            });
        }
    }

    return warnings;
}

function assertNoDuplicates(
    entries: { id: string; key: string }[]
): void {
    const duplicateIds = findDuplicates(entries.map((entry) => entry.id));
    if (duplicateIds.length > 0) {
        throw new KeymapError(
            "Duplicate hotkey ids detected in keymap.yaml.",
            `Duplicate ids: ${duplicateIds.join(", ")}.`
        );
    }

    const duplicateKeys = findDuplicates(entries.map((entry) => entry.key), {
        ignoreEmpty: true,
    });
    if (duplicateKeys.length > 0) {
        throw new KeymapError(
            "Duplicate key combinations detected in keymap.yaml.",
            `Duplicate keys: ${duplicateKeys.join(", ")}.`
        );
    }
}

function findDuplicates(
    values: string[],
    options: { ignoreEmpty?: boolean } = {}
): string[] {
    const counts = new Map<string, number>();
    for (const value of values) {
        const normalized = value.trim();
        if (options.ignoreEmpty && !normalized) {
            continue;
        }
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([value]) => value);
}

function selectScriptContents(
    scripts: Map<string, string>,
    entries: { scriptPath: string }[]
): Map<string, string> {
    const selected = new Map<string, string>();
    for (const entry of entries) {
        const scriptText = scripts.get(entry.scriptPath);
        if (scriptText !== undefined) {
            selected.set(entry.scriptPath, scriptText);
        }
    }
    return selected;
}

function normalizeWarnings(warnings: CompileWarning[]): CompileWarning[] {      
    return warnings.map((warning) => ({
        code: warning.code,
        message: warning.message,
        sourcePath: warning.sourcePath,
        id: warning.id,
        key: warning.key,
    }));
}

function applyPlaceholderSubstitution(
    scripts: Map<string, string>,
    values: PlaceholderValues,
    tracker: PlaceholderWarningTracker
): Map<string, string> {
    // Use a fresh map to avoid mutating the loaded script contents.
    const substituted = new Map<string, string>();
    for (const [sourcePath, scriptText] of scripts.entries()) {
        const result = substitutePlaceholders({
            scriptText,
            values,
            sourcePath,
        });
        substituted.set(sourcePath, result.text);
        for (const missing of result.missing) {
            tracker.addMissing(missing, sourcePath);
        }
    }
    return substituted;
}

function assertPlaceholdersSatisfied(
    placeholderWarnings: PlaceholderWarning[],
    failOnMissing: boolean | undefined
): void {
    if (!failOnMissing || placeholderWarnings.length === 0) {
        return;
    }
    const missing = placeholderWarnings
        .map(
            (warning) =>
                `${PLACEHOLDER_LABELS[warning.placeholder]} ` +
                `(${PLACEHOLDER_TOKENS[warning.placeholder]})`
        )
        .join(", ");
    const affectedScripts = Array.from(
        new Set(
            placeholderWarnings.flatMap(
                (warning) => warning.affectedScripts
            )
        )
    ).sort();
    const detailsParts = [`Missing settings for: ${missing}.`];
    if (affectedScripts.length > 0) {
        detailsParts.push(
            `Affected scripts: ${affectedScripts.join(", ")}.`
        );
    }
    throw new ValidationError(
        "Account placeholder settings are required for this build.",
        detailsParts.join(" ")
    );
}
