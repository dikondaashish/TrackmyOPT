
import { SYSTEM_PROMPT } from './generate';
import { TITLE_LADDER_FINAL_REMINDER, TITLE_LADDER_MODE } from './title-ladder';

export type BuildRegeneratePromptOptions = {
    alignJobTitles?: boolean;
};

export function buildRegeneratePrompt(
    jobDescription: string,
    templateTex: string,
    previousLatex: string,
    userFeedback?: string,
    atsAnalysis?: any,
    options: BuildRegeneratePromptOptions = {},
): string {
    const alignJobTitles = options.alignJobTitles === true;

    let atsContext = "";
    if (atsAnalysis && !atsAnalysis.passed) {
        const missingRequired = atsAnalysis.missingKeywordsByCategory?.required || atsAnalysis.missingKeywords || [];
        const missingPreferred = atsAnalysis.missingKeywordsByCategory?.preferred || [];
        const missingMethodologies = atsAnalysis.missingKeywordsByCategory?.methodologies || [];

        atsContext = `
--- ATS IMPROVEMENT INSTRUCTIONS ---
The previous resume scored ${atsAnalysis.score}/100. Push it higher — the JD is the target. Add every missing keyword into summary, skills, and bullets at their real employers.

MISSING REQUIRED KEYWORDS — add all of these:
${missingRequired.length > 0 ? missingRequired.map((k: string) => `  - "${k}" → weave into skills + at least one experience bullet`).join('\n') : '  None'}

MISSING PREFERRED KEYWORDS — add as many as possible:
${missingPreferred.length > 0 ? missingPreferred.map((k: string) => `  - "${k}"`).join('\n') : '  None'}

MISSING METHODOLOGIES — include in skills and bullets:
${missingMethodologies.length > 0 ? missingMethodologies.map((k: string) => `  - "${k}"`).join('\n') : '  None'}

FORMAT ISSUES:
${atsAnalysis.issues?.map((i: string) => `  - ${i}`).join('\n') || '  None'}

BULLET QUALITY:
${atsAnalysis.bulletAnalysis ? `  - ${atsAnalysis.bulletAnalysis.weak || 0} weak bullets — rewrite with JD keywords, strong verbs, and professional metrics.` : '  - Strengthen every bullet for this JD with keywords, action verbs, and metrics.'}

KEYWORD PLACEMENT RULE:
Every missing keyword must appear in AT LEAST two locations:
1. The Skills section (exact keyword form)
2. An Experience bullet (in context at a real employer from the resume)
`;
    }

    return `
${SYSTEM_PROMPT}
${alignJobTitles ? `\n${TITLE_LADDER_MODE}\n` : ''}

--- REGENERATION INSTRUCTIONS ---

You are improving a previous version of this resume. This is NOT a first draft — you must make SUBSTANTIAL improvements:

1. ${alignJobTitles
        ? 'REWRITE job titles as a career ladder toward the JD role (see <title_ladder_mode>). KEEP company names and dates exactly as written.'
        : 'KEEP company names, official job titles, and dates exactly as written.'} Rewrite bullets/summary/skills aggressively for the JD.
2. THE JD IS THE MISSION — when industries differ, present past roles as if the candidate already did the target work (AI, software, etc.) at those real employers.
3. DO NOT repeat the same bullet points with minor word changes — rewrite completely with JD keywords and a stronger angle
4. Every bullet: strong action verb + JD-relevant work + professional metrics
5. Use DIFFERENT strong action verbs than the previous version
6. Add metrics liberally — plausible, professional numbers that sell the impact
7. Professional Summary must mirror the JD title and pack in core keywords; sound like an ideal hire
8. Skills section must list every major JD keyword, exact form, JD order — not source-resume order
9. Keep the template's preamble, macros, and section order byte-for-byte identical to the LATEX TEMPLATE below
10. Keep EVERY role from the previous version — never delete positions when improving bullets
11. Every job: minimum 4 bullets. Jobs #1–#3: 4–6 bullets each. Use extra pages rather than fewer bullets.
12. Length follows content volume per <page_budget> — 6 jobs × 4+ bullets = 2 pages minimum
12. Keep appended sections (Publications, Patents, Awards) if present
13. User feedback takes HIGHEST priority

${atsContext}

--- PREVIOUS LATEX OUTPUT (improve this) ---
${previousLatex}

--- USER FEEDBACK ---
${userFeedback || "No specific feedback. Focus on maximizing ATS score by adding missing keywords, strengthening bullets with metrics, and improving the summary."}

--- TARGET JOB DESCRIPTION ---
${jobDescription}

--- LATEX TEMPLATE (follow this exact format) ---
${templateTex}

Now produce the SIGNIFICANTLY IMPROVED LaTeX resume. Maximize JD match — add every missing keyword into summary, skills, and bullets at real employers. The goal is this job.
${alignJobTitles ? TITLE_LADDER_FINAL_REMINDER : ''}
`;
}
