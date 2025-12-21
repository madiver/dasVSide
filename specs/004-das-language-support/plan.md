# Implementation Plan: Phase 3 Language Support

**Branch**: `004-das-language-support` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-das-language-support/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Phase 3 delivers a first-class DAS script editing experience in VS Code with a dedicated language mode, conservative syntax highlighting, bracket matching, folding, and symbol navigation for ExecHotkey references. The plan preserves non-destructive editing, offline behavior, and strict separation between .das sources and Hotkey.htk outputs.

## Technical Context

**Language/Version**: TypeScript (VS Code extension standard)  
**Primary Dependencies**: VS Code Extension API; TextMate grammar files; language configuration JSON  
**Storage**: Workspace files only (no external storage)  
**Testing**: Manual validation in VS Code; no automated tests required for Phase 3  
**Target Platform**: Windows VS Code Extension Host  
**Project Type**: single  
**Performance Goals**: Go to Symbol resolves within 2 seconds for a 5,000-line script  
**Constraints**: Offline-only; no language server; no auto-formatting; no build triggers; no Hotkey.htk mutation  
**Scale/Scope**: Single-workspace .das editing with large files and nested control flow  

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
specs/004-das-language-support/
  plan.md              # This file (/speckit.plan command output)
  research.md          # Phase 0 output (/speckit.plan command)
  data-model.md        # Phase 1 output (/speckit.plan command)
  quickstart.md        # Phase 1 output (/speckit.plan command)
  contracts/           # Phase 1 output (/speckit.plan command)
  tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
  commands/
  compiler/
  config/
  language/
  templates/

syntaxes/
language-configuration.json
package.json
README.md
```

**Structure Decision**: Single-project VS Code extension. Language assets live in `syntaxes/` and `language-configuration.json`, while language providers live under `src/language/`.

## Phase 0: Outline & Research

**Research Goal**: Confirm the minimal VS Code language contribution surface for DAS scripts and the symbol extraction approach for ExecHotkey references.

**Research Tasks**:
- Review VS Code language configuration capabilities for comments, brackets, and folding.
- Validate TextMate grammar usage for conservative highlighting in .das files.
- Confirm file-scoped symbol provider expectations for ExecHotkey references.

## Phase 1: Design & Contracts

### DAS Script Grammar Definition (Editor-Only)

**Purpose**: Minimal, tokenization-oriented grammar for editor support. It must tolerate incomplete scripts and must not validate runtime semantics.

**Top-level structure**:
- Scripts consist of semicolon-separated statements.
- Trailing semicolons are optional.
- Statements may span multiple physical lines.

**Statements**:
- Line comments beginning with `//`.
- Assignment statements using `=`, `+=`, `-=`, `*=`, `/=`.
- Command-style statements (command token + arguments).
- Expression statements.

**Control flow constructs**:
- `if` / `else` with parenthesized conditions and block bodies.
- `while` loops with parenthesized conditions and block bodies.
- `return` statements.
- Block bodies delimited by braces.

**Expressions**:
- Logical operators (`||`, `&&`)
- Comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`)
- Arithmetic operators (`+`, `-`, `*`, `/`, `%`)
- Unary operators (`+`, `-`, `!`)
- Parenthesized expressions

**Variables, calls, and property access**:
- Variables prefixed with `$`.
- Function-style calls using parentheses.
- Property access via dot chaining.
- Mixed usage (call followed by property access).

**Lexical elements**:
- Identifiers: letters, digits, underscores.
- Numeric literals: optional decimals and optional percent suffix.
- Double-quoted string literals with escape support.

### Grammar Implementation Strategy

- Use a TextMate grammar for `.das` tokenization.
- Comments and strings take precedence over other tokens.
- Emit token classes for:
  - comments
  - variables
  - strings
  - numbers
  - control-flow keywords
  - command keywords (fixed list maintained in extension)
  - function names
  - property access
  - statement separators
- No dependency on compiler, build system, or import/export logic.

### Sub-Phases with Explicit File-Level Changes

#### Sub-Phase 1: Language identification and file association

**Create**:
- `language-configuration.json`
- `syntaxes/das.tmLanguage.json`

**Modify**:
- `package.json` (add `contributes.languages`, `contributes.grammars`)

**Verification**:
- Opening a `.das` file activates DAS language mode without user configuration.

#### Sub-Phase 2: DAS script grammar definition (editor-only)

**Create**:
- `syntaxes/das.tmLanguage.json` (tokenization grammar)

**Modify**:
- None

**Verification**:
- Grammar loads without errors and tolerates incomplete scripts.

#### Sub-Phase 3: Syntax highlighting implementation

**Create**:
- `syntaxes/das.tmLanguage.json` (fixed keyword list for commands)

**Modify**:
- None

**Verification**:
- Commands, variables, numbers, strings, comments, and control flow are visibly distinct.

#### Sub-Phase 4: Structural awareness and navigation support

**Create**:
- `src/language/execHotkeySymbolProvider.ts`

**Modify**:
- `src/extension.ts` (register symbol provider for DAS language)

**Rules**:
- Symbols extracted from current file only.
- Extract references anywhere in the file (including comments and strings).

**Verification**:
- Outline and Go to Symbol list ExecHotkey references within 2 seconds on a 5,000-line file.

#### Sub-Phase 5: Editor behavior and error tolerance

**Modify**:
- `language-configuration.json` (brackets for `()`, `[]`, `{}`; folding markers for keyword pairs)

**Rules**:
- No auto-formatting or reflow.
- Language features remain active with invalid or incomplete syntax.

**Verification**:
- Bracket matching works for `()`, `[]`, `{}`.
- Folding uses keyword pairs (if/endif, for/endfor, etc.).

#### Sub-Phase 6: Packaging and regression verification

**Modify**:
- `README.md` (Phase 3 usage guidance)
- `.vscodeignore` (ensure language assets are packaged)

**Verification**:
- `npm run package` produces a .vsix without warnings.
- Build commands and Hotkey.htk generation remain unchanged.

## Incremental Verification

- Sub-Phase 1: Language mode activates on `.das` files.
- Sub-Phase 2: Grammar loads and tolerates malformed scripts.
- Sub-Phase 3: Highlighting categories are distinct and stable.
- Sub-Phase 4: ExecHotkey symbols appear (current file only).
- Sub-Phase 5: No auto-formatting; folding and brackets work.
- Sub-Phase 6: Packaging succeeds and Phase 1 build flow still works.
- Manual: Compare readability vs DAS Trader editor for representative scripts.

## Explicit Non-Goals (Phase 3)

- Static analysis or safety linting
- Semantic validation of DAS commands
- Runtime correctness checks
- Automatic code formatting
- Dependency graph construction
- SIM/LIVE-specific editor behavior

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
