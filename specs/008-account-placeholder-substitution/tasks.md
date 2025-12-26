# Tasks: Account Placeholder Substitution

**Input**: Design documents from `/specs/008-account-placeholder-substitution/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Tests are optional and not included because the spec does not request TDD.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: src/, tests/ at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared scaffolding

- [x] T001 Review existing settings schema in src/config/settings.ts
- [x] T002 [P] Review build pipeline entry points in src/commands/buildHotkeyFile.ts and src/compiler/
- [x] T003 [P] Inventory current warning/logging patterns in src/commands/outputChannel.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define placeholder substitution utility interface in src/compiler/placeholders.ts
- [x] T005 Define settings keys and defaults for Live/Simulated accounts in src/config/settings.ts
- [x] T006 Define warning aggregation model in src/compiler/warnings.ts for placeholder types

**Checkpoint**: Substitution interface, settings keys, and warning model defined

---

## Phase 3: User Story 1 - Replace Account Placeholders on Build (Priority: P1) MVP

**Goal**: Replace placeholders in build output without exposing account numbers in source files

**Independent Test**: Build a workspace with placeholders and verify Hotkey.htk output contains substituted values

### Implementation for User Story 1

- [x] T007 [US1] Implement exact-token replacement in src/compiler/placeholders.ts
- [x] T008 [US1] Integrate placeholder substitution into src/compiler/compileHotkeys.ts
- [x] T009 [US1] Ensure substitutions apply only to script bodies in src/compiler/encoder.ts
- [x] T010 [US1] Verify no changes to .das or keymap.yaml during build (document in outputChannel if needed)

**Checkpoint**: Build output replaces placeholders deterministically

---

## Phase 4: User Story 2 - Safe Behavior When Settings Are Missing (Priority: P2)

**Goal**: Warn on missing settings and keep placeholders intact

**Independent Test**: Clear a setting, build, and verify warning + placeholders preserved

### Implementation for User Story 2

- [x] T011 [US2] Add missing-setting detection in src/compiler/placeholders.ts
- [x] T012 [US2] Emit one warning per placeholder type via src/compiler/warnings.ts
- [x] T013 [US2] Update src/commands/buildHotkeyFile.ts to surface warnings and list affected scripts in output channel

**Checkpoint**: Missing settings produce non-blocking warnings with script list

---

## Phase 5: User Story 3 - Deterministic, Source-Safe Substitution (Priority: P3)

**Goal**: Ensure deterministic builds and no source modifications

**Independent Test**: Run build twice with same settings and confirm byte-for-byte identical output

### Implementation for User Story 3

- [x] T014 [US3] Ensure placeholder substitution is deterministic in src/compiler/placeholders.ts
- [x] T015 [US3] Add build-time check to avoid mutating source data structures in src/compiler/compileHotkeys.ts

**Checkpoint**: Repeated builds remain identical and source files unchanged

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T016 [P] Update README.md with new Live/Simulated settings and placeholder behavior
- [x] T017 [P] Update specs/008-account-placeholder-substitution/quickstart.md to reflect final workflow
- [x] T018 Review output message tone for new warnings in src/commands/buildHotkeyFile.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational
- **User Story 2 (P2)**: Starts after Foundational; uses output of User Story 1
- **User Story 3 (P3)**: Starts after Foundational; depends on P1/P2

### Parallel Opportunities

- T002 and T003 can run in parallel
- T016 and T017 can run in parallel

---

## Parallel Example: User Story 1

```text
- [x] T007 [US1] Implement exact-token replacement in src/compiler/placeholders.ts
- [x] T008 [US1] Integrate placeholder substitution into src/compiler/compileHotkeys.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate placeholder substitution in output

### Incremental Delivery

1. Add User Story 1 -> Validate substitutions in output
2. Add User Story 2 -> Validate warnings and placeholder preservation
3. Add User Story 3 -> Validate determinism and no source changes
4. Final polish tasks -> Validate docs and messaging

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
