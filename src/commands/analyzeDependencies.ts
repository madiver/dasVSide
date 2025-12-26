import * as vscode from "vscode";
import { analyzeWorkspace } from "../dependency/analyzer";
import {
    getOutputChannel,
    logError,
    logOutput,
    logSuccess,
    logWarning,
} from "./outputChannel";

function formatFindings(list: string[]): string {
    return list.length === 0 ? "none" : list.join(", ");
}

export async function runAnalyzeDependencies(): Promise<void> {
    const channel = getOutputChannel();
    channel.show(true);
    logOutput("Starting dependency analysis.");

    try {
        const report = await analyzeWorkspace({ useCache: false });

        if (report.warnings.length > 0) {
            report.warnings.forEach((warning) => logWarning(warning));
        }

        logOutput(
            `Graph contains ${report.nodes.length} script(s) and ${report.edges.length} edge(s).`
        );

        const cycleFindings = report.findings.filter(
            (finding) => finding.type === "cycle"
        );
        const deadFindings = report.findings.filter(
            (finding) => finding.type === "deadScript"
        );
        const missingFindings = report.findings.filter(
            (finding) => finding.type === "missingReference"
        );

        if (cycleFindings.length > 0) {
            logWarning(`Detected ${cycleFindings.length} cycle(s).`);
            cycleFindings.forEach((finding) => {
                logWarning(finding.message);
            });
        }

        if (deadFindings.length > 0) {
            logWarning(`Detected ${deadFindings.length} unused script(s).`);
            deadFindings.forEach((finding) => {
                logWarning(finding.message);
            });
        }

        if (missingFindings.length > 0) {
            logWarning(
                `Detected ${missingFindings.length} unresolved reference(s).`
            );
            missingFindings.forEach((finding) => {
                const details = finding.sourcePath
                    ? `${finding.message} (source: ${finding.sourcePath})`
                    : finding.message;
                logWarning(details);
            });
        }

        logSuccess(
            `Analysis complete. Cycles: ${cycleFindings.length}; Unused: ${deadFindings.length}; Missing: ${missingFindings.length}.`
        );
        vscode.window.showInformationMessage(
            `Dependency analysis complete (${formatFindings(
                cycleFindings.map((finding) => finding.message)
            )}).`
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logError(`Dependency analysis failed: ${message}`);
        vscode.window.showErrorMessage(
            "Dependency analysis failed. Check the output for details."
        );
    }
}
