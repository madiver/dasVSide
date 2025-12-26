import * as vscode from "vscode";
import { promises as fs } from "fs";
import { ImportInputError } from "./errors";
import { ImportSelection } from "./types";

const HEADER_PATTERN = /^[^:\r\n]*:[^:\r\n]+:~\s+\d+:/;

function getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;
        return typeof code === "string" ? code : undefined;
    }
    return undefined;
}

function findHeaderLine(content: string): string | undefined {
    const lines = content.split(/\r\n|\n|\r/);
    return lines.find((line) => HEADER_PATTERN.test(line));
}

async function assertReadableFile(sourcePath: string): Promise<void> {
    try {
        const stats = await fs.stat(sourcePath);
        if (!stats.isFile()) {
            throw new ImportInputError(
                "Hotkey source is not a file.",
                sourcePath,
                { sourcePath }
            );
        }
    } catch (error) {
        const code = getErrorCode(error);
        if (code === "ENOENT") {
            throw new ImportInputError(
                "Hotkey source file does not exist.",
                sourcePath,
                { sourcePath }
            );
        }
        const details = error instanceof Error ? error.message : String(error);
        throw new ImportInputError(
            "Unable to read the Hotkey source file.",
            details,
            { sourcePath }
        );
    }
}

/**
 * Prompt the user for the Hotkey.htk source and destination folder.
 */
export async function selectImportInputs(): Promise<ImportSelection | null> {
    const sourcePick = await vscode.window.showOpenDialog({
        title: "Select Hotkey.htk to import",
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { "Hotkey Files": ["htk"] },
    });
    if (!sourcePick || sourcePick.length === 0) {
        return null;
    }

    const sourcePath = sourcePick[0].fsPath;
    await assertReadableFile(sourcePath);

    let content = "";
    try {
        content = await fs.readFile(sourcePath, "utf8");
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        throw new ImportInputError(
            "Unable to read the Hotkey source file.",
            details,
            { sourcePath }
        );
    }

    if (!content.trim()) {
        throw new ImportInputError(
            "Hotkey.htk is empty.",
            sourcePath,
            { sourcePath }
        );
    }

    const headerLine = findHeaderLine(content);
    if (!headerLine) {
        throw new ImportInputError(
            "Hotkey.htk does not appear to contain any hotkey records.",
            "Expected a line formatted as Key:Label:~ length:encodedScript.",
            { sourcePath }
        );
    }

    const destinationPick = await vscode.window.showOpenDialog({
        title: "Select destination workspace folder",
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
    });
    if (!destinationPick || destinationPick.length === 0) {
        return null;
    }

    const destinationRoot = destinationPick[0].fsPath;
    return { sourcePath, destinationRoot, content };
}
