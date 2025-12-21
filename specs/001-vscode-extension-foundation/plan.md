# Implementation Plan: VS Code Extension Foundation

**Branch**: `001-vscode-extension-foundation` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-vscode-extension-foundation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Phase 0 establishes a minimal VS Code extension scaffold in TypeScript, validates activation and a single placeholder command, and confirms packaging and installation via a .vsix without external dependencies.

## Technical Context

**Language/Version**: TypeScript (VS Code extension standard)  
**Primary Dependencies**: VS Code Extension API; vsce for packaging  
**Storage**: N/A  
**Testing**: Manual validation in Extension Development Host and installed .vsix  
**Target Platform**: Windows VS Code Extension Host  
**Project Type**: single  
**Performance Goals**: Placeholder command confirmation visible within 2 seconds  
**Constraints**: Offline operation; no external runtimes; no native modules; no non-standard shell commands  
**Scale/Scope**: Phase 0 scaffold only; single placeholder command

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
specs/001-vscode-extension-foundation/
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

README.md
```

**Structure Decision**: Single-project extension structure with placeholder directories for commands, compiler logic, and language support.

## Constitution Check (Post-Design)

- Extension-host only runtime: PASS
- TypeScript + standard build pipeline: PASS
- Offline, local-only operations: PASS
- Non-trading tooling only: PASS
- Deterministic, Git-friendly outputs: PASS
- Packaging constraints (.vsix, no native deps, no non-standard shell): PASS
- Workflow artifacts (spec/plan/tasks): PASS

## Phase 0 Technical Tasks

### Milestone A: Scaffold and baseline build

1. Scaffold a new VS Code extension using the official generator (TypeScript).
   - **Depends on**: None
   - **Accomplishes**: Creates the canonical extension structure and baseline build scripts.
   - **Verify**: `npm install` and `npm run compile` complete without errors.
   - **Blocking for Phase 1**: Yes

2. Establish repository layout placeholders (`src/commands`, `src/compiler`, `src/language`).
   - **Depends on**: Task 1
   - **Accomplishes**: Sets stable structure for future phases without functional logic.
   - **Verify**: Directories exist in source tree.
   - **Blocking for Phase 1**: Yes

3. Configure `.gitignore` for generated artifacts and dependencies.
   - **Depends on**: Task 1
   - **Accomplishes**: Prevents build output and `node_modules` from being committed.
   - **Verify**: Generated artifacts are ignored in `git status` after build.
   - **Blocking for Phase 1**: Yes

### Milestone B: Activation and placeholder command

4. Wire extension activation and register exactly one placeholder command.
   - **Depends on**: Tasks 1–2
   - **Accomplishes**: Ensures the extension activates in the Extension Development Host.
   - **Verify**: Extension activates without errors when launched.
   - **Blocking for Phase 1**: Yes

5. Implement placeholder command execution with a VS Code notification.
   - **Depends on**: Task 4
   - **Accomplishes**: Provides visible confirmation of command execution.
   - **Verify**: Running `dasHotkeyTools.placeholderCommand` shows an info toast.
   - **Blocking for Phase 1**: Yes

6. Validate local dev workflow in the Extension Development Host.
   - **Depends on**: Tasks 4–5
   - **Accomplishes**: Confirms development run path is functional.
   - **Verify**: Command appears in Command Palette and executes successfully.
   - **Blocking for Phase 1**: Yes

### Milestone C: Packaging and installation validation

7. Package the extension using `vsce` with minimal configuration.
   - **Depends on**: Tasks 1–6
   - **Accomplishes**: Produces a distributable `.vsix`.
   - **Verify**: Packaging completes without warnings or errors.
   - **Blocking for Phase 1**: Yes

8. Install the `.vsix` in a fresh VS Code user profile.
   - **Depends on**: Task 7
   - **Accomplishes**: Confirms clean install flow without external dependencies.
   - **Verify**: Extension installs cleanly in a fresh profile.
   - **Blocking for Phase 1**: Yes

9. Re-verify the placeholder command after installation.
   - **Depends on**: Task 8
   - **Accomplishes**: Confirms runtime behavior after packaging and install.
   - **Verify**: Command runs and shows the info toast in the fresh profile.
   - **Blocking for Phase 1**: Yes

### Milestone D: Documentation

10. Add a minimal README covering development run, packaging, and installation steps.
    - **Depends on**: Tasks 1–9 (for accuracy)
    - **Accomplishes**: Captures repeatable instructions for Phase 0 validation.
    - **Verify**: README steps match the validated workflow.
    - **Blocking for Phase 1**: Yes

## Complexity Tracking

No constitution violations detected; no complexity exceptions required.
