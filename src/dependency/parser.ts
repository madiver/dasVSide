import path from "path";
import { buildLineStarts, rangeFromOffset } from "../linting/scanner";
import { findDasLiteralRefs, findExecHotkeyRefs } from "./callPatterns";
import { ScriptParseResult, ScriptReference } from "./types";

function toRelativePath(workspaceRoot: string, filePath: string): string {
    return path
        .relative(workspaceRoot, filePath)
        .replace(/\\/g, "/");
}

export function parseScript(
    filePath: string,
    content: string,
    workspaceRoot: string
): ScriptParseResult {
    const lineStarts = buildLineStarts(content);
    const references: Array<
        ScriptReference & { offset: number; length: number }
    > = [];

    for (const match of findExecHotkeyRefs(content)) {
        references.push({
            type: "execHotkey",
            target: match.target,
            range: rangeFromOffset(lineStarts, match.offset, match.length),
            rawText: match.rawText,
            offset: match.offset,
            length: match.length,
        });
    }

    for (const match of findDasLiteralRefs(content)) {
        references.push({
            type: "scriptPath",
            target: match.target,
            range: rangeFromOffset(lineStarts, match.offset, match.length),
            rawText: match.rawText,
            offset: match.offset,
            length: match.length,
        });
    }

    references.sort((a, b) => a.offset - b.offset);

    return {
        filePath,
        relativePath: toRelativePath(workspaceRoot, filePath),
        lineStarts,
        references: references.map(({ offset, length, ...ref }) => ref),
    };
}
