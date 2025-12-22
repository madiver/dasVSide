import { findMatches, rangeFromOffset } from "../scanner";
import { LintFinding, LintRule, LintRuleContext } from "../types";

const PROPERTY_PATTERN = /\$[A-Za-z_][A-Za-z0-9_]*\./g;

function runObjectUsage(context: LintRuleContext): LintFinding[] {
    const file = context.file;
    if (!file) {
        return [];
    }

    const findings: LintFinding[] = [];
    const firstPropertyUse = new Map<string, { index: number; length: number }>();

    for (const match of findMatches(PROPERTY_PATTERN, file.code)) {
        const variable = match.text.slice(0, match.text.length - 1);
        if (!firstPropertyUse.has(variable)) {
            firstPropertyUse.set(variable, {
                index: match.index,
                length: match.length,
            });
        }
    }

    for (const [variable, location] of firstPropertyUse.entries()) {
        const isObjPattern = new RegExp(
            `\\bIsObj\\s*\\(\\s*${variable.replace("$", "\\$")}\\s*\\)`,
            "i"
        );
        if (!isObjPattern.test(file.code)) {
            findings.push({
                ruleId: "object-usage",
                severity: "warning",
                message: `Object property access ${variable}. without an IsObj check.`,
                filePath: file.filePath,
                range: rangeFromOffset(
                    file.lineStarts,
                    location.index,
                    location.length
                ),
            });
        }
    }

    return findings;
}

export const objectUsageRule: LintRule = {
    id: "object-usage",
    defaultSeverity: "warning",
    description: "Warns on object property access without prior IsObj checks.",
    rationale: "Object access without checks can lead to runtime errors.",
    message: "Object usage without IsObj guard.",
    scope: "file",
    run: runObjectUsage,
};
