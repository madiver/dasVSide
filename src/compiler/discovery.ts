import { promises as fs } from "fs";
import path from "path";
import { DiscoveryError } from "./errors";
import { CompileWarning } from "./types";

export interface OptionalConfigResult {
    paths: string[];
    warnings: string[];
}

export interface DiscoveryGuardrails {
    maxFiles?: number;
}

export interface WorkspaceDiscoveryOptions {
    maxFiles?: number;
    optionalConfigCandidates?: string[];
    ignoredDirs?: string[];
}

export interface WorkspaceDiscoveryResult {
    keymapPath: string;
    scriptPaths: string[];
    optionalConfigPaths: string[];
    warnings: CompileWarning[];
}

const DEFAULT_IGNORED_DIRS = new Set([
    ".git",
    ".specify",
    ".vscode",
    ".vscode-test",
    "node_modules",
    "out",
    "dist",
    "build",
]);

async function resolveKeymapPath(workspaceRoot: string): Promise<string> {
    const keymapPath = path.join(workspaceRoot, "keymap.yaml");
    try {
        await fs.access(keymapPath);
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        throw new DiscoveryError(
            "No keymap.yaml file was found at the workspace root.",
            `${keymapPath}: ${details}`,
            { sourcePath: keymapPath }
        );
    }

    const text = await fs.readFile(keymapPath, "utf8");
    if (!text.trim()) {
        throw new DiscoveryError(
            "keymap.yaml is empty. Add at least one entry before compiling.",
            keymapPath,
            { sourcePath: keymapPath }
        );
    }

    return keymapPath;
}

async function discoverScriptPaths(
    workspaceRoot: string,
    options: WorkspaceDiscoveryOptions
): Promise<string[]> {
    const ignored = new Set(DEFAULT_IGNORED_DIRS);
    for (const entry of options.ignoredDirs ?? []) {
        ignored.add(entry);
    }

    const scripts: string[] = [];
    const pending: string[] = [workspaceRoot];

    while (pending.length > 0) {
        const current = pending.pop();
        if (!current) {
            continue;
        }

        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (!ignored.has(entry.name)) {
                    pending.push(fullPath);
                }
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            if (entry.name.startsWith("._")) {
                continue;
            }

            if (entry.name.toLowerCase().endsWith(".das")) {
                scripts.push(fullPath);
            }
        }
    }

    const guarded = applyDiscoveryGuardrails(scripts, {
        maxFiles: options.maxFiles,
    });

    guarded.sort((a, b) => a.localeCompare(b));
    return guarded;
}

export async function discoverOptionalConfigs(
    workspaceRoot: string,
    candidates: string[]
): Promise<OptionalConfigResult> {
    const paths: string[] = [];
    const warnings: string[] = [];

    for (const candidate of candidates) {
        const resolved = path.isAbsolute(candidate)
            ? candidate
            : path.join(workspaceRoot, candidate);
        try {
            await fs.access(resolved);
            paths.push(resolved);
        } catch (error) {
            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "ENOENT"
            ) {
                continue;
            }
            const details = error instanceof Error ? error.message : String(error);
            warnings.push(`Optional config not readable: ${resolved} (${details})`);
        }
    }

    return { paths, warnings };
}

export function applyDiscoveryGuardrails(
    paths: string[],
    guardrails: DiscoveryGuardrails = {}
): string[] {
    const uniquePaths = Array.from(new Set(paths));
    if (guardrails.maxFiles && uniquePaths.length > guardrails.maxFiles) {
        throw new DiscoveryError(
            "Workspace contains more source files than the compiler allows.",
            `Found ${uniquePaths.length} files, limit is ${guardrails.maxFiles}.`
        );
    }
    return uniquePaths;
}

export async function discoverWorkspaceInputs(
    workspaceRoot: string,
    options: WorkspaceDiscoveryOptions = {}
): Promise<WorkspaceDiscoveryResult> {
    const keymapPath = await resolveKeymapPath(workspaceRoot);
    const scriptPaths = await discoverScriptPaths(workspaceRoot, options);

    if (scriptPaths.length === 0) {
        throw new DiscoveryError(
            "No .das source files were found in the workspace.",
            workspaceRoot
        );
    }

    const optionalConfigs = await discoverOptionalConfigs(
        workspaceRoot,
        options.optionalConfigCandidates ?? []
    );

    const warnings: CompileWarning[] = optionalConfigs.warnings.map(
        (message) => ({
            code: "OPTIONAL_CONFIG",
            message,
        })
    );

    return {
        keymapPath,
        scriptPaths,
        optionalConfigPaths: optionalConfigs.paths,
        warnings,
    };
}
