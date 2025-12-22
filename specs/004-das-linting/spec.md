# Feature Specification: Phase 4 - DAS Script Linting

**Feature Branch**: `004-das-linting`  
**Created**: 2025-12-21  
**Status**: Draft  
**Input**: User description: "Advisory static linting for DAS .das scripts to surface trading risk, logical hazards, and structural issues without modifying scripts or blocking builds."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See lint warnings while editing (Priority: P1)

As a user editing .das scripts, I want inline lint warnings that highlight risky
or fragile patterns so I can correct them before building hotkeys.

**Why this priority**: Early feedback prevents risky scripts from reaching
Hotkey.htk and delivers immediate user value.

**Independent Test**: Open a .das file with known risky patterns and confirm
warnings appear inline with clear explanations.

**Acceptance Scenarios**:

1. **Given** a .das file containing a dangerous command pattern, **When** I open
   the file, **Then** an inline warning appears on the matching line with a
   clear risk explanation.
2. **Given** a .das file with incomplete or invalid syntax, **When** I edit it,
   **Then** linting continues to show warnings without breaking highlighting or
   navigation.

---

### User Story 2 - Run linting on demand (Priority: P2)

As a user, I want a manual lint command that scans my workspace so I can review
all warnings at once before generating Hotkey.htk.

**Why this priority**: A full scan provides a pre-build safety check without
blocking the build.

**Independent Test**: Run the manual lint command and verify that warnings are
reported for all relevant .das files in the workspace.

**Acceptance Scenarios**:

1. **Given** multiple .das files with different issues, **When** I run the
   manual lint command, **Then** warnings appear for each file in a single
   pass.

---

### User Story 3 - Control lint rules and severity (Priority: P3)

As a user, I want to enable, disable, or change lint severity by workspace
settings so I can tune warnings to my trading environment.

**Why this priority**: Different users need different risk tolerance without
changing scripts or code.

**Independent Test**: Change rule settings in the workspace and confirm the
editor updates diagnostics without restarting.

**Acceptance Scenarios**:

1. **Given** a rule set to warning, **When** I change it to info in settings,
   **Then** the diagnostic severity updates without a restart.

---

### Edge Cases

- What happens when a workspace has hundreds of .das files and large scripts?
- How does the system handle linting when keymap.yaml is missing or empty?
- What happens when a rule is disabled but the pattern still exists in a file?
- How does linting behave when ExecHotkey references are unknown or circular?

## Clarifications

### Session 2025-12-21

- Q: What default severity mapping should apply to lint rules? -> A: Mixed severities (warnings for risk, errors for broken refs, info for maintenance).
## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST lint only .das source files and must not modify
  Hotkey.htk or any .das content.
- **FR-002**: Linting MUST be static and non-executing, and MUST NOT simulate
  trades or validate runtime state.
- **FR-003**: System MUST provide automatic linting on file open and edit with
  debounced updates, plus a manual lint command for full-workspace scans.
- **FR-004**: Lint results MUST appear inline in the editor with severity (info, warning, error) and a clear, human-readable explanation. Default severities MUST be: warnings for trading-risk rules, errors for broken references (unknown or circular ExecHotkey), and info for structural or maintenance findings. Diagnostics MUST map to a precise range when possible; when a range is ambiguous, line-only diagnostics are acceptable.
- **FR-005**: Linting MUST be advisory only and MUST NOT block saving or
  building by default.
- **FR-006**: System MUST support a deterministic lint rule model that includes
  rule id, severity, description/rationale, detection logic, message, and an
  optional fix suggestion (text only).
- **FR-007**: The initial rule set MUST include checks for dangerous commands,
  order and execution hazards, control flow risks, object usage risks, and
  structural or maintenance issues defined in the Phase 4 scope.
- **FR-008**: Linting MUST tolerate incomplete or invalid scripts without
  disabling diagnostics or editor features.
- **FR-009**: Users MUST be able to enable, disable, or change rule severity via
  workspace settings without restarting the editor.
- **FR-010**: Linting MUST integrate with existing build workflows by surfacing
  warnings without changing build output determinism.
- **FR-011**: Linting MUST scale to large workspaces without noticeable editor
  lag during normal editing.
- **FR-012**: Linting MAY run during the build command, but it MUST emit warnings
  only and MUST NOT block or fail builds.

### Key Entities *(include if feature involves data)*

- **DAS Script**: A .das source file containing trading logic.
- **Lint Rule**: A named check with id, severity, and detection criteria.
- **Lint Finding**: A single rule match with location, message, and severity.
- **Lint Configuration**: Workspace-level settings controlling rule behavior.
- **Reference Map**: The workspace mapping between keymap.yaml and .das files.

### Assumptions

- Workspaces store lint settings in editor configuration (workspace scope).
- Missing keymap.yaml is treated as a warning, not a failure.
- Linting remains offline and does not require external services.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A risky pattern introduced during editing surfaces an inline
  diagnostic within 1 second of the change.
- **SC-002**: A manual lint run over 200 .das files completes in under 10
  seconds on a typical developer machine.
- **SC-003**: 100% of lint findings include rule id, severity, and a
  human-readable risk explanation.
- **SC-004**: Builds complete successfully even when lint warnings are present.
- **SC-005**: Changing rule severity in workspace settings updates diagnostics
  without requiring an editor restart.

