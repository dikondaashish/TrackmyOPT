import { API_ENDPOINTS, WEBSITE_URL } from './config';
import { performExtensionSignOut, EXTENSION_LOCAL_SIGNOUT_KEY } from './signOut';
import { readCachedToken, setIdToken, clearIdToken, purgeLegacySyncToken } from './token-store';
import { isJobFitLimitResponse, normalizeJobFitAnalysis } from './job-fit';
import { buildJobSaveSnapshot } from './job-save-snapshot';
import { buildScoreComparison, normalizeOptClockNudge, type DuplicateApplicationNotice, type OptClockNudge } from './smart-flow';
import {
  WIDGET_ANALYTICS_EVENTS,
  normalizeWidgetAnalyticsProperties,
  type WidgetAnalyticsEvent,
} from './widget-platform';
import {
  buildGeneratedResumeResult,
  type SnapshotExtractionHandoff,
} from './resume-generation-result';
import { compileLatexWithSingleRepair } from './compile-latex-with-repair';
import { RunRegistry, RunSession, RunCancelledError } from './agent/run-session';
import { RUN_PORT_NAME, type RunCommand } from './agent/run-protocol';
import type {
  BasicContactProfile,
  GeneratedCoverLetterAttachment,
  GeneratedResumeArtifactV1,
  ResumeAutofillSnapshotV1,
  V1PrefillPayloadRequest,
  V1PrefillPayloadResponse,
} from './resume-autofill-contract';
import { buildGeneratedResumeArtifactV1 } from './resume-artifact-lifecycle';
import { resolveV1PrefillPayload } from './prefill-payload-resolver';
import {
  validateGeneratedCoverLetterAttachment,
  validateResumeAutofillSnapshotV1,
} from './resume-artifact-validator';
import { AUTOFILL_FEATURE_FLAGS } from './autofill-feature-flags';
import {
  FREE_AUTOFILL_PLAN_ENTITLEMENTS,
  resolveAutofillPlanEntitlements,
  resolveAutofillPlanTier,
} from './autofill-plan-entitlements';
import { normalizeQuestionText } from './screening-question-drafts';
import {
  deleteSavedScreeningAnswer,
  loadSavedScreeningAnswer,
  saveScreeningAnswer,
  type SavedAnswerWrite,
} from './saved-screening-answers';
import { resolveScreeningDraftJobContext } from './screening-draft-context';
import {
  normalizeSavedPrivateApplicationAnswers,
  normalizeSensitiveAnswerSession,
  type SavedPrivateApplicationAnswers,
} from './sensitive-autofill';
import {
  clearActiveGeneratedResumeArtifact,
  readActiveGeneratedResumeArtifact,
  replaceActiveGeneratedResumeArtifact,
} from './active-resume-artifact-store';
import {
  filterPrivateAnswersForSenderUrl,
  hostnameFromSenderTabUrl,
} from './private-application-delivery';

// One-time migration: older builds stored the JWT in chrome.storage.sync.
// Purge any leftover so no credential material remains in synced storage.
chrome.runtime.onInstalled.addListener(() => {
  purgeLegacySyncToken().catch(() => {});
});

// ISS-039: cap the cached token TTL at 5 minutes and refresh on tab focus.
// The web side now issues 5-minute JWTs (mintToken), matching this window so
// the cached token never outlives the issued token.
const TOKEN_TTL_MS = 5 * 60 * 1000;

// V1 still owns exactly one active artifact. The memory value is a fast cache;
// chrome.storage.session is authoritative across MV3 worker recreation.
let currentGeneratedResumeArtifact: GeneratedResumeArtifactV1 | null = null;

async function clearCurrentGeneratedResumeArtifact(): Promise<void> {
  currentGeneratedResumeArtifact = null;
  await clearActiveGeneratedResumeArtifact();
}

async function cacheCurrentGeneratedResumeArtifact(
  artifact: GeneratedResumeArtifactV1,
): Promise<void> {
  currentGeneratedResumeArtifact = artifact;
  await replaceActiveGeneratedResumeArtifact(artifact);
  await notifyTabsGeneratedResumeReady();
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

async function readCurrentGeneratedResumeArtifact(): Promise<GeneratedResumeArtifactV1 | null> {
  if (currentGeneratedResumeArtifact) return currentGeneratedResumeArtifact;
  const stored = await readActiveGeneratedResumeArtifact();
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    currentGeneratedResumeArtifact = stored as GeneratedResumeArtifactV1;
  }
  return currentGeneratedResumeArtifact;
}

/** True if JWT `exp` is more than 60s in the future (matches popup refresh heuristic). */
function isJwtNotExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1])) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

async function getExtensionBearerToken(forceRefresh = false): Promise<string | null> {
  const sync = await chrome.storage.sync.get(['signedIn', EXTENSION_LOCAL_SIGNOUT_KEY]);
  // Only extension-initiated disconnect blocks minting; `signedIn` alone may be stale after web re-login.
  if (sync[EXTENSION_LOCAL_SIGNOUT_KEY] === true) {
    await clearIdToken();
    return null;
  }

  const cached = await readCachedToken();
  const cacheFresh = !!(cached && Date.now() - cached.issuedAt < TOKEN_TTL_MS);

  if (!forceRefresh && cacheFresh) {
    await chrome.storage.sync.set({ signedIn: true });
    return cached!.token;
  }

  if (!forceRefresh && cached && isJwtNotExpired(cached.token)) {
    await chrome.storage.sync.set({ signedIn: true });
    return cached.token;
  }

  try {
    const res = await fetch(API_ENDPOINTS.EXTENSION_TOKEN, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as { token?: string; userId?: string };
      if (!data.token) return null;
      await setIdToken(data.token, data.userId);
      await chrome.storage.sync.set({ signedIn: true });
      return data.token;
    }
  } catch {
    /* ignore */
  }

  if (cached && isJwtNotExpired(cached.token)) {
    await chrome.storage.sync.set({ signedIn: true });
    return cached.token;
  }

  await clearIdToken();
  return null;
}

async function getAutofillPlanEntitlements() {
  const bearer = await getExtensionBearerToken();
  if (!bearer) {
    return {
      ok: false as const,
      planTier: 'free' as const,
      entitlements: FREE_AUTOFILL_PLAN_ENTITLEMENTS,
    };
  }
  try {
    const response = await fetch(API_ENDPOINTS.STATUS, {
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
    });
    if (!response.ok) throw new Error('status_unavailable');
    const status = (await response.json()) as {
      isPremium?: boolean;
      planName?: string;
    };
    const planTier = resolveAutofillPlanTier(status);
    return {
      ok: true as const,
      planTier,
      entitlements: resolveAutofillPlanEntitlements(planTier),
    };
  } catch {
    return {
      ok: false as const,
      planTier: 'free' as const,
      entitlements: FREE_AUTOFILL_PLAN_ENTITLEMENTS,
    };
  }
}

// ISS-039: refresh token whenever the user focuses the browser/extension —
// this guarantees that after a logout/switch on the web side, the extension
// picks up the new identity within seconds rather than up to 10 minutes.
chrome.windows?.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  await getExtensionBearerToken(true);
});

chrome.runtime.setUninstallURL(`${WEBSITE_URL}/extension/uninstall`);

