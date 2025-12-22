import { rangeFromOffset } from "../scanner";
import { LintFinding, LintRule, LintRuleContext } from "../types";

function normalizeName(name: string): string {
    return name.trim().toLowerCase();
}

function buildGraph(context: LintRuleContext): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const script of context.workspace.scripts) {
        const key = normalizeName(script.scriptName);
        if (!graph.has(key)) {
            graph.set(key, new Set());
        }
        for (const ref of script.execHotkeyRefs) {
            const targetKey = normalizeName(ref.target);
            if (context.workspace.scriptIndex.has(targetKey)) {
                graph.get(key)?.add(targetKey);
            }
        }
    }

    return graph;
}

function detectCycles(
    graph: Map<string, Set<string>>
): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];
    const seenCycles = new Set<string>();

    const visit = (node: string) => {
        if (stack.has(node)) {
            const cycleStart = path.indexOf(node);
            if (cycleStart >= 0) {
                const cycle = path.slice(cycleStart).concat(node);
                const signature = cycle.join("->");
                if (!seenCycles.has(signature)) {
                    seenCycles.add(signature);
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

        const neighbors = graph.get(node);
        if (neighbors) {
            for (const next of neighbors) {
                visit(next);
            }
        }

        path.pop();
        stack.delete(node);
    };

    for (const node of graph.keys()) {
        visit(node);
    }

    return cycles;
}

function detectDepthWarnings(
    graph: Map<string, Set<string>>,
    maxDepth: number
): Set<string> {
    const warnings = new Set<string>();

    for (const start of graph.keys()) {
        const queue: { node: string; depth: number }[] = [
            { node: start, depth: 0 },
        ];
        const seen = new Set<string>([start]);

        while (queue.length > 0) {
            const current = queue.shift();
            if (!current) {
                continue;
            }
            if (current.depth > maxDepth) {
                warnings.add(start);
                break;
            }
            const neighbors = graph.get(current.node);
            if (!neighbors) {
                continue;
            }
            for (const next of neighbors) {
                if (seen.has(next)) {
                    continue;
                }
                seen.add(next);
                queue.push({ node: next, depth: current.depth + 1 });
            }
        }
    }

    return warnings;
}

function runExecHotkeyGraph(context: LintRuleContext): LintFinding[] {
    const { workspace } = context;
    const findings: LintFinding[] = [];

    const scriptLookup = new Map<string, typeof workspace.scripts[0]>();
    for (const script of workspace.scripts) {
        scriptLookup.set(normalizeName(script.scriptName), script);
    }

    for (const script of workspace.scripts) {
        for (const ref of script.execHotkeyRefs) {
            const targetKey = normalizeName(ref.target);
            const known =
                workspace.scriptIndex.has(targetKey) ||
                workspace.keymapRefs.has(targetKey);
            if (!known) {
                findings.push({
                    ruleId: "exec-hotkey-graph",
                    severity: "error",
                    message: `ExecHotkey references unknown target "${ref.target}".`,
                    filePath: script.filePath,
                    range: rangeFromOffset(
                        script.lineStarts,
                        ref.offset,
                        ref.length
                    ),
                });
            }
        }
    }

    const graph = buildGraph(context);
    const cycles = detectCycles(graph);
    for (const cycle of cycles) {
        const first = cycle[0];
        const script = scriptLookup.get(first);
        if (!script) {
            continue;
        }
        findings.push({
            ruleId: "exec-hotkey-graph",
            severity: "error",
            message: `Circular ExecHotkey chain detected: ${cycle.join(" -> ")}.`,
            filePath: script.filePath,
            range: rangeFromOffset(script.lineStarts, 0, 1),
        });
    }

    const maxDepth = workspace.config.maxChainDepth;
    const depthWarnings = detectDepthWarnings(graph, maxDepth);
    for (const entry of depthWarnings) {
        const script = scriptLookup.get(entry);
        if (!script) {
            continue;
        }
        findings.push({
            ruleId: "exec-hotkey-graph",
            severity: "warning",
            message: `ExecHotkey chain depth exceeds ${maxDepth} steps.`,
            filePath: script.filePath,
            range: rangeFromOffset(script.lineStarts, 0, 1),
        });
    }

    return findings;
}

export const execHotkeyGraphRule: LintRule = {
    id: "exec-hotkey-graph",
    defaultSeverity: "error",
    description: "Detects unknown ExecHotkey targets and circular call chains.",
    rationale: "Broken references and cycles can trigger unintended behavior.",
    message: "ExecHotkey dependency hazard detected.",
    scope: "workspace",
    run: runExecHotkeyGraph,
};
