import { CompileResult, CompileWarning } from "./types";
import { discoverWorkspaceInputs } from "./discovery";
import { parseKeymapFile } from "./keymap";
import { loadScriptFiles } from "./loader";
import { buildHotkeyModels } from "./model";
import { aggregateHotkeys } from "./aggregate";
import { renderHotkeys } from "./renderer";
import { writeHotkeyFile } from "./writer";
import {
    PlaceholderValues,
    substitutePlaceholders,
} from "./placeholders";
import { PlaceholderWarningTracker } from "./warnings";

export interface CompileOptions {
    workspaceRoot: string;
    outputPath: string;
    placeholderValues?: PlaceholderValues;
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
    const placeholderTracker = new PlaceholderWarningTracker();
    const substitutedScripts = applyPlaceholderSubstitution(
        scriptContents,
        options.placeholderValues ?? {},
        placeholderTracker
    );
    const warnings = collectWarnings(
        discovery.warnings,
        keymapEntries,
        discovery.scriptPaths,
        placeholderTracker.buildWarnings()
    );
    const hotkeys = buildHotkeyModels(keymapEntries, substitutedScripts);
    const ordered = aggregateHotkeys(hotkeys);
    const rendered = renderHotkeys(ordered);
    await writeHotkeyFile(options.outputPath, rendered);

    return {
        hotkeys: ordered,
        warnings,
        errors: [],
        outputPath: options.outputPath,
        placeholderWarnings: placeholderTracker.buildPlaceholderWarnings(),
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
