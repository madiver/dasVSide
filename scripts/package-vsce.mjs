import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

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
