import * as vscode from "vscode";
import { lintWorkspace } from "./engine";
import { loadLintConfig } from "./config";
import { LintFinding, LintSeverity } from "./types";
import { getOutputChannel } from "../commands/outputChannel";

const DIAGNOSTIC_SOURCE = "DAS Lint";

function toVscodeSeverity(severity: LintSeverity): vscode.DiagnosticSeverity {
    switch (severity) {
        case "error":
            return vscode.DiagnosticSeverity.Error;
        case "warning":
            return vscode.DiagnosticSeverity.Warning;
        case "info":
        default:
            return vscode.DiagnosticSeverity.Information;
    }
}

function formatMessage(finding: LintFinding): string {
    if (finding.fixSuggestion) {
        return `${finding.message} Suggestion: ${finding.fixSuggestion}`;
    }
    return finding.message;
}

async function loadWorkspaceScripts(
    maxFiles: number
): Promise<{ filePath: string; content: string }[]> {
    const scripts = await vscode.workspace.findFiles(
        "**/*.das",
        "**/{node_modules,.git}/**",
        maxFiles
    );

    const results: { filePath: string; content: string }[] = [];
    for (const uri of scripts) {
        const bytes = await vscode.workspace.fs.readFile(uri);
        const content = Buffer.from(bytes).toString("utf8");
        results.push({ filePath: uri.fsPath, content });
    }

    return results;
}

async function loadKeymap(): Promise<{ text?: string; path?: string }> {
    const keymaps = await vscode.workspace.findFiles(
        "**/keymap.yaml",
        "**/{node_modules,.git}/**",
        1
    );
    if (keymaps.length === 0) {
        return {};
    }
    const bytes = await vscode.workspace.fs.readFile(keymaps[0]);
    return {
        text: Buffer.from(bytes).toString("utf8"),
        path: keymaps[0].fsPath,
    };
}

function applyDiagnostics(
    collection: vscode.DiagnosticCollection,
    findings: LintFinding[],
    scriptPaths: string[]
): void {
    const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>();

    for (const finding of findings) {
        const start = new vscode.Position(
            finding.range.start.line,
            finding.range.start.character
        );
        const end = new vscode.Position(
            finding.range.end.line,
            finding.range.end.character
        );
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(start, end),
            formatMessage(finding),
            toVscodeSeverity(finding.severity)
        );
        diagnostic.source = DIAGNOSTIC_SOURCE;
        diagnostic.code = finding.ruleId;

        const list = diagnosticsByFile.get(finding.filePath) ?? [];
        list.push(diagnostic);
        diagnosticsByFile.set(finding.filePath, list);
    }

    for (const scriptPath of scriptPaths) {
        const uri = vscode.Uri.file(scriptPath);
        collection.set(uri, diagnosticsByFile.get(scriptPath) ?? []);
    }
}

export class LintController implements vscode.Disposable {
    private readonly collection: vscode.DiagnosticCollection;
    private pendingTimer: NodeJS.Timeout | undefined;
    private runId = 0;

    constructor() {
        this.collection = vscode.languages.createDiagnosticCollection("das-lint");
    }

    dispose(): void {
        if (this.pendingTimer) {
            clearTimeout(this.pendingTimer);
        }
        this.collection.dispose();
    }

    scheduleWorkspaceLint(): void {
        const config = loadLintConfig();
        if (!config.enabled) {
            this.collection.clear();
            return;
        }

        if (this.pendingTimer) {
            clearTimeout(this.pendingTimer);
        }

        this.pendingTimer = setTimeout(() => {
            void this.runWorkspaceLint();
        }, config.debounceMs);
    }

    async runWorkspaceLint(): Promise<number> {
        const config = loadLintConfig();
        if (!config.enabled) {
            this.collection.clear();
            return 0;
        }

        const currentRun = ++this.runId;
        try {
            const scripts = await loadWorkspaceScripts(config.maxFiles);
            const scriptPaths = scripts.map((script) => script.filePath);
            if (scripts.length === 0) {
                this.collection.clear();
                return 0;
            }

            const keymap = await loadKeymap();
            const findings = lintWorkspace(
                {
                    scripts,
                    keymapText: keymap.text,
                    keymapPath: keymap.path,
                },
                config
            );

            if (currentRun !== this.runId) {
                return findings.length;
            }

            applyDiagnostics(this.collection, findings, scriptPaths);
            return findings.length;
        } catch (error) {
            const channel = getOutputChannel();
            const message =
                error instanceof Error ? error.message : String(error);
            channel.appendLine(`[LINT] Unable to run linting: ${message}`);
            return 0;
        }
    }
}

let sharedController: LintController | undefined;

export function registerLinting(context: vscode.ExtensionContext): LintController {
    const controller = new LintController();
    context.subscriptions.push(controller);

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === "das") {
                controller.scheduleWorkspaceLint();
            }
        }),
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.languageId === "das") {
                controller.scheduleWorkspaceLint();
                return;
            }
            if (event.document.fileName.toLowerCase().endsWith("keymap.yaml")) {
                controller.scheduleWorkspaceLint();
            }
        }),
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("dasHotkeyTools.linting")) {
                controller.scheduleWorkspaceLint();
            }
        })
    );

    sharedController = controller;
    return controller;
}

export function getLintController(): LintController | undefined {
    return sharedController;
}
