export const CRLF = "\r\n";
export const SCRIPT_BODY_PREFIX_PATTERN = /^~ \d+:/;
export const INLINE_BODY_TERMINATOR = "~0D~0A";

export const HOTKEY_HEADER_PATTERN =
    /^(?<keyCombo>[^\s:\r\n]*):(?<hotkeyName>[^:\r\n]+):/;
export const KEY_COMBO_PATTERN = /^(?:[A-Za-z0-9]+\+)*[A-Za-z0-9]+$/;
export const KEY_COMBO_REQUIRED_PATTERN = /[A-Z0-9]/;
export const PLACEHOLDER_PATTERN = /\{\{[A-Za-z0-9_.-]+\}\}/g;
export const HEX_TOKEN_PATTERN = /~[0-9A-Fa-f]{2}/g;
