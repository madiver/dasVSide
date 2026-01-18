import { buildScanContext } from "../linting/tokenizer";

export interface ReferenceMatch {
    target: string;
    offset: number;
    length: number;
    rawText: string;
}

const EXEC_HOTKEY_TOKEN = "ExecHotkey";
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
    const matches: ReferenceMatch[] = [];
    const length = text.length;
    let inString = false;
    let inComment = false;

    const isWordChar = (value: string): boolean =>
        /[A-Za-z0-9_]/.test(value);
    const isTargetChar = (value: string): boolean =>
        /[A-Za-z0-9_-]/.test(value);
    const skipWhitespace = (index: number): number => {
        let i = index;
        while (i < length && /\s/.test(text[i] ?? "")) {
            i += 1;
        }
        return i;
    };
    const matchToken = (index: number): boolean =>
        text
            .slice(index, index + EXEC_HOTKEY_TOKEN.length)
            .toLowerCase() === EXEC_HOTKEY_TOKEN.toLowerCase();

    let i = 0;
    while (i < length) {
        const ch = text[i] ?? "";
        const next = i + 1 < length ? text[i + 1] ?? "" : "";

        if (inComment) {
            if (ch === "\n") {
                inComment = false;
            }
            i += 1;
            continue;
        }

        if (inString) {
            if (ch === "\\") {
                i += 2;
                continue;
            }
            if (ch === "\"") {
                inString = false;
            }
            i += 1;
            continue;
        }

        if (ch === "/" && next === "/") {
            inComment = true;
            i += 2;
            continue;
        }

        if (ch === "\"") {
            inString = true;
            i += 1;
            continue;
        }

        if (matchToken(i)) {
            const before = i > 0 ? text[i - 1] ?? "" : "";
            const after =
                i + EXEC_HOTKEY_TOKEN.length < length
                    ? text[i + EXEC_HOTKEY_TOKEN.length] ?? ""
                    : "";
            if ((before && isWordChar(before)) || (after && isWordChar(after))) {
                i += 1;
                continue;
            }

            let j = skipWhitespace(i + EXEC_HOTKEY_TOKEN.length);
            if (text[j] !== "(") {
                i += 1;
                continue;
            }
            j = skipWhitespace(j + 1);

            let target = "";
            let targetStart = j;
            let targetLength = 0;

            if (text[j] === "\"") {
                j += 1;
                targetStart = j;
                let closed = false;
                while (j < length) {
                    const inner = text[j] ?? "";
                    if (inner === "\\") {
                        j += 2;
                        continue;
                    }
                    if (inner === "\"") {
                        closed = true;
                        break;
                    }
                    j += 1;
                }
                if (!closed) {
                    i += 1;
                    continue;
                }
                target = text.slice(targetStart, j);
                targetLength = j - targetStart;
                j = skipWhitespace(j + 1);
            } else if (isTargetChar(text[j] ?? "")) {
                targetStart = j;
                while (j < length && isTargetChar(text[j] ?? "")) {
                    j += 1;
                }
                target = text.slice(targetStart, j);
                targetLength = j - targetStart;
                j = skipWhitespace(j);
            } else {
                i += 1;
                continue;
            }

            if (text[j] !== ")") {
                i += 1;
                continue;
            }

            if (target) {
                matches.push({
                    target,
                    offset: targetStart,
                    length: targetLength,
                    rawText: text.slice(i, j + 1),
                });
                i = j + 1;
                continue;
            }
        }

        i += 1;
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
