import { CompileResult, CompileWarning } from "./types";
import { discoverWorkspaceInputs } from "./discovery";
import { parseKeymapFile } from "./keymap";
import { loadScriptFiles } from "./loader";
import { buildHotkeyModels } from "./model";
import { aggregateHotkeys } from "./aggregate";
import { renderHotkeys } from "./renderer";
import { writeHotkeyFile } from "./writer";

export interface CompileOptions {
    workspaceRoot: string;
    outputPath: string;
}

export async function compileHotkeys(
    options: CompileOptions
): Promise<CompileResult> {
    const discovery = await discoverWorkspaceInputs(options.workspaceRoot);
    const keymapEntries = await parseKeymapFile(discovery.keymapPath, {
        workspaceRoot: options.workspaceRoot,
        scriptPaths: discovery.scriptPaths,
    });
    const warnings = collectWarnings(
        discovery.warnings,
        keymapEntries,
        discovery.scriptPaths
    );
    const scriptContents = await loadScriptFiles(
        keymapEntries.map((entry) => entry.scriptPath)
    );
    const hotkeys = buildHotkeyModels(keymapEntries, scriptContents);
    const ordered = aggregateHotkeys(hotkeys);
    const rendered = renderHotkeys(ordered);
    await writeHotkeyFile(options.outputPath, rendered);

    return {
        hotkeys: ordered,
        warnings,
        errors: [],
        outputPath: options.outputPath,
    };
}

function collectWarnings(
    baseWarnings: CompileWarning[],
    entries: { scriptPath: string }[],
    scriptPaths: string[]
): CompileWarning[] {
    const warnings: CompileWarning[] = normalizeWarnings(baseWarnings);
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
