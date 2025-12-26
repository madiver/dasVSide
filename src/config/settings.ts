import * as vscode from "vscode";
import path from "path";
import { ConfigurationError } from "../compiler/errors";

export interface ExtensionSettings {
    outputPath: string;
    templateVariables: Record<string, string>;
    liveAccount?: string;
    simulatedAccount?: string;
}

function normalizeTemplateVariables(
    rawVariables: Record<string, unknown>
): Record<string, string> {
    const templateVariables: Record<string, string> = {};

    for (const [key, value] of Object.entries(rawVariables)) {
        if (typeof value !== "string") {
            throw new ConfigurationError(
                "Template variables must only contain string values."
            );
        }
        templateVariables[key] = value;
    }

    return templateVariables;
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

    if (!outputPath) {
        throw new ConfigurationError(
            "Output path is required. Set dasHotkeyTools.outputPath in settings."
        );
    }

    const rawVariables =
        config.get<Record<string, unknown>>("templateVariables") ?? {};

    if (Array.isArray(rawVariables) || rawVariables === null) {
        throw new ConfigurationError(
            "Template variables must be an object of string values."
        );
    }

    const templateVariables = normalizeTemplateVariables(rawVariables);

    const resolvedOutputPath = resolveOutputPath(outputPath, workspaceRoot);
    const liveAccount = readUserSetting(config, "liveAccount");
    const simulatedAccount = readUserSetting(config, "simulatedAccount");

    return {
        outputPath: resolvedOutputPath,
        templateVariables,
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
