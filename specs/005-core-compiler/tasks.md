---
description: "Task list for Phase 5 - Core Compiler and Hotkey Aggregation"
---
# Tasks: Phase 5 - Core Compiler and Hotkey Aggregation
**Input**: Design documents from `C:\Users\mark\development\dasVSide\specs\005-core-compiler\`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md
**Tests**: No automated tests requested; manual verification via quickstart.md
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project setup and dependency preparation

- [X] T001 Add YAML parser dependency to `package.json` and `package-lock.json` (supports FR-002/FR-003 and offline/no-native constraints)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core compiler scaffolding required before user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create compiler types in `src/compiler/types.ts` (KeymapEntry, HotkeyModel, CompileResult, CompileWarning/Error)
- [X] T003 Update compiler error hierarchy in `src/compiler/errors.ts` (missing keymap, duplicate id/key, ambiguous match, missing/empty/malformed script)
- [X] T004 Create compile pipeline entrypoint in `src/compiler/compileHotkeys.ts` (orchestrates discovery -> parse -> load -> model -> aggregate -> encode -> write)
- [X] T005 [P] Add script structural validation in `src/compiler/validator.ts` (unreadable, invalid UTF-8, or empty content) and wire into `src/compiler/compileHotkeys.ts`
- [X] T006 [P] Implement optional project config discovery as read-only inputs in `src/compiler/discovery.ts`
- [X] T007 [P] Add performance guardrails in `src/compiler/discovery.ts` and `src/compiler/loader.ts` (single-pass scan, avoid repeated fs calls)

**Checkpoint**: Core compiler scaffolding exists and is ready for story implementation

---

## Phase 3: User Story 1 - Compile hotkeys from source (Priority: P1) MVP

**Goal**: Compile .das files and keymap.yaml into a single Hotkey.htk via the VS Code command.

**Independent Test**: Run "DAS: Build Hotkey File" in a workspace with valid .das + keymap.yaml and confirm a single Hotkey.htk is generated.

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement workspace discovery in `src/compiler/discovery.ts` (find keymap.yaml, list .das files, fail on missing/empty keymap)
- [X] T009 [P] [US1] Implement keymap parsing + validation in `src/compiler/keymap.ts` (required fields, uniqueness, resolve scriptPath)
- [X] T010 [P] [US1] Implement script loader in `src/compiler/loader.ts` (UTF-8 read, internal line-ending normalization, no rewriting)
- [X] T011 [P] [US1] Implement hotkey model builder in `src/compiler/model.ts` (combine metadata + script text)
- [X] T012 [P] [US1] Implement aggregation in `src/compiler/aggregate.ts` (collect models, preserve keymap order)
- [X] T013 [P] [US1] Update encoding rules in `src/compiler/formatRules.ts` (0D0A tokens, CRLF output)
- [X] T014 [P] [US1] Update renderer in `src/compiler/renderer.ts` (Key:Label:Flags:EncodedScript records)
- [X] T015 [US1] Wire compile pipeline into `src/commands/buildHotkeyFile.ts` (replace template render flow)
- [X] T016 [US1] Ensure output path resolution uses settings in `src/config/settings.ts`
- [X] T017 [US1] Surface compile success in `src/commands/outputChannel.ts` and `src/commands/buildHotkeyFile.ts`

**Checkpoint**: User Story 1 is functional and Hotkey.htk is generated from valid inputs.

---

## Phase 4: User Story 2 - Receive actionable compile errors (Priority: P2)

**Goal**: Provide clear, actionable errors and warnings for invalid inputs.

**Independent Test**: Introduce a missing script or duplicate id in keymap.yaml and verify the error cites the exact id/key/path.

### Implementation for User Story 2

- [X] T018 [P] [US2] Add unreferenced script warnings in `src/compiler/discovery.ts` or `src/compiler/keymap.ts`
- [X] T019 [P] [US2] Attach id/key/path context to errors in `src/compiler/errors.ts` and `src/compiler/compileHotkeys.ts`
- [X] T020 [US2] Update output messaging for warnings vs fatal errors in `src/commands/buildHotkeyFile.ts`
- [X] T021 [US2] Ensure compilation aborts on fatal errors and never writes output in `src/compiler/compileHotkeys.ts`

**Checkpoint**: Errors and warnings are human-readable, actionable, and block output only on fatal failures.

---

## Phase 5: User Story 3 - Trust deterministic ordering and single output (Priority: P3)

**Goal**: Ensure stable ordering and a single, predictable Hotkey.htk output.

**Independent Test**: Compile twice with identical inputs and verify byte-for-byte identical output; ensure only one Hotkey.htk exists.

### Implementation for User Story 3

- [X] T022 [US3] Enforce deterministic ordering (keymap declaration order + id tie-breaker) in `src/compiler/aggregate.ts`
- [X] T023 [US3] Implement atomic write (temp file + rename) in `src/compiler/writer.ts`
- [X] T024 [US3] Preserve overwrite confirmation and single-output behavior in `src/commands/buildHotkeyFile.ts`
- [X] T025 [US3] Update determinism checks in `specs/005-core-compiler/quickstart.md`

**Checkpoint**: Outputs are deterministic and only one Hotkey.htk is emitted.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and packaging alignment

- [X] T026 [P] Update `README.md` with compiler behavior, limitations, and compiled-artifact policy (fulfills constitution documentation requirement)
- [X] T027 [P] Validate contract alignment in `specs/005-core-compiler/contracts/compiler.openapi.yaml` (ensures contract docs match compiler behavior)
- [X] T028 [P] Review packaging exclusions for compiler assets in `.vscodeignore` (packaging constraint verification)
- [ ] T029 Run manual checks and update notes in `specs/005-core-compiler/quickstart.md` after Phase 5 (validates documented quickstart steps)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; no dependency on other stories
- **User Story 2 (P2)**: Starts after Foundational; builds on US1 compile flow
- **User Story 3 (P3)**: Starts after Foundational; refines ordering/output

---

## Parallel Example: User Story 1

```text
T008 Implement workspace discovery in src/compiler/discovery.ts
T009 Implement keymap parsing + validation in src/compiler/keymap.ts 
T010 Implement script loader in src/compiler/loader.ts
T011 Implement hotkey model builder in src/compiler/model.ts
T013 Update encoding rules in src/compiler/formatRules.ts
T014 Update renderer in src/compiler/renderer.ts
```

## Parallel Example: User Story 2

```text
T018 Add unreferenced script warnings in src/compiler/discovery.ts or src/compiler/keymap.ts
T019 Attach id/key/path context to errors in src/compiler/errors.ts
```

## Parallel Example: User Story 3

```text
T022 Enforce deterministic ordering in src/compiler/aggregate.ts
T023 Implement atomic write in src/compiler/writer.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate via quickstart.md

### Incremental Delivery

1. Add User Story 2 for actionable errors
2. Add User Story 3 for deterministic ordering and single output
3. Finish with Polish & cross-cutting documentation updates
