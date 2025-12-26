import path from "path";
import { ImportNamingError } from "./errors";
import { DecodedHotkeyRecord, NamedHotkeyRecord } from "./types";

function sanitizeName(value: string): string {
    return value
        .trim()
        .replace(/[^A-Za-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_")
        .toLowerCase();
}

function ensureUnique(base: string, counts: Map<string, number>): string {
    const current = counts.get(base) ?? 0;
    const next = current + 1;
    counts.set(base, next);
    if (next === 1) {
        return base;
    }
    return `${base}_${next}`;
}

function deriveIdBase(label: string, key: string): string {
    const fromLabel = sanitizeName(label);
    if (fromLabel) {
        return fromLabel;
    }
    const fromKey = sanitizeName(key);
    if (fromKey) {
        return fromKey;
    }
    return "";
}

function deriveFileBase(
    id: string,
    label: string,
    key: string
): string {
    const idBase = sanitizeName(id);
    if (idBase) {
        return idBase;
    }
    const keyBase = sanitizeName(key);
    if (keyBase) {
        return keyBase;
    }
    const labelBase = sanitizeName(label);
    if (labelBase && keyBase) {
        return `${labelBase}_${keyBase}`;
    }
    return labelBase || keyBase || "";
}

/**
 * Generate deterministic ids and file names for decoded hotkey records.
 */
export function assignNames(
    records: DecodedHotkeyRecord[]
): NamedHotkeyRecord[] {
    const idCounts = new Map<string, number>();
    const fileCounts = new Map<string, number>();

    return records.map((record) => {
        const idBase = deriveIdBase(record.label, record.key);
        if (!idBase) {
            throw new ImportNamingError(
                "Unable to generate a hotkey id for this record.",
                "Label and key could not be sanitized into a valid id.",
                {
                    recordIndex: record.index,
                    line: record.line,
                    key: record.key,
                    label: record.label,
                }
            );
        }

        const id = ensureUnique(idBase, idCounts);
        const fileBase = deriveFileBase(id, record.label, record.key);
        if (!fileBase) {
            throw new ImportNamingError(
                "Unable to generate a filename for this record.",
                "Label and key could not be sanitized into a valid filename.",
                {
                    recordIndex: record.index,
                    line: record.line,
                    key: record.key,
                    label: record.label,
                }
            );
        }

        const uniqueFileBase = ensureUnique(fileBase, fileCounts);
        const fileName = `${uniqueFileBase}.das`;
        const scriptPath = path.posix.join("hotkeys", fileName);

        return {
            ...record,
            id,
            fileName,
            scriptPath,
        };
    });
}
