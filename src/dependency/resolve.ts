import path from "path";

export interface ScriptIndex {
    byFullPath: Map<string, string>;
    byRelativePath: Map<string, string[]>;
    byBaseName: Map<string, string[]>;
}

export interface ResolvedScriptPath {
    fullPath: string;
    relativePath: string;
}

function normalizePath(input: string): string {
    return input.replace(/\\/g, "/").toLowerCase();
}

export function normalizeRelativePath(input: string): string {
    return normalizePath(input);
}

export function normalizeKey(value: string): string {
    return value.trim().toLowerCase();
}

export function buildScriptIndex(
    scriptPaths: string[],
    workspaceRoot: string
): ScriptIndex {
    const byFullPath = new Map<string, string>();
    const byRelativePath = new Map<string, string[]>();
    const byBaseName = new Map<string, string[]>();

    for (const fullPath of scriptPaths) {
        const rel = path.relative(workspaceRoot, fullPath).replace(/\\/g, "/");
        const relKey = normalizeRelativePath(rel);
        const base = path.basename(fullPath);
        const baseNoExt = path.basename(fullPath, path.extname(fullPath));
        byFullPath.set(normalizePath(fullPath), fullPath);

        const relList = byRelativePath.get(relKey) ?? [];
        relList.push(fullPath);
        byRelativePath.set(relKey, relList);

        const baseKey = normalizeKey(base);
        const baseList = byBaseName.get(baseKey) ?? [];
        baseList.push(fullPath);
        byBaseName.set(baseKey, baseList);

        const baseNoExtKey = normalizeKey(baseNoExt);
        const baseNoExtList = byBaseName.get(baseNoExtKey) ?? [];
        baseNoExtList.push(fullPath);
        byBaseName.set(baseNoExtKey, baseNoExtList);
    }

    return { byFullPath, byRelativePath, byBaseName };
}

function toRelativePath(workspaceRoot: string, fullPath: string): string {
    return path.relative(workspaceRoot, fullPath).replace(/\\/g, "/");
}

export function resolveScriptPath(
    rawPath: string,
    index: ScriptIndex,
    workspaceRoot: string
): { result?: ResolvedScriptPath; warning?: string } {
    const trimmed = rawPath.trim();
    if (!trimmed) {
        return { warning: "Empty script path reference." };
    }

    const normalized = normalizePath(trimmed);
    const noExt = normalized.replace(/\.das$/i, "");
    const matches: string[] = [];

    if (path.isAbsolute(trimmed)) {
        const full = index.byFullPath.get(normalized);
        if (full) {
            matches.push(full);
        }
    } else {
        const relMatches = index.byRelativePath.get(normalized);
        if (relMatches) {
            matches.push(...relMatches);
        }
        const relNoExtMatches = index.byRelativePath.get(noExt);
        if (relNoExtMatches) {
            matches.push(...relNoExtMatches);
        }
    }

    if (matches.length === 0) {
        const baseMatches = index.byBaseName.get(normalizeKey(trimmed)) ?? [];
        const baseNoExtMatches = index.byBaseName.get(
            normalizeKey(trimmed.replace(/\.das$/i, ""))
        ) ?? [];
        matches.push(...baseMatches, ...baseNoExtMatches);
    }

    const unique = Array.from(new Set(matches));
    if (unique.length === 1) {
        const fullPath = unique[0];
        return {
            result: {
                fullPath,
                relativePath: toRelativePath(workspaceRoot, fullPath),
            },
        };
    }

    if (unique.length === 0) {
        return { warning: `No .das file matches "${rawPath}".` };
    }

    return {
        warning: `Ambiguous matches for "${rawPath}": ${unique
            .map((entry) => toRelativePath(workspaceRoot, entry))
            .join(", ")}.`,
    };
}
