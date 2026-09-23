import { WEBSITE_URL } from './config';
import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';
import {
  clearActiveGeneratedResumeArtifact,
  readActiveGeneratedResumeArtifact,
  replaceActiveGeneratedResumeArtifact,
} from './active-resume-artifact-store';
import { getExtensionBearerToken } from './background-auth';
import { validateGeneratedResumeArtifactV1 } from './resume-artifact-validator';
import { validateArtifactForPrefill } from './resume-artifact-lifecycle';
import type { SavedJobResumeResponse } from './saved-job-resume';
import { readCachedToken } from './token-store';

const STATE_KEY = 'tmo_active_resume_state_v1';
interface ActiveResumeState {
  artifactId: string;
  ownerId: string;
  savedToAccount: boolean;
  generatedAt?: string;
}
let activeState: ActiveResumeState | null = null;
const originalDates = new WeakMap<
  GeneratedResumeArtifactV1,
  string | undefined
>();

// V1 still owns exactly one active artifact. The memory value is a fast cache;
// chrome.storage.session is authoritative across MV3 worker recreation.
let currentGeneratedResumeArtifact: GeneratedResumeArtifactV1 | null = null;

export async function clearCurrentGeneratedResumeArtifact(): Promise<void> {
  currentGeneratedResumeArtifact = null;
  activeState = null;
  await clearActiveGeneratedResumeArtifact();
}

export async function cacheCurrentGeneratedResumeArtifact(
  artifact: GeneratedResumeArtifactV1,
  options?: { persist?: boolean; notifyTabs?: boolean }
): Promise<boolean> {
  const ownerId = (await readCachedToken())?.userId;
  if (!ownerId) return false;
  currentGeneratedResumeArtifact = artifact;
  activeState = {
    artifactId: artifact.artifactId,
    ownerId,
    savedToAccount: false,
    generatedAt:
      options?.persist === false
        ? originalDates.get(artifact)
        : artifact.generatedAt,
  };
  await replaceActiveGeneratedResumeArtifact(artifact);
  // An artifact that came *from* storage must not be written straight back.
  const saved =
    options?.persist !== false
      ? await persistGeneratedResumeArtifact(artifact, ownerId)
      : true;
  if ((await readCachedToken())?.userId !== ownerId) {
    await clearCurrentGeneratedResumeArtifact();
    return false;
  }
  if (
    currentGeneratedResumeArtifact?.artifactId === artifact.artifactId &&
    activeState
  ) {
    activeState.savedToAccount = saved;
    await chrome.storage.session
      .set({ [STATE_KEY]: activeState })
      .catch(() => undefined);
  }
  // GENERATED_RESUME_ARTIFACT_READY means "the user just generated this", and
  // the page handler responds by running a prefill. Restoring a previously
  // stored resume must stay silent, or simply opening a job page the user
  // tailored last week would fill the application without them asking.
  if (options?.notifyTabs !== false) await notifyTabsGeneratedResumeReady();
  return saved;
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
      })
    );
  } catch {
    // Widget refresh is best-effort; prefill still resolves from session store.
  }
}

