import {
  jobUrlsReferToSameJob,
  normalizeJobIdentityText,
  type GeneratedResumeArtifactV1,
  type JobContextIdentity,
} from './resume-autofill-contract';

export const ARTIFACT_EXPECTED_SESSION_KEY =
  'tmo_generated_resume_expected_for_job_v1';

export const INACTIVE_ARTIFACT_FALLBACK_MESSAGE =
  'This generated resume is no longer active for this job. Generate again or continue with profile-only prefill.';

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type ArtifactExpectation = {
  sourceUrl: string;
  requisitionId?: string;
  companyName: string;
  roleTitle: string;
};

function readExpectation(
  storage: SessionStorageLike,
): ArtifactExpectation | undefined {
  try {
    const raw = storage.getItem(ARTIFACT_EXPECTED_SESSION_KEY);
    if (!raw) return undefined;
    const value = JSON.parse(raw) as Partial<ArtifactExpectation>;
    if (
      typeof value.sourceUrl !== 'string' ||
      typeof value.companyName !== 'string' ||
      typeof value.roleTitle !== 'string'
    ) return undefined;
    return {
      sourceUrl: value.sourceUrl,
      requisitionId:
        typeof value.requisitionId === 'string' ? value.requisitionId : undefined,
      companyName: value.companyName,
      roleTitle: value.roleTitle,
    };
  } catch {
    return undefined;
  }
}

export function rememberArtifactExpectedForSession(
  storage: SessionStorageLike,
  artifact: GeneratedResumeArtifactV1,
): void {
  try {
    storage.setItem(ARTIFACT_EXPECTED_SESSION_KEY, JSON.stringify({
      sourceUrl: artifact.job.sourceUrl,
      requisitionId: artifact.job.requisitionId,
      companyName: artifact.job.companyName,
      roleTitle: artifact.job.roleTitle,
    } satisfies ArtifactExpectation));
  } catch {
    // The marker is best-effort and contains job identity only, never resume data.
  }
}

export function clearArtifactExpectedForSession(
  storage: SessionStorageLike,
): void {
  try {
    storage.removeItem(ARTIFACT_EXPECTED_SESSION_KEY);
  } catch {
    // Ignore unavailable session storage.
  }
}

export function artifactExpectedForSession(
  storage: SessionStorageLike,
  jobContext: JobContextIdentity,
): boolean {
  const expectation = readExpectation(storage);
  if (!expectation) return false;
  return (
    jobUrlsReferToSameJob(
      expectation.sourceUrl,
      jobContext.jobUrl,
      expectation.requisitionId,
    ) &&
    normalizeJobIdentityText(expectation.companyName) ===
      normalizeJobIdentityText(jobContext.companyName) &&
    normalizeJobIdentityText(expectation.roleTitle) ===
      normalizeJobIdentityText(jobContext.roleTitle)
  );
}

export function renderInactiveArtifactFallback(input: {
  host: HTMLElement;
  artifactAvailable: boolean;
}): boolean {
  // Mount reconciliation always asks the authoritative background resolver.
  // A missing marker must never turn an unavailable artifact into a silent UI.
  const visible = !input.artifactAvailable;
  input.host.textContent = visible ? INACTIVE_ARTIFACT_FALLBACK_MESSAGE : '';
  input.host.style.display = visible ? 'block' : 'none';
  if (visible) input.host.setAttribute('role', 'alert');
  else input.host.removeAttribute('role');
  return visible;
}
