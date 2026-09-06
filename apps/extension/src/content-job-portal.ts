/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows a sticky, collapsible
 * side widget when a listing is detected, offering: Prefill application, Save to
 * tracker, and AI analysis. Close menu can hide it for this visit / this
 * site / all sites. Auto-adds job to TrackMyOPT on application-success pages.
 */

import { hardenInteractiveElements, ensureWidgetAnnouncer } from './design/a11y';
import {
  isCareerPage,
} from './career-sites';
import {
  runPrefill,
  findApplicationForm,
  getPrefillCandidateSignature,
  type GeneratedResumeAttachment,
  type PrefillOptions,
  getLabelText,
} from './easy-apply-engine';
import {
  RESUME_STATUS_ROW_CLASS,
  isResumeStatusAttached,
} from './resume-status-row';
import { API_ENDPOINTS } from './config';
import { buildJobSaveSnapshot } from './job-save-snapshot';
import {
  jobMemoryKey,
  recordSeenJob,
} from './smart-flow';
import {
  normalizeWidgetAnalyticsProperties,
  widgetSiteFamily,
  type WidgetAnalyticsEvent,
  type WidgetAnalyticsProperties,
} from './widget-platform';
import {
  jobUrlsReferToSameJob,
  type BasicContactProfile,
  type GeneratedResumeArtifactV1,
  type ResumeAutofillSnapshotV1,
  type V1PrefillPayloadResponse,
} from './resume-autofill-contract';
import {
  clearArtifactExpectedForSession,
  rememberArtifactExpectedForSession,
  rememberArtifactExpectationFromJob,
  renderInactiveArtifactFallback,
  artifactExpectedForSession,
} from './artifact-fallback-ui';
import {
  resolveArtifactLifecycle,
  type ArtifactInvalidReason,
} from './resume-artifact-lifecycle';
import {
  emptyPrefillCoverage,
} from './prefill-coverage';
import {
  AUTOFILL_PREFERENCES_KEY,
  DEFAULT_AUTOFILL_PREFERENCES,
  normalizeAutofillPreferences,
  type AutofillPreferences,
} from './autofill-preferences';
import { shouldRunContinuousPrefill } from './continuous-prefill';
import { detectScreeningQuestion } from './screening-question-drafts';
import { createScreeningQuestionReviewUI } from './screening-question-review-ui';
import { AUTOFILL_FEATURE_FLAGS } from './autofill-feature-flags';
import {
  FREE_AUTOFILL_PLAN_ENTITLEMENTS,
  resolveAutofillPlanEntitlements,
  type AutofillPlanEntitlements,
  type AutofillPlanTier,
} from './autofill-plan-entitlements';
import {
  buildPrefillTelemetryProperties,
} from './prefill-telemetry';
import {
  runGuidedNavigation,
  type GuidedNavigationResult,
} from './guided-autopilot';
import {
  fillConfirmedSensitiveAnswers,
  normalizeSensitiveAnswerSession,
  type SensitiveAnswerSession,
} from './sensitive-autofill';
import { scanApplicationFields } from './application-field-scan';
import {
  fillJobPortalLogin,
  type JobPortalLoginCredential,
} from './job-portal-login';
import {
  approvalMatchesJob,
  approvalMatchesUrl,
  type PrivateApprovalBinding,
} from './private-approval-session';
import {
  JobInfo,
  getJobInfo,
  isHttpDocument,
  isLinkedInJobSurface,
  shouldUseFullJobAssistMode,
} from './job-posting-scrape';
import {
  clearWidgetDismissedUrl,
  currentSessionStorage,
  getDefaultViewPref,
  isWidgetSuppressed,
  readWidgetDismissedUrl,
} from './widget-preferences';
import {
  ARTIFACT_INACTIVE_FALLBACK_CLASS,
  ARTIFACT_STALE_BANNER_CLASS,
  WIDGET_ROOT_ID,
} from './widget-dom-ids';
import {
  resolveJobDescription,
  scrapeJobDescription,
} from './job-description-scrape';
import { isApplicationSuccessPage } from './job-portal-application-success';
import { isWidgetInteractionInFlight } from './job-portal-interaction-guard';
import {
  jobContextFor,
  shouldRefreshWidget,
} from './job-portal-job-helpers';
import { paintPrefillCoverage } from './job-portal-prefill-coverage-ui';
import {
  paintPrefillButton,
  showMessage,
  syncResumeStatusRows,
} from './job-portal-widget-ui';
import {
  createJobTrackerWidget,
  disconnectWidgetViewportObserver,
  getLastResumeJobDescription,
  setJobTrackerWidgetHost,
  type PrefillExecutionSnapshot,
} from './job-portal-tracker-widget';

/** Set once the widget mounts; announces status to screen readers. */
let announceWidgetStatus: (message: string) => void = () => {};


const SESSION_KEYS = {
  LAST_JOB_CONTEXT: 'tmo_last_job_context',
  LAST_AUTO_ADDED: 'tmo_last_auto_added',
} as const;


// chrome.storage.local: { all?: boolean; domains?: string[] } — persists across visits.


const POST_SAVE_SUGGESTION_SEEN_KEY = 'tmo_post_save_suggestions_seen_v1';



// Intentionally memory-only. No PDF bytes or structured resume data are
// persisted to chrome.storage or analytics.
let generatedResumeArtifactForCurrentJob: GeneratedResumeArtifactV1 | null = null;
let artifactBackedFieldsFilled = false;
let artifactStaleReason: ArtifactInvalidReason | null = null;
/** Tracker application ids for jobs saved (or already saved) this session. */
const trackerApplicationIdByJobKey = new Map<string, string>();

function rememberTrackerApplicationId(job: JobInfo, applicationId?: string): void {
  const id = applicationId?.trim();
  if (!id) return;
  trackerApplicationIdByJobKey.set(
    jobMemoryKey({
      jobUrl: job.job_url || window.location.href,
      companyName: job.company_name || '',
      roleTitle: job.role_title || '',
    }),
    id,
  );
}

function trackerApplicationIdFor(job: JobInfo): string | undefined {
  return trackerApplicationIdByJobKey.get(
    jobMemoryKey({
      jobUrl: job.job_url || window.location.href,
      companyName: job.company_name || '',
      roleTitle: job.role_title || '',
    }),
  );
}
let artifactExpiryTimer: number | null = null;
let currentAutofillPreferences: AutofillPreferences = { ...DEFAULT_AUTOFILL_PREFERENCES };
let currentPlanEntitlements: Readonly<AutofillPlanEntitlements> =
  FREE_AUTOFILL_PLAN_ENTITLEMENTS;
// Sensitive answers become usable only after review in this page's panel. The
// confirmed copy stays in content-script memory and never enters AI/analytics.
let sensitiveAnswerSession: SensitiveAnswerSession = { confirmed: false };
let approvedJobPortalLogin: JobPortalLoginCredential | null = null;
let privateApprovalBinding: PrivateApprovalBinding | null = null;
const trackedWidgetAnalytics = new Set<string>();
const guidedClickedControls = new WeakSet<HTMLElement>();

