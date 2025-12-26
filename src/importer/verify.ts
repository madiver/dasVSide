import { promises as fs } from "fs";
import path from "path";
import { compileHotkeys } from "../compiler/compileHotkeys";
import { ImportVerifyError } from "./errors";

export interface RoundTripResult {
    matched: boolean;
    mismatchSummary?: string;
}

function getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;
        return typeof code === "string" ? code : undefined;
    }
    return undefined;
}

function findFirstDifference(
    original: Buffer,
    rebuilt: Buffer
): number | null {
    const length = Math.min(original.length, rebuilt.length);
    for (let i = 0; i < length; i += 1) {
        if (original[i] !== rebuilt[i]) {
            return i;
        }
    }
    if (original.length !== rebuilt.length) {
        return length;
    }
    return null;
}

function buildHexSnippet(buffer: Buffer, start: number, length: number): string {
    return (
        buffer
            .slice(start, start + length)
            .toString("hex")
            .match(/.{1,2}/g)
            ?.join(" ") ?? ""
    );
}

function buildAsciiSnippet(
    buffer: Buffer,
    start: number,
    length: number
): string {
    return buffer
        .slice(start, start + length)
        .toString("utf8")
        .replace(/[^\x20-\x7E]/g, ".");
}

function countRecords(text: string): number {
    const matches = text.match(/^[^:\r\n]*:[^:\r\n]*:~\s+\d+:/gm);
    return matches ? matches.length : 0;
}

function isLengthTokenMismatch(originalText: string, rebuiltText: string): boolean {
    const linePattern = /^([^:\r\n]*:[^:\r\n]*:~\s+)(\d+):(.*)$/;
    const originalLines = originalText.split("\r\n");
    const rebuiltLines = rebuiltText.split("\r\n");

    if (originalLines.length !== rebuiltLines.length) {
        return false;
    }

    for (let i = 0; i < originalLines.length; i += 1) {
        const originalLine = originalLines[i] ?? "";
        const rebuiltLine = rebuiltLines[i] ?? "";
        if (originalLine === rebuiltLine) {
            continue;
        }
        const originalMatch = linePattern.exec(originalLine);
        const rebuiltMatch = linePattern.exec(rebuiltLine);
        if (!originalMatch || !rebuiltMatch) {
            return false;
        }
        if (
            originalMatch[1] !== rebuiltMatch[1] ||
            originalMatch[3] !== rebuiltMatch[3]
        ) {
            return false;
        }
    }

    return true;
}

function findRecordContext(text: string, offset: number): string {
    const lines = text.split("\r\n");
    let byteOffset = 0;
    let recordIndex = 0;

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? "";
        const lineByteLength = Buffer.byteLength(line, "utf8");
        const lineStart = byteOffset;
        const lineEnd = lineStart + lineByteLength;
        const isHeader = /^[^:\r\n]*:[^:\r\n]*:~\s+\d+:/.test(line);
        if (isHeader) {
            recordIndex += 1;
        }
        if (offset >= lineStart && offset <= lineEnd + 1) {
            if (recordIndex === 0) {
                return "Offset occurs before the first record header.";
            }
            return `Record ${recordIndex}, line ${i + 1} (header: ${line.slice(
                0,
                120
            )}${line.length > 120 ? "..." : ""})`;
        }
        byteOffset = lineEnd + 2;
    }

    return "Offset occurs after the last record.";
}

async function safeUnlink(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (getErrorCode(error) !== "ENOENT") {
            throw error;
        }
    }
}

/**
 * Rebuild the imported workspace and compare the result to the source Hotkey.htk.
 */
export async function verifyRoundTrip(
    sourcePath: string,
    workspaceRoot: string
): Promise<RoundTripResult> {
    const tempName = `.roundtrip-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}.htk`;
    const outputPath = path.join(workspaceRoot, tempName);

    try {
        await compileHotkeys({ workspaceRoot, outputPath });
        const [original, rebuilt] = await Promise.all([
            fs.readFile(sourcePath),
            fs.readFile(outputPath),
        ]);

        const diffIndex = findFirstDifference(original, rebuilt);
        if (diffIndex === null) {
            return { matched: true };
        }

        const window = 16;
        const start = Math.max(0, diffIndex - window);
        const originalSnippet = buildHexSnippet(original, start, window * 2);
        const rebuiltSnippet = buildHexSnippet(rebuilt, start, window * 2);
        const originalAscii = buildAsciiSnippet(original, start, window * 2);
        const rebuiltAscii = buildAsciiSnippet(rebuilt, start, window * 2);
        const originalText = original.toString("utf8");
        const rebuiltText = rebuilt.toString("utf8");
        const recordSummary = findRecordContext(originalText, diffIndex);
        const recordCounts = `Original records: ${countRecords(
            originalText
        )}, rebuilt records: ${countRecords(rebuiltText)}.`;
        const lengthOnly = isLengthTokenMismatch(originalText, rebuiltText);
        const lengthNote = lengthOnly
            ? "Only length tokens differ (computed script length vs. original header value)."
            : undefined;
        const summary = [
            `Mismatch at byte ${diffIndex + 1} (original ${original.length} bytes, rebuilt ${rebuilt.length} bytes).`,
            recordSummary,
            recordCounts,
            lengthNote,
            `Original hex: ${originalSnippet}`,
            `Rebuilt hex:  ${rebuiltSnippet}`,
            `Original text: ${originalAscii}`,
            `Rebuilt text:  ${rebuiltAscii}`,
        ]
            .filter((line): line is string => Boolean(line))
            .join("\n");
        return { matched: false, mismatchSummary: summary };
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        throw new ImportVerifyError(
            "Round-trip verification failed.",
            details,
            { sourcePath }
        );
    } finally {
        await safeUnlink(outputPath);
    }
}
