import { promises as fs } from "fs";
import path from "path";
import { CRLF } from "./formatRules";
import { FileWriteError } from "./errors";

function enforceCrlf(content: string): string {
    return content.replace(/\r?\n/g, CRLF);
}

function getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;
        return typeof code === "string" ? code : undefined;
    }
    return undefined;
}

async function safeUnlink(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (getErrorCode(error) !== "ENOENT") {
            throw error;
        }
    }
}

async function renameWithOverwrite(
    tempPath: string,
    outputPath: string
): Promise<void> {
    try {
        await fs.rename(tempPath, outputPath);
        return;
    } catch (error) {
        const code = getErrorCode(error);
        if (code !== "EEXIST" && code !== "EPERM") {
            throw error;
        }
    }

    await safeUnlink(outputPath);
    await fs.rename(tempPath, outputPath);
}

export async function writeHotkeyFile(
    outputPath: string,
    content: string
): Promise<void> {
    try {
        const normalized = enforceCrlf(content);
        const buffer = Buffer.from(normalized, "utf8");
        const directory = path.dirname(outputPath);
        const tempName = `.hotkey-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}.tmp`;
        const tempPath = path.join(directory, tempName);

        await fs.writeFile(tempPath, buffer);

        try {
            await renameWithOverwrite(tempPath, outputPath);
        } catch (error) {
            await safeUnlink(tempPath);
            throw error;
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new FileWriteError(
            "Unable to write the Hotkey file. Check the output path and permissions.",
            message
        );
    }
}