function clearPrivateApplicationApproval(): void {
  approvedJobPortalLogin = null;
  sensitiveAnswerSession = { confirmed: false };
  privateApprovalBinding = null;
  previousContinuousSignature = '';
}

function invalidatePrivateApprovalForUrl(nextUrl: string): void {
  if (
    privateApprovalBinding &&
    !approvalMatchesUrl(privateApprovalBinding, nextUrl)
  ) {
    clearPrivateApplicationApproval();
  }
}

function invalidatePrivateApprovalForJob(job: JobInfo | null): void {
  if (
    privateApprovalBinding &&
    job &&
    !approvalMatchesJob(privateApprovalBinding, jobContextFor(job))
  ) {
    clearPrivateApplicationApproval();
  }
}

function guidedStatus(message: string): void {
  for (const line of Array.from(
    document.querySelectorAll<HTMLElement>('.tmo-guided-status-copy')
  )) {
    line.textContent = message;
  }
}

function trackWidgetAnalytics(
  event: WidgetAnalyticsEvent,
  properties: WidgetAnalyticsProperties = {},
): void {
  const safeProperties = normalizeWidgetAnalyticsProperties(event, {
    site_family: widgetSiteFamily(window.location.hostname),
    ...properties,
  });
  try {
    chrome.runtime.sendMessage(
      { type: 'TRACK_WIDGET_EVENT', event, properties: safeProperties },
      () => void chrome.runtime.lastError,
    );
  } catch {
    // Analytics is best-effort and must never interrupt a user action.
  }
}

function trackWidgetAnalyticsOnce(
  event: WidgetAnalyticsEvent,
  job: JobInfo,
  properties: WidgetAnalyticsProperties = {},
  variant = '',
): void {
  const key = `${event}|${jobMemoryKey({
    jobUrl: job.job_url,
    companyName: job.company_name,
    roleTitle: job.role_title,
  })}|${variant}`;
  if (trackedWidgetAnalytics.has(key)) return;
  trackedWidgetAnalytics.add(key);
  trackWidgetAnalytics(event, properties);
}

function syncArtifactStaleBannerVisibility(): void {
  for (const banner of Array.from(
    document.querySelectorAll<HTMLElement>(`.${ARTIFACT_STALE_BANNER_CLASS}`)
  )) {
    banner.style.display = artifactStaleReason ? 'block' : 'none';
  }
}

function markCurrentArtifactInvalid(
  reason: ArtifactInvalidReason,
  discard: boolean
): void {
  if (artifactBackedFieldsFilled) artifactStaleReason = reason;
  if (discard) generatedResumeArtifactForCurrentJob = null;
  if (artifactExpiryTimer) {
    window.clearTimeout(artifactExpiryTimer);
    artifactExpiryTimer = null;
  }
  syncArtifactStaleBannerVisibility();
  // The dedicated stale/inactive banners carry the recovery copy for these
  // cases; the status row just stops claiming a resume is standing by.
  syncResumeStatusRows('none');
}

function scheduleCurrentArtifactExpiry(artifact: GeneratedResumeArtifactV1): void {
  if (artifactExpiryTimer) window.clearTimeout(artifactExpiryTimer);
  const delay = Math.max(0, Date.parse(artifact.expiresAt) - Date.now());
  artifactExpiryTimer = window.setTimeout(() => {
    if (generatedResumeArtifactForCurrentJob?.artifactId !== artifact.artifactId) return;
    markCurrentArtifactInvalid('expired', false);
  }, delay);
}

function setCurrentGeneratedArtifact(artifact: GeneratedResumeArtifactV1): void {
  generatedResumeArtifactForCurrentJob = artifact;
  const storage = currentSessionStorage();
  if (storage) rememberArtifactExpectedForSession(storage, artifact);
  for (const fallback of Array.from(
    document.querySelectorAll<HTMLElement>(`.${ARTIFACT_INACTIVE_FALLBACK_CLASS}`),
  )) {
    fallback.textContent = '';
    fallback.style.display = 'none';
    fallback.removeAttribute('role');
  }
  artifactStaleReason = null;
  scheduleCurrentArtifactExpiry(artifact);
  syncArtifactStaleBannerVisibility();
  syncResumeStatusRows('ready');
  if (currentAutofillPreferences.mode === 'continuous') {
    previousContinuousSignature = '';
    scheduleContinuousPrefill();
  }
}

function invalidateArtifactForUrlChange(nextUrl: string): void {
  invalidatePrivateApprovalForUrl(nextUrl);
  const artifact = generatedResumeArtifactForCurrentJob;
  if (!artifact) return;
  if (!jobUrlsReferToSameJob(
    artifact.job.sourceUrl,
    nextUrl,
    artifact.job.requisitionId,
  )) {
    markCurrentArtifactInvalid('job_changed', true);
  }
}

async function reconcileArtifactAvailabilityOnWidgetMount(
  job: JobInfo,
  prefillButton: HTMLButtonElement,
  fallbackHost: HTMLElement,
): Promise<void> {
  const context = jobContextFor(job);
  const storage = currentSessionStorage();
  // Peek only — never discard a fresh side-panel generate because the page
  // parser briefly disagrees about company/role text.
  const resolved = (await chrome.runtime.sendMessage({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    discardRejectedArtifact: false,
    request: { now: new Date().toISOString(), jobContext: context },
  }).catch(() => null)) as V1PrefillPayloadResponse | null;
  const artifactAvailable = Boolean(
    resolved?.ok && resolved.source === 'generated_resume',
  );
  const wasExpected = Boolean(
    storage && artifactExpectedForSession(storage, context),
  );
  if (artifactAvailable && storage) {
    // Keep the page marker in sync so later mounts know a resume belonged here.
    rememberArtifactExpectationFromJob(storage, {
      sourceUrl: context.jobUrl,
      companyName: context.companyName,
      roleTitle: context.roleTitle,
    });
  }
  renderInactiveArtifactFallback({
    host: fallbackHost,
    artifactAvailable,
    wasExpected,
  });
  // An already-attached row must not be downgraded to "ready" by a later
  // reconcile — the file really is in the form.
  if (
    !isResumeStatusAttached(
      document.querySelector<HTMLElement>(`.${RESUME_STATUS_ROW_CLASS}`),
    )
  ) {
    syncResumeStatusRows(artifactAvailable ? 'ready' : 'none');
  }
  paintPrefillButton(prefillButton, artifactAvailable);
  if (artifactAvailable) {
    // Side-panel generate does not push PDF bytes into this tab. Force Continuous
    // (or the next Prefill click) to re-resolve so the file input gets attached.
    previousContinuousSignature = '';
    if (currentAutofillPreferences.mode === 'continuous') {
      scheduleContinuousPrefill();
    }
  }
}

