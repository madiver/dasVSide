import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set([".git", ".vscode-test", "node_modules"]);

function removeAppleDoubleFiles(root) {
    const stack = [root];
    let removed = 0;

    while (stack.length > 0) {
        const current = stack.pop();
        const entries = readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name)) {
                    stack.push(join(current, entry.name));
                }
                continue;
            }
            if (!entry.name.startsWith("._")) {
                continue;
            }
            try {
                unlinkSync(join(current, entry.name));
                removed += 1;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`Failed to remove ${join(current, entry.name)}: ${message}`);
            }
        }
    }

    if (removed > 0) {
        console.log(`Removed ${removed} AppleDouble file(s).`);
    }
}

const vscePath = process.platform === "win32"
    ? join("node_modules", ".bin", "vsce.cmd")
    : join("node_modules", ".bin", "vsce");

if (!existsSync(vscePath)) {
    console.error("vsce not found. Run npm install before packaging.");
    process.exit(1);
}

const isWindows = process.platform === "win32";
const command = isWindows ? "cmd" : vscePath;
const args = isWindows ? ["/c", vscePath, "package"] : ["package"];

removeAppleDoubleFiles(process.cwd());

const result = spawnSync(command, args, {
    stdio: "inherit",
    env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
    },
});

if (result.error) {
    console.error(`Failed to run vsce: ${result.error.message}`);
    process.exit(1);
}

process.exit(result.status ?? 1);
