---

description: "Task list template for feature implementation"
---

# Tasks: VS Code Extension Foundation

**Input**: Design documents from `/specs/001-vscode-extension-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - none are requested in the feature specification for Phase 0.

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

- [x] T001 Scaffold VS Code extension (TypeScript) using the generator; outputs `package.json`, `tsconfig.json`, `src/extension.ts`
- [x] T002 Install dependencies and verify compile script in `package.json`
- [x] T003 [P] Configure ignore rules in `.gitignore` for `node_modules/`, `out/`, and `*.vsix`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Configure TypeScript build output and extension entrypoint in `tsconfig.json` and `package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Run extension in development (Priority: P1)

**Goal**: Activate the extension in the Extension Development Host and run the placeholder command

**Independent Test**: Launch the Extension Development Host and execute the command to see the info toast

### Implementation for User Story 1

- [x] T005 [P] [US1] Add command contribution for `dasHotkeyTools.placeholderCommand` in `package.json`
- [x] T006 [US1] Register command activation and hook in `src/extension.ts`
- [x] T007 [P] [US1] Implement placeholder command handler in `src/commands/placeholderCommand.ts`
- [x] T008 [US1] Wire command handler into activation flow in `src/extension.ts`
- [x] T009 [US1] Validate dev-host run using steps in `specs/001-vscode-extension-foundation/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Package and install extension (Priority: P2)

**Goal**: Package the extension and confirm clean installation in a fresh profile

**Independent Test**: Package to .vsix and run the placeholder command after installation

### Implementation for User Story 2

- [x] T010 [US2] Add `vsce` dev dependency and packaging script in `package.json`
- [x] T011 [US2] Package the extension and confirm `.vsix` output following `specs/001-vscode-extension-foundation/quickstart.md`
- [x] T012 [US2] Install the `.vsix` in a fresh profile and run the command per `specs/001-vscode-extension-foundation/quickstart.md`

**Checkpoint**: User Story 2 is fully functional and testable independently

---

## Phase 5: User Story 3 - Establish stable repository layout (Priority: P3)

**Goal**: Provide stable repository layout and minimal documentation for Phase 1 readiness

**Independent Test**: Verify placeholder directories exist and README instructions work end-to-end

### Implementation for User Story 3

- [x] T013 [P] [US3] Create placeholder directories with tracked files: `src/commands/.gitkeep`, `src/compiler/.gitkeep`, `src/language/.gitkeep`
- [x] T014 [P] [US3] Write minimal setup and packaging instructions in `README.md`

**Checkpoint**: User Story 3 is fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 [P] Re-validate quickstart steps and align wording in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**:
  - User Story 1 depends on Foundational completion
  - User Story 2 depends on User Story 1 completion
  - User Story 3 depends on Setup completion and can run in parallel with User Story 1
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on User Story 1 completion
- **User Story 3 (P3)**: Can start after Setup (Phase 1)

### Within Each User Story

- No tests are required for Phase 0
- Core implementation before validation
- Story complete before moving to the next dependent story

### Parallel Opportunities

- Setup tasks may be split across tooling and repo hygiene
- User Story 3 can proceed in parallel with User Story 1 once Setup completes

---

## Parallel Example: User Story 1

```bash
Task: "Add command contribution for dasHotkeyTools.placeholderCommand in package.json"
Task: "Implement placeholder command handler in src/commands/placeholderCommand.ts"
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
4. Add User Story 3 -> Validate documentation and layout

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 3
3. User Story 2 follows after User Story 1

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
