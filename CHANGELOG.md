# Change Log

All notable changes to the "das-hotkey-tools" extension will be documented in this file.

## [0.0.4] - 2026-01-01
### Added
- Example workspace under `examples/sample-workspace`.
- NOTICE file for Apache License 2.0 attribution.
### Changed
- Extension display name updated to DAS Trader Hotkey Tools.
- License updated to Apache-2.0.

## [0.0.3] - 2026-01-01
### Added
- Workspace setting to fail builds when `%%LIVE%%` or `%%SIMULATED%%` placeholders are unresolved.
### Changed
- Documented placeholder requirements and recommended fail-on-missing setting in Quickstart and README.

## [0.0.2] - 2025-12-26
### Added
- Optional setting to append a local timestamp to Hotkey build output filenames.
### Removed
- Unused `dasHotkeyTools.templateVariables` setting.

## [0.0.1] - 2025-12-26
### Added
- Build Hotkey.htk from `.das` scripts and `keymap.yaml`.
- Import Hotkey.htk into editable `.das` scripts and a canonical keymap.
- Advisory linting and dependency navigation (callers/callees, cycles, unused scripts).
- Optional account placeholder substitution for `%%LIVE%%` and `%%SIMULATED%%`.
- Offline-first workflows and packaging documentation.

### Breaking
- None
