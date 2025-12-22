export type LintSeverity = "info" | "warning" | "error";

export type RuleOverride = LintSeverity | "off";

export interface LintPosition {
    line: number;
    character: number;
}

export interface LintRange {
    start: LintPosition;
    end: LintPosition;
}

export interface LintFinding {
    ruleId: string;
    severity: LintSeverity;
    message: string;
    filePath: string;
    range: LintRange;
    fixSuggestion?: string;
}

export interface ExecHotkeyRef {
    target: string;
    offset: number;
    length: number;
}

export interface ScriptFile {
    filePath: string;
    scriptName: string;
    text: string;
    code: string;
    lineStarts: number[];
    execHotkeyRefs: ExecHotkeyRef[];
}

export interface ScriptIndexEntry {
    scriptName: string;
    filePath: string;
    referencedByKeymap: boolean;
    referencedByExecHotkey: boolean;
}

export interface LintConfig {
    enabled: boolean;
    debounceMs: number;
    maxFiles: number;
    maxChainDepth: number;
    lintOnBuild: boolean;
    ruleOverrides: Record<string, RuleOverride>;
}

export interface LintWorkspaceContext {
    scripts: ScriptFile[];
    scriptIndex: Map<string, ScriptIndexEntry>;
    keymapRefs: Set<string>;
    keymapDuplicates: Set<string>;
    keymapPresent: boolean;
    config: LintConfig;
}

export interface LintRuleContext {
    workspace: LintWorkspaceContext;
    file?: ScriptFile;
}

export interface LintRule {
    id: string;
    defaultSeverity: LintSeverity;
    description: string;
    rationale: string;
    message: string;
    fixSuggestion?: string;
    scope: "file" | "workspace";
    run(context: LintRuleContext): LintFinding[];
}
