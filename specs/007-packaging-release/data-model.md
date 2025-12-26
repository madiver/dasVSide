# Data Model: Packaging, Polish, and Public Release

## ReleaseArtifact

- **Represents**: A versioned VSIX package distributed to users.
- **Fields**: version, buildDate, vsixPath, checksum (optional).

## DocumentationSet

- **Represents**: User-facing documentation required for installation and usage.
- **Fields**: readmePath, overviewPath, changelogPath, quickstartPath, coverageChecklist.

## CommandCatalog

- **Represents**: The list of user-facing commands and their descriptions.
- **Fields**: commandId, displayName, description, sourceFile.

## ChangelogEntry

- **Represents**: A release note describing changes and compatibility impact.
- **Fields**: version, date, changeType (breaking/non-breaking), summary, migrationNotes (optional).

## SupportMatrix

- **Represents**: Supported environments for installation and usage.
- **Fields**: vscodeVersions, operatingSystems, offlineSupported.
