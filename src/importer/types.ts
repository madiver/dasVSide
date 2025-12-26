export type ConflictStrategy = "overwrite" | "skip" | "cancel";

export interface ImportSelection {
    sourcePath: string;
    destinationRoot: string;
    content: string;
}

export interface ParsedHotkeyRecord {
    index: number;
    line: number;
    key: string;
    label: string;
    scriptLength: number;
    encodedBody: string;
    sourcePath: string;
}

export interface DecodedHotkeyRecord {
    index: number;
    line: number;
    key: string;
    label: string;
    scriptLength: number;
    scriptText: string;
}

export interface NamedHotkeyRecord extends DecodedHotkeyRecord {
    id: string;
    fileName: string;
    scriptPath: string;
}

export interface KeymapEntry {
    id: string;
    key: string;
    label: string;
    scriptPath: string;
    group?: string;
}

export interface ImportWarning {
    message: string;
    recordIndex?: number;
    key?: string;
    label?: string;
    line?: number;
}

export interface ImportResult {
    destinationRoot: string;
    scriptsDir: string;
    keymapPath: string;
    entries: KeymapEntry[];
    writtenScriptPaths: string[];
    skippedScriptPaths: string[];
    warnings: ImportWarning[];
}

export interface ConflictInfo {
    path: string;
    type: "script" | "keymap";
    recordIndex?: number;
    key?: string;
    label?: string;
}
