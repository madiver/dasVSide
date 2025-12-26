import { DependencyEdge, ScriptNode } from "./types";

export function detectDeadScripts(
    nodes: ScriptNode[],
    edges: DependencyEdge[],
    entryPaths: Set<string>
): ScriptNode[] {
    const incoming = new Map<string, number>();
    for (const edge of edges) {
        incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    }

    return nodes.filter((node) => {
        const incomingCount = incoming.get(node.path) ?? 0;
        return !entryPaths.has(node.path) && incomingCount === 0;
    });
}
