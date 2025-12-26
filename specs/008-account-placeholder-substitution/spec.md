# Feature Specification: Account Placeholder Substitution

**Feature Branch**: `008-account-placeholder-substitution`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "Add Live Account and Simulated Account settings to replace %%LIVE%% and %%SIMULATED%% in scripts during build; warn if unset and leave placeholders."

## Clarifications
### Session 2025-12-26
- Q: Should placeholders be replaced inside comments or quoted strings? → A: Replace everywhere in script bodies, including comments and quoted strings.
- Q: Where should account settings be stored? → A: User-level settings only (not workspace).
- Q: How should warnings be emitted when settings are missing? → A: Warn once per build per placeholder type and list affected scripts in the output channel.
- Q: What kind of token matching should be used? → A: Exact token matches only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Replace Account Placeholders on Build (Priority: P1)

As an advanced DAS Trader user, I want to configure Live and Simulated account settings so the build replaces account placeholders in script bodies without exposing account numbers in shared source files.

**Why this priority**: This is the core privacy and workflow benefit of the feature.

**Independent Test**: Can be tested by building a workspace with placeholders and verifying the compiled Hotkey.htk contains substituted values.

**Acceptance Scenarios**:

1. **Given** a script containing `%%LIVE%%` and `%%SIMULATED%%` and both settings are set, **When** I run the build command, **Then** every placeholder in the compiled output is replaced with the configured values.
2. **Given** a workspace with no placeholder tokens, **When** I run the build command, **Then** the compiled output is unchanged by the substitution logic.

---

### User Story 2 - Safe Behavior When Settings Are Missing (Priority: P2)

As a user sharing scripts, I want the build to warn me when account settings are missing and leave placeholders intact so I can build safely without leaking account numbers.

**Why this priority**: Builds must remain non-blocking while still alerting the user to missing substitutions.

**Independent Test**: Can be tested by clearing a setting, running build, and verifying warnings plus preserved placeholders.

**Acceptance Scenarios**:

1. **Given** a script containing `%%LIVE%%` and the Live Account setting is empty, **When** I run the build command, **Then** the build completes, emits a warning, and leaves `%%LIVE%%` unchanged in the output.
2. **Given** both settings are empty and placeholders are present, **When** I run the build command, **Then** the build completes with warnings for both placeholder types and leaves all placeholders intact.

---

### User Story 3 - Deterministic, Source-Safe Substitution (Priority: P3)

As a user, I want placeholder substitution to be deterministic and non-destructive so repeated builds are stable and my source files are never modified.

**Why this priority**: Deterministic output and source integrity are required by project constraints.

**Independent Test**: Can be tested by building twice with the same inputs and verifying identical output while source files remain unchanged.

**Acceptance Scenarios**:

1. **Given** unchanged inputs and settings, **When** I run build twice, **Then** the outputs are byte-for-byte identical.
2. **Given** any build run, **When** the command completes, **Then** `.das` files and `keymap.yaml` remain unmodified.

---

### Edge Cases

- What happens when a placeholder appears multiple times in a single script?
- What happens when placeholders appear inside comments or quoted strings? (They are replaced.)
- What happens when both settings resolve to the same value?
- What happens when text contains similar strings (for example `%%LIVESTOCK%%`) that should not be replaced? (No replacement.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose settings for Live Account and Simulated Account as user-configurable strings.
- **FR-002**: The build process MUST replace exact `%%LIVE%%` tokens in script bodies with the Live Account setting value.
- **FR-003**: The build process MUST replace exact `%%SIMULATED%%` tokens in script bodies with the Simulated Account setting value.
- **FR-004**: Placeholder replacement MUST apply only to script bodies (including comments and quoted strings) and MUST NOT alter labels, keys, file paths, or other metadata.
- **FR-005**: If a placeholder is present and the corresponding setting is empty or unset, the build MUST complete, emit a warning, and leave the placeholder unchanged.
- **FR-006**: All occurrences of each placeholder token MUST be replaced when a setting is provided.
- **FR-007**: Placeholder substitution MUST be deterministic for the same inputs and settings.
- **FR-008**: The build MUST NOT modify `.das` files or `keymap.yaml` when performing substitution.
- **FR-009**: Warnings for missing settings MUST identify which placeholder type is missing and reference the affected script when available.
- **FR-010**: Live Account and Simulated Account settings MUST be user-level settings and MUST NOT be stored in workspace configuration.
- **FR-011**: When settings are missing, warnings MUST be emitted once per build per placeholder type and the output channel MUST list affected scripts.
- **FR-012**: Placeholder replacement MUST only occur on exact `%%LIVE%%` and `%%SIMULATED%%` token matches.

### Key Entities *(include if feature involves data)*

- **Live Account Setting**: User-provided account identifier used to replace `%%LIVE%%` tokens.
- **Simulated Account Setting**: User-provided account identifier used to replace `%%SIMULATED%%` tokens.
- **Placeholder Token**: The exact string token (`%%LIVE%%` or `%%SIMULATED%%`) embedded in script text.
- **Replacement Warning**: A user-facing warning emitted when a placeholder cannot be replaced.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With both settings populated, 100% of `%%LIVE%%` and `%%SIMULATED%%` tokens are replaced in the compiled Hotkey.htk output.
- **SC-002**: With a missing setting, the build completes and emits a warning while leaving the corresponding placeholders unchanged.
- **SC-003**: Rebuilding with identical inputs and settings produces byte-for-byte identical output.
- **SC-004**: `.das` files and `keymap.yaml` remain unchanged after builds that perform substitution.
- **SC-005**: Missing-setting warnings appear once per placeholder type and the output channel lists affected scripts.
