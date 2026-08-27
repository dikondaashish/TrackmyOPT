
import { SYSTEM_PROMPT } from './generate';

export function buildRegeneratePrompt(
    jobDescription: string,
    templateTex: string,
    previousLatex: string,
    userFeedback?: string,
    atsAnalysis?: any
): string {

    let atsContext = "";
    if (atsAnalysis && !atsAnalysis.passed) {
        const missingRequired = atsAnalysis.missingKeywordsByCategory?.required || atsAnalysis.missingKeywords || [];
        const missingPreferred = atsAnalysis.missingKeywordsByCategory?.preferred || [];
        const missingMethodologies = atsAnalysis.missingKeywordsByCategory?.methodologies || [];

        atsContext = `
--- ATS IMPROVEMENT INSTRUCTIONS ---
The previous resume scored ${atsAnalysis.score}/100 on our ATS scan. Improve the score only where the candidate's source resume truthfully supports a change. Do not target a score by adding unsupported claims.

MISSING REQUIRED KEYWORDS — add only when the candidate's source resume truthfully supports them:
${missingRequired.length > 0 ? missingRequired.map((k: string) => `  - "${k}" → Use only if supported by the candidate's actual experience; never claim it otherwise`).join('\n') : '  None'}

MISSING PREFERRED KEYWORDS — add as many as the candidate's background supports:
${missingPreferred.length > 0 ? missingPreferred.map((k: string) => `  - "${k}"`).join('\n') : '  None'}

MISSING METHODOLOGIES — add if candidate has used them:
${missingMethodologies.length > 0 ? missingMethodologies.map((k: string) => `  - "${k}"`).join('\n') : '  None'}

FORMAT ISSUES:
${atsAnalysis.issues?.map((i: string) => `  - ${i}`).join('\n') || '  None'}

BULLET QUALITY:
${atsAnalysis.bulletAnalysis ? `  - ${atsAnalysis.bulletAnalysis.weak || 0} weak bullets need clearer action, scope, and outcome. Use a metric only when it exists in the source resume.` : '  - Strengthen bullets with clear action verbs and truthful outcomes; use metrics only when supported by the source resume.'}

KEYWORD PLACEMENT RULE:
Every supported missing keyword should appear in AT LEAST two locations:
1. The Skills section (exact keyword form)
2. An Experience bullet (in context, showing how the candidate used that skill)
`;
    }

    return `
${SYSTEM_PROMPT}

--- REGENERATION INSTRUCTIONS ---

You are improving a previous version of this resume. This is NOT a first draft — you must make SUBSTANTIAL improvements:

1. KEEP official job titles, company names, and dates exactly as the candidate wrote them. Changing a title to match the JD is fabrication and is prohibited — surface the alignment in the bullets and summary instead.
2. DO NOT repeat the same bullet points with minor word changes — rewrite them completely with different angles and JD-relevant framing
3. Each bullet should use a strong action verb and clearly explain what was done and its truthful outcome. Include a measurable impact only when the source resume supports it.
4. Use DIFFERENT strong action verbs than the previous version (if previous used "Led", try "Spearheaded" or "Orchestrated")
5. Add MORE metrics only when they are in the candidate's source resume. Never invent, estimate, round, or exaggerate a metric to reach a target.
6. Professional Summary must be rewritten to be more compelling and may include the exact JD job title and core keywords only where that framing accurately reflects the candidate's background.
7. Skills section must include exact keyword matches from the JD only when the candidate actually has those skills, grouped by the template's existing categories, with relevant skills first
8. Keep the template's preamble, macros, and section order byte-for-byte identical to the LATEX TEMPLATE below — improving content never means restructuring the document
9. Keep EVERY role that was in the previous version — internships, co-ops, contract and part-time work included — plus every project, degree, and certification. Rewriting bullets is never a licence to delete a position. If the previous version had 5 roles, yours has 5 roles
10. Length follows content volume, not years of experience: 1 page if the full record genuinely fits, 2 as soon as it does not. Adding keywords is never a reason to spill onto another page, and never pad or shrink typography to reach one
11. If the candidate has genuinely resume-worthy sections the template lacks (Publications, Patents, Awards), keep them appended below Experience — do not reorder the template's own sections around them, and do not drop them
11. If user provided specific feedback, that takes HIGHEST priority above all else

${atsContext}

--- PREVIOUS LATEX OUTPUT (improve this) ---
${previousLatex}

--- USER FEEDBACK ---
${userFeedback || "No specific feedback. Focus on maximizing ATS score by adding missing keywords, strengthening bullets with metrics, and improving the summary."}

--- TARGET JOB DESCRIPTION ---
${jobDescription}

--- LATEX TEMPLATE (follow this exact format) ---
${templateTex}

Now produce the SIGNIFICANTLY IMPROVED LaTeX resume. Add a missing keyword only when the candidate's source resume supports it. Never invent skills, experience, employers, dates, degrees, credentials, or metrics to improve an ATS score.
`;
}
