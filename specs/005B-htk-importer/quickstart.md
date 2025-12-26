# Phase 5B Quickstart: HTK Importer

## Import Hotkey.htk

1. Open VS Code on the workspace where you want the imported files.
2. Run `DAS: Import Hotkey File` from the Command Palette.
3. Select the source Hotkey.htk file when prompted.
4. Choose the destination folder.
5. If conflicts are detected, choose whether to overwrite, skip, or cancel.
6. When prompted, choose whether to run round-trip verification.
7. Confirm that `keymap.yaml` appears at the destination root and `.das` files are created under `hotkeys/`.

Note: Records with an empty key are imported as script-only entries and retain an empty key in keymap.yaml.
Note: Inline records without a length token (Key:Label:EncodedScript) are imported as single-line scripts.

## Round-Trip Verification

1. Run `DAS: Import Hotkey File` with verification enabled (or follow the UI prompt).
2. Confirm the verification report indicates a byte-for-byte match.
3. If verification fails, review the mismatch summary and compare the rebuilt Hotkey.htk to the original.

## Manual Checks

- Ensure the number of `.das` files matches the number of Hotkey.htk records.
- Open a `.das` file and confirm comments and formatting are preserved.
- Run `DAS: Build Hotkey File` and verify the output matches the original input.

## SC-001 Timing Check
- Date: 2025-12-25
- Sample: Synthetic Hotkey.htk with 50 records (derived from Hotkey.htk record 2, unique keys).
- Result: 0.45s (449 ms) import to empty destination.