// Internal message listener (from popup and content scripts)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'OPEN_SIDE_PANEL') {
    // Must run in the same turn as the originating user gesture.
    const opened = openSidePanelForTab(_sender.tab?.id, _sender.tab?.windowId);
    sendResponse({ ok: opened });
    return false;
  }
  if (msg.type === 'BEGIN_AUTH') {
    beginAuth().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false, err:String(e)}));
    return true;
  }
  if (msg.type === 'ADD_JOB_TO_TRACKER') {
    const status = msg.status === 'Wishlist' ? 'Wishlist' : 'Applied';
    handleAddJobToTracker(msg.job, !!msg.autoAdd, status).then(sendResponse).catch((e) => {
      sendResponse({ ok: false, error: e instanceof Error ? e.message : 'Failed to add job' });
    });
    return true; // async response
  }
  if (msg.type === 'EXTENSION_SIGN_OUT') {
    performExtensionSignOut()
      .then(async () => {
        await clearCurrentGeneratedResumeArtifact();
        const tabs = await chrome.tabs.query({}).catch(() => []);
        await Promise.allSettled(
          tabs
            .filter((tab) => typeof tab.id === 'number')
            .map((tab) =>
              chrome.tabs.sendMessage(tab.id!, {
                type: 'CLEAR_RESUME_AUTOFILL_ARTIFACT',
              })
            )
        );
        sendResponse({ ok: true as const });
      })
      .catch((e) => sendResponse({ ok: false as const, error: e instanceof Error ? e.message : String(e) }));
    return true;
  }
  if (msg.type === 'SUBMIT_FEEDBACK') {
    // Post the in-popup feedback to the backend. Bearer-linked when signed in;
    // the endpoint also accepts anonymous feedback.
    (async () => {
      try {
        const bearer = await getExtensionBearerToken();
        const res = await fetch(`${WEBSITE_URL}/api/extension/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          },
          body: JSON.stringify(msg.payload || {}),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        sendResponse({ ok: res.ok && data.ok !== false, error: data.error });
      } catch {
        sendResponse({ ok: false, error: 'network' });
      }
    })();
    return true;
  }
  if (msg.type === 'GET_AUTOFILL_PROFILE') {
    // Resolve the user's name/email for Easy Apply prefill. The bearer token
    // stays here — only these non-sensitive fields are returned to the content
    // script running on linkedin.com.
    getAutofillProfile()
      .then((profile) => sendResponse(profile))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GET_AUTOFILL_ENTITLEMENTS') {
    getAutofillPlanEntitlements()
      .then(sendResponse)
      .catch(() =>
        sendResponse({
          ok: false,
          planTier: 'free',
          entitlements: FREE_AUTOFILL_PLAN_ENTITLEMENTS,
        })
      );
    return true;
  }
  if (msg.type === 'GET_PRIVATE_APPLICATION_ANSWERS') {
    getPrivateApplicationAnswers(_sender.tab?.url)
      .then((response) => sendResponse(response))
      .catch(() =>
        sendResponse({ ok: false as const, error: 'unavailable' })
      );
    return true;
  }
  if (msg.type === 'GET_JOB_PORTAL_LOGIN_FOR_TAB') {
    getPrivateApplicationAnswers(_sender.tab?.url)
      .then((response) => {
        if (!response.ok) {
          sendResponse(response);
          return;
        }
        sendResponse({
          ok: true,
          credential: response.data?.defaultJobPortalLogin ?? null,
        });
      })
      .catch(() =>
        sendResponse({ ok: false as const, error: 'unavailable' })
      );
    return true;
  }
  if (msg.type === 'RESOLVE_V1_PREFILL_PAYLOAD') {
    const request: V1PrefillPayloadRequest = {
      now: String(msg.request?.now ?? ''),
      jobContext: {
        jobUrl: String(msg.request?.jobContext?.jobUrl ?? ''),
        companyName: String(msg.request?.jobContext?.companyName ?? ''),
        roleTitle: String(msg.request?.jobContext?.roleTitle ?? ''),
      },
    };
    resolveCurrentV1PrefillPayload(request, {
      discardRejectedArtifact: msg.discardRejectedArtifact !== false,
    })
      .then((response) => {
        sendResponse(response);
      })
      .catch(() => sendResponse({ ok: false as const, error: 'unavailable' }));
    return true;
  }
  if (msg.type === 'PREFILL_CHILD_FRAMES') {
    if (!_sender.tab?.id) {
      sendResponse({ ok: false, error: 'missing_tab' });
      return true;
    }
    const requestedPrefill = (msg.prefill ?? { resume: msg.resume }) as {
      resume?: { pdfBase64?: unknown; filename?: unknown };
      coverLetter?: unknown;
      generatedContentHash?: unknown;
      snapshot?: unknown;
      profileFallback?: unknown;
      autofillSkills?: unknown;
      quietResultToast?: unknown;
      sensitiveAnswers?: unknown;
    };
    const generatedContentHash =
      AUTOFILL_FEATURE_FLAGS.artifactPrefill &&
      typeof requestedPrefill.generatedContentHash === 'string' &&
      /^[a-f0-9]{64}$/i.test(requestedPrefill.generatedContentHash)
        ? requestedPrefill.generatedContentHash
        : undefined;
    const requestedResume = requestedPrefill.resume;
    const resume = AUTOFILL_FEATURE_FLAGS.artifactPrefill &&
      requestedResume &&
      typeof requestedResume.pdfBase64 === 'string' &&
      requestedResume.pdfBase64.length <= 25_000_000 &&
      typeof requestedResume.filename === 'string'
      ? {
          pdfBase64: requestedResume.pdfBase64,
          filename: requestedResume.filename.slice(0, 180),
        }
      : undefined;
    const coverLetter =
      AUTOFILL_FEATURE_FLAGS.coverLetter &&
      generatedContentHash &&
      validateGeneratedCoverLetterAttachment(
        requestedPrefill.coverLetter,
        generatedContentHash
      )
        ? (requestedPrefill.coverLetter as GeneratedCoverLetterAttachment)
        : undefined;
    const snapshot =
      AUTOFILL_FEATURE_FLAGS.artifactPrefill &&
      validateResumeAutofillSnapshotV1(requestedPrefill.snapshot)
      ? requestedPrefill.snapshot
      : undefined;
    const profileFallback = sanitizeBasicContactProfile(
      requestedPrefill.profileFallback
    );
    chrome.tabs.sendMessage(_sender.tab.id, {
      type: 'RUN_PREFILL_IN_CHILD_FRAME',
      prefill: {
        resume,
        coverLetter,
        generatedContentHash,
        snapshot,
        profileFallback,
        autofillSkills:
          AUTOFILL_FEATURE_FLAGS.skills &&
          requestedPrefill.autofillSkills === true,
        quietResultToast: requestedPrefill.quietResultToast === true,
        sensitiveAnswers:
          AUTOFILL_FEATURE_FLAGS.guidedAutopilot
            ? normalizeSensitiveAnswerSession(requestedPrefill.sensitiveAnswers)
            : undefined,
      },
    }).then(() => sendResponse({ ok: true })).catch(() => {
      // A page without child-frame receivers is normal; the top-frame engine
      // has already run, so this is not a user-visible error.
      sendResponse({ ok: true, childFramesAvailable: false });
    });
    return true;
  }
  if (msg.type === 'LIST_SAVED_RESUMES') {
    listSavedResumes()
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'UPLOAD_RESUME_FILE') {
    uploadResumeFile({
      filename: String(msg.filename ?? ''),
      fileType: String(msg.fileType ?? ''),
      fileBase64: String(msg.fileBase64 ?? ''),
    })
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ success: false, error: 'error' }));
    return true;
  }
  if (msg.type === 'GENERATE_RESUME') {
    // Orchestrate selected resume -> tailored LaTeX -> compiled PDF. Bearer
    // stays in the background; the page receives only the result and an opaque
    // authenticated editor-handoff URL.
    clearCurrentGeneratedResumeArtifact().then(() => generateTailoredResume({
      jobDescription: String(msg.jobDescription ?? ''),
      resumeId: String(msg.resumeId ?? ''),
      templateId: String(msg.templateId ?? ''),
      companyName: String(msg.companyName ?? ''),
      roleTitle: String(msg.roleTitle ?? ''),
      jobUrl: String(msg.jobUrl ?? ''),
      jobKey: String(msg.jobKey ?? ''),
      outputFilename: String(msg.outputFilename ?? 'TrackMyOPT-resume.pdf'),
      focusKeywords: Array.isArray(msg.focusKeywords)
        ? msg.focusKeywords.map((keyword: unknown) => String(keyword ?? '')).filter(Boolean)
        : [],
      baselineScore: typeof msg.baselineScore === 'number' ? msg.baselineScore : undefined,
      applicationId:
        typeof msg.applicationId === 'string' && msg.applicationId.trim()
          ? msg.applicationId.trim()
          : undefined,
      resumeText: typeof msg.resumeText === 'string' ? msg.resumeText : undefined,
    }))
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GENERATE_COVER_LETTER') {
    if (!AUTOFILL_FEATURE_FLAGS.coverLetter) {
      sendResponse({ ok: false, error: 'feature_disabled' });
      return false;
    }
    generateCoverLetterForCurrentArtifact({
      artifactId: String(msg.artifactId ?? ''),
      jobDescription: String(msg.jobDescription ?? ''),
      isRegeneration: msg.isRegeneration === true,
    }).then(sendResponse).catch(() => sendResponse({ ok: false, error: 'generation_failed' }));
    return true;
  }
  if (msg.type === 'RECOMPILE_COVER_LETTER') {
    if (!AUTOFILL_FEATURE_FLAGS.coverLetter) {
      sendResponse({ ok: false, error: 'feature_disabled' });
      return false;
    }
    recompileCoverLetterForCurrentArtifact({
      artifactId: String(msg.artifactId ?? ''),
      editedText: String(msg.editedText ?? ''),
      sourceContentHash: String(msg.sourceContentHash ?? ''),
    }).then(sendResponse).catch(() => sendResponse({ ok: false, error: 'compile_failed' }));
    return true;
  }
  if (msg.type === 'GENERATE_SCREENING_DRAFT') {
    if (!AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
      sendResponse({ ok: false, error: 'feature_disabled' });
      return false;
    }
    requestScreeningDraft(msg).then(sendResponse).catch(() => sendResponse({ ok: false, error: 'generation_failed' }));
    return true;
  }
  if (msg.type === 'LOAD_SCREENING_ANSWER' || msg.type === 'DELETE_SCREENING_ANSWER') {
    requestSavedScreeningAnswer(msg.type === 'LOAD_SCREENING_ANSWER' ? 'GET' : 'DELETE', String(msg.questionHash ?? ''))
      .then(sendResponse).catch(() => sendResponse({ ok: false, error: 'storage_failed' }));
    return true;
  }
  if (msg.type === 'SAVE_SCREENING_ANSWER') {
    saveScreeningAnswerForCurrentUser(msg.answer).then(sendResponse)
      .catch(() => sendResponse({ ok: false, error: 'storage_failed' }));
    return true;
  }
  if (msg.type === 'CHECK_JOB_SAVED') {
    // Look up whether the current posting is already in the tracker. Bearer
    // stays in the worker; the content script only receives the boolean/status.
    checkJobSaved({
      jobUrl: String(msg.jobUrl ?? ''),
      companyName: String(msg.companyName ?? ''),
      roleTitle: String(msg.roleTitle ?? ''),
    })
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GET_OPT_CLOCK_NUDGE') {
    getOptClockNudge()
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'TRACK_WIDGET_EVENT') {
    trackWidgetEvent(msg.event, msg.properties)
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'network' }));
    return true;
  }
  if (msg.type === 'ANALYZE_JOB_FIT') {
    // Fetch the user's base resume + run the ATS gap analysis. The resume text
    // and Bearer token never enter the page — only the score/keywords return.
    analyzeJobFit({ jobDescription: String(msg.jobDescription ?? '') })
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
});

async function trackWidgetEvent(
  rawEvent: unknown,
  rawProperties: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof rawEvent !== 'string' || !WIDGET_ANALYTICS_EVENTS.includes(rawEvent as WidgetAnalyticsEvent)) {
    return { ok: false, error: 'invalid_event' };
  }
  const event = rawEvent as WidgetAnalyticsEvent;
  const properties = normalizeWidgetAnalyticsProperties(event, rawProperties);
  let bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const postEvent = (token: string) => fetch(`${WEBSITE_URL}/api/extension/widget-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ event, properties }),
  });
  let response = await postEvent(bearer);
  if (response.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      bearer = refreshed;
      response = await postEvent(bearer);
    }
  }
  return response.ok
    ? { ok: true }
    : { ok: false, error: response.status === 401 ? 'not_signed_in' : 'network' };
}

