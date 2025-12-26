# Tasks: Packaging, Polish, and Public Release
**Input**: Design documents from `/specs/007-packaging-release/`
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

- [X] T001 Capture release checklist template in specs/007-packaging-release/release-checklist.md
- [X] T002 [P] Confirm VSIX packaging script documented in package.json and scripts/package-vsce.mjs
- [X] T003 [P] Inventory existing user-facing docs (README.md, CHANGELOG.md, PRODUCT_OVERVIEW.txt, vsc-extension-quickstart.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define release validation checklist for Windows/macOS installs in specs/007-packaging-release/release-checklist.md
- [X] T005 Define offline validation steps (build + import) in specs/007-packaging-release/release-checklist.md
- [X] T006 Define Marketplace metadata audit checklist in specs/007-packaging-release/release-checklist.md
- [X] T007 Define command catalog table in specs/007-packaging-release/release-checklist.md

**Checkpoint**: Release checklist and validation framework ready

---

## Phase 3: User Story 1 - Install and Run Core Workflow (Priority: P1) 🎯 MVP

**Goal**: Ensure packaging, installation, and offline workflows work for first-time users

**Independent Test**: Install VSIX on clean Windows/macOS and complete build/import offline using documented steps

### Implementation for User Story 1

- [X] T008 [US1] Produce VSIX packaging steps in README.md
- [X] T009 [US1] Document offline build/import validation steps in README.md
- [X] T010 [US1] Validate uninstall steps and add to release checklist in specs/007-packaging-release/release-checklist.md
- [X] T011 [US1] Record packaging validation outcomes in specs/007-packaging-release/release-checklist.md

**Checkpoint**: Packaging validation and offline workflows documented and verified

---

## Phase 4: User Story 2 - Understand Usage and Safety Boundaries (Priority: P2)

**Goal**: Provide clear documentation and messaging for advanced non-developer users

**Independent Test**: Follow docs only to complete build/import and interpret warnings/errors

### Implementation for User Story 2

- [X] T012 [US2] Update README.md with tooling boundaries and non-goals
- [X] T013 [US2] Update PRODUCT_OVERVIEW.txt with project structure and workflow summary
- [X] T014 [US2] Update vsc-extension-quickstart.md to match actual commands and usage
- [X] T015 [US2] Add command catalog table to README.md (command id, label, description)
- [X] T016 [US2] Review output message tone and capture improvements list in specs/007-packaging-release/release-checklist.md
- [X] T017 [US2] Audit warning vs error classification in src/commands/, src/importer/, src/compiler/, src/linting/, src/dependency/ and record fixes in specs/007-packaging-release/release-checklist.md

**Checkpoint**: Documentation and messaging align with current behavior

---

## Phase 5: User Story 3 - Release Hygiene and Update Confidence (Priority: P3)

**Goal**: Establish release versioning, changelog clarity, and Marketplace readiness

**Independent Test**: Prepare a release package with changelog entry and metadata audit

### Implementation for User Story 3

- [X] T018 [US3] Update CHANGELOG.md with release format and breaking-change labels
- [X] T019 [US3] Align package.json version with changelog entry
- [X] T020 [US3] Verify Marketplace metadata fields in package.json and record results in specs/007-packaging-release/release-checklist.md
- [X] T021 [US3] Verify license and icon requirements, document results in specs/007-packaging-release/release-checklist.md
- [ ] T022 [US3] Complete Marketplace submission (draft or publish) and record evidence in specs/007-packaging-release/release-checklist.md

**Checkpoint**: Release metadata and changelog aligned and auditable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and regression checks

- [ ] T023 [P] Run smoke workflow checklist (build/import/lint/navigation) and record in specs/007-packaging-release/release-checklist.md
- [X] T024 [P] Validate determinism and offline compliance notes in specs/007-packaging-release/release-checklist.md
- [X] T025 Run final docs accuracy review and sign-off in specs/007-packaging-release/release-checklist.md
- [X] T026 Measure packaging+validation duration and record result in specs/007-packaging-release/release-checklist.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational
- **User Story 2 (P2)**: Starts after Foundational; uses outputs from US1 docs
- **User Story 3 (P3)**: Starts after Foundational; depends on changelog + metadata review

### Parallel Opportunities

- T002 and T003 can run in parallel
- T023 and T024 can run in parallel

---

## Parallel Example: User Story 1

```text
- [ ] T008 [US1] Produce VSIX packaging steps in README.md
- [ ] T009 [US1] Document offline build/import validation steps in README.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate packaging + offline workflows on Windows and macOS

### Incremental Delivery

1. Add User Story 1 → Validate packaging and offline workflows
2. Add User Story 2 → Validate documentation accuracy and tone
3. Add User Story 3 → Validate changelog/versioning/Marketplace readiness
4. Final polish tasks → Validate full regression checklist

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
