import { promises as fs } from "fs";

const IGNORE_TAG_PATTERN = /^\s*\/\/\s*Ignore\s*:\s*True\s*$/im;

export async function detectIgnoredScripts(
    scriptPaths: string[],
    scriptContents?: Map<string, string>
): Promise<Set<string>> {
    const ignored = new Set<string>();
    for (const scriptPath of scriptPaths) {
        const cached = scriptContents?.get(scriptPath);
        if (cached !== undefined) {
            if (IGNORE_TAG_PATTERN.test(cached)) {
                ignored.add(scriptPath);
            }
            continue;
        }

        try {
            const contents = await fs.readFile(scriptPath, "utf8");
            if (IGNORE_TAG_PATTERN.test(contents)) {
                ignored.add(scriptPath);
            }
        } catch {
            continue;
        }
    }

    return ignored;
}