interface AutofillProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  // application_profile fields (non-sensitive). Empty string when unset.
  phone: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  countyDistrict: string;
  yearsExperience: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

interface AutofillProfileResult {
  ok: boolean;
  error?: string;
  profile?: AutofillProfile;
}

interface PrivateApplicationAnswersResult {
  ok: boolean;
  error?: string;
  data?: SavedPrivateApplicationAnswers | null;
}

function sanitizeBasicContactProfile(value: unknown): BasicContactProfile | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const profile = value as Record<string, unknown>;
  const read = (key: keyof BasicContactProfile): string => {
    const field = profile[key];
    return typeof field === 'string' ? field.trim().slice(0, 500) : '';
  };
  return {
    firstName: read('firstName'),
    lastName: read('lastName'),
    fullName: read('fullName'),
    email: read('email'),
    phone: read('phone'),
    country: read('country'),
    streetAddress: read('streetAddress'),
    city: read('city'),
    state: read('state'),
    postalCode: read('postalCode'),
    countyDistrict: read('countyDistrict'),
    yearsExperience: read('yearsExperience'),
    linkedinUrl: read('linkedinUrl'),
    githubUrl: read('githubUrl'),
    portfolioUrl: read('portfolioUrl'),
  };
}

async function resolveCurrentV1PrefillPayload(
  request: V1PrefillPayloadRequest,
  options?: { discardRejectedArtifact?: boolean }
): Promise<V1PrefillPayloadResponse> {
  const artifact = await readCurrentGeneratedResumeArtifact();
  const response = await resolveV1PrefillPayload({
    artifact,
    request,
    discardRejectedArtifact: options?.discardRejectedArtifact,
    onArtifactRejected: clearCurrentGeneratedResumeArtifact,
    fetchProfileFallback: async () => {
      const result = await getAutofillProfile();
      return {
        ok: result.ok,
        error: result.error,
        profile: result.profile as BasicContactProfile | undefined,
      };
    },
  });
  return response;
}

