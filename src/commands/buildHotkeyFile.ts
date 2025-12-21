import * as vscode from "vscode";
import { promises as fs } from "fs";
import { loadSettings } from "../config/settings";
import { HOTKEY_TEMPLATE_TEXT } from "../templates/hotkeyTemplates";
import { renderTemplate } from "../compiler/renderer";
import { validateRenderedOutput } from "../compiler/validator";
import { writeHotkeyFile } from "../compiler/writer";
import { getOutputChannel, logOutput } from "./outputChannel";
import {
    ConfigurationError,
    HotkeyToolsError,
    ValidationError,
} from "../compiler/errors";

const OVERWRITE_OPTION = "Overwrite";

async function ensureWorkspaceInputs(): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        throw new ConfigurationError(
            "Open a workspace folder before building the Hotkey file."
        );
    }

    const dasFiles = await vscode.workspace.findFiles(
        "**/*.das",
        "**/{node_modules,.git}/**",
        1
    );
    if (dasFiles.length === 0) {
        throw new ValidationError(
            "No .das source files were found in the workspace."
        );
    }

    const keymapFiles = await vscode.workspace.findFiles(
        "**/keymap.yaml",
        "**/{node_modules,.git}/**",
        1
    );
    if (keymapFiles.length === 0) {
        throw new ValidationError(
            "No keymap.yaml file was found in the workspace."
        );
    }
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
        if (error.message && error.message !== error.userMessage) {
            channel.appendLine(`[DETAIL] ${error.message}`);
        }
    } else if (error instanceof Error) {
        channel.appendLine(`[DETAIL] ${error.message}`);
    }

    channel.appendLine(`[ERROR] ${userMessage}`);
    vscode.window.showErrorMessage(userMessage);
}

export async function runBuildHotkeyFile(): Promise<void> {
    const channel = getOutputChannel();
    channel.show(true);
    logOutput("Starting Hotkey file build.");

    try {
        logOutput("Loading settings.");
        const settings = loadSettings();
        logOutput("Validating workspace inputs.");
        await ensureWorkspaceInputs();

        logOutput("Rendering templates.");
        const rendered = renderTemplate(
            HOTKEY_TEMPLATE_TEXT,
            settings.templateVariables
        );
        logOutput("Validating generated output.");
        validateRenderedOutput(rendered, { templateText: HOTKEY_TEMPLATE_TEXT });

        logOutput("Checking output path for overwrite.");
        const shouldWrite = await confirmOverwrite(settings.outputPath);
        if (!shouldWrite) {
            logOutput("Build canceled by user.");
            vscode.window.showInformationMessage(
                "Hotkey build canceled. Existing file was not overwritten."
            );
            return;
        }

        logOutput("Writing Hotkey file to disk.");
        await writeHotkeyFile(settings.outputPath, rendered);

        logOutput(`Hotkey file generated at ${settings.outputPath}`);
        vscode.window.showInformationMessage(
            `Hotkey file generated: ${settings.outputPath}`
        );
    } catch (error) {
        reportError(error);
    }
}
