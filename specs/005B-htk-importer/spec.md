# Feature Specification: Phase 5B - HTK Importer and Round-Trip Support

**Feature Branch**: `005B-htk-importer`  
**Created**: 2025-12-25  
**Status**: Draft  
**Input**: User description: "FEATURE: 006-htk-importer - Import Hotkey.htk into .das + keymap.yaml with deterministic naming and lossless round-trip support."

## Clarifications

### Session 2025-12-25
- Q: Where should imported .das files be placed by default (relative to the chosen destination folder)? → A: Always create a hotkeys/ folder under the destination root and put all .das files there, with keymap.yaml at the destination root.
- Q: How should duplicate key combinations in Hotkey.htk be handled during import? → A: Fail the import with a clear error listing duplicate key combinations; no output written.
- Q: How should duplicate generated ids be handled when ids are derived from labels? → A: Append numeric suffixes to duplicate label-based ids (label, label_2, label_3).
- Q: How should empty or missing script bodies be handled during import? → A: Fail the import with a clear error; no output written.
- Q: How should existing files in the destination be handled by default? → A: Treat existing files as a blocking conflict unless the user explicitly chooses overwrite; otherwise cancel with no changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Hotkey.htk into editable workspace (Priority: P1)

As a trader migrating legacy hotkeys, I want to import an existing Hotkey.htk into a workspace of .das files and keymap.yaml so I can edit, review, and rebuild the hotkeys safely.

**Why this priority**: Migration from legacy files is the primary value of this phase.

**Independent Test**: Import a valid Hotkey.htk and verify the number of .das files and keymap.yaml entries matches the number of hotkey records, with script content preserved.

**Acceptance Scenarios**:

1. **Given** a valid Hotkey.htk file, **When** I run the import command, **Then** one .das file per hotkey and a keymap.yaml are created in the destination workspace.
2. **Given** a hotkey record with comments and formatting in the script body, **When** I import, **Then** the .das file preserves those comments and formatting.

---

### User Story 2 - Verify round-trip equivalence (Priority: P2)

As a user, I want to confirm that importing and rebuilding produces an equivalent Hotkey.htk so I can trust the migration is lossless.

**Why this priority**: Confidence in lossless round-trip behavior is essential for adoption and version control workflows.

**Independent Test**: Import a Hotkey.htk, run the build command, and compare the rebuilt Hotkey.htk with the original.

**Acceptance Scenarios**:

1. **Given** an imported workspace, **When** I rebuild, **Then** the output Hotkey.htk is byte-for-byte identical to the original.
2. **Given** a validation mode, **When** I run it on a Hotkey.htk, **Then** it reports whether round-trip equivalence holds without modifying the original file.

---

### User Story 3 - Handle conflicts and malformed inputs (Priority: P3)

As a user, I want clear errors and safe conflict handling during import so I do not lose data or end up with partial outputs.

**Why this priority**: Real-world imports include malformed records and existing files; safe handling prevents data loss.

**Independent Test**: Attempt import into a non-empty destination and import a malformed Hotkey.htk; verify prompts and errors.

**Acceptance Scenarios**:

1. **Given** a destination folder that already contains files, **When** I import, **Then** I am prompted to overwrite, skip, or cancel before any file changes are made.
2. **Given** a malformed record (missing header fields or invalid encoding), **When** I import, **Then** the importer reports the record location and aborts without writing partial output.

---

### Edge Cases