async function getAutofillProfile(): Promise<AutofillProfileResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const res = await fetch(API_ENDPOINTS.ME, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) return { ok: false, error: 'fetch_failed' };

  const data = (await res.json()) as {
    user?: { email?: string; user_metadata?: Record<string, unknown> };
    profile?: { first_name?: string; last_name?: string; email?: string };
    applicationProfile?: {
      first_name?: string | null;
      last_name?: string | null;
      application_email?: string | null;
      phone?: string | null;
      country?: string | null;
      street_address?: string | null;
      city?: string | null;
      state?: string | null;
      zip_code?: string | null;
      county_district?: string | null;
      years_experience?: number | null;
      linkedin_url?: string | null;
      github_url?: string | null;
      portfolio_url?: string | null;
    } | null;
  };
  const user = data.user ?? {};
  const profile = data.profile ?? {};
  const ap = data.applicationProfile ?? {};
  const meta = (user.user_metadata ?? {}) as {
    firstName?: string;
    first_name?: string;
    full_name?: string;
  };

  const fullNameMeta = (meta.full_name ?? '').trim();
  const firstName = (ap.first_name || profile.first_name || meta.firstName || meta.first_name || fullNameMeta.split(/\s+/)[0] || '').trim();
  const lastName = (ap.last_name || profile.last_name || fullNameMeta.split(/\s+/).slice(1).join(' ') || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || fullNameMeta;
  const email = (ap.application_email || user.email || profile.email || '').trim();

  return {
    ok: true,
    profile: {
      firstName,
      lastName,
      fullName,
      email,
      phone: (ap.phone ?? '').trim(),
      country: (ap.country ?? '').trim(),
      streetAddress: (ap.street_address ?? '').trim(),
      city: (ap.city ?? '').trim(),
      state: (ap.state ?? '').trim(),
      postalCode: (ap.zip_code ?? '').trim(),
      countyDistrict: (ap.county_district ?? '').trim(),
      yearsExperience: ap.years_experience != null ? String(ap.years_experience) : '',
      linkedinUrl: (ap.linkedin_url ?? '').trim(),
      githubUrl: (ap.github_url ?? '').trim(),
      portfolioUrl: (ap.portfolio_url ?? '').trim(),
    },
  };
}

async function getPrivateApplicationAnswers(
  senderTabUrl: unknown
): Promise<PrivateApplicationAnswersResult> {
  if (!hostnameFromSenderTabUrl(senderTabUrl)) {
    return { ok: false, error: 'unavailable' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const response = await fetch(API_ENDPOINTS.PRIVATE_APPLICATION_ANSWERS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    return {
      ok: false,
      error: response.status === 401 ? 'not_signed_in' : 'unavailable',
    };
  }

  const body = (await response.json()) as { data?: unknown };
  const normalized = body.data
    ? normalizeSavedPrivateApplicationAnswers(body.data)
    : null;
  return {
    ok: true,
    data: filterPrivateAnswersForSenderUrl(normalized, senderTabUrl),
  };
}

interface GenerateResumeResult {
  ok: boolean;
  error?: string;
  detail?: string;
  pdfBase64?: string;
  editorUrl?: string;
  baselineScore?: number;
  generatedScore?: number;
  scoreError?: 'limit_reached' | 'scan_failed';
  structuredFieldsAvailable?: boolean;
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
  artifact?: GeneratedResumeArtifactV1;
}

interface SavedResumeOption {
  id: string;
  filename: string;
  updatedAt?: string | null;
}

interface CheckJobSavedResult {
  ok: boolean;
  error?: string;
  saved?: boolean;
  id?: string;
  status?: 'Applied' | 'Wishlist';
  savedAt?: string | null;
  duplicateApplication?: DuplicateApplicationNotice;
}

interface AnalyzeJobFitResult {
  ok: boolean;
  error?: string;
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  gapSummary?: string;
  resumeName?: string;
}

/**
 * Is this posting already in the user's tracker? Used to paint the widget's
 * saved state on load so we don't show "Not saved" for a job already added.
 */
async function checkJobSaved(input: {
  jobUrl: string;
  companyName: string;
  roleTitle: string;
}): Promise<CheckJobSavedResult> {
  const url = input.jobUrl.trim();
  const companyName = input.companyName.trim();
  const roleTitle = input.roleTitle.trim();
  if (!url && (!companyName || !roleTitle)) return { ok: true, saved: false };
  let bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const endpoint = new URL(`${WEBSITE_URL}/api/extension/job-application`);
  if (url) endpoint.searchParams.set('job_url', url);
  if (companyName) endpoint.searchParams.set('company_name', companyName);
  if (roleTitle) endpoint.searchParams.set('role_title', roleTitle);
  const request = (token: string) =>
    fetch(endpoint.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  let res = await request(bearer);
  if (res.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      bearer = refreshed;
      res = await request(bearer);
    }
  }
  if (res.status === 401) return { ok: false, error: 'not_signed_in' };
  if (!res.ok) return { ok: false, error: 'lookup_failed' };
  const data = (await res.json()) as {
    saved?: boolean;
    id?: string;
    status?: string;
    saved_at?: string | null;
    duplicate_application?: DuplicateApplicationNotice;
  };
  return {
    ok: true,
    saved: !!data.saved,
    id: typeof data.id === 'string' ? data.id : undefined,
    status: data.status === 'Wishlist' ? 'Wishlist' : data.status === 'Applied' ? 'Applied' : undefined,
    savedAt: data.saved_at ?? null,
    duplicateApplication: data.duplicate_application,
  };
}

const OPT_CLOCK_NUDGE_CACHE_KEY = 'tmo_opt_clock_nudge_daily_v1';

async function getOptClockNudge(): Promise<{ ok: boolean; error?: string; nudge?: OptClockNudge }> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const cached = await chrome.storage.session.get(OPT_CLOCK_NUDGE_CACHE_KEY);
    const entry = cached[OPT_CLOCK_NUDGE_CACHE_KEY] as { day?: string; nudge?: unknown } | undefined;
    if (entry?.day === day) {
      const nudge = normalizeOptClockNudge(entry.nudge);
      return { ok: true, ...(nudge ? { nudge } : {}) };
    }
  } catch {
    // Cache failure is non-fatal; fetch current data below.
  }

  let bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const request = (token: string) => fetch(`${WEBSITE_URL}/api/opt/calculator`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  let response = await request(bearer);
  if (response.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      bearer = refreshed;
      response = await request(bearer);
    }
  }
  if (!response.ok) return { ok: false, error: response.status === 401 ? 'not_signed_in' : 'load_failed' };
  const payload = await response.json().catch(() => null) as {
    ok?: boolean;
    data?: { unemployment_clock?: unknown } | null;
  } | null;
  const nudge = normalizeOptClockNudge(payload?.ok ? payload.data?.unemployment_clock : null);
  try {
    await chrome.storage.session.set({
      [OPT_CLOCK_NUDGE_CACHE_KEY]: { day, nudge },
    });
  } catch {
    // The nudge is still usable for this render even if caching is unavailable.
  }
  return { ok: true, ...(nudge ? { nudge } : {}) };
}

/**
 * Run the ATS gap analysis for this posting against the user's base resume.
 * Reuses the resume-generator base-resume + analyze-gap routes (already live).
 */
