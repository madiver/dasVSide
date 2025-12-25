# Feature Specification: Phase 5 - Core Compiler and Hotkey Aggregation
**Feature Branch**: `005-core-compiler`  
**Created**: 2025-12-25  
**Status**: Draft  
**Input**: User description: "Compile multiple .das scripts and keymap.yaml into a single deterministic Hotkey.htk, with clear errors and editor command access."

## Clarifications

### Session 2025-12-25

- Q: Should compilation treat missing or empty keymap.yaml as a hard error? -> A: Fail on missing or empty keymap.yaml; no output written.
- Q: Should the compiler do anything with .das files that are present in the workspace but not referenced by keymap.yaml? -> A: Warn about unreferenced .das files but continue.
- Q: When a keymap entry resolves to multiple matching .das files (ambiguous path), how should compilation behave? -> A: Fail with an error listing the ambiguous matches.
- Q: When a .das script is unreadable or invalid UTF-8, how should compilation behave? -> A: Fail with a clear error and no output.

- All clarifications above are incorporated into requirements and edge cases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compile hotkeys from source (Priority: P1)

As a trader configuring hotkeys, I want to compile my .das scripts and keymap.yaml into a single Hotkey.htk so I can import and use the hotkeys in DAS Trader without manual assembly.

**Why this priority**: This is the core outcome of the phase and the primary user value.

**Independent Test**: Provide a workspace with valid .das files and keymap.yaml, run the compile command, and verify Hotkey.htk is produced with entries for each keymap mapping.

**Acceptance Scenarios**:

1. **Given** a workspace with valid .das scripts and keymap.yaml, **When** I run the compile command, **Then** a single Hotkey.htk is created containing one record per keymap entry.
2. **Given** the same inputs, **When** I compile twice, **Then** the two Hotkey.htk outputs are byte-for-byte identical.

---

### User Story 2 - Receive actionable compile errors (Priority: P2)

As a user, I want clear error messages when compilation fails so I can fix broken mappings quickly.

**Why this priority**: Errors are common during setup; actionable feedback prevents trial-and-error and reduces support burden.

**Independent Test**: Introduce a missing script path or duplicate id in keymap.yaml and verify the error points to the exact entry and file.

**Acceptance Scenarios**:

1. **Given** a keymap.yaml entry that references a missing .das file, **When** I compile, **Then** the compiler reports the missing path and the related hotkey id, and no output is written.
2. **Given** duplicate hotkey ids or key combinations in keymap.yaml, **When** I compile, **Then** the compiler reports the conflicting ids or keys and stops.

---

### User Story 3 - Trust deterministic ordering and single output (Priority: P3)

As a user managing a growing hotkey library, I want compiled output to be stable and predictable so I can track changes in version control.

**Why this priority**: Stable output enables reliable reviews and avoids unnecessary diffs.

**Independent Test**: Shuffle .das file locations without changing keymap.yaml order and confirm the output order is unchanged and only one Hotkey.htk is produced.

**Acceptance Scenarios**:

1. **Given** the same keymap.yaml order, **When** I add or move .das files without changing mappings, **Then** the output ordering remains unchanged.
2. **Given** a successful compilation, **When** I inspect the output directory, **Then** only one Hotkey.htk file exists.

---

### Edge Cases

