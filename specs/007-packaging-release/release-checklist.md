# Release Checklist: Packaging, Polish, and Public Release

**Feature**: 007-packaging-release
**Prepared By**:
**Date**:
**Version**:
**Release Type**: Draft / Publish

## Documentation Inventory

- [ ] README.md (repo root)
- [ ] CHANGELOG.md (repo root)
- [ ] PRODUCT_OVERVIEW.txt (repo root)
- [ ] vsc-extension-quickstart.md (repo root)

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

- [ ] Packaging + validation duration recorded (minutes/seconds):

## Validation Notes

- Notes:
  - LICENSE file exists at repo root.
  - `package.json` is missing a `license` field.
  - No Marketplace icon file or `icon` entry is present.

## Messaging Tone Review

- [X] Reviewed user-facing messages for clarity and calm tone
- [X] Improvements noted (if any): None identified (messages are clear and non-alarmist).

## Warning vs Error Classification

- [X] Reviewed warning/error usage across build, import, lint, and dependency commands
- [X] Fixes applied (if any): None required (warnings used for non-blocking issues, errors for fatal failures).

