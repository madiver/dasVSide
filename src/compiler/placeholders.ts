export const PLACEHOLDER_TOKENS = {
    live: "%%LIVE%%",
    simulated: "%%SIMULATED%%",
} as const;

export const PLACEHOLDER_LABELS: Record<PlaceholderType, string> = {
    live: "Live Account",
    simulated: "Simulated Account",
};

export type PlaceholderType = keyof typeof PLACEHOLDER_TOKENS;

export interface PlaceholderValues {
    liveAccount?: string;
    simulatedAccount?: string;
}

export interface PlaceholderSubstitutionInput {
    scriptText: string;
    values: PlaceholderValues;
    sourcePath?: string;
}

export interface PlaceholderSubstitutionResult {
    text: string;
    replaced: Record<PlaceholderType, number>;
    missing: PlaceholderType[];
}

export type PlaceholderSubstituter = (
    input: PlaceholderSubstitutionInput
) => PlaceholderSubstitutionResult;

export const substitutePlaceholders: PlaceholderSubstituter = (
    input: PlaceholderSubstitutionInput
): PlaceholderSubstitutionResult => {
    const replaced: Record<PlaceholderType, number> = {
        live: 0,
        simulated: 0,
    };
    const missing: PlaceholderType[] = [];
    let text = input.scriptText;

    const applyToken = (
        type: PlaceholderType,
        value?: string
    ): void => {
        const token = PLACEHOLDER_TOKENS[type];
        const count = countOccurrences(text, token);
        if (count === 0) {
            return;
        }
        if (value && value.trim()) {
            text = text.split(token).join(value);
            replaced[type] = count;
            return;
        }
        missing.push(type);
    };

    // Apply in a fixed order to keep substitution deterministic.
    applyToken("live", input.values.liveAccount);
    applyToken("simulated", input.values.simulatedAccount);

    return { text, replaced, missing };
};

function countOccurrences(source: string, token: string): number {
    let count = 0;
    let index = source.indexOf(token);
    while (index !== -1) {
        count += 1;
        index = source.indexOf(token, index + token.length);
    }
    return count;
}
