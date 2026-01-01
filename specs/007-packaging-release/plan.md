# Implementation Plan: Packaging, Polish, and Public Release
**Branch**: 007-packaging-release | **Date**: 2025-12-26 | **Spec**: specs/007-packaging-release/spec.md
**Input**: Feature specification from /specs/007-packaging-release/spec.md

## Summary
Prepare the DAS Trader Hotkey Tools extension for public release by hardening packaging, offline readiness, documentation, command UX consistency, and release hygiene without changing core functionality or compiled outputs.

## Technical Context
**Language/Version**: TypeScript (VS Code extension standard)
**Primary Dependencies**: VS Code Extension API, @vscode/vsce, yaml
**Storage**: Workspace files, documentation files, VSIX release artifact
**Testing**: npm test; npm run lint
**Target Platform**: VS Code extension host (desktop)
**Project Type**: Single extension
**Performance Goals**: Packaging and validation steps complete within 2 minutes on a typical developer machine
**Constraints**: Offline-only after install, no native dependencies, deterministic outputs, no new functional changes
**Scale/Scope**: Single extension with user docs and release metadata

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
specs/007-packaging-release/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- release-checklist.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- commands/
|-- compiler/
|-- config/
|-- dependency/
|-- importer/
|-- language/
|-- linting/
|-- templates/
|-- test/
|-- views/
`-- extension.ts
```

**Structure Decision**: Single VS Code extension under src/ with documentation and release assets at repo root.

## Complexity Tracking

No constitution violations.

## Phase 0: Outline & Research

### Research Tasks

- Confirm VS Code Marketplace and VSIX packaging expectations for extensions.
- Confirm offline operation validation steps for build and import workflows.
- Confirm packaging validation coverage for Windows and macOS.
- Define release metadata expectations (versioning, changelog) aligned with VS Code guidance.

### Research Output

Create specs/007-packaging-release/research.md with decisions, rationale, and alternatives.

## Phase 1: Design & Contracts

### Data Model

Create specs/007-packaging-release/data-model.md covering release artifacts, documentation set, command catalog, and changelog entries.

### Contracts

Create specs/007-packaging-release/contracts/packaging-release.openapi.yaml describing internal packaging/validation checkpoints for documentation and release artifacts.

### Quickstart

Create specs/007-packaging-release/quickstart.md with a manual workflow to package, install, and validate offline use on Windows and macOS.

### Agent Context Update

Run .specify/scripts/powershell/update-agent-context.ps1 -AgentType codex after writing Phase 1 artifacts.

## Phase 1 Constitution Re-check

Reconfirm constitution compliance after Phase 1 design. No violations expected.
