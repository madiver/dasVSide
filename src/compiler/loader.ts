import { promises as fs } from "fs";
import { ScriptError } from "./errors";

export interface ScriptLoadOptions {
    maxFiles?: number;
}

function normalizeLineEndings(contents: string): string {
    return contents.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export async function loadScriptFiles(
    scriptPaths: string[],
    options: ScriptLoadOptions = {}
): Promise<Map<string, string>> {
    const uniquePaths = Array.from(new Set(scriptPaths));
    if (options.maxFiles && uniquePaths.length > options.maxFiles) {
        throw new ScriptError(
            "Too many script files provided for compilation.",
            `Found ${uniquePaths.length} files, limit is ${options.maxFiles}.`
        );
    }

    const results = new Map<string, string>();
    for (const scriptPath of uniquePaths) {
        try {
            const contents = await fs.readFile(scriptPath, "utf8");
            results.set(scriptPath, normalizeLineEndings(contents));
        } catch (error) {
            const details = error instanceof Error ? error.message : String(error);
            throw new ScriptError(
                "Unable to read script file.",
                `${scriptPath}: ${details}`,
                { sourcePath: scriptPath }
            );
        }
    }

    return results;
}
