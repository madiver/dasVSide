import { buildScanContext } from "../linting/tokenizer";

export interface ReferenceMatch {
    target: string;
    offset: number;
    length: number;
    rawText: string;
}

const EXEC_HOTKEY_PATTERN =
    /ExecHotkey\s*\(\s*(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*\)/gi;

const DAS_LITERAL_PATTERN = /"([^"\n]*?\.das)"/gi;

function stripLineComments(text: string): string {
    const chars = Array.from(text);
    let inString = false;
    let inComment = false;

    for (let i = 0; i < chars.length; i += 1) {
        const ch = chars[i];
        const next = i + 1 < chars.length ? chars[i + 1] : "";

        if (inComment) {
            if (ch === "\n") {
                inComment = false;
            } else {
                chars[i] = " ";
            }
            continue;
        }

        if (inString) {
            if (ch === "\\") {
                if (i + 1 < chars.length) {
                    i += 1;
                }
                continue;
            }
            if (ch === "\"") {
                inString = false;
            }
            continue;
        }

        if (ch === "\"" && !inString) {
            inString = true;
            continue;
        }

        if (ch === "/" && next === "/") {
            inComment = true;
            chars[i] = " ";
            if (i + 1 < chars.length) {
                chars[i + 1] = " ";
                i += 1;
            }
        }
    }

    return chars.join("");
}

export function findExecHotkeyRefs(text: string): ReferenceMatch[] {
    const sanitized = stripLineComments(text);
    const matches: ReferenceMatch[] = [];

    for (const match of sanitized.matchAll(EXEC_HOTKEY_PATTERN)) {
        if (typeof match.index !== "number") {
            continue;
        }
        const target = (match[1] ?? match[2] ?? "").trim();
        if (!target) {
            continue;
        }
        const matchText = match[0];
        const targetIndex = matchText.indexOf(target);
        matches.push({
            target,
            offset: match.index + (targetIndex >= 0 ? targetIndex : 0),
            length: target.length,
            rawText: matchText,
        });
    }

    return matches;
}

export function findDasLiteralRefs(text: string): ReferenceMatch[] {
    const sanitized = stripLineComments(text);
    const matches: ReferenceMatch[] = [];

    for (const match of sanitized.matchAll(DAS_LITERAL_PATTERN)) {
        if (typeof match.index !== "number") {
            continue;
        }
        const target = (match[1] ?? "").trim();
        if (!target) {
            continue;
        }
        const matchText = match[0];
        const targetIndex = matchText.indexOf(target);
        matches.push({
            target,
            offset: match.index + (targetIndex >= 0 ? targetIndex : 0),
            length: target.length,
            rawText: matchText,
        });
    }

    return matches;
}
