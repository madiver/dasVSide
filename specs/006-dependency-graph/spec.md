# Feature Specification: Dependency Graph and Navigation
**Feature Branch**: 006-dependency-graph
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "Dependency graph and navigation for DAS scripts with cycle detection, unused script identification, and editor navigation; advisory, non-blocking, and no source modification."
## Clarifications
### Session 2025-12-25
- Q: Which language constructs should count as dependency edges? → A: ExecHotkey calls plus explicit `.das` path literals found in strings.
- Q: What should be the canonical identity for graph nodes? → A: Script path is canonical; attach keymap id/label metadata when available.
- Q: How should references be resolved to nodes? → A: Resolve ExecHotkey by keymap id and resolve `.das` literals by normalized relative path.
- Q: When should analysis run? → A: On-demand command with cached results for navigation.
- Q: How should parse errors affect analysis? → A: Continue analysis and report warnings per file.
## User Scenarios & Testing *(mandatory)*
### User Story 1 - Generate Dependency Graph (Priority: P1)
As a trader or script maintainer, I want to generate a dependency graph so I can see which scripts call which other scripts and understand call chains without manual searching.
**Why this priority**: Structural visibility is the core value of the feature and enables every other workflow.
**Independent Test**: Can be fully tested by running the analysis on a known workspace and verifying nodes and edges in the report.
**Acceptance Scenarios**:
1. **Given** a workspace with multiple .das files and a keymap.yaml, **When** the user triggers dependency analysis, **Then** a directed graph is produced that lists each script and its outgoing and incoming relationships.
2. **Given** a workspace with a malformed script reference, **When** analysis runs, **Then** the graph is still produced and the unresolved reference is reported as a warning.
---
### User Story 2 - Identify Cycles and Dead Scripts (Priority: P2)
As a maintainer, I want to detect cycles and unused scripts so I can refactor safely and remove dead code.
**Why this priority**: Cycles and dead scripts are common sources of confusion and risk during refactors.
**Independent Test**: Can be tested by using a workspace that includes a known cycle and a known unreferenced script, then verifying the reported findings.
**Acceptance Scenarios**:
1. **Given** scripts that call each other in a loop, **When** analysis runs, **Then** the cycle is reported with a clear call chain.
2. **Given** a script that is not referenced by any hotkey or call edge, **When** analysis runs, **Then** it is reported as unused.
---
### User Story 3 - Navigate Callers and Callees (Priority: P3)
As a developer, I want to jump to callers and callees from the editor so I can quickly inspect related scripts.
**Why this priority**: Navigation enables fast comprehension once relationships are known.
**Independent Test**: Can be tested by invoking a "show callers" or "show callees" action on a script and confirming editor navigation.
**Acceptance Scenarios**:
1. **Given** a script with callers, **When** the user requests the caller list, **Then** the editor provides selectable locations for each caller.
2. **Given** a script with no outgoing calls, **When** the user requests callees, **Then** the editor reports that there are no callees without errors.
---
### Edge Cases
- What happens when a script reference points to a missing file?
- How does the system handle unparseable or partially written scripts?
- What happens when a script calls itself directly?
- How does the system behave when there are no scripts or only one script?
- What happens when the number of scripts is large (hundreds) and analysis is requested?
## Requirements *(mandatory)*
### Functional Requirements
- **FR-001**: System MUST scan all .das files in the workspace and extract cross-script references from ExecHotkey calls and explicit `.das` path literals found in strings.
- **FR-002**: System MUST build a directed graph where nodes represent scripts and edges represent calls.
- **FR-003**: System MUST detect and report cycles, including at least one explicit call path for each cycle.
- **FR-004**: System MUST identify unused scripts that are not referenced by any hotkey entry or call edge.
- **FR-005**: System MUST provide queries for "callers of X" and "callees of Y".
- **FR-006**: System MUST integrate with the editor via commands that trigger analysis and navigation.
- **FR-007**: System MUST surface structural findings as non-blocking diagnostics or advisory messages.
- **FR-008**: System MUST tolerate syntax errors and incomplete scripts by skipping invalid references while still producing a graph.
- **FR-009**: System MUST NOT modify script contents, compiler output, or workspace files as part of analysis.
- **FR-010**: System MUST keep analysis scoped to the active workspace and its keymap.yaml.
### Key Entities *(include if feature involves data)*
- **Script Node**: Represents a .das file with attributes such as id, label, path, and derived call references.
- **Dependency Edge**: Represents a directed reference from a caller script to a callee script.
- **Graph Report**: A structured result containing nodes, edges, and findings.
- **Finding**: A diagnostic item such as Cycle, DeadScript, or MissingReference with context for navigation.
### Assumptions
- Keymap entries define the entry-point scripts for hotkeys, including entries with empty key combinations.
- ExecHotkey calls and explicit `.das` path literals are the primary sources of dependency edges.
- Unknown constructs are ignored rather than treated as errors.
## Success Criteria *(mandatory)*
### Measurable Outcomes
- **SC-001**: A workspace with up to 200 scripts can produce a dependency graph in under 3 seconds on a typical developer machine.
- **SC-002**: 100% of recognized call references are reflected as graph edges in the report for test fixtures.
- **SC-003**: Cycle detection reports at least one clear call chain for each cycle in test fixtures.
- **SC-004**: Unused script detection matches expected results for test fixtures.
- **SC-005**: Users can navigate from a script to a caller or callee within 2 seconds for common workloads.
- **SC-006**: Analysis results are advisory and do not block compilation or editing.
