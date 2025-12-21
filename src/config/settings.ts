import * as vscode from "vscode";
import { ConfigurationError } from "../compiler/errors";

export interface ExtensionSettings {
    outputPath: string;
    templateVariables: Record<string, string>;
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

export function loadSettings(): ExtensionSettings {
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

    return { outputPath, templateVariables };
}