function generatedResumeFor(job: JobInfo): GeneratedResumeAttachment | undefined {
  const lifecycle = resolveArtifactLifecycle({
    artifact: generatedResumeArtifactForCurrentJob,
    jobContext: jobContextFor(job),
    previouslyFilledFromArtifact: artifactBackedFieldsFilled,
  });
  if (lifecycle.status === 'invalid') {
    if (lifecycle.reason !== 'missing') {
      markCurrentArtifactInvalid(
        lifecycle.reason,
        lifecycle.reason === 'job_changed'
      );
    }
    return undefined;
  }
  return {
    pdfBase64: lifecycle.artifact.pdf.base64,
    filename: lifecycle.artifact.pdf.filename,
  };
}

type PrefillExecutionResult = PrefillExecutionSnapshot;

/** Resolve immediately before every manual or Continuous engine pass. */
async function executeResolvedPrefill(
  job: JobInfo,
  mode: AutofillPreferences['mode'],
): Promise<PrefillExecutionResult> {
  const resolved = (await chrome.runtime.sendMessage({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    // Soft mismatches used to wipe a fresh side-panel generate before attach.
    // Only truly expired/invalid artifacts should be discarded on Prefill.
    discardRejectedArtifact: false,
    request: {
      now: new Date().toISOString(),
      jobContext: jobContextFor(job),
    },
  }).catch(() => null)) as V1PrefillPayloadResponse | null;

  if (!resolved?.ok) {
    const result = mode === 'step_by_step'
      ? await runPrefill({ autofillSkills: false })
      : emptyPrefillCoverage();
    return {
      result,
      hasResume: false,
      hasCoverLetter: false,
      sourceType: 'unavailable',
      artifactStateReason: 'unavailable',
    };
  }

  let hasResume = false;
  let hasCoverLetter = false;
  let prefill: PrefillOptions;
  if (resolved.source === 'generated_resume') {
    hasResume = true;
    hasCoverLetter = Boolean(resolved.coverLetter);
    prefill = {
      resume: resolved.resume,
      coverLetter: resolved.coverLetter,
      generatedContentHash: resolved.generatedContentHash,
      snapshot: resolved.snapshot,
      profileFallback: resolved.profileFallback,
      autofillSkills:
        AUTOFILL_FEATURE_FLAGS.skills &&
        currentAutofillPreferences.autofillSkills,
      quietResultToast: mode === 'continuous',
    };
  } else {
    if (resolved.reason !== 'feature_disabled') {
      markCurrentArtifactInvalid(
        resolved.reason,
        resolved.reason !== 'expired',
      );
    }
    if (
      mode === 'continuous' &&
      resolved.reason !== 'missing' &&
      resolved.reason !== 'feature_disabled'
    ) {
      return {
        result: emptyPrefillCoverage(),
        hasResume: false,
        hasCoverLetter: false,
        sourceType: 'profile_only',
        artifactStateReason: resolved.reason,
        stoppedReason: resolved.reason,
      };
    }
    // Profile-only: never attach a resume file when nothing was generated
    // for this job (or the artifact no longer matches).
    prefill = {
      profileFallback: resolved.profileFallback,
      autofillSkills: false,
      quietResultToast: mode === 'continuous',
    };
  }

  // Frames receive only the already-resolved, ephemeral payload for this run.
  chrome.runtime.sendMessage({
    type: 'PREFILL_CHILD_FRAMES',
    prefill: {
      ...prefill,
      ...(sensitiveAnswerSession.confirmed
        ? { sensitiveAnswers: sensitiveAnswerSession }
        : {}),
    },
  }).catch(() => {});
  const loginFill = approvedJobPortalLogin
    ? fillJobPortalLogin(
        document,
        approvedJobPortalLogin,
        window.location.hostname
      )
    : { emailFilled: 0, passwordFilled: 0, totalFilled: 0 };
  const result = await runPrefill({
    ...prefill,
    quietResultToast:
      prefill.quietResultToast === true || loginFill.totalFilled > 0,
  });
  if (loginFill.totalFilled > 0) {
    result.filled += loginFill.totalFilled;
    result.total += loginFill.totalFilled;
    result.groups.contact.filled += loginFill.totalFilled;
    result.groups.contact.total += loginFill.totalFilled;
  }
  const applicationRoot = findApplicationForm() ?? document;
  const sensitive = await fillConfirmedSensitiveAnswers(
    applicationRoot,
    sensitiveAnswerSession
  );
  result.applicationScan = scanApplicationFields(applicationRoot);
  if (sensitive.unresolved.length > 0) {
    if (
      AUTOFILL_FEATURE_FLAGS.guidedAutopilot &&
      currentAutofillPreferences.guidedAutopilot
    ) {
      guidedStatus(
        'Paused: review the required private answers in the TrackMyOPT panel.'
      );
    }
  }
  if (hasResume && result.filled > 0) artifactBackedFieldsFilled = true;
  return {
    result,
    hasResume,
    hasCoverLetter,
    ...(resolved.source === 'generated_resume' && resolved.jobDescription
      ? { jobDescription: resolved.jobDescription }
      : {}),
    sourceType: resolved.source,
    artifactStateReason:
      resolved.source === 'generated_resume' ? 'none' : resolved.reason,
  };
}

function trackPrefillExecution(
  execution: PrefillExecutionResult,
  mode: AutofillPreferences['mode'],
  outcome: 'success' | 'error',
): void {
  trackWidgetAnalytics(
    'extension_widget_prefill_completed',
    buildPrefillTelemetryProperties({
      outcome,
      result: execution.result,
      mode,
      sourceType: execution.sourceType,
      artifactStateReason: execution.artifactStateReason,
      hasResume: execution.hasResume,
      hasCoverLetter: execution.hasCoverLetter,
      featureFlags: AUTOFILL_FEATURE_FLAGS,
    }),
  );
}

function trackPrefillRuntimeFailure(
  mode: AutofillPreferences['mode'],
  hasResume = false,
): void {
  trackWidgetAnalytics(
    'extension_widget_prefill_completed',
    buildPrefillTelemetryProperties({
      outcome: 'error',
      result: emptyPrefillCoverage(),
      mode,
      sourceType: 'unavailable',
      artifactStateReason: 'unavailable',
      hasResume,
      hasCoverLetter: false,
      featureFlags: AUTOFILL_FEATURE_FLAGS,
      errorCode: 'runtime',
    }),
  );
}

