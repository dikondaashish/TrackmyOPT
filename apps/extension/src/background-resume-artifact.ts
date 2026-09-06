import { WEBSITE_URL } from './config';
import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';
import {
  clearActiveGeneratedResumeArtifact,
  readActiveGeneratedResumeArtifact,
  replaceActiveGeneratedResumeArtifact,
} from './active-resume-artifact-store';
import { getExtensionBearerToken } from './background-auth';

// V1 still owns exactly one active artifact. The memory value is a fast cache;
// chrome.storage.session is authoritative across MV3 worker recreation.
let currentGeneratedResumeArtifact: GeneratedResumeArtifactV1 | null = null;

export async function clearCurrentGeneratedResumeArtifact(): Promise<void> {
  currentGeneratedResumeArtifact = null;
  await clearActiveGeneratedResumeArtifact();
}

export async function cacheCurrentGeneratedResumeArtifact(
  artifact: GeneratedResumeArtifactV1,
  options?: { persist?: boolean; notifyTabs?: boolean },
): Promise<void> {
  currentGeneratedResumeArtifact = artifact;
  await replaceActiveGeneratedResumeArtifact(artifact);
  // An artifact that came *from* storage must not be written straight back.
  if (options?.persist !== false) await persistGeneratedResumeArtifact(artifact);
  // GENERATED_RESUME_ARTIFACT_READY means "the user just generated this", and
  // the page handler responds by running a prefill. Restoring a previously
  // stored resume must stay silent, or simply opening a job page the user
  // tailored last week would fill the application without them asking.
  if (options?.notifyTabs !== false) await notifyTabsGeneratedResumeReady();
}

/** Tell open job-page widgets that a tailored resume is ready for prefill attach. */
async function notifyTabsGeneratedResumeReady(): Promise<void> {
  const artifact = currentGeneratedResumeArtifact;
  const payload = {
    type: 'GENERATED_RESUME_ARTIFACT_READY' as const,
    job: artifact
      ? {
          sourceUrl: artifact.job.sourceUrl,
          companyName: artifact.job.companyName,
          roleTitle: artifact.job.roleTitle,
          requisitionId: artifact.job.requisitionId,
        }
      : undefined,
  };
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs.map((tab) => {
        if (tab.id === undefined) return Promise.resolve();
        return chrome.tabs.sendMessage(tab.id, payload).catch(() => undefined);
      }),
    );
  } catch {
    // Widget refresh is best-effort; prefill still resolves from session store.
  }
}

export async function readCurrentGeneratedResumeArtifact(): Promise<GeneratedResumeArtifactV1 | null> {
  if (currentGeneratedResumeArtifact) return currentGeneratedResumeArtifact;
  const stored = await readActiveGeneratedResumeArtifact();
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    currentGeneratedResumeArtifact = stored as GeneratedResumeArtifactV1;
  }
  return currentGeneratedResumeArtifact;
}

/**
 * Persist the tailored resume against its posting so it survives the 30-minute
 * in-page window, a browser restart, and a different device. Best-effort: the
 * session artifact already works for the current run, so a storage failure must
 * never fail the generation the user just waited 40 seconds for.
 */
export async function persistGeneratedResumeArtifact(
  artifact: GeneratedResumeArtifactV1,
): Promise<void> {
  try {
    const bearer = await getExtensionBearerToken();
    if (!bearer) return;
    await fetch(`${WEBSITE_URL}/api/extension/resume-artifact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ artifact }),
    });
  } catch {
    // Offline or rate-limited; the in-session artifact remains usable.
  }
}

/**
 * Ask the server whether a tailored resume exists for this posting. Called only
 * when the in-memory/session artifact does not cover the page, which is the
 * "generated earlier, applying now" case the session store cannot serve.
 */
export async function fetchStoredArtifactForJob(
  jobUrl: string,
): Promise<GeneratedResumeArtifactV1 | null> {
  if (!jobUrl.trim()) return null;
  try {
    const bearer = await getExtensionBearerToken();
    if (!bearer) return null;
    const endpoint = new URL(`${WEBSITE_URL}/api/extension/resume-artifact`);
    endpoint.searchParams.set('jobUrl', jobUrl);
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { artifact?: unknown };
    const artifact = body.artifact;
    if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
      return null;
    }
    return artifact as GeneratedResumeArtifactV1;
  } catch {
    return null;
  }
}

/** Sync peek of the in-memory artifact (no session restore). */
export function peekCurrentGeneratedResumeArtifact(): GeneratedResumeArtifactV1 | null {
  return currentGeneratedResumeArtifact;
}
