# QUICKSTART

Quick steps for testers to install and verify DAS Hotkey Tools in VS Code.

## Prerequisites

- VS Code 1.107 or newer
- The `.vsix` package for DAS Hotkey Tools
- A workspace with `.das` scripts and `keymap.yaml` (for build), or a Hotkey.htk file (for import)

## Install the Extension (VSIX)

1. Open VS Code.
2. Open Extensions (Ctrl+Shift+X).
3. Click the "..." menu and choose **Install from VSIX...**
4. Select the `.vsix` file.
5. Restart VS Code (or run **Developer: Reload Window**).

## Configure Settings

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
  "dasHotkeyTools.linting.enabled": true,
  "dasHotkeyTools.linting.lintOnBuild": false
}
```

User settings:

```json
{
  "dasHotkeyTools.liveAccount": "LIVE-ACCOUNT-ID",
  "dasHotkeyTools.simulatedAccount": "SIM-ACCOUNT-ID"
}
```

## Build Hotkey.htk

1. Open the workspace containing `.das` files and `keymap.yaml`.
2. Run **DAS: Build Hotkey File** from the Command Palette.
3. Confirm the output file is created at the configured `outputPath`.

If you manually replace Hotkey.htk in DAS Trader, close DAS Trader Pro first, replace the file, then restart the application.

## Import Hotkey.htk

1. Open the destination workspace.
2. Run **DAS: Import Hotkey File**.
3. Select the source Hotkey.htk and destination folder.
4. Confirm `keymap.yaml` appears and `.das` files are created under `hotkeys/`.

## Offline Check (Optional)

Disconnect from the network and repeat a build/import to confirm offline operation.
