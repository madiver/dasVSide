import {
    buildScriptIndex,
    normalizeKey,
    normalizeRelativePath,
    resolveScriptPath,
} from "./resolve";
import {
    DependencyEdge,
    GraphFinding,
    KeymapEntry,
    ScriptNode,
    ScriptParseResult,
} from "./types";

export interface GraphBuildResult {
    nodes: ScriptNode[];
    edges: DependencyEdge[];
    findings: GraphFinding[];
}

export function buildGraph(
    scripts: ScriptParseResult[],
    keymapEntries: KeymapEntry[],
    workspaceRoot: string
): GraphBuildResult {
    const findings: GraphFinding[] = [];
    const scriptPaths = scripts.map((script) => script.filePath);
    const index = buildScriptIndex(scriptPaths, workspaceRoot);

    const entryById = new Map<string, KeymapEntry>();
    const entryByScript = new Map<string, KeymapEntry>();
    for (const entry of keymapEntries) {
        entryById.set(normalizeKey(entry.id), entry);
        const scriptKey = normalizeRelativePath(entry.scriptRelativePath);
        if (!entryByScript.has(scriptKey)) {
            entryByScript.set(scriptKey, entry);
        }
    }

    const nodes: ScriptNode[] = scripts.map((script) => {
        const entry = entryByScript.get(
            normalizeRelativePath(script.relativePath)
        );
        return {
            path: script.relativePath,
            filePath: script.filePath,
            id: entry?.id,
            label: entry?.label,
            key: entry?.key,
            references: script.references,
        };
    });

    const edgeMap = new Map<string, DependencyEdge>();
    for (const script of scripts) {
        for (const reference of script.references) {
            let targetPath: string | undefined;

            if (reference.type === "execHotkey") {
                const entry = entryById.get(normalizeKey(reference.target));
                if (entry) {
                    targetPath = entry.scriptRelativePath;
                } else {
                    findings.push({
                        type: "missingReference",
                        message: `ExecHotkey target "${reference.target}" not found in keymap.yaml.`,
                        sourcePath: script.relativePath,
                    });
                }
            } else {
                const resolved = resolveScriptPath(
                    reference.target,
                    index,
                    workspaceRoot
                );
                if (resolved.result) {
                    targetPath = resolved.result.relativePath;
                } else {
                    findings.push({
                        type: "missingReference",
                        message: `Script reference "${reference.target}" could not be resolved.`,
                        sourcePath: script.relativePath,
                    });
                }
            }

            if (!targetPath) {
                continue;
            }

            const key = `${script.relativePath}|${targetPath}|${reference.type}`;
            const edge =
                edgeMap.get(key) ??
                {
                    from: script.relativePath,
                    to: targetPath,
                    type: reference.type,
                    locations: [],
                };

            edge.locations.push({
                filePath: script.filePath,
                range: reference.range,
            });

            edgeMap.set(key, edge);
        }
    }

    const edges = Array.from(edgeMap.values()).sort((a, b) => {
        if (a.from === b.from) {
            if (a.to === b.to) {
                return a.type.localeCompare(b.type);
            }
            return a.to.localeCompare(b.to);
        }
        return a.from.localeCompare(b.from);
    });

    nodes.sort((a, b) => a.path.localeCompare(b.path));

    return { nodes, edges, findings };
}
