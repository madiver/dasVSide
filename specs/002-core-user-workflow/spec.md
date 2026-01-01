# Feature Specification: Phase 1 Core Workflow

**Feature Branch**: `002-core-user-workflow`  
**Created**: 2025-12-21  
**Status**: Draft  
**Input**: User description: "Phase 1 core functionality and user value for DAS Trader Hotkey Tools extension, including primary workflow, commands, configuration, core logic, feedback, error handling, validation, and packaging continuity."

## Clarifications

### Session 2025-12-21

- Q: What is the primary build command name? → A: `DAS: Build Hotkey File`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build hotkey file from workspace (Priority: P1)

As an end user, I want to run `DAS: Build Hotkey File` to convert my workspace hotkey sources into a Hotkey file so I can import it into DAS Trader Pro.

**Why this priority**: This is the primary user value and defines the core workflow.

**Independent Test**: In a workspace with valid hotkey sources, run the build command and verify a Hotkey file is produced with a success message.

**Acceptance Scenarios**:

1. **Given** a workspace with valid hotkey sources, **When** I run the build command, **Then** a Hotkey file is generated and I see a success confirmation.
2. **Given** a workspace with missing or invalid inputs, **When** I run the build command, **Then** I see a clear error message and no partial output is produced.

---

### User Story 2 - Configure the build via settings (Priority: P2)

As a user, I want to configure the build using extension settings so I can adapt the workflow without editing source code.

**Why this priority**: Configuration is required for a stable, reusable workflow.

**Independent Test**: Change a documented setting and verify the next build uses the updated value without restarting VS Code.

**Acceptance Scenarios**:

1. **Given** a documented setting is changed, **When** I run the build command, **Then** the build uses the updated configuration.

---

### User Story 3 - Understand build outcomes (Priority: P3)

As a user, I want clear feedback about build results and errors so I can fix issues quickly.

**Why this priority**: Users need transparent outcomes and actionable errors to complete the workflow.

**Independent Test**: Trigger a known error and verify the message explains the problem and suggested correction.

**Acceptance Scenarios**:

1. **Given** a validation error, **When** I run the build command, **Then** I see a non-technical error message with a suggested fix.

---

### Edge Cases

- What happens when the workspace contains no source files or keymap.yaml is missing?
- What happens when configuration values are missing or malformed?
- What happens when the output file already exists at the configured path and the user declines overwrite?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST provide a primary build command that completes the end-to-end workflow.
- **FR-002**: The primary build command MUST be named `DAS: Build Hotkey File` and be discoverable in the Command Palette.
- **FR-003**: The extension MUST provide a configuration schema in VS Code settings, namespaced under the extension ID.
- **FR-004**: Configuration changes MUST take effect without requiring a VS Code restart when feasible.
- **FR-005**: Core domain logic MUST be isolated from VS Code UI glue code.
- **FR-006**: Core domain logic MUST be independently testable.
- **FR-007**: The extension MUST validate inputs and configuration before running core logic.
- **FR-013**: The build output path MUST be explicitly provided via settings.
- **FR-014**: A valid build MUST require .das source files and a keymap.yaml in the workspace.
- **FR-015**: Build input and output paths MAY be absolute paths outside the workspace.
- **FR-016**: The build MUST generate a single Hotkey.htk output file.
- **FR-017**: If the output file already exists, the user MUST be prompted to confirm overwrite.
- **FR-008**: Errors MUST be user-facing, non-technical, and suggest corrective action when possible.
- **FR-009**: The extension MUST provide visible feedback for successful actions (notification or output channel).
- **FR-010**: The extension MUST maintain clean .vsix packaging and install/uninstall cleanly.
- **FR-011**: The extension MUST function without external runtime dependencies beyond VS Code.
- **FR-012**: The extension MUST avoid native compiled dependencies.

### Key Entities *(include if feature involves data)*

- **Hotkey Source**: User-authored script files that represent the editable source inputs.
- **Keymap Configuration**: Mapping data that links commands to source files.
- **Hotkey Output**: The generated Hotkey file produced by the build command.

### Configuration Keys

- **dasHotkeyTools.outputPath** (string, required): Output Hotkey.htk location; must be writable.

### Scope and Non-Goals

**In Scope**:

- A complete, deterministic build workflow from source files to a Hotkey output.
- Core commands required to support the workflow.
- Settings-based configuration with documentation.
- Clear feedback and error handling.

**Out of Scope**:

- Performance tuning and advanced optimizations.
- Authentication, licensing, or paid gating.
- UI polish beyond functional clarity.
- Enterprise features.

### Dependencies

- Visual Studio Code installed on Windows.

### Assumptions

- The primary task is to build a Hotkey output file from workspace source files using a single command.
- Users are working within a workspace that contains the required source inputs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the primary build workflow in under 2 minutes in a valid workspace.
- **SC-002**: 100% of build attempts produce either a valid output or a clear, actionable error message.
- **SC-003**: Configuration changes are reflected on the next build without restarting VS Code.
- **SC-004**: Packaging produces a .vsix with zero warnings or errors.
- **SC-005**: 90% of users can complete the primary task on the first attempt with the provided feedback.









