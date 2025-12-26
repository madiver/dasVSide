import { ImportDecodeError } from "./errors";
import { DecodedHotkeyRecord, ParsedHotkeyRecord } from "./types";

const HEX_PAIR = /^[0-9A-Fa-f]{2}$/;

export interface DecodeOptions {
    strictLength?: boolean;
    onLengthMismatch?: (info: {
        recordIndex: number;
        line: number;
        key: string;
        label: string;
        headerLength: number;
        decodedLength: number;
        sourcePath: string;
    }) => void;
}

function decodeToBytes(encoded: string, record: ParsedHotkeyRecord): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < encoded.length; i += 1) {
        const char = encoded[i];
        if (char === "~") {
            const token = encoded.slice(i + 1, i + 3);
            if (!HEX_PAIR.test(token)) {
                throw new ImportDecodeError(
                    "Hotkey record contains an invalid encoding token.",
                    `Token "~${token}" is not a valid hex sequence.`,
                    {
                        recordIndex: record.index,
                        line: record.line,
                        key: record.key,
                        label: record.label,
                        sourcePath: record.sourcePath,
                    }
                );
            }
            bytes.push(Number.parseInt(token, 16));
            i += 2;
        } else {
            bytes.push(char.charCodeAt(0));
        }
    }
    return bytes;
}

function assertCrlfSequences(
    bytes: number[],
    record: ParsedHotkeyRecord
): void {
    for (let i = 0; i < bytes.length; i += 1) {
        if (bytes[i] === 0x0d) {
            if (bytes[i + 1] !== 0x0a) {
                throw new ImportDecodeError(
                    "Hotkey record contains an invalid line ending.",
                    "Expected CRLF (0D0A) newline encoding.",
                    {
                        recordIndex: record.index,
                        line: record.line,
                        key: record.key,
                        label: record.label,
                        sourcePath: record.sourcePath,
                    }
                );
            }
            i += 1;
        } else if (bytes[i] === 0x0a) {
            throw new ImportDecodeError(
                "Hotkey record contains an invalid line ending.",
                "Unexpected LF (0A) without a preceding CR (0D).",
                {
                    recordIndex: record.index,
                    line: record.line,
                    key: record.key,
                    label: record.label,
                    sourcePath: record.sourcePath,
                }
            );
        }
    }
}

function normalizeLineEndings(text: string): string {
    return text.replace(/\r\n|\r|\n/g, "\r\n");
}

/**
 * Decode an encoded script body into a CRLF-normalized script text.
 */
export function decodeHotkeyRecord(
    record: ParsedHotkeyRecord,
    options: DecodeOptions = {}
): DecodedHotkeyRecord {
    const strictLength = options.strictLength !== false;

    if (!record.encodedBody) {
        throw new ImportDecodeError(
            "Hotkey record has an empty script body.",
            "Encoded script content is missing.",
            {
                recordIndex: record.index,
                line: record.line,
                key: record.key,
                label: record.label,
                sourcePath: record.sourcePath,
            }
        );
    }

    const bytes = decodeToBytes(record.encodedBody, record);

    if (record.scriptLength > 0 && bytes.length !== record.scriptLength) {
        if (!strictLength) {
            options.onLengthMismatch?.({
                recordIndex: record.index,
                line: record.line,
                key: record.key,
                label: record.label,
                headerLength: record.scriptLength,
                decodedLength: bytes.length,
                sourcePath: record.sourcePath,
            });
        } else {
            throw new ImportDecodeError(
                "Hotkey record script length does not match the header token.",
                `Expected ${record.scriptLength} bytes, got ${bytes.length}.`,
                {
                    recordIndex: record.index,
                    line: record.line,
                    key: record.key,
                    label: record.label,
                    sourcePath: record.sourcePath,
                }
            );
        }
    }

    if (bytes.length === 0) {
        throw new ImportDecodeError(
            "Hotkey record has an empty script body.",
            "Decoded script content is empty.",
            {
                recordIndex: record.index,
                line: record.line,
                key: record.key,
                label: record.label,
                sourcePath: record.sourcePath,
            }
        );
    }

    assertCrlfSequences(bytes, record);

    const text = Buffer.from(bytes).toString("utf8");
    const normalized = normalizeLineEndings(text);

    return {
        index: record.index,
        line: record.line,
        key: record.key,
        label: record.label,
        scriptLength: bytes.length,
        scriptText: normalized,
    };
}
