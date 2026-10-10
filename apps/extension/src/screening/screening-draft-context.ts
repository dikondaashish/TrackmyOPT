export const SCREENING_DRAFT_JOB_DESCRIPTION_MAX_CHARS = 12_000;

export interface ScreeningDraftJobContext {
  companyName: string;
  roleTitle: string;
  jobDescription: string;
}

function normalizeDescription(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, SCREENING_DRAFT_JOB_DESCRIPTION_MAX_CHARS);
}

export function resolveScreeningDraftJobContext(input: {
  artifactJob: {
    companyName: string;
    roleTitle: string;
    jobDescription?: string;
  };
  pageContext: ScreeningDraftJobContext;
}): ScreeningDraftJobContext {
  return {
    companyName: input.artifactJob.companyName,
    roleTitle: input.artifactJob.roleTitle,
    jobDescription: normalizeDescription(
      input.artifactJob.jobDescription || input.pageContext.jobDescription
    ),
  };
}
