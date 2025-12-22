# Research: Phase 3 Language Support

## Decision: Use VS Code language contributions (TextMate grammar + language configuration)

**Rationale**: Provides conservative, offline syntax highlighting and bracket behavior without a language server.
**Alternatives considered**: Language server implementation (rejected for Phase 3 due to scope and offline constraints).

## Decision: File-scoped ExecHotkey symbol extraction

**Rationale**: Keeps navigation lightweight and deterministic while meeting Phase 3 requirements.
**Alternatives considered**: Workspace-wide indexing (deferred to later phases).
