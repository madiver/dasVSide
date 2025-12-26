# Tasks: Dependency Graph and Navigation

**Input**: Design documents from /specs/006-dependency-graph/
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

- [X] T001 Create dependency graph data types in src/dependency/types.ts
- [X] T002 [P] Define dependency extraction patterns in src/dependency/callPatterns.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Implement dependency parser in src/dependency/parser.ts
- [X] T004 Implement keymap loader in src/dependency/keymap.ts
- [X] T005 Implement reference resolution helpers in src/dependency/resolve.ts
- [X] T006 Implement graph builder in src/dependency/graph.ts
- [X] T007 Implement analysis cache in src/dependency/cache.ts
- [X] T008 Implement analysis orchestrator in src/dependency/analyzer.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate Dependency Graph (Priority: P1) 🎯 MVP

**Goal**: On-demand analysis that produces a call graph and summary output

**Independent Test**: Run the Analyze Dependencies command and confirm a graph summary is produced for a fixture workspace

### Implementation for User Story 1

- [X] T009 [US1] Implement analysis command in src/commands/analyzeDependencies.ts
- [X] T010 [US1] Register analyze command in src/extension.ts
- [X] T011 [US1] Contribute analyze command and activation event in package.json

**Checkpoint**: Dependency graph generation works on demand and outputs a summary

---

## Phase 4: User Story 2 - Identify Cycles and Dead Scripts (Priority: P2)

**Goal**: Detect cycles and dead scripts and surface advisory diagnostics

**Independent Test**: Run analysis on a fixture with a cycle and a dead script and verify warnings

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement cycle detection in src/dependency/cycles.ts
- [X] T013 [P] [US2] Implement dead-script detection in src/dependency/deadScripts.ts
- [X] T014 [US2] Integrate cycle/dead findings into analyzer in src/dependency/analyzer.ts
- [X] T015 [US2] Add advisory diagnostics rule in src/linting/rules/dependencyGraph.ts
- [X] T016 [US2] Register dependency graph diagnostics in src/linting/diagnostics.ts

**Checkpoint**: Cycles and dead scripts appear as advisory diagnostics and analysis output

---

## Phase 5: User Story 3 - Navigate Callers and Callees (Priority: P3)

**Goal**: Allow navigation to callers/callees from the editor

**Independent Test**: Invoke Show Callers/Callees and jump to expected locations

### Implementation for User Story 3

- [X] T017 [P] [US3] Implement callers navigation in src/commands/showCallers.ts
- [X] T018 [P] [US3] Implement callees navigation in src/commands/showCallees.ts
- [X] T019 [US3] Register navigation commands in src/extension.ts
- [X] T020 [US3] Contribute navigation commands and context menus in package.json

**Checkpoint**: Navigation commands list and open related scripts from cached analysis

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Optional UI enhancements and documentation validation

- [X] T021 [P] Add dependency tree view in src/views/dependencyTree.ts; register in src/extension.ts and package.json
- [X] T022 Update command output formatting for cycles/dead scripts in src/commands/analyzeDependencies.ts
- [X] T023 Validate workflow steps and performance timing in specs/006-dependency-graph/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational
- **User Story 2 (P2)**: Starts after Foundational; builds on graph output
- **User Story 3 (P3)**: Starts after Foundational; uses cached analysis results

### Parallel Opportunities

- T001 and T002 can run in parallel
- T012 and T013 can run in parallel
- T017 and T018 can run in parallel
- T021 can run in parallel with other polish tasks

---

## Parallel Example: User Story 1

```text
- [ ] T009 [US1] Implement analysis command in src/commands/analyzeDependencies.ts
- [ ] T010 [US1] Register analyze command in src/extension.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate graph output on a fixture workspace

### Incremental Delivery

1. Add User Story 1 → Validate analysis output
2. Add User Story 2 → Validate cycle/dead diagnostics
3. Add User Story 3 → Validate navigation commands
4. Add polish tasks as needed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