async function mountScreeningQuestionReviews(
  card: HTMLElement,
  job: JobInfo,
  hasResolvedArtifact = false,
  resolvedJobDescription = '',
): Promise<void> {
  if (!AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) return;
  // A valid artifact can be owned by the background/session store without
  // existing in this content script's short-lived module cache. The resolved
  // prefill result is the authority for that common handoff path.
  if (!generatedResumeArtifactForCurrentJob && !hasResolvedArtifact) return;
  card.querySelector('.tmo-screening-review-list')?.remove();
  const host = document.createElement('div');
  host.className = 'tmo-screening-review-list';
  const form = findApplicationForm();
  if (!form) return;
  for (const element of Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('textarea,input[type="text"]'))) {
    const eligible = await detectScreeningQuestion({
      label: getLabelText(element),
      value: element.value,
      hidden: element.hidden || element.getClientRects().length === 0,
      disabled: element.disabled,
      element,
      characterLimit: element.maxLength > 0 ? element.maxLength : undefined,
    });
    if (!eligible) continue;
    const savedResponse = await chrome.runtime.sendMessage({
      type: 'LOAD_SCREENING_ANSWER', questionHash: eligible.questionHash,
    }).catch(() => null) as { answer?: import('./screening-question-drafts').SavedScreeningAnswer } | null;
    host.appendChild(createScreeningQuestionReviewUI({
      question: eligible,
      limits: {
        quotaPeriod: currentPlanEntitlements.planTier === 'free'
          ? 'month'
          : 'day',
        quotaLimit:
          currentPlanEntitlements.screeningDraftsMonthlyLimit ?? 25,
        quotaRemaining:
          currentPlanEntitlements.screeningDraftsMonthlyLimit ?? 25,
        dailyRemaining: 25,
        itemRegenerationsRemaining: 3,
        itemRegenerationLimit: 3,
      },
      savedAnswer: savedResponse?.answer,
      generateDraft: async (regenerate) => {
        const response = await chrome.runtime.sendMessage({
          type: 'GENERATE_SCREENING_DRAFT',
          questionText: eligible.normalizedQuestionText,
          characterLimit: eligible.characterLimit,
          jobDescription:
            resolvedJobDescription ||
            getLastResumeJobDescription() ||
            scrapeJobDescription(),
          companyName: job.company_name || '',
          roleTitle: job.role_title || '',
          regenerate,
        }) as {
          draft?: string;
          quotaPeriod?: 'day' | 'month';
          quotaLimit?: number;
          quotaRemaining?: number;
          dailyRemaining?: number;
          itemRegenerationsRemaining?: number;
          itemRegenerationLimit?: number;
          error?: string;
        };
        if (!response?.draft) throw new Error(response?.error || 'Draft generation failed');
        return {
          draft: response.draft,
          limits: {
            quotaPeriod: response.quotaPeriod,
            quotaLimit: response.quotaLimit,
            quotaRemaining: response.quotaRemaining,
            dailyRemaining: response.dailyRemaining ?? 0,
            itemRegenerationsRemaining: response.itemRegenerationsRemaining ?? 0,
            itemRegenerationLimit: response.itemRegenerationLimit ?? 3,
          },
        };
      },
      onReviewed: (answer) => {
        void chrome.runtime.sendMessage({
          type: 'SAVE_SCREENING_ANSWER',
          answer: {
            questionHash: eligible.questionHash,
            normalizedQuestionText: eligible.normalizedQuestionText,
            editedAnswer: answer,
            source: 'user_edited_ai_draft',
          },
        });
      },
      onReviewStateChange: (reviewState) => {
        trackWidgetAnalytics('extension_widget_screening_review_state', {
          review_state: reviewState,
        });
      },
      onDeleteSavedAnswer: async (questionHash) => {
        await chrome.runtime.sendMessage({ type: 'DELETE_SCREENING_ANSWER', questionHash });
      },
      onUpgrade: () => {
        window.open(API_ENDPOINTS.PRICING, '_blank', 'noopener,noreferrer');
      },
    }));
  }
  if (host.childElementCount > 0) card.appendChild(host);
}

function paintContinuousStopGuidance(reason: 'expired' | 'job_changed' | 'invalid'): void {
  const line = document.querySelector<HTMLElement>('.tmo-prefill-result-line');
  if (!line) return;
  line.textContent = reason === 'expired'
    ? 'This generated resume expired. Generate again or use Step-by-step profile prefill.'
    : 'This generated resume is not active for the current job. Generate again or use Step-by-step profile prefill.';
  line.style.display = 'flex';
}

async function markPostSaveSuggestionSeen(job: JobInfo): Promise<boolean> {
  try {
    const key = jobMemoryKey({
      jobUrl: job.job_url,
      companyName: job.company_name,
      roleTitle: job.role_title,
    });
    const stored = await chrome.storage.local.get(POST_SAVE_SUGGESTION_SEEN_KEY);
    const next = recordSeenJob(stored[POST_SAVE_SUGGESTION_SEEN_KEY], key, 100);
    if (next.alreadySeen) return false;
    await chrome.storage.local.set({ [POST_SAVE_SUGGESTION_SEEN_KEY]: next.keys });
    return true;
  } catch {
    // Storage failure should not repeatedly nag the user in the same page.
    return false;
  }
}



/** True when the widget should stay hidden here (this-visit / this-site / all-sites). */


/**
 * Explicit per-session collapse override (set only once the user manually
 * toggles collapse/expand on THIS origin, this tab). null = no override yet,
 * so the widget should fall back to the persisted default-view setting.
 */


// chrome.storage.local: 'expanded' | 'minimized' — persists across sites/visits,
// set from the widget's Settings panel.


const AUTO_ADD_DEBOUNCE_MS = 15000; // don't auto-add same job twice within 15 min
const JOB_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000; // use stored context up to 30 min old


/**
 * Known job boards and ATS portals render jobs via SPAs, so they get the full
 * MutationObserver + retry loop. Generic career pages (company /careers paths,
 * career subdomains) use a lighter timed-retry approach.
 */


function saveJobContext(job: JobInfo) {
  try {
    const snapshot = buildJobSaveSnapshot(job, scrapeJobDescription());
    chrome.storage.session.set({
      [SESSION_KEYS.LAST_JOB_CONTEXT]: {
        job: {
          company_name: snapshot.company_name,
          role_title: snapshot.role_title,
          job_url: snapshot.job_url,
          location: snapshot.location,
          salary_text: snapshot.salary_text,
          job_description: snapshot.job_description,
        },
        storedAt: Date.now(),
      },
    });
  } catch (_) {
    // ignore
  }
}

function tryAutoAddOnSuccess() {
  if (!document.body || !isApplicationSuccessPage()) return;
  const fromPage = getJobInfo();
  chrome.storage.session.get(SESSION_KEYS.LAST_JOB_CONTEXT, (result) => {
    const ctx = result[SESSION_KEYS.LAST_JOB_CONTEXT] as { job: JobInfo; storedAt: number } | undefined;
    const storedJob = ctx?.job && Date.now() - (ctx.storedAt || 0) <= JOB_CONTEXT_MAX_AGE_MS
      ? ctx.job
      : null;
    const jobToAdd = storedJob || fromPage;
    if (!jobToAdd?.role_title || !jobToAdd.company_name) return;
    tryAutoAddWithJob(jobToAdd);
  });
}

