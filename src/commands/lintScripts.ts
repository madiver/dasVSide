import * as vscode from "vscode";
import { getLintController } from "../linting/diagnostics";
import { getOutputChannel } from "./outputChannel";

export async function runLintScripts(): Promise<void> {
    const controller = getLintController();
    if (!controller) {
        vscode.window.showErrorMessage(
            "Linting is not available. Reload the window and try again."
        );
        return;
    }

    const channel = getOutputChannel();
    channel.show(true);
    channel.appendLine("Running DAS linting...");

    const findings = await controller.runWorkspaceLint();
    if (findings === 0) {
        vscode.window.showInformationMessage("Linting complete: no issues found.");
        channel.appendLine("Linting complete: no issues found.");
        return;
    }

    vscode.window.showWarningMessage(
        `Linting complete: ${findings} issue(s) found.`
    );
    channel.appendLine(`Linting complete: ${findings} issue(s) found.`);
}
