export type HotkeyErrorCode =
    | "CONFIGURATION_ERROR"
    | "TEMPLATE_RENDER_ERROR"
    | "VALIDATION_ERROR"
    | "FILE_WRITE_ERROR"
    | "DISCOVERY_ERROR"
    | "KEYMAP_ERROR"
    | "SCRIPT_ERROR"
    | "COMPILER_ERROR";

export interface ErrorContext {
    id?: string;
    key?: string;
    sourcePath?: string;
}

export class HotkeyToolsError extends Error {
    readonly code: HotkeyErrorCode;
    readonly userMessage: string;
    readonly id?: string;
    readonly key?: string;
    readonly sourcePath?: string;

    constructor(
        code: HotkeyErrorCode,
        userMessage: string,
        details?: string,
        context?: ErrorContext
    ) {
        super(details ?? userMessage);
        this.code = code;
        this.userMessage = userMessage;
        this.id = context?.id;
        this.key = context?.key;
        this.sourcePath = context?.sourcePath;
    }
}

export class ConfigurationError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("CONFIGURATION_ERROR", userMessage, details, context);
    }
}

export class TemplateRenderError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("TEMPLATE_RENDER_ERROR", userMessage, details, context);
    }
}

export class ValidationError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("VALIDATION_ERROR", userMessage, details, context);
    }
}

export class FileWriteError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("FILE_WRITE_ERROR", userMessage, details, context);
    }
}

export class DiscoveryError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("DISCOVERY_ERROR", userMessage, details, context);
    }
}

export class KeymapError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("KEYMAP_ERROR", userMessage, details, context);
    }
}

export class ScriptError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("SCRIPT_ERROR", userMessage, details, context);
    }
}

export class CompileError extends HotkeyToolsError {
    constructor(userMessage: string, details?: string, context?: ErrorContext) {
        super("COMPILER_ERROR", userMessage, details, context);
    }
}
