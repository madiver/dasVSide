import { LintPosition, LintRange } from "./types";

export function buildLineStarts(text: string): number[] {
    const lineStarts = [0];
    for (let i = 0; i < text.length; i += 1) {
        if (text[i] === "\n") {
            lineStarts.push(i + 1);
        }
    }
    return lineStarts;
}

export function offsetToPosition(
    lineStarts: number[],
    offset: number
): LintPosition {
    let low = 0;
    let high = lineStarts.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const start = lineStarts[mid];
        const next =
            mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Number.POSITIVE_INFINITY;

        if (offset >= start && offset < next) {
            return { line: mid, character: offset - start };
        }

        if (offset < start) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    return { line: lineStarts.length - 1, character: 0 };
}

export function rangeFromOffset(
    lineStarts: number[],
    offset: number,
    length: number
): LintRange {
    const start = offsetToPosition(lineStarts, offset);
    const end = offsetToPosition(lineStarts, offset + Math.max(length, 1));
    return { start, end };
}

export interface MatchResult {
    index: number;
    length: number;
    text: string;
}

export function findMatches(pattern: RegExp, text: string): MatchResult[] {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const regex = new RegExp(pattern.source, flags);
    const matches: MatchResult[] = [];

    for (const match of text.matchAll(regex)) {
        if (typeof match.index !== "number") {
            continue;
        }
        matches.push({
            index: match.index,
            length: match[0].length,
            text: match[0],
        });
    }

    return matches;
}
