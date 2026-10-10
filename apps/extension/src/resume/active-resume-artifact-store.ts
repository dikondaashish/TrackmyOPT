import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';

export const ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY =
  'tmo_active_generated_resume_artifact_v1';

// chrome.storage.session has a 10 MiB quota. Keep one MiB of headroom for
// serialization overhead and other session-scoped extension state.
export const MAX_SESSION_ARTIFACT_BYTES = 9 * 1024 * 1024;

export type PersistArtifactResult =
  | { ok: true; bytes: number }
  | { ok: false; reason: 'oversized' | 'storage_unavailable'; bytes: number };

export function serializedArtifactSize(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export async function replaceActiveGeneratedResumeArtifact(
  artifact: GeneratedResumeArtifactV1,
): Promise<PersistArtifactResult> {
  const bytes = serializedArtifactSize(artifact);
  if (!Number.isFinite(bytes) || bytes > MAX_SESSION_ARTIFACT_BYTES) {
    await clearActiveGeneratedResumeArtifact();
    return { ok: false, reason: 'oversized', bytes };
  }

  try {
    // One fixed key deliberately preserves the V1 single-active-artifact
    // model. A regeneration overwrites this value instead of creating a
    // registry or retaining another job's resume.
    await chrome.storage.session.set({
      [ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY]: artifact,
    });
    return { ok: true, bytes };
  } catch {
    // Never leave a prior job's artifact active when replacement fails.
    await clearActiveGeneratedResumeArtifact();
    return { ok: false, reason: 'storage_unavailable', bytes };
  }
}

export async function readActiveGeneratedResumeArtifact(): Promise<unknown> {
  try {
    const stored = await chrome.storage.session.get(
      ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY,
    );
    return stored[ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY];
  } catch {
    return undefined;
  }
}

export async function clearActiveGeneratedResumeArtifact(): Promise<void> {
  try {
    await chrome.storage.session.remove(
      ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY,
    );
  } catch {
    // The in-memory owner is still cleared by the caller. Storage cleanup is
    // best-effort when Chrome is already tearing down the extension context.
  }
}
