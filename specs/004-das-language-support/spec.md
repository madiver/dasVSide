# Feature Specification: Phase 3 Language Support

**Feature Branch**: `004-das-language-support`  
**Created**: 2025-12-21  
**Status**: Draft  
**Input**: User description: "Phase 3 language support and editor experience for DAS .das scripts: language definition, highlighting, bracket matching, navigation, folding, non-destructive editing, error tolerance, file association, packaging continuity."

## Clarifications

### Session 2025-12-21

- Q: Should Go to Symbol list ExecHotkey-referenced names from the current file only, workspace-wide, or only labeled references? -> A: Current file only.
- Q: How should DAS command tokens be highlighted? -> A: Fixed keyword list maintained in the extension.
- Q: How should folding be handled for DAS scripts? -> A: Keyword pair folding (if/endif, for/endfor, etc.).
- Q: Which bracket characters must be matched? -> A: Parentheses, brackets, and braces only.
- Q: Where should ExecHotkey references be extracted from? -> A: Anywhere in the file, including comments and strings.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open and read DAS scripts (Priority: P1)

As a DAS script author, I want .das files to open in a DAS language mode with clear syntax highlighting and bracket awareness so I can read and edit scripts confidently inside VS Code.

**Why this priority**: This is the core editor experience and the minimum useful outcome for Phase 3.

**Independent Test**: Open a .das file and confirm the language mode, syntax coloring, and bracket matching are active without running any build command.

**Acceptance Scenarios**:

1. **Given** a workspace with a .das file, **When** I open it, **Then** the file uses the DAS language mode and shows highlighting for commands, variables, strings, numbers, and comments.
2. **Given** a .das file with nested control flow, **When** I move the cursor over matching brackets, **Then** the editor highlights the matching pair.

---

### User Story 2 - Navigate large scripts (Priority: P2)

As a DAS script author, I want to navigate large scripts quickly using symbols and folding so I can find sections and referenced hotkeys without scrolling.

**Why this priority**: Navigation and folding provide the biggest productivity boost beyond basic highlighting.

**Independent Test**: Open a .das file with ExecHotkey references and control flow blocks, then use the Outline view and folding to move between sections.

**Acceptance Scenarios**:

1. **Given** a .das file with ExecHotkey calls, **When** I open the Outline or Go to Symbol, **Then** I see symbols for each referenced hotkey name.
2. **Given** a .das file with control flow blocks, **When** I use folding controls, **Then** script blocks collapse and expand without altering file contents.

---

### User Story 3 - Edit without disruption (Priority: P3)

As a DAS script author, I want the editor to tolerate incomplete scripts and avoid automatic formatting so I can work safely without losing my formatting.

**Why this priority**: Non-destructive editing and error tolerance are required for predictable script authoring.

**Independent Test**: Open a .das file with incomplete syntax and confirm language features still work and no content changes occur.

**Acceptance Scenarios**:

1. **Given** a .das file with a missing quote or partial statement, **When** I open the file, **Then** syntax highlighting and navigation still function without crashing.
2. **Given** a .das file, **When** I open, save, or edit it, **Then** the extension does not reformat or alter whitespace automatically.

---

### Edge Cases

- Scripts containing unterminated strings or unmatched brackets.
- ExecHotkey references that appear inside comments or quoted strings.
- Very large .das files (thousands of lines) with nested control flow.
- Mixed line endings or unusual spacing between tokens.
- Unrecognized commands that should remain plain text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST associate .das files with a DAS language mode automatically when opened.
- **FR-002**: The DAS language mode MUST highlight DAS commands, variables, numbers, strings, comments, and control flow keywords distinctly using a fixed command keyword list curated and versioned in the repository (not inferred at runtime).
- **FR-003**: The language mode MUST support line comments using `//`.
- **FR-004**: The language mode MUST treat semicolons as statement separators for highlighting purposes.
- **FR-005**: Variables prefixed with `$` MUST be highlighted as variables.
- **FR-006**: Bracket matching MUST be enabled for parentheses, brackets, and braces only.
- **FR-007**: Folding MUST be available for control flow keyword pairs (e.g., if/endif, for/endfor) where supported by the editor.
- **FR-008**: The extension MUST provide Go to Symbol entries for ExecHotkey-referenced hotkey names from the current file only, including references found in comments and strings.
- **FR-009**: Syntax highlighting and navigation MUST continue to work on incomplete or invalid scripts.
- **FR-010**: The extension MUST NOT auto-format, reflow, or modify DAS script files unless explicitly requested by the user.
- **FR-011**: Opening a .das file MUST NOT trigger build or compile actions automatically.
- **FR-012**: Language support MUST not depend on the build system or mutate Hotkey.htk.
- **FR-013**: Language support MUST work fully offline with no external language servers or runtimes.
- **FR-014**: The extension MUST remain packagable as a .vsix without additional dependencies.

### Key Entities *(include if feature involves data)*

- **DAS Script File**: A .das source file containing DAS script logic.
- **DAS Language Mode**: The editor mode applied to .das files for highlighting and navigation.
- **Hotkey Symbol**: A named hotkey referenced by ExecHotkey and exposed for navigation.
- **Folding Region**: A collapsible block representing a control flow section.

### Scope and Non-Goals

**In Scope**:

- Language definition for .das files used purely for editor support.
- Syntax highlighting for commands, variables, numbers, strings, comments, and keywords.
- Bracket matching, folding, and symbol navigation for ExecHotkey references.
- Non-destructive editing behavior and error tolerance.

**Out of Scope**:

- Static analysis, linting, or semantic validation.
- Runtime execution or compilation changes.
- Automatic formatting or whitespace normalization.
- Dependency graph visualization or profile-specific editor behavior.

### Dependencies

- Visual Studio Code installed on Windows.

### Assumptions

- DAS scripts use ExecHotkey to reference named hotkeys.
- Control flow keywords include commonly used DAS script constructs such as if, else, for, while, and return.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of .das files opened in VS Code display the DAS language mode without manual configuration.
- **SC-002**: Syntax highlighting visibly distinguishes the required token categories in sample scripts provided for Phase 3.
- **SC-003**: Go to Symbol lists ExecHotkey-referenced hotkeys within 2 seconds for a 5,000-line script.
- **SC-004**: Opening and saving .das files introduces zero automatic whitespace or formatting changes.
- **SC-005**: The extension packages into a .vsix and installs without additional dependencies or warnings.
