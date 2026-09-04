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
const CONTACT_DEF = /^\\def\\[a-zA-Z]+\{[^}]*\}\s*$/gm;

/** Remove template demo contact macros before merging or prompting. */
export function stripTemplateContactDefs(tex: string): string {
    return tex.replace(CONTACT_DEF, '').replace(/\n{3,}/g, '\n\n').trimEnd();
}

function extractContactDefs(tex: string): string {
    const begin = tex.indexOf(DOC_BEGIN);
    const chunk = begin >= 0 ? tex.slice(0, begin) : tex;
    return (chunk.match(CONTACT_DEF) ?? []).join('\n');
}

/** Strip demo body and neutralize contact placeholders before sending to the model. */
export function sanitizeTemplateForPrompt(templateTex: string): string {
    const begin = templateTex.indexOf(DOC_BEGIN);
    const end = templateTex.lastIndexOf(DOC_END);
    if (begin < 0 || end <= begin) return templateTex;

    let preamble = stripTemplateContactDefs(templateTex.slice(0, begin));
    preamble += `
% CONTACT — populate from the candidate resume (never use template demo values)
\\def\\name{CANDIDATE NAME}
\\def\\role{TARGET ROLE FROM RESUME/JD}
\\def\\phone{CANDIDATE PHONE}
\\def\\location{CANDIDATE LOCATION}
\\def\\email{candidate@email.com}
\\def\\LinkedIn{candidate-linkedin}
\\def\\github{candidate-github}`;

    const skeleton = `
%-----------  HEADER  ---------------------------------------------
% Use the candidate's real name, contact info, and target role.

%-----------  SUMMARY  --------------------------------------------
\\section{Summary}
% JD-tailored summary for the real candidate

%-----------  SKILLS  ---------------------------------------------
\\section{Skills}
% JD keyword groups via \\rSkill

%-----------  EXPERIENCE  -----------------------------------------
\\section{Experience}
% One \\rRole + rBullets per employer from the source resume

%-----------  PROJECTS  -------------------------------------------
\\section{Projects}
% Real projects only, or omit section if none

%-----------  EDUCATION  ------------------------------------------
\\section{Education}
% Real schools/degrees from the source resume

%-----------  CERTIFICATIONS  -------------------------------------
\\section{Certifications}
% Real certifications from the source resume, or omit if none`;

    return `${preamble}\n${DOC_BEGIN}${skeleton}\n${DOC_END}`;
}

/** Force the shipped template preamble onto model body content. */
export function mergeModelLatexWithTemplate(templateTex: string, modelLatex: string): string {
    const modelBegin = modelLatex.indexOf(DOC_BEGIN);
    const modelEnd = modelLatex.lastIndexOf(DOC_END);
    if (modelBegin < 0 || modelEnd <= modelBegin) return modelLatex;

    const modelContactDefs = extractContactDefs(modelLatex);
    const modelBody = modelLatex.slice(modelBegin + DOC_BEGIN.length, modelEnd).trim();
    if (!modelBody) return modelLatex;

    const templateBegin = templateTex.indexOf(DOC_BEGIN);
    const templateEnd = templateTex.lastIndexOf(DOC_END);
    if (templateBegin < 0 || templateEnd <= templateBegin) return modelLatex;

    const structuralPrefix = stripTemplateContactDefs(templateTex.slice(0, templateBegin));
    const contactBlock = modelContactDefs ? `\n${modelContactDefs}\n` : '';
    const suffix = templateTex.slice(templateEnd);
    return `${structuralPrefix}${contactBlock}\n${DOC_BEGIN}\n${modelBody}\n${suffix}`;
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

/** Demo strings from the template that must not survive into output. */
export function extractTemplatePlaceholderStrings(templateTex: string): string[] {
    const placeholders = new Set<string>();
    const begin = templateTex.indexOf(DOC_BEGIN);
    const end = templateTex.lastIndexOf(DOC_END);
    if (begin < 0) return [];

    const body =
        end > begin
            ? templateTex.slice(begin + DOC_BEGIN.length, end)
            : templateTex.slice(begin + DOC_BEGIN.length);

    for (const match of templateTex.matchAll(/\\def\\[a-zA-Z]+\{([^}]+)\}/g)) {
        placeholders.add(match[1]);
    }
    for (const match of body.matchAll(/\\rRole\{[^}]*\}\{([^}]+)\}/g)) placeholders.add(match[1]);
    for (const match of body.matchAll(/\\rProject\{([^}]+)\}/g)) placeholders.add(match[1]);
    for (const match of body.matchAll(/\\rEdu\{[^}]*\}\{([^}]+)\}/g)) placeholders.add(match[1]);

    return [...placeholders].filter(
        (value) =>
            value.trim().length > 3 &&
            !/^(candidate@email\.com|CANDIDATE NAME|TARGET ROLE)/i.test(value.trim()),
    );
}

