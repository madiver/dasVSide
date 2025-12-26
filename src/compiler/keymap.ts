import { promises as fs } from "fs";
import path from "path";
import { parse } from "yaml";
import { KeymapError } from "./errors";
import { KeymapEntry } from "./types";

export interface KeymapParseOptions {
    workspaceRoot: string;
    scriptPaths: string[];
}

type KeymapEntryRecord = Record<string, unknown>;

function normalizePath(input: string): string {
    return input.replace(/\\/g, "/").toLowerCase();
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

    throw new KeymapError(
        "keymap.yaml must contain a list of entries.",
        "Expected a YAML array or an object with an entries array."
    );
}

function readStringField(
    entry: KeymapEntryRecord,
    keys: string[],
    label: string,
    index: number,
    context?: { id?: string; key?: string },
    options: { allowEmpty?: boolean } = {}
): string {
    for (const key of keys) {
        const value = entry[key];
        if (value === null && options.allowEmpty) {
            return "";
        }
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed || options.allowEmpty) {
                return trimmed;
            }
        }
    }

    throw new KeymapError(
        `Keymap entry is missing required ${label}.`,
        `Entry ${index + 1} is missing ${keys.join(" or ")}.`,
        { id: context?.id, key: context?.key }
    );
}

function resolveScriptPath(
    scriptPath: string,
    options: KeymapParseOptions,
    context?: { id?: string; key?: string }
): string {
    const normalizedTarget = normalizePath(scriptPath);
    const targetWithoutExt = normalizedTarget.replace(/\.das$/i, "");

    const candidates = options.scriptPaths.map((fullPath) => {
        const rel = path.relative(options.workspaceRoot, fullPath);
        return {
            fullPath,
            fullNormalized: normalizePath(fullPath),
            relNormalized: normalizePath(rel),
            baseNormalized: normalizePath(path.basename(fullPath)),
            baseWithoutExt: normalizePath(
                path.basename(fullPath, path.extname(fullPath))
            ),
        };
    });

    const matches: string[] = [];

    if (path.isAbsolute(scriptPath)) {
        for (const candidate of candidates) {
            if (candidate.fullNormalized === normalizedTarget) {
                matches.push(candidate.fullPath);
            }
        }
    } else {
        for (const candidate of candidates) {
            if (candidate.relNormalized === normalizedTarget) {
                matches.push(candidate.fullPath);
            } else if (candidate.relNormalized === targetWithoutExt) {
                matches.push(candidate.fullPath);
            }
        }
    }

    if (matches.length === 0) {
        for (const candidate of candidates) {
            if (
                candidate.baseNormalized === normalizedTarget ||
                candidate.baseWithoutExt === normalizedTarget ||
                candidate.baseWithoutExt === targetWithoutExt
            ) {
                matches.push(candidate.fullPath);
            }
        }
    }

    const uniqueMatches = Array.from(new Set(matches));
    if (uniqueMatches.length === 1) {
        return uniqueMatches[0];
    }

    if (uniqueMatches.length === 0) {
        throw new KeymapError(
            "Keymap entry references a missing script.",
            `No .das file matches ${scriptPath}.`,
            { id: context?.id, key: context?.key, sourcePath: scriptPath }
        );
    }

    throw new KeymapError(
        "Keymap entry references multiple scripts.",
        `Ambiguous matches for ${scriptPath}: ${uniqueMatches.join(", ")}.`,
        { id: context?.id, key: context?.key, sourcePath: scriptPath }
    );
}

function assertEntryRecord(value: unknown, index: number): KeymapEntryRecord {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as KeymapEntryRecord;
    }

    throw new KeymapError(
        "Keymap entry must be an object.",
        `Entry ${index + 1} is not a mapping object.`
    );
}

export async function parseKeymapFile(
    keymapPath: string,
    options: KeymapParseOptions
): Promise<KeymapEntry[]> {
    let text = "";
    try {
        text = await fs.readFile(keymapPath, "utf8");
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        throw new KeymapError(
            "Unable to read keymap.yaml.",
            `${keymapPath}: ${details}`,
            { sourcePath: keymapPath }
        );
    }

    if (!text.trim()) {
        throw new KeymapError(
            "keymap.yaml is empty. Add at least one entry before compiling.",
            keymapPath,
            { sourcePath: keymapPath }
        );
    }

    let parsed: unknown;
    try {
        parsed = parse(text);
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        throw new KeymapError(
            "keymap.yaml could not be parsed.",
            details,
            { sourcePath: keymapPath }
        );
    }

    const rawEntries = extractEntries(parsed);
    if (rawEntries.length === 0) {
        throw new KeymapError(
            "keymap.yaml contains no entries.",
            keymapPath,
            { sourcePath: keymapPath }
        );
    }

    const entries: KeymapEntry[] = rawEntries.map((raw, index) => {
        const record = assertEntryRecord(raw, index);
        const id = readStringField(record, ["id"], "id", index);
        const key = readStringField(
            record,
            ["key", "keyCombo"],
            "key",
            index,
            { id },
            { allowEmpty: true }
        );
        const context = { id, key };
        const label = readStringField(
            record,
            ["label", "name"],
            "label",
            index,
            context
        );
        const scriptPath = readStringField(
            record,
            ["scriptPath", "script"],
            "scriptPath",
            index,
            context
        );
        const resolvedPath = resolveScriptPath(scriptPath, options, context);

        return {
            id,
            key,
            label,
            scriptPath: resolvedPath,
        };
    });

    return entries;
}
