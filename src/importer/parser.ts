import { ImportParseError } from "./errors";
import { ParsedHotkeyRecord } from "./types";
import { KEY_COMBO_PATTERN, KEY_COMBO_REQUIRED_PATTERN } from "../compiler/formatRules";

const HEADER_PATTERN =
    /^(?<key>[^:\r\n]*):(?<label>[^:\r\n]+):~\s+(?<length>\d+):(.*)$/;
const INLINE_HEADER_PATTERN =
    /^(?<key>[^:\r\n]*):(?<label>[^:\r\n]+):(.*)$/;
const HEADER_PATTERN_LOOSE =
    /^(?<key>[^:\r\n]*):(?<label>[^:\r\n]*):~\s+(?<length>\d+):(.*)$/;

function isValidKeyCombo(value: string): boolean {
    if (!value) {
        return false;
    }
    if (!KEY_COMBO_PATTERN.test(value)) {
        return false;
    }
    return KEY_COMBO_REQUIRED_PATTERN.test(value);
}

/**
 * Parse Hotkey.htk content into record headers and encoded bodies.
 */
export function parseHotkeyRecords(
    content: string,
    sourcePath: string
): ParsedHotkeyRecord[] {
    const lines = content.split(/\r\n|\n|\r/);
    const records: ParsedHotkeyRecord[] = [];
    const seenKeys = new Map<string, number>();
    let current: ParsedHotkeyRecord | null = null;

    for (let i = 0; i < lines.length; i += 1) {
        const lineNumber = i + 1;
        const line = lines[i] ?? "";
        const match = HEADER_PATTERN.exec(line);

        if (match) {
            const key = match.groups?.key ?? match[1] ?? "";
            const label = match.groups?.label ?? match[2] ?? "";
            const lengthRaw = match.groups?.length ?? match[3] ?? "";
            const encoded = match[4] ?? "";
            const recordIndex = records.length + 1;

            if (!label.trim()) {
                throw new ImportParseError(
                    "Hotkey record is missing required header fields.",
                    `Line ${lineNumber} must include key and label.`,
                    {
                        recordIndex,
                        line: lineNumber,
                        sourcePath,
                    }
                );
            }

            const scriptLength = Number.parseInt(lengthRaw, 10);
            if (!Number.isFinite(scriptLength) || scriptLength < 0) {
                throw new ImportParseError(
                    "Hotkey record has an invalid script length token.",
                    `Line ${lineNumber} length token: ${lengthRaw}.`,
                    {
                        recordIndex,
                        line: lineNumber,
                        key: key.trim(),
                        label,
                        sourcePath,
                    }
                );
            }

            const normalizedKey = key.trim();
            if (normalizedKey) {
                if (seenKeys.has(normalizedKey)) {
                    throw new ImportParseError(
                        "Duplicate key combination detected in Hotkey.htk.",
                        `Key ${normalizedKey} appears more than once.`,
                        {
                            recordIndex,
                            line: lineNumber,
                            key: normalizedKey,
                            label,
                            sourcePath,
                        }
                    );
                }
                seenKeys.set(normalizedKey, recordIndex);
            }

            if (current) {
                records.push(current);
            }

            current = {
                index: recordIndex,
                line: lineNumber,
                key: normalizedKey,
                label,
                scriptLength,
                encodedBody: encoded,
                sourcePath,
            };
            continue;
        }

        const inlineMatch = INLINE_HEADER_PATTERN.exec(line);
        if (inlineMatch) {
            const key = inlineMatch.groups?.key ?? inlineMatch[1] ?? "";
            const label = inlineMatch.groups?.label ?? inlineMatch[2] ?? "";
            const encoded = inlineMatch[3] ?? "";
            const recordIndex = records.length + 1;
            const normalizedKey = key.trim();

            if (!label.trim()) {
                throw new ImportParseError(
                    "Hotkey record is missing required header fields.",
                    `Line ${lineNumber} must include key and label.`,
                    {
                        recordIndex,
                        line: lineNumber,
                        sourcePath,
                    }
                );
            }

            if (normalizedKey && !isValidKeyCombo(normalizedKey)) {
                // Inline header match is actually script content.
            } else {
                if (normalizedKey) {
                    if (seenKeys.has(normalizedKey)) {
                        throw new ImportParseError(
                            "Duplicate key combination detected in Hotkey.htk.",
                            `Key ${normalizedKey} appears more than once.`,
                            {
                                recordIndex,
                                line: lineNumber,
                                key: normalizedKey,
                                label,
                                sourcePath,
                            }
                        );
                    }
                    seenKeys.set(normalizedKey, recordIndex);
                }

                if (current) {
                    records.push(current);
                }

                current = {
                    index: recordIndex,
                    line: lineNumber,
                    key: normalizedKey,
                    label,
                    scriptLength: 0,
                    encodedBody: encoded,
                    sourcePath,
                };
                continue;
            }
        }

        const looseMatch = HEADER_PATTERN_LOOSE.exec(line);
        if (looseMatch) {
            throw new ImportParseError(
                "Hotkey record is missing required header fields.",
                `Line ${lineNumber} must include key and label.`,
                { line: lineNumber, sourcePath }
            );
        }

        if (!current) {
            if (!line.trim()) {
                continue;
            }
            throw new ImportParseError(
                "Hotkey.htk contains data before the first record header.",
                `Line ${lineNumber} does not match a hotkey header.`,
                { line: lineNumber, sourcePath }
            );
        }

        current.encodedBody += line;
    }

    if (current) {
        records.push(current);
    }

    if (records.length === 0) {
        throw new ImportParseError(
            "Hotkey.htk contains no hotkey records.",
            sourcePath,
            { sourcePath }
        );
    }

    return records;
}
