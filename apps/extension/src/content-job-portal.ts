/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows a sticky, collapsible
 * side widget when a listing is detected, offering: Prefill application, Save to
 * tracker, and AI analysis. Close menu can hide it for this visit / this
 * site / all sites. Auto-adds job to TrackMyOPT on application-success pages.
 */

import { hardenInteractiveElements, ensureWidgetAnnouncer } from './design/a11y';
import { el } from './design/primitives';
import { withPrefillUndo, currentPrefillUndoRunId, markPrefillUndoDelegated, getPrefillUndoState, isPrefillUndoAllowed } from './prefill-undo';
import { requestPrefillUndo } from './prefill-undo-request';
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
import { withPrefillModeGuard } from './prefill-mode-guard';
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
import { loadPrivateAnswersForPrefill } from './private-prefill-request';
import { prefillSavedPortalLogin } from './portal-login-prefill';
import { runSmartAnswers } from './smart-answers';
import { createAutofillVisualFeedback } from './autofill-visual-feedback';
import {
  approvalMatchesJob,
  approvalMatchesUrl,
  createPrivateApprovalBinding,
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
  captureJobDescription,
  resolveJobDescriptionDetails,
  resolveJobDescription,
  scrapeJobDescription,
} from './job-description-scrape';
import { isApplicationSuccessPage } from './job-portal-application-success';
import { isWidgetInteractionInFlight } from './job-portal-interaction-guard';
import { findLinkedInEasyApplyDialog } from './linkedin-easy-apply-dialog';
import {
  jobContextFor,
  shouldRefreshWidget,
  hasPortalPageMutation,
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
// The explicit Prefill click loads private answers for this application only.
// Continuous may reuse them on its steps, never on an unrelated job or page load.
let sensitiveAnswerSession: SensitiveAnswerSession = { confirmed: false };
let privateApprovalBinding: PrivateApprovalBinding | null = null;
const trackedWidgetAnalytics = new Set<string>();
const guidedClickedControls = new WeakSet<HTMLElement>();

function clearPrivateApplicationApproval(): void {
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
  if (!prefillButton.isConnected || !jobUrlsReferToSameJob(context.jobUrl, location.href)) return;
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
  runGuard?: () => boolean,
  explicitPrefillClick = false,
): Promise<PrefillExecutionResult> {
  return withPrefillUndo(() => executeResolvedPrefillBody(job, mode, runGuard, explicitPrefillClick));
}

async function executeResolvedPrefillBody(
  job: JobInfo,
  mode: AutofillPreferences['mode'],
  runGuard?: () => boolean,
  explicitPrefillClick = false,
): Promise<PrefillExecutionResult> {
  const pageUrl = window.location.href;
  const generation = continuousPrefillGeneration;
  const shouldContinue = () => isPrefillUndoAllowed() && window.location.href === pageUrl &&
    (mode !== 'continuous' || (generation === continuousPrefillGeneration &&
      currentAutofillPreferences.mode === 'continuous' && currentPlanEntitlements.continuousMode)) &&
    (runGuard?.() ?? true);
  invalidatePrivateApprovalForJob(job);
  // A manual click refreshes saved answers; automatic runs never fetch them.
  if (explicitPrefillClick) {
    clearPrivateApplicationApproval();
    const binding = createPrivateApprovalBinding(jobContextFor(job));
    const login = await prefillSavedPortalLogin({ shouldContinue: () => {
      const current = getJobInfo();
      return shouldContinue() && Boolean(current && approvalMatchesJob(binding, jobContextFor(current)));
    } });
    if (!shouldContinue() || login.status === 'stopped') throw new Error('Prefill stopped');
    const privateLoad = await loadPrivateAnswersForPrefill(shouldContinue);
    const currentJob = getJobInfo();
    if (!shouldContinue() || !currentJob || !approvalMatchesJob(binding, jobContextFor(currentJob))) {
      throw new Error('Prefill stopped');
    }
    sensitiveAnswerSession = privateLoad.answers;
    privateApprovalBinding = privateLoad.answers.confirmed ? binding : null;
    document.querySelector('.tmo-sensitive-answer-panel')?.dispatchEvent(
      new CustomEvent('tmo-private-prefill-status', { detail: privateLoad.status })
    );
  }
  const answersForRun = sensitiveAnswerSession;
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

  if (!shouldContinue()) throw new Error('Prefill stopped');

  if (!resolved?.ok) {
    const result = mode === 'step_by_step'
      ? await runPrefill({ autofillSkills: false, shouldContinue })
      : emptyPrefillCoverage();
    if (shouldContinue() && mode === 'step_by_step') {
      const root = findApplicationForm() ?? document;
      await fillConfirmedSensitiveAnswers(root, answersForRun, shouldContinue);
      if (explicitPrefillClick && AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
        await runSmartAnswers({root,job:jobContextFor(job),hasResume:false,shouldContinue});
      }
      result.applicationScan = scanApplicationFields(root);
    }
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
    undoRunId: currentPrefillUndoRunId(),
    continuous: mode === 'continuous',
    prefill: {
      ...prefill,
      ...(answersForRun.confirmed
        ? { sensitiveAnswers: answersForRun }
        : {}),
    },
  }).catch(() => {});
  markPrefillUndoDelegated();
  const visual = answersForRun.confirmed && findApplicationForm()
    ? createAutofillVisualFeedback(document, { animateFields: mode === 'step_by_step' })
    : undefined;
  const result = await runPrefill({
    ...prefill,
    shouldContinue,
    animateFields: mode === 'step_by_step',
    visualFeedback: visual,
    quietResultToast:
      prefill.quietResultToast === true || answersForRun.confirmed,
  }).catch(error => { visual?.fail('Prefill paused'); throw error; });
  if (!shouldContinue()) { visual?.fail('Prefill stopped'); throw new Error('Prefill stopped'); }
  const applicationRoot = findApplicationForm() ?? document;
  const sensitive = await fillConfirmedSensitiveAnswers(
    applicationRoot,
    answersForRun,
    shouldContinue,
    visual,
  ).catch(error => { visual?.fail('Prefill paused'); throw error; });
  if (!shouldContinue()) { visual?.fail('Prefill stopped'); throw new Error('Prefill stopped'); }
  let smartFilled = 0;
  if (explicitPrefillClick && AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
    const binding = createPrivateApprovalBinding(jobContextFor(job));
    smartFilled = await runSmartAnswers({
      root: applicationRoot,
      job: { ...jobContextFor(job), jobDescription: resolved.source === 'generated_resume' ? resolved.jobDescription : '' },
      hasResume,
      snapshot: resolved.source === 'generated_resume' ? resolved.snapshot : undefined,
      shouldContinue: () => {
        const current = getJobInfo();
        return shouldContinue() && Boolean(current && approvalMatchesJob(binding, jobContextFor(current)));
      },
    });
  }
  result.applicationScan = scanApplicationFields(applicationRoot);
  if (!shouldContinue()) { visual?.fail('Prefill stopped'); throw new Error('Prefill stopped'); }
  visual?.finish({ filled: result.filled + sensitive.filled + smartFilled, skipped: result.applicationScan.unansweredRequired });
  if (sensitive.unresolved.length > 0) {
    if (
      AUTOFILL_FEATURE_FLAGS.guidedAutopilot &&
      currentAutofillPreferences.guidedAutopilot
    ) {
      guidedStatus(
        'Paused: complete the remaining private questions on this application.'
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
  if (host.childElementCount > 0) {
    (card.querySelector('.tmo-job-widget-scroll-body') || card).appendChild(host);
  }
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
      (response: { ok?: boolean; error?: string; id?: string; status?: string } | undefined) => {
        if (chrome.runtime.lastError) return;
        if (response?.ok) {
          rememberTrackerApplicationId(job, response.id);
          chrome.storage.session.set({
            [SESSION_KEYS.LAST_AUTO_ADDED]: { job_url: job.job_url, at: Date.now() },
          });
          chrome.storage.session.remove(SESSION_KEYS.LAST_JOB_CONTEXT);
          showMessage(response.status === 'Applied' ? 'Application saved as Applied in TrackMyOPT!' : 'Job already saved. Check its status in your tracker.', false);
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
// Install the isolated-world undo bridge even before this frame's first fill.
getPrefillUndoState();
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
    executeResolvedPrefill: (job, mode) => executeResolvedPrefill(job, mode, undefined, true),
    undoLastPrefill: async () => {
      const state = getPrefillUndoState();
      if (state.busy || !state.runId) return { restored: 0, skipped: 0, unsupported: 0 };
      await stopGuidedAutopilot();
      return requestPrefillUndo(state.runId);
    },
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
  });
}

let widgetRefreshRevision = 0;
let widgetMissingSince: number | null = null;
let widgetA11yObserver: MutationObserver | null = null;
let hiddenForLinkedInDialog: HTMLElement | null = null;
let linkedInPrefillObserver: MutationObserver | null = null;

function syncLinkedInEasyApplyAction(): void {
  const dialog = findLinkedInEasyApplyDialog();
  const footer = dialog?.querySelector('footer');
  const widget = document.getElementById(WIDGET_ROOT_ID);
  const prefill = widget?.querySelector<HTMLButtonElement>('.tmo-prefill-button');

  if (hiddenForLinkedInDialog && (hiddenForLinkedInDialog !== widget || !footer || !prefill)) {
    hiddenForLinkedInDialog.style.visibility = '';
    hiddenForLinkedInDialog.removeAttribute('aria-hidden');
    hiddenForLinkedInDialog = null;
    linkedInPrefillObserver?.disconnect();
    linkedInPrefillObserver = null;
  }
  if (!footer || !widget || !prefill) {
    document.querySelectorAll('[data-tmo-linkedin-prefill]').forEach((action) => action.remove());
    return;
  }

  if (hiddenForLinkedInDialog !== widget) {
    widget.style.visibility = 'hidden';
    widget.setAttribute('aria-hidden', 'true');
    hiddenForLinkedInDialog = widget;
  }

  const existingAction = footer.querySelector<HTMLElement>('[data-tmo-linkedin-prefill]');
  if (existingAction?.dataset.tmoWidgetId === widget.dataset.tmoWidgetId) return;
  existingAction?.remove();
  linkedInPrefillObserver?.disconnect();

  widget.dataset.tmoWidgetId ||= crypto.randomUUID();
  const control = el('div', {
    style: 'display:flex;align-items:center;gap:8px;margin-right:auto;min-width:0;',
  });
  control.dataset.tmoLinkedinPrefill = 'true';
  control.dataset.tmoWidgetId = widget.dataset.tmoWidgetId;
  const action = el('button', {
    style: 'flex:none;padding:8px 12px;border:1px solid currentColor;border-radius:6px;background:Canvas;color:LinkText;font:600 14px system-ui;cursor:pointer;',
    text: 'Prefill with TrackMyOPT',
  });
  action.type = 'button';
  const status = el('span', {
    style: 'min-width:0;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:CanvasText;font:12px system-ui;',
    attrs: { role: 'status', 'aria-live': 'polite' },
  });
  control.append(action, status);
  footer.prepend(control);

  action.addEventListener('click', (event) => {
    event.stopPropagation();
    if (prefill.disabled) return;
    action.disabled = true;
    action.textContent = 'Prefilling…';
    status.textContent = '';
    prefill.click();
  });

  const resultLine = widget.querySelector<HTMLElement>('.tmo-prefill-result-line');
  linkedInPrefillObserver = new MutationObserver(() => {
    if (prefill.getAttribute('aria-busy') !== 'false' || !action.isConnected) return;
    action.disabled = false;
    action.textContent = 'Prefill with TrackMyOPT';
    status.textContent = resultLine?.textContent?.trim() || 'Prefill finished. Review the application before continuing.';
  });
  linkedInPrefillObserver.observe(prefill, { attributes: true, attributeFilter: ['aria-busy'] });
}

async function injectOrRefreshButton() {
  const revision = ++widgetRefreshRevision;
  const pageUrl = location.href;
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
  const interactingWidget = document.getElementById(WIDGET_ROOT_ID);
  if (interactingWidget && currentJobAtStart && isWidgetInteractionInFlight() &&
      !shouldRefreshWidget(interactingWidget, currentJobAtStart)) {
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
  if (job && !isApplicationSuccessPage()) {
    saveJobContext(job);
    captureJobDescription();
  }

  const existing = document.getElementById(WIDGET_ROOT_ID);
  if (!job) {
    // ATS frameworks briefly unmount headings while rendering another step.
    // A short bounded grace period avoids flashing the whole rail off/on.
    if (existing) {
      widgetMissingSince ??= Date.now();
      if (Date.now() - widgetMissingSince < 1500) { scheduleInject(); return; }
    }
    if (existing) existing.remove();
    widgetMissingSince = null;
    return;
  }
  widgetMissingSince = null;
  // Company/role changes are evaluated as soon as the refreshed job context is
  // available. The lifecycle helper never clears or refills existing fields.
  generatedResumeFor(job);

  const dismissed = readWidgetDismissedUrl();
  if (dismissed && dismissed === job.job_url) {
    return;
  }

  // Hide scopes: this-visit (session) / this-site / all-sites (persisted).
  const suppressed = await isWidgetSuppressed();
  if (revision !== widgetRefreshRevision || location.href !== pageUrl) return;
  if (suppressed) {
    existing?.remove();
    return;
  }

  const defaultView = await getDefaultViewPref();
  if (revision !== widgetRefreshRevision || location.href !== pageUrl || !extAlive()) return;

  const currentWidget = document.getElementById(WIDGET_ROOT_ID);
  if (currentWidget) {
    if (!shouldRefreshWidget(currentWidget, job)) {
      currentWidget.dispatchEvent(new CustomEvent('tmo-job-enriched', { detail: job }));
      return;
    }
    // This is a genuinely different job, not a step/metadata refresh. Old
    // asynchronous callbacks are guarded and must not leave stale tools here.
    currentWidget.remove();
  }

  widgetA11yObserver?.disconnect();
  disconnectWidgetViewportObserver();
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
  widgetA11yObserver = new MutationObserver(() => hardenInteractiveElements(widget));
  widgetA11yObserver.observe(widget, { childList: true, subtree: true });
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
  syncLinkedInEasyApplyAction();
}

function scheduleInject() {
  // Throttle rather than trailing debounce: busy pages must not starve updates.
  if (injectDebounceTimer) return;
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
let continuousPrefillGeneration = 0;
let continuousNavigationBlocked = false;
const CONTINUOUS_PREFILL_DEBOUNCE_MS = 500;

function stopContinuousPrefill(): void {
  document.removeEventListener('input', onGuidedAnswerChanged, true);
  document.removeEventListener('change', onGuidedAnswerChanged, true);
  continuousPrefillGeneration += 1;
  continuousNavigationBlocked = false;
  if (guidedNavigationTimer !== null) {
    window.clearTimeout(guidedNavigationTimer);
    guidedNavigationTimer = null;
  }
  _continuousPrefillObserver?.disconnect();
  _continuousPrefillObserver = null;
  if (continuousPrefillTimer !== null) {
    window.clearTimeout(continuousPrefillTimer);
    continuousPrefillTimer = null;
  }
  // The old async pass still owns this lock until it settles. Its generation
  // guard prevents any more writes while a restart waits for the lock.
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
    !currentAutofillPreferences.guidedAutopilot ||
    currentAutofillPreferences.mode !== 'continuous' || continuousPrefillInFlight || continuousNavigationBlocked
  ) {
    return;
  }
  if (guidedNavigationTimer !== null) return;
  const applicationRoot = findApplicationForm();
  if (!applicationRoot) return;
  const stepSelector = 'input,textarea,select,button,[role="button"],[role="combobox"],h1,h2,h3,[role="heading"]';
  const stepControls = Array.from(applicationRoot.querySelectorAll(stepSelector));
  const pageUrl = window.location.href;
  const generation = continuousPrefillGeneration;
  guidedStatus(
    'Reviewing this step. Press Escape or Stop to pause Guided Autopilot.'
  );
  guidedNavigationTimer = window.setTimeout(() => {
    guidedNavigationTimer = null;
    if (!currentAutofillPreferences.guidedAutopilot || currentAutofillPreferences.mode !== 'continuous' ||
      !currentPlanEntitlements.guidedAutopilot || continuousPrefillInFlight || continuousNavigationBlocked ||
      generation !== continuousPrefillGeneration || window.location.href !== pageUrl ||
      !applicationRoot.isConnected || findApplicationForm() !== applicationRoot) return;
    const currentControls = Array.from(applicationRoot.querySelectorAll(stepSelector));
    if (currentControls.length !== stepControls.length || currentControls.some((control, i) => control !== stepControls[i])) return;
    paintGuidedNavigationResult(
      runGuidedNavigation(
        applicationRoot,
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
  })) {
    // A user may have completed the remaining manual fields, leaving no
    // deterministic fill candidates. Navigation still gets its safety review.
    scheduleGuidedNavigation();
    return;
  }

  const job = getJobInfo();
  if (!job) return;
  const generation = continuousPrefillGeneration;
  const pageUrl = window.location.href;
  const shouldContinue = () => generation === continuousPrefillGeneration &&
    currentAutofillPreferences.mode === 'continuous' &&
    currentPlanEntitlements.continuousMode && window.location.href === pageUrl;
  previousContinuousSignature = signature;
  continuousPrefillInFlight = true;
  continuousMutationPending = false;
  try {
    const execution = await executeResolvedPrefill(job, 'continuous', shouldContinue);
    if (!shouldContinue()) return;
    if (execution.stoppedReason) {
      continuousNavigationBlocked = true;
      paintContinuousStopGuidance(execution.stoppedReason);
      trackPrefillExecution(execution, 'continuous', 'error');
      return;
    }
    if (execution.sourceType === 'unavailable') {
      continuousNavigationBlocked = true;
      guidedStatus('Paused: could not load your prefill data. Try Prefill again when ready.');
      return;
    }
    continuousNavigationBlocked = false;
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
    if (!shouldContinue()) return;
    trackPrefillExecution(execution, 'continuous', 'success');
  } catch {
    if (shouldContinue()) {
      continuousNavigationBlocked = true;
      trackPrefillRuntimeFailure('continuous');
    }
  } finally {
    continuousPrefillInFlight = false;
    if (generation === continuousPrefillGeneration) {
      const after = getPrefillCandidateSignature();
      const beforeTokens = new Set(signature.split('|'));
      // Filled/unchanged fields must not retrigger a pass. Newly added or
      // revealed controls still need a follow-up, even if they arrived mid-fill.
      const hasNewCandidates = after.split('|').some(token => token && !beforeTokens.has(token));
      previousContinuousSignature = hasNewCandidates ? signature : after;
    }
    if (continuousMutationPending && currentAutofillPreferences.mode === 'continuous') {
      continuousMutationPending = false;
      scheduleContinuousPrefill();
    } else if (shouldContinue()) {
      scheduleGuidedNavigation();
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
  // A busy page must not postpone the pass indefinitely with more mutations.
  if (continuousPrefillTimer !== null) return;
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
  _continuousPrefillObserver.observe(document.body, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['hidden', 'disabled', 'readonly', 'aria-hidden', 'aria-disabled', 'class', 'style'],
  });
  document.addEventListener('input', onGuidedAnswerChanged, true);
  document.addEventListener('change', onGuidedAnswerChanged, true);
  scheduleContinuousPrefill();
}

function onGuidedAnswerChanged(event: Event): void {
  if (!currentAutofillPreferences.guidedAutopilot) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target || target.closest(`#${WIDGET_ROOT_ID}`)) return;
  if (guidedNavigationTimer !== null) {
    window.clearTimeout(guidedNavigationTimer);
    guidedNavigationTimer = null;
  }
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
  widgetRefreshRevision += 1;
  widgetA11yObserver?.disconnect();
  widgetA11yObserver = null;
  linkedInPrefillObserver?.disconnect();
  linkedInPrefillObserver = null;
  hiddenForLinkedInDialog = null;
  document.querySelectorAll('[data-tmo-linkedin-prefill]').forEach((action) => action.remove());
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
  const observer = new MutationObserver((records) => {
    if (!extAlive()) {
      teardownWidgetRuntime();
      return;
    }
    syncLinkedInEasyApplyAction();
    if (location.href !== lastUrl) {
      document.dispatchEvent(new Event('tmo-page-context-changed'));
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
    } else if (hasPortalPageMutation(records)) {
      scheduleInject();
      runSuccessCheckDebounced();
    }
  });
  observer.observe(document.body, { childList: true, characterData: true, attributes: true, attributeFilter: ['open'], subtree: true });
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
  widgetRefreshRevision += 1;
  widgetA11yObserver?.disconnect();
  widgetA11yObserver = null;
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
  if (message?.type === 'TMO_PREFILL_SAVED_RESUME') {
    if (window.top !== window.self || _sender.url !== chrome.runtime.getURL('sidepanel.html')) return false;
    const sameJob = typeof message.jobUrl === 'string' && jobUrlsReferToSameJob(message.jobUrl,window.location.href);
    const prefillButton = document.getElementById(WIDGET_ROOT_ID)?.querySelector<HTMLButtonElement>('.tmo-prefill-button');
    if (!sameJob || !prefillButton || prefillButton.disabled) { sendResponse({ok:false}); return false; }
    // Fail closed if the card is stale: don't fill with a different version than displayed.
    void chrome.runtime.sendMessage({type:'RESOLVE_V1_PREFILL_PAYLOAD',discardRejectedArtifact:false,
      request:{now:new Date().toISOString(),jobContext:{jobUrl:window.location.href,companyName:'',roleTitle:''}},
    }).then((resolved:V1PrefillPayloadResponse)=>{
      if (!resolved?.ok || resolved.source !== 'generated_resume' || resolved.artifactId !== message.artifactId ||
          !prefillButton.isConnected || prefillButton.disabled || !jobUrlsReferToSameJob(message.jobUrl,window.location.href)) {
        sendResponse({ok:false}); return;
      }
      // Reuse the explicit-click flow, including private answers, undo and form review.
      prefillButton.click();
      sendResponse({ok:true});
    }).catch(()=>sendResponse({ok:false}));
    return true;
  }
  // The side panel asks the page for its job context on open and on tab switch.
  // Only the top frame answers, so an iframe cannot shadow the real posting.
  if (message?.type === 'TMO_GET_JOB_CONTEXT') {
    if (window.top !== window.self) return false;
    const job = getJobInfo();
    const requestedPageUrl = window.location.href;
    void resolveJobDescriptionDetails(requestedPageUrl).then((description) => {
      if (window.location.href !== requestedPageUrl) { sendResponse(null); return; }
      sendResponse({
        roleTitle: job?.role_title ?? '',
        companyName: job?.company_name ?? '',
        jobUrl: job?.job_url ?? window.location.href,
        pageUrl: window.location.href,
        applicationId: job ? trackerApplicationIdFor(job) : undefined,
        jobDescription: description.text,
        jobDescriptionSource: description.source,
        jobDescriptionSourceUrl: description.sourceUrl,
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
  void withPrefillUndo(() => withPrefillModeGuard(message.continuous === true, async shouldContinue => {
    await runPrefill({
      resume: prefill.resume,
      coverLetter: prefill.coverLetter,
      generatedContentHash: prefill.generatedContentHash,
      snapshot: prefill.snapshot,
      profileFallback: prefill.profileFallback,
      autofillSkills: prefill.autofillSkills === true,
      quietResultToast: prefill.quietResultToast === true,
      quietIfNoForm: true,
      animateFields: message.continuous !== true,
      shouldContinue,
    });
    if (sensitiveAnswers && shouldContinue()) {
      await fillConfirmedSensitiveAnswers(
        findApplicationForm() ?? document,
        sensitiveAnswers,
        shouldContinue,
      );
    }
  }), message.undoRunId).then(() => sendResponse({ ok: true }))
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
