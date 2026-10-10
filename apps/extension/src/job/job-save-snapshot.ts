export const JOB_DESCRIPTION_MAX_LENGTH = 15_000;
export const SALARY_TEXT_MAX_LENGTH = 300;

export interface JobSaveSnapshotSource {
  company_name: string;
  role_title: string;
  job_url?: string;
  location?: string;
  salary_text?: string;
  job_description?: string;
}

function normalizeSnapshotText(value: unknown, maxLength: number, preserveLines = false): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = preserveLines
    ? value
      .replace(/\r\n?/g, '\n')
      .replace(/[^\S\n]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    : value.replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

/** Build the bounded payload sent to the background worker when saving a job. */
export function buildJobSaveSnapshot<T extends JobSaveSnapshotSource>(
  job: T,
  currentJobDescription = '',
): T & { salary_text?: string; job_description?: string } {
  const snapshot = { ...job } as T & { salary_text?: string; job_description?: string };
  const salaryText = normalizeSnapshotText(job.salary_text, SALARY_TEXT_MAX_LENGTH);
  const jobDescription = normalizeSnapshotText(
    job.job_description || currentJobDescription,
    JOB_DESCRIPTION_MAX_LENGTH,
    true,
  );

  if (salaryText) snapshot.salary_text = salaryText;
  else delete snapshot.salary_text;
  if (jobDescription) snapshot.job_description = jobDescription;
  else delete snapshot.job_description;

  return snapshot;
}
