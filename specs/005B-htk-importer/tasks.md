---
description: "Task list for Phase 5B - HTK Importer and Round-Trip Support"
---
# Tasks: Phase 5B - HTK Importer and Round-Trip Support

**Input**: Design documents from `specs/005B-htk-importer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md
**Tests**: Tests are optional; none required by the spec for this phase.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce the importer command entry points and basic wiring

- [X] T001 [P] Add the import command contribution in package.json
- [X] T002 [P] Create import command scaffold in src/commands/importHotkeyFile.ts
- [X] T003 Register the import command in src/extension.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and error plumbing required by all user stories

- [X] T004 Create importer data types in src/importer/types.ts
- [X] T005 Create importer error types and codes in src/importer/errors.ts
- [X] T006 Add import log helpers in src/commands/outputChannel.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Import Hotkey.htk into editable workspace (Priority: P1)

**Goal**: Import Hotkey.htk into .das files and keymap.yaml with deterministic naming and layout

**Independent Test**: Import a valid Hotkey.htk and verify .das count, keymap.yaml entries, and preserved script text

### Implementation for User Story 1

- [X] T007 [P] [US1] Implement input selection and pre-validation in src/importer/inputs.ts
- [X] T008 [P] [US1] Implement record parsing and splitting in src/importer/parser.ts
- [X] T009 [P] [US1] Implement token decoding and CRLF normalization in src/importer/decoder.ts
- [X] T010 [P] [US1] Implement deterministic id rules with label default and key fallback in src/importer/naming.ts
- [X] T011 [US1] Implement script emission and directory creation in src/importer/writer.ts
- [X] T012 [US1] Implement keymap.yaml generation in src/importer/keymapWriter.ts
- [X] T013 [US1] Wire the import pipeline in src/commands/importHotkeyFile.ts

**Checkpoint**: Import command produces hotkeys/ scripts and keymap.yaml with preserved formatting

---

## Phase 4: User Story 2 - Verify round-trip equivalence (Priority: P2)

**Goal**: Provide verification that import + compile yields byte-identical Hotkey.htk

**Independent Test**: Import a Hotkey.htk, run verification, and confirm a byte-for-byte match report

### Implementation for User Story 2

- [X] T014 [US2] Implement round-trip verification flow in src/importer/verify.ts
- [X] T015 [US2] Add verification option and reporting to src/commands/importHotkeyFile.ts

**Checkpoint**: Verification reports pass/fail with mismatch summary

---

## Phase 5: User Story 3 - Handle conflicts and malformed inputs (Priority: P3)

**Goal**: Fail safely on conflicts and malformed records with actionable errors

**Independent Test**: Import into a non-empty destination and a malformed Hotkey.htk; verify blocking prompt and error context

### Implementation for User Story 3

- [X] T016 [US3] Add duplicate key detection in src/importer/parser.ts
- [X] T017 [US3] Enforce empty-script failure and length validation in src/importer/decoder.ts
- [X] T018 [US3] Implement conflict detection with overwrite/skip handling in src/importer/writer.ts
- [X] T019 [US3] Surface record-context errors in src/commands/outputChannel.ts
- [X] T020 [US3] Update import flow prompts for overwrite/skip/cancel in src/commands/importHotkeyFile.ts

**Checkpoint**: Conflicts and malformed records abort import with clear context

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and UX polish

- [X] T021 [P] Update README.md with import command usage and verification notes
- [X] T022 [P] Update specs/005B-htk-importer/quickstart.md with final UI wording
- [X] T023 [P] Add inline doc comments for importer public helpers in src/importer/*.ts
- [X] T024 [P] Run a manual timing check for SC-001 (50-record import under 30s) and record results in specs/005B-htk-importer/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on User Story 1 output
- **User Story 3 (P3)**: Depends on User Story 1 output

### Parallel Opportunities

- T001 and T002 can run in parallel (package.json vs new command file)
- T007-T010 can run in parallel (separate importer modules)
- T021-T023 can run in parallel (documentation and comments)

---

## Parallel Example: User Story 1

```bash
# Parallel module work:
Task: "Implement input selection and pre-validation in src/importer/inputs.ts"
Task: "Implement record parsing and splitting in src/importer/parser.ts"
Task: "Implement token decoding in src/importer/decoder.ts"
Task: "Implement deterministic naming in src/importer/naming.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and validate import output

### Incremental Delivery

1. Implement User Story 1 and validate
2. Add round-trip verification (User Story 2)
3. Add conflict/error hardening (User Story 3)
4. Finish polish tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Keep tasks small and independently testable
- Avoid partial outputs on failures
