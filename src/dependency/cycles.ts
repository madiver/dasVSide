import { DependencyEdge } from "./types";

export function detectCycles(
    edges: DependencyEdge[]
): string[][] {
    const graph = new Map<string, Set<string>>();
    const nodes = new Set<string>();

    for (const edge of edges) {
        nodes.add(edge.from);
        nodes.add(edge.to);
        const set = graph.get(edge.from) ?? new Set<string>();
        set.add(edge.to);
        graph.set(edge.from, set);
    }

    const sortedNodes = Array.from(nodes).sort((a, b) => a.localeCompare(b));
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];
    const seenSignatures = new Set<string>();

    const visit = (node: string) => {
        if (stack.has(node)) {
            const startIndex = path.indexOf(node);
            if (startIndex >= 0) {
                const cycle = path.slice(startIndex).concat(node);
                const signature = cycle.join("->");
                if (!seenSignatures.has(signature)) {
                    seenSignatures.add(signature);
                    cycles.push(cycle);
                }
            }
            return;
        }

        if (visited.has(node)) {
            return;
        }

        visited.add(node);
        stack.add(node);
        path.push(node);

        const neighbors = Array.from(graph.get(node) ?? []).sort((a, b) =>
            a.localeCompare(b)
        );
        for (const next of neighbors) {
            visit(next);
        }

        path.pop();
        stack.delete(node);
    };

    for (const node of sortedNodes) {
        visit(node);
    }

    return cycles;
}
