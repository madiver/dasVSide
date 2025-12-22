import { buildLineStarts } from "./scanner";

export interface ScanContext {
    text: string;
    code: string;
    lineStarts: number[];
}

export function buildScanContext(text: string): ScanContext {
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
            if (ch === "\n") {
                inString = false;
                continue;
            }
            if (ch === "\\") {
                chars[i] = " ";
                if (i + 1 < chars.length) {
                    chars[i + 1] = " ";
                    i += 1;
                }
                continue;
            }
            if (ch === "\"") {
                inString = false;
            }
            chars[i] = " ";
            continue;
        }

        if (ch === "\"" && !inString) {
            inString = true;
            chars[i] = " ";
            continue;
        }

        if (ch === "/" && next === "/") {
            inComment = true;
            chars[i] = " ";
            if (i + 1 < chars.length) {
                chars[i + 1] = " ";
                i += 1;
            }
            continue;
        }
    }

    const code = chars.join("");
    const lineStarts = buildLineStarts(text);

    return { text, code, lineStarts };
}
