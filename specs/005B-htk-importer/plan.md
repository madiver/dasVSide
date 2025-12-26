# Implementation Plan: Phase 5B - HTK Importer and Round-Trip Support

**Branch**: `005B-htk-importer` | **Date**: 2025-12-25 | **Spec**: C:\Users\mark\development\dasVSide\specs\005B-htk-importer\spec.md
**Input**: Feature specification from `C:\Users\mark\development\dasVSide\specs\005B-htk-importer\spec.md`
**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary
Phase 5B completes the import workflow by enabling authoritative import of Hotkey.htk into a safe, editable workspace of .das scripts and a canonical keymap.yaml. The importer parses records, decodes scripts, writes a predictable layout, handles conflicts deterministically, and provides a round-trip verification option to guarantee lossless rebuilds.

## Technical Context
**Language/Version**: TypeScript (VS Code extension standard)
**Primary Dependencies**: VS Code Extension API; Node.js fs/path; existing YAML parser package
**Storage**: Workspace files only (Hotkey.htk, .das, keymap.yaml)
**Testing**: Manual validation in VS Code; targeted unit tests for parser, naming, and round-trip logic as needed
**Target Platform**: Windows VS Code Extension Host
**Project Type**: single
**Performance Goals**: Import 50 hotkey records in under 30 seconds; round-trip verification completes in under 60 seconds
**Constraints**: Offline-only; extension-host only; deterministic output; no script mutation; no native deps
**Scale/Scope**: Dozens to hundreds of hotkey records per workspace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Extension-host only runtime: PASS
- TypeScript + standard build pipeline: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, Git-friendly outputs: PASS
- Packaging constraints (.vsix, no native deps, no non-standard shell): PASS
- Workflow artifacts (spec/plan/tasks): PASS

## Project Structure

### Documentation (this feature)

```text
C:\Users\mark\development\dasVSide\specs\005B-htk-importer\
  plan.md              # This file (/speckit.plan command output)
  research.md          # Phase 0 output (/speckit.plan command)
  data-model.md        # Phase 1 output (/speckit.plan command)
  quickstart.md        # Phase 1 output (/speckit.plan command)
  contracts\           # Phase 1 output (/speckit.plan command)
  tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
C:\Users\mark\development\dasVSide\
  src\
    commands\
    compiler\
    importer\
    config\
    linting\
    language\
    templates\
    extension.ts
  syntaxes\
  language-configuration.json
  package.json
  README.md
```

