import { rangeFromOffset } from "../scanner";
import { LintFinding, LintRule, LintRuleContext } from "../types";

function runStructureRules(context: LintRuleContext): LintFinding[] {
    const { workspace } = context;
    const findings: LintFinding[] = [];

    const primaryFile = workspace.scripts[0];
    if (!workspace.keymapPresent && primaryFile) {
        findings.push({
            ruleId: "structure-maintenance",
            severity: "info",
            message:
                "keymap.yaml is missing; script references cannot be fully validated.",
            filePath: primaryFile.filePath,
            range: rangeFromOffset(primaryFile.lineStarts, 0, 1),
        });
    }

    for (const duplicate of workspace.keymapDuplicates) {
        const entry = workspace.scriptIndex.get(duplicate);
        const filePath = entry?.filePath ?? primaryFile?.filePath;
        const lineStarts = entry
            ? workspace.scripts.find((script) => script.filePath === entry.filePath)
                  ?.lineStarts
            : primaryFile?.lineStarts;
        if (filePath && lineStarts) {
            findings.push({
                ruleId: "structure-maintenance",
                severity: "info",
                message: `Duplicate keymap entry detected for ${duplicate}.`,
                filePath,
                range: rangeFromOffset(lineStarts, 0, 1),
            });
        }
    }

    for (const [key, entry] of workspace.scriptIndex.entries()) {
        const script = workspace.scripts.find(
            (candidate) => candidate.filePath === entry.filePath
        );
        if (!script) {
            continue;
        }

        if (!entry.referencedByKeymap) {
            findings.push({
                ruleId: "structure-maintenance",
                severity: "info",
                message: `Script ${entry.scriptName} is not referenced by keymap.yaml.`,
                filePath: entry.filePath,
                range: rangeFromOffset(script.lineStarts, 0, 1),
            });
        }

        if (!entry.referencedByKeymap && !entry.referencedByExecHotkey) {
            findings.push({
                ruleId: "structure-maintenance",
                severity: "info",
                message: `Script ${entry.scriptName} is not referenced by keymap.yaml or ExecHotkey.`,
                filePath: entry.filePath,
                range: rangeFromOffset(script.lineStarts, 0, 1),
            });
        }
    }

    return findings;
}

export const structureRule: LintRule = {
    id: "structure-maintenance",
    defaultSeverity: "info",
    description: "Flags scripts missing references or duplicate keymap entries.",
    rationale: "Structural drift makes large workspaces harder to maintain.",
    message: "Structural maintenance issue detected.",
    scope: "workspace",
    run: runStructureRules,
};
