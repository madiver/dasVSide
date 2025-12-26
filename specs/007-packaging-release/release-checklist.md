# Release Checklist: Packaging, Polish, and Public Release

**Feature**: 007-packaging-release
**Prepared By**:
**Date**:
**Version**:
**Release Type**: Draft / Publish

## Documentation Inventory

- [X] README.md (repo root)
- [X] CHANGELOG.md (repo root)
- [X] PRODUCT_OVERVIEW.txt (repo root)
- [X] vsc-extension-quickstart.md (repo root)

## Packaging Validation

### Packaging Inputs
- [ ] `npm run package` uses `scripts/package-vsce.mjs`
- [ ] `scripts/package-vsce.mjs` uses local `node_modules/.bin/vsce`

### Windows Install Validation
- [ ] Build VSIX on Windows
- [ ] Install VSIX in a clean VS Code profile
- [ ] Run build workflow (offline)
- [ ] Run import workflow (offline)
- [ ] Uninstall extension and confirm no residual configuration is required

### macOS Install Validation
- [ ] Build VSIX on macOS
- [ ] Install VSIX in a clean VS Code profile
- [ ] Run build workflow (offline)
- [ ] Run import workflow (offline)
- [ ] Uninstall extension and confirm no residual configuration is required

## Offline Validation (Build + Import)

- [ ] Build workflow completes offline (no network)
- [ ] Import workflow completes offline (no network)

## Validation Outcomes

- [ ] Windows install validation result recorded (pass/fail + notes)
- [ ] macOS install validation result recorded (pass/fail + notes)
- [ ] Offline build validation result recorded (pass/fail + notes)
- [ ] Offline import validation result recorded (pass/fail + notes)
- [ ] Uninstall validation result recorded (pass/fail + notes)

## Marketplace Metadata Audit

- [X] `package.json` has `name`, `publisher`, `displayName`, `description`
- [X] `package.json` has `version` aligned with `CHANGELOG.md`
- [X] `package.json` has `repository` and `engines.vscode`
- [X] `package.json` has `categories` set
- [ ] `package.json` includes license metadata
- [ ] Marketplace icon present and referenced in `package.json` (if required)

## Command Catalog

| Command ID | Title | Docs Description | Notes |
| --- | --- | --- | --- |
| `dasHotkeyTools.buildHotkeyFile` | DAS: Build Hotkey File | TBD | |
| `dasHotkeyTools.lintScripts` | DAS: Lint Scripts | TBD | |
| `dasHotkeyTools.importHotkeyFile` | DAS: Import Hotkey File | TBD | |
| `dasHotkeyTools.analyzeDependencies` | DAS: Analyze Dependencies | TBD | |
| `dasHotkeyTools.showCallers` | DAS: Show Callers | TBD | |
| `dasHotkeyTools.showCallees` | DAS: Show Callees | TBD | |

## Packaging Duration

- [X] Packaging + validation duration recorded (minutes/seconds): 26.2 seconds (`npm run package` on Windows)

## Validation Notes

- Notes:
  - Smoke workflow (build/import/lint/navigation) requires manual VS Code run; pending.
  - Determinism note verified in README ("Compiler Behavior & Limitations").
  - Offline workflow steps verified in README ("Packaging & Offline Validation").
  - Docs accuracy review completed for README.md, CHANGELOG.md, PRODUCT_OVERVIEW.txt, and vsc-extension-quickstart.md.
  - VSIX packaging warning: extension has many files; consider bundling and/or tightening .vscodeignore.
  - LICENSE file exists at repo root.
  - `package.json` is missing a `license` field.
  - No Marketplace icon file or `icon` entry is present.

## Messaging Tone Review

- [X] Reviewed user-facing messages for clarity and calm tone
- [X] Improvements noted (if any): None identified (messages are clear and non-alarmist).

## Warning vs Error Classification

- [X] Reviewed warning/error usage across build, import, lint, and dependency commands
- [X] Fixes applied (if any): None required (warnings used for non-blocking issues, errors for fatal failures).

