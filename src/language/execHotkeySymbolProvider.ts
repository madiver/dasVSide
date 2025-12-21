import * as vscode from "vscode";

const EXEC_HOTKEY_REGEX =
    /ExecHotkey\s*\(\s*["']?([^"'()\r\n]+)["']?\s*\)/gi;

export class ExecHotkeySymbolProvider
    implements vscode.DocumentSymbolProvider
{
    provideDocumentSymbols(
        document: vscode.TextDocument
    ): vscode.DocumentSymbol[] {
        const text = document.getText();
        const symbols: vscode.DocumentSymbol[] = [];

        let match: RegExpExecArray | null;
        while ((match = EXEC_HOTKEY_REGEX.exec(text)) !== null) {
            const rawName = match[1]?.trim();
            if (!rawName) {
                continue;
            }

            const start = document.positionAt(match.index);
            const end = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(start, end);
            const symbol = new vscode.DocumentSymbol(
                rawName,
                "ExecHotkey",
                vscode.SymbolKind.Function,
                range,
                range
            );
            symbols.push(symbol);
        }

        return symbols;
    }
}
