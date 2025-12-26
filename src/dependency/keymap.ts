import { promises as fs } from "fs";
import path from "path";
import { parse } from "yaml";
import { buildScriptIndex, resolveScriptPath } from "./resolve";
import { KeymapEntry } from "./types";

export interface KeymapLoadResult {
    entries: KeymapEntry[];
    warnings: string[];
    keymapPath?: string;
}

type KeymapRecord = Record<string, unknown>;

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
    entry: KeymapRecord,
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

export function parseKeymapText(
    text: string,
    workspaceRoot: string,
    scriptPaths: string[]
): { entries: KeymapEntry[]; warnings: string[] } {
    const warnings: string[] = [];

    if (!text.trim()) {
        warnings.push("keymap.yaml is empty.");
        return { entries: [], warnings };
    }

    let parsed: unknown;
    try {
        parsed = parse(text);
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        warnings.push(`Unable to parse keymap.yaml: ${details}`);
        return { entries: [], warnings };
    }

    const rawEntries = extractEntries(parsed);
    if (rawEntries.length === 0) {
        warnings.push("keymap.yaml contains no entries.");
        return { entries: [], warnings };
    }

    const index = buildScriptIndex(scriptPaths, workspaceRoot);
    const entries: KeymapEntry[] = [];

    rawEntries.forEach((raw, indexPosition) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
            warnings.push(`Entry ${indexPosition + 1} is not a mapping object.`);
            return;
        }
        const record = raw as KeymapRecord;
        const id = readStringField(record, ["id"]);
        const key = readStringField(record, ["key", "keyCombo"]) ?? "";
        const label = readStringField(record, ["label", "name"]);
        const script = readStringField(record, ["scriptPath", "script"]);

        if (!id || !label || !script) {
            warnings.push(
                `Entry ${indexPosition + 1} is missing required fields.`
            );
            return;
        }

        const resolved = resolveScriptPath(script, index, workspaceRoot);
        if (!resolved.result) {
            warnings.push(
                `Entry ${id} references ${script}. ${resolved.warning ?? ""}`.trim()
            );
            return;
        }

        entries.push({
            id,
            key,
            label,
            scriptPath: resolved.result.fullPath,
            scriptRelativePath: resolved.result.relativePath,
        });
    });

    return { entries, warnings };
}

export async function loadKeymap(
    workspaceRoot: string,
    scriptPaths: string[]
): Promise<KeymapLoadResult> {
    const keymapPath = path.join(workspaceRoot, "keymap.yaml");

    let text = "";
    try {
        text = await fs.readFile(keymapPath, "utf8");
    } catch (error) {
        return {
            entries: [],
            warnings: ["keymap.yaml not found at the workspace root."],
            keymapPath,
        };
    }

    const parsed = parseKeymapText(text, workspaceRoot, scriptPaths);
    return { ...parsed, keymapPath };
}