function tryAutoAddWithJob(job: JobInfo) {
  chrome.storage.session.get(SESSION_KEYS.LAST_AUTO_ADDED, (result) => {
    const last = result[SESSION_KEYS.LAST_AUTO_ADDED] as { job_url: string; at: number } | undefined;
    if (last && last.job_url === job.job_url && Date.now() - last.at < AUTO_ADD_DEBOUNCE_MS) return;

    chrome.runtime.sendMessage(
      {
        type: 'ADD_JOB_TO_TRACKER',
        job: buildJobSaveSnapshot(job, scrapeJobDescription()),
        autoAdd: true,
      },
      (response: { ok?: boolean; error?: string; id?: string } | undefined) => {
        if (chrome.runtime.lastError) return;
        if (response?.ok) {
          rememberTrackerApplicationId(job, response.id);
          chrome.storage.session.set({
            [SESSION_KEYS.LAST_AUTO_ADDED]: { job_url: job.job_url, at: Date.now() },
          });
          chrome.storage.session.remove(SESSION_KEYS.LAST_JOB_CONTEXT);
          showMessage('Application auto-added to TrackMyOPT Job Tracker!', false);
        }
      }
    );
  });
}

// --- Generic parser: works on any career page ---


/**
 * Recover the selected role when a generic careers-page title was parsed.
 * Ordered selectors favor explicit ATS job-title signals before headings so a
 * page-wide "Career Opportunities" heading cannot mask the actual role.
 */


// --- Site-specific parsers (higher accuracy when available) ---


/** Right-hand job pane on LinkedIn search / collections (SPA loads content after idle). */


/**
 * Fallback employer logo: the CURRENT SITE's own favicon. Only meaningful on
 * the employer's/ATS's own domain (Workday, Greenhouse, a company careers
 * page, etc.) — NOT on third-party job boards like LinkedIn/Indeed, where the
 * favicon is the board's icon, not the employer's.
 */


/**
 * iCIMS branded portals keep the real job DOM inside #icims_content_iframe.
 * The top frame still exposes a stable /jobs/<id>/<slug>/job URL and a real
 * document title, while og:title remains a generic careers-page title.
 */


/**
 * Sticky, collapsible side widget: Prefill application, Save to tracker, and
 * AI analysis. Expanded × minimizes; minimized × opens the hide-scope
 * menu. Draggable via the expanded header or minimized six-dot grip.
 */
let lastUrl = location.href;
let injectDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const INJECT_DEBOUNCE_MS = 400;


function wireJobTrackerWidgetHost(): void {
  setJobTrackerWidgetHost({
    trackWidgetAnalytics,
    trackWidgetAnalyticsOnce,
    getArtifactStaleReason: () => artifactStaleReason,
    rememberTrackerApplicationId,
    trackerApplicationIdFor,
    reconcileArtifactAvailabilityOnWidgetMount,
    generatedResumeFor,
    executeResolvedPrefill,
    trackPrefillExecution,
    trackPrefillRuntimeFailure,
    mountScreeningQuestionReviews,
    markPostSaveSuggestionSeen,
    paintGuidedStateUi,
    stopGuidedAutopilot,
    setCurrentGeneratedArtifact,
    markCurrentArtifactInvalid,
    getPlanEntitlements: () => currentPlanEntitlements,
    scheduleInject,
    clearPrivateApplicationApproval,
    commitSensitiveApproval: ({ login, session, binding }) => {
      approvedJobPortalLogin = login;
      sensitiveAnswerSession = session;
      privateApprovalBinding = binding;
      previousContinuousSignature = '';
      scheduleContinuousPrefill();
    },
  });
}

async function injectOrRefreshButton() {
  wireJobTrackerWidgetHost();
  if (!document.body) return;
  if (!extAlive()) {
    teardownWidgetRuntime();
    return;
  }

  const currentJobAtStart = getJobInfo();
  invalidatePrivateApprovalForJob(currentJobAtStart);
  if (generatedResumeArtifactForCurrentJob && currentJobAtStart) {
    generatedResumeFor(currentJobAtStart);
  }

  // Keep an existing widget exactly as-is while the user is mid-interaction.
  // Job boards like Workday mutate the DOM and change the URL constantly; without
  // this guard, a resume generation in progress (or its result) would be wiped
  // out from under the user by a routine SPA refresh.
  if (document.getElementById(WIDGET_ROOT_ID) && isWidgetInteractionInFlight()) {
    return;
  }

  const host = window.location.hostname;
  if (host.includes('linkedin.com') && !isLinkedInJobSurface()) {
    document.getElementById(WIDGET_ROOT_ID)?.remove();
    return;
  }

  const job = currentJobAtStart ?? getJobInfo();
  // Never overwrite the original posting snapshot with a confirmation page;
  // auto-add relies on this context after the application flow navigates.
  if (job && !isApplicationSuccessPage()) saveJobContext(job);

  const existing = document.getElementById(WIDGET_ROOT_ID);
  if (!job) {
    if (existing) existing.remove();
    return;
  }
  // Company/role changes are evaluated as soon as the refreshed job context is
  // available. The lifecycle helper never clears or refills existing fields.
  generatedResumeFor(job);

  const dismissed = readWidgetDismissedUrl();
  if (dismissed && dismissed === job.job_url) {
    return;
  }

  // Hide scopes: this-visit (session) / this-site / all-sites (persisted).
  if (await isWidgetSuppressed()) {
    existing?.remove();
    return;
  }

  const defaultView = await getDefaultViewPref();

  const currentWidget = document.getElementById(WIDGET_ROOT_ID);
  if (currentWidget) {
    if (!shouldRefreshWidget(currentWidget, job)) return;
    // Re-check after the awaits above: a resume generation / analysis / dialog
    // may have started while this async pass was resolving. Never destroy the
    // widget out from under an in-flight interaction on any job portal.
    if (isWidgetInteractionInFlight()) return;
    currentWidget.remove();
  }

  const widget = createJobTrackerWidget(job, defaultView);

  // A maximum z-index alone cannot beat another extension using the same value
  // from a later stacking context. A manual popover enters Chrome's top layer,
  // keeping TrackMyOPT above ordinary page and extension overlays. Older
  // browsers retain the maximum-z-index fallback.
  widget.setAttribute('popover', 'manual');
  document.body.appendChild(widget);

  // The widget is built imperatively from styled divs, most of which carry a
  // click handler but no role or tabindex. Retrofit them so the whole surface
  // is keyboard-operable, and re-run on mutation because panels render lazily.
  hardenInteractiveElements(widget);
  announceWidgetStatus = ensureWidgetAnnouncer(widget);
  const a11yObserver = new MutationObserver(() => hardenInteractiveElements(widget));
  a11yObserver.observe(widget, { childList: true, subtree: true });
  // Screen readers get no signal that a panel appeared over the page.
  announceWidgetStatus(
    job.role_title
      ? `TrackMyOPT detected a job posting: ${job.role_title}. Press Tab to reach its actions.`
      : 'TrackMyOPT detected a job posting on this page. Press Tab to reach its actions.'
  );
  try {
    widget.showPopover?.();
  } catch {
    // If the top-layer API is unavailable or rejected, avoid the popover's
    // hidden default state and continue with the z-index fallback.
    widget.removeAttribute('popover');
  }
}

