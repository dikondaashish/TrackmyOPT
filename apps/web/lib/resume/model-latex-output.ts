/**
 * Post-process and validate model-generated resume LaTeX.
 */

const DATE_RANGE =
    /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*(?:--|–|-|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:\d{4}|Present|Current)\b/gi;

/** Strip markdown fences and isolate a \\documentclass…\\end{document} block. */
export function stripModelLatexOutput(text: string): string {
    let latex = text.trim();
    latex = latex.replace(/^```(?:latex|tex)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    const docMatch = latex.match(/\\documentclass[\s\S]*\\end\{document\}/);
    if (docMatch) return docMatch[0].trim();

    return latex;
}

/** Escape LaTeX-special chars before injecting user keywords into prompts. */
export function escapeLatexForPromptInjection(text: string): string {
    return text.replace(/([&%$#_\\])/g, '\\$1');
}

export function extractLatexPreamble(tex: string): string | null {
    const start = tex.indexOf('\\documentclass');
    const beginDoc = tex.indexOf('\\begin{document}');
    if (start < 0 || beginDoc <= start) return null;
    return tex.slice(start, beginDoc).trimEnd();
}

const DOC_BEGIN = '\\begin{document}';
const DOC_END = '\\end{document}';

/** Force the shipped template preamble onto model body content. */
export function mergeModelLatexWithTemplate(templateTex: string, modelLatex: string): string {
    const modelBegin = modelLatex.indexOf(DOC_BEGIN);
    const modelEnd = modelLatex.lastIndexOf(DOC_END);
    if (modelBegin < 0 || modelEnd <= modelBegin) return modelLatex;

    const modelBody = modelLatex.slice(modelBegin + DOC_BEGIN.length, modelEnd).trim();
    if (!modelBody) return modelLatex;

    const templateBegin = templateTex.indexOf(DOC_BEGIN);
    const templateEnd = templateTex.lastIndexOf(DOC_END);
    if (templateBegin < 0 || templateEnd <= templateBegin) return modelLatex;

    const prefix = templateTex.slice(0, templateBegin + DOC_BEGIN.length);
    const suffix = templateTex.slice(templateEnd);
    return `${prefix}\n${modelBody}\n${suffix}`;
}

export function validatePreambleMatches(
    outputLatex: string,
    templateTex: string,
): { ok: true } | { ok: false; reason: string } {
    const outputPreamble = extractLatexPreamble(outputLatex);
    const templatePreamble = extractLatexPreamble(templateTex);
    if (!outputPreamble || !templatePreamble) {
        return { ok: false, reason: 'missing preamble' };
    }
    if (outputPreamble !== templatePreamble) {
        return { ok: false, reason: 'preamble mismatch' };
    }
    return { ok: true };
}

/** Heuristic employer names from plain resume text (cheap drop detector). */
export function extractEmployerNamesFromResume(resumeText: string): string[] {
    const employers = new Set<string>();

    for (const line of resumeText.split('\n')) {
        const atMatch = line.match(/\bat\s+([A-Z][A-Za-z0-9&.,'()/\-\s]{2,80})/);
        if (atMatch) {
            employers.add(atMatch[1].replace(/\s+/g, ' ').trim());
        }

        const dateMatches = [...line.matchAll(DATE_RANGE)];
        if (dateMatches.length === 0) continue;

        const firstDateIndex = dateMatches[0].index ?? line.length;
        const beforeDate = line.slice(0, firstDateIndex).trim();
        if (!beforeDate) continue;

        const commaParts = beforeDate.split(',');
        if (commaParts.length >= 2) {
            employers.add(commaParts[commaParts.length - 1].replace(/\s+/g, ' ').trim());
        }

        for (const segment of beforeDate.split(/\s+[-–—|]\s+/)) {
            const trimmed = segment.replace(/\s+/g, ' ').trim();
            if (trimmed.length > 2 && /^[A-Z0-9]/.test(trimmed)) {
                employers.add(trimmed);
            }
        }
    }

    return [...employers].filter(
        (name) =>
            name.length > 2 &&
            !/^(present|current|remote|usa|united states)$/i.test(name),
    );
}

export function countRoleMacros(latex: string): number {
    const bodyStart = latex.indexOf('\\begin{document}');
    const body = bodyStart >= 0 ? latex.slice(bodyStart) : latex;
    return (body.match(/\\rRole\{/g) ?? []).length;
}

export function estimatePositionCount(resumeText: string): number {
    return (resumeText.match(DATE_RANGE) ?? []).length;
}

/** Demo strings from the template body that must not survive into output. */
export function extractTemplatePlaceholderStrings(templateTex: string): string[] {
    const placeholders = new Set<string>();
    const begin = templateTex.indexOf('\\begin{document}');
    const end = templateTex.lastIndexOf('\\end{document}');
    if (begin < 0) return [];

    const body =
        end > begin
            ? templateTex.slice(begin + '\\begin{document}'.length, end)
            : templateTex.slice(begin + '\\begin{document}'.length);

    for (const match of body.matchAll(/\\def\\name\{([^}]+)\}/g)) placeholders.add(match[1]);
    for (const match of body.matchAll(/\\def\\email\{([^}]+)\}/g)) placeholders.add(match[1]);
    for (const match of body.matchAll(/\\rRole\{[^}]*\}\{([^}]+)\}/g)) placeholders.add(match[1]);
    for (const match of body.matchAll(/\\rProject\{([^}]+)\}/g)) placeholders.add(match[1]);
    for (const match of body.matchAll(/\\rEdu\{[^}]*\}\{([^}]+)\}/g)) placeholders.add(match[1]);

    return [...placeholders].filter((value) => value.trim().length > 3);
}

export function findLeakedTemplatePlaceholders(
    outputLatex: string,
    templateTex: string,
    resumeText: string,
): string[] {
    return extractTemplatePlaceholderStrings(templateTex).filter(
        (placeholder) =>
            outputLatex.includes(placeholder) && !resumeText.includes(placeholder),
    );
}

export type GeneratedResumeValidation = {
    ok: boolean;
    issues: string[];
};

export function validateGeneratedResumeOutput(input: {
    latex: string;
    templateTex: string;
    resumeText: string;
}): GeneratedResumeValidation {
    const issues: string[] = [];

    if (!input.latex.includes('\\documentclass')) {
        issues.push('output missing \\documentclass');
    }
    if (!input.latex.includes('\\end{document}')) {
        issues.push('output missing \\end{document}');
    }

    const roleCount = countRoleMacros(input.latex);
    if (roleCount === 0 && estimatePositionCount(input.resumeText) > 0) {
        issues.push('output has no \\\\rRole entries');
    }

    const leaks = findLeakedTemplatePlaceholders(
        input.latex,
        input.templateTex,
        input.resumeText,
    );
    if (leaks.length > 0) {
        issues.push(`template demo content leaked: ${leaks.slice(0, 3).join(', ')}`);
    }

    return { ok: issues.length === 0, issues };
}
