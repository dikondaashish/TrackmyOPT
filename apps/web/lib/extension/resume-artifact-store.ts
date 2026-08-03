/**
 * Selection and row-shaping logic for persisted per-job tailored resumes.
 *
 * The matching predicate is imported from the extension itself
 * (`jobUrlsReferToSameJob`) rather than reimplemented here. If the server and
 * the extension ever disagreed about which posting an artifact belongs to, the
 * extension would attach a resume the server would not hand out — or worse,
 * another employer's resume. One implementation, one answer.
 *
 * Pure module: no Supabase, no Next request handling, so the selection rules
 * are unit-testable on their own.
 */

import {
  jobUrlsReferToSameJob,
  type GeneratedResumeArtifactV1,
} from '../../../extension/src/resume-autofill-contract';
import { extractAtsJobIdentity } from '../../../extension/src/ats-job-identity';

/** How long a stored tailored resume stays offerable. */
export const STORED_ARTIFACT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Newest-first cap on how many artifacts one user may keep. */
export const MAX_STORED_ARTIFACTS_PER_USER = 50;

/** Identity-only projection — never selects the PDF-bearing `artifact` column. */
export interface StoredArtifactCandidate {
  id: string;
  source_url: string;
  requisition_id: string | null;
  created_at: string;
  expires_at: string;
}

interface ArtifactJobContext {
  jobUrl: string;
  companyName?: string;
  roleTitle?: string;
}

/**
 * Pick the artifact that belongs to this page: the most recently created
 * unexpired candidate whose posting URL resolves to the same job.
 *
 * Candidates are assumed newest-first (the query orders by created_at desc);
 * the comparison is redone here so a caller passing an arbitrary order still
 * gets the newest match.
 */
export function selectMatchingArtifact(
  candidates: readonly StoredArtifactCandidate[],
  context: ArtifactJobContext,
  now: number = Date.now(),
): StoredArtifactCandidate | null {
  let best: StoredArtifactCandidate | null = null;
  let bestCreatedAt = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const expiresAt = Date.parse(candidate.expires_at);
    if (!Number.isFinite(expiresAt) || now >= expiresAt) continue;
    if (
      !jobUrlsReferToSameJob(
        candidate.source_url,
        context.jobUrl,
        candidate.requisition_id ?? undefined,
      )
    ) {
      continue;
    }
    const createdAt = Date.parse(candidate.created_at);
    const rank = Number.isFinite(createdAt) ? createdAt : 0;
    if (rank > bestCreatedAt) {
      bestCreatedAt = rank;
      best = candidate;
    }
  }
  return best;
}

/**
 * Candidates the incoming artifact supersedes: same user, same posting.
 * Regenerating for a job replaces its stored resume instead of accumulating
 * near-duplicates that a later lookup would have to disambiguate.
 */
export function supersededArtifactIds(
  candidates: readonly StoredArtifactCandidate[],
  artifact: GeneratedResumeArtifactV1,
): string[] {
  return candidates
    .filter((candidate) =>
      jobUrlsReferToSameJob(
        candidate.source_url,
        artifact.job.sourceUrl,
        candidate.requisition_id ?? undefined,
      ),
    )
    .map((candidate) => candidate.id);
}

/**
 * Candidates beyond the per-user cap, oldest first, so a heavy user's storage
 * stays bounded without a scheduled job.
 */
export function overflowArtifactIds(
  candidates: readonly StoredArtifactCandidate[],
  keep: number = MAX_STORED_ARTIFACTS_PER_USER,
): string[] {
  return [...candidates]
    .sort((left, right) =>
      Date.parse(right.created_at) - Date.parse(left.created_at),
    )
    .slice(keep)
    .map((candidate) => candidate.id);
}

interface GeneratedResumeArtifactRow {
  user_id: string;
  source_url: string;
  ats_platform: string | null;
  ats_tenant: string | null;
  ats_job_id: string | null;
  requisition_id: string | null;
  company_name: string;
  role_title: string;
  artifact: GeneratedResumeArtifactV1;
  generated_content_hash: string;
  pdf_sha256: string;
  expires_at: string;
}

export function buildArtifactRow(
  userId: string,
  artifact: GeneratedResumeArtifactV1,
  now: number = Date.now(),
): GeneratedResumeArtifactRow {
  const identity = extractAtsJobIdentity(artifact.job.sourceUrl);
  return {
    user_id: userId,
    source_url: artifact.job.sourceUrl.slice(0, 2048),
    ats_platform: identity?.platform ?? null,
    ats_tenant: identity?.tenant || null,
    ats_job_id: identity?.jobId ?? null,
    requisition_id: artifact.job.requisitionId ?? null,
    company_name: (artifact.job.companyName || '').slice(0, 300),
    role_title: (artifact.job.roleTitle || '').slice(0, 300),
    artifact,
    generated_content_hash: artifact.generatedContentHash,
    pdf_sha256: artifact.pdf.sha256,
    expires_at: new Date(now + STORED_ARTIFACT_TTL_MS).toISOString(),
  };
}

/**
 * Re-stamp a stored artifact's lifetime for the session that is about to use
 * it. Storage keeps the resume for 30 days; the in-page artifact contract is
 * still the original short-lived window, so the extension re-validates and
 * expires it exactly as it does for a freshly generated one.
 */
export function reviveStoredArtifact(
  artifact: GeneratedResumeArtifactV1,
  ttlMs: number,
  now: number = Date.now(),
): GeneratedResumeArtifactV1 {
  return {
    ...artifact,
    generatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlMs).toISOString(),
  };
}
