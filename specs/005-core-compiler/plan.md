# Implementation Plan: Phase 5 - Core Compiler and Hotkey Aggregation
**Branch**: `005-core-compiler` | **Date**: 2025-12-25 | **Spec**: `C:\Users\mark\development\dasVSide\specs\005-core-compiler\spec.md`
**Input**: Feature specification from `C:\Users\mark\development\dasVSide\specs\005-core-compiler\spec.md`
**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary
Phase 5 implements the authoritative compiler that aggregates keymap.yaml mappings and .das scripts into a single deterministic Hotkey.htk. The compiler validates inputs, constructs a structured hotkey model, encodes scripts with exact formatting rules, and writes the output atomically via the VS Code command without relying on external tools.

## Technical Context
**Language/Version**: TypeScript (VS Code extension standard)
**Primary Dependencies**: VS Code Extension API; Node.js fs; YAML parser library (pure JS, no native deps)
**Storage**: Workspace files only (.das, keymap.yaml, Hotkey.htk)
**Testing**: Manual validation in VS Code; targeted unit tests for compiler modules as needed
**Target Platform**: Windows VS Code Extension Host
**Project Type**: single
**Performance Goals**: Compile 50 scripts in under 5 seconds; deterministic output for identical inputs
**Constraints**: Offline-only; extension-host only; deterministic output; no script mutation; no native deps
**Scale/Scope**: Dozens to hundreds of .das scripts and one keymap.yaml per workspace

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
C:\Users\mark\development\dasVSide\specs\005-core-compiler\
  plan.md              # This file (/speckit.plan command output)
  research.md          # Phase 0 output (/speckit.plan command)
  data-model.md        # Phase 1 output (/speckit.plan command)
  quickstart.md        # Phase 1 output (/speckit.plan command)
  contracts\           # Phase 1 output (/speckit.plan command)
  tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
C:\Users\mark\development\dasVSide\
  src\
    commands\
    compiler\
    config\
    language\
    linting\
    templates\
    test\
    extension.ts
  syntaxes\
  language-configuration.json
  package.json
  README.md
