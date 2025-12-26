// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { runBuildHotkeyFile } from "./commands/buildHotkeyFile";
import { runImportHotkeyFile } from "./commands/importHotkeyFile";
import { runLintScripts } from "./commands/lintScripts";
import { ExecHotkeySymbolProvider } from "./language/execHotkeySymbolProvider";
import { registerLinting } from "./linting/diagnostics";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log("DAS Hotkey Tools extension activated.");

    registerLinting(context);

    const dasSymbolProvider = vscode.languages.registerDocumentSymbolProvider(
        { language: "das", scheme: "file" },
        new ExecHotkeySymbolProvider()
    );

    const buildDisposable = vscode.commands.registerCommand(
        "dasHotkeyTools.buildHotkeyFile",
        runBuildHotkeyFile
    );

    const lintDisposable = vscode.commands.registerCommand(
        "dasHotkeyTools.lintScripts",
        runLintScripts
    );

    const importDisposable = vscode.commands.registerCommand(
        "dasHotkeyTools.importHotkeyFile",
        runImportHotkeyFile
    );

    context.subscriptions.push(
        dasSymbolProvider,
        buildDisposable,
        lintDisposable,
        importDisposable
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