export function extractResumeStructuralAnchors(resumeText: string): {
    candidateName: string | null;
    employers: string[];
} {
    const lines = resumeText.split('\n').map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] ?? '';
    const candidateName =
        firstLine &&
        /^[A-Z][A-Za-z]/.test(firstLine) &&
        !firstLine.includes('@') &&
        firstLine.length < 80
            ? firstLine.split(/\s*[|–-]\s*/)[0].trim()
            : null;

    const employers = new Set<string>();
    const companyHint =
        /\b(Inc\.?|LLC|Corp\.?|Group|Rx|Bank of|University|Fiverr|Nobroker|Zyene|Optum|Software|America)\b/i;

    for (const line of lines) {
        if (line.startsWith('•') || line.startsWith('-')) continue;
        if (/^(Professional|Technical|Educational|Certifications?):/i.test(line)) continue;

        if (companyHint.test(line) && line.length < 120) {
            const commaCompany = line.match(
                /,\s*([^,\t\d][^,\t]*?(?:Inc\.?|LLC|Corp\.?|Group|Rx|Bank of [^,\t]+))/i,
            );
            if (commaCompany?.[1]) {
                employers.add(commaCompany[1].trim());
            }

            const tabParts = line.split(/\t+/);
            if (tabParts.length > 1) {
                const head = tabParts[0].trim();
                if (
                    head.length > 2 &&
                    companyHint.test(head) &&
                    !/^(Sr\.|Lead|Product|Master|Bachelor)/i.test(head)
                ) {
                    employers.add(head);
                }
            }
        }

        if (DATE_RANGE.test(line)) {
            for (const segment of line.split(/\t+/)) {
                let trimmed = segment.replace(DATE_RANGE, '').trim();
                const titleCompany = trimmed.match(/^[^,]+,\s*(.+)$/);
                if (titleCompany?.[1]) trimmed = titleCompany[1].trim();
                if (trimmed.length > 2 && companyHint.test(trimmed)) {
                    employers.add(trimmed);
                }
            }
        }
    }

    return { candidateName, employers: [...employers] };
}

function anchorAppearsInLatex(anchor: string, latex: string): boolean {
    const hay = latex.toLowerCase();
    const needle = anchor.toLowerCase();
    if (hay.includes(needle)) return true;

    const tokens = needle.split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
    if (tokens.length === 0) return hay.includes(needle);
    return tokens.every((token) => hay.includes(token));
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

    const { candidateName, employers } = extractResumeStructuralAnchors(input.resumeText);
    if (candidateName && !anchorAppearsInLatex(candidateName, input.latex)) {
        issues.push(`missing candidate name: ${candidateName}`);
    }

    const missingEmployers = employers.filter(
        (employer) => !anchorAppearsInLatex(employer, input.latex),
    );
    const minMatches =
        employers.length <= 1
            ? employers.length
            : Math.max(2, Math.ceil(employers.length * 0.6));
    const matchedEmployers = employers.length - missingEmployers.length;
    if (employers.length > 0 && matchedEmployers < minMatches) {
        issues.push(
            `missing employers: ${missingEmployers.slice(0, 4).join(', ')}`,
        );
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
