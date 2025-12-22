# Data Model: Phase 3 Language Support

## Entities

### DAS Script File

- **Attributes**: path, content, line endings
- **Notes**: Treated as source-only; no metadata or key bindings

### DAS Language Mode

- **Attributes**: language id, file association (.das)
- **Notes**: Drives highlighting, bracket matching, and folding

### Hotkey Symbol

- **Attributes**: name, source file, line number
- **Notes**: Derived from ExecHotkey references in current file

### Folding Region

- **Attributes**: start line, end line, keyword pair
- **Notes**: Represents control flow blocks (e.g., if/endif)
