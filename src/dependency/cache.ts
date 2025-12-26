import { promises as fs } from "fs";
import { GraphReport } from "./types";

interface CacheEntry {
    snapshot: Map<string, number>;
    report: GraphReport;
}

async function buildSnapshot(paths: string[]): Promise<Map<string, number>> {
    const snapshot = new Map<string, number>();
    for (const filePath of paths) {
        try {
            const stats = await fs.stat(filePath);
            snapshot.set(filePath, stats.mtimeMs);
        } catch {
            snapshot.set(filePath, 0);
        }
    }
    return snapshot;
}

function snapshotsMatch(a: Map<string, number>, b: Map<string, number>): boolean {
    if (a.size !== b.size) {
        return false;
    }
    for (const [key, value] of a.entries()) {
        if (b.get(key) !== value) {
            return false;
        }
    }
    return true;
}

export class DependencyAnalysisCache {
    private entries = new Map<string, CacheEntry>();

    async get(
        workspaceRoot: string,
        filePaths: string[]
    ): Promise<GraphReport | undefined> {
        const entry = this.entries.get(workspaceRoot);
        if (!entry) {
            return undefined;
        }
        const snapshot = await buildSnapshot(filePaths);
        if (snapshotsMatch(entry.snapshot, snapshot)) {
            return entry.report;
        }
        return undefined;
    }

    async set(
        workspaceRoot: string,
        filePaths: string[],
        report: GraphReport
    ): Promise<void> {
        const snapshot = await buildSnapshot(filePaths);
        this.entries.set(workspaceRoot, { snapshot, report });
    }
}
