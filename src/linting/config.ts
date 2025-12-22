import * as vscode from "vscode";
import { LintConfig, RuleOverride } from "./types";

const DEFAULT_DEBOUNCE_MS = 400;
const DEFAULT_MAX_FILES = 200;
const DEFAULT_MAX_CHAIN_DEPTH = 8;

function normalizeOverride(value: unknown): RuleOverride | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "info" || normalized === "warning" || normalized === "error") {
        return normalized;
    }
    if (normalized === "off" || normalized === "disabled") {
        return "off";
    }
    return undefined;
}

export function loadLintConfig(): LintConfig {
    const config = vscode.workspace.getConfiguration("dasHotkeyTools");
    const enabled = config.get<boolean>("linting.enabled", true);
    const debounceMs = config.get<number>(
        "linting.debounceMs",
        DEFAULT_DEBOUNCE_MS
    );
    const maxFiles = config.get<number>("linting.maxFiles", DEFAULT_MAX_FILES);
    const maxChainDepth = config.get<number>(
        "linting.maxChainDepth",
        DEFAULT_MAX_CHAIN_DEPTH
    );
    const lintOnBuild = config.get<boolean>("linting.lintOnBuild", false);

    const rawOverrides =
        config.get<Record<string, unknown>>("linting.ruleOverrides") ?? {};

    const ruleOverrides: Record<string, RuleOverride> = {};
    for (const [ruleId, value] of Object.entries(rawOverrides)) {
        const override = normalizeOverride(value);
        if (override) {
            ruleOverrides[ruleId] = override;
        }
    }

    return {
        enabled,
        debounceMs,
        maxFiles,
        maxChainDepth,
        lintOnBuild,
        ruleOverrides,
    };
}