```

**Structure Decision**: Single-project VS Code extension. Compiler logic will live under `src\compiler\` with command integration in `src\commands\buildHotkeyFile.ts` and shared settings in `src\config\settings.ts`.

## Phase 0: Outline & Research

**Research Goal**: Confirm a deterministic, offline compilation pipeline that matches the Hotkey.htk encoding contract and requires no external runtimes.

**Research Tasks**:
- Confirm Hotkey.htk encoding rules (CRLF, 0D0A tokens, record formatting) and map them to existing compiler format rules.
- Select a pure JS YAML parser for keymap.yaml to avoid native dependencies.
- Validate an atomic write strategy (temp file + rename) that preserves determinism.
- Review VS Code workspace file discovery patterns to keep ordering deterministic.

## Phase 1: Design & Contracts

### Internal Interfaces and Separation

- Compiler modules are isolated under `src\compiler\` and do not depend on linting, language services, or import/export tooling.
- VS Code commands and UI messaging live under `src\commands\`.
- Linting remains advisory only (Phase 4) and must not block compilation output.
- Import phase artifacts (Phase 2) are accepted as-is if they match the keymap schema.

### Data Model (from `data-model.md`)

- Keymap Entry, Script Source, Hotkey, Compilation Result, Compilation Error.
- Hotkey model is the single source of truth for encoding.

### Contracts

- Documentation-only internal contract in `contracts/compiler.openapi.yaml` to describe compile action inputs and outputs.

## Phase 2: Implementation Plan (Incremental Sub-Steps)

### Step 1: Input discovery and workspace validation

**Goal**: Identify relevant workspace inputs and fail fast on missing requirements.

**Create**:
- `src\compiler\discovery.ts` (workspace input discovery helpers)

**Modify**:
- `src\commands\buildHotkeyFile.ts` (use compiler discovery instead of template-only flow)
- `src\compiler\errors.ts` (add missing input error variants)

**Behavior**:
- Find one keymap.yaml (workspace root or configured default) and all .das files.
- Hard errors: no workspace open, missing keymap.yaml, empty keymap.yaml.
- Soft warning: unreferenced .das files (do not block compilation).

**Acceptance Criteria**:
- Missing keymap.yaml returns a clear error with no output.
- Empty keymap.yaml returns a clear error with no output.
- Presence of unreferenced .das files logs a warning but compilation continues.

### Step 2: keymap.yaml parsing and resolution

**Goal**: Parse keymap.yaml into validated entries and resolve scripts.

**Create**:
- `src\compiler\keymap.ts` (schema validation, uniqueness checks, resolution)
- `src\compiler\types.ts` (KeymapEntry, HotkeyModel, CompileResult types)

**Modify**:
- `src\compiler\errors.ts` (duplicate id/key, ambiguous match, invalid entry)

**Behavior**:
- Validate required fields (id, key, label, scriptPath) per schema used by Phase 2 import.
- Enforce unique hotkey ids and unique key combinations.
- Resolve scriptPath relative to workspace root; if resolution yields multiple matches, fail with a list of candidates.

**Acceptance Criteria**:
- Duplicate ids or keys produce a blocking error with conflict details.
- Ambiguous script matches produce a blocking error listing all matches.
- Entries resolve deterministically to a single .das file.

### Step 3: Script loading and normalization

**Goal**: Load scripts as text while preserving formatting and preventing semantic changes.

**Create**:
- `src\compiler\loader.ts` (script loading and normalization)

**Modify**:
- `src\compiler\validator.ts` (script structural checks aligned with spec)

**Behavior**:
- Read scripts as UTF-8 text.
- Normalize line endings internally to a consistent representation for encoding.
- Preserve comments and user formatting; do not rewrite content.
- Reject empty scripts and malformed scripts (unreadable or invalid UTF-8) as blocking errors.

**Acceptance Criteria**:
- Empty script content fails with a clear error tied to source path.
- Malformed scripts fail with a clear error and no output.
- Original script content remains unchanged except internal line ending normalization.

### Step 4: Internal representation construction

**Goal**: Build hotkey models as the single source of truth.

**Create**:
- `src\compiler\model.ts` (hotkey model builder)

**Modify**:
- `src\compiler\types.ts` (add HotkeyModel fields: id, key, label, scriptLength, scriptText, sourcePath)

**Behavior**:
- Instantiate one HotkeyModel per keymap entry after validation and script loading.
- Keep metadata (id/key/label) separate from script text until encoding.

**Acceptance Criteria**:
- Each keymap entry yields exactly one HotkeyModel.
- All required fields are populated and preserved for encoding.

### Step 5: Aggregation and deterministic ordering

**Goal**: Aggregate hotkeys into a stable, reproducible order.

**Create**:
- `src\compiler\aggregate.ts` (ordering logic)

**Behavior**:
- Primary order: keymap.yaml declaration order.
- Secondary order: hotkey id (stable tie-breaker).
- Reject duplicate key or id conflicts (already enforced in Step 2).

**Acceptance Criteria**:
- Identical inputs always produce the same ordering.
- Moving unrelated .das files does not change ordering.

### Step 6: Encoding pipeline

**Goal**: Encode hotkeys into exact Hotkey.htk record format.

**Modify**:
- `src\compiler\formatRules.ts` (newline tokenization and encoding rules)
- `src\compiler\renderer.ts` (render Key:Label:ScriptLength:EncodedScript)

**Behavior**:
- Encode UTF-8 bytes as `~HH` tokens, with CRLF bytes encoded as `~0D~0A`.
- Enforce CRLF line endings in output records.
- Preserve script formatting; apply fixed-width physical wrapping (51 characters per line) and extend lines to avoid splitting `~HH` tokens.

**Acceptance Criteria**:
- Encoding is reversible and produces identical output for identical inputs.
- Record structure matches the known Hotkey.htk contract.

### Step 7: Output generation with atomic writes

**Goal**: Write Hotkey.htk safely and predictably.

**Modify**:
- `src\compiler\writer.ts` (temp file + rename strategy)
- `src\config\settings.ts` (ensure output path determination)

**Behavior**:
- Output path determined from workspace settings (existing configuration).
- Write to temp file in the same directory, then rename to Hotkey.htk.
- If compilation fails, existing output remains unchanged.
- Prompt for overwrite if output exists; cancel leaves output untouched.

**Acceptance Criteria**:
- Failed compilation does not alter the existing Hotkey.htk.
- Successful compilation produces exactly one Hotkey.htk.

### Step 8: Error handling and user feedback

**Goal**: Provide actionable error reporting with context.

**Modify**:
- `src\compiler\errors.ts` (categorize fatal vs warning)
- `src\commands\outputChannel.ts` (standardized output logging)
- `src\commands\buildHotkeyFile.ts` (surface warnings and errors)

**Behavior**:
- Fatal errors stop compilation and prevent output.
- Warnings (unreferenced scripts) are surfaced but do not block output.
- Errors include id/key/path and reference source locations when possible.

**Acceptance Criteria**:
- Errors are human-readable and reference the failing input.
- Output channel shows a clear success or failure summary.

### Step 9: Determinism and regression checks

**Goal**: Ensure reproducible output across runs and environments.

**Modify**:
- `src\compiler\aggregate.ts` (stable ordering enforcement)
- `src\compiler\renderer.ts` (stable encoding operations)
- `specs\005-core-compiler\quickstart.md` (determinism checks)

**Behavior**:
- No timestamps, random values, or environment data in output.
- Two runs on identical inputs yield identical bytes.

**Acceptance Criteria**:
- Manual regression test: compile twice and compare files byte-for-byte.
- Output diffs only change when inputs change.

### Step 10: Integration with other phases

**Goal**: Ensure boundaries between Phase 5 and earlier phases.

**Modify**:
- `src\commands\buildHotkeyFile.ts` (lint-on-build remains advisory only)
- `src\linting\diagnostics.ts` (no compiler dependency)
- `src\language\` (no compiler dependency)

**Behavior**:
- Phase 4 linting may run but never blocks output.
- Phase 3 editor features remain separate from compiler logic.
- Phase 2 import artifacts compile without additional transformation.

**Acceptance Criteria**:
- Linting warnings do not block compilation.
- Import-generated keymap.yaml produces valid output.

### Step 11: Performance and scalability guardrails

**Goal**: Keep compilation responsive for large workspaces.

**Modify**:
- `src\compiler\discovery.ts` (limit file enumeration to workspace scope)
- `src\compiler\loader.ts` (streamlined file reads and batching)

**Behavior**:
- Avoid repeated file system scans.
- Use deterministic, single-pass processing where possible.
- Apply discovery and load guardrails to keep large workspaces responsive.

**Acceptance Criteria**:
- Compilation of 50 scripts completes under 5 seconds on standard hardware.

## Incremental Verification

- Step 1: Missing keymap.yaml fails with an actionable error.
- Step 2: Duplicate id/key and ambiguous paths fail with clear conflict details.
- Step 3: Empty or malformed scripts fail; scripts remain unmodified.
- Step 4: Hotkey models include id, key, label, scriptLength, scriptText, sourcePath.
- Step 5: Ordering follows keymap declaration order with id tie-breaker.
- Step 6: Encoded output matches Hotkey.htk contract (CRLF, 0D0A tokens).
- Step 7: Atomic write leaves no partial outputs; overwrite prompt respected.
- Step 8: Errors and warnings display in output channel with context.
- Step 9: Two successive builds produce byte-identical output.
- Step 10: Linting remains advisory; editor features remain independent.
- Step 11: Large workspaces compile within performance goals.

## Explicit Non-Goals (Phase 5)

- Runtime execution or simulation of scripts.
- Static analysis beyond structural validation and existence checks.
- Automatic rewriting or formatting of script content.
- Environment-specific behavior (SIM vs LIVE).
- Emitting or modifying any file other than Hotkey.htk during compilation.

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
