# Feature Specification: VS Code Extension Foundation

**Feature Branch**: `001-vscode-extension-foundation`  
**Created**: 2025-12-21  
**Status**: Draft  
**Input**: User description: "Phase 0 foundation for DAS Hotkey Tools: scaffold VS Code extension with TypeScript, placeholder command, packaging and install validation, stable repo layout, minimal README; no DAS functionality."

## Clarifications

### Session 2025-12-21

- Q: What is the user-visible confirmation for the placeholder command? → A: Show a VS Code notification (information toast).
- Q: Which packaging approach should be required for Phase 0 validation? → A: Use the standard VS Code packaging tool (vsce) with minimal configuration.
- Q: What environment should be used to validate .vsix installation? → A: Use a fresh VS Code user profile for installation validation.
- Q: How many placeholder commands are required in Phase 0? → A: Exactly one placeholder command.
- Q: What command ID should be used for the placeholder command? → A: Use a single, fixed command ID (dasHotkeyTools.placeholderCommand).

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Run extension in development (Priority: P1)

As a developer, I want to run the extension in the Extension Development Host so I can confirm it activates and a placeholder command executes.

**Why this priority**: Establishes that the project can be developed and run without errors.

**Independent Test**: Launch the Extension Development Host and execute the placeholder command; success is visible activation and command output.

**Acceptance Scenarios**:

1. **Given** a freshly cloned project, **When** the extension is launched in the Extension Development Host, **Then** it activates without errors.
2. **Given** the extension is active, **When** the placeholder command is run from the Command Palette, **Then** a visible confirmation of execution appears.

---

### User Story 2 - Package and install extension (Priority: P2)

As a release tester, I want to package the extension and install the .vsix so I can confirm end users can install and run it.

**Why this priority**: Validates the packaging pipeline and install experience without extra dependencies.

**Independent Test**: Package into a .vsix, install into a clean VS Code environment, and run the placeholder command.

**Acceptance Scenarios**:

1. **Given** the project in a clean workspace, **When** the extension is packaged into a .vsix, **Then** packaging completes without warnings or errors.
2. **Given** the .vsix is installed into a clean VS Code environment, **When** the placeholder command is run, **Then** it executes successfully and shows confirmation.

---

### User Story 3 - Establish stable repository layout (Priority: P3)

As a future contributor, I want a stable repository layout and README instructions so Phase 1 work can start without refactoring.

**Why this priority**: Ensures a consistent foundation for future phases.

**Independent Test**: Verify the repository contains the required directories and README guidance for development, packaging, and installation.

**Acceptance Scenarios**:

1. **Given** the repository root, **When** I inspect the project layout, **Then** the canonical directories for commands, compiler logic, and language support exist (even if empty).
2. **Given** the README, **When** I follow the documented steps, **Then** I can run the extension in development mode, package it, and install the .vsix.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when the placeholder command is invoked before activation completes?
- How does the project behave if packaging is attempted without a prior build?
- What happens if the .vsix is installed into a VS Code environment with no prior extensions?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The project MUST be a Visual Studio Code extension and run all runtime logic within the VS Code extension host.
- **FR-002**: The codebase MUST use TypeScript and the standard VS Code extension build pipeline.
- **FR-003**: The extension MUST activate without errors in the Extension Development Host.
- **FR-004**: The extension MUST register at least one placeholder command.
- **FR-018**: The extension MUST register exactly one placeholder command in Phase 0.
- **FR-005**: The placeholder command MUST be discoverable in the Command Palette.
- **FR-006**: Executing the placeholder command MUST display a visible confirmation to the user.
- **FR-019**: The placeholder command ID MUST be `dasHotkeyTools.placeholderCommand`.
- **FR-016**: The placeholder command MUST show a VS Code notification (information toast) upon execution.
- **FR-007**: The extension MUST be packageable into a .vsix using standard VS Code packaging tools.
- **FR-017**: Packaging validation MUST use the standard VS Code packaging tool (vsce) with minimal configuration.
- **FR-008**: The packaged .vsix MUST install cleanly into a fresh VS Code environment.
- **FR-009**: After installation, the placeholder command MUST execute successfully and show confirmation.
- **FR-010**: The repository MUST include canonical directories for commands, compiler logic, and language support.
- **FR-011**: The repository MUST include ignore rules so generated artifacts and dependencies are not committed.
- **FR-012**: The repository MUST include a minimal README that describes development run steps, packaging, and .vsix installation.
- **FR-013**: The extension MUST not require users to install external runtimes or system dependencies.
- **FR-014**: The extension MUST not rely on native compiled dependencies.
- **FR-015**: The extension MUST not shell out to non-standard system commands.

### Scope and Non-Goals

**In Scope**:

- Establish a stable project scaffold that can be developed, run, packaged, and installed.
- Provide a placeholder command to validate activation and execution.
- Define repository layout for future phases.

**Out of Scope**:

- Any DAS Trader Pro script or hotkey functionality.
- Parsing, encoding, or decoding of DAS scripts or files.
- Language features, syntax highlighting, or linting.
- Import/export, trading, simulation, or market data features.
- Non–VS Code user interface components.

### Dependencies

- A standard Windows installation of Visual Studio Code for development, packaging, and installation validation.
- A fresh VS Code user profile for installation validation.

### Assumptions

- The development environment includes a standard VS Code installation on Windows.
- Packaging and installation validation use a clean VS Code environment with no prior project-specific configuration.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: The extension activates without errors in 3 consecutive Extension Development Host launches.
- **SC-002**: The placeholder command appears in the Command Palette within 5 seconds of VS Code opening.
- **SC-003**: The placeholder command completes and displays confirmation within 2 seconds in 5 consecutive runs.
- **SC-004**: Packaging produces a .vsix with zero warnings or errors.
- **SC-005**: The .vsix installs successfully in a clean VS Code environment and the command executes on first attempt.
