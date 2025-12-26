# Data Model: Account Placeholder Substitution

## LiveAccountSetting
- **Represents**: User-level Live Account identifier used for `%%LIVE%%` replacement.
- **Fields**: value, scope (user), isSet.

## SimulatedAccountSetting
- **Represents**: User-level Simulated Account identifier used for `%%SIMULATED%%` replacement.
- **Fields**: value, scope (user), isSet.

## PlaceholderToken
- **Represents**: The exact placeholder text in script bodies.
- **Fields**: token (`%%LIVE%%` or `%%SIMULATED%%`), matchType (exact).

## SubstitutionWarning
- **Represents**: Warning emitted when a placeholder cannot be replaced.
- **Fields**: tokenType, message, affectedScripts (list).

## SubstitutionResult
- **Represents**: Outcome of build-time substitution.
- **Fields**: replacedCountLive, replacedCountSimulated, warnings (list), outputPath.
