import * as path from "path";
import * as vscode from "vscode";
import { analyzeWorkspace } from "../dependency/analyzer";
import { GraphReport } from "../dependency/types";

interface CallerPickItem extends vscode.QuickPickItem {
    filePath: string;
    range: vscode.Range;
}

function getWorkspaceRoot(): string {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        throw new Error("Open a workspace folder to use dependency navigation.");
    }
    return folders[0].uri.fsPath;
}

function toRelativePath(workspaceRoot: string, filePath: string): string {
    return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
}

function buildNodePathMap(report: GraphReport): Map<string, string> {
    const map = new Map<string, string>();
    for (const node of report.nodes) {
        map.set(node.path, node.filePath);
    }
    return map;
}

export async function runShowCallers(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== "das") {
        vscode.window.showInformationMessage(
            "Open a .das file to find callers."
        );
        return;
    }

    const workspaceRoot = getWorkspaceRoot();
    let report: GraphReport;
    try {
        report = await analyzeWorkspace({ useCache: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(
            `Unable to analyze dependencies: ${message}`
        );
        return;
    }
    const targetPath = toRelativePath(
        workspaceRoot,
        editor.document.uri.fsPath
    );

    const callers = report.edges
        .filter((edge) => edge.to === targetPath)
        .flatMap((edge) =>
            edge.locations.map((location) => ({
                from: edge.from,
                location,
            }))
        );

    if (callers.length === 0) {
        vscode.window.showInformationMessage("No callers found.");
        return;
    }

    const nodeMap = buildNodePathMap(report);
    const items: CallerPickItem[] = callers.map((entry) => {
        const relative = entry.from;
        const filePath = nodeMap.get(relative) ?? entry.location.filePath;
        const line = entry.location.range.start.line + 1;
        const character = entry.location.range.start.character + 1;
        return {
            label: relative,
            description: `Line ${line}, Col ${character}`,
            filePath,
            range: new vscode.Range(
                new vscode.Position(
                    entry.location.range.start.line,
                    entry.location.range.start.character
                ),
                new vscode.Position(
                    entry.location.range.end.line,
                    entry.location.range.end.character
                )
            ),
        };
    });

    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a caller to open",
    });
    if (!selection) {
        return;
    }

    const document = await vscode.workspace.openTextDocument(selection.filePath);
    const newEditor = await vscode.window.showTextDocument(document);
    newEditor.selection = new vscode.Selection(
        selection.range.start,
        selection.range.end
    );
    newEditor.revealRange(selection.range, vscode.TextEditorRevealType.InCenter);
}
