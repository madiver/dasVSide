import * as vscode from "vscode";

const CHANNEL_NAME = "DAS Trader Hotkey Tools";
let sharedChannel: vscode.OutputChannel | undefined;

export interface OutputContext {
    id?: string;
    key?: string;
    label?: string;
    recordIndex?: number;
    line?: number;
    sourcePath?: string;
    destinationPath?: string;
}

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

export function logWarning(message: string): void {
    const channel = getOutputChannel();
    channel.appendLine(`[WARN] ${message}`);
}

export function logError(message: string): void {
    const channel = getOutputChannel();
    channel.appendLine(`[ERROR] ${message}`);
}

export function logContext(context: OutputContext): void {
    const parts: string[] = [];
    if (context.recordIndex !== undefined) {
        parts.push(`record=${context.recordIndex}`);
    }
    if (context.line !== undefined) {
        parts.push(`line=${context.line}`);
    }
    if (context.id) {
        parts.push(`id=${context.id}`);
    }
    if (context.key) {
        parts.push(`key=${context.key}`);
    }
    if (context.label) {
        parts.push(`label=${context.label}`);
    }
    if (context.sourcePath) {
        parts.push(`source=${context.sourcePath}`);
    }
    if (context.destinationPath) {
        parts.push(`dest=${context.destinationPath}`);
    }
    if (parts.length > 0) {
        const channel = getOutputChannel();
        channel.appendLine(`[CONTEXT] ${parts.join(" | ")}`);
    }
}

export function logSuccess(message: string): void {
    const channel = getOutputChannel();
    channel.appendLine(`[SUCCESS] ${message}`);
}
