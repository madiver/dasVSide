# Quickstart: Dependency Graph and Navigation

## Prerequisites
- Workspace with .das files and a keymap.yaml at the root

## Steps
1. Run the "Analyze Dependencies" command from the command palette.
2. Review the dependency report output (nodes, edges, findings).
3. Use "Show Callers" or "Show Callees" on a script to navigate.
4. Review cycle and dead-script diagnostics for refactoring guidance.
5. Time the analysis on a workspace with ~200 scripts and confirm it completes in under 3 seconds.
6. Time a callers/callees navigation jump and confirm it completes in under 2 seconds.
