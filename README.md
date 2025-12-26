# DAS Hotkey Tools

Create, import, and manage DAS Trader hotkeys with a clean, version-friendly workflow in VS Code. This extension turns Hotkey.htk into readable `.das` scripts plus a canonical `keymap.yaml`, and compiles them back into deterministic Hotkey.htk output.

## Overview

DAS Hotkey Tools helps active DAS Trader users manage complex hotkeys without editing Hotkey.htk by hand. It exists to address limitations of the built-in DAS Trader editor when managing large, complex script libraries. You can import legacy Hotkey.htk files, edit scripts with language support and linting, analyze dependencies, and rebuild output safely and deterministically.

## Risk Disclaimer

This extension is provided "as is" and is used at your own risk. It does not guarantee trading outcomes, and the author is not responsible for any losses or damages resulting from its use. Users are solely responsible for reviewing and validating all hotkeys and scripts before use in DAS Trader.

## Features

- Compile `.das` + `keymap.yaml` into deterministic Hotkey.htk
- Import Hotkey.htk into editable scripts and a canonical keymap
- Advisory linting for risky patterns (non-blocking)
- Dependency navigation (callers/callees, cycles, unused scripts)
- Optional account placeholder substitution for safer sharing

## Requirements

- VS Code 1.107 or newer
- A workspace containing `.das` scripts and `keymap.yaml` (for build)
- A Hotkey.htk file (for import)

## Getting Started

### Build Hotkey.htk

1. Open a workspace containing `.das` files.
2. Create `keymap.yaml` at the workspace root with `id`, `key`, `label`, and `scriptPath`.
3. Set `dasHotkeyTools.outputPath` in workspace settings.
4. Run `DAS: Build Hotkey File`.
5. Confirm the output file is created at the configured path.

### Import Hotkey.htk

1. Open the destination workspace in VS Code.
2. Run `DAS: Import Hotkey File`.
3. Select the source Hotkey.htk and destination folder.
4. Follow prompts for conflict handling and optional round-trip verification.
5. Confirm `keymap.yaml` appears at the destination root and `.das` files are in `hotkeys/`.

## Account Placeholders (Optional)

You can keep account numbers out of shared scripts by using exact tokens:

- `%%LIVE%%`
- `%%SIMULATED%%`

During builds, these tokens are replaced in script bodies when user-level settings are provided. If a setting is missing, the build warns and leaves the token unchanged.

## Group Tags (Optional)

To preserve grouping during import, you can add a group tag in the top comment block of each `.das` file:

```
// Group: Buy orders: Ask+ SL
```

The `// Group:` tag is case-insensitive and used by the importer to group entries in the generated `keymap.yaml`.

## Installing Hotkey.htk in DAS Trader

When you manually replace the Hotkey.htk file in DAS Trader, close DAS Trader Pro first, replace the file, then restart the application so the new hotkeys are loaded.

## Commands

| Command | Description |
| --- | --- |
| DAS: Build Hotkey File | Compile `.das` + `keymap.yaml` into Hotkey.htk |
| DAS: Import Hotkey File | Import Hotkey.htk into `hotkeys/` + `keymap.yaml` |
| DAS: Lint Scripts | Run advisory linting for `.das` scripts |
| DAS: Analyze Dependencies | Build a dependency graph and summarize cycles/unused scripts |
| DAS: Show Callers | Show scripts that call the current `.das` file |
| DAS: Show Callees | Show scripts called by the current `.das` file |

## Settings

Use the Settings UI:

1. Open Settings (Ctrl+, / Cmd+,).
2. Search for **DAS Hotkey Tools**.
3. Set workspace settings:
   - **Output Path**
   - **Linting: Enabled**
   - **Linting: Lint On Build** (optional)
4. Set user settings (placeholders):
   - **Live Account**
   - **Simulated Account**

If you prefer editing `settings.json` directly, use:

Workspace settings:

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

User settings (account placeholders):

```json
{
  "dasHotkeyTools.liveAccount": "LIVE-ACCOUNT-ID",
  "dasHotkeyTools.simulatedAccount": "SIM-ACCOUNT-ID"
}
```

Notes:
- `outputPath` may be absolute or workspace-relative (default: `output.htk`).
- `templateVariables` is for legacy templates and is ignored by the compiler.

## Project Layout

- `keymap.yaml` at the workspace root defines hotkey metadata.
- `.das` scripts can live anywhere, referenced by `scriptPath`.
- Imports place scripts under `hotkeys/` by default.

## Behavior & Limitations

- `keymap.yaml` is the source of truth for hotkey metadata.
- Source scripts are never rewritten during build.
- Duplicate ids or key combinations fail compilation with actionable errors.
- Unreferenced `.das` files emit warnings but do not block output.
- Linting is advisory only and never blocks compilation.

## Privacy & Offline Use

All workflows run locally and continue to work offline after installation.

## Safety & Non-Goals

This extension does not place trades, connect to DAS Trader APIs, or validate trading outcomes. Users retain responsibility for trading logic and account safety.

## Support

Report issues or request enhancements at: https://github.com/madiver/dasVSide/issues
