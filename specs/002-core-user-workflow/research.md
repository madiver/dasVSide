# Phase 0 Research

## Decisions

### Decision: Use literal templates with fixed line breaks
**Rationale**: Required to match the authoritative .htk format and prevent formatting drift.
**Alternatives considered**: Dynamic wrapping or formatting.

### Decision: Enforce UTF-8 encoding with explicit CRLF line endings
**Rationale**: The .htk format requires Windows CRLF and explicit control over line endings.
**Alternatives considered**: Platform-default line endings.

### Decision: Single Hotkey.htk output per build
**Rationale**: Matches DAS import model and simplifies user workflow.
**Alternatives considered**: Multiple outputs per source file.

### Decision: Output path is required in settings
**Rationale**: Ensures deterministic file location and avoids hard-coded defaults.
**Alternatives considered**: Fixed output path in workspace root or out/ directory.

### Decision: Overwrite prompt for existing output
**Rationale**: Prevents accidental data loss while keeping user in control.
**Alternatives considered**: Always overwrite or always fail.

### Decision: Require .das files and keymap.yaml inputs
**Rationale**: Ensures deterministic mapping of hotkeys to source files.
**Alternatives considered**: Implicit or inferred inputs.