**Structure Decision**: Use a dedicated `src\importer\` folder for parsing, decoding, naming, and write orchestration, with a new VS Code command in `src\commands\importHotkeyFile.ts`.

## Phase 0: Outline & Research

**Research Goal**: Confirm deterministic parsing, decoding, and naming rules that preserve Hotkey.htk fidelity and support lossless round-trip validation.

**Research Tasks**:
- Validate Hotkey.htk record parsing rules for multi-line records with length tokens and variable wrapping.
- Confirm decoding rules for ~HH tokens and logical newline handling into CRLF.
- Define deterministic naming and id generation rules consistent with keymap requirements.
- Review safe write and conflict-handling patterns for import outputs.

## Phase 1: Design & Contracts

### Internal Interfaces and Separation

- Importer modules are isolated under `src\importer\` and do not depend on linting, language services, or compiler logic beyond optional round-trip verification.
- VS Code commands and UI messaging live under `src\commands\`.
- The round-trip verification invokes the existing compiler pipeline without mutating scripts.

### Data Model (from `data-model.md`)

- Hotkey Record, Script File, Keymap Entry, Import Session, Round-Trip Report.
- Import Session is the single source of truth for files written and errors reported.

### Contracts

- Documentation-only internal contract in `contracts/importer.openapi.yaml` describing import and verification actions.

## Phase 2: Implementation Plan (Incremental Sub-Steps)

### Step 1: Hotkey.htk input discovery and pre-validation

**Goal**: Locate the source Hotkey.htk and validate basic structure before parsing.

**Create**:
- `src\importer\inputs.ts` (file selection and pre-validation helpers)

**Modify**:
- `src\commands\importHotkeyFile.ts` (new command entry point)
- `src\extension.ts` (register new import command)

**Behavior**:
- Prompt for a source Hotkey.htk file and destination folder.
- Validate the source exists, is readable, and contains at least one header matching `Key:Label:~ <length>:`.
- Abort early if the file is empty, unreadable, or lacks a parseable header.

**Acceptance Criteria**:
- Missing/unreadable Hotkey.htk fails with a clear error and no output.
- Gross format errors (no headers, invalid length token) abort before deeper parsing.

### Step 2: .htk parsing and record splitting

**Goal**: Split the file into discrete records and build an intermediate representation.

**Create**:
- `src\importer\parser.ts` (record boundary detection, header parsing)

**Modify**:
- `src\importer\errors.ts` (malformed record, invalid header, partial record)

**Behavior**:
- Split the file on physical CRLF lines.
- Detect headers via `Key:Label:~ <length>:` and accumulate subsequent lines until the encoded byte length matches the length token.
- Capture each record as `{ key, label, lengthToken, encodedBody, recordIndex }`.
- Treat partial or truncated records as fatal errors.

**Acceptance Criteria**:
- Records are split deterministically and preserve input order.
- Malformed or partial records fail with record index context.

### Step 3: Logical newline decoding

**Goal**: Decode encoded script bodies into exact .das script text.

**Create**:
- `src\importer\decoder.ts` (decode ~HH tokens into bytes and UTF-8 text)

**Behavior**:
- Convert `~HH` tokens into bytes, interpret as UTF-8, and normalize to CRLF line endings.
- Preserve comments and whitespace exactly as decoded.
- Reject invalid tokens or length mismatches.

**Acceptance Criteria**:
- Decoded scripts match expected patterns for known inputs (comments, whitespace, line breaks).
- Invalid tokens or mismatched lengths fail with clear errors.

### Step 4: Deterministic naming and collision handling

**Goal**: Generate stable ids and filenames that are readable and collision-free.

**Create**:
- `src\importer\naming.ts` (sanitize, id generation, filename rules)

**Behavior**:
- Generate ids from sanitized labels; append numeric suffixes when collisions occur.
- Filename fallback order is deterministic: id → key → label+key (with numeric suffixes for collisions).
- Generate filenames from ids, then key, then label+key with numeric suffixes.
- Use record order to ensure deterministic suffix assignment.

**Acceptance Criteria**:
- Same input yields identical ids and filenames.
- Collisions resolve deterministically with suffixes.

### Step 5: Script extraction and .das emission

**Goal**: Emit one .das file per hotkey into the required workspace layout.

**Create**:
- `src\importer\writer.ts` (script file output and atomic writes)

**Behavior**:
- Create `hotkeys/` under the destination root.
- Write each decoded script to a `.das` file using the naming rules.
- Abort with no partial output if any write fails.

**Acceptance Criteria**:
- Every record yields exactly one `.das` file.
- Failed writes leave no partial files or directories.

### Step 6: Keymap.yaml generation

**Goal**: Produce a canonical keymap.yaml mapping scripts to ids and keys.

**Create**:
- `src\importer\keymapWriter.ts` (keymap generation and ordering)

**Behavior**:
- Write keymap.yaml at the destination root with fields `id`, `key`, `label`, `scriptPath`.
- Preserve record order from Hotkey.htk.
- Treat the header length token as a script-length value only; no flags are stored.

**Acceptance Criteria**:
- keymap.yaml contains one entry per record in the original order.
- Script paths resolve to files under `hotkeys/`.

### Step 7: Workspace layout enforcement and conflict safeguards

**Goal**: Enforce predictable layout and avoid overwriting unrelated files.

**Modify**:
- `src\importer\writer.ts` (conflict detection, overwrite guardrails)

**Behavior**:
- Detect existing keymap.yaml or target .das files and require explicit overwrite choice.
- Default behavior cancels import with no changes when conflicts exist.
- Allow skip to omit conflicting files while continuing the rest, only when explicitly selected.

**Acceptance Criteria**:
- Existing files are treated as blocking conflicts unless overwrite is chosen.
- Cancel leaves destination unchanged.

### Step 8: Round-trip validation hooks

**Goal**: Verify that imported workspaces rebuild into equivalent Hotkey.htk.

**Create**:
- `src\importer\verify.ts` (import -> compile -> compare)

**Modify**:
- `src\commands\importHotkeyFile.ts` (optional verification flow)

**Behavior**:
- Rebuild the imported workspace using the compiler pipeline.
- Compare rebuilt Hotkey.htk to the original byte-for-byte.
- Report match/mismatch with a short summary.

**Acceptance Criteria**:
- Verification passes on valid inputs; failures report mismatch context.

### Step 9: Error reporting and user feedback integration

**Goal**: Provide actionable errors and warnings with context.

**Modify**:
- `src\commands\outputChannel.ts` (import logging helpers)
- `src\importer\errors.ts` (structured error types)

**Behavior**:
- Errors include key, label, or record index when available.
- Fatal errors abort the import; warnings do not write partial output.

**Acceptance Criteria**:
- Errors are human-readable and map to the failing record.

### Step 10: VS Code command and UI integration

**Goal**: Ensure the importer is accessible and user-friendly in VS Code.

**Modify**:
- `src\commands\importHotkeyFile.ts` (prompts, progress, notifications)

**Behavior**:
- Prompt for source Hotkey.htk and destination folder.
- Show progress notifications during import and verification.
- Offer to open generated keymap.yaml or a representative .das file after import.
- Avoid disrupting open editors or unsaved changes.

**Acceptance Criteria**:
- Import command completes with clear success or failure messaging.
- UI prompts prevent accidental overwrites.

### Step 11: Integration with compiler (Phase 5)

**Goal**: Ensure imported artifacts compile without manual adjustments.

**Modify**:
- `src\commands\importHotkeyFile.ts` (verify invokes compiler only when requested)

**Behavior**:
- Normalize decoded scripts to CRLF for compatibility with the compiler.
- Ensure keymap.yaml fields align with compiler expectations.
- Preserve deterministic naming to keep rebuilds stable.

**Acceptance Criteria**:
- Imported workspaces compile successfully with the Phase 5 compiler.

### Step 12: Performance and edge case handling

**Goal**: Keep import responsive and robust for real-world files.

**Behavior**:
- Stream or chunk read large Hotkey.htk files where possible.
- Handle unusual formatting, missing tokens, and mixed line endings as errors.
- Avoid repeated parsing passes.

**Acceptance Criteria**:
- Import of 50 records completes under 30 seconds on standard hardware.

## Incremental Verification

- Step 1: Input selection validates paths and detects gross format errors.
- Step 2: Parser splits records correctly and flags malformed headers.
- Step 3: Decoder preserves comments and line breaks.
- Step 4: Naming rules yield deterministic ids and filenames.
- Step 5: Script outputs are correct and written atomically.
- Step 6: keymap.yaml order and paths are correct.
- Step 7: Conflicts block import unless overwrite is chosen.
- Step 8: Round-trip verification compares byte-for-byte output.
- Step 9: Errors surface with record context in output channel.
- Step 10: Command prompts and progress feedback are correct.
- Step 11: Imported workspace compiles with existing compiler.
- Step 12: Performance targets met for medium-sized inputs.

## Explicit Non-Goals

- Static analysis beyond syntax-level checks.
- Intelligent script rewriting or refactoring.
- Runtime DAS validation or execution.
- Inference of missing metadata beyond naming rules.

## Constitution Check (Post-Design)

- Extension-host only runtime: PASS
- TypeScript + standard build pipeline: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, Git-friendly outputs: PASS
- Packaging constraints (.vsix, no native deps, no non-standard shell): PASS
- Workflow artifacts (spec/plan/tasks): PASS

## Complexity Tracking

No constitution violations detected; no complexity exceptions required.
