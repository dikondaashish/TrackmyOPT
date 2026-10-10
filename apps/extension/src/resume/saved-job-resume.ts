import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';

export type SavedJobResumeResponse =
  | {
      ok: true;
      artifact: GeneratedResumeArtifactV1 | null;
      generatedAt?: string;
      expiresAt?: string;
      savedToAccount?: boolean;
    }
  | { ok: false; error: string };

/** Ignore whitespace-only changes and compare the same bounded text stored at generation. */
export function savedResumeChangeHint(
  artifact: GeneratedResumeArtifactV1,
  jobDescription: string,
  source?: { id: string; updatedAt?: string | null },
  generatedAt?: string
): string | null {
  const normalized = (value: string) =>
    value.trim().slice(0, 12000).replace(/\s+/g, ' ');
  if (
    jobDescription.trim() &&
    artifact.job.jobDescription &&
    normalized(jobDescription) !== normalized(artifact.job.jobDescription)
  ) {
    return 'The job description has changed. You can create an updated résumé below.';
  }
  if (
    source &&
    (source.id !== artifact.sourceResumeId ||
      (generatedAt &&
        source.updatedAt &&
        Date.parse(source.updatedAt) > Date.parse(generatedAt)))
  ) {
    return 'Your selected base résumé has changed. Create a new version to use those updates.';
  }
  return null;
}
