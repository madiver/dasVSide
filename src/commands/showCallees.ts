import * as path from "path";
import * as vscode from "vscode";
import { analyzeWorkspace } from "../dependency/analyzer";
import { GraphReport } from "../dependency/types";

interface CalleePickItem extends vscode.QuickPickItem {
    filePath: string;
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

export async function runShowCallees(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== "das") {
        vscode.window.showInformationMessage(
            "Open a .das file to find callees."
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
    const sourcePath = toRelativePath(
        workspaceRoot,
        editor.document.uri.fsPath
    );

    const edges = report.edges.filter((edge) => edge.from === sourcePath);
    if (edges.length === 0) {
        vscode.window.showInformationMessage("No callees found.");
        return;
    }

    const nodeMap = buildNodePathMap(report);
    const items: CalleePickItem[] = edges.map((edge) => {
        const targetPath = edge.to;
        const filePath = nodeMap.get(targetPath);
        return {
            label: targetPath,
            description: edge.type,
            filePath: filePath ?? targetPath,
        };
    });

    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a callee to open",
    });
    if (!selection) {
        return;
    }

    const document = await vscode.workspace.openTextDocument(selection.filePath);
    await vscode.window.showTextDocument(document);
}
