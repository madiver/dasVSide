# Implementation Plan: Dependency Graph and Navigation

**Branch**: 006-dependency-graph | **Date**: 2025-12-25 | **Spec**: specs/006-dependency-graph/spec.md
**Input**: Feature specification from /specs/006-dependency-graph/spec.md

## Summary
Build an on-demand, advisory dependency graph for DAS .das scripts that extracts ExecHotkey calls and explicit .das path literals, resolves them to script nodes, detects cycles and unused scripts, and provides editor navigation for callers/callees without modifying source files.

## Technical Context

**Language/Version**: TypeScript (VS Code extension standard)
**Primary Dependencies**: VS Code Extension API, existing YAML parser
**Storage**: Workspace files only (.das, keymap.yaml); in-memory cache for analysis results
**Testing**: npm test; npm run lint
**Target Platform**: VS Code extension host (desktop)
**Project Type**: Single extension
**Performance Goals**: Analyze up to 200 scripts in under 3 seconds; cache results for navigation
**Constraints**: Offline-only, extension-host only, non-blocking, deterministic outputs
**Scale/Scope**: Workspaces with 1-200 scripts; tolerate syntax errors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Extension-host only: PASS (all logic runs in extension host)
- TypeScript + standard build: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, git-friendly outputs: PASS (advisory only)
- Packaging constraints: PASS (no native deps, no shelling out)
- Workflow gates: PASS (spec/plan/tasks in place)

## Project Structure

### Documentation (this feature)

`	ext
specs/006-dependency-graph/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
`

### Source Code (repository root)

`	ext
src/
├── commands/
├── compiler/
├── importer/
├── linting/
├── language/
├── config/
└── extension.ts

tests/
`

**Structure Decision**: Single VS Code extension project under src/ with tests/ at root.

## Complexity Tracking

No constitution violations.

## Phase 0: Outline & Research

### Research Tasks

- Confirm ExecHotkey parsing patterns and common variants in .das scripts.
- Confirm detection rules for explicit .das path literals in strings.
- Select cycle detection algorithm and output format for call chains.

### Research Output

Create specs/006-dependency-graph/research.md with decisions, rationale, and alternatives.

## Phase 1: Design & Contracts

### Data Model

Create specs/006-dependency-graph/data-model.md with:
- ScriptNode (path, id, label, outboundRefs, inboundRefs)
- DependencyEdge (fromPath, toPath, referenceType, locations)
- GraphReport (nodes, edges, findings, metadata)
- Finding (type: Cycle, DeadScript, MissingReference; details)

### Contracts

Create specs/006-dependency-graph/contracts/dependency-graph.openapi.yaml describing the analysis results payloads and query interfaces (graph, callers, callees, cycles, dead-scripts). These are internal logical contracts for the extension commands (no external network).

### Quickstart

Create specs/006-dependency-graph/quickstart.md with a manual workflow:
- Open workspace with .das files and keymap.yaml
- Run "Analyze Dependencies" command
- Inspect callers/callees and cycle/dead-script diagnostics

### Agent Context Update

Run .specify/scripts/powershell/update-agent-context.ps1 -AgentType codex after writing Phase 1 artifacts.

## Phase 1 Constitution Re-check

Reconfirm constitution compliance after Phase 1 design. No violations expected.
