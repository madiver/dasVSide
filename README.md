# DAS Hotkey Tools (Phase 5)

Phase 5 delivers the core compiler workflow for DAS Hotkey Tools. The extension
compiles `keymap.yaml` and `.das` scripts into a single deterministic
`Hotkey.htk` file. `Hotkey.htk` is treated as a compiled artifact and is only
written by the build command (with overwrite confirmation).

## Development (Extension Host)

1. Open this folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Open the Command Palette and run `DAS: Build Hotkey File`.
4. Confirm the success toast and output path.

## Phase 5 Quickstart

1. Open a workspace that contains one or more `.das` files.
2. Create a `keymap.yaml` file in the workspace with entries that include `id`,
   `key`, `label`, and `scriptPath`.
3. Set the output path in settings (example below).
4. Run `DAS: Build Hotkey File` from the Command Palette.
5. Confirm the `Hotkey.htk` output file is created at the configured path.
6. Re-run the command and confirm the output is byte-for-byte identical.

## Phase 5B Importer Quickstart

1. Open the destination workspace in VS Code.
2. Run `DAS: Import Hotkey File` from the Command Palette.
3. Select the source `Hotkey.htk` file and the destination folder.
4. Choose strict or lenient handling for script length mismatches.
5. If conflicts are detected, choose overwrite, skip, or cancel.
6. When prompted, decide whether to run round-trip verification.
7. Confirm `keymap.yaml` appears at the destination root and `.das` files are in `hotkeys/`.

## Compiler Behavior & Limitations

- `keymap.yaml` is the source of truth for hotkey metadata; script contents are
  never rewritten.
- Duplicate ids or key combinations fail compilation with actionable errors.
- Missing, empty, or malformed scripts fail compilation and no output is written.
- Unreferenced `.das` files emit warnings but do not block output.
- Linting is advisory only and never blocks compilation.
- Script length is computed as the UTF-8 byte length of decoded script text
  (CRLF normalized) and written in the `Key:Label:Length:Script` segment.
- Encoded script output is wrapped to match Hotkey.htk physical line breaks and
  never splits `~HH` tokens across lines.

## Importer Behavior & Limitations

- `Hotkey.htk` is parsed using `Key:Label:Length:EncodedScript` records and tolerates line wrapping variations (inline `Key:Label:EncodedScript` records are accepted too).
- Script bodies are decoded losslessly; CRLF logical newlines are preserved.
- Key-less records are accepted as script-only entries and retain an empty key in keymap.yaml.
- Duplicate key combinations (non-empty), empty scripts, or invalid encoding tokens abort the import with context.
- Script length headers are ignored during import; decoded script content is treated as the source of truth.
- Imported outputs are written to a `hotkeys/` directory plus a canonical `keymap.yaml`.

## Phase 3 Editor Experience

1. Open any `.das` file to activate the DAS language mode.
2. Confirm syntax highlighting for commands, variables, numbers, strings, and comments.
3. Use Outline or Go to Symbol to navigate ExecHotkey references.
4. Verify bracket matching and folding on control flow blocks.
5. Confirm no auto-formatting or whitespace changes occur on save.

## Phase 4 Linting

1. Open a `.das` file and confirm inline lint diagnostics appear for risky patterns.
2. Run `DAS: Lint Scripts` to scan the workspace on demand.
3. Adjust lint settings in workspace `settings.json` and confirm diagnostics update.

## Settings

Add the settings to your workspace `settings.json`:

```json
{
  "dasHotkeyTools.outputPath": "C:\\temp\\Hotkey.htk",
  "dasHotkeyTools.templateVariables": {},
  "dasHotkeyTools.linting.enabled": true,
  "dasHotkeyTools.linting.debounceMs": 400,
  "dasHotkeyTools.linting.maxFiles": 200,
  "dasHotkeyTools.linting.maxChainDepth": 8,
  "dasHotkeyTools.linting.lintOnBuild": false,
  "dasHotkeyTools.linting.ruleOverrides": {}
}
```

- `dasHotkeyTools.outputPath` must be a writable file path.
- `dasHotkeyTools.templateVariables` remains for legacy template workflows and
  is ignored by the Phase 5 compiler.
 - Relative output paths resolve against the workspace root (default: `output.htk`).

## Package

```powershell
npm run package
```

Confirm a `.vsix` file is created in the repository root.

## Install the .vsix

1. Create a fresh VS Code user profile.
2. Install the generated `.vsix` into that profile.
3. Run `DAS: Build Hotkey File` and confirm the output file is created.
