# Implementation Plan: Phase 1 Core Workflow (.htk Generation)

**Branch**: `002-core-user-workflow` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-core-user-workflow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Phase 1 delivers a complete, deterministic workflow to generate a valid DAS Hotkey.htk file from VS Code using literal templates, strict UTF-8 + CRLF output, and explicit validation/feedback.

## Technical Context

**Language/Version**: TypeScript (VS Code extension standard)
**Primary Dependencies**: VS Code Extension API; filesystem access; @vscode/vsce for packaging
**Storage**: Workspace files and output Hotkey.htk file
**Testing**: Manual validation for Phase 1; automated tests deferred
**Target Platform**: Windows VS Code Extension Host
**Project Type**: single
**Performance Goals**: Build completes within 2 minutes for typical workspaces
**Constraints**: Offline operation; no external runtimes; no native modules; no non-standard shell commands; UTF-8 output with enforced CRLF; no auto-wrapping; template-defined physical line breaks only; no extra metadata beyond records; no maximum line width; deterministic record order; preserve literal ~HH tokens from templates
**Scale/Scope**: Single-workspace build flow; single Hotkey.htk output per run

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Extension-host only runtime: PASS
- TypeScript + standard build pipeline: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, Git-friendly outputs: PASS
- Packaging constraints (.vsix, no native deps, no non-standard shell): PASS
- Workflow artifacts (spec/plan/tasks): PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-core-user-workflow/
+-- plan.md              # This file (/speckit.plan command output)
+-- research.md          # Phase 0 output (/speckit.plan command)
+-- data-model.md        # Phase 1 output (/speckit.plan command)
+-- quickstart.md        # Phase 1 output (/speckit.plan command)
+-- contracts/           # Phase 1 output (/speckit.plan command)
+-- tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
+-- commands/
+-- compiler/
+-- language/
+-- templates/

README.md
```

**Structure Decision**: Single-project extension structure. Core .htk logic lives under src/compiler and src/templates. VS Code glue remains in src/commands and src/extension.ts.

## HTK Format Requirements (Authoritative)

### 3.1 File Encoding and Line Endings
- The .htk file is plain text.
- The file MUST be written using UTF-8 encoding.
- All physical line endings MUST be Windows-style CRLF (`\r\n`).
- Line endings MUST be enforced programmatically; no platform-dependent normalization is allowed.

### 3.2 Hotkey Record Structure
- The .htk file is a sequence of hotkey records concatenated together.
- Each record begins at the start of a physical line with no leading whitespace.
- Each record begins with `KEY_COMBO:HOTKEY_NAME:BODY`.
- `KEY_COMBO` is a keystroke identifier (e.g., Ctrl+Shift+Q) and MAY be empty, in which case the record starts with `:`.
- `HOTKEY_NAME` is a display name and MUST NOT contain colons.
- `BODY` is either Form A or Form B.

### 3.3 Allowed BODY Forms

**Form A – Inline Command Hotkey**
- After the second colon, the remainder of the physical line contains DAS commands separated by semicolons.
- Inline bodies commonly terminate with a literal `~0D~0A` token.
- No additional physical line breaks are introduced inside inline bodies.

**Form B – Script Hotkey**
- After the second colon, BODY begins with a literal prefix of the form `~ 1107:` (tilde, space, numeric id, colon). The numeric id and spacing MUST be preserved exactly as in the template.
- Script content follows immediately after the prefix.
- Logical line breaks inside the script are represented using literal `~0D~0A` tokens.
- Physical CRLF line breaks may wrap long script bodies across multiple physical lines.
- Physical wrapping MUST match the reference example; no arbitrary wrapping or reflow is allowed.

### 3.4 Record Boundaries
- A record ends immediately before the next record header.
- No blank lines or separators are inserted beyond required CRLFs.
- Record order MUST be deterministic and stable.

### 3.5 Script Content Rules
- Script bodies may include `//` comments, DAS commands, `$` variables, quoted strings, and control flow.
- Casing, spacing, punctuation, command ordering, and literal `~HH` tokens (e.g., `~0D~0A`, `~E2~80~99`) MUST be preserved exactly as in templates.
- No automatic formatting, indentation normalization, or line wrapping is permitted.

### 3.6 No Additional Metadata
- No headers, version markers, JSON/YAML, or out-of-structure comments.
- Output must consist solely of concatenated hotkey records.

### 3.7 Line Width and Wrapping
- No maximum line width.
- The generator MUST NOT impose column-based wrapping.
- Physical line breaks occur only where defined by the template.

### 4. Hotkey Template Strategy (Fixed Requirements)
- Convert the reference .htk file into literal templates.
- Identify static segments that must never change.
- Define placeholders and their exact positions.
- Substitute placeholders without altering spacing, casing, line structure, or literal `~HH` tokens.
- No parsing/modifying/round-tripping arbitrary existing .htk files.

### Sub-Phase 1: Command scaffolding and registration

**Files to create**:
- `src/commands/buildHotkeyFile.ts`

**Files to modify**:
- `src/extension.ts`
- `package.json` (command contribution, activation event)

**Verification**:
- Command `DAS: Build Hotkey File` appears in Command Palette.

---

### Sub-Phase 2: Configuration model definition

**Files to create**:
- `src/config/settings.ts`

**Files to modify**:
- `package.json` (configuration schema)

**Notes**:
- Settings must include explicit output path and template placeholders.
- Settings must be reload-safe.

**Verification**:
- Settings appear in VS Code UI with descriptions and types.
- Changes apply without restart.

---

### Sub-Phase 3: .htk format constraints and template strategy

