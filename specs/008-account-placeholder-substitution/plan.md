# Implementation Plan: Account Placeholder Substitution

**Branch**: 008-account-placeholder-substitution | **Date**: 2025-12-26 | **Spec**: specs/008-account-placeholder-substitution/spec.md
**Input**: Feature specification from /specs/008-account-placeholder-substitution/spec.md

## Summary
Add Live Account and Simulated Account user-level settings and perform deterministic placeholder substitution during build, replacing exact `%%LIVE%%` and `%%SIMULATED%%` tokens in script bodies while preserving source files and emitting non-blocking warnings when settings are missing.

## Technical Context
**Language/Version**: TypeScript (VS Code extension standard)
**Primary Dependencies**: VS Code Extension API
**Storage**: Workspace files (.das, keymap.yaml) and user-level VS Code settings
**Testing**: npm test; npm run lint
**Target Platform**: VS Code extension host (desktop)
**Project Type**: Single extension
**Performance Goals**: Placeholder substitution adds no noticeable latency to build (sub-second per build)
**Constraints**: Offline-only, deterministic outputs, user-level settings only, no source rewrites
**Scale/Scope**: Workspace builds with up to hundreds of scripts and repeated placeholders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Extension-host only: PASS
- TypeScript + standard build: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, git-friendly outputs: PASS
- Packaging constraints: PASS
- Workflow gates: PASS (spec/plan/tasks in place)

## Project Structure

### Documentation (this feature)

```text
specs/008-account-placeholder-substitution/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- commands/
|-- compiler/
|-- config/
|-- importer/
|-- linting/
|-- dependency/
|-- language/
|-- templates/
|-- test/
`-- extension.ts
```

**Structure Decision**: Use existing single-extension layout; substitution logic lives in compiler utilities and settings/config handling.

## Complexity Tracking

No constitution violations.

## Phase 0: Outline & Research

### Research Tasks

- Confirm best practice for user-level settings storage for sensitive account identifiers.
- Confirm token replacement behavior for exact string matching within script bodies.
- Confirm warning strategy for missing settings with minimal UI noise.

### Research Output

Create specs/008-account-placeholder-substitution/research.md with decisions, rationale, and alternatives.

## Phase 1: Design & Contracts

### Data Model

Create specs/008-account-placeholder-substitution/data-model.md covering account settings, placeholder tokens, and warning outputs.

### Contracts

Create specs/008-account-placeholder-substitution/contracts/account-placeholder-substitution.openapi.yaml describing the build-time substitution workflow and warning outputs.

### Quickstart

Create specs/008-account-placeholder-substitution/quickstart.md with a manual workflow for setting Live/Simulated accounts and validating output substitution.

### Agent Context Update

Run .specify/scripts/powershell/update-agent-context.ps1 -AgentType codex after writing Phase 1 artifacts.

## Phase 1 Constitution Re-check

Reconfirm constitution compliance after Phase 1 design. No violations expected.
