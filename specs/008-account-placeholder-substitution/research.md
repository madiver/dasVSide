# Research: Account Placeholder Substitution

## Decision 1: Settings storage
- **Decision**: Store Live Account and Simulated Account as user-level VS Code settings only.
- **Rationale**: Account identifiers are sensitive and should not be stored in shared workspace settings.
- **Alternatives considered**: Workspace settings (risk of accidental sharing); dual-scope settings with workspace override.

## Decision 2: Token replacement scope
- **Decision**: Replace exact `%%LIVE%%` and `%%SIMULATED%%` tokens anywhere in script bodies, including comments and quoted strings.
- **Rationale**: Predictable, simple behavior that avoids missed substitutions.
- **Alternatives considered**: Parsing-only executable tokens; excluding comments/strings.

## Decision 3: Missing setting behavior
- **Decision**: Build succeeds with warnings; placeholders remain unchanged when settings are missing.
- **Rationale**: Non-blocking builds preserve shared scripts while still alerting users.
- **Alternatives considered**: Fail the build; replace with empty string.

## Decision 4: Warning strategy
- **Decision**: Emit one warning per build per placeholder type and list affected scripts in the output channel.
- **Rationale**: Keeps UI noise low while providing actionable detail.
- **Alternatives considered**: Warn per occurrence; warn per script.

## Decision 5: Token matching
- **Decision**: Replace only exact token matches (`%%LIVE%%`, `%%SIMULATED%%`).
- **Rationale**: Prevents accidental substitutions in similar strings.
- **Alternatives considered**: Case-insensitive or partial matching.
