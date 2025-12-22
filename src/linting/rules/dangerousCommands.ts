import { findMatches, rangeFromOffset } from "../scanner";
import { LintFinding, LintRule, LintRuleContext } from "../types";

const PATTERNS = [
    {
        regex: /\bCXL\s+ALL\b/gi,
        message:
            "CXL ALL cancels all active orders and can interrupt active strategies.",
    },
    {
        regex: /\bPANIC\b/gi,
        message:
            "PANIC-style exits can rapidly flatten positions without confirmation.",
    },
    {
        regex: /\bSEND=REVERSE\b/gi,
        message:
            "SEND=Reverse can invert positions and may amplify trading risk.",
    },
];

function runDangerousCommands(context: LintRuleContext): LintFinding[] {
    const file = context.file;
    if (!file) {
        return [];
    }

    const findings: LintFinding[] = [];
    for (const pattern of PATTERNS) {
        const matches = findMatches(pattern.regex, file.code);
        for (const match of matches) {
            findings.push({
                ruleId: "dangerous-commands",
                severity: "warning",
                message: pattern.message,
                filePath: file.filePath,
                range: rangeFromOffset(file.lineStarts, match.index, match.length),
            });
        }
    }
    return findings;
}

export const dangerousCommandsRule: LintRule = {
    id: "dangerous-commands",
    defaultSeverity: "warning",
    description: "Flags high-risk commands that can rapidly cancel or reverse.",
    rationale: "Dangerous commands can quickly alter exposure and should be reviewed.",
    message: "Dangerous command detected.",
    scope: "file",
    run: runDangerousCommands,
};
