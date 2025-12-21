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

## Settings

Add the settings to your workspace `settings.json`:

```json
{
  "dasHotkeyTools.outputPath": "C:\\temp\\Hotkey.htk",
  "dasHotkeyTools.templateVariables": {}
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
