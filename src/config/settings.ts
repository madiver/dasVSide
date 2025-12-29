import * as vscode from "vscode";
import path from "path";
import { ConfigurationError } from "../compiler/errors";

export interface ExtensionSettings {
    outputPath: string;
    appendTimestampToOutput: boolean;
    liveAccount?: string;
    simulatedAccount?: string;
}

function resolveOutputPath(
    value: string,
    workspaceRoot?: string
): string {
    if (path.isAbsolute(value)) {
        return value;
    }
    if (workspaceRoot) {
        return path.join(workspaceRoot, value);
    }
    return value;
}

export function loadSettings(workspaceRoot?: string): ExtensionSettings {
    const config = vscode.workspace.getConfiguration("dasHotkeyTools");
    const outputPath = config.get<string>("outputPath", "").trim();
    const appendTimestampToOutput = config.get<boolean>(
        "appendTimestampToOutput",
        false
    );

    if (!outputPath) {
        throw new ConfigurationError(
            "Output path is required. Set dasHotkeyTools.outputPath in settings."
        );
    }

    const resolvedOutputPath = resolveOutputPath(outputPath, workspaceRoot);
    const liveAccount = readUserSetting(config, "liveAccount");
    const simulatedAccount = readUserSetting(config, "simulatedAccount");

    return {
        outputPath: resolvedOutputPath,
        appendTimestampToOutput,
        liveAccount,
        simulatedAccount,
    };
}

function readUserSetting(
    config: vscode.WorkspaceConfiguration,
    key: string
): string | undefined {
    const inspected = config.inspect<string>(key);
    const raw = inspected?.globalValue ?? inspected?.defaultValue ?? "";
    if (typeof raw !== "string") {
        return undefined;
    }
    const trimmed = raw.trim();
    return trimmed ? trimmed : undefined;
}