function scheduleInject() {
  if (injectDebounceTimer) clearTimeout(injectDebounceTimer);
  injectDebounceTimer = setTimeout(() => {
    injectDebounceTimer = null;
    injectOrRefreshButton();
  }, INJECT_DEBOUNCE_MS);
}

function tryInject() {
  if (document.body) {
    injectOrRefreshButton();
  } else {
    setTimeout(tryInject, 500);
  }
}

let successCheckTimeout: ReturnType<typeof setTimeout> | null = null;
const SUCCESS_CHECK_DEBOUNCE_MS = 800;

function runSuccessCheckDebounced() {
  if (successCheckTimeout) clearTimeout(successCheckTimeout);
  successCheckTimeout = setTimeout(() => {
    successCheckTimeout = null;
    tryAutoAddOnSuccess();
  }, SUCCESS_CHECK_DEBOUNCE_MS);
}

// Module-level references so both observer and interval can be cleaned up on unload.
let _spaObserver: MutationObserver | null = null;
let _earlyRetryId: number | null = null;
let _continuousPrefillObserver: MutationObserver | null = null;
let continuousPrefillTimer: number | null = null;
let guidedNavigationTimer: number | null = null;
let continuousPrefillInFlight = false;
let continuousMutationPending = false;
let previousContinuousSignature = '';
const CONTINUOUS_PREFILL_DEBOUNCE_MS = 500;

function stopContinuousPrefill(): void {
  _continuousPrefillObserver?.disconnect();
  _continuousPrefillObserver = null;
  if (continuousPrefillTimer !== null) {
    window.clearTimeout(continuousPrefillTimer);
    continuousPrefillTimer = null;
  }
  continuousPrefillInFlight = false;
  continuousMutationPending = false;
  previousContinuousSignature = '';
}

function paintGuidedStateUi(): void {
  const active =
    AUTOFILL_FEATURE_FLAGS.guidedAutopilot &&
    currentPlanEntitlements.guidedAutopilot &&
    currentAutofillPreferences.guidedAutopilot;
  for (const host of Array.from(
    document.querySelectorAll<HTMLElement>('.tmo-guided-status')
  )) {
    host.style.display = active ? 'flex' : 'none';
  }
}

async function stopGuidedAutopilot(): Promise<void> {
  if (guidedNavigationTimer !== null) {
    window.clearTimeout(guidedNavigationTimer);
    guidedNavigationTimer = null;
  }
  stopContinuousPrefill();
  currentAutofillPreferences = {
    ...currentAutofillPreferences,
    mode: 'step_by_step',
    guidedAutopilot: false,
  };
  trackWidgetAnalytics('extension_widget_guided_navigation', {
    navigation_outcome: 'stopped',
  });
  paintGuidedStateUi();
  await chrome.storage.sync.set({
    [AUTOFILL_PREFERENCES_KEY]: currentAutofillPreferences,
  }).catch(() => {});
}

function paintGuidedNavigationResult(result: GuidedNavigationResult): void {
  trackWidgetAnalytics('extension_widget_guided_navigation', {
    navigation_outcome: result.outcome,
  });
  if (result.outcome === 'advanced') {
    guidedStatus(
      `Advanced with “${result.label || 'Next'}”. Waiting for the next step…`
    );
  } else if (result.outcome === 'blocked_required_fields') {
    guidedStatus(
      `Paused: ${result.unansweredRequiredCount || 1} required field(s) still need your review.`
    );
  } else if (result.outcome === 'stopped_review_step') {
    guidedStatus('Stopped at Review. Please review the application yourself.');
  } else if (result.outcome === 'stopped_final_step') {
    guidedStatus('Stopped before the final action. TrackMyOPT never submits.');
  } else if (result.outcome === 'no_safe_control') {
    guidedStatus('Paused: no safe Next/Done control was found.');
  }
}

function scheduleGuidedNavigation(): void {
  if (
    !AUTOFILL_FEATURE_FLAGS.guidedAutopilot ||
    !currentPlanEntitlements.guidedAutopilot ||
    !currentAutofillPreferences.guidedAutopilot
  ) {
    return;
  }
  if (guidedNavigationTimer !== null) {
    window.clearTimeout(guidedNavigationTimer);
  }
  guidedStatus(
    'Reviewing this step. Press Escape or Stop to pause Guided Autopilot.'
  );
  guidedNavigationTimer = window.setTimeout(() => {
    guidedNavigationTimer = null;
    if (!currentAutofillPreferences.guidedAutopilot) return;
    paintGuidedNavigationResult(
      runGuidedNavigation(
        findApplicationForm() ?? document,
        guidedClickedControls
      )
    );
  }, 1_200);
}

async function runContinuousPrefill(): Promise<void> {
  continuousPrefillTimer = null;
  if (
    !AUTOFILL_FEATURE_FLAGS.continuousMode ||
    !currentPlanEntitlements.continuousMode
  ) return;
  const signature = getPrefillCandidateSignature();
  if (!shouldRunContinuousPrefill({
    mode: currentAutofillPreferences.mode,
    signature,
    previousSignature: previousContinuousSignature,
    inFlight: continuousPrefillInFlight,
  })) return;

  const job = getJobInfo();
  if (!job) return;
  previousContinuousSignature = signature;
  continuousPrefillInFlight = true;
  continuousMutationPending = false;
  try {
    const execution = await executeResolvedPrefill(job, 'continuous');
    if (execution.stoppedReason) {
      paintContinuousStopGuidance(execution.stoppedReason);
      trackPrefillExecution(execution, 'continuous', 'error');
      return;
    }
    const resultLine = document.querySelector<HTMLElement>('.tmo-prefill-result-line');
    if (resultLine && execution.result.total > 0) {
      paintPrefillCoverage(resultLine, execution.result);
    }
    const widgetCard = document.querySelector<HTMLElement>(
      `#${WIDGET_ROOT_ID} .tmo-job-widget-card`
    );
    if (widgetCard && AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
      await mountScreeningQuestionReviews(
        widgetCard,
        job,
        execution.hasResume,
        execution.jobDescription,
      );
    }
    trackPrefillExecution(execution, 'continuous', 'success');
    scheduleGuidedNavigation();
  } catch {
    trackPrefillRuntimeFailure('continuous');
  } finally {
    continuousPrefillInFlight = false;
    previousContinuousSignature = getPrefillCandidateSignature();
    if (continuousMutationPending && currentAutofillPreferences.mode === 'continuous') {
      continuousMutationPending = false;
      previousContinuousSignature = '';
      scheduleContinuousPrefill();
    }
  }
}

