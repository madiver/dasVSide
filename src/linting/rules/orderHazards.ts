import { findMatches, rangeFromOffset } from "../scanner";
import { LintFinding, LintRule, LintRuleContext } from "../types";

const MARKET_ROUTE_PATTERN = /\bROUTE=(MARKET|MKT)\b/i;
const MARKET_ORDER_PATTERN = /\bORDER=MARKET\b/i;
const SIZE_PATTERN = /\b(Share|SIZE|Qty|QUANTITY)\s*=/i;
const BUY_PATTERN = /\bBUY\b/i;
const SELL_PATTERN = /\bSELL\b/i;
const STOP_PATTERN = /\bSTOP\b/i;

function runOrderHazards(context: LintRuleContext): LintFinding[] {
    const file = context.file;
    if (!file) {
        return [];
    }

    const findings: LintFinding[] = [];
    const codeLines = file.code.split(/\r?\n/);
    const lineStarts = file.lineStarts;

    codeLines.forEach((line, index) => {
        const hasMarketRoute =
            MARKET_ROUTE_PATTERN.test(line) || MARKET_ORDER_PATTERN.test(line);
        if (hasMarketRoute && !SIZE_PATTERN.test(line)) {
            const matchIndex = line.search(MARKET_ROUTE_PATTERN);
            const offset = (lineStarts[index] ?? 0) + Math.max(matchIndex, 0);
            findings.push({
                ruleId: "order-hazards",
                severity: "warning",
                message:
                    "Market order detected without an explicit size or quantity.",
                filePath: file.filePath,
                range: rangeFromOffset(file.lineStarts, offset, "MARKET".length),
            });
        }
    });

    const buyMatches = findMatches(/\bBUY\b/gi, file.code);
    const sellMatches = findMatches(/\bSELL\b/gi, file.code);

    if (buyMatches.length >= 2 && sellMatches.length === 0) {
        const match = buyMatches[1];
        findings.push({
            ruleId: "order-hazards",
            severity: "warning",
            message:
                "Repeated BUY commands detected without an exit or SELL pattern.",
            filePath: file.filePath,
            range: rangeFromOffset(file.lineStarts, match.index, match.length),
        });
    }

    if (sellMatches.length >= 2 && buyMatches.length === 0) {
        const match = sellMatches[1];
        findings.push({
            ruleId: "order-hazards",
            severity: "warning",
            message:
                "Repeated SELL commands detected without an exit or BUY pattern.",
            filePath: file.filePath,
            range: rangeFromOffset(file.lineStarts, match.index, match.length),
        });
    }

    if (
        (buyMatches.length > 0 || sellMatches.length > 0) &&
        !STOP_PATTERN.test(file.code)
    ) {
        const match = buyMatches[0] ?? sellMatches[0];
        if (match) {
            findings.push({
                ruleId: "order-hazards",
                severity: "warning",
                message:
                    "Order logic detected without an explicit STOP pattern.",
                filePath: file.filePath,
                range: rangeFromOffset(
                    file.lineStarts,
                    match.index,
                    match.length
                ),
            });
        }
    }

    return findings;
}

export const orderHazardsRule: LintRule = {
    id: "order-hazards",
    defaultSeverity: "warning",
    description: "Warns on risky order patterns such as market orders or missing stops.",
    rationale: "Order hazards can introduce unintended risk without clear exits.",
    message: "Order hazard detected.",
    scope: "file",
    run: runOrderHazards,
};
