import * as vscode from "vscode";
import {
    getOutputChannel,
    logContext,
    logError,
    logOutput,
    logSuccess,
    logWarning,
} from "./outputChannel";
import { decodeHotkeyRecord } from "../importer/decoder";
import { ImporterError } from "../importer/errors";
import { selectImportInputs } from "../importer/inputs";
import { buildKeymapEntries, renderKeymapYaml } from "../importer/keymapWriter";
import { assignNames } from "../importer/naming";
import { parseHotkeyRecords } from "../importer/parser";
import { verifyRoundTrip } from "../importer/verify";
import {
    formatConflicts,
    findImportConflicts,
    writeImportOutputs,
} from "../importer/writer";
import { ConflictStrategy } from "../importer/types";

const OVERWRITE_OPTION = "Overwrite";
const SKIP_OPTION = "Skip";
const CANCEL_OPTION = "Cancel";
const VERIFY_OPTION = "Run verification";
const VERIFY_SKIP_OPTION = "Skip";

function reportImportError(error: unknown): void {
    const channel = getOutputChannel();
    let userMessage =
        "Hotkey import failed. Check the output for more details.";

    if (error instanceof ImporterError) {
        userMessage = error.userMessage;
        logContext({
            recordIndex: error.recordIndex,
            line: error.line,
            key: error.key,
            label: error.label,
            sourcePath: error.sourcePath,
            destinationPath: error.destinationPath,
        });
        if (error.message && error.message !== error.userMessage) {
            channel.appendLine(`[DETAIL] ${error.message}`);
        }
    } else if (error instanceof Error) {
        channel.appendLine(`[DETAIL] ${error.message}`);
    }

    logError(userMessage);
    vscode.window.showErrorMessage(userMessage);
}

async function promptForConflictResolution(
    conflictCount: number
): Promise<ConflictStrategy> {
    const choice = await vscode.window.showWarningMessage(
        `Destination contains ${conflictCount} existing file(s). Overwrite, skip, or cancel?`,
        { modal: true },
        OVERWRITE_OPTION,
        SKIP_OPTION,
        CANCEL_OPTION
    );

    if (choice === OVERWRITE_OPTION) {
        return "overwrite";
    }
    if (choice === SKIP_OPTION) {
        return "skip";
    }
    return "cancel";
}

async function maybeRunVerification(
    sourcePath: string,
    destinationRoot: string
): Promise<void> {
    const choice = await vscode.window.showInformationMessage(
        "Run round-trip verification now?",
        VERIFY_OPTION,
        VERIFY_SKIP_OPTION
    );

    if (choice !== VERIFY_OPTION) {
        return;
    }

    logOutput("Running round-trip verification.");
    const result = await verifyRoundTrip(sourcePath, destinationRoot);
    if (result.matched) {
        logSuccess("Round-trip verification passed.");
        vscode.window.showInformationMessage(
            "Round-trip verification passed."
        );
        return;
    }

    const summary = result.mismatchSummary ?? "Hotkey.htk contents differ.";
    logWarning(`Round-trip mismatch: ${summary}`);
    vscode.window.showWarningMessage(`Round-trip mismatch: ${summary}`);
}

export async function runImportHotkeyFile(): Promise<void> {
    const channel = getOutputChannel();
    channel.show(true);
    logOutput("Starting Hotkey import.");

    try {
        const selection = await selectImportInputs();
        if (!selection) {
            logOutput("Import canceled by user.");
            return;
        }

        const { sourcePath, destinationRoot, content } = selection;
        logOutput("Parsing Hotkey.htk records.");
        const parsedRecords = parseHotkeyRecords(content, sourcePath);
        logOutput(`Parsed ${parsedRecords.length} records.`);

        logOutput("Decoding hotkey scripts.");
        const decodedRecords = parsedRecords.map((record) =>
            decodeHotkeyRecord(record, {
                strictLength: false,
            })
        );

        logOutput("Assigning ids and filenames.");
        const namedRecords = assignNames(decodedRecords);

        logOutput("Generating keymap.yaml.");
        const entries = buildKeymapEntries(namedRecords);
        const keymapYaml = renderKeymapYaml(entries);

        const conflicts = await findImportConflicts(
            destinationRoot,
            namedRecords
        );
        let strategy: ConflictStrategy = "overwrite";
        if (conflicts.length > 0) {
            logWarning(
                `Detected ${conflicts.length} existing file(s) in destination.`
            );
            logOutput("Conflicting paths:");
            logOutput(formatConflicts(conflicts));
            strategy = await promptForConflictResolution(conflicts.length);
        }

        if (strategy === "cancel") {
            logOutput("Import canceled by user.");
            vscode.window.showInformationMessage(
                "Hotkey import canceled. No changes were made."
            );
            return;
        }

        const result = await writeImportOutputs(
            destinationRoot,
            namedRecords,
            keymapYaml,
            strategy
        );

        if (result.skippedScriptPaths.length > 0) {
            logWarning(
                `Skipped ${result.skippedScriptPaths.length} existing script file(s).`
            );
        }

        logSuccess(
            `Imported ${result.entries.length} hotkeys to ${destinationRoot}.`
        );
        vscode.window.showInformationMessage(
            `Hotkey import completed. ${result.entries.length} scripts created.`
        );

        await maybeRunVerification(sourcePath, destinationRoot);
    } catch (error) {
        reportImportError(error);
    }
}
