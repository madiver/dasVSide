import { findMatches, rangeFromOffset } from "../scanner";
import { LintFinding, LintRule, LintRuleContext } from "../types";

const WHILE_TRUE_PATTERN = /\bwhile\s*\(\s*(true|1)\s*\)/gi;
const FOR_INFINITE_PATTERN = /\bfor\s*\(\s*;\s*;\s*\)/gi;
const RETURN_PATTERN = /\breturn\b/gi;
const CLEANUP_PATTERN = /\b(CXL|STOP|CLOSE|EXIT)\b/gi;

function runControlFlow(context: LintRuleContext): LintFinding[] {
    const file = context.file;
    if (!file) {
        return [];
    }

    const findings: LintFinding[] = [];

    for (const match of findMatches(WHILE_TRUE_PATTERN, file.code)) {
        findings.push({
            ruleId: "control-flow",
            severity: "warning",
            message: "Potential infinite loop detected (while true).",
            filePath: file.filePath,
            range: rangeFromOffset(file.lineStarts, match.index, match.length),
        });
    }

    for (const match of findMatches(FOR_INFINITE_PATTERN, file.code)) {
        findings.push({
            ruleId: "control-flow",
            severity: "warning",
            message: "Potential infinite loop detected (for(;;)).",
            filePath: file.filePath,
            range: rangeFromOffset(file.lineStarts, match.index, match.length),
        });
    }

    const returnMatches = findMatches(RETURN_PATTERN, file.code);
    if (returnMatches.length > 0) {
        const firstReturn = returnMatches[0];
        const trailingCode = file.code.slice(firstReturn.index);
        const hasCleanupAfterReturn = CLEANUP_PATTERN.test(trailingCode);

        if (hasCleanupAfterReturn) {
            findings.push({
                ruleId: "control-flow",
                severity: "warning",
                message:
                    "Return statement appears before cleanup or exit logic.",
                filePath: file.filePath,
                range: rangeFromOffset(
                    file.lineStarts,
                    firstReturn.index,
                    firstReturn.length
                ),
            });
        }
    }

    return findings;
}

export const controlFlowRule: LintRule = {
    id: "control-flow",
    defaultSeverity: "warning",
    description: "Flags unbounded loops and early returns before cleanup logic.",
    rationale: "Control flow hazards can trap execution or skip exits.",
    message: "Control flow risk detected.",
    scope: "file",
    run: runControlFlow,
};
