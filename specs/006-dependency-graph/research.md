# Research: Dependency Graph and Navigation

Decision: Parse ExecHotkey calls using a case-insensitive pattern that extracts the hotkey id argument.
Rationale: ExecHotkey is the explicit, canonical cross-script call in DAS scripts and is consistently used for hotkey invocation.
Alternatives considered: Free-form string matching (rejected due to false positives).

Decision: Treat explicit .das path literals inside quoted strings as dependency edges.
Rationale: Some scripts reference other scripts by file path rather than hotkey id, and these should be represented in the graph.
Alternatives considered: Ignore path literals (rejected because it misses real dependencies).

Decision: Use a directed graph with Tarjan SCC detection to report cycles and a simple in-degree check for dead scripts.
Rationale: Tarjan provides deterministic cycle groups; in-degree based on resolved references is sufficient for dead code detection.
Alternatives considered: DFS per node (rejected due to redundant traversal at scale).

Decision: Cache the last analysis result in memory for navigation commands.
Rationale: Navigation should be fast and consistent with the last analysis run.
Alternatives considered: Recompute for each navigation request (rejected due to latency).