async function analyzeJobFit(input: { jobDescription: string }): Promise<AnalyzeJobFitResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const jd = (input.jobDescription || '').trim();
  if (jd.length < 200) return { ok: false, error: 'no_job_description' };
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` };

  // Pick the user's most recent base resume.
  const list = await listSavedResumes();
  if (!list.ok) return { ok: false, error: 'base_failed' };
  const first = list.resumes && list.resumes[0];
  if (!first) return { ok: false, error: 'no_base_resume' };

  const baseUrl = new URL(`${WEBSITE_URL}/api/resume-generator/base-resume`);
  if (first.id && first.id !== '__latest__') baseUrl.searchParams.set('resumeId', first.id);
  const baseRes = await fetch(baseUrl.toString(), { method: 'GET', headers: auth });
  if (baseRes.status === 404) return { ok: false, error: 'no_base_resume' };
  if (!baseRes.ok) return { ok: false, error: 'base_failed' };
  const base = (await baseRes.json()) as { content?: string; filename?: string };
  if (!base.content || !base.content.trim()) return { ok: false, error: 'no_base_resume' };

  const anRes = await fetch(`${WEBSITE_URL}/api/resume-generator/analyze-gap`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ resumeText: base.content, jobDescription: jd }),
  });
  const data = await anRes.json().catch(() => ({})) as { code?: string };
  if (anRes.status === 401) return { ok: false, error: 'not_signed_in' };
  if (isJobFitLimitResponse(anRes.status, data.code)) return { ok: false, error: 'limit_reached' };
  if (!anRes.ok) return { ok: false, error: 'analyze_failed' };
  const normalized = normalizeJobFitAnalysis(data);
  return {
    ok: true,
    ...normalized,
    resumeName: base.filename || 'your saved resume',
  };
}

async function listSavedResumes(): Promise<{
  ok: boolean;
  error?: string;
  resumes?: SavedResumeOption[];
  accountEmail?: string;
}> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/base-resume?mode=list`, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!response.ok) return { ok: false, error: 'load_failed' };
  const data = (await response.json()) as {
    resumes?: SavedResumeOption[];
    id?: string;
    filename?: string;
    content?: string;
  };

  if (Array.isArray(data.resumes)) {
    if (data.resumes.length > 0) return { ok: true, resumes: data.resumes };
    const profile = await getAutofillProfile().catch(() => null);
    return {
      ok: true,
      resumes: [],
      accountEmail: profile?.profile?.email || undefined,
    };
  }

  // Backward compatibility while the production web app still serves the
  // previous single-resume response. Without this, a valid saved resume was
  // incorrectly interpreted as an empty list by the newly built extension.
  if (data.content?.trim()) {
    return {
      ok: true,
      resumes: [{
        id: data.id || '__latest__',
        filename: data.filename || 'Most recently saved resume',
        updatedAt: null,
      }],
    };
  }

  const profile = await getAutofillProfile().catch(() => null);
  return {
    ok: true,
    resumes: [],
    accountEmail: profile?.profile?.email || undefined,
  };
}

/** ArrayBuffer -> base64 (chunked to avoid call-stack limits in the worker). */
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** base64 -> Uint8Array, the inverse of arrayBufferToBase64. */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface UploadResumeFileResult {
  success: boolean;
  error?: string;
  message?: string;
  text?: string;
  filename?: string;
  canOcr?: boolean;
}

/**
 * Extracts text from a résumé file (PDF/DOCX/TXT) using the exact same
 * endpoint and backend parsing the website's own upload flow uses — no
 * PDF/DOCX/OCR parsing is duplicated in the extension. The Bearer token never
 * leaves the background script; the panel only ever sees the extracted text.
 *
 * Scanned PDFs with no extractable text come back with canOcr: true. OCR
 * itself (AWS Textract) is not wired up for the extension yet — that path
 * goes through a separate, security-hardened proxy shared with resume
 * save/download that was deliberately left untouched here. The panel tells
 * the user to open the web app or paste the text manually in that case.
 */
async function uploadResumeFile(input: {
  filename: string;
  fileType: string;
  fileBase64: string;
}): Promise<UploadResumeFileResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { success: false, error: 'not_signed_in' };

  const bytes = base64ToUint8Array(input.fileBase64);
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([bytes], { type: input.fileType || 'application/octet-stream' }),
    input.filename || 'resume'
  );

  let response: Response;
  try {
    response = await fetch(`${WEBSITE_URL}/api/resume-generator/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bearer}` },
      body: formData,
    });
  } catch {
    return { success: false, error: 'network' };
  }

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    message?: string;
    text?: string;
    filename?: string;
    can_ocr?: boolean;
  };

  if (data.success && data.text) {
    return { success: true, text: data.text, filename: data.filename };
  }
  return {
    success: false,
    error: data.error || 'upload_failed',
    message: data.message,
    canOcr: data.can_ocr === true,
  };
}

