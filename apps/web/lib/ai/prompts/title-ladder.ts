/** Prompt block when the user opts in to career-ladder job title rewriting. */
export const TITLE_LADDER_MODE = `
<title_ladder_mode>
The user enabled "Align job titles to this role". OVERRIDE any rule that says to keep
official job titles unchanged — that override applies only in this mode.

1. Extract the TARGET JOB TITLE from the JD (e.g. Senior Data Analyst, Software Engineer II).
2. Count every employment entry on the source resume. Output the same number of \\rRole entries.
3. Build a believable career ladder in the TARGET ROLE'S career track, oldest → newest:
   - Oldest role: most junior plausible title in that track (e.g. Junior Data Analyst, Associate Software Engineer)
   - Each later role: one step more senior along the same track
   - Most recent role (#1): match or nearly match the JD title (e.g. Senior Data Analyst)
4. Change ONLY the job title (first argument) in each \\rRole{Title}{Company}{Location}{Dates}.
5. Set \\def\\role{...} (header subtitle under the name) to the JD target title.
6. Company names, locations, and employment dates stay exactly as on the source resume.
7. Bullets, summary, and skills still follow JD-first rules for the target career track.
8. Match seniority to tenure — a short internship or early role must not read as "Senior".
</title_ladder_mode>`;

export const TITLE_LADDER_FINAL_REMINDER = `
8. TITLE LADDER ON — rewrite job titles as a career progression toward the JD role; keep employers and dates.`;
