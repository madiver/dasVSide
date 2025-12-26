# Quickstart: Account Placeholder Substitution

## Prerequisites
- VS Code installed
- DAS Hotkey Tools extension installed
- Workspace with `.das` files and `keymap.yaml`

## Steps
1. Open VS Code user settings and set **Live Account** and **Simulated Account** values.
2. Add the exact tokens `%%LIVE%%` or `%%SIMULATED%%` to one or more `.das` scripts.
3. Run `DAS: Build Hotkey File`.
4. Verify the compiled `Hotkey.htk` contains substituted account values.
5. Clear one of the settings, rebuild, and confirm a warning is shown and placeholders remain unchanged.
