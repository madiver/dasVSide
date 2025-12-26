import { KeymapEntry, NamedHotkeyRecord } from "./types";

const GROUP_TAG_PATTERN = /^\s*\/\/\s*Group\s*:\s*(.+?)\s*$/i;

function formatYamlString(value: string): string {
    const needsQuote =
        value.length === 0 ||
        /^[\s]|[\s]$/.test(value) ||
        /[:#\-\n\r\t]/.test(value);
    if (!needsQuote) {
        return value;
    }
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function extractGroup(scriptText: string): string | undefined {
    const lines = scriptText.split(/\r\n|\n|\r/);
    for (const line of lines) {
        const match = GROUP_TAG_PATTERN.exec(line);
        if (match && match[1]) {
            const group = match[1].trim();
            if (group) {
                return group;
            }
        }
    }
    return undefined;
}

/**
 * Build keymap entries from named hotkeys.
 */
export function buildKeymapEntries(
    records: NamedHotkeyRecord[]
): KeymapEntry[] {
    return records.map((record) => ({
        id: record.id,
        key: record.key,
        label: record.label,
        scriptPath: record.scriptPath,
        group: extractGroup(record.scriptText),
    }));
}

/**
 * Render keymap entries as a YAML list in deterministic order.
 */
export function renderKeymapYaml(entries: KeymapEntry[]): string {
    const lines: string[] = [];
    let currentGroup: string | undefined;
    for (const entry of entries) {
        if (!entry.group) {
            currentGroup = undefined;
        } else if (entry.group !== currentGroup) {
            if (lines.length > 0) {
                lines.push("");
            }
            lines.push(`# ${entry.group}`);
            currentGroup = entry.group;
        }
        lines.push(`- id: ${formatYamlString(entry.id)}`);
        lines.push(`  key: ${formatYamlString(entry.key)}`);
        lines.push(`  label: ${formatYamlString(entry.label)}`);
        lines.push(`  scriptPath: ${formatYamlString(entry.scriptPath)}`);
    }
    return lines.join("\n");
}
