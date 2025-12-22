import { LintRule } from "../types";
import { controlFlowRule } from "./controlFlow";
import { dangerousCommandsRule } from "./dangerousCommands";
import { execHotkeyGraphRule } from "./execHotkeyGraph";
import { objectUsageRule } from "./objectUsage";
import { orderHazardsRule } from "./orderHazards";
import { structureRule } from "./structure";

export function getLintRules(): LintRule[] {
    return [
        dangerousCommandsRule,
        orderHazardsRule,
        controlFlowRule,
        objectUsageRule,
        structureRule,
        execHotkeyGraphRule,
    ];
}
