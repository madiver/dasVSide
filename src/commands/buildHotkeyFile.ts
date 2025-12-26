import * as vscode from "vscode";
import { promises as fs } from "fs";
import { loadSettings } from "../config/settings";
import { compileHotkeys } from "../compiler/compileHotkeys";
import { getOutputChannel, logOutput, logSuccess } from "./outputChannel";
import { PLACEHOLDER_LABELS, PLACEHOLDER_TOKENS } from "../compiler/placeholders";
import {
    ConfigurationError,
    HotkeyToolsError,
    ValidationError,
} from "../compiler/errors";
import { loadLintConfig } from "../linting/config";
import { getLintController } from "../linting/diagnostics";
import { PlaceholderWarning } from "../compiler/types";

const OVERWRITE_OPTION = "Overwrite";

function getWorkspaceRoot(): string {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        throw new ConfigurationError(
            "Open a workspace folder before building the Hotkey file."
        );
    }
    return folders[0].uri.fsPath;
}

async function confirmOverwrite(outputPath: string): Promise<boolean> {
    try {
        await fs.stat(outputPath);
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return true;
        }
        const details = error instanceof Error ? error.message : String(error);
        throw new ValidationError(
            "Unable to access the output path to check for an existing file.",
            details
        );
    }

    const choice = await vscode.window.showWarningMessage(
        `Hotkey file already exists at ${outputPath}. Overwrite it?`,
        { modal: true },
        OVERWRITE_OPTION
    );

    return choice === OVERWRITE_OPTION;
}

function reportError(error: unknown): void {
    const channel = getOutputChannel();
    let userMessage = "Hotkey build failed. Check the output for details.";

    if (error instanceof HotkeyToolsError) {
        userMessage = error.userMessage;
        if (error.id || error.key || error.sourcePath) {
            const parts: string[] = [];
            if (error.id) {
                parts.push(`id=${error.id}`);
            }
            if (error.key) {
                parts.push(`key=${error.key}`);
            }
            if (error.sourcePath) {
                parts.push(`path=${error.sourcePath}`);
            }
            channel.appendLine(`[CONTEXT] ${parts.join(" | ")}`);
        }
        if (error.message && error.message !== error.userMessage) {
            channel.appendLine(`[DETAIL] ${error.message}`);
        }
    } else if (error instanceof Error) {
        channel.appendLine(`[DETAIL] ${error.message}`);
    }

    channel.appendLine(`[ERROR] ${userMessage}`);
    vscode.window.showErrorMessage(userMessage);
}

function logPlaceholderWarnings(
    warnings: PlaceholderWarning[] | undefined
): void {
    if (!warnings || warnings.length === 0) {
        return;
    }
    const channel = getOutputChannel();
    for (const warning of warnings) {
        if (warning.affectedScripts.length === 0) {
            continue;
        }
        const label = PLACEHOLDER_LABELS[warning.placeholder];
        const token = PLACEHOLDER_TOKENS[warning.placeholder];
        channel.appendLine(
            `Affected scripts for ${label} (${token}):`
        );
        for (const script of warning.affectedScripts) {
            channel.appendLine(`- ${script}`);
        }
    }
}

export async function runBuildHotkeyFile(): Promise<void> {
    const channel = getOutputChannel();
    channel.show(true);
    logOutput("Starting Hotkey file build.");

    try {
        logOutput("Loading settings.");
        const workspaceRoot = getWorkspaceRoot();
        const settings = loadSettings(workspaceRoot);

        const lintConfig = loadLintConfig();
        if (lintConfig.enabled && lintConfig.lintOnBuild) {
            logOutput("Running advisory linting before build.");
            try {
                const controller = getLintController();
                if (controller) {
                    const findings = await controller.runWorkspaceLint();
                    logOutput(
                        `Linting completed with ${findings} issue(s) (warnings only).`
                    );
                } else {
                    logOutput("Linting controller not available.");
                }
            } catch (lintError) {
                const details =
                    lintError instanceof Error
                        ? lintError.message
                        : String(lintError);
                logOutput(`Linting skipped due to error: ${details}`);
            }
        }

        logOutput("Checking output path for overwrite.");
        const shouldWrite = await confirmOverwrite(settings.outputPath);
        if (!shouldWrite) {
            logOutput("Build canceled by user.");
            vscode.window.showInformationMessage(
                "Hotkey build canceled. Existing file was not overwritten."
            );
            return;
        }

        logOutput("Compiling Hotkey file.");
        const result = await compileHotkeys({
            workspaceRoot,
            outputPath: settings.outputPath,
            placeholderValues: {
                liveAccount: settings.liveAccount,
                simulatedAccount: settings.simulatedAccount,
            },
        });

        if (result.warnings.length > 0) {
            logOutput(
                `Compilation completed with ${result.warnings.length} warning(s).`
            );
            result.warnings.forEach((warning) => {
                const details = warning.sourcePath
                    ? `${warning.message} (${warning.sourcePath})`
                    : warning.message;
                channel.appendLine(`[WARN] ${details}`);
            });
            logPlaceholderWarnings(result.placeholderWarnings);
        }

        logSuccess(`Hotkey file generated at ${settings.outputPath}`);
        vscode.window.showInformationMessage(
            `Hotkey file generated: ${settings.outputPath}`
        );
    } catch (error) {
        reportError(error);
    }
}
