import {
    CRLF,
    ENCODED_LINE_WIDTH,
    PLACEHOLDER_PATTERN,
} from "./formatRules";
import { TemplateRenderError } from "./errors";
import { HotkeyModel } from "./types";

const SCRIPT_LINEBREAK_PATTERN = /\r\n|\r|\n/g;

export function renderTemplate(
    template: string,
    variables: Record<string, string>
): string {
    let rendered = template;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        rendered = rendered.split(placeholder).join(value);
    }

    const unresolved = rendered.match(PLACEHOLDER_PATTERN);
    if (unresolved && unresolved.length > 0) {
        const unique = Array.from(new Set(unresolved)).slice(0, 5).join(", ");
        throw new TemplateRenderError(
            "Template rendering failed because placeholder values are missing.",
            `Unresolved placeholders: ${unique}`
        );
    }

    return rendered;
}

export function encodeScriptText(scriptText: string): string {
    const normalized = scriptText.replace(SCRIPT_LINEBREAK_PATTERN, CRLF);
    const bytes = Buffer.from(normalized, "utf8");
    let encoded = "";

    for (const byte of bytes) {
        if (byte === 0x0d) {
            encoded += "~0D";
        } else if (byte === 0x0a) {
            encoded += "~0A";
        } else if (byte >= 0x20 && byte <= 0x7d) {
            encoded += String.fromCharCode(byte);
        } else {
            encoded += `~${byte.toString(16).toUpperCase().padStart(2, "0")}`;
        }
    }

    return encoded;
}

function wrapEncodedScript(encoded: string, lineWidth: number): string[] {
    if (encoded.length === 0) {
        return [""];
    }

    const lines: string[] = [];
    let index = 0;
    while (index < encoded.length) {
        let end = Math.min(index + lineWidth, encoded.length);

        if (end < encoded.length) {
            if (encoded[end - 1] === "~") {
                end = Math.min(end + 2, encoded.length);
            } else if (
                encoded[end - 2] === "~" &&
                /[0-9A-Fa-f]/.test(encoded[end - 1])
            ) {
                end = Math.min(end + 1, encoded.length);
            }
        }

        lines.push(encoded.slice(index, end));
        index = end;
    }
    return lines;
}

export function renderHotkeyRecord(hotkey: HotkeyModel): string {
    const encodedScript = encodeScriptText(hotkey.scriptText);
    const lengthToken = `~ ${hotkey.scriptLength}`;
    const prefix = `${hotkey.key}:${hotkey.label}:${lengthToken}:`;
    const chunks = wrapEncodedScript(encodedScript, ENCODED_LINE_WIDTH);
    const lines = [prefix + (chunks[0] ?? "")];

    for (let i = 1; i < chunks.length; i += 1) {
        lines.push(chunks[i]);
    }

    return lines.join(CRLF);
}

export function renderHotkeys(hotkeys: HotkeyModel[]): string {
    return hotkeys.map((hotkey) => renderHotkeyRecord(hotkey)).join(CRLF);
}
