
export const buildAtsScanPrompt = (resumeText: string, jobDescription: string) => {
    return `
You are an enterprise-grade Applicant Tracking System (ATS) simulator used by Fortune 500 companies. You parse resumes the way Taleo, Workday, Greenhouse, Lever, and iCIMS do.

Your task: Score this resume against the job description with the precision of a real ATS.

JOB DESCRIPTION:
"""
${jobDescription}
"""

RESUME TEXT:
"""
${resumeText}
"""

ANALYSIS METHODOLOGY — follow each step:

1. KEYWORD EXTRACTION from JD:
   - Extract ALL hard skills (programming languages, tools, frameworks, platforms, databases, cloud services)
   - Extract methodologies and processes (Agile, Scrum, CI/CD, DevOps, TDD, etc.)
   - Extract industry terms and domain knowledge
   - Extract certifications mentioned
   - Extract soft skills only if explicitly required (not just "nice to have")

2. KEYWORD MATCHING against Resume:
   - Exact match: keyword appears verbatim (e.g., JD says "Python", resume says "Python") → full credit
   - Partial match: related but not exact (e.g., JD says "AWS", resume says "cloud services") → half credit
   - Missing: keyword not found at all → zero credit
   - Check keyword placement: keywords in Skills section AND Experience bullets score higher than keywords only in one place

3. BULLET POINT QUALITY (XYZ formula check):
   For each experience bullet, check:
   - Does it start with a strong action verb? (Led, Engineered, Architected, Automated, Optimized — NOT "Helped", "Assisted", "Responsible for")
   - Does it include a measurable result? (%, $, time, count, scale)
   - Does it describe the method/approach used?
   - Rate: "strong" (all 3), "moderate" (2 of 3), "weak" (1 or 0 of 3)

4. SECTION ANALYSIS:
   - Is there a Professional Summary/Objective that contains the target job title and core keywords?
   - Is there a Skills section with categorized technical skills?
   - Are sections in optimal order for this role? (Summary → Experience → Skills → Education for experienced candidates)

5. SCORING (be strict and realistic — most unoptimized resumes score 40-60%):

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "overallScore": 0-100,
  "keywordMatch": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "partial": ["keyword5"],
    "score": 0-100,
    "totalJdKeywords": 0,
    "matchedCount": 0,
    "placementScore": 0-100
  },
  "sectionScores": {
    "summary": 0-100,
    "experience": 0-100,
    "skills": 0-100,
    "education": 0-100,
    "overall": 0-100
  },
  "bulletAnalysis": {
    "total": 0,
    "strong": 0,
    "moderate": 0,
    "weak": 0,
    "score": 0-100
  },
  "improvements": [
    "CRITICAL: [specific actionable fix with example]",
    "HIGH: [specific actionable fix with example]",
    "MEDIUM: [specific actionable fix with example]"
  ],
  "missingKeywordsByCategory": {
    "required": ["must-have skills not found"],
    "preferred": ["nice-to-have skills not found"],
    "methodologies": ["processes not mentioned"]
  }
}

SCORING GUIDELINES:
- 90-100: Exceptional — nearly all JD keywords present in multiple locations, strong XYZ bullets with metrics, compelling summary
- 75-89: Good — most required keywords present, decent bullets, some gaps in keyword placement
- 50-74: Needs Work — significant keyword gaps, weak bullets without metrics, missing or generic summary
- Below 50: Major Rewrite Needed — most JD keywords missing, no metrics, wrong section structure

CRITICAL: Be strict. Real ATS systems are unforgiving. If a keyword from the JD is not in the resume at all, it's a zero match for that keyword — no assumptions.
`;
};
