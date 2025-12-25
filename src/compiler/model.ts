import { HotkeyModel, KeymapEntry } from "./types";
import { validateScriptContent } from "./validator";

const SCRIPT_LINEBREAK_PATTERN = /\r\n|\r|\n/g;

export function buildHotkeyModels(
    entries: KeymapEntry[],
    scriptContents: Map<string, string>
): HotkeyModel[] {
    const hotkeys: HotkeyModel[] = [];

    for (const entry of entries) {
        const scriptText = scriptContents.get(entry.scriptPath) ?? "";
        validateScriptContent(scriptText, entry.scriptPath);
        const scriptLength = getScriptLength(scriptText);
        hotkeys.push({
            id: entry.id,
            key: entry.key,
            label: entry.label,
            scriptText,
            sourcePath: entry.scriptPath,
            scriptLength,
        });
    }

    return hotkeys;
}

function getScriptLength(scriptText: string): number {
    const normalized = scriptText.replace(SCRIPT_LINEBREAK_PATTERN, "\r\n");
    return Buffer.byteLength(normalized, "utf8");
}
