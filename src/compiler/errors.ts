export type HotkeyErrorCode =
    | "CONFIGURATION_ERROR"
    | "TEMPLATE_RENDER_ERROR"
    | "VALIDATION_ERROR"
    | "FILE_WRITE_ERROR";

export class HotkeyToolsError extends Error {
    readonly code: HotkeyErrorCode;
    readonly userMessage: string;

    constructor(code: HotkeyErrorCode, userMessage: string, details?: string) {
        super(details ?? userMessage);
        this.code = code;
        this.userMessage = userMessage;
    }
}

export class ConfigurationError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string) {
        super("CONFIGURATION_ERROR", userMessage, details);
    }
}

export class TemplateRenderError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string) {
        super("TEMPLATE_RENDER_ERROR", userMessage, details);
    }
}

export class ValidationError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string) {
        super("VALIDATION_ERROR", userMessage, details);
    }
}

export class FileWriteError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string) {
        super("FILE_WRITE_ERROR", userMessage, details);
    }
}
