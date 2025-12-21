---

description: "Task list template for feature implementation"
---

# Tasks: Phase 3 Language Support (.das Editor Experience)

**Input**: Design documents from `/specs/004-das-language-support/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - none are requested in the feature specification for Phase 3.

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

- [X] T001 Create language assets folders `syntaxes/` and `src/language/`
- [X] T002 Create `language-configuration.json` for DAS comments, brackets, and folding markers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add DAS language contribution in `package.json` (`contributes.languages`, `contributes.grammars`)
- [X] T004 Create TextMate grammar skeleton in `syntaxes/das.tmLanguage.json`
- [X] T005 Wire language configuration reference in `package.json` (language configuration file path)
- [X] T006 Define fixed command keyword list in `syntaxes/das.tmLanguage.json`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Open and read DAS scripts (Priority: P1)

**Goal**: Open .das files with DAS language mode, highlighting, and bracket matching

**Independent Test**: Open a .das file and confirm the language mode, syntax coloring, and bracket matching

### Implementation for User Story 1

- [X] T007 [US1] Implement token patterns for comments, strings, numbers, variables, and control flow in `syntaxes/das.tmLanguage.json`
- [X] T008 [US1] Configure bracket matching rules in `language-configuration.json`
- [X] T009 [US1] Validate syntax highlighting for commands, variables, numbers, strings, comments, and keywords

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Navigate large scripts (Priority: P2)

**Goal**: Provide symbol navigation and folding for large scripts

**Independent Test**: Open a .das file with ExecHotkey references and use Outline/Go to Symbol and folding

### Implementation for User Story 2

- [X] T010 [US2] Implement ExecHotkey symbol provider in `src/language/execHotkeySymbolProvider.ts` (current file only, include matches in comments/strings)
- [X] T011 [US2] Register symbol provider in `src/extension.ts` for DAS language id
- [X] T012 [US2] Define folding markers for keyword pairs in `language-configuration.json`
- [X] T013 [US2] Validate Go to Symbol and folding behavior for large .das files

**Checkpoint**: User Story 2 is fully functional and testable independently

---

## Phase 5: User Story 3 - Edit without disruption (Priority: P3)

**Goal**: Ensure non-destructive editing and error tolerance

**Independent Test**: Open incomplete .das scripts and confirm language features still work without formatting

### Implementation for User Story 3

- [X] T014 [US3] Confirm grammar tolerates malformed scripts without disabling highlighting
- [X] T015 [US3] Validate no auto-formatting or whitespace changes occur on save

**Checkpoint**: User Story 3 is fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T016 [P] Update `README.md` with Phase 3 editor features and usage
- [X] T017 [P] Update `.vscodeignore` to include language assets for packaging
- [X] T018 [P] Re-run `npm run package`, confirm zero warnings/errors, and verify no new runtime dependencies were introduced
- [X] T019 [P] Validate offline behavior by disabling network access and confirming DAS language features still work

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

- No tests are required for Phase 3
- Core implementation before validation
- Story complete before moving to the next dependent story

### Parallel Opportunities

- T001 and T002 can run in parallel
- T016 and T017 can run in parallel

---

## Parallel Example: User Story 2

```bash
Task: "Implement ExecHotkey symbol provider in src/language/execHotkeySymbolProvider.ts"
Task: "Define folding markers for keyword pairs in language-configuration.json"
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
4. Add User Story 3 -> Validate error tolerance and non-destructive editing

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
