# dasVSide Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-21

## Active Technologies
- TypeScript (VS Code extension standard) + VS Code Extension API; filesystem access; @vscode/vsce for packaging (002-core-user-workflow)
- Workspace files (source inputs and generated output) (002-core-user-workflow)
- Workspace files and output Hotkey.htk file (002-core-user-workflow)
- TypeScript (VS Code extension standard) + VS Code Extension API; TextMate grammar files; language configuration JSON (004-das-language-support)
- Workspace files only (no external storage) (004-das-language-support)
- TypeScript (VS Code extension standard) + VS Code Extension API; existing workspace file access (004-das-linting)
- Workspace files only (.das, keymap.yaml) (004-das-linting)
- TypeScript (VS Code extension standard) + VS Code Extension API; Node.js fs; YAML parser library (pure JS, no native deps) (005-core-compiler)
- Workspace files only (.das, keymap.yaml, Hotkey.htk) (005-core-compiler)
- TypeScript (VS Code extension standard) + VS Code Extension API; Node.js fs/path; existing YAML parser package (005B-htk-importer)
- Workspace files only (Hotkey.htk, .das, keymap.yaml) (005B-htk-importer)
- TypeScript (VS Code extension standard) + VS Code Extension API, existing YAML parser (006-dependency-graph)
- Workspace files only (.das, keymap.yaml); in-memory cache for analysis results (006-dependency-graph)

- TypeScript (VS Code extension standard) + VS Code Extension API; vsce for packaging (001-vscode-extension-foundation)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript (VS Code extension standard): Follow standard conventions

## Recent Changes
- 006-dependency-graph: Added TypeScript (VS Code extension standard) + VS Code Extension API, existing YAML parser
- 006-dependency-graph: Added TypeScript (VS Code extension standard) + VS Code Extension API, existing YAML parser
- 005B-htk-importer: Added TypeScript (VS Code extension standard) + VS Code Extension API; Node.js fs/path; existing YAML parser package


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