**Files to create**:
- `src/templates/hotkeyTemplates.ts` (literal template strings)
- `src/compiler/formatRules.ts` (structural constraints and constants)

**Files to modify**:
- None

**Notes**:
- Templates must include explicit physical CRLF line breaks.
- No line wrapping or reflow logic is allowed.
- Static vs placeholder segments must be explicit and documented in code comments.
- BODY Form A: inline commands after second colon, semicolon-separated, no physical line breaks.
- BODY Form B: `~ 1107:` prefix (tilde, space, numeric id, colon) preserved exactly; script content uses literal `~0D~0A` tokens and template-defined physical CRLF wrapping.
- Hotkey name must not contain colons; headers must start at beginning of physical line.
- Records are concatenated with no extra metadata or blank separators.

**Verification**:
- Template output matches reference .htk file structure and line breaks.

---

### Sub-Phase 4: Hotkey rendering and placeholder substitution

**Files to create**:
- `src/compiler/renderer.ts` (placeholder substitution only)

**Files to modify**:
- None

**Notes**:
- Renderer must not alter whitespace, casing, or line structure.
- Unresolved placeholders must be detected and rejected.
- No automatic formatting, indentation normalization, or line wrapping is permitted.

**Verification**:
- Rendered output has zero unresolved placeholders.

---

### Sub-Phase 5: Validation and error handling

**Files to create**:
- `src/compiler/validator.ts` (header/body checks, placeholder detection)
- `src/compiler/errors.ts` (user-facing error types)

**Files to modify**:
- `src/commands/buildHotkeyFile.ts`

**Verification**:
- Invalid inputs/configurations produce actionable errors and prevent file creation.

---

### Sub-Phase 6: File writer and overwrite handling

**Files to create**:
- `src/compiler/writer.ts` (UTF-8 + CRLF enforcement)

**Files to modify**:
- `src/commands/buildHotkeyFile.ts`

**Notes**:
- If output exists, user must be prompted to confirm overwrite.
- Writer enforces UTF-8 and CRLF, no platform-dependent normalization.

**Verification**:
- Output file uses CRLF and matches template line breaks.

---

### Sub-Phase 7: User feedback and output

**Files to modify**:
- `src/commands/buildHotkeyFile.ts`

**Notes**:
- Success notification and output path shown.
- Output channel logs validation and generation steps.

**Verification**:
- User sees success notification and path; failures surface clear messages.

---

### Sub-Phase 8: Packaging and regression safety

**Files to modify**:
- `.vscodeignore` (ensure templates and compiled output included)
- `README.md` (Phase 1 quickstart)

**Verification**:
- `vsce package` completes with zero warnings/errors.
- Extension activates and Phase 0 functionality remains intact.

## Command Design

- **DAS: Build Hotkey File**
  - **Purpose**: Generate a single Hotkey.htk file from templates and workspace inputs.
  - **Inputs**: Settings values; workspace .das files; keymap.yaml.
  - **Outputs**: Hotkey.htk at configured output path.
  - **Failures**: Missing inputs/config, validation errors, unresolved placeholders, file write errors; user sees actionable message.

## Configuration Schema (Phase 1)

- `dasHotkeyTools.outputPath` (string, required)
  - **Default**: none (must be set)
  - **Usage**: Output Hotkey.htk location
  - **Constraints**: absolute path allowed; must be writable
  - **Default**: per template variable
  - **Usage**: Placeholder values for templates
  - **Constraints**: must not introduce colons where disallowed

## Core Logic Architecture

- **Templates**: `src/templates/hotkeyTemplates.ts` contains literal records with fixed line breaks.
- **Renderer**: `src/compiler/renderer.ts` performs placeholder substitution only.
- **Validator**: `src/compiler/validator.ts` enforces header/body rules and unresolved placeholder checks.
- **Writer**: `src/compiler/writer.ts` writes UTF-8 with explicit CRLF line endings.
- **Glue**: `src/commands/buildHotkeyFile.ts` handles VS Code inputs, prompts, and messaging.

## Validation Strategy

- Validate each record header matches KEY_COMBO:HOTKEY_NAME: prefix rules.
- Allow empty KEY_COMBO (record starts with `:`) when defined by the template.
- Validate BODY forms A or B; ensure required prefix for script body.
- Ensure no unresolved placeholders remain.
- Ensure output is non-empty and uses CRLF line endings.
- Ensure physical line breaks match template boundaries only.
- Ensure no extra metadata or blank lines are present.
- Ensure record order is deterministic and stable.
- Ensure literal `~HH` tokens from templates are preserved without decoding.

## Incremental Verification

- Sub-phase 1: Command appears in Command Palette.
- Sub-phase 2: Settings appear and reload-safe changes apply.
- Sub-phase 3: Template file matches reference structure.
- Sub-phase 4: Renderer outputs fully resolved text.
- Sub-phase 5: Validation blocks invalid inputs and shows actionable errors.
- Sub-phase 6: Writer outputs UTF-8 + CRLF and respects overwrite prompt.
- Sub-phase 7: Notifications and output channel visible.
- Sub-phase 8: Packaging with vsce succeeds and Phase 0 behavior remains intact.
- Manual: Import generated Hotkey.htk in DAS Trader and confirm hotkeys load and execute.

## Constitution Check (Post-Design)

- Extension-host only runtime: PASS
- TypeScript + standard build pipeline: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, Git-friendly outputs: PASS
- Packaging constraints (.vsix, no native deps, no non-standard shell): PASS
- Workflow artifacts (spec/plan/tasks): PASS

## Complexity Tracking

No constitution violations detected; no complexity exceptions required.
