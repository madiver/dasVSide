# Phase 5B Data Model

## Entities

### Hotkey Record
- Fields: key, label, lengthToken, encodedScript, recordIndex
- Validation: key and label present; lengthToken numeric; encodedScript length matches lengthToken bytes
- Relationship: decoded into one Script File and one Keymap Entry

### Script File
- Fields: sourcePath, scriptText, id
- Validation: scriptText non-empty; id unique
- Relationship: referenced by one Keymap Entry

### Keymap Entry
- Fields: id, key, label, scriptPath
- Validation: id and key required; id unique; key unique
- Relationship: maps to one Script File

### Import Session
- Fields: sourcePath, destinationRoot, hotkeysDir, records[], entries[], warnings[], errors[]
- Validation: errors present when import fails; outputs written only on success

### Round-Trip Report
- Fields: originalPath, rebuiltPath, isEquivalent, mismatchSummary
- Validation: isEquivalent true only when byte-for-byte match

## Relationships

- Each Hotkey Record yields one Script File and one Keymap Entry.
- Import Session aggregates records, output paths, and any warnings/errors.
- Round-Trip Report references the original and rebuilt Hotkey.htk paths.

## State Transitions

- Pending -> Inputs Validated -> Records Parsed -> Scripts Decoded -> Outputs Written -> (Optional) Verified
- Any failure transitions to Failed (no output written)
