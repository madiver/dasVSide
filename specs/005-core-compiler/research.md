# Phase 5 Research

Decision: Use a pure JS YAML parser to read keymap.yaml.
Rationale: Ensures correct YAML handling without native dependencies, aligning with offline and packaging constraints.
Alternatives considered: Custom line parser; JSON-only keymap format.

Decision: Enforce strict validation failures for missing/empty keymap.yaml, ambiguous script resolution, malformed scripts, and duplicates.
Rationale: Failing fast prevents incorrect Hotkey.htk output and preserves determinism.
Alternatives considered: Warning-only behavior with partial output.

Decision: Implement atomic output writes using a temp file in the output directory and a final rename.
Rationale: Prevents partial Hotkey.htk files on failures and keeps output predictable.
Alternatives considered: Direct overwrite without temp file.

Decision: Preserve script text and comments with internal line-ending normalization only.
Rationale: Maintains user intent while allowing deterministic encoding rules.
Alternatives considered: Script normalization or formatting passes.

Decision: Use keymap.yaml declaration order as the primary ordering signal with hotkey id as a secondary tie-breaker.
Rationale: Aligns with user expectations and makes diffs stable.
Alternatives considered: Sorting by key combination or source path.
