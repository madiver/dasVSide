# Implementation Plan: Phase 4 - DAS Script Linting

**Branch**: `004-das-linting` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-das-linting/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Phase 4 introduces advisory static linting for DAS .das scripts in VS Code. The
feature surfaces trading risk, logical hazards, and structural issues inline and
via a manual lint command while keeping builds non-blocking, offline, and
non-destructive.

## Technical Context

**Language/Version**: TypeScript (VS Code extension standard)  
**Primary Dependencies**: VS Code Extension API; existing workspace file access  
**Storage**: Workspace files only (.das, keymap.yaml)  
**Testing**: Manual validation in VS Code; no automated tests required for Phase 4  
**Target Platform**: Windows VS Code Extension Host  
**Project Type**: single  
**Performance Goals**: Inline diagnostics update within 1 second; full lint of 200 .das files in under 10 seconds  
**Constraints**: Offline-only; advisory linting only; no script mutation; no build blocking; no native deps  
**Scale/Scope**: Dozens to hundreds of .das scripts with large files

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
specs/004-das-linting/
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
  linting/

syntaxes/
language-configuration.json
package.json
README.md
```

**Structure Decision**: Single-project VS Code extension. Linting logic will live
under `src/linting/` with VS Code integration in `src/extension.ts` and
`src/commands/`.

## Phase 0: Outline & Research

**Research Goal**: Confirm a lightweight linting architecture that stays
advisory, offline, and fast without introducing heavyweight parsing.

**Research Tasks**:
- Review VS Code diagnostics and debounce strategies for editor responsiveness.
- Confirm a safe, deterministic rule model for static linting without execution.
- Establish a minimal file-mapping approach between keymap.yaml and .das files.

## Phase 1: Design & Contracts

### Linting Architecture & Rule Framework

**Core approach**:
- Use a lightweight tokenizer aligned with Phase 3 grammar tokens and a
  line/statement scanner (regex + minimal state) instead of a full parser.
- Rules are deterministic and stateless per run; findings include severity,
  message, and location.
- Diagnostics are emitted through a VS Code DiagnosticCollection.

### Analysis Strategy

- Input is raw .das text, tokenized with simple patterns (comments, strings,
  keywords, variables).
- Comments and string literals are excluded from rule matches unless a rule
  explicitly targets them.
- Traverse statements by semicolon and brace-aware scanning to reduce false
  positives.
- Incomplete or invalid syntax is tolerated; linting continues with best-effort
  matches and does not cascade failures.

### Rule Model

A lint rule includes:
- id
- severity (info, warning, error)
- description and rationale
- detection logic
- diagnostic message
- optional fix suggestion (text only)

Default severity mapping:
- warnings for trading-risk rules
- errors for broken references (unknown or circular ExecHotkey)
- info for structural or maintenance findings

### Initial Rule Set (Phase 4)

- Dangerous commands (CXL ALL, PANIC, SEND=Reverse)
- Order hazards (market orders without size/route)
- Repeated BUY/SELL without exit patterns
- Missing/suspicious STOP logic
- Infinite/unbounded loops
- Early returns skipping cleanup logic
- Object property use without IsObj checks
- ExecHotkey with unknown identifiers
- Unused scripts (not referenced by keymap.yaml)
- Duplicate hotkey identifiers
- Scripts not referenced by keymap.yaml
- Circular ExecHotkey call chains
- Excessive ExecHotkey chain depth

### Sub-Phases with Explicit File-Level Changes

#### Sub-Phase 1: Linting architecture and framework setup

**Create**:
- `src/linting/types.ts`
- `src/linting/rules/README.md`
- `src/linting/rules/index.ts`
- `src/linting/engine.ts`

**Modify**:
- None

**Verification**:
- Lint engine can run over a .das string and return findings without VS Code.

#### Sub-Phase 2: Script analysis and traversal strategy

**Create**:
- `src/linting/scanner.ts`
- `src/linting/tokenizer.ts`

**Modify**:
- `src/linting/engine.ts`

**Verification**:
- Scanner tolerates malformed scripts and still emits findings.

#### Sub-Phase 3: Definition and implementation of initial lint rules

**Create**:
- `src/linting/rules/dangerousCommands.ts`
- `src/linting/rules/orderHazards.ts`
- `src/linting/rules/controlFlow.ts`
- `src/linting/rules/objectUsage.ts`
- `src/linting/rules/structure.ts`
- `src/linting/rules/execHotkeyGraph.ts`

**Modify**:
- `src/linting/rules/index.ts`

**Verification**:
- Sample scripts trigger expected warnings and errors.

#### Sub-Phase 4: Diagnostic reporting and editor integration

**Create**:
- `src/linting/diagnostics.ts`
- `src/commands/lintScripts.ts`

**Modify**:
- `src/extension.ts` (register diagnostics + command)
- `package.json` (add lint command)

**Verification**:
- Inline diagnostics appear on open/edit; manual lint command runs workspace scan.
- Optional lint-on-build emits warnings only.
- Lint-on-build emits warnings only and does not block builds.

#### Sub-Phase 5: Configuration and rule control

**Create**:
- `src/linting/config.ts`

**Modify**:
- `package.json` (add settings for enabling/disabling rules + severity overrides)

**Verification**:
- Changing settings updates diagnostics without restart.

#### Sub-Phase 6: Performance safeguards and regression checks

**Modify**:
- `src/linting/engine.ts` (caps on file count, rule runtime limits)
- `src/linting/execHotkeyGraph.ts` (max depth and cycle guardrails)
- `README.md` (Phase 4 linting usage)
- `.vscodeignore` (ensure linting assets are packaged if needed)

**Verification**:
- Linting remains responsive on large workspaces and respects depth limits.
- `npm run package` succeeds.
- Phase 1 build command still functions and ignores lint warnings.

## Incremental Verification

- Sub-Phase 1: Lint engine runs on a sample string and yields findings.
- Sub-Phase 2: Scanner continues with malformed scripts.
- Sub-Phase 3: Each rule triggers on a minimal example file.
- Sub-Phase 4: Diagnostics show inline and manual lint command returns results.
- Sub-Phase 5: Severity changes apply immediately.
- Sub-Phase 6: Performance guardrails hold and packaging succeeds.
- Manual: Compare linting value vs DAS Trader editor for risk detection.

## Explicit Non-Goals (Phase 4)

- Automatic fixes or code rewriting
- Enforcement of coding standards
- Runtime simulation or backtesting
- Market data validation
- Blocking builds based on lint results
- Legal or compliance guarantees

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