async function requestScreeningDraft(input: Record<string, unknown>) {
  const artifact = await readCurrentGeneratedResumeArtifact();
  if (!artifact) return { ok: false, error: 'artifact_unavailable' };
  const job = resolveScreeningDraftJobContext({
    artifactJob: artifact.job,
    pageContext: {
      companyName: String(input.companyName ?? ''),
      roleTitle: String(input.roleTitle ?? ''),
      jobDescription: String(input.jobDescription ?? ''),
    },
  });
  if (!job.jobDescription) {
    return { ok: false, error: 'insufficient_context' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const response = await fetch(`${WEBSITE_URL}/api/extension/screening-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: JSON.stringify({
      questionText: normalizeQuestionText(String(input.questionText ?? '')),
      ...(typeof input.characterLimit === 'number' ? { characterLimit: input.characterLimit } : {}),
      job,
      snapshot: artifact.snapshot,
      sourceContentHash: artifact.generatedContentHash,
      regenerate: input.regenerate === true,
    }),
  });
  return response.json().catch(() => ({ ok: false, error: 'invalid_response' }));
}

async function requestSavedScreeningAnswer(method: 'GET' | 'DELETE', questionHash: string) {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  return method === 'GET'
    ? loadSavedScreeningAnswer(bearer, questionHash)
    : deleteSavedScreeningAnswer(bearer, questionHash);
}

async function saveScreeningAnswerForCurrentUser(answer: SavedAnswerWrite) {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  return saveScreeningAnswer(bearer, answer);
}

async function generateCoverLetterForCurrentArtifact(input: {
  artifactId: string;
  jobDescription: string;
  isRegeneration: boolean;
}) {
  const artifact = currentGeneratedResumeArtifact;
  if (!artifact || artifact.artifactId !== input.artifactId) {
    return { ok: false, error: 'artifact_unavailable' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: JSON.stringify({
      snapshot: artifact.snapshot,
      sourceContentHash: artifact.generatedContentHash,
      isRegeneration: input.isRegeneration,
      job: {
        companyName: artifact.job.companyName,
        roleTitle: artifact.job.roleTitle,
        jobDescription: input.jobDescription,
      },
    }),
  });
  const result = await response.json().catch(() => null) as {
    attachment?: GeneratedResumeArtifactV1['coverLetter'];
    draftText?: string;
    limits?: unknown;
    error?: string;
  } | null;
  if (!response.ok || !result?.attachment) {
    return { ok: false, error: result?.error || 'generation_failed', limits: result?.limits };
  }
  if (result.attachment.sourceContentHash !== artifact.generatedContentHash) {
    return { ok: false, error: 'source_hash_mismatch', limits: result.limits };
  }
  artifact.coverLetter = result.attachment;
  await replaceActiveGeneratedResumeArtifact(artifact);
  return { ok: true, attachment: result.attachment, draftText: result.draftText || '', limits: result.limits };
}

function escapeCoverLetterLatex(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#$%&_{}])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\r?\n/g, '\\\\\n');
}

async function recompileCoverLetterForCurrentArtifact(input: {
  artifactId: string;
  editedText: string;
  sourceContentHash: string;
}) {
  const artifact = currentGeneratedResumeArtifact;
  if (!artifact || artifact.artifactId !== input.artifactId) return { ok: false, error: 'artifact_unavailable' };
  // Invalidate synchronously before any asynchronous compiler work begins.
  artifact.coverLetter = undefined;
  await replaceActiveGeneratedResumeArtifact(artifact);
  if (input.sourceContentHash !== artifact.generatedContentHash || !input.editedText.trim()) {
    return { ok: false, error: 'source_hash_mismatch' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const latex = `\\documentclass[11pt]{letter}\n\\usepackage[margin=1in]{geometry}\n\\begin{document}\n${escapeCoverLetterLatex(input.editedText.trim())}\n\\end{document}`;
  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: JSON.stringify({ latexCode: latex }),
  });
  if (!response.ok) return { ok: false, error: 'compile_failed' };
  const pdf = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(pdf);
  const digest = await crypto.subtle.digest('SHA-256', pdf);
  const sha256 = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const attachment = {
    filename: 'cover-letter.pdf',
    base64,
    sha256,
    generatedAt: new Date().toISOString(),
    sourceContentHash: artifact.generatedContentHash,
  };
  artifact.coverLetter = attachment;
  await replaceActiveGeneratedResumeArtifact(artifact);
  return { ok: true, attachment, draftText: input.editedText };
}

/**
 * base resume (resumes table) -> tailored LaTeX (/generate) -> PDF (/compile).
 * All calls use the extension Bearer token; only the finished PDF (base64) is
 * returned to the caller.
 */
async function generateTailoredResume(input: {
  jobDescription: string;
  resumeId: string;
  templateId: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string;
  jobKey: string;
  outputFilename: string;
  focusKeywords?: string[];
  baselineScore?: number;
  applicationId?: string;
  /**
   * Raw resume text pasted directly into the side panel. Takes priority over
   * resumeId when present — the caller only needs to supply one of the two.
   */
  resumeText?: string;
}, run?: RunSession): Promise<GenerateResumeResult> {
  // When a run session is supplied the pipeline reports each step and honours
  // cancellation; without one it behaves exactly as before.
  const signal = run?.signal;
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const {
    jobDescription,
    resumeId,
    templateId,
    companyName,
    roleTitle,
    jobUrl,
    jobKey,
    outputFilename,
    applicationId,
  } = input;
  const focusKeywords = [...new Set((input.focusKeywords ?? [])
    .map((keyword) => keyword.replace(/\s+/g, ' ').trim().slice(0, 80))
    .filter(Boolean))].slice(0, 12);
  const pastedResumeText = input.resumeText?.trim();
  if (!jobDescription.trim()) return { ok: false, error: 'no_job_description' };
  if (!pastedResumeText && !resumeId.trim()) return { ok: false, error: 'no_base_resume' };
  if (!templateId.trim()) return { ok: false, error: 'no_template' };

  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` };

  // 1. Pasted text, or the user-selected saved resume
  run?.step('load_resume', 'active');
  let base: { content?: string; filename?: string };
  if (pastedResumeText) {
    base = { content: pastedResumeText, filename: 'Pasted resume' };
  } else {
    const baseUrl = new URL(`${WEBSITE_URL}/api/resume-generator/base-resume`);
    if (resumeId !== '__latest__') {
      baseUrl.searchParams.set('resumeId', resumeId);
    }
    const baseRes = await fetch(baseUrl.toString(), {
      method: 'GET',
      signal,
      headers: auth,
    });
    if (baseRes.status === 404) return { ok: false, error: 'no_base_resume' };
    if (!baseRes.ok) return { ok: false, error: 'base_failed' };
    base = (await baseRes.json()) as { content?: string; filename?: string };
  }
  if (!base.content) return { ok: false, error: 'no_base_resume' };
  run?.step('load_resume', 'done', base.filename);
  run?.throwIfCancelled();

  // Reuse the in-widget analysis score when the user followed Analyze →
  // Generate. A direct Generate click has no prior score in page memory, so
  // compute the baseline once here before tailoring.
  let baselineScore = buildScoreComparison(undefined, input.baselineScore)?.generated;
  let scoreError: GenerateResumeResult['scoreError'];
  if (baselineScore === undefined) {
    run?.step('baseline_score', 'active');
    try {
      const baselineRes = await fetch(`${WEBSITE_URL}/api/resume-generator/analyze-gap`, {
        method: 'POST',
        signal,
        headers: auth,
        body: JSON.stringify({
          resumeText: base.content,
          jobDescription: jobDescription.slice(0, 15000),
        }),
      });
      const baselineData = await baselineRes.json().catch(() => ({})) as {
        code?: string;
        matchScore?: number;
      };
      if (isJobFitLimitResponse(baselineRes.status, baselineData.code)) {
        scoreError = 'limit_reached';
      } else if (baselineRes.ok) {
        baselineScore = buildScoreComparison(undefined, baselineData.matchScore)?.generated;
      }
    } catch {
      // Tailoring remains available even if the optional baseline comparison fails.
    }
    run?.step(
      'baseline_score',
      baselineScore === undefined ? 'skipped' : 'done',
      baselineScore === undefined ? 'unavailable' : `${baselineScore}/100`
    );
  } else {
    run?.step('baseline_score', 'done', `${baselineScore}/100`);
  }
  run?.throwIfCancelled();

  // 2. Tailored LaTeX
  run?.step('tailor', 'active');
  const genRes = await fetch(`${WEBSITE_URL}/api/resume-generator/generate`, {
    method: 'POST',
    signal,
    headers: auth,
    body: JSON.stringify({
      resumeText: base.content,
      jobDescription: jobDescription.slice(0, 15000),
      templateId,
      focusKeywords,
    }),
  });
  if (genRes.status === 403) {
    const j = (await genRes.json().catch(() => ({}))) as { details?: string };
    return { ok: false, error: 'limit', detail: j.details };
  }
  if (!genRes.ok) return { ok: false, error: 'generate_failed' };
  const gen = (await genRes.json()) as { latex?: string };
  if (!gen.latex) return { ok: false, error: 'generate_failed' };
  run?.step('tailor', 'done');
  run?.throwIfCancelled();
  run?.step('compile', 'active');

  // 3. Compile to PDF — with one AI repair-and-retry on failure. Some Gemini
  //    LaTeX has syntax errors the compiler rejects; fix-latex repairs them and
  //    we compile again (mirrors the website's editor flow).
  const compile = async (latexCode: string): Promise<{ pdf?: ArrayBuffer; error?: string }> => {
    const r = await fetch(`${WEBSITE_URL}/api/resume-generator/compile`, {
      method: 'POST',
      signal,
      headers: auth,
      body: JSON.stringify({ latexCode }),
    });
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      return { error: j.error || `HTTP ${r.status}` };
    }
    const buf = await r.arrayBuffer();
    return buf.byteLength ? { pdf: buf } : { error: 'empty pdf' };
  };

  const compiled = await compileLatexWithSingleRepair({
    initialLatex: gen.latex,
    compile,
    repair: async (latexCode, errorMessage) => {
      // The first compile failed; surface the repair rather than leaving the
      // user on a stalled "Compiling" step.
      run?.step('compile', 'failed');
      run?.step('repair', 'active');
      const fixRes = await fetch(`${WEBSITE_URL}/api/resume-generator/fix-latex`, {
        method: 'POST',
        signal,
        headers: auth,
        body: JSON.stringify({ latexCode, errorMessage }),
      });
      if (fixRes.ok) {
        const fixed = (await fixRes.json()) as { latex?: string };
        return fixed.latex;
      }
      return undefined;
    },
  });
  if (!compiled.pdf) {
    run?.step(compiled.repaired ? 'repair' : 'compile', 'failed');
    return { ok: false, error: 'compile_failed' };
  }
  if (compiled.repaired) run?.step('repair', 'done', 'formatting fixed');
  run?.step('compile', 'done');
  run?.throwIfCancelled();
  run?.step('extract', 'active');
  const latex = compiled.finalLatex;

  // Extract a structured snapshot only after the exact, possibly repaired,
  // LaTeX has compiled. Extraction is deliberately non-blocking: the PDF is
  // still returned when the endpoint, model, or reconciliation is unavailable.
  let snapshotExtraction: SnapshotExtractionHandoff | undefined;
  try {
    const snapshotRes = await fetch(`${WEBSITE_URL}/api/resume-generator/autofill-snapshot`, {
      method: 'POST',
      signal,
      headers: auth,
      body: JSON.stringify({ finalLatex: latex, sourceResumeId: resumeId }),
    });
    const snapshotData = (await snapshotRes.json().catch(() => ({}))) as {
      structuredFieldsAvailable?: boolean;
      generatedContentHash?: string;
      snapshot?: ResumeAutofillSnapshotV1;
      reason?: string;
    };
    snapshotExtraction = {
      structuredFieldsAvailable: snapshotRes.ok && snapshotData.structuredFieldsAvailable === true,
      generatedContentHash: snapshotData.generatedContentHash,
      snapshot: snapshotData.snapshot,
      reason: snapshotData.reason,
    };
  } catch {
    snapshotExtraction = { structuredFieldsAvailable: false };
  }
  run?.step(
    'extract',
    snapshotExtraction?.structuredFieldsAvailable ? 'done' : 'skipped',
    snapshotExtraction?.structuredFieldsAvailable ? 'fields ready' : 'not available'
  );
  run?.throwIfCancelled();
  run?.step('package', 'active');

  const pdfBase64 = arrayBufferToBase64(compiled.pdf);
  let artifact: GeneratedResumeArtifactV1 | undefined;
  try {
    const builtArtifact = await buildGeneratedResumeArtifactV1({
      sourceResumeId: resumeId,
      sourceResumeFilename: base.filename || 'resume',
      templateId,
      jobKey: jobKey || `${companyName}|${roleTitle}|${jobUrl}`,
      jobContext: {
        jobUrl,
        companyName,
        roleTitle,
      },
      jobDescription,
      finalLatex: latex,
      extractedContentHash: snapshotExtraction?.generatedContentHash,
      extractedSnapshot: snapshotExtraction?.snapshot,
      pdfBase64,
      pdfFilename: outputFilename,
    });
    artifact = builtArtifact.artifact;
    await cacheCurrentGeneratedResumeArtifact(artifact);
    snapshotExtraction = {
      structuredFieldsAvailable: builtArtifact.structuredFieldsAvailable,
      generatedContentHash: artifact.generatedContentHash,
      snapshot: builtArtifact.structuredFieldsAvailable
        ? artifact.snapshot
        : undefined,
      reason: snapshotExtraction?.reason,
    };
  } catch {
    await clearCurrentGeneratedResumeArtifact();
    // PDF download remains available if local hashing is unexpectedly unavailable.
  }

  // 4. Score the exact generated LaTeX after any compile repair. This is
  // non-blocking from a product perspective: a quota/network failure never
  // discards an otherwise valid generated resume.
  let generatedScore: number | undefined;
  if (scoreError !== 'limit_reached') {
    try {
      const scanRes = await fetch(`${WEBSITE_URL}/api/resume-generator/scan`, {
        method: 'POST',
        signal,
        headers: auth,
        body: JSON.stringify({
          latexCode: latex,
          jobDescription: jobDescription.slice(0, 15000),
        }),
      });
      const scanData = await scanRes.json().catch(() => ({})) as { code?: string; score?: number };
      if (isJobFitLimitResponse(scanRes.status, scanData.code)) {
        scoreError = 'limit_reached';
      } else if (scanRes.ok) {
        generatedScore = buildScoreComparison(baselineScore, scanData.score)?.generated;
        if (generatedScore === undefined) scoreError = 'scan_failed';
      } else {
        scoreError = 'scan_failed';
      }
    } catch {
      scoreError = 'scan_failed';
    }
  }

  // 5. Persist a short-lived, user-scoped handoff so "Edit" opens the actual
  // generated LaTeX in the editor instead of restarting the three-step flow.
  let editorUrl: string | undefined;
  try {
    const handoffRes = await fetch(`${WEBSITE_URL}/api/resume-generator/extension-handoff`, {
      method: 'POST',
      signal,
      headers: auth,
      body: JSON.stringify({
        latex,
        resumeText: base.content,
        resumeFilename: base.filename,
        jobDescription: jobDescription.slice(0, 15000),
        jobTitle: roleTitle
          ? (companyName ? `${roleTitle} at ${companyName}` : roleTitle)
          : companyName,
        templateId,
        applicationId: applicationId || undefined,
        atsScore: generatedScore ?? null,
      }),
    });
    const handoff = (await handoffRes.json().catch(() => ({}))) as { handoffId?: string };
    if (handoffRes.ok && handoff.handoffId) {
      const editor = new URL(`${WEBSITE_URL}/dashboard/career/resume-generator/editor`);
      editor.searchParams.set('handoffId', handoff.handoffId);
      if (applicationId) editor.searchParams.set('applicationId', applicationId);
      editorUrl = editor.toString();
    }
  } catch {
    // PDF download remains available even if the optional editor handoff fails.
  }

  run?.step('package', 'done');
  return buildGeneratedResumeResult({
    pdfBase64,
    editorUrl,
    baselineScore,
    generatedScore,
    scoreError,
    artifact,
  }, snapshotExtraction);
}

/**
 * Long-running agent work runs over a port rather than a single sendMessage, so
 * the UI can show which step is executing and stop it mid-flight. The port also
 * acts as a liveness signal: if the UI disconnects, the run is cancelled rather
 * than burning quota on a result nobody will see.
 */
const runRegistry = new RunRegistry();

/**
 * Side panel availability. Chrome 114+ only, so every call is guarded — an
 * older Chrome keeps the popup and simply never sees the panel.
 */
if (chrome.sidePanel?.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch(() => {
      // Non-fatal: the popup remains the primary entry point.
    });
}

/**
 * Opening the side panel must happen inside a user-gesture turn, so the widget
 * sends this message straight from its click handler.
 */
function openSidePanelForTab(tabId: number | undefined, windowId: number | undefined): boolean {
  if (!chrome.sidePanel?.open) return false;
  try {
    if (tabId !== undefined) void chrome.sidePanel.open({ tabId });
    else if (windowId !== undefined) void chrome.sidePanel.open({ windowId });
    else return false;
    return true;
  } catch {
    return false;
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== RUN_PORT_NAME) return;

  let activeRunId: string | null = null;

  port.onMessage.addListener(async (raw) => {
    const command = raw as RunCommand;
    if (!command || typeof command !== 'object') return;

    // No-op: receiving any message on the port is what resets Chrome's
    // service-worker idle timer. See the KEEPALIVE_INTERVAL_MS doc comment.
    if (command.type === 'keepalive') return;

    if (command.type === 'cancel') {
      runRegistry.cancel(command.runId);
      return;
    }
    if (command.type !== 'start' || command.kind !== 'resume') return;

    activeRunId = command.runId;
    const session = runRegistry.create(command.runId, (event) => {
      try {
        port.postMessage(event);
      } catch {
        // Port closed mid-run; cancellation is handled by onDisconnect.
      }
    });

    session.setState('preparing');
    try {
      const result = await generateTailoredResume(
        command.input as Parameters<typeof generateTailoredResume>[0],
        session
      );
      if (session.state === 'cancelled') return;
      if (result.ok) session.succeed(result);
      else session.fail(result.error ?? 'unknown');
    } catch (error) {
      if (session.state === 'cancelled' || error instanceof RunCancelledError) return;
      session.fail(error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'unknown');
    } finally {
      runRegistry.finish(command.runId);
    }
  });

  port.onDisconnect.addListener(() => {
    if (activeRunId) runRegistry.cancel(activeRunId);
  });
});

