# Phase 4 Data Model

## Entities

### LintRule

**Purpose**: Defines a deterministic lint check.

**Fields**:
- id (string)
- severity (info | warning | error)
- description (string)
- rationale (string)
- message (string)
- fixSuggestion (string, optional)
- detector (function reference)

### LintFinding

**Purpose**: Represents a single rule match.

**Fields**:
- ruleId (string)
- severity (info | warning | error)
- message (string)
- range (startLine, startCol, endLine, endCol)
- filePath (string)

### LintConfig

**Purpose**: Workspace-level configuration for lint rules.

**Fields**:
- enabled (boolean)
- ruleOverrides (map of ruleId -> severity | disabled)
- debounceMs (number)
- maxFiles (number)
- maxChainDepth (number)

### ScriptIndex

**Purpose**: Mapping between keymap.yaml entries and .das files.

**Fields**:
- scriptName (string)
- filePath (string)
- referencedByKeymap (boolean)

### ExecHotkeyGraph

**Purpose**: Tracks ExecHotkey references and detects cycles.

**Fields**:
- nodes (scriptName)
- edges (scriptName -> scriptName)
- maxDepth (number)

## Relationships

- LintRule produces many LintFindings.
- LintConfig affects which LintRules run and their severities.
- ScriptIndex informs structural rules (unused scripts, missing references).
- ExecHotkeyGraph drives cycle and depth rules.
