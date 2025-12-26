# Research: Packaging, Polish, and Public Release

## Decision 1: Packaging workflow

- **Decision**: Use @vscode/vsce to produce a versioned VSIX via the documented npm script.
- **Rationale**: Aligns with VS Code extension guidance and ensures deterministic packaging without external tooling.
- **Alternatives considered**: Manual zip packaging; ad-hoc packaging scripts without vsce.

## Decision 2: Offline validation approach

- **Decision**: Require a documented offline validation step for both build and import workflows after installation.
- **Rationale**: The constitution requires fully offline operation; explicit validation prevents regressions.
- **Alternatives considered**: Assume offline compliance without validation; rely on automated tests only.

## Decision 3: Platform validation scope

- **Decision**: Validate clean install and VSIX packaging on Windows and macOS for every release.
- **Rationale**: Meets the success criteria while keeping the test matrix manageable.
- **Alternatives considered**: Windows-only validation; add Linux to the release matrix.

## Decision 4: Release hygiene and messaging

- **Decision**: Maintain semantic versioning in package.json and a root CHANGELOG.md that labels breaking vs non-breaking changes; standardize user-facing command labels/messages.
- **Rationale**: Improves user trust and reduces confusion during updates.
- **Alternatives considered**: Minimal version bumping without changelog; release notes only in Marketplace.
