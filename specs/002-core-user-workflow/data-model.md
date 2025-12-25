# Data Model

## Entities

### Hotkey Source
- **Description**: User-authored .das files that represent script bodies.
- **Key fields**: path, content
- **Validation rules**: file exists and is readable

### Keymap Configuration
- **Description**: keymap.yaml mapping of hotkey entries to script paths.
- **Key fields**: entries (id, keyCombo, name, scriptPath)
- **Validation rules**: file exists; scriptPath resolves to .das file

### Hotkey Template
- **Description**: Literal .htk record templates with fixed line breaks.
- **Key fields**: templateId, staticSegments, placeholderSegments
- **Validation rules**: placeholders must resolve; no formatting changes allowed

### Hotkey Output
- **Description**: Generated Hotkey.htk file.
- **Key fields**: outputPath, generatedContent
- **Validation rules**: outputPath provided; confirm overwrite if file exists; CRLF enforced

## Relationships

- Keymap Configuration references Hotkey Source by scriptPath.
- Hotkey Output is rendered from Hotkey Templates plus settings placeholders.

## State Transitions

- **Not Built** ? **Validated** ? **Built**
- **Validation Failed** when required inputs or settings are missing/invalid.
- **Build Aborted** when user declines overwrite.
