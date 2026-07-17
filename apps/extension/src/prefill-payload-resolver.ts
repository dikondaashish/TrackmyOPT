import { validateArtifactForPrefill } from './resume-artifact-lifecycle';
import { validateGeneratedResumeArtifactV1 } from './resume-artifact-validator';
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
  onArtifactRejected?: (
    reason: 'expired' | 'job_changed' | 'invalid',
  ) => void | Promise<void>;
}): Promise<V1PrefillPayloadResponse> {
  let reason: 'missing' | 'expired' | 'job_changed' | 'invalid' | undefined;
  let validArtifact: GeneratedResumeArtifactV1 | undefined;

  if (!input.artifact) {
    reason = 'missing';
  } else if (!(await validateGeneratedResumeArtifactV1(input.artifact))) {
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

  if (reason && reason !== 'missing') {
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
    snapshot: validArtifact.snapshot,
    resume: {
      pdfBase64: validArtifact.pdf.base64,
      filename: validArtifact.pdf.filename,
    },
    profileFallback: fallbackResult.profile,
  };
}
