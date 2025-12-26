import * as vscode from "vscode";
import { analyzeWorkspace } from "../dependency/analyzer";
import { GraphReport, ScriptNode } from "../dependency/types";

type TreeItemKind = "script" | "group" | "reference";

class DependencyTreeItem extends vscode.TreeItem {
    constructor(
        public readonly kind: TreeItemKind,
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly scriptPath?: string
    ) {
        super(label, collapsibleState);
    }
}

export class DependencyTreeProvider
    implements vscode.TreeDataProvider<DependencyTreeItem>, vscode.Disposable
{
    private readonly emitter = new vscode.EventEmitter<
        DependencyTreeItem | undefined
    >();
    readonly onDidChangeTreeData = this.emitter.event;
    private report: GraphReport | undefined;

    dispose(): void {
        this.emitter.dispose();
    }

    refresh(): void {
        this.report = undefined;
        this.emitter.fire(undefined);
    }

    getTreeItem(element: DependencyTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(
        element?: DependencyTreeItem
    ): Promise<DependencyTreeItem[]> {
        if (!this.report) {
            try {
                this.report = await analyzeWorkspace({ useCache: true });
            } catch {
                return [
                    new DependencyTreeItem(
                        "group",
                        "Unable to analyze dependencies",
                        vscode.TreeItemCollapsibleState.None
                    ),
                ];
            }
        }

        const report = this.report;
        if (report.nodes.length === 0) {
            return [
                new DependencyTreeItem(
                    "group",
                    "No scripts found",
                    vscode.TreeItemCollapsibleState.None
                ),
            ];
        }

        if (!element) {
            return report.nodes.map((node) => {
                const item = new DependencyTreeItem(
                    "script",
                    node.path,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    node.path
                );
                item.command = {
                    command: "vscode.open",
                    title: "Open Script",
                    arguments: [vscode.Uri.file(node.filePath)],
                };
                return item;
            });
        }

        if (element.kind === "script" && element.scriptPath) {
            const callersGroup = new DependencyTreeItem(
                "group",
                "Callers",
                vscode.TreeItemCollapsibleState.Collapsed,
                element.scriptPath
            );
            callersGroup.contextValue = "callersGroup";
            const calleesGroup = new DependencyTreeItem(
                "group",
                "Callees",
                vscode.TreeItemCollapsibleState.Collapsed,
                element.scriptPath
            );
            calleesGroup.contextValue = "calleesGroup";
            return [callersGroup, calleesGroup];
        }

        if (element.kind === "group" && element.scriptPath) {
            if (element.label === "Callers") {
                return buildReferenceItems(
                    report,
                    element.scriptPath,
                    "callers"
                );
            }
            if (element.label === "Callees") {
                return buildReferenceItems(
                    report,
                    element.scriptPath,
                    "callees"
                );
            }
        }

        return [];
    }
}

function buildReferenceItems(
    report: GraphReport,
    scriptPath: string,
    mode: "callers" | "callees"
): DependencyTreeItem[] {
    const items: DependencyTreeItem[] = [];
    const byPath = new Map<string, ScriptNode>();
    report.nodes.forEach((node) => byPath.set(node.path, node));

    if (mode === "callers") {
        const callers = report.edges
            .filter((edge) => edge.to === scriptPath)
            .map((edge) => edge.from);
        for (const caller of new Set(callers)) {
            const node = byPath.get(caller);
            const label = node?.path ?? caller;
            const item = new DependencyTreeItem(
                "reference",
                label,
                vscode.TreeItemCollapsibleState.None
            );
            if (node) {
                item.command = {
                    command: "vscode.open",
                    title: "Open Script",
                    arguments: [vscode.Uri.file(node.filePath)],
                };
            }
            items.push(item);
        }
    } else {
        const callees = report.edges
            .filter((edge) => edge.from === scriptPath)
            .map((edge) => edge.to);
        for (const callee of new Set(callees)) {
            const node = byPath.get(callee);
            const label = node?.path ?? callee;
            const item = new DependencyTreeItem(
                "reference",
                label,
                vscode.TreeItemCollapsibleState.None
            );
            if (node) {
                item.command = {
                    command: "vscode.open",
                    title: "Open Script",
                    arguments: [vscode.Uri.file(node.filePath)],
                };
            }
            items.push(item);
        }
    }

    if (items.length === 0) {
        items.push(
            new DependencyTreeItem(
                "reference",
                "None",
                vscode.TreeItemCollapsibleState.None
            )
        );
    }

    return items;
}

export function registerDependencyTreeView(): vscode.Disposable {
    const provider = new DependencyTreeProvider();
    const treeDisposable = vscode.window.registerTreeDataProvider(
        "dasHotkeyTools.dependencyTree",
        provider
    );
    return vscode.Disposable.from(provider, treeDisposable);
}
