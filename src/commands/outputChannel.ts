import * as vscode from "vscode";

const CHANNEL_NAME = "DAS Hotkey Tools";

let sharedChannel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
    if (!sharedChannel) {
        sharedChannel = vscode.window.createOutputChannel(CHANNEL_NAME);
    }

    return sharedChannel;
}

export function logOutput(message: string): void {
    const channel = getOutputChannel();
    channel.appendLine(message);
}

export function logSuccess(message: string): void {
    const channel = getOutputChannel();
    channel.appendLine(`[SUCCESS] ${message}`);
}
