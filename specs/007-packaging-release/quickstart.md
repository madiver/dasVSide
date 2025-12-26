# Quickstart: Packaging, Polish, and Public Release

## Prerequisites
- VS Code installed on the target machine
- Extension workspace checked out locally

## Steps
1. Update version and changelog (package.json and CHANGELOG.md).
2. Run `npm run package` to generate the VSIX artifact.
3. Install the VSIX on a clean VS Code instance (Windows).
4. Install the VSIX on a clean VS Code instance (macOS).
5. Verify offline operation by disconnecting from the network and running build/import commands.
6. Confirm command names and descriptions match documentation.
7. Review output messages for clarity (warnings vs errors).
8. Uninstall the extension and confirm no residual configuration is required for a clean reinstall.