function scheduleContinuousPrefill(): void {
  if (
    !AUTOFILL_FEATURE_FLAGS.continuousMode ||
    !currentPlanEntitlements.continuousMode
  ) return;
  if (currentAutofillPreferences.mode !== 'continuous') return;
  if (continuousPrefillInFlight) {
    continuousMutationPending = true;
    return;
  }
  if (continuousPrefillTimer !== null) window.clearTimeout(continuousPrefillTimer);
  continuousPrefillTimer = window.setTimeout(
    () => void runContinuousPrefill(),
    CONTINUOUS_PREFILL_DEBOUNCE_MS,
  );
}

function startContinuousPrefill(): void {
  stopContinuousPrefill();
  if (
    !AUTOFILL_FEATURE_FLAGS.continuousMode ||
    !currentPlanEntitlements.continuousMode
  ) return;
  if (currentAutofillPreferences.mode !== 'continuous') return;
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', startContinuousPrefill, { once: true });
    return;
  }
  _continuousPrefillObserver = new MutationObserver((records) => {
    const hasApplicationMutation = records.some((record) => {
      const target = record.target instanceof Element ? record.target : null;
      return !target?.closest(`#${WIDGET_ROOT_ID}`);
    });
    if (hasApplicationMutation) scheduleContinuousPrefill();
  });
  _continuousPrefillObserver.observe(document.body, { childList: true, subtree: true });
  scheduleContinuousPrefill();
}

async function initializeAutofillPreferences(): Promise<void> {
  try {
    const response = (await chrome.runtime.sendMessage({
      type: 'GET_AUTOFILL_ENTITLEMENTS',
    })) as { planTier?: AutofillPlanTier } | undefined;
    const planTier: AutofillPlanTier =
      response?.planTier === 'pro' || response?.planTier === 'dedicated'
        ? response.planTier
        : 'free';
    currentPlanEntitlements = resolveAutofillPlanEntitlements(planTier);
  } catch {
    currentPlanEntitlements = FREE_AUTOFILL_PLAN_ENTITLEMENTS;
  }
  try {
    const stored = await chrome.storage.sync.get(AUTOFILL_PREFERENCES_KEY);
    currentAutofillPreferences = normalizeAutofillPreferences(
      stored[AUTOFILL_PREFERENCES_KEY],
      AUTOFILL_FEATURE_FLAGS,
      currentPlanEntitlements,
    );
  } catch {
    currentAutofillPreferences = { ...DEFAULT_AUTOFILL_PREFERENCES };
  }
  paintGuidedStateUi();
  if (
    AUTOFILL_FEATURE_FLAGS.continuousMode &&
    currentPlanEntitlements.continuousMode &&
    currentAutofillPreferences.mode === 'continuous'
  )
    startContinuousPrefill();
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync' || !changes[AUTOFILL_PREFERENCES_KEY]) return;
  currentAutofillPreferences = normalizeAutofillPreferences(
    changes[AUTOFILL_PREFERENCES_KEY].newValue,
    AUTOFILL_FEATURE_FLAGS,
    currentPlanEntitlements,
  );
  paintGuidedStateUi();
  if (
    AUTOFILL_FEATURE_FLAGS.continuousMode &&
    currentPlanEntitlements.continuousMode &&
    currentAutofillPreferences.mode === 'continuous'
  )
    startContinuousPrefill();
  else stopContinuousPrefill();
});

document.addEventListener(
  'keydown',
  (event) => {
    if (event.key !== 'Escape' || !currentAutofillPreferences.guidedAutopilot) {
      return;
    }
    void stopGuidedAutopilot();
  },
  true
);

/**
 * False once the extension is reloaded/updated while THIS old content script is
 * still running on the page — `chrome.runtime.id` becomes undefined and any
 * chrome.* call throws "Extension context invalidated". We use this to bail and
 * tear down instead of spamming the console.
 */
