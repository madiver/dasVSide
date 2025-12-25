# Phase 5 Data Model

## Entities

### Keymap Entry
- Fields: id, key, label, scriptPath
- Validation: id and key are required; id and key must be unique across entries
- Relationship: maps to exactly one Script Source

### Script Source
- Fields: sourcePath, scriptText, isReadable
- Validation: file must exist, be readable, and contain non-empty scriptText
- Relationship: referenced by one Keymap Entry

### Hotkey
- Fields: id, key, label, scriptLength, scriptText, sourcePath
- Validation: scriptLength is computed as the UTF-8 byte length of decoded script text (CRLF line endings)
- Relationship: derived from Keymap Entry + Script Source

### Compilation Result
- Fields: status (success/failure), hotkeys[], warnings[], errors[], outputPath
- Validation: status is failure if any blocking error occurs

### Compilation Error
- Fields: type, message, id (optional), key (optional), sourcePath (optional)
- Validation: must include a human-readable message and contextual reference when available

## Relationships

- Each Keymap Entry references exactly one Script Source.
- Each Script Source belongs to at most one Keymap Entry.
- Each Hotkey is derived from one Keymap Entry and its Script Source.
- Compilation Result aggregates Hotkeys and any warnings/errors.

## State Transitions

- Pending -> Keymap Validated -> Scripts Loaded -> Hotkeys Aggregated -> Output Written
- Any validation failure transitions to Failure (no output written)
