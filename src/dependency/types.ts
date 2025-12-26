export type ReferenceType = "execHotkey" | "scriptPath";

export interface TextPosition {
    line: number;
    character: number;
}

export interface TextRange {
    start: TextPosition;
    end: TextPosition;
}

export interface ScriptReference {
    type: ReferenceType;
    target: string;
    range: TextRange;
    rawText: string;
}

export interface ScriptParseResult {
    filePath: string;
    relativePath: string;
    references: ScriptReference[];
    lineStarts: number[];
}

export interface KeymapEntry {
    id: string;
    key: string;
    label: string;
    scriptPath: string;
    scriptRelativePath: string;
}

export interface ScriptNode {
    path: string;
    filePath: string;
    id?: string;
    label?: string;
    key?: string;
    references: ScriptReference[];
}

export interface ReferenceLocation {
    filePath: string;
    range: TextRange;
}

export interface DependencyEdge {
    from: string;
    to: string;
    type: ReferenceType;
    locations: ReferenceLocation[];
}

export type FindingType = "cycle" | "deadScript" | "missingReference";

export interface GraphFinding {
    type: FindingType;
    message: string;
    sourcePath?: string;
    targetPath?: string;
    cycle?: string[];
}

export interface GraphReport {
    nodes: ScriptNode[];
    edges: DependencyEdge[];
    findings: GraphFinding[];
    warnings: string[];
}
