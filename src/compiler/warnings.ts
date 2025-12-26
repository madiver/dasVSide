import { CompileWarning, PlaceholderWarning } from "./types";
import { PLACEHOLDER_LABELS, PLACEHOLDER_TOKENS, PlaceholderType } from "./placeholders";

export class PlaceholderWarningTracker {
    private readonly missing = new Map<PlaceholderType, Set<string>>();

    addMissing(placeholder: PlaceholderType, sourcePath?: string): void {
        if (!this.missing.has(placeholder)) {
            this.missing.set(placeholder, new Set());
        }
        if (sourcePath) {
            this.missing.get(placeholder)?.add(sourcePath);
        }
    }

    buildWarnings(): CompileWarning[] {
        const warnings: CompileWarning[] = [];
        for (const placeholder of this.missing.keys()) {
            warnings.push({
                code: "MISSING_PLACEHOLDER_SETTING",
                message: `${PLACEHOLDER_LABELS[placeholder]} setting is missing. ` +
                    `Placeholder ${PLACEHOLDER_TOKENS[placeholder]} will be left unchanged.`,
            });
        }
        return warnings;
    }

    buildPlaceholderWarnings(): PlaceholderWarning[] {
        const warnings: PlaceholderWarning[] = [];
        for (const [placeholder, scripts] of this.missing.entries()) {
            warnings.push({
                placeholder,
                affectedScripts: Array.from(scripts).sort(),
            });
        }
        return warnings;
    }
}
