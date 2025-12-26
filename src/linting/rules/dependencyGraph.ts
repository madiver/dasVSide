import path from "path";
import { detectCycles } from "../../dependency/cycles";
import { detectDeadScripts } from "../../dependency/deadScripts";
import { buildGraph } from "../../dependency/graph";
import { parseKeymapText } from "../../dependency/keymap";
import { parseScript } from "../../dependency/parser";
import { LintFinding, LintRule, LintRuleContext } from "../types";
import { rangeFromOffset } from "../scanner";

function resolveWorkspaceRoot(context: LintRuleContext): string | undefined {
    if (context.workspace.keymapPath) {
        return path.dirname(context.workspace.keymapPath);
    }
    const firstScript = context.workspace.scripts[0];
    if (!firstScript) {
        return undefined;
    }
    return path.dirname(firstScript.filePath);
}

function buildParsedScripts(context: LintRuleContext, workspaceRoot: string) {
    return context.workspace.scripts.map((script) =>
        parseScript(script.filePath, script.text, workspaceRoot)
    );
}

function makeRange(filePath: string, context: LintRuleContext) {
    const script = context.workspace.scripts.find(
        (entry) => entry.filePath === filePath
    );
    if (!script) {
        return rangeFromOffset([0], 0, 1);
    }
    return rangeFromOffset(script.lineStarts, 0, 1);
}

function runDependencyGraphRule(context: LintRuleContext): LintFinding[] {
    const workspaceRoot = resolveWorkspaceRoot(context);
    if (!workspaceRoot) {
        return [];
    }

    const parsedScripts = buildParsedScripts(context, workspaceRoot);
    const keymapText = context.workspace.keymapText ?? "";
    const keymapEntries = keymapText
        ? parseKeymapText(
              keymapText,
              workspaceRoot,
              parsedScripts.map((script) => script.filePath)
          ).entries
        : [];

    const graph = buildGraph(parsedScripts, keymapEntries, workspaceRoot);

    const findings: LintFinding[] = [];
    const cycles = detectCycles(graph.edges);
    for (const cycle of cycles) {
        const first = cycle[0];
        const node = graph.nodes.find((entry) => entry.path === first);
        if (!node) {
            continue;
        }
        findings.push({
            ruleId: "dependency-graph",
            severity: "warning",
            message: `Dependency cycle detected: ${cycle.join(" -> ")}.`,
            filePath: node.filePath,
            range: makeRange(node.filePath, context),
        });
    }

    const entryPaths = new Set(
        keymapEntries.map((entry) => entry.scriptRelativePath)
    );
    const deadScripts = detectDeadScripts(graph.nodes, graph.edges, entryPaths);
    for (const script of deadScripts) {
        findings.push({
            ruleId: "dependency-graph",
            severity: "warning",
            message: `Script "${script.path}" is not referenced by any hotkey or call edge.`,
            filePath: script.filePath,
            range: makeRange(script.filePath, context),
        });
    }

    return findings;
}

export const dependencyGraphRule: LintRule = {
    id: "dependency-graph",
    defaultSeverity: "warning",
    description: "Reports dependency cycles and unused scripts.",
    rationale: "Cycles and unused scripts can hide structural issues.",
    message: "Dependency graph advisory finding.",
    scope: "workspace",
    run: runDependencyGraphRule,
};
