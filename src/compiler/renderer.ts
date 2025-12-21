import { PLACEHOLDER_PATTERN } from "./formatRules";
import { TemplateRenderError } from "./errors";

export function renderTemplate(
    template: string,
    variables: Record<string, string>
): string {
    let rendered = template;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        rendered = rendered.split(placeholder).join(value);
    }

    const unresolved = rendered.match(PLACEHOLDER_PATTERN);
    if (unresolved && unresolved.length > 0) {
        const unique = Array.from(new Set(unresolved)).slice(0, 5).join(", ");
        throw new TemplateRenderError(
            "Template rendering failed because placeholder values are missing.",
            `Unresolved placeholders: ${unique}`
        );
    }

    return rendered;
}
