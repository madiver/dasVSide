# Phase 0 Research: HTK Importer

## Decisions

### Decision 1: Record boundary detection
**Decision**: Parse records using the Key:Label:Length:EncodedScript header and consume encoded bytes until the length token is satisfied, allowing physical line wrapping to vary.
**Rationale**: Length-based decoding avoids dependence on fixed line widths and matches real-world Hotkey.htk variations.
**Alternatives considered**: Fixed 51-char wrapping only; rejected because real files vary in wrapping.

### Decision 2: Token decoding
**Decision**: Decode encoded script bodies by converting ~HH tokens into bytes, then interpreting bytes as UTF-8; convert CRLF bytes (~0D~0A) into actual CRLF line endings.
**Rationale**: Matches existing compiler encoding rules and preserves exact script text.
**Alternatives considered**: Treat tokens as literal text; rejected because it breaks round-trip fidelity.

### Decision 3: Deterministic ids and filenames
**Decision**: Generate ids from sanitized labels, append numeric suffixes on collisions, and derive filenames from ids with fallback to key or label+key, resolving collisions deterministically.
**Rationale**: Keeps names readable while guaranteeing uniqueness and stable output.
**Alternatives considered**: Use keys only or random suffixes; rejected due to reduced readability or nondeterminism.

### Decision 4: Conflict handling
**Decision**: Treat existing files as blocking conflicts unless the user explicitly chooses overwrite; otherwise abort without changes.
**Rationale**: Avoids accidental data loss and aligns with "no partial output" requirement.
**Alternatives considered**: Overwrite by default or skip conflicting files; rejected due to ambiguity and potential mismatches.
