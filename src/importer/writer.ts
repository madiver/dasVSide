import { promises as fs } from "fs";
import path from "path";
import { ImportConflictError, ImportWriteError } from "./errors";
import {
    ConflictInfo,
    ConflictStrategy,
    ImportResult,
    NamedHotkeyRecord,
} from "./types";

interface WriteTarget {
    targetPath: string;
    content: string;
    record?: NamedHotkeyRecord;
    kind: "script" | "keymap";
}

function getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;
        return typeof code === "string" ? code : undefined;
    }
    return undefined;
}

async function pathExists(targetPath: string): Promise<boolean> {
    try {
        await fs.stat(targetPath);
        return true;
    } catch (error) {
        if (getErrorCode(error) === "ENOENT") {
            return false;
        }
        throw error;
    }
}

function normalizeLineEndings(text: string): string {
    return text.replace(/\r\n|\r|\n/g, "\r\n");
}

async function writeTempFile(
    targetPath: string,
    content: string
): Promise<string> {
    const directory = path.dirname(targetPath);
    const tempName = `.import-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}.tmp`;
    const tempPath = path.join(directory, tempName);
    await fs.writeFile(tempPath, content, "utf8");
    return tempPath;
}

async function removeIfExists(targetPath: string): Promise<void> {
    try {
        await fs.unlink(targetPath);
    } catch (error) {
        if (getErrorCode(error) !== "ENOENT") {
            throw error;
        }
    }
}

async function backupExistingFile(targetPath: string): Promise<string | null> {
    if (!(await pathExists(targetPath))) {
        return null;
    }
    const backupPath = `${targetPath}.bak-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
    await fs.rename(targetPath, backupPath);
    return backupPath;
}

async function restoreBackup(
    targetPath: string,
    backupPath: string | null
): Promise<void> {
    if (!backupPath) {
        await removeIfExists(targetPath);
        return;
    }
    await removeIfExists(targetPath);
    await fs.rename(backupPath, targetPath);
}

/**
 * Detect existing destination files that would be overwritten by import.
 */
export async function findImportConflicts(
    destinationRoot: string,
    records: NamedHotkeyRecord[]
): Promise<ConflictInfo[]> {
    const scriptsDir = path.join(destinationRoot, "hotkeys");
    const keymapPath = path.join(destinationRoot, "keymap.yaml");
    const conflicts: ConflictInfo[] = [];

    if (await pathExists(keymapPath)) {
        conflicts.push({ path: keymapPath, type: "keymap" });
    }

    for (const record of records) {
        const scriptPath = path.join(scriptsDir, record.fileName);
        if (await pathExists(scriptPath)) {
            conflicts.push({
                path: scriptPath,
                type: "script",
                recordIndex: record.index,
                key: record.key,
                label: record.label,
            });
        }
    }

    return conflicts;
}

export function formatConflicts(conflicts: ConflictInfo[]): string {
    const lines = conflicts.map((conflict) => {
        const detail =
            conflict.recordIndex !== undefined
                ? `record ${conflict.recordIndex}`
                : "keymap";
        return `${conflict.path} (${detail})`;
    });
    return lines.join("\n");
}

/**
 * Write scripts and keymap.yaml to the destination workspace.
 */
export async function writeImportOutputs(
    destinationRoot: string,
    records: NamedHotkeyRecord[],
    keymapYaml: string,
    conflictStrategy: ConflictStrategy
): Promise<ImportResult> {
    const scriptsDir = path.join(destinationRoot, "hotkeys");
    const keymapPath = path.join(destinationRoot, "keymap.yaml");
    const conflicts = await findImportConflicts(destinationRoot, records);

    if (conflicts.length > 0 && conflictStrategy === "cancel") {
        throw new ImportConflictError(
            "Import canceled due to existing files.",
            `${conflicts.length} conflicting file(s) detected.`,
            { destinationPath: destinationRoot }
        );
    }

    if (conflicts.some((conflict) => conflict.type === "keymap")) {
        if (conflictStrategy === "skip") {
            throw new ImportConflictError(
                "keymap.yaml already exists at the destination.",
                "Skipping keymap.yaml is not supported.",
                { destinationPath: keymapPath }
            );
        }
    }

    const skippedScriptPaths: string[] = [];
    const scriptTargets: WriteTarget[] = records.map((record) => ({
        targetPath: path.join(scriptsDir, record.fileName),
        content: normalizeLineEndings(record.scriptText),
        record,
        kind: "script",
    }));

    const filteredScriptTargets =
        conflictStrategy === "skip"
            ? scriptTargets.filter((target) => {
                  const hasConflict = conflicts.some(
                      (conflict) =>
                          conflict.type === "script" &&
                          conflict.path === target.targetPath
                  );
                  if (hasConflict) {
                      skippedScriptPaths.push(target.targetPath);
                  }
                  return !hasConflict;
              })
            : scriptTargets;

    const targets: WriteTarget[] = [
        ...filteredScriptTargets,
        {
            targetPath: keymapPath,
            content: normalizeLineEndings(keymapYaml),
            kind: "keymap",
        },
    ];

    const backups = new Map<string, string | null>();
    const temps = new Map<string, string>();

    try {
        await fs.mkdir(scriptsDir, { recursive: true });

        for (const target of targets) {
            const tempPath = await writeTempFile(
                target.targetPath,
                target.content
            );
            temps.set(target.targetPath, tempPath);
        }

        if (conflictStrategy === "overwrite") {
            for (const target of targets) {
                const backup = await backupExistingFile(target.targetPath);
                backups.set(target.targetPath, backup);
            }
        }

        for (const target of targets) {
            const tempPath = temps.get(target.targetPath);
            if (!tempPath) {
                continue;
            }
            if (await pathExists(target.targetPath)) {
                await removeIfExists(target.targetPath);
            }
            await fs.rename(tempPath, target.targetPath);
        }

        for (const backup of backups.values()) {
            if (backup) {
                await removeIfExists(backup);
            }
        }
    } catch (error) {
        for (const [targetPath, tempPath] of temps.entries()) {
            await removeIfExists(tempPath);
            const backup = backups.get(targetPath) ?? null;
            await restoreBackup(targetPath, backup);
        }
        const details = error instanceof Error ? error.message : String(error);
        throw new ImportWriteError(
            "Unable to write imported hotkey files.",
            details,
            { destinationPath: destinationRoot }
        );
    }

    const writtenScriptPaths = filteredScriptTargets.map(
        (target) => target.targetPath
    );

    return {
        destinationRoot,
        scriptsDir,
        keymapPath,
        entries: records.map((record) => ({
            id: record.id,
            key: record.key,
            label: record.label,
            scriptPath: record.scriptPath,
        })),
        writtenScriptPaths,
        skippedScriptPaths,
        warnings: [],
    };
}