export async function readCurrentGeneratedResumeArtifact(): Promise<GeneratedResumeArtifactV1 | null> {
  const ownerId = (await readCachedToken())?.userId;
  if (!activeState) {
    activeState =
      ((
        await chrome.storage.session
          .get(STATE_KEY)
          .catch(() => ({}) as Record<string, unknown>)
      )[STATE_KEY] as ActiveResumeState) ?? null;
  }
  if (!ownerId || ownerId !== activeState?.ownerId) {
    await clearCurrentGeneratedResumeArtifact();
    return null;
  }
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
  expectedUserId?: string
): Promise<boolean> {
  try {
    const bearer = await getExtensionBearerToken();
    if (!bearer) return false;
    if (expectedUserId && (await readCachedToken())?.userId !== expectedUserId)
      return false;
    const response = await fetch(
      `${WEBSITE_URL}/api/extension/resume-artifact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify({ artifact }),
        signal: globalThis.AbortSignal?.timeout?.(15_000),
      }
    );
    const body = await response.json().catch(() => null);
    return response.ok && body?.ok === true && body?.stored === true;
  } catch {
    // Offline or rate-limited; the in-session artifact remains usable.
    return false;
  }
}

/**
 * Ask the server whether a tailored resume exists for this posting. Called only
 * when the in-memory/session artifact does not cover the page, which is the
 * "generated earlier, applying now" case the session store cannot serve.
 */
export async function fetchStoredArtifactForJob(
  jobUrl: string
): Promise<GeneratedResumeArtifactV1 | null> {
  const result = await lookupSavedJobResume(jobUrl, false);
  return result.ok ? result.artifact : null;
}

/** Read-only: displaying a saved resume must never replace an in-flight run or fill a form. */
export async function lookupSavedJobResume(
  jobUrl: string,
  preferActive = true
): Promise<SavedJobResumeResponse> {
  if (!/^https?:\/\//.test(jobUrl) || jobUrl.length > 2048)
    return { ok: false, error: 'invalid_job_url' };
  try {
    const bearer = await getExtensionBearerToken();
    if (!bearer) return { ok: false, error: 'not_signed_in' };
    const ownerId = (await readCachedToken())?.userId;
    if (preferActive) {
      const active = await readCurrentGeneratedResumeArtifact();
      if (
        active &&
        activeState?.artifactId === active.artifactId &&
        validateArtifactForPrefill(active, {
          jobUrl,
          companyName: '',
          roleTitle: '',
        }).valid &&
        (await validateGeneratedResumeArtifactV1(active, {
          validateCoverLetter: true,
        }))
      ) {
        return {
          ok: true,
          artifact: active,
          generatedAt: activeState.generatedAt,
          savedToAccount: activeState.savedToAccount,
        };
      }
    }
    const endpoint = new URL(`${WEBSITE_URL}/api/extension/resume-artifact`);
    endpoint.searchParams.set('jobUrl', jobUrl);
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      cache: 'no-store',
      signal: globalThis.AbortSignal?.timeout?.(15_000),
    });
    if (!response.ok) return { ok: false, error: 'unavailable' };
    const body = (await response.json()) as {
      ok?: boolean;
      artifact?: unknown;
      generatedAt?: string;
      expiresAt?: string;
    };
    if ((await readCachedToken())?.userId !== ownerId)
      return { ok: false, error: 'account_changed' };
    if (body.ok !== true) return { ok: false, error: 'unavailable' };
    const artifact = body.artifact;
    if (artifact === null) return { ok: true, artifact: null };
    if (
      !(await validateGeneratedResumeArtifactV1(artifact, {
        validateCoverLetter: true,
      }))
    )
      return { ok: false, error: 'invalid_resume' };
    const valid = artifact as GeneratedResumeArtifactV1;
    if (
      !validateArtifactForPrefill(
        valid,
        { jobUrl, companyName: '', roleTitle: '' },
        Date.now()
      ).valid
    )
      return { ok: false, error: 'invalid_resume' };
    const generatedAt =
      body.generatedAt && Number.isFinite(Date.parse(body.generatedAt))
        ? body.generatedAt
        : undefined;
    originalDates.set(valid, generatedAt);
    return {
      ok: true,
      artifact: valid,
      savedToAccount: true,
      generatedAt,
      expiresAt: body.expiresAt,
    };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}

export async function retryActiveResumeSave(
  jobUrl: string,
  artifactId: string
): Promise<boolean> {
  if (!(await getExtensionBearerToken())) return false;
  const artifact = await readCurrentGeneratedResumeArtifact();
  if (
    !artifact ||
    artifact.artifactId !== artifactId ||
    !activeState ||
    !validateArtifactForPrefill(artifact, {
      jobUrl,
      companyName: '',
      roleTitle: '',
    }).valid ||
    !(await validateGeneratedResumeArtifactV1(artifact, {
      validateCoverLetter: true,
    }))
  )
    return false;
  const owner = activeState.ownerId;
  const saved = await persistGeneratedResumeArtifact(artifact, owner);
  if ((await readCachedToken())?.userId !== owner) return false;
  if (saved && activeState?.artifactId === artifactId) {
    activeState.savedToAccount = true;
    await chrome.storage.session
      .set({ [STATE_KEY]: activeState })
      .catch(() => undefined);
  }
  return saved;
}

/** Sync peek of the in-memory artifact (no session restore). */
export function peekCurrentGeneratedResumeArtifact(): GeneratedResumeArtifactV1 | null {
  return currentGeneratedResumeArtifact;
}