- Hotkey.htk includes duplicate key combinations or duplicate labels.
- Hotkey.htk contains a record with an empty or missing script body.
- Hotkey.htk uses mixed line endings or unusual physical line wrapping.
- Hotkey.htk includes non-ASCII bytes in scripts.
- Two records generate the same filename after sanitization.
- Destination workspace is not writable or already contains keymap.yaml.
- A hotkey record lacks a label or key combination (key-less scripts permitted if label is present).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an import command that prompts for a source Hotkey.htk file and a destination workspace folder.
- **FR-002**: The importer MUST parse Hotkey.htk into discrete hotkey records using the Key:Label:Length:EncodedScript structure and tolerate physical line wrapping variations.
- **FR-002a**: The importer MUST also accept inline records formatted as Key:Label:EncodedScript (no length token) and import them as single-line scripts.
- **FR-003**: The importer MUST decode logical newlines into CRLF line breaks and decode encoded byte tokens into the original script text.
- **FR-004**: The importer MUST create exactly one .das file per hotkey record and one canonical keymap.yaml that maps keys, labels, and script paths.
- **FR-004a**: The importer MUST accept records with an empty key field and treat them as script-only entries, preserving the empty key in keymap.yaml.
- **FR-005**: The importer MUST generate deterministic hotkey ids when they are not present in the input, using a sanitized form of the label as the default, and falling back to the key combination when needed.
- **FR-005a**: When generated ids from labels collide, the importer MUST append numeric suffixes (label, label_2, label_3) deterministically.
- **FR-006**: The importer MUST generate .das filenames deterministically using the naming rules (id, then key, then label+key, with numeric suffixes for collisions).
- **FR-007**: The importer MUST keep the keymap.yaml entry order aligned with the order of records in Hotkey.htk.
- **FR-008**: The importer MUST preserve script comments and formatting exactly as represented in the decoded script text.
- **FR-009**: The importer MUST NOT alter script logic or insert metadata that did not exist in the input.
- **FR-010**: The importer MUST write outputs into a predictable structure with a top-level keymap.yaml and a hotkeys/ directory under the destination root for all imported scripts.
- **FR-011**: If a filename collision occurs, the importer MUST append a numeric suffix to maintain uniqueness and continue deterministically.
- **FR-012**: The importer MUST fail with a clear error when it encounters malformed records, invalid encoding tokens, missing required header fields, or duplicate key combinations, and MUST not leave partial output.
- **FR-012a**: The importer MUST fail when a record has an empty or missing script body.
- **FR-012b**: The importer MUST ignore the script length header during import and rely on the decoded script content length.
- **FR-013**: The importer MUST report errors with record context (key, label, or record index) when available.
- **FR-014**: The importer MUST support a round-trip verification mode that rebuilds the workspace and compares the resulting Hotkey.htk to the original.
- **FR-015**: When importing into a non-empty destination, the importer MUST prompt for overwrite, skip, or cancel before writing files.
- **FR-015a**: By default, existing files are treated as blocking conflicts; the importer proceeds only if the user explicitly chooses overwrite.
- **FR-016**: The importer MUST allow canceling the import without making any changes.
- **FR-017**: The importer MUST treat Hotkey.htk as the source of truth for script content and record order.
- **FR-018**: The importer MUST produce outputs that are compatible with the Phase 5 compiler without additional manual edits.

### Key Entities *(include if feature involves data)*

- **Hotkey Record**: A parsed entry from Hotkey.htk containing key, label, length token, and encoded script body.
- **Script File**: A .das file containing the decoded script text for a single hotkey.
- **Keymap Entry**: A mapping from id, key, label, and script path to a script file.
- **Import Session**: A single run of the importer that yields outputs, warnings, and errors.
- **Round-Trip Report**: A summary indicating whether the rebuilt Hotkey.htk matches the original.

### Assumptions

- Hotkey.htk does not contain explicit hotkey ids; ids are generated deterministically from labels or keys.
- The destination workspace can be created if it does not exist and is writable.
- Imported scripts are placed under a hotkeys/ directory at the destination root.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Importing a Hotkey.htk with 50 records produces 50 .das files and 50 keymap.yaml entries in under 30 seconds on a standard workstation.
- **SC-002**: Rebuilding an imported workspace produces a Hotkey.htk that is byte-for-byte identical to the original for valid inputs.
- **SC-003**: Re-importing the same Hotkey.htk produces the same filenames and keymap.yaml ordering every time.
- **SC-004**: Malformed inputs fail with a descriptive error and produce no partial outputs.
- **SC-005**: Script comments present in Hotkey.htk are preserved verbatim in the imported .das files.
