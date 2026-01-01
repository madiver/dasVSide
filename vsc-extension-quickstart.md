# DAS Trader Hotkey Tools Extension Quickstart

## What's in the folder

- `package.json` defines commands, activation events, and settings.
- `src/extension.ts` registers commands and bootstraps the extension.
- `src/commands/` contains the command handlers.
- `syntaxes/` and `language-configuration.json` define the DAS language support.

## Run the extension in development

1. Open this folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Open a workspace that includes `.das` files and `keymap.yaml`.
4. Run the commands listed below from the Command Palette.

## Commands

- `DAS: Build Hotkey File`
- `DAS: Import Hotkey File`
- `DAS: Lint Scripts`
- `DAS: Analyze Dependencies`
- `DAS: Show Callers`
- `DAS: Show Callees`

## Tests and linting

- `npm run lint`
- `npm test`