function extAlive(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

/** Stop every timer/observer and remove the widget (used when the context dies). */
function teardownWidgetRuntime() {
  stopContinuousPrefill();
  clearPrivateApplicationApproval();
  disconnectWidgetViewportObserver();
  if (_spaObserver) {
    _spaObserver.disconnect();
    _spaObserver = null;
  }
  if (_earlyRetryId !== null) {
    window.clearInterval(_earlyRetryId);
    _earlyRetryId = null;
  }
  if (injectDebounceTimer) {
    clearTimeout(injectDebounceTimer);
    injectDebounceTimer = null;
  }
  if (successCheckTimeout) {
    clearTimeout(successCheckTimeout);
    successCheckTimeout = null;
  }
  if (artifactExpiryTimer) {
    clearTimeout(artifactExpiryTimer);
    artifactExpiryTimer = null;
  }
  document.getElementById(WIDGET_ROOT_ID)?.remove();
}

function setupSpaObservers() {
  if (!document.body) return;
  // Disconnect any previous observer before creating a new one.
  if (_spaObserver) {
    _spaObserver.disconnect();
    _spaObserver = null;
  }
  const observer = new MutationObserver(() => {
    if (!extAlive()) {
      teardownWidgetRuntime();
      return;
    }
    if (location.href !== lastUrl) {
      invalidateArtifactForUrlChange(location.href);
      lastUrl = location.href;
      clearWidgetDismissedUrl();
      // Do NOT tear the widget down here. On SPA job boards (Workday, LinkedIn)
      // the URL changes constantly; eagerly removing the widget caused it to
      // flicker open/closed and destroyed any in-progress resume generation.
      // injectOrRefreshButton reconciles instead — it refreshes the card when
      // the job actually changed, removes it when there is no job, keeps it
      // (and any in-flight work) otherwise.
      scheduleInject();
      runSuccessCheckDebounced();
    } else {
      scheduleInject();
      runSuccessCheckDebounced();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  _spaObserver = observer;
}

function startEarlyRetryLoop() {
  // Clear any previously running retry loop before starting a new one.
  if (_earlyRetryId !== null) {
    window.clearInterval(_earlyRetryId);
    _earlyRetryId = null;
  }
  let n = 0;
  const max = 45;
  const id: number = window.setInterval(() => {
    if (!extAlive()) {
      teardownWidgetRuntime();
      return;
    }
    n += 1;
    if (n > max) {
      window.clearInterval(id);
      if (_earlyRetryId === id) _earlyRetryId = null;
      return;
    }
    // Keep sampling briefly even after the initial widget appears: ATS pages
    // often publish location, compensation, and logos a few seconds later.
    // injectOrRefreshButton only replaces the widget when data is enriched.
    injectOrRefreshButton();
  }, 600);
  _earlyRetryId = id;
}

// Cleanup on page unload (navigation away in non-SPA contexts).
window.addEventListener('pagehide', () => {
  stopContinuousPrefill();
  disconnectWidgetViewportObserver();
  if (_spaObserver) { _spaObserver.disconnect(); _spaObserver = null; }
  if (_earlyRetryId !== null) { window.clearInterval(_earlyRetryId); _earlyRetryId = null; }
  if (injectDebounceTimer) { clearTimeout(injectDebounceTimer); injectDebounceTimer = null; }
  if (successCheckTimeout) { clearTimeout(successCheckTimeout); successCheckTimeout = null; }
  if (artifactExpiryTimer) { clearTimeout(artifactExpiryTimer); artifactExpiryTimer = null; }
}, { once: true });

function startSuccessDetection() {
  tryAutoAddOnSuccess();
  setTimeout(tryAutoAddOnSuccess, 2000);
  setTimeout(tryAutoAddOnSuccess, 5000);
  setTimeout(tryAutoAddOnSuccess, 8000);
}

/** Sparse retries on unknown sites (JSON-LD / title-only) without a full DOM observer. */
function initLightScanMode() {
  const delays = [0, 900, 2200, 4500, 8000, 14000];
  for (let i = 0; i < delays.length; i++) {
    window.setTimeout(() => tryInject(), delays[i]);
  }
  startSuccessDetection();
}

function initFullJobAssistMode() {
  const boot = () => {
    tryInject();
    setupSpaObservers();
    startEarlyRetryLoop();
    startSuccessDetection();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

// Cross-origin ATS frames receive prefill through the background relay. They
// never render their own side panel; only the top-level document owns the UI.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // The side panel asks the page for its job context on open and on tab switch.
  // Only the top frame answers, so an iframe cannot shadow the real posting.
  if (message?.type === 'TMO_GET_JOB_CONTEXT') {
    if (window.top !== window.self) return false;
    const job = getJobInfo();
    void resolveJobDescription(window.location.href).then((description) => {
      sendResponse({
        roleTitle: job?.role_title ?? '',
        companyName: job?.company_name ?? '',
        jobUrl: job?.job_url ?? window.location.href,
        pageUrl: window.location.href,
        applicationId: job ? trackerApplicationIdFor(job) : undefined,
        jobDescription: description,
      });
    });
    return true;
  }
  if (message?.type === 'GENERATED_RESUME_ARTIFACT_READY') {
    if (window.top !== window.self) return false;
    const root = document.getElementById(WIDGET_ROOT_ID);
    const prefillButton = root?.querySelector<HTMLButtonElement>('.tmo-prefill-button');
    const fallbackHost = root?.querySelector<HTMLElement>(`.${ARTIFACT_INACTIVE_FALLBACK_CLASS}`);
    const job = getJobInfo();
    const readyJob = message.job as
      | {
          sourceUrl?: string;
          companyName?: string;
          roleTitle?: string;
          requisitionId?: string;
        }
      | undefined;
    const storage = currentSessionStorage();
    if (
      storage &&
      readyJob &&
      typeof readyJob.sourceUrl === 'string' &&
      typeof readyJob.companyName === 'string' &&
      typeof readyJob.roleTitle === 'string'
    ) {
      rememberArtifactExpectationFromJob(storage, {
        sourceUrl: readyJob.sourceUrl,
        companyName: readyJob.companyName,
        roleTitle: readyJob.roleTitle,
        requisitionId:
          typeof readyJob.requisitionId === 'string'
            ? readyJob.requisitionId
            : undefined,
      });
    }
    if (job && prefillButton && fallbackHost) {
      void reconcileArtifactAvailabilityOnWidgetMount(job, prefillButton, fallbackHost)
        .then(() => {
          // Side-panel "Done" should attach the PDF to Add Resume without requiring
          // another Prefill click.
          return executeResolvedPrefill(job, currentAutofillPreferences.mode);
        })
        .catch(() => undefined);
    } else if (prefillButton && fallbackHost && readyJob?.sourceUrl) {
      // Widget job parse may be empty mid-SPA; still clear the false inactive banner
      // when the background just published a resume for this page URL.
      const sameJob = jobUrlsReferToSameJob(
        readyJob.sourceUrl,
        window.location.href,
        typeof readyJob.requisitionId === 'string' ? readyJob.requisitionId : undefined,
      );
      if (sameJob) {
        renderInactiveArtifactFallback({
          host: fallbackHost,
          artifactAvailable: true,
          wasExpected: true,
        });
        paintPrefillButton(prefillButton, true);
        syncResumeStatusRows('ready');
        previousContinuousSignature = '';
        if (currentAutofillPreferences.mode === 'continuous') {
          scheduleContinuousPrefill();
        }
      }
    }
    sendResponse({ ok: true });
    return false;
  }
  if (message?.type === 'CLEAR_RESUME_AUTOFILL_ARTIFACT') {
    generatedResumeArtifactForCurrentJob = null;
    artifactBackedFieldsFilled = false;
    artifactStaleReason = null;
    const storage = currentSessionStorage();
    if (storage) clearArtifactExpectedForSession(storage);
    if (artifactExpiryTimer) {
      window.clearTimeout(artifactExpiryTimer);
      artifactExpiryTimer = null;
    }
    syncArtifactStaleBannerVisibility();
    sendResponse({ ok: true });
    return false;
  }
  if (message?.type !== 'RUN_PREFILL_IN_CHILD_FRAME' || window.top === window.self) return false;
  const prefill = (message.prefill ?? {}) as {
    resume?: GeneratedResumeAttachment;
    coverLetter?: PrefillOptions['coverLetter'];
    generatedContentHash?: string;
    snapshot?: ResumeAutofillSnapshotV1;
    profileFallback?: BasicContactProfile;
    autofillSkills?: boolean;
    quietResultToast?: boolean;
    sensitiveAnswers?: unknown;
  };
  const sensitiveAnswers = normalizeSensitiveAnswerSession(
    prefill.sensitiveAnswers
  );
  void runPrefill({
    resume: prefill.resume,
    coverLetter: prefill.coverLetter,
    generatedContentHash: prefill.generatedContentHash,
    snapshot: prefill.snapshot,
    profileFallback: prefill.profileFallback,
    autofillSkills: prefill.autofillSkills === true,
    quietResultToast: prefill.quietResultToast === true,
    quietIfNoForm: true,
  })
    .then(async () => {
      if (sensitiveAnswers) {
        await fillConfirmedSensitiveAnswers(
          findApplicationForm() ?? document,
          sensitiveAnswers
        );
      }
      sendResponse({ ok: true });
    })
    .catch(() => sendResponse({ ok: false }));
  return true;
});

// Guard: only run on actual career / job pages.
// isCareerPage() covers blocklist → known boards → ATS → career subdomains →
// path patterns → page title / meta → JSON-LD → application forms.
if (window.top !== window.self) {
  // Child frame: listener-only mode.
} else if (!isHttpDocument()) {
  // Non-HTTP document — do nothing.
} else {
  const careerReason = isCareerPage();
  if (!careerReason) {
    // Not a career page — fully inert, zero DOM work.
  } else {
    void initializeAutofillPreferences();
    if (shouldUseFullJobAssistMode()) {
      // Well-known job board or ATS: full SPA observer + retry loop.
      initFullJobAssistMode();
    } else {
      // Generic company career page: lightweight timed retries.
      initLightScanMode();
    }
  }
}