// External message listener (from web app)
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  // Respond to ping to confirm extension is installed
  if (msg.type === 'PING') {
    sendResponse({ ok: true, installed: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  
  // Check extension status - called from Settings page
  if (msg.type === 'TMO_CHECK_EXTENSION') {
    // Respond that extension is installed
    sendResponse({ 
      ok: true, 
      installed: true, 
      version: chrome.runtime.getManifest().version,
      type: 'TMO_EXTENSION_PRESENT'
    });
    
    // Also inject localStorage marker into the webpage if possible
    if (sender.tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: (version: string) => {
          localStorage.setItem('tmo_extension_connected', 'true');
          localStorage.setItem('tmo_extension_version', version);
          localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
        },
        args: [chrome.runtime.getManifest().version]
      }).catch(() => {
        // Scripting might fail if permissions aren't granted
      });
    }
    return true;
  }
  
  // Open a specific tool in the extension popup
  if (msg.type === 'OPEN_TOOL') {
    const toolPage = msg.tool;
    
    // Save the requested page so popup opens to it
    chrome.storage.local.set({ lastPage: toolPage }).then(() => {
      if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup().then(() => {
          sendResponse({ ok: true, opened: true });
        }).catch(() => {
          sendResponse({ ok: true, opened: false, message: 'Click the TrackMyOPT extension icon to open the tool' });
        });
      } else {
        sendResponse({ ok: true, opened: false, message: 'Click the TrackMyOPT extension icon to open the tool' });
      }
    });
    return true;
  }
  
  sendResponse({ ok: false, error: 'Unknown message type' });
  return true;
});

