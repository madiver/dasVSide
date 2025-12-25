import {
    HEX_TOKEN_PATTERN,
    HOTKEY_HEADER_PATTERN,
    KEY_COMBO_PATTERN,
    KEY_COMBO_REQUIRED_PATTERN,
    PLACEHOLDER_PATTERN,
    SCRIPT_BODY_PREFIX_PATTERN,
} from "./formatRules";
import { ValidationError } from "./errors";

const INVALID_UTF8_PATTERN = /\uFFFD/;

export interface ValidationOptions {
    templateText?: string;
}

function getHeaderMatch(line: string): RegExpMatchArray | null {
    const match = line.match(HOTKEY_HEADER_PATTERN);
    const keyCombo = match?.groups?.keyCombo ?? "";

    if (keyCombo.length > 0) {
        if (!KEY_COMBO_PATTERN.test(keyCombo)) {
            return null;
        }
        if (!KEY_COMBO_REQUIRED_PATTERN.test(keyCombo)) {
            return null;
        }
    }

    return match;
}

function extractHeaders(text: string): string[] {
    const headers: string[] = [];
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
        const match = getHeaderMatch(line);
        if (match) {
            headers.push(match[0]);
        }
    }

    return headers;
}

export function validateRenderedOutput(
    rendered: string,
    options: ValidationOptions = {}
): void {
    if (!rendered || rendered.trim().length === 0) {
        throw new ValidationError("Generated output is empty.");
    }

    const unresolved = rendered.match(PLACEHOLDER_PATTERN);
    if (unresolved && unresolved.length > 0) {
        throw new ValidationError(
            "Generated output contains unresolved placeholders.",
            `Unresolved placeholders: ${Array.from(new Set(unresolved)).join(", ")}`
        );
    }

    const lines = rendered.split(/\r?\n/);
    if (lines.length > 1 && lines[lines.length - 1] === "") {
        lines.pop();
    }

    const recordIndexes: number[] = [];
    const recordHeaders: string[] = [];

    lines.forEach((line, index) => {
        if (line.length === 0) {
            throw new ValidationError("Hotkey output contains a blank line.");
        }

        const match = getHeaderMatch(line);
        if (match) {
            recordIndexes.push(index);
            recordHeaders.push(match[0]);
        }
    });

    if (recordIndexes.length === 0) {
        throw new ValidationError("No hotkey record headers were detected.");
    }

    for (let i = 0; i < recordIndexes.length; i += 1) {
        const start = recordIndexes[i];
        const end =
            i + 1 < recordIndexes.length ? recordIndexes[i + 1] : lines.length;
        const recordLines = lines.slice(start, end);

        const headerMatch = getHeaderMatch(recordLines[0]);
        if (!headerMatch) {
            throw new ValidationError("Hotkey record header is invalid.");
        }

        const bodyStart = recordLines[0].slice(headerMatch[0].length);
        const isScript = SCRIPT_BODY_PREFIX_PATTERN.test(bodyStart);

        if (isScript) {
            if (bodyStart.length === 0) {
                throw new ValidationError(
                    "Script hotkey records must include a script body prefix."
                );
            }
        } else if (recordLines.length > 1) {
            throw new ValidationError(
                "Inline hotkey records must not span multiple lines."
            );
        }
    }

    if (options.templateText) {
        const expectedHeaders = extractHeaders(options.templateText);
        if (expectedHeaders.length !== recordHeaders.length) {
            throw new ValidationError(
                "Hotkey record count does not match the template."
            );
        }

        for (let i = 0; i < expectedHeaders.length; i += 1) {
            if (expectedHeaders[i] !== recordHeaders[i]) {
                throw new ValidationError(
                    "Hotkey record order does not match the template."
                );
            }
        }

        const expectedTokens = options.templateText.match(HEX_TOKEN_PATTERN) ?? [];
        const actualTokens = rendered.match(HEX_TOKEN_PATTERN) ?? [];
        if (expectedTokens.length !== actualTokens.length) {
            throw new ValidationError(
                "Hotkey output does not preserve template token structure."
            );
        }

        for (let i = 0; i < expectedTokens.length; i += 1) {
            if (expectedTokens[i] !== actualTokens[i]) {
                throw new ValidationError(
                    "Hotkey output token sequence does not match the template."
                );
            }
        }
    }
}

export function validateScriptContent(
    content: string,
    sourcePath: string
): void {
    if (!content || content.trim().length === 0) {
        throw new ValidationError(
            "Script content is empty.",
            sourcePath,
            { sourcePath }
        );
    }

    if (INVALID_UTF8_PATTERN.test(content)) {
        throw new ValidationError(
            "Script content contains invalid UTF-8.",
            sourcePath,
            { sourcePath }
        );
    }
}
