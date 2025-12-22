# DAS Hotkey Tools (Phase 1)

Phase 1 delivers the first usable workflow for DAS Hotkey Tools. The extension
generates a Hotkey.htk file from VS Code using literal templates and strict
format validation.

## Development (Extension Host)

1. Open this folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Open the Command Palette and run `DAS: Build Hotkey File`.
4. Confirm the success toast and output path.

## Phase 1 Quickstart

1. Open a workspace that contains at least one `.das` file.
2. Create a `keymap.yaml` file in the workspace (contents can be empty for Phase 1).
3. Set the output path in settings (example below).
4. Run `DAS: Build Hotkey File` from the Command Palette.
5. Confirm the Hotkey.htk output file is created at the configured path.

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
- `dasHotkeyTools.templateVariables` provides placeholder values for templates.

## Package

```powershell
npm run package
```

Confirm a `.vsix` file is created in the repository root.

## Install the .vsix

1. Create a fresh VS Code user profile.
2. Install the generated `.vsix` into that profile.
3. Run `DAS: Build Hotkey File` and confirm the output file is created.