async function handleAddJobToTracker(
  job: {
    company_name: string;
    role_title: string;
    job_url?: string;
    location?: string;
    salary_text?: string;
    job_description?: string;
  },
  autoAdd: boolean = false,
  requestedStatus: 'Wishlist' | 'Applied' = 'Applied',
) {
  // Application-success auto-adds are always Applied. Manual saves preserve
  // the status explicitly selected in the side-panel dialog.
  const status: 'Wishlist' | 'Applied' = autoAdd ? 'Applied' : requestedStatus;
  const snapshot = buildJobSaveSnapshot(job);
  let token = await getExtensionBearerToken();
  if (!token) {
    const err = new Error('Sign in to TrackMyOPT in the extension to add jobs.');
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'TrackMyOPT',
        message: err.message,
      });
    }
    throw err;
  }

  const postJob = (bearer: string) =>
    fetch(`${WEBSITE_URL}/api/extension/job-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({
        company_name: snapshot.company_name,
        role_title: snapshot.role_title,
        job_url: snapshot.job_url || null,
        location: snapshot.location || null,
        salary_text: snapshot.salary_text || null,
        job_description: snapshot.job_description || null,
        status,
      }),
    });

  let res = await postJob(token);
  if (res.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      res = await postJob(refreshed);
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error || 'Failed to add job to tracker';
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'TrackMyOPT',
        message: msg,
      });
    }
    throw new Error(msg);
  }
  if (chrome.notifications) {
    const message = autoAdd
      ? `Application auto-added: "${job.role_title}" at ${job.company_name}`
      : `"${job.role_title}" at ${job.company_name} added to Job Tracker!`;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'TrackMyOPT',
      message,
    });
  }
  return {
    ok: true,
    id: typeof (data as { id?: string }).id === 'string' ? (data as { id: string }).id : undefined,
    status,
  };
}

async function beginAuth(){
  const tab = await chrome.tabs.create({ url: API_ENDPOINTS.AUTH });
  
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Auth timeout'));
    }, 5 * 60 * 1000); // 5 minute timeout
    
    const listener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, currentTab: chrome.tabs.Tab) => {
      if (tabId !== tab.id) return;
      
      const responseUrl = changeInfo.url || currentTab.url;
      if (!responseUrl) return;
      
      // Check if user reached dashboard (successful login)
      if (responseUrl.includes('/dashboard')) {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Wait a moment for cookies to settle, then check session
        setTimeout(async () => {
          try {
            const response = await fetch(API_ENDPOINTS.ME, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (response.ok) {
              await chrome.storage.sync.set({
                signedIn: true,
                [EXTENSION_LOCAL_SIGNOUT_KEY]: false,
              });
              
              // Register extension session with server. Use the real bearer
              // token (minted into storage.local); the old 'authToken' key was
              // never written, so this call previously never fired.
              const bearer = await getExtensionBearerToken();
              if (bearer) {
                fetch(`${API_ENDPOINTS.ME.replace('/api/me', '/api/extension/ping')}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`,
                  },
                  body: JSON.stringify({ version: chrome.runtime.getManifest().version }),
                }).catch(() => {}); // Silently fail
              }
              
              // Set localStorage on the dashboard tab to mark extension as connected
              if (tab.id) {
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: (version: string) => {
                    localStorage.setItem('tmo_extension_connected', 'true');
                    localStorage.setItem('tmo_extension_version', version);
                    localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
                  },
                  args: [chrome.runtime.getManifest().version]
                }).catch(() => {});
              }
              
              resolve();
            } else {
              // Retry after cookies sync
              setTimeout(async () => {
                const retry = await fetch(API_ENDPOINTS.ME, { 
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                });
                if (retry.ok) {
                  await chrome.storage.sync.set({
                    signedIn: true,
                    [EXTENSION_LOCAL_SIGNOUT_KEY]: false,
                  });
                  resolve();
                } else {
                  reject(new Error('Could not verify session'));
                }
              }, 1500);
            }
          } catch (err) {
            reject(err);
          }
        }, 1000);
        return;
      }
      
      // If user closes the tab before logging in
      if (changeInfo.status === 'complete' && responseUrl === 'about:blank') {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('Auth cancelled'));
        return;
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
  });
}
