# Phase 4 Research

## Decision 1: Analysis approach

**Decision**: Use a lightweight tokenizer aligned with Phase 3 grammar tokens
plus a line/statement scanner instead of a full parser.

**Rationale**: Keeps linting fast, resilient to malformed scripts, and aligned
with advisory-only goals while leveraging existing grammar assumptions.

**Alternatives considered**:
- Full parser/AST: higher precision but higher complexity and fragility.
- Regex-only with no token awareness: simpler but too noisy.

## Decision 2: Comment and string handling

**Decision**: Exclude comments and string literals from rule matching unless a
rule explicitly targets them.

**Rationale**: Prevents false positives from commented-out or quoted text.

**Alternatives considered**:
- Treat comments/strings as normal text (higher false positive rate).

## Decision 3: ExecHotkey call graph safety

**Decision**: Build a shallow ExecHotkey reference graph with depth caps and
cycle detection to flag circular chains without unbounded traversal.

**Rationale**: Enables dependency hazard checks while preserving performance.

**Alternatives considered**:
- Direct-reference only checks (misses indirect cycles).
- Full dependency graph across all scripts (deferred complexity).

## Decision 4: keymap.yaml mapping

**Decision**: Parse keymap.yaml with a minimal deterministic line-based parser
for script references.

**Rationale**: Avoids new dependencies and supports common mapping patterns.

**Alternatives considered**:
- Add YAML parser dependency for full coverage.
- Ignore keymap.yaml and lint only opened files.

## Decision 5: Diagnostics update strategy

**Decision**: Use a debounced update (300-500ms) on document changes and a
manual workspace scan command, with optional lint-on-build warnings.

**Rationale**: Keeps editor responsive while providing immediate feedback and a
pre-build review option.

**Alternatives considered**:
- Immediate re-lint on every keystroke (risk of lag).
- Manual-only linting (reduced usefulness).
