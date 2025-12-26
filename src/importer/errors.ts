export type ImportErrorCode =
    | "IMPORT_INPUT_ERROR"
    | "IMPORT_PARSE_ERROR"
    | "IMPORT_DECODE_ERROR"
    | "IMPORT_NAMING_ERROR"
    | "IMPORT_CONFLICT_ERROR"
    | "IMPORT_WRITE_ERROR"
    | "IMPORT_VERIFY_ERROR"
    | "IMPORT_CANCELED";

export interface ImportErrorContext {
    recordIndex?: number;
    line?: number;
    key?: string;
    label?: string;
    sourcePath?: string;
    destinationPath?: string;
}

export class ImporterError extends Error {
    readonly code: ImportErrorCode;
    readonly userMessage: string;
    readonly recordIndex?: number;
    readonly line?: number;
    readonly key?: string;
    readonly label?: string;
    readonly sourcePath?: string;
    readonly destinationPath?: string;

    constructor(
        code: ImportErrorCode,
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super(details ?? userMessage);
        this.code = code;
        this.userMessage = userMessage;
        this.recordIndex = context?.recordIndex;
        this.line = context?.line;
        this.key = context?.key;
        this.label = context?.label;
        this.sourcePath = context?.sourcePath;
        this.destinationPath = context?.destinationPath;
    }
}

export class ImportInputError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_INPUT_ERROR", userMessage, details, context);
    }
}

export class ImportParseError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_PARSE_ERROR", userMessage, details, context);
    }
}

export class ImportDecodeError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_DECODE_ERROR", userMessage, details, context);
    }
}

export class ImportNamingError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_NAMING_ERROR", userMessage, details, context);
    }
}

export class ImportConflictError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_CONFLICT_ERROR", userMessage, details, context);
    }
}

export class ImportWriteError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_WRITE_ERROR", userMessage, details, context);
    }
}

export class ImportVerifyError extends ImporterError {
    constructor(
        userMessage: string,
        details?: string,
        context?: ImportErrorContext
    ) {
        super("IMPORT_VERIFY_ERROR", userMessage, details, context);
    }
}

export class ImportCanceledError extends ImporterError {
    constructor(userMessage: string) {
        super("IMPORT_CANCELED", userMessage);
    }
}
