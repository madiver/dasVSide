# Phase 5 Quickstart

## Manual Compiler Checks

1. Open a workspace with multiple `.das` files and a valid `keymap.yaml`.
2. Run the command "DAS: Build Hotkey File".
3. Confirm a single `Hotkey.htk` is generated at the configured output path.
4. Re-run the command and confirm the output is byte-for-byte identical.
5. Confirm no extra `.htk` or temporary output files remain in the output directory.
6. Remove or empty `keymap.yaml` and confirm compilation fails with a clear error.
7. Add duplicate hotkey ids in `keymap.yaml` and confirm compilation fails.
8. Add a duplicate key combination in `keymap.yaml` and confirm compilation fails.
9. Add an unreferenced `.das` file and confirm a warning is surfaced but output is still generated.
10. Create a malformed `.das` script and confirm compilation fails with a clear error.

## Expected Results

- Hotkey.htk is produced only when all required inputs are valid.
- Errors are actionable and reference the failing id/key/path when possible.
- Warnings do not block output for unreferenced `.das` files.
- Output is deterministic for identical inputs.