- Missing or empty keymap.yaml results in a clear error and no output.
- Unreferenced .das files produce a warning but do not block compilation.
- Ambiguous keymap-to-script resolution fails with an error listing matches.
- Malformed .das scripts (unreadable or invalid UTF-8) fail with a clear error and no output.
- A keymap entry that points to an empty .das file fails with a clear error and no output.
- Duplicate key combinations fail with a clear error listing conflicts.
- Unreadable or locked script paths fail with a clear error and no output.
- Optional project configuration files that are incomplete are ignored with a warning and do not block compilation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The compiler MUST load one or more .das source files and a single keymap.yaml from the workspace.
- **FR-002**: keymap.yaml MUST be the authoritative source for hotkey ids, key bindings, labels, and script paths; the compiler MUST NOT infer metadata from .das content.
- **FR-003**: Each keymap entry MUST resolve to exactly one existing .das file; missing or ambiguous resolutions MUST fail with a clear error.
- **FR-004**: Hotkey ids MUST be unique across keymap.yaml; duplicates MUST fail with a clear error that lists the conflicts.
- **FR-005**: Key combinations MUST be unique across keymap.yaml; duplicates MUST fail with a clear error that lists the conflicts.
- **FR-006**: The compiler MUST read .das files as text, preserve comments and formatting, and avoid semantic rewriting of script content.
- **FR-007**: The compiler MUST build an internal hotkey model containing id, key, label, scriptLength, scriptText, and sourcePath before encoding.
- **FR-008**: The compiler MUST aggregate hotkeys in a deterministic order: primary by keymap.yaml declaration order, secondary by hotkey id.
- **FR-009**: Each hotkey MUST be encoded as a Key:Label:ScriptLength:EncodedScript record with logical newlines encoded and physical CRLF line endings, with no extra headers or metadata; scriptLength is the UTF-8 byte length of the decoded script using CRLF line endings. EncodedScript MUST be wrapped into fixed-width physical lines (51 characters per line) after the header prefix; if a `~HH` token would be split, the line MUST be extended to keep the token intact.
- **FR-010**: The compiler MUST emit exactly one Hotkey.htk file, write it atomically, and overwrite existing output predictably.
- **FR-011**: On any failure, the compiler MUST surface a human-readable error that includes the relevant id or key and source path when available, and MUST NOT leave a partial output.
- **FR-012**: The compiler MUST reject empty script content and report a clear error tied to the offending .das file.
- **FR-013**: The compiler MUST be invocable via an editor command and provide observable success or failure feedback to the user.
- **FR-014**: Hotkey.htk MUST be treated as a compiled artifact; only this compilation step may modify it.
- **FR-015**: Optional project-level configuration files, when present, MUST be read-only inputs; compilation MUST succeed when they are absent.
- **FR-016**: The compiler MUST fail when keymap.yaml is missing or empty and MUST not write Hotkey.htk.
- **FR-017**: The compiler MUST warn on .das files not referenced by keymap.yaml and MUST continue compilation.
- **FR-018**: On ambiguous keymap entry resolution, the error MUST list all candidate .das paths.
- **FR-019**: The compiler MUST fail when a referenced .das script is malformed (unreadable or invalid UTF-8) and MUST not write Hotkey.htk.

### Key Entities *(include if feature involves data)*

- **Hotkey**: A compiled mapping that combines id, key binding, label, script length (UTF-8 byte count), and script content.
- **Keymap Entry**: A mapping record that ties a hotkey id and key combination to a .das script path and metadata.
- **DAS Script**: A .das source file containing hotkey script logic.
- **Compiled Hotkey Artifact**: The single Hotkey.htk output generated from all inputs.
- **Compilation Error**: A human-readable failure with context (id, key, or path) that blocks output.

### Assumptions

- keymap.yaml is located at the workspace root unless otherwise configured.
- A failed compilation leaves any pre-existing Hotkey.htk unchanged.
- The keymap.yaml declaration order is stable and intentionally curated by the user.

### Dependencies

- A workspace contains valid keymap.yaml and referenced .das files.
- An editor command surface exists to invoke compilation.
- DAS Trader accepts the generated Hotkey.htk format for import.

### Out of Scope

- Static analysis or linting of scripts.
- Syntax validation beyond basic structural checks.
- Runtime execution or simulation of hotkeys.
- Environment-specific behavior (SIM vs LIVE).
- Automatic fixing or rewriting of scripts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A workspace with at least 10 valid .das files compiles into a Hotkey.htk that imports successfully in DAS Trader without manual edits.
- **SC-002**: Recompiling identical inputs produces byte-for-byte identical Hotkey.htk output.
- **SC-003**: 100% of keymap entries appear exactly once in the generated Hotkey.htk.
- **SC-004**: For any missing script or duplicate id/key, compilation fails with a specific, actionable error and produces no partial output.
- **SC-005**: Compilation of 50 scripts completes in under 5 seconds on a standard workstation.
