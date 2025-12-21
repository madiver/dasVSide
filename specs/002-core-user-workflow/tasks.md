---

description: "Task list template for feature implementation"
---

# Tasks: Phase 1 Core Workflow (.htk Generation)

**Input**: Design documents from `/specs/002-core-user-workflow/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - none are requested in the feature specification for Phase 1.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create Phase 1 directories `src/templates/` and `src/config/` with placeholder files in `src/templates/.gitkeep` and `src/config/.gitkeep`
- [X] T002 Add output channel utility in `src/commands/outputChannel.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Define configuration schema in `package.json` under `contributes.configuration`
- [X] T004 Implement settings loader/validator in `src/config/settings.ts`
- [X] T005 Create HTK template module in `src/templates/hotkeyTemplates.ts` with literal records from the reference file
- [X] T006 Define format rules/constants in `src/compiler/formatRules.ts`
- [X] T007 Implement renderer for placeholder substitution in `src/compiler/renderer.ts`
- [X] T008 Implement validator in `src/compiler/validator.ts` for headers (including empty KEY_COMBO), BODY forms, placeholders, deterministic record ordering, and ~HH token preservation
- [X] T009 Implement writer enforcing UTF-8 and CRLF in `src/compiler/writer.ts`
- [X] T010 Define user-facing error types in `src/compiler/errors.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Build hotkey file from workspace (Priority: P1)

**Goal**: Run `DAS: Build Hotkey File` to generate a single valid Hotkey.htk file

**Independent Test**: In a valid workspace, run the command and confirm a Hotkey.htk file is generated at the configured path

### Implementation for User Story 1

- [X] T011 [US1] Register `DAS: Build Hotkey File` command contribution in `package.json`
- [X] T012 [US1] Add command handler in `src/commands/buildHotkeyFile.ts` that loads settings, templates, validates, writes output
- [X] T013 [US1] Wire command registration in `src/extension.ts`
- [X] T014 [US1] Implement overwrite confirmation prompt in `src/commands/buildHotkeyFile.ts`
- [X] T015 [US1] Validate successful build flow using `specs/002-core-user-workflow/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Configure the build via settings (Priority: P2)

**Goal**: Settings updates change build behavior without restarting VS Code

**Independent Test**: Modify a setting and confirm the next build uses the new value

### Implementation for User Story 2

- [X] T016 [US2] Add settings documentation in `package.json` (descriptions, defaults, constraints)
- [X] T017 [US2] Ensure reload-safe settings handling in `src/config/settings.ts`
- [X] T018 [US2] Validate settings change behavior by rebuilding with updated values

**Checkpoint**: User Story 2 is fully functional and testable independently

---

## Phase 5: User Story 3 - Understand build outcomes (Priority: P3)

**Goal**: Provide clear feedback for success and failure

**Independent Test**: Trigger a validation error and confirm actionable messaging

### Implementation for User Story 3

- [X] T019 [US3] Add success and error notifications in `src/commands/buildHotkeyFile.ts`
- [X] T020 [US3] Log build steps to output channel in `src/commands/outputChannel.ts`
- [X] T021 [US3] Validate error messaging with missing inputs or unresolved placeholders

**Checkpoint**: User Story 3 is fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T022 [P] Update `README.md` with Phase 1 workflow and configuration usage
- [X] T023 [P] Update `.vscodeignore` to include templates and compiled output
- [X] T024 [P] Re-run `vsce package` and confirm zero warnings/errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**:
  - User Story 1 depends on Foundational completion
  - User Story 2 depends on User Story 1 completion
  - User Story 3 depends on User Story 1 completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on User Story 1 completion
- **User Story 3 (P3)**: Depends on User Story 1 completion

### Within Each User Story

- No tests are required for Phase 1
- Core implementation before validation
- Story complete before moving to the next dependent story

### Parallel Opportunities

- T001 and T002 can run in parallel
- T022 and T023 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Register DAS: Build Hotkey File command contribution in package.json"
Task: "Add command handler in src/commands/buildHotkeyFile.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently
3. Add User Story 2 -> Test independently
4. Add User Story 3 -> Validate feedback and errors

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Polish tasks run in parallel after stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
