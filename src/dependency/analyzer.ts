import * as path from "path";
import * as vscode from "vscode";
import { DependencyAnalysisCache } from "./cache";
import { detectCycles } from "./cycles";
import { detectDeadScripts } from "./deadScripts";
import { buildGraph } from "./graph";
import { loadKeymap } from "./keymap";
import { parseScript } from "./parser";
import { GraphReport, ScriptParseResult } from "./types";

const DEFAULT_MAX_FILES = 200;
const EXCLUDE_PATTERN = "**/{node_modules,.git,out,dist,build}/**";

const cache = new DependencyAnalysisCache();

function getWorkspaceRoot(): string {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        throw new Error("Open a workspace folder before analyzing dependencies.");
    }
    return folders[0].uri.fsPath;
}

async function loadScripts(
    workspaceRoot: string,
    maxFiles: number
): Promise<ScriptParseResult[]> {
    const scripts = await vscode.workspace.findFiles(
        "**/*.das",
        EXCLUDE_PATTERN,
        maxFiles
    );
    const results: ScriptParseResult[] = [];
    const filtered = scripts.filter(
        (uri) => !path.basename(uri.fsPath).startsWith("._")
    );

    for (const uri of filtered) {
        const bytes = await vscode.workspace.fs.readFile(uri);
        const content = Buffer.from(bytes).toString("utf8");
        results.push(parseScript(uri.fsPath, content, workspaceRoot));
    }

    return results;
}

export interface DependencyAnalysisOptions {
    workspaceRoot?: string;
    maxFiles?: number;
    useCache?: boolean;
}

export async function analyzeWorkspace(
    options: DependencyAnalysisOptions = {}
): Promise<GraphReport> {
    const workspaceRoot = options.workspaceRoot ?? getWorkspaceRoot();
    const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
    const useCache = options.useCache ?? true;

    const parsedScripts = await loadScripts(workspaceRoot, maxFiles);
    if (parsedScripts.length === 0) {
        return {
            nodes: [],
            edges: [],
            findings: [],
            warnings: ["No .das files were found in the workspace."],
        };
    }

    const keymap = await loadKeymap(
        workspaceRoot,
        parsedScripts.map((script) => script.filePath)
    );

    const cachePaths = [
        ...parsedScripts.map((script) => script.filePath),
        ...(keymap.keymapPath ? [keymap.keymapPath] : []),
    ];

    if (useCache) {
        const cached = await cache.get(workspaceRoot, cachePaths);
        if (cached) {
            return cached;
        }
    }

    const graph = buildGraph(parsedScripts, keymap.entries, workspaceRoot);
    const findings = [...graph.findings];

    const cycles = detectCycles(graph.edges);
    for (const cycle of cycles) {
        findings.push({
            type: "cycle",
            message: `Cycle detected: ${cycle.join(" -> ")}.`,
            cycle,
        });
    }

    const entryPaths = new Set(
        keymap.entries.map((entry) => entry.scriptRelativePath)
    );
    const deadScripts = detectDeadScripts(graph.nodes, graph.edges, entryPaths);
    for (const script of deadScripts) {
        findings.push({
            type: "deadScript",
            message: `Script "${script.path}" is not referenced by any hotkey or call edge.`,
            targetPath: script.path,
        });
    }

    const report: GraphReport = {
        nodes: graph.nodes,
        edges: graph.edges,
        findings,
        warnings: keymap.warnings,
    };

    await cache.set(workspaceRoot, cachePaths, report);
    return report;
}

export async function getCachedReport(
    workspaceRoot?: string
): Promise<GraphReport | undefined> {
    const root = workspaceRoot ?? getWorkspaceRoot();
    const scripts = await loadScripts(root, DEFAULT_MAX_FILES);
    const keymap = await loadKeymap(
        root,
        scripts.map((script) => script.filePath)
    );
    const paths = [
        ...scripts.map((script) => script.filePath),
        ...(keymap.keymapPath ? [keymap.keymapPath] : []),
    ];
    return cache.get(root, paths);
}
