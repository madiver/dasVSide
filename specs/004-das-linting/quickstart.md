# Phase 4 Quickstart

## Manual Linting Checks

1. Open a workspace with multiple `.das` files and a `keymap.yaml`.
2. Open a `.das` file containing a dangerous command pattern (e.g., CXL ALL).
3. Confirm an inline warning appears with a risk explanation.
4. Introduce a commented-out risky command and confirm no warning appears.
5. Introduce an incomplete statement or unmatched brace; verify linting still
   runs without disabling highlighting.
6. Run the manual lint command (DAS: Lint Scripts) and confirm workspace-wide
   warnings are reported.
7. Change lint settings to downgrade a rule severity and confirm diagnostics
   update without a restart.
8. Add a circular ExecHotkey reference and confirm an error-level diagnostic.
9. Run the build command and confirm lint warnings do not block output.

## Expected Results

- Warnings appear inline and do not block saving or builds.
- Diagnostics include rule id, severity, and message.
- Performance remains responsive on large files.
