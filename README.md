# DAS Hotkey Tools (Phase 0)

Phase 0 provides a minimal VS Code extension scaffold for DAS Hotkey Tools.
It validates extension activation, a placeholder command, and packaging/install
workflow. No DAS-specific functionality is included.

## Development

1. Open this folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Run the command: `DAS Hotkey Tools: Placeholder Command`.
4. Confirm the info toast appears.

## Package

```powershell
npm run package
```

Confirm a `.vsix` file is created in the repository root.

## Install the .vsix

1. Create a fresh VS Code user profile.
2. Install the generated `.vsix` into that profile.
3. Run the placeholder command and confirm the info toast appears.
