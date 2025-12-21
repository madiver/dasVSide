// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { runBuildHotkeyFile } from "./commands/buildHotkeyFile";
import { runPlaceholderCommand } from "./commands/placeholderCommand";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log("DAS Hotkey Tools extension activated.");

    const placeholderDisposable = vscode.commands.registerCommand(
        "dasHotkeyTools.placeholderCommand",
        runPlaceholderCommand
    );

    const buildDisposable = vscode.commands.registerCommand(
        "dasHotkeyTools.buildHotkeyFile",
        runBuildHotkeyFile
    );

    context.subscriptions.push(placeholderDisposable, buildDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
