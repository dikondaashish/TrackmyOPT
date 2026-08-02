import { validateArtifactForPrefill } from './resume-artifact-lifecycle';
import { validateGeneratedResumeArtifactV1 } from './resume-artifact-validator';
import {
  AUTOFILL_FEATURE_FLAGS,
  type AutofillFeatureFlags,
} from './autofill-feature-flags';
import type {
  BasicContactProfile,
  GeneratedResumeArtifactV1,
  V1PrefillPayloadRequest,
  V1PrefillPayloadResponse,
} from './resume-autofill-contract';

export interface ProfileFallbackResult {
  ok: boolean;
  error?: string;
  profile?: BasicContactProfile;
}

export async function resolveV1PrefillPayload(input: {
  artifact: GeneratedResumeArtifactV1 | null;
  request: V1PrefillPayloadRequest;
  fetchProfileFallback: () => Promise<ProfileFallbackResult>;
  featureFlags?: Readonly<AutofillFeatureFlags>;
  /**
   * When false, a rejected artifact is left in place (UI peek / mount reconcile).
   * Prefill execution keeps the default true so a different job cannot reuse it.
   */
  discardRejectedArtifact?: boolean;
  onArtifactRejected?: (
    reason: 'expired' | 'job_changed' | 'invalid',
  ) => void | Promise<void>;
}): Promise<V1PrefillPayloadResponse> {
  const featureFlags = input.featureFlags ?? AUTOFILL_FEATURE_FLAGS;
  const discardRejectedArtifact = input.discardRejectedArtifact !== false;
  let reason:
    | 'missing'
    | 'expired'
    | 'job_changed'
    | 'invalid'
    | 'feature_disabled'
    | undefined;
  let validArtifact: GeneratedResumeArtifactV1 | undefined;

  if (!featureFlags.artifactPrefill) {
    reason = 'feature_disabled';
  } else if (!input.artifact) {
    reason = 'missing';
  } else if (
    !(await validateGeneratedResumeArtifactV1(input.artifact, {
      validateCoverLetter: featureFlags.coverLetter,
    }))
  ) {
    reason = 'invalid';
  } else {
    const now = Date.parse(input.request.now);
    if (!Number.isFinite(now)) {
      reason = 'invalid';
    } else {
      const lifecycle = validateArtifactForPrefill(
        input.artifact,
        input.request.jobContext,
        now
      );
      if (lifecycle.valid) validArtifact = input.artifact;
      else reason = lifecycle.reason;
    }
  }

  if (
    discardRejectedArtifact &&
    reason &&
    reason !== 'missing' &&
    reason !== 'feature_disabled'
  ) {
    await input.onArtifactRejected?.(reason);
  }

  const fallbackResult = await input.fetchProfileFallback();
  if (!fallbackResult.ok || !fallbackResult.profile) {
    return {
      ok: false,
      error:
        fallbackResult.error === 'not_signed_in'
          ? 'not_signed_in'
          : 'unavailable',
    };
  }

  if (!validArtifact || reason) {
    return {
      ok: true,
      source: 'profile_only',
      reason: reason ?? 'invalid',
      profileFallback: fallbackResult.profile,
    };
  }

  return {
    ok: true,
    source: 'generated_resume',
    artifactId: validArtifact.artifactId,
    artifactLabel: `${validArtifact.sourceResumeFilename} · ${validArtifact.job.roleTitle}`,
    generatedContentHash: validArtifact.generatedContentHash,
    ...(validArtifact.job.jobDescription
      ? { jobDescription: validArtifact.job.jobDescription }
      : {}),
    snapshot: validArtifact.snapshot,
    resume: {
      pdfBase64: validArtifact.pdf.base64,
      filename: validArtifact.pdf.filename,
    },
    ...(featureFlags.coverLetter && validArtifact.coverLetter
      ? { coverLetter: validArtifact.coverLetter }
      : {}),
    profileFallback: fallbackResult.profile,
  };
}
