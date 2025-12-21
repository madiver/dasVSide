import { promises as fs } from "fs";
import { CRLF } from "./formatRules";
import { FileWriteError } from "./errors";

function enforceCrlf(content: string): string {
    return content.replace(/\r?\n/g, CRLF);
}

export async function writeHotkeyFile(
    outputPath: string,
    content: string
): Promise<void> {
    try {
        const normalized = enforceCrlf(content);
        const buffer = Buffer.from(normalized, "utf8");
        await fs.writeFile(outputPath, buffer);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new FileWriteError(
            "Unable to write the Hotkey file. Check the output path and permissions.",
            message
        );
    }
}
