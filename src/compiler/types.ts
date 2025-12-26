export interface KeymapEntry {
    id: string;
    key: string;
    label: string;
    scriptPath: string;
}

export interface HotkeyModel {
    id: string;
    key: string;
    label: string;
    scriptText: string;
    sourcePath: string;
    scriptLength: number;
}

export interface CompileWarning {
    code: string;
    message: string;
    sourcePath?: string;
    id?: string;
    key?: string;
}

export interface PlaceholderWarning {
    placeholder: "live" | "simulated";
    affectedScripts: string[];
}

export interface CompileErrorInfo {
    code: string;
    message: string;
    sourcePath?: string;
    id?: string;
    key?: string;
}

export interface CompileResult {
    hotkeys: HotkeyModel[];
    warnings: CompileWarning[];
    errors: CompileErrorInfo[];
    outputPath?: string;
    placeholderWarnings?: PlaceholderWarning[];
}
