---

description: "Task list template for feature implementation"
---

# Tasks: Phase 4 - DAS Script Linting

**Input**: Design documents from `/specs/004-das-linting/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - none are requested in the feature specification for Phase 4.

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

- [X] T001 Create linting directories `src/linting/` and `src/linting/rules/`
- [X] T002 Add linting README stub in `src/linting/rules/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Define lint rule types and severity model in `src/linting/types.ts`
- [X] T004 Implement lint engine harness in `src/linting/engine.ts`
- [X] T005 Implement tokenizer and scanner in `src/linting/tokenizer.ts` and `src/linting/scanner.ts`
- [X] T006 Implement lint rule registry in `src/linting/rules/index.ts`
- [X] T007 Add configuration loader for lint settings in `src/linting/config.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - See lint warnings while editing (Priority: P1)

**Goal**: Inline lint warnings during editing

**Independent Test**: Open a .das file with risky patterns and confirm inline diagnostics

### Implementation for User Story 1

- [X] T008 [US1] Implement dangerous command rules in `src/linting/rules/dangerousCommands.ts`
- [X] T009 [US1] Implement order hazard rules in `src/linting/rules/orderHazards.ts`
- [X] T010 [US1] Implement control flow rules in `src/linting/rules/controlFlow.ts`
- [X] T011 [US1] Implement object usage rules in `src/linting/rules/objectUsage.ts`
- [X] T012 [US1] Implement structure rules (unused scripts, duplicates) in `src/linting/rules/structure.ts`
- [X] T013 [US1] Implement ExecHotkey graph rules in `src/linting/rules/execHotkeyGraph.ts`
- [X] T014 [US1] Wire rules into engine in `src/linting/engine.ts`
- [X] T015 [US1] Add diagnostics wiring in `src/linting/diagnostics.ts`
- [X] T016 [US1] Register diagnostics on open/edit in `src/extension.ts`
- [X] T017 [US1] Validate linting on malformed .das scripts (unmatched braces, partial statements) in `specs/004-das-linting/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Run linting on demand (Priority: P2)

**Goal**: Manual lint command for full workspace scans

**Independent Test**: Run command and confirm warnings across all .das files

### Implementation for User Story 2

- [X] T018 [US2] Implement lint command in `src/commands/lintScripts.ts`
- [X] T019 [US2] Register lint command in `package.json`
- [X] T020 [US2] Hook lint command into diagnostics pipeline in `src/linting/diagnostics.ts`

**Checkpoint**: User Story 2 is fully functional and testable independently

---

## Phase 5: User Story 3 - Control lint rules and severity (Priority: P3)

**Goal**: Workspace settings for lint rule control

**Independent Test**: Change rule settings and confirm diagnostics update

### Implementation for User Story 3

- [X] T021 [US3] Add configuration schema in `package.json` (enable/disable rules, severity overrides)
- [X] T022 [US3] Apply rule overrides in `src/linting/config.ts`
- [X] T023 [US3] Update diagnostics to respect config changes without restart in `src/linting/diagnostics.ts`

**Checkpoint**: User Story 3 is fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T024 [P] Add performance guardrails (max files, max depth) in `src/linting/engine.ts` and `src/linting/rules/execHotkeyGraph.ts`
- [X] T025 [P] Add optional lint-on-build warnings in `src/commands/buildHotkeyFile.ts`
- [X] T026 [P] Update documentation in `README.md` for linting usage
- [X] T027 [P] Update `.vscodeignore` to ensure linting assets are packaged
- [X] T028 [P] Validate `npm run package` still succeeds

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

- No tests are required for Phase 4
- Core implementation before validation
- Story complete before moving to the next dependent story

### Parallel Opportunities

- T001 and T002 can run in parallel
- T023 through T026 can run in parallel after stories complete

---

## Parallel Example: User Story 1

```bash
Task: "Implement dangerous command rules in src/linting/rules/dangerousCommands.ts"
Task: "Implement order hazard rules in src/linting/rules/orderHazards.ts"
Task: "Implement control flow rules in src/linting/rules/controlFlow.ts"
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
4. Add User Story 3 -> Test independently

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 rules
   - Developer B: User Story 2 command wiring
   - Developer C: User Story 3 configuration
3. Polish tasks run in parallel after stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
