
import { SYSTEM_PROMPT } from './generate';

export function buildRegeneratePrompt(
    resumeText: string,
    jobDescription: string,
    templateTex: string,
    previousLatex: string,
    userFeedback?: string,
    atsAnalysis?: any
): string {

    let atsContext = "";
    if (atsAnalysis && !atsAnalysis.passed) {
        atsContext = `
--- CRITICAL ATS FEEDBACK (MUST FIX) ---
The previous resume FAILED the ATS scan with a score of ${atsAnalysis.score}/100.
You MUST address the following gaps to achieve a >95% score:

MISSING KEYWORDS (Integrate these naturally):
${atsAnalysis.missingKeywords?.join(', ') || "None identified"}

CRITICAL ISSUES:
${atsAnalysis.issues?.map((i: any) => `- ${i}`).join('\n') || "None identified"}

IMPROVEMENT PLAN:
Focus strictly on adding these missing keywords and fixing the identified issues while maintaining the flow.
`;
    }

    return `
${SYSTEM_PROMPT}

--- ADDITIONAL REGENERATION CONTEXT ---

REGENERATION CONTEXT:

Below is the previous version of the LaTeX resume that was generated. The user wants an improved version. Make the following improvements:

1. Vary the phrasing — do NOT repeat the same bullet points with minor word changes
2. Strengthen action verbs and quantify more achievements
3. Increase keyword density from the JD (aim for 95%+ ATS match)
4. Improve the professional summary to be more compelling
5. Ensure all formatting and LaTeX structure remains identical to the template
6. If the user provided specific feedback, prioritize that above all else

${atsContext}

--- PREVIOUS LATEX OUTPUT ---
${previousLatex}

--- USER FEEDBACK (if any) ---
${userFeedback || "No specific feedback. Just make it better."}

--- CANDIDATE RESUME ---
${resumeText}

--- TARGET JOB DESCRIPTION ---
${jobDescription}

--- LATEX TEMPLATE (follow this exact format) ---
${templateTex}

Now produce the IMPROVED LaTeX resume.
`;
}
