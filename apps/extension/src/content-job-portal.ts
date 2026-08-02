/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows a sticky, collapsible
 * side widget when a listing is detected, offering: Prefill application, Save to
 * tracker, and AI analysis. Close menu can hide it for this visit / this
 * site / all sites. Auto-adds job to TrackMyOPT on application-success pages.
 */

import { RESUME_TEMPLATES_FOR_PANEL } from './agent/panel-templates';
import { hardenInteractiveElements, ensureWidgetAnnouncer } from './design/a11y';

/** Set once the widget mounts; announces status to screen readers. */
let announceWidgetStatus: (message: string) => void = () => {};
import {
  isCareerPage,
  isKnownJobBoardOrAts,
  CAREER_PATH_RE,
} from './career-sites';
import {
  runPrefill,
  jumpToPrefillField,
  findApplicationForm,
  getPrefillCandidateSignature,
  type GeneratedResumeAttachment,
  type PrefillOptions,
  type PrefillCoverageResult,
  getLabelText,
} from './easy-apply-engine';
import { openFeedbackModal } from './feedback';
import { icon } from './icons';
import { API_ENDPOINTS, WEBSITE_URL } from './config';
import {
  buildWorkdayCxsJobUrl,
  chooseJobDescriptionCandidate,
  deriveJobListingUrl,
  extractWorkdayJobDescriptionFromCxs,
  jobDescriptionCacheKey,
  looksLikeRealJobPostingText,
  shouldFetchListingJobDescription,
  type JobDescriptionCandidate,
} from './job-description';
import { classifySponsorship, type SponsorshipResult } from './sponsorship-signal';
import { buildJobSaveSnapshot } from './job-save-snapshot';
import {
  buildScoreComparison,
  formatDuplicateApplicationNotice,
  jobMemoryKey,
  normalizeOptClockNudge,
  recordSeenJob,
  type DuplicateApplicationNotice,
} from './smart-flow';
import {
  buildWidgetThemeCss,
  isDarkCssColor,
  normalizeWidgetAnalyticsProperties,
  widgetSiteFamily,
  type WidgetAnalyticsEvent,
  type WidgetAnalyticsProperties,
} from './widget-platform';
import {
  jobUrlsReferToSameJob,
  normalizeJobIdentityText,
  type BasicContactProfile,
  type GeneratedResumeArtifactV1,
  type JobContextIdentity,
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
  formatPrefillCoverageSummary,
} from './prefill-coverage';
import {
  AUTOFILL_PREFERENCES_KEY,
  DEFAULT_AUTOFILL_PREFERENCES,
  normalizeAutofillPreferences,
  type AutofillPreferences,
} from './autofill-preferences';
import { shouldRunContinuousPrefill } from './continuous-prefill';
import { mountCoverLetterReviewUi } from './cover-letter-review';
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
  type PrefillArtifactStateReason,
  type PrefillSourceType,
} from './prefill-telemetry';
import { autofillErrorCopy } from './autofill-errors';
import {
  runGuidedNavigation,
  type GuidedNavigationResult,
} from './guided-autopilot';
import {
  fillConfirmedSensitiveAnswers,
  normalizeSavedPrivateApplicationAnswers,
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
  createPrivateApprovalBinding,
  type PrivateApprovalBinding,
} from './private-approval-session';

const SESSION_KEYS = {
  LAST_JOB_CONTEXT: 'tmo_last_job_context',
  LAST_AUTO_ADDED: 'tmo_last_auto_added',
} as const;

const WIDGET_ROOT_ID = 'tmo-job-tracker-widget';
const WIDGET_DISMISSED_URL_KEY = 'tmo_job_widget_dismissed_url';
const WIDGET_POS_KEY = 'tmo_job_widget_pos';
const WIDGET_COLLAPSED_KEY = 'tmo_job_widget_collapsed';
// chrome.storage.local: { all?: boolean; domains?: string[] } — persists across visits.
const WIDGET_HIDE_KEY = 'tmo_widget_hidden';
const WIDGET_HIDE_SESSION_KEY = 'tmo_job_widget_hide_session';
const POST_SAVE_SUGGESTION_SEEN_KEY = 'tmo_post_save_suggestions_seen_v1';
const WIDGET_THEME_STYLE_ID = 'tmo-widget-theme-tokens';
const WIDGET_THEME_SCOPE_CLASS = 'tmo-widget-theme-scope';
const ARTIFACT_STALE_BANNER_CLASS = 'tmo-artifact-stale-banner';
const ARTIFACT_INACTIVE_FALLBACK_CLASS = 'tmo-artifact-inactive-fallback';

type WidgetHideConfig = { all?: boolean; domains?: string[] };

type LastResumeGenerationRequest = {
  job: JobInfo;
  resumeId: string;
  templateId: string;
  jobDescription: string;
  focusKeywords: string[];
  baselineScore?: number;
};

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
let lastResumeGenerationRequest: LastResumeGenerationRequest | null = null;
let regenerationRecheckPending = false;
let latestJobFitScore: { jobFingerprint: string; score: number } | null = null;
let currentAutofillPreferences: AutofillPreferences = { ...DEFAULT_AUTOFILL_PREFERENCES };
let currentPlanEntitlements: Readonly<AutofillPlanEntitlements> =
  FREE_AUTOFILL_PLAN_ENTITLEMENTS;
let widgetViewportResizeObserver: ResizeObserver | null = null;
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

function selectField(
  label: string,
  options: Array<[string, string]>
): { wrapper: HTMLLabelElement; control: HTMLSelectElement } {
  const wrapper = document.createElement('label');
  wrapper.style.cssText =
    'display:grid;gap:3px;color:var(--tmo-widget-ink);font-size:10.5px;font-weight:700;';
  wrapper.append(label);
  const control = document.createElement('select');
  control.style.cssText =
    'width:100%;min-height:32px;padding:5px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:11px;';
  for (const [value, text] of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    control.appendChild(option);
  }
  wrapper.appendChild(control);
  return { wrapper, control };
}

function textField(
  label: string,
  type: 'text' | 'date' = 'text',
  placeholder = ''
): { wrapper: HTMLLabelElement; control: HTMLInputElement } {
  const wrapper = document.createElement('label');
  wrapper.style.cssText =
    'display:grid;gap:3px;color:var(--tmo-widget-ink);font-size:10.5px;font-weight:700;';
  wrapper.append(label);
  const control = document.createElement('input');
  control.type = type;
  control.placeholder = placeholder;
  control.autocomplete = 'off';
  control.style.cssText =
    'box-sizing:border-box;width:100%;min-height:32px;padding:5px 7px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:11px;';
  wrapper.appendChild(control);
  return { wrapper, control };
}

function createSensitiveAnswerPanel(job: JobInfo): HTMLElement {
  const panelApprovalBinding = createPrivateApprovalBinding(jobContextFor(job));
  const section = document.createElement('section');
  section.className = 'tmo-sensitive-answer-panel';
  section.style.cssText =
    'border-top:1px solid var(--tmo-widget-border);padding:9px 11px;background:var(--tmo-widget-surface-2);';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'Private answers (review required)';
  toggle.style.cssText =
    'width:100%;padding:0;border:0;background:transparent;color:var(--tmo-widget-ink);font:inherit;font-size:11px;font-weight:800;text-align:left;cursor:pointer;';
  const body = document.createElement('div');
  body.hidden = true;
  body.style.cssText = 'display:none;gap:7px;margin-top:8px;';
  const note = document.createElement('p');
  note.textContent =
    'Saved answers and your shared default job-portal login load here for review. Passwords stay masked. TrackMyOPT never sends them to AI or analytics and never submits the application.';
  note.style.cssText =
    'margin:0;color:var(--tmo-widget-muted);font-size:10.5px;line-height:1.4;';
  const manageSavedData = document.createElement('button');
  manageSavedData.type = 'button';
  manageSavedData.textContent = 'Manage saved prefill data';
  manageSavedData.style.cssText =
    'min-height:34px;padding:6px 8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-accent);font:inherit;font-size:11px;font-weight:800;text-align:left;cursor:pointer;';
  manageSavedData.addEventListener('click', () => {
    window.open(
      API_ENDPOINTS.DASHBOARD_JOB_PREFILL,
      '_blank',
      'noopener,noreferrer'
    );
  });
  const portalLoginSummary = document.createElement('p');
  portalLoginSummary.style.cssText =
    'margin:0;padding:7px 8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-muted);font-size:10.5px;line-height:1.4;';
  portalLoginSummary.textContent =
    'No approved default job-portal login is loaded.';
  let loadedJobPortalLogin: JobPortalLoginCredential | null = null;

  const yesNoOptions: Array<[string, string]> = [
    ['', 'Leave unanswered'],
    ['yes', 'Yes'],
    ['no', 'No'],
  ];
  const workAuth = selectField('Authorized to work?', yesNoOptions);
  const sponsorship = selectField('Need sponsorship now or later?', yesNoOptions);
  const visaType = selectField('Visa / work status', [
    ['', 'Leave unanswered'],
    ['us_citizen', 'U.S. citizen'],
    ['permanent_resident', 'Permanent resident'],
    ['h1b', 'H-1B'],
    ['f1_student', 'F-1 student'],
    ['opt', 'OPT'],
    ['cpt', 'CPT'],
    ['j1', 'J-1'],
    ['l1', 'L-1'],
    ['o1', 'O-1'],
    ['tn', 'TN'],
    ['e3', 'E-3'],
    ['other', 'Other'],
  ]);
  const visaOther = textField(
    'Other visa / work status',
    'text',
    'Exact status if Other'
  );
  const citizenship = textField('Citizenship', 'text', 'Exact answer to use');
  const annualSalary = textField(
    'Expected annual salary',
    'text',
    'Example: $120,000'
  );
  const hourlyRate = textField(
    'Expected hourly rate',
    'text',
    'Example: $58'
  );
  const inPerson = selectField('Can work in-person?', yesNoOptions);
  const relocate = selectField('Willing to relocate?', yesNoOptions);
  const startImmediately = selectField('Can start immediately?', yesNoOptions);
  const transportation = selectField(
    'Has reliable transportation?',
    yesNoOptions
  );
  const accommodations = selectField('Needs accommodations?', yesNoOptions);
  const dob = textField('Date of birth', 'date');
  const sexGender = selectField('Sex / gender', [
    ['', 'Leave unanswered'],
    ['female', 'Female'],
    ['male', 'Male'],
    ['non_binary', 'Non-binary'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const raceEthnicity = selectField('Race / ethnicity', [
    ['', 'Leave unanswered'],
    ['american_indian_or_alaska_native', 'American Indian or Alaska Native'],
    ['asian', 'Asian'],
    ['black_or_african_american', 'Black or African American'],
    ['hispanic_or_latino', 'Hispanic or Latino'],
    ['native_hawaiian_or_pacific_islander', 'Native Hawaiian or Pacific Islander'],
    ['white', 'White'],
    ['two_or_more_races', 'Two or more races'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const hispanicLatino = selectField('Hispanic or Latino?', [
    ['', 'Leave unanswered'],
    ['yes', 'Yes'],
    ['no', 'No'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const veteranStatus = selectField('Veteran status', [
    ['', 'Leave unanswered'],
    ['not_protected_veteran', 'Not a protected veteran'],
    ['protected_veteran', 'Protected veteran'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const disabilityStatus = selectField('Disability status', [
    ['', 'Leave unanswered'],
    ['yes', 'Yes'],
    ['no', 'No'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const eeo = selectField('EEO questions', [
    ['', 'Leave unanswered'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const save = document.createElement('button');
  save.type = 'button';
  save.textContent = 'Review and use for this application';
  save.style.cssText =
    // on-accent, not white: the dark-theme accent is a light teal, against
    // which white text is unreadable.
    'min-height:34px;padding:6px 8px;border:0;border-radius:7px;background:var(--tmo-widget-accent);color:var(--tmo-color-on-accent);font:inherit;font-size:11px;font-weight:800;cursor:pointer;';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.style.cssText =
    'margin:0;color:var(--tmo-widget-success-ink);font-size:10.5px;font-weight:700;';

  let savedAnswersRequested = false;
  const loadSavedAnswersForReview = () => {
    if (savedAnswersRequested) return;
    savedAnswersRequested = true;
    chrome.runtime.sendMessage(
      { type: 'GET_PRIVATE_APPLICATION_ANSWERS' },
      (response?: { ok?: boolean; data?: unknown }) => {
        if (chrome.runtime.lastError || !response?.ok) {
          savedAnswersRequested = false;
          return;
        }
        if (!response.data) return;
        const saved = normalizeSavedPrivateApplicationAnswers(response.data);
        if (!saved) return;
        loadedJobPortalLogin = saved.defaultJobPortalLogin ?? null;
        portalLoginSummary.textContent = loadedJobPortalLogin
          ? `Default job-portal login ready for this application: ${loadedJobPortalLogin.email}. Password: ••••••••`
          : 'No default job-portal login is saved. Add one in TrackMyOPT.';
        workAuth.control.value = saved.workAuthorization ?? '';
        sponsorship.control.value = saved.requiresSponsorship ?? '';
        visaType.control.value = saved.visaType ?? (
          saved.visaStatus ? 'other' : ''
        );
        visaOther.control.value =
          saved.visaOther ?? saved.visaStatus ?? '';
        citizenship.control.value = saved.citizenship ?? '';
        annualSalary.control.value =
          saved.expectedAnnualSalary ?? saved.salaryExpectation ?? '';
        hourlyRate.control.value = saved.expectedHourlyRate ?? '';
        inPerson.control.value = saved.canWorkInPerson ?? '';
        relocate.control.value = saved.willingToRelocate ?? '';
        startImmediately.control.value = saved.canStartImmediately ?? '';
        transportation.control.value = saved.reliableTransportation ?? '';
        accommodations.control.value = saved.needsAccommodations ?? '';
        dob.control.value = saved.dateOfBirth ?? '';
        sexGender.control.value = saved.sexGender ?? '';
        hispanicLatino.control.value = saved.hispanicLatino ?? '';
        raceEthnicity.control.value = saved.raceEthnicity ?? '';
        veteranStatus.control.value = saved.veteranStatus ?? '';
        disabilityStatus.control.value = saved.disabilityStatus ?? '';
        eeo.control.value = saved.eeoPreference ?? '';
        status.textContent =
          'Saved answers loaded. Review them, then approve for this application.';
      }
    );
  };

  toggle.addEventListener('click', () => {
    body.hidden = !body.hidden;
    body.style.display = body.hidden ? 'none' : 'grid';
    if (!body.hidden) loadSavedAnswersForReview();
  });
  save.addEventListener('click', () => {
    const currentJob = getJobInfo();
    if (
      !currentJob ||
      !approvalMatchesJob(panelApprovalBinding, jobContextFor(currentJob))
    ) {
      loadedJobPortalLogin = null;
      clearPrivateApplicationApproval();
      status.textContent =
        'This application changed. Review the private answers again for the current job.';
      return;
    }
    approvedJobPortalLogin = loadedJobPortalLogin;
    sensitiveAnswerSession = {
      confirmed: true,
      ...(workAuth.control.value
        ? { workAuthorization: workAuth.control.value as 'yes' | 'no' }
        : {}),
      ...(sponsorship.control.value
        ? { requiresSponsorship: sponsorship.control.value as 'yes' | 'no' }
        : {}),
      ...(visaType.control.value
        ? {
            visaType: visaType.control
              .value as SensitiveAnswerSession['visaType'],
          }
        : {}),
      ...(visaOther.control.value.trim()
        ? { visaOther: visaOther.control.value.trim() }
        : {}),
      ...(citizenship.control.value.trim()
        ? { citizenship: citizenship.control.value.trim() }
        : {}),
      ...(annualSalary.control.value.trim()
        ? { expectedAnnualSalary: annualSalary.control.value.trim() }
        : {}),
      ...(hourlyRate.control.value.trim()
        ? { expectedHourlyRate: hourlyRate.control.value.trim() }
        : {}),
      ...(inPerson.control.value
        ? {
            canWorkInPerson: inPerson.control.value as 'yes' | 'no',
          }
        : {}),
      ...(relocate.control.value
        ? {
            willingToRelocate: relocate.control.value as 'yes' | 'no',
          }
        : {}),
      ...(startImmediately.control.value
        ? {
            canStartImmediately: startImmediately.control.value as 'yes' | 'no',
          }
        : {}),
      ...(transportation.control.value
        ? {
            reliableTransportation: transportation.control.value as
              | 'yes'
              | 'no',
          }
        : {}),
      ...(accommodations.control.value
        ? {
            needsAccommodations: accommodations.control.value as 'yes' | 'no',
          }
        : {}),
      ...(dob.control.value ? { dateOfBirth: dob.control.value } : {}),
      ...(sexGender.control.value
        ? {
            sexGender: sexGender.control
              .value as SensitiveAnswerSession['sexGender'],
          }
        : {}),
      ...(hispanicLatino.control.value
        ? {
            hispanicLatino: hispanicLatino.control
              .value as SensitiveAnswerSession['hispanicLatino'],
          }
        : {}),
      ...(raceEthnicity.control.value
        ? {
            raceEthnicity: raceEthnicity.control
              .value as SensitiveAnswerSession['raceEthnicity'],
          }
        : {}),
      ...(veteranStatus.control.value
        ? {
            veteranStatus: veteranStatus.control
              .value as SensitiveAnswerSession['veteranStatus'],
          }
        : {}),
      ...(disabilityStatus.control.value
        ? {
            disabilityStatus: disabilityStatus.control
              .value as SensitiveAnswerSession['disabilityStatus'],
          }
        : {}),
      ...(eeo.control.value === 'prefer_not_to_answer'
        ? { eeoPreference: 'prefer_not_to_answer' as const }
        : {}),
    };
    privateApprovalBinding = panelApprovalBinding;
    status.textContent =
      approvedJobPortalLogin
        ? 'Approved for this application. Prefill can use the masked portal login and these exact answers.'
        : 'Approved for this application. Prefill can use these exact answers.';
    previousContinuousSignature = '';
    scheduleContinuousPrefill();
  });

  body.append(
    note,
    manageSavedData,
    portalLoginSummary,
    workAuth.wrapper,
    sponsorship.wrapper,
    visaType.wrapper,
    visaOther.wrapper,
    citizenship.wrapper,
    annualSalary.wrapper,
    hourlyRate.wrapper,
    inPerson.wrapper,
    relocate.wrapper,
    startImmediately.wrapper,
    transportation.wrapper,
    accommodations.wrapper,
    dob.wrapper,
    sexGender.wrapper,
    hispanicLatino.wrapper,
    raceEthnicity.wrapper,
    veteranStatus.wrapper,
    disabilityStatus.wrapper,
    eeo.wrapper,
    save,
    status
  );
  section.append(toggle, body);

  return section;
}

function currentSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function ensureWidgetThemeStyles(): void {
  if (document.getElementById(WIDGET_THEME_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = WIDGET_THEME_STYLE_ID;
  style.textContent = buildWidgetThemeCss(`.${WIDGET_THEME_SCOPE_CLASS}`);
  (document.head || document.documentElement).appendChild(style);
}

function applyWidgetThemeScope(element: HTMLElement): void {
  ensureWidgetThemeStyles();
  element.classList.add(WIDGET_THEME_SCOPE_CLASS);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const bodyColor = document.body ? getComputedStyle(document.body).backgroundColor : '';
  const documentColor = getComputedStyle(document.documentElement).backgroundColor;
  if (prefersDark || isDarkCssColor(bodyColor) || isDarkCssColor(documentColor)) {
    element.dataset.tmoTheme = 'dark';
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

function jobFingerprint(job: JobInfo): string {
  const url = new URL(window.location.href);
  url.hash = '';
  return [
    url.toString(),
    (job.company_name || '').trim().toLowerCase(),
    (job.role_title || '').trim().toLowerCase(),
  ].join('|');
}

function jobContextFor(job: JobInfo): JobContextIdentity {
  return {
    jobUrl: window.location.href,
    companyName: job.company_name || '',
    roleTitle: job.role_title || '',
  };
}

function generatedResumeFilename(job: JobInfo): string {
  const safeCompany = (job.company_name || 'company')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  return `TrackMyOPT-resume-${safeCompany}.pdf`;
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
  const label = prefillButton.querySelector<HTMLElement>('.tmo-action-label');
  if (artifactAvailable) {
    if (label) label.textContent = 'Prefill application + resume';
    prefillButton.title =
      'Prefill profile fields and attach the custom resume generated for this job';
    // Side-panel generate does not push PDF bytes into this tab. Force Continuous
    // (or the next Prefill click) to re-resolve so the file input gets attached.
    previousContinuousSignature = '';
    if (currentAutofillPreferences.mode === 'continuous') {
      scheduleContinuousPrefill();
    }
  } else {
    if (label) label.textContent = 'Prefill application';
    prefillButton.title = 'Prefill available profile fields for this application';
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

type PrefillExecutionResult = {
  result: PrefillCoverageResult;
  hasResume: boolean;
  hasCoverLetter: boolean;
  jobDescription?: string;
  sourceType: PrefillSourceType;
  artifactStateReason: PrefillArtifactStateReason;
  stoppedReason?: 'expired' | 'job_changed' | 'invalid';
};

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

function paintPrefillCoverage(
  line: HTMLElement,
  result: PrefillCoverageResult,
): void {
  line.textContent = '';
  const scan = result.applicationScan;
  const scannedFieldCount =
    (scan?.requiredTotal ?? 0) + (scan?.optionalTotal ?? 0);
  if (result.total === 0 && scannedFieldCount === 0) {
    line.style.display = 'none';
    return;
  }
  line.style.display = 'block';

  if (scan && scannedFieldCount > 0) {
    const scanHeader = document.createElement('div');
    scanHeader.style.cssText =
      'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;color:var(--tmo-widget-text);';
    const scanTitle = document.createElement('strong');
    scanTitle.textContent = 'TrackMyOPT scanned this page';
    scanTitle.style.cssText = 'font-size:12px;line-height:1.35;';
    const percent = document.createElement('strong');
    percent.textContent = `${scan.requiredPercent}%`;
    percent.style.cssText =
      `font-size:12px;color:${scan.unansweredRequired === 0 ? 'var(--tmo-color-success-ink)' : 'var(--tmo-color-warning-ink)'};`;
    scanHeader.append(scanTitle, percent);
    line.appendChild(scanHeader);

    const count = document.createElement('div');
    count.textContent =
      `${scan.requiredFilled}/${scan.requiredTotal} required fields filled`;
    count.style.cssText =
      'margin-top:3px;color:var(--tmo-widget-muted);font-size:11.5px;';
    line.appendChild(count);

    const track = document.createElement('div');
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', String(scan.requiredPercent));
    track.setAttribute(
      'aria-label',
      `${scan.requiredFilled} of ${scan.requiredTotal} required fields filled`
    );
    track.style.cssText =
      'height:6px;margin-top:7px;overflow:hidden;border-radius:999px;background:#dbe4f0;';
    const fill = document.createElement('div');
    fill.style.cssText =
      `height:100%;width:${scan.requiredPercent}%;border-radius:inherit;background:` +
      (scan.unansweredRequired === 0
        ? 'linear-gradient(90deg,#10b981,#059669);'
        : 'linear-gradient(90deg,#2563eb,#0ea5e9);');
    track.appendChild(fill);
    line.appendChild(track);

    const appendFieldGroup = (
      title: string,
      fields: typeof scan.required
    ) => {
      if (fields.length === 0) return;
      const details = document.createElement('details');
      details.style.cssText =
        'margin-top:7px;border-top:1px solid var(--tmo-widget-border);padding-top:6px;';
      const detailsSummary = document.createElement('summary');
      detailsSummary.textContent = `${title} (${fields.length})`;
      detailsSummary.style.cssText =
        'cursor:pointer;color:var(--tmo-widget-text);font-weight:800;';
      details.appendChild(detailsSummary);
      const list = document.createElement('div');
      list.style.cssText =
        'display:grid;gap:4px;margin-top:6px;max-height:154px;overflow:auto;padding-right:2px;';
      for (const field of fields) {
        const item = document.createElement('div');
        item.style.cssText =
          'display:flex;align-items:flex-start;justify-content:space-between;gap:8px;';
        const label = document.createElement('span');
        label.textContent = field.label;
        label.style.cssText =
          'min-width:0;overflow-wrap:anywhere;color:var(--tmo-widget-text);';
        const state = document.createElement('span');
        state.textContent = field.filled
          ? '✓ Filled'
          : field.required
            ? 'Needs you'
            : 'Optional';
        state.style.cssText =
          `flex:0 0 auto;font-weight:800;color:${
            field.filled ? 'var(--tmo-color-success-ink)' : field.required ? 'var(--tmo-color-warning-ink)' : 'var(--tmo-widget-muted)'
          };`;
        item.append(label, state);
        list.appendChild(item);
      }
      details.appendChild(list);
      line.appendChild(details);
    };

    appendFieldGroup('Required', scan.required);
    appendFieldGroup('Optional', scan.optional);
  }

  const summary = document.createElement('span');
  summary.textContent = formatPrefillCoverageSummary(result);
  summary.style.cssText =
    `display:block;${scan && scannedFieldCount > 0 ? 'margin-top:7px;' : ''}`;
  line.appendChild(summary);
  if (result.skipped > 0 && result.firstSkippedSelector) {
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.textContent = 'Jump to first';
    jump.style.cssText =
      'padding:0;border:0;background:transparent;color:var(--tmo-color-warning-ink);font:inherit;font-weight:800;text-decoration:underline;cursor:pointer;';
    jump.addEventListener('click', () => {
      jumpToPrefillField(result.firstSkippedSelector || '');
    });
    line.append('—');
    line.appendChild(jump);
  }
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
            lastResumeGenerationRequest?.jobDescription ||
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

function rememberJobFitScore(job: JobInfo, score: number): void {
  if (!Number.isFinite(score)) return;
  latestJobFitScore = {
    jobFingerprint: jobFingerprint(job),
    score: Math.max(0, Math.min(100, score)),
  };
}

function rememberedJobFitScore(job: JobInfo): number | undefined {
  return latestJobFitScore?.jobFingerprint === jobFingerprint(job)
    ? latestJobFitScore.score
    : undefined;
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

type WidgetJobSnapshot = Pick<JobInfo,
  'company_name' | 'role_title' | 'job_url' | 'location' | 'salary_text' | 'company_logo_url'>;

function widgetJobSnapshot(job: JobInfo): WidgetJobSnapshot {
  return {
    company_name: job.company_name,
    role_title: job.role_title,
    job_url: job.job_url,
    location: job.location,
    salary_text: job.salary_text,
    company_logo_url: job.company_logo_url,
  };
}

function shouldRefreshWidget(existing: HTMLElement, nextJob: JobInfo): boolean {
  let current: Partial<WidgetJobSnapshot> = {};
  try {
    current = JSON.parse(existing.dataset.tmoJobSnapshot || '{}') as Partial<WidgetJobSnapshot>;
  } catch {
    return true;
  }
  const next = widgetJobSnapshot(nextJob);
  if (
    current.job_url !== next.job_url ||
    current.company_name !== next.company_name ||
    current.role_title !== next.role_title
  ) return true;

  // Replace an already-rendered card only when the new parse enriches missing
  // information. Never downgrade a complete card during transient SPA states.
  return Boolean(
    (!current.location && next.location) ||
    (!current.salary_text && next.salary_text) ||
    (!current.company_logo_url && next.company_logo_url)
  );
}

/**
 * True while the user is mid-interaction: a resume is generating (or its result
 * is on screen), the AI-analysis or resume-template modal is open, or the
 * save-status dialog is up. SPA route churn on job boards like Workday must
 * never tear the widget down during these — that would destroy work in progress
 * (e.g. a running resume generation) or a result the user is still reading.
 */
function isWidgetInteractionInFlight(): boolean {
  if (document.getElementById('tmo-resume-chooser')) return true;
  if (document.getElementById('tmo-ai-analysis')) return true;
  if (document.getElementById('tmo-application-status-dialog')) return true;
  const widget = document.getElementById(WIDGET_ROOT_ID);
  return !!widget?.querySelector('.' + RESUME_PANEL_CLASS);
}

async function getHideConfig(): Promise<WidgetHideConfig> {
  try {
    const s = await chrome.storage.local.get(WIDGET_HIDE_KEY);
    return (s[WIDGET_HIDE_KEY] as WidgetHideConfig) || {};
  } catch {
    return {};
  }
}

/** True when the widget should stay hidden here (this-visit / this-site / all-sites). */
async function isWidgetSuppressed(): Promise<boolean> {
  try {
    if (sessionStorage.getItem(WIDGET_HIDE_SESSION_KEY) === '1') return true;
  } catch {
    /* ignore */
  }
  const cfg = await getHideConfig();
  if (cfg.all) return true;
  if (Array.isArray(cfg.domains) && cfg.domains.includes(location.hostname)) return true;
  return false;
}

function hideForThisVisit() {
  try {
    sessionStorage.setItem(WIDGET_HIDE_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

async function hideForThisSite() {
  const cfg = await getHideConfig();
  const domains = new Set(cfg.domains || []);
  domains.add(location.hostname);
  try {
    await chrome.storage.local.set({ [WIDGET_HIDE_KEY]: { ...cfg, domains: [...domains] } });
  } catch {
    /* ignore */
  }
}

async function hideForAllSites() {
  const cfg = await getHideConfig();
  try {
    await chrome.storage.local.set({ [WIDGET_HIDE_KEY]: { ...cfg, all: true } });
  } catch {
    /* ignore */
  }
}

/**
 * Explicit per-session collapse override (set only once the user manually
 * toggles collapse/expand on THIS origin, this tab). null = no override yet,
 * so the widget should fall back to the persisted default-view setting.
 */
function readSessionCollapsedOverride(): boolean | null {
  try {
    const v = sessionStorage.getItem(WIDGET_COLLAPSED_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
    return null;
  } catch {
    return null;
  }
}

function setCollapsedPref(collapsed: boolean) {
  try {
    sessionStorage.setItem(WIDGET_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function clearSessionCollapsedOverride() {
  try {
    sessionStorage.removeItem(WIDGET_COLLAPSED_KEY);
  } catch {
    /* ignore */
  }
}

type DefaultView = 'expanded' | 'minimized';
// chrome.storage.local: 'expanded' | 'minimized' — persists across sites/visits,
// set from the widget's Settings panel.
const WIDGET_DEFAULT_VIEW_KEY = 'tmo_widget_default_view';

async function getDefaultViewPref(): Promise<DefaultView> {
  try {
    const s = await chrome.storage.local.get(WIDGET_DEFAULT_VIEW_KEY);
    return s[WIDGET_DEFAULT_VIEW_KEY] === 'minimized' ? 'minimized' : 'expanded';
  } catch {
    return 'expanded';
  }
}

async function setDefaultViewPref(view: DefaultView): Promise<void> {
  try {
    await chrome.storage.local.set({ [WIDGET_DEFAULT_VIEW_KEY]: view });
  } catch {
    /* ignore */
  }
}

const AUTO_ADD_DEBOUNCE_MS = 15000; // don't auto-add same job twice within 15 min
const JOB_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000; // use stored context up to 30 min old

interface JobInfo {
  company_name: string;
  role_title: string;
  job_url: string;
  location?: string;
  /** Normalized display-only compensation from JobPosting JSON-LD or visible
   * job-page text. Omitted when the source page does not publish compensation. */
  salary_text?: string;
  /** Plain-text posting snapshot captured before the user leaves the job page. */
  job_description?: string;
  /** Employer logo — from JSON-LD hiringOrganization.logo when present, else the
   * current site's own favicon (we're already on the employer's domain, so its
   * favicon reliably IS the employer's mark). Display-only; never sent to our API. */
  company_logo_url?: string;
}

function formatSalaryAmount(value: unknown): string | null {
  const number = typeof value === 'number'
    ? value
    : Number(String(value ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number).toLocaleString('en-US');
}

function normalizeSalaryUnit(value: unknown): string {
  const unit = String(value ?? '').trim().toLowerCase();
  if (/hour|hr/.test(unit)) return 'hour';
  if (/month|mo/.test(unit)) return 'month';
  if (/week|wk/.test(unit)) return 'week';
  if (/day/.test(unit)) return 'day';
  return 'year';
}

function salaryTextFromJobPosting(obj: Record<string, unknown>): string | undefined {
  const base = obj.baseSalary as Record<string, unknown> | string | number | undefined;
  if (typeof base === 'string') return salaryTextFromVisibleText(base);
  if (typeof base === 'number') {
    const amount = formatSalaryAmount(base);
    return amount ? `$${amount} USD / year` : undefined;
  }
  if (!base || typeof base !== 'object') return undefined;

  const currency = String(base.currency || 'USD').toUpperCase();
  const rawValue = base.value as Record<string, unknown> | string | number | undefined;
  if (rawValue && typeof rawValue === 'object') {
    const min = formatSalaryAmount(rawValue.minValue);
    const max = formatSalaryAmount(rawValue.maxValue);
    const exact = formatSalaryAmount(rawValue.value);
    const unit = normalizeSalaryUnit(rawValue.unitText || base.unitText);
    if (min && max) return `$${min} - $${max} ${currency} / ${unit}`;
    if (exact) return `$${exact} ${currency} / ${unit}`;
  }
  const amount = formatSalaryAmount(rawValue);
  return amount ? `$${amount} ${currency} / ${normalizeSalaryUnit(base.unitText)}` : undefined;
}

function salaryTextFromVisibleText(text: string): string | undefined {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  const range = compact.match(
    /(?:USD\s*)?\$\s*([\d,]+(?:\.\d{1,2})?)\s*(?:-|–|—|to)\s*(?:USD\s*)?\$\s*([\d,]+(?:\.\d{1,2})?)/i,
  );
  if (!range) return undefined;
  const min = formatSalaryAmount(range[1]);
  const max = formatSalaryAmount(range[2]);
  if (!min || !max) return undefined;
  const unitMatch = compact.match(/(?:\/|per\s+)(yr|year|hour|hr|month|mo|week|wk|day)s?\b/i);
  return `$${min} - $${max} USD / ${normalizeSalaryUnit(unitMatch?.[1])}`;
}

function isHttpDocument(): boolean {
  return location.protocol === 'http:' || location.protocol === 'https:';
}

function hasJobPostingJsonLdSnippet(): boolean {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const t = scripts[i].textContent || '';
    if (/JobPosting/i.test(t) && /hiringOrganization|title/i.test(t)) return true;
  }
  return false;
}

/**
 * Known job boards and ATS portals render jobs via SPAs, so they get the full
 * MutationObserver + retry loop. Generic career pages (company /careers paths,
 * career subdomains) use a lighter timed-retry approach.
 */
function shouldUseFullJobAssistMode(): boolean {
  if (isKnownJobBoardOrAts()) return true;
  if (hasJobPostingJsonLdSnippet()) return true;
  const pathAndSearch = location.pathname + (location.search || '');
  if (CAREER_PATH_RE.test(pathAndSearch)) return true;
  return false;
}

// Phrases that indicate "application submitted" success (case-insensitive)
const APPLICATION_SUCCESS_PATTERNS = [
  /congratulat/i,
  /application\s+(submitted|received|sent|successful)/i,
  /thank\s+you\s+for\s+applying/i,
  /your\s+application\s+has\s+been\s+(sent|submitted|received)/i,
  /we've\s+received\s+your\s+application/i,
  /we\s+have\s+received\s+your\s+application/i,
  /successfully\s+applied/i,
  /you've\s+applied\s+to/i,
  /you\s+have\s+applied\s+to/i,
  /application\s+complete/i,
  /application\s+successful/i,
  /your\s+application\s+was\s+submitted/i,
  /submitted\s+successfully/i,
];

function isApplicationSuccessPage(): boolean {
  const text = (document.body?.innerText || document.body?.textContent || '').slice(0, 10000);
  if (!text || text.length < 20) return false;
  for (let i = 0; i < APPLICATION_SUCCESS_PATTERNS.length; i++) {
    if (APPLICATION_SUCCESS_PATTERNS[i].test(text)) return true;
  }
  return false;
}

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

function collectJsonLdObjects(data: unknown, out: Record<string, unknown>[]): void {
  if (!data || typeof data !== 'object') return;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) collectJsonLdObjects(data[i], out);
    return;
  }
  out.push(obj);
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    for (let i = 0; i < obj['@graph'].length; i++) collectJsonLdObjects(obj['@graph'][i], out);
  }
}

function typesIncludeJobPosting(types: unknown): boolean {
  if (types === 'JobPosting') return true;
  if (Array.isArray(types)) {
    return types.some((t) => t === 'JobPosting' || (typeof t === 'string' && /JobPosting/i.test(t)));
  }
  return typeof types === 'string' && /JobPosting/i.test(types);
}

function jobPostingFromLdObject(obj: Record<string, unknown>): JobInfo | null {
  const types = obj['@type'];
  if (!typesIncludeJobPosting(types)) return null;
  const title = (obj.title as string)?.trim();
  const hiringOrg = obj.hiringOrganization as Record<string, unknown> | string | undefined;
  let company = '';
  let companyLogo = '';
  if (typeof hiringOrg === 'string') company = hiringOrg.trim();
  else if (hiringOrg && typeof hiringOrg === 'object') {
    company = ((hiringOrg.name as string) || (hiringOrg.legalName as string) || '').trim();
    // schema.org Organization.logo is either a plain URL string or an ImageObject { url }.
    const logo = hiringOrg.logo as string | Record<string, unknown> | undefined;
    if (typeof logo === 'string') companyLogo = logo.trim();
    else if (logo && typeof logo === 'object') companyLogo = ((logo.url as string) || '').trim();
  }
  const jobLoc = obj.jobLocation as Record<string, unknown> | Record<string, unknown>[] | undefined;
  let location = '';
  if (Array.isArray(jobLoc) && jobLoc.length > 0) {
    const first = jobLoc[0] as Record<string, unknown>;
    location =
      ((first.address as Record<string, unknown>)?.addressLocality as string) ||
      (first.name as string) ||
      '';
  } else if (jobLoc && typeof jobLoc === 'object' && !Array.isArray(jobLoc)) {
    const addr = (jobLoc as Record<string, unknown>).address as Record<string, unknown> | undefined;
    location =
      (addr?.addressLocality as string) || ((jobLoc as Record<string, unknown>).name as string) || '';
  }
  if (title && company) {
    return {
      company_name: company,
      role_title: title,
      job_url: window.location.href,
      location: location?.trim() || undefined,
      salary_text: salaryTextFromJobPosting(obj),
      company_logo_url: companyLogo || undefined,
    };
  }
  return null;
}

function getJsonLdJobPosting(sourceDocument: Document = document): JobInfo | null {
  try {
    const scripts = sourceDocument.querySelectorAll('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const text = script.textContent?.trim();
      if (!text) continue;
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        continue;
      }
      const flat: Record<string, unknown>[] = [];
      collectJsonLdObjects(data, flat);
      for (let j = 0; j < flat.length; j++) {
        const parsed = jobPostingFromLdObject(flat[j]);
        if (parsed) return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function getCompanyFromDomain(hostname: string): string {
  // careers.company.com, jobs.company.com, company.com/careers
  const parts = hostname.replace(/^www\./, '').split('.');
  if (parts.length >= 2) {
    const base = parts[parts.length - 2]; // "company" from careers.company.com
    if (base && !['careers', 'jobs', 'job', 'recruiting', 'talent', 'hire', 'apply'].includes(base.toLowerCase())) {
      return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    }
  }
  if (parts.length >= 1 && parts[0]) {
    const first = parts[0].toLowerCase();
    if (!['www', 'careers', 'jobs', 'job', 'recruiting', 'talent', 'hire', 'apply', 'career'].includes(first)) {
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
  }
  return '';
}

function parseTitleAndCompany(title: string): { role_title: string; company_name: string } | null {
  const t = title.trim();
  if (!t || t.length < 3) return null;
  // "Job Title | Company", "Job Title at Company", "Company - Job Title", "Company: Job Title"
  const at = t.split(/\s+at\s+/i);
  if (at.length === 2) return { role_title: at[0].trim(), company_name: at[1].trim() };
  const pipe = t.split(/\s*\|\s*/);
  if (pipe.length === 2) return { role_title: pipe[0].trim(), company_name: pipe[1].trim() };
  const dash = t.split(/\s*-\s*/);
  if (dash.length === 2) {
    const a = dash[0].trim();
    const b = dash[1].trim();
    if (a.length > 0 && b.length > 0) return { role_title: b, company_name: a };
  }
  const colon = t.split(/\s*:\s*/);
  if (colon.length === 2) return { role_title: colon[1].trim(), company_name: colon[0].trim() };
  return null;
}

function getMetaAndTitleJob(): JobInfo | null {
  const url = window.location.href;
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim();
  const title = document.title?.trim();
  const desc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim();
  const candidate = ogTitle || twitterTitle || title;
  if (!candidate) return null;
  const parsed = parseTitleAndCompany(candidate);
  if (parsed && parsed.role_title.length >= 2 && parsed.company_name.length >= 1) {
    return {
      company_name: parsed.company_name,
      role_title: parsed.role_title,
      job_url: url,
      location: undefined,
    };
  }
  // Use full title as role_title and company from domain
  const companyFromDomain = getCompanyFromDomain(window.location.hostname);
  if (companyFromDomain && candidate.length >= 3) {
    return {
      company_name: companyFromDomain,
      role_title: candidate,
      job_url: url,
      location: undefined,
    };
  }
  return null;
}

function getDomFallbackJob(): JobInfo | null {
  const url = window.location.href;
  const heading =
    document.querySelector('h1') ||
    document.querySelector('[class*="job-title"]') ||
    document.querySelector('h2[class*="title"]');
  const role_title = heading?.textContent?.trim();
  if (!role_title || role_title.length < 2) return null;
  const companyFromDomain = getCompanyFromDomain(window.location.hostname);
  if (!companyFromDomain) return null;
  return {
    company_name: companyFromDomain,
    role_title,
    job_url: url,
    location: undefined,
  };
}

const GENERIC_CAREER_HEADING_RE = /^(career(s)?|career opportunities|job(s)?|job opportunities|job openings|current openings|open positions|employment opportunities|join (our|the) team|work with us|search jobs)$/i;

function cleanRoleCandidate(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function isSpecificRoleTitle(value: string, companyName: string): boolean {
  if (value.length < 3 || value.length > 160) return false;
  if (GENERIC_CAREER_HEADING_RE.test(value)) return false;
  if (value.toLowerCase() === companyName.trim().toLowerCase()) return false;
  if (/^(apply|apply now|job details|position details|description|overview)$/i.test(value)) return false;
  return true;
}

/**
 * Recover the selected role when a generic careers-page title was parsed.
 * Ordered selectors favor explicit ATS job-title signals before headings so a
 * page-wide "Career Opportunities" heading cannot mask the actual role.
 */
function findSpecificRoleFromDom(companyName: string): string | null {
  const selectors = [
    '[data-automation-id="jobPostingHeader"]',
    '[data-testid*="job-title" i]',
    '[data-testid*="jobTitle" i]',
    '[itemprop="title"]',
    '[id*="job-title" i]',
    '[class*="job-title" i]',
    '[class*="jobTitle" i]',
    '[class*="job_title" i]',
    '.iCIMS_JobHeader',
    '.iCIMS_JobTitle',
    '[class*="iCIMS" i] [class*="jobTitle" i]',
    '.posting-headline h1',
    '.posting-headline h2',
    '[aria-current="true"] [class*="title" i]',
    '[aria-selected="true"] [class*="title" i]',
    'main h1',
  ];

  const seen = new Set<Element>();
  for (const selector of selectors) {
    let elements: Element[] = [];
    try {
      elements = Array.from(document.querySelectorAll(selector));
    } catch {
      continue;
    }
    for (const element of elements) {
      if (seen.has(element)) continue;
      seen.add(element);
      const candidate = cleanRoleCandidate(element.textContent);
      if (isSpecificRoleTitle(candidate, companyName)) return candidate;
    }
  }
  return null;
}

// --- Site-specific parsers (higher accuracy when available) ---

function isLinkedInJobSurface(): boolean {
  const path = window.location.pathname;
  const q = window.location.search || '';
  if (/^\/jobs(\/|$)/i.test(path)) return true;
  if (/[?&]currentJobId=\d+/i.test(q)) return true;
  if (/^\/job\//i.test(path)) return true;
  return false;
}

/** Right-hand job pane on LinkedIn search / collections (SPA loads content after idle). */
function linkedInJobDetailsRoots(): Element[] {
  const selectors = [
    '.jobs-search__job-details--wrapper',
    '.jobs-search__job-details',
    '.jobs-search__job-details--container',
    '[class*="jobs-search-job-details"]',
    '[class*="job-details-reader"]',
    '.jobs-details',
    'div.scaffold-layout__list-detail-inner',
    '.scaffold-layout__list-detail',
    '[data-testid="job-search-details"]',
    'aside[class*="job-details"]',
    'div[class*="jobs-details"]',
  ];
  const seen = new Set<Element>();
  const out: Element[] = [];
  for (let i = 0; i < selectors.length; i++) {
    const el = document.querySelector(selectors[i]);
    if (el && !seen.has(el)) {
      seen.add(el);
      out.push(el);
    }
  }
  return out;
}

function pickLinkedInTitleCompanyLocation(
  root: Document | Element
): { role_title: string; company_name: string; location?: string } | null {
  const titleSelectors = [
    '[data-testid="jobsearch-JobInfoHeader-title"]',
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-details-top-card__job-title',
    '.jobs-details-top-card__title',
    '.jobs-unified-top-card__job-title',
    'h1[class*="job-details-jobs-unified-top-card"]',
    'h1[class*="jobs-unified-top-card"]',
    'h1[class*="job-title"]',
    'div[class*="job-details-jobs-unified-top-card"] h1',
    'div[class*="jobs-unified-top-card"] h1',
    '.jobs-search__job-details--container h1',
    'article[data-job-id] h1',
    'h1.t-24',
    'h1[class*="t-24"]',
    'h1',
  ];

  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.jobs-details-top-card__company-name',
    'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
    'a[href*="linkedin.com/company/"]',
    'div[class*="top-card"] a[href*="/company/"]',
    'span[class*="jobs-unified-top-card__company-name"] a',
  ];

  const locationSelectors = [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.jobs-details-top-card__primary-description-container',
    'span[class*="bullet"]',
  ];

  let titleEl: Element | null = null;
  for (let i = 0; i < titleSelectors.length; i++) {
    const el = root.querySelector(titleSelectors[i]);
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t.length < 500 && !/^jobs$/i.test(t) && !/^linkedin$/i.test(t)) {
      titleEl = el;
      break;
    }
  }

  let companyEl: Element | null = null;
  for (let i = 0; i < companySelectors.length; i++) {
    const el = root.querySelector(companySelectors[i]);
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t.length < 200) {
      companyEl = el;
      break;
    }
  }

  let locationEl: Element | null = null;
  for (let i = 0; i < locationSelectors.length; i++) {
    const el = root.querySelector(locationSelectors[i]);
    if (el?.textContent?.trim()) {
      locationEl = el;
      break;
    }
  }

  const role_title = titleEl?.textContent?.trim();
  const company_name = companyEl?.textContent?.trim();
  if (!role_title || !company_name) return null;
  const location = locationEl?.textContent?.trim();
  return { role_title, company_name, location: location || undefined };
}

function getLinkedInJobInfo(): JobInfo | null {
  const url = window.location.href;
  if (!url.includes('linkedin.com') || !isLinkedInJobSurface()) return null;

  const tryOgMeta = (): JobInfo | null => {
    const og = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
    if (!og) return null;
    const parsed = parseTitleAndCompany(og);
    if (parsed && parsed.role_title.length >= 2 && parsed.company_name.length >= 1) {
      return {
        company_name: parsed.company_name,
        role_title: parsed.role_title,
        job_url: url,
        location: undefined,
      };
    }
    return null;
  };

  // 1) Prefer the job-details pane (search-results + currentJobId loads here, not in main).
  const roots = linkedInJobDetailsRoots();
  for (let r = 0; r < roots.length; r++) {
    const picked = pickLinkedInTitleCompanyLocation(roots[r]);
    if (picked) {
      return {
        company_name: picked.company_name,
        role_title: picked.role_title,
        job_url: url,
        location: picked.location,
      };
    }
  }

  // 2) Whole document (older / simpler layouts).
  const docPick = pickLinkedInTitleCompanyLocation(document);
  if (docPick) {
    return {
      company_name: docPick.company_name,
      role_title: docPick.role_title,
      job_url: url,
      location: docPick.location,
    };
  }

  return tryOgMeta() || getJsonLdJobPosting() || null;
}

function getIndeedJobInfo(): JobInfo | null {
  const url = window.location.href;
  const looksLikeJob =
    url.includes('viewjob') ||
    url.includes('jk=') ||
    url.includes('vjk=') ||
    /\/jobs\/view\//i.test(url) ||
    /\/rc\/clk/i.test(url);
  if (!url.includes('indeed.com') || !looksLikeJob) return null;
  const titleEl =
    document.querySelector('h1.jobsearch-JobInfoHeader-title') ||
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
    document.querySelector('h1');
  const companyEl =
    document.querySelector('[data-testid="inlineHeader-companyName"]') ||
    document.querySelector('.jobsearch-InlineCompanyRating-companyHeader') ||
    document.querySelector('div[data-tn-component="jobHeader"] a');
  const locationEl =
    document.querySelector('[data-testid="jobsearch-Location"]') ||
    document.querySelector('.jobsearch-JobInfoHeader-subtitle') ||
    document.querySelector('[class*="location"]');
  const role_title = titleEl?.textContent?.trim();
  const company_name = companyEl?.textContent?.trim();
  const location = locationEl?.textContent?.trim();
  if (!role_title || !company_name) return null;
  return { company_name, role_title, job_url: url, location: location || undefined };
}

/**
 * Fallback employer logo: the CURRENT SITE's own favicon. Only meaningful on
 * the employer's/ATS's own domain (Workday, Greenhouse, a company careers
 * page, etc.) — NOT on third-party job boards like LinkedIn/Indeed, where the
 * favicon is the board's icon, not the employer's.
 */
function getPageFaviconUrl(): string | undefined {
  try {
    const link =
      document.querySelector<HTMLLinkElement>('link[rel~="icon" i]') ||
      document.querySelector<HTMLLinkElement>('link[rel="shortcut icon" i]') ||
      document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon" i]');
    if (link?.href) return link.href;
    return `${location.origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

/**
 * iCIMS branded portals keep the real job DOM inside #icims_content_iframe.
 * The top frame still exposes a stable /jobs/<id>/<slug>/job URL and a real
 * document title, while og:title remains a generic careers-page title.
 */
function getICimsJobInfo(): JobInfo | null {
  if (!window.location.hostname.endsWith('.icims.com')) return null;
  if (!/^\/jobs\/\d+\/[^/]+\/job\/?$/i.test(window.location.pathname)) return null;

  const pageTitle = cleanRoleCandidate(document.title);
  let titleAndLocation = pageTitle.split(/\s+\|\s+Careers at\s+/i)[0]?.trim() || '';
  let locationText: string | undefined;

  const lastIn = titleAndLocation.toLowerCase().lastIndexOf(' in ');
  if (lastIn > 2) {
    const possibleLocation = titleAndLocation.slice(lastIn + 4).trim();
    if (/^(remote|hybrid|on-site)\b/i.test(possibleLocation) || possibleLocation.includes(',')) {
      locationText = possibleLocation;
      titleAndLocation = titleAndLocation.slice(0, lastIn).trim();
    }
  }

  if (!isSpecificRoleTitle(titleAndLocation, '')) {
    const slug = window.location.pathname.match(/^\/jobs\/\d+\/([^/]+)\/job/i)?.[1] || '';
    titleAndLocation = slug
      .split('-')
      .filter(Boolean)
      .map((word) => word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  if (!titleAndLocation) return null;

  const logo = document.querySelector<HTMLImageElement>(
    'header img[alt*="Logo" i], [role="banner"] img[alt*="Logo" i], img[alt*="Insurance Logo" i]'
  );
  const companyFromLogo = cleanRoleCandidate(logo?.alt).replace(/\s+logo(?:\s*\([^)]*\))?$/i, '');
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  const companyFromOg = ogTitle.split('|').map((part) => part.trim()).filter(Boolean).pop() || '';
  const companyName = companyFromLogo || companyFromOg || getCompanyFromDomain(window.location.hostname);
  if (!companyName) return null;

  // iCIMS commonly renders the actual posting inside a same-origin iframe.
  // Read structured/visible data from that document when available, while
  // keeping the stable top-frame job URL.
  let iframeDocument: Document | null = null;
  for (const frame of Array.from(document.querySelectorAll('iframe'))) {
    try {
      if (frame.contentDocument?.body) {
        iframeDocument = frame.contentDocument;
        break;
      }
    } catch {
      /* cross-origin frame; ignore */
    }
  }
  const iframeText = iframeDocument?.body?.innerText || '';
  const structured = iframeDocument ? getJsonLdJobPosting(iframeDocument) : null;
  const salaryText = structured?.salary_text || salaryTextFromVisibleText(iframeText);

  return {
    company_name: structured?.company_name || companyName,
    role_title: titleAndLocation,
    job_url: window.location.href,
    location: structured?.location || locationText,
    salary_text: salaryText,
    company_logo_url: structured?.company_logo_url || logo?.src || undefined,
  };
}

function getJobInfo(): JobInfo | null {
  const host = window.location.hostname;
  const addVisibleSalary = (job: JobInfo | null): JobInfo | null => {
    if (job && !job.salary_text) {
      job.salary_text = salaryTextFromVisibleText(document.body?.innerText || '');
    }
    return job;
  };
  if (host.includes('linkedin.com')) {
    return addVisibleSalary(getLinkedInJobInfo() || getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob());
  }
  if (host.includes('indeed.com')) {
    return addVisibleSalary(getIndeedJobInfo() || getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob());
  }
  if (host.endsWith('.icims.com')) {
    const icimsJob = getICimsJobInfo();
    if (icimsJob) return addVisibleSalary(icimsJob);
  }

  // We're on the employer's/ATS's own site — its favicon reliably represents
  // the employer, so use it whenever the parser didn't already find an
  // explicit logo (e.g. JSON-LD hiringOrganization.logo).
  const job = getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob();
  if (job && !isSpecificRoleTitle(cleanRoleCandidate(job.role_title), job.company_name)) {
    const specificRole = findSpecificRoleFromDom(job.company_name);
    if (specificRole) job.role_title = specificRole;
    else return null; // Career landing/list page, not a specific job posting.
  }
  if (job && !job.company_logo_url) {
    job.company_logo_url = getPageFaviconUrl();
  }
  return addVisibleSalary(job);
}

function readWidgetDismissedUrl(): string | null {
  try {
    return sessionStorage.getItem(WIDGET_DISMISSED_URL_KEY);
  } catch {
    return null;
  }
}

function setWidgetDismissedUrl(url: string) {
  try {
    sessionStorage.setItem(WIDGET_DISMISSED_URL_KEY, url);
  } catch {
    /* ignore */
  }
}

function clearWidgetDismissedUrl() {
  try {
    sessionStorage.removeItem(WIDGET_DISMISSED_URL_KEY);
  } catch {
    /* ignore */
  }
}

function readWidgetPosition(): { top: number } | null {
  try {
    const raw = sessionStorage.getItem(WIDGET_POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { top?: number };
    if (typeof p.top !== 'number') return null;
    return { top: p.top };
  } catch {
    return null;
  }
}

function saveWidgetPosition(top: number) {
  try {
    sessionStorage.setItem(WIDGET_POS_KEY, JSON.stringify({ top }));
  } catch {
    /* ignore */
  }
}

/**
 * Vertical-only drag. The widget stays PINNED to the right edge (right:0) and
 * only moves up/down — it never moves horizontally.
 */
function attachDragBehavior(
  root: HTMLElement,
  dragHandle: HTMLElement,
  options: { allowButtonTarget?: boolean; onTap?: () => void } = {},
) {
  let activePointerId: number | null = null;
  let startClientY = 0;
  let startTop = 0;
  let movedBeyondTapThreshold = false;
  const idleCursor = options.onTap ? 'pointer' : 'grab';

  dragHandle.style.touchAction = 'none';

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return;
    const deltaY = ev.clientY - startClientY;
    if (!movedBeyondTapThreshold && Math.abs(deltaY) < 4) return;
    movedBeyondTapThreshold = true;
    const pad = 8;
    const rect = root.getBoundingClientRect();
    const maxTop = Math.max(pad, window.innerHeight - rect.height - pad);
    const nextTop = Math.min(Math.max(pad, startTop + deltaY), maxTop);
    root.style.top = `${nextTop}px`; // only vertical; horizontal stays pinned right
  };

  const stopDragging = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return;
    activePointerId = null;
    dragHandle.style.cursor = idleCursor;
    const rect = root.getBoundingClientRect();
    saveWidgetPosition(rect.top);
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('pointerup', stopDragging, true);
    document.removeEventListener('pointercancel', stopDragging, true);
    if (!movedBeyondTapThreshold && ev.type === 'pointerup') options.onTap?.();
  };

  dragHandle.addEventListener('pointerdown', (ev) => {
    // Don't start a drag when the user clicks a button inside the drag zone.
    if (!options.allowButtonTarget && (ev.target as HTMLElement | null)?.closest('button')) return;
    ev.preventDefault();
    ev.stopPropagation();
    activePointerId = ev.pointerId;
    movedBeyondTapThreshold = false;
    dragHandle.style.cursor = 'grabbing';
    const r = root.getBoundingClientRect();
    startClientY = ev.clientY;
    startTop = r.top;
    // Keep it docked to the right; switch centering transform to an absolute top.
    root.style.top = `${startTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.bottom = 'auto';
    root.style.transform = 'none';
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', stopDragging, true);
    document.addEventListener('pointercancel', stopDragging, true);
  });

  // Pointer activation is handled on pointerup so a completed drag never also
  // opens the panel. Preserve native keyboard/programmatic button activation.
  if (options.onTap) {
    dragHandle.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.detail === 0) options.onTap?.();
    });
  }
}

/**
 * Sticky, collapsible side widget: Prefill application, Save to tracker, and
 * AI analysis. Expanded × minimizes; minimized × opens the hide-scope
 * menu. Draggable via the expanded header or minimized six-dot grip.
 */
function createJobTrackerWidget(job: JobInfo, defaultView: DefaultView): HTMLElement {
  const root = document.createElement('div');
  root.id = WIDGET_ROOT_ID;
  applyWidgetThemeScope(root);
  root.dataset.tmoJobSnapshot = JSON.stringify(widgetJobSnapshot(job));
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'TrackMyOPT job assistant');
  trackWidgetAnalyticsOnce('extension_widget_shown', job, { default_view: defaultView });

  // Always dock to the right edge. A dragged vertical position is restored for
  // this tab session and clamped to the current viewport so it cannot reappear
  // off-screen after collapse, expansion, or a viewport-size change.
  root.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
    z-index: 2147483647;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: visible;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const extIcon = chrome.runtime.getURL('icons/logo.gif');
  if (!document.getElementById('tmo-minimized-motion-style')) {
    const motionStyle = document.createElement('style');
    motionStyle.id = 'tmo-minimized-motion-style';
    motionStyle.textContent = `
      @keyframes tmo-prefill-chip-pulse {
        0%,100% { transform:scale(1);box-shadow:0 2px 6px rgba(15,23,42,0.14); }
        50% { transform:scale(1.08);box-shadow:0 0 0 6px rgba(37,99,235,0.13); }
      }
      #${WIDGET_ROOT_ID} .tmo-prefill-button.tmo-is-filling > span:first-child {
        animation:tmo-prefill-chip-pulse 760ms ease-in-out infinite;
      }
      #${WIDGET_ROOT_ID} .tmo-prefill-button.tmo-is-filling {
        background:var(--tmo-widget-info-surface) !important;
      }
      @media (prefers-reduced-motion: reduce) {
        #${WIDGET_ROOT_ID} .tmo-minimized-tab,
        #${WIDGET_ROOT_ID} .tmo-minimized-tab *,
        #${WIDGET_ROOT_ID} .tmo-prefill-button.tmo-is-filling > span:first-child {
          animation:none !important;transition:none !important;
        }
      }
    `;
    document.head.appendChild(motionStyle);
  }

  // ---- Minimized control: close button + logo/open area + six-dot drag grip ----
  // Keep this palette aligned with popup.css --tmo-gradient-brand and the web
  // app's primary blue. The gradient is intentionally weighted toward navy so
  // the small floating control stays polished without appearing too bright.
  const minimizedBrand = {
    navy: '#1e3a8a',
    deepBlue: '#1e40af',
    primary: '#2563eb',
    dot: 'var(--tmo-color-info-border)',
  } as const;

  const tab = document.createElement('div');
  tab.className = 'tmo-minimized-tab';
  tab.style.cssText = `
    display:none;position:relative;align-items:stretch;width:62px;height:58px;margin:0;
    border:1px solid ${minimizedBrand.primary};border-right:none;border-radius:13px 0 0 13px;
    background:${minimizedBrand.deepBlue};box-shadow:0 7px 20px rgba(30,64,175,0.22);overflow:visible;
    transition:width 220ms cubic-bezier(.2,.8,.2,1),box-shadow 220ms ease;
  `;

  const tabOpenBtn = document.createElement('button');
  tabOpenBtn.type = 'button';
  tabOpenBtn.title = 'Click to open · drag vertically to move';
  tabOpenBtn.setAttribute('aria-label', 'Open or vertically move TrackMyOPT job assistant');
  tabOpenBtn.style.cssText = `
    width:62px;height:56px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
    padding:0;border:0;border-radius:12px 0 0 12px;
    background:linear-gradient(135deg,${minimizedBrand.navy} 0%,${minimizedBrand.deepBlue} 58%,${minimizedBrand.primary} 100%);cursor:pointer;
    transition:width 220ms cubic-bezier(.2,.8,.2,1),filter 180ms ease;
  `;
  const tabImg = document.createElement('img');
  tabImg.src = extIcon; tabImg.alt = ''; tabImg.width = 34; tabImg.height = 34;
  tabImg.draggable = false;
  tabImg.style.cssText = 'object-fit:contain;border-radius:5px;pointer-events:none;user-select:none;-webkit-user-drag:none;';
  tabImg.addEventListener('error', () => tabImg.replaceWith(logoSvgFallback()));
  tabOpenBtn.appendChild(tabImg);

  const tabDragHandle = document.createElement('div');
  tabDragHandle.setAttribute('role', 'button');
  tabDragHandle.setAttribute('aria-label', 'Drag TrackMyOPT panel');
  tabDragHandle.tabIndex = -1;
  tabDragHandle.style.cssText = `
    width:0;height:56px;display:grid;grid-template-columns:repeat(2,4px);
    grid-template-rows:repeat(3,4px);align-content:center;justify-content:center;
    gap:4px;border-radius:0;background:${minimizedBrand.deepBlue};cursor:grab;outline:none;opacity:0;
    overflow:hidden;pointer-events:none;transform:translateX(10px);
    transition:width 220ms cubic-bezier(.2,.8,.2,1),opacity 180ms ease,transform 220ms cubic-bezier(.2,.8,.2,1);
  `;
  for (let i = 0; i < 6; i += 1) {
    const dot = document.createElement('span');
    dot.style.cssText = `width:4px;height:4px;border-radius:50%;background:${minimizedBrand.dot};display:block;`;
    tabDragHandle.appendChild(dot);
  }

  const tabCloseBtn = document.createElement('button');
  tabCloseBtn.type = 'button';
  tabCloseBtn.title = 'Hide TrackMyOPT';
  tabCloseBtn.setAttribute('aria-label', 'Hide TrackMyOPT options');
  tabCloseBtn.tabIndex = -1;
  tabCloseBtn.style.cssText = `
    position:absolute;top:-14px;left:-14px;z-index:2;width:40px;height:40px;padding:0;
    display:flex;align-items:center;justify-content:center;border:0;background:transparent;
    color:#fff;font:inherit;cursor:pointer;outline:none;
    opacity:0;pointer-events:none;transform:scale(0.72);
    transition:opacity 140ms ease,transform 170ms ease;
  `;
  const tabCloseVisual = document.createElement('span');
  tabCloseVisual.textContent = '×';
  tabCloseVisual.style.cssText = `
    width:24px;height:24px;display:flex;align-items:center;justify-content:center;
    border:0;border-radius:50%;background:${minimizedBrand.navy};color:#fff;
    font-size:17px;font-weight:400;line-height:1;box-shadow:none;
    transition:background 180ms ease,box-shadow 180ms ease;
  `;
  tabCloseBtn.appendChild(tabCloseVisual);
  tabCloseBtn.addEventListener('mouseenter', () => (tabCloseVisual.style.background = minimizedBrand.primary));
  tabCloseBtn.addEventListener('mouseleave', () => (tabCloseVisual.style.background = minimizedBrand.navy));
  tabOpenBtn.addEventListener('focus', () => (tabOpenBtn.style.boxShadow = 'inset 0 0 0 3px rgba(255,255,255,0.85)'));
  tabOpenBtn.addEventListener('blur', () => (tabOpenBtn.style.boxShadow = 'none'));
  tabDragHandle.addEventListener('focus', () => (tabDragHandle.style.boxShadow = 'inset 0 0 0 3px rgba(255,255,255,0.85)'));
  tabDragHandle.addEventListener('blur', () => (tabDragHandle.style.boxShadow = 'none'));
  tabCloseBtn.addEventListener('focus', () => (tabCloseVisual.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.3)'));
  tabCloseBtn.addEventListener('blur', () => (tabCloseVisual.style.boxShadow = 'none'));

  tab.appendChild(tabOpenBtn);
  tab.appendChild(tabDragHandle);
  tab.appendChild(tabCloseBtn);

  // ---- Expanded card ----
  const card = document.createElement('div');
  card.className = 'tmo-job-widget-card';
  card.style.cssText = `
    display:flex;flex-direction:column;width:min(320px,calc(100vw - 20px));
    max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px);background:var(--tmo-widget-surface);
    border:1px solid var(--tmo-widget-border);border-right:none;border-radius:14px 0 0 14px;
    box-shadow:var(--tmo-widget-shadow);overflow:hidden;color:var(--tmo-widget-ink);
  `;

  // Header (drag zone)
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex; align-items: center; gap: 8px;
    padding: 10px 10px 10px 12px;
    background:var(--tmo-widget-info-surface);border-bottom:1px solid var(--tmo-widget-info-border);
    cursor: grab; user-select: none; flex:0 0 auto;
  `;
  const logoRing = document.createElement('div');
  logoRing.style.cssText = `
    width:28px;height:28px;border-radius:50%;background:var(--tmo-widget-surface);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    box-shadow: 0 1px 3px rgba(30,64,175,0.2);
  `;
  const logoImg = document.createElement('img');
  logoImg.src = extIcon; logoImg.alt = ''; logoImg.width = 20; logoImg.height = 20;
  logoImg.style.cssText = 'object-fit:contain;border-radius:3px;';
  logoImg.addEventListener('error', () => logoImg.replaceWith(logoSvgFallback()));
  logoRing.appendChild(logoImg);

  const title = document.createElement('span');
  title.textContent = 'TrackMyOPT';
  title.style.cssText =
    'font-size:13px;font-weight:800;color:var(--tmo-widget-accent-strong);letter-spacing:-0.02em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  const backBtn = iconBtn('‹', 'Back');
  const settingsBtn = iconBtn('⚙', 'Settings');
  const closeBtn = iconBtn('×', 'Minimize panel');
  backBtn.style.display = 'none'; // only shown while the Settings panel is open

  header.appendChild(logoRing);
  header.appendChild(title);
  header.appendChild(backBtn);
  header.appendChild(settingsBtn);
  header.appendChild(closeBtn);

  // Structured job summary — role first, then only data actually extracted
  // from the posting. Missing location/salary rows are omitted, never guessed.
  const jobLine = document.createElement('section');
  jobLine.setAttribute('aria-label', 'Current job');
  jobLine.style.cssText = `
    margin:12px 14px 2px;padding:13px;border:1px solid var(--tmo-widget-border);border-radius:12px;
    background:var(--tmo-widget-surface);box-shadow:0 2px 7px rgba(15,23,42,0.06);line-height:1.38;
  `;

  const jobTitleRow = document.createElement('div');
  jobTitleRow.style.cssText = 'display:flex;align-items:flex-start;gap:8px;';
  const roleEl = document.createElement('div');
  roleEl.textContent = job.role_title || 'Selected role';
  roleEl.title = job.role_title || 'Selected role';
  roleEl.style.cssText = 'min-width:0;flex:1;color:var(--tmo-widget-ink);font-size:15px;font-weight:800;overflow-wrap:anywhere;';
  const savedBadge = document.createElement('span');
  savedBadge.textContent = 'Not saved';
  savedBadge.style.cssText = `
    flex:0 0 auto;padding:5px 9px;border-radius:999px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-muted);
    font-size:10.5px;font-weight:750;white-space:nowrap;
  `;
  jobTitleRow.appendChild(roleEl);
  jobTitleRow.appendChild(savedBadge);

  const companyRow = document.createElement('div');
  companyRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:7px;min-width:0;';
  const companyMark = document.createElement('span');
  companyMark.setAttribute('aria-hidden', 'true');
  companyMark.style.cssText = `
    width:30px;height:30px;flex:0 0 30px;border:1px solid var(--tmo-widget-border);border-radius:8px;background:var(--tmo-widget-surface);
    display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--tmo-widget-accent);font-size:12px;font-weight:800;
  `;
  const companyInitial = (job.company_name || 'C').trim().charAt(0).toUpperCase() || 'C';
  companyMark.textContent = companyInitial;
  if (job.company_logo_url) {
    const companyLogo = document.createElement('img');
    companyLogo.src = job.company_logo_url;
    companyLogo.alt = '';
    companyLogo.draggable = false;
    companyLogo.style.cssText = 'width:25px;height:25px;object-fit:contain;display:block;';
    companyLogo.addEventListener('load', () => {
      companyMark.textContent = '';
      companyMark.appendChild(companyLogo);
    });
    companyLogo.addEventListener('error', () => (companyMark.textContent = companyInitial));
  }

  const companyEl = document.createElement('div');
  companyEl.textContent = job.company_name || 'Company';
  companyEl.title = job.company_name || 'Company';
  companyEl.style.cssText = 'min-width:0;color:var(--tmo-widget-muted);font-size:13px;font-weight:650;overflow-wrap:anywhere;';
  companyRow.appendChild(companyMark);
  companyRow.appendChild(companyEl);

  jobLine.appendChild(jobTitleRow);
  jobLine.appendChild(companyRow);

  if (job.location) {
    const locationEl = document.createElement('div');
    locationEl.textContent = job.location;
    locationEl.style.cssText = 'margin-top:11px;color:var(--tmo-widget-muted);font-size:12.5px;font-weight:600;overflow-wrap:anywhere;';
    jobLine.appendChild(locationEl);
  }
  if (job.salary_text) {
    const salaryEl = document.createElement('div');
    salaryEl.textContent = job.salary_text;
    salaryEl.style.cssText = 'margin-top:8px;color:var(--tmo-widget-muted);font-size:12.5px;font-weight:650;overflow-wrap:anywhere;';
    jobLine.appendChild(salaryEl);
  }

  // Visa-sponsorship signal — the make-or-break fact for an OPT student. Read
  // from the posting text client-side (no API). Painted once now, then refreshed
  // shortly after in case the job body streamed in after the widget mounted.
  const sponsorPill = document.createElement('div');
  sponsorPill.style.cssText = 'margin-top:11px;';
  const initialSponsorship = classifySponsorship(scrapeJobDescription());
  paintSponsorshipPill(sponsorPill, initialSponsorship);
  if (initialSponsorship.signal !== 'unclear') {
    trackWidgetAnalyticsOnce(
      'extension_widget_sponsorship_classified',
      job,
      { signal: initialSponsorship.signal, refreshed: false },
    );
  }
  jobLine.appendChild(sponsorPill);
  window.setTimeout(() => {
    if (sponsorPill.isConnected) {
      const refreshedSponsorship = classifySponsorship(scrapeJobDescription());
      paintSponsorshipPill(sponsorPill, refreshedSponsorship);
      trackWidgetAnalyticsOnce(
        'extension_widget_sponsorship_classified',
        job,
        { signal: refreshedSponsorship.signal, refreshed: true },
      );
    }
  }, 1400);

  // Primary anchor action — Save to job tracker (filled brand gradient).
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.innerHTML = `${icon('bookmark', 16, '#fff')}<span class="tmo-action-label" style="flex:1;text-align:left;">Save to job tracker</span>${icon('chevronRight', 16, 'rgba(255,255,255,0.9)')}`;
  saveBtn.style.cssText = `
    display:flex;align-items:center;gap:10px;width:100%;min-height:46px;margin:0;padding:11px 14px;
    border:0;border-radius:12px;color:#fff;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;
    background:linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#0ea5e9 100%);
    box-shadow:0 6px 16px rgba(37,99,235,0.34);transition:filter 160ms ease,transform 160ms ease,box-shadow 160ms ease;
  `;
  saveBtn.addEventListener('mouseenter', () => {
    if (saveBtn.disabled) return;
    saveBtn.style.filter = 'brightness(1.06)';
    saveBtn.style.transform = 'translateY(-1px)';
  });
  saveBtn.addEventListener('mouseleave', () => {
    saveBtn.style.filter = 'none';
    saveBtn.style.transform = 'none';
  });
  saveBtn.addEventListener('focus', () => (saveBtn.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.35)'));
  saveBtn.addEventListener('blur', () => (saveBtn.style.boxShadow = '0 6px 16px rgba(37,99,235,0.34)'));

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:10px 14px 14px;';

  // Secondary tools grouped in a bordered panel with colored icon chips.
  const toolsPanel = document.createElement('div');
  toolsPanel.style.cssText =
    'border:1px solid var(--tmo-widget-border);border-radius:12px;overflow:hidden;background:var(--tmo-widget-surface);box-shadow:0 2px 8px rgba(15,23,42,0.05);';

  const prefillBtn = actionBtn(icon('zap', 16, '#fff'), 'Prefill application', {
    sublabel: 'Auto-fill this application',
    chip: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
  });
  prefillBtn.classList.add('tmo-prefill-button');
  if (generatedResumeFor(job)) {
    const label = prefillBtn.querySelector<HTMLElement>('.tmo-action-label');
    if (label) label.textContent = 'Prefill application + resume';
    prefillBtn.title = 'Prefill profile fields and attach the custom resume generated for this job';
  }
  const prefillResultLine = document.createElement('div');
  prefillResultLine.className = 'tmo-prefill-result-line';
  prefillResultLine.setAttribute('role', 'status');
  prefillResultLine.setAttribute('aria-live', 'polite');
  prefillResultLine.style.cssText =
    'display:none;align-items:center;flex-wrap:wrap;gap:4px;padding:8px 12px 9px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.4;border-top:1px solid var(--tmo-widget-border);';
  const resumeBtn = actionBtn(icon('fileText', 16, '#fff'), 'Generate custom resume', {
    sublabel: 'Tailored to this role',
    chip: 'linear-gradient(135deg,#10b981,#059669)',
  });
  const aiBtn = actionBtn(icon('sparkles', 16, '#fff'), 'Analyze with AI', {
    sublabel: 'Fit score & keyword gaps',
    chip: 'linear-gradient(135deg,#6366f1,#a855f7)',
  });
  const artifactStaleBanner = document.createElement('div');
  artifactStaleBanner.className = ARTIFACT_STALE_BANNER_CLASS;
  artifactStaleBanner.setAttribute('role', 'alert');
  artifactStaleBanner.style.cssText =
    'display:none;padding:10px 12px;border-top:1px solid #f59e0b;background:var(--tmo-color-warning-surface);color:var(--tmo-color-warning-ink);font-size:11.5px;line-height:1.45;';
  const artifactStaleCopy = document.createElement('div');
  artifactStaleCopy.textContent =
    'Resume link expired — fields filled earlier may be stale';
  artifactStaleCopy.style.fontWeight = '800';
  const artifactStaleAction = document.createElement('button');
  artifactStaleAction.type = 'button';
  artifactStaleAction.textContent = 'Regenerate and re-check filled fields';
  artifactStaleAction.style.cssText =
    'margin-top:5px;padding:0;border:0;background:transparent;color:var(--tmo-color-warning-ink);font:inherit;font-weight:800;text-decoration:underline;cursor:pointer;';
  artifactStaleAction.addEventListener('click', () => {
    regenerationRecheckPending = true;
    const prior = lastResumeGenerationRequest;
    const sameCompanyAndRole = Boolean(
      prior &&
        normalizeJobIdentityText(prior.job.company_name || '') ===
          normalizeJobIdentityText(job.company_name || '') &&
        normalizeJobIdentityText(prior.job.role_title || '') ===
          normalizeJobIdentityText(job.role_title || '')
    );
    if (prior && sameCompanyAndRole) {
      openResumePanel(
        card,
        job,
        prior.resumeId,
        prior.templateId,
        prior.jobDescription,
        prior.focusKeywords,
        prior.baselineScore
      );
    } else {
      resumeBtn.click();
    }
  });
  artifactStaleBanner.appendChild(artifactStaleCopy);
  artifactStaleBanner.appendChild(artifactStaleAction);
  if (artifactStaleReason) artifactStaleBanner.style.display = 'block';
  const artifactInactiveFallback = document.createElement('div');
  artifactInactiveFallback.className = ARTIFACT_INACTIVE_FALLBACK_CLASS;
  artifactInactiveFallback.style.cssText =
    'display:none;padding:10px 12px;border-top:1px solid #f59e0b;background:var(--tmo-color-warning-surface);color:var(--tmo-color-warning-ink);font-size:11.5px;font-weight:800;line-height:1.45;';

  const rowDivider = () => {
    const d = document.createElement('div');
    d.style.cssText = 'height:1px;background:var(--tmo-widget-border);margin:0 12px;';
    return d;
  };

  toolsPanel.appendChild(prefillBtn);
  toolsPanel.appendChild(prefillResultLine);
  if (AUTOFILL_FEATURE_FLAGS.guidedAutopilot) {
    const guidedHost = document.createElement('div');
    guidedHost.className = 'tmo-guided-status';
    guidedHost.setAttribute('role', 'status');
    guidedHost.setAttribute('aria-live', 'polite');
    guidedHost.style.cssText =
      'display:none;align-items:center;gap:7px;padding:8px 11px;border-top:1px solid var(--tmo-widget-border);background:var(--tmo-color-info-surface);color:#1e3a8a;font-size:10.5px;line-height:1.35;';
    const copy = document.createElement('span');
    copy.className = 'tmo-guided-status-copy';
    copy.style.flex = '1';
    copy.textContent =
      'Guided Autopilot is active. It may click safe Next/Done controls, never Submit.';
    const stop = document.createElement('button');
    stop.type = 'button';
    stop.textContent = 'Stop';
    stop.style.cssText =
      'padding:5px 7px;border:1px solid var(--tmo-color-danger-ink);border-radius:6px;background:var(--tmo-color-surface);color:var(--tmo-color-danger-ink);font:inherit;font-weight:800;cursor:pointer;';
    stop.addEventListener('click', () => void stopGuidedAutopilot());
    guidedHost.append(copy, stop);
    toolsPanel.appendChild(guidedHost);
    toolsPanel.appendChild(createSensitiveAnswerPanel(job));
    paintGuidedStateUi();
  }
  toolsPanel.appendChild(artifactStaleBanner);
  toolsPanel.appendChild(artifactInactiveFallback);
  toolsPanel.appendChild(rowDivider());
  toolsPanel.appendChild(resumeBtn);
  toolsPanel.appendChild(rowDivider());
  toolsPanel.appendChild(aiBtn);
  void reconcileArtifactAvailabilityOnWidgetMount(
    job,
    prefillBtn,
    artifactInactiveFallback,
  );

  const nextStepHost = document.createElement('div');
  nextStepHost.setAttribute('role', 'status');
  nextStepHost.setAttribute('aria-live', 'polite');
  nextStepHost.style.cssText = `
    display:none;align-items:stretch;overflow:hidden;border:1px solid var(--tmo-widget-success-border);border-radius:11px;
    background:var(--tmo-widget-success-surface);color:var(--tmo-widget-success-ink);
  `;
  const nextStepBtn = document.createElement('button');
  nextStepBtn.type = 'button';
  nextStepBtn.innerHTML = `<span style="flex:1;text-align:left;">Next: generate a resume tailored to this job</span>${icon('chevronRight', 15, 'currentColor')}`;
  nextStepBtn.style.cssText = `
    display:flex;align-items:center;gap:7px;flex:1;min-height:44px;padding:9px 8px 9px 11px;
    border:0;background:transparent;color:var(--tmo-widget-success-ink);font:inherit;font-size:11.5px;font-weight:750;cursor:pointer;
  `;
  const dismissNextStep = document.createElement('button');
  dismissNextStep.type = 'button';
  dismissNextStep.setAttribute('aria-label', 'Dismiss resume suggestion');
  dismissNextStep.title = 'Dismiss';
  dismissNextStep.textContent = '×';
  dismissNextStep.style.cssText = `
    width:44px;min-height:44px;flex:0 0 44px;border:0;border-left:1px solid var(--tmo-widget-success-border);
    background:transparent;color:var(--tmo-widget-success-ink);font:inherit;font-size:19px;cursor:pointer;
  `;
  const hideNextStep = () => (nextStepHost.style.display = 'none');
  nextStepBtn.addEventListener('click', () => {
    hideNextStep();
    openResumeChooser(card, job);
  });
  dismissNextStep.addEventListener('click', hideNextStep);
  for (const button of [nextStepBtn, dismissNextStep]) {
    button.addEventListener('focus', () => {
      button.style.outline = '3px solid rgba(22,163,74,0.25)';
      button.style.outlineOffset = '-3px';
    });
    button.addEventListener('blur', () => (button.style.outline = 'none'));
  }
  nextStepHost.appendChild(nextStepBtn);
  nextStepHost.appendChild(dismissNextStep);

  const showPostSaveSuggestionOnce = async () => {
    if (await markPostSaveSuggestionSeen(job)) nextStepHost.style.display = 'flex';
  };

  actions.appendChild(saveBtn);
  actions.appendChild(nextStepHost);
  actions.appendChild(toolsPanel);

  // Feedback link (opens the on-page feedback modal)
  const feedbackRow = document.createElement('div');
  feedbackRow.style.cssText = 'padding:0 12px 12px;text-align:center;';
  const feedbackBtn = document.createElement('button');
  feedbackBtn.type = 'button';
  feedbackBtn.innerHTML = `${icon('messageCircle', 14)}<span>Send feedback</span>`;
  feedbackBtn.style.cssText =
    'display:inline-flex;align-items:center;gap:5px;border:none;background:transparent;color:var(--tmo-widget-muted);font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;padding:6px 8px;min-height:32px;';
  feedbackBtn.addEventListener('mouseenter', () => (feedbackBtn.style.color = 'var(--tmo-widget-accent)'));
  feedbackBtn.addEventListener('mouseleave', () => (feedbackBtn.style.color = 'var(--tmo-widget-muted)'));
  feedbackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openFeedbackModal();
  });
  feedbackRow.appendChild(feedbackBtn);

  const optClockRow = document.createElement('div');
  optClockRow.setAttribute('role', 'status');
  optClockRow.setAttribute('aria-live', 'polite');
  optClockRow.style.cssText = `
    display:none;align-items:flex-start;justify-content:center;gap:6px;padding:0 14px 11px;
    color:var(--tmo-widget-muted);font-size:11.5px;font-weight:600;line-height:1.4;text-align:center;
  `;
  const optClockIcon = document.createElement('span');
  optClockIcon.style.cssText = 'display:flex;flex:0 0 auto;margin-top:1px;';
  optClockIcon.innerHTML = icon('clock', 13, 'currentColor');
  const optClockText = document.createElement('span');
  optClockRow.appendChild(optClockIcon);
  optClockRow.appendChild(optClockText);

  // Normal content (job info + actions + feedback link) — hidden while Settings is open.
  const normalBody = document.createElement('div');
  normalBody.className = 'tmo-job-widget-scroll-body';
  normalBody.setAttribute('role', 'group');
  normalBody.setAttribute('aria-label', 'Job assistant tools');
  normalBody.style.cssText = `
    flex:1 1 auto;min-height:0;max-height:calc(100vh - 72px);max-height:calc(100dvh - 72px);
    overflow-x:hidden;overflow-y:auto;
    overscroll-behavior:contain;scrollbar-gutter:stable;-webkit-overflow-scrolling:touch;
  `;
  normalBody.appendChild(jobLine);
  normalBody.appendChild(actions);
  normalBody.appendChild(optClockRow);
  normalBody.appendChild(feedbackRow);

  chrome.runtime.sendMessage(
    { type: 'GET_OPT_CLOCK_NUDGE' },
    (res: { ok?: boolean; nudge?: unknown } | undefined) => {
      if (chrome.runtime.lastError || !res?.ok || !optClockRow.isConnected) return;
      const nudge = normalizeOptClockNudge(res.nudge);
      if (!nudge) return;
      optClockText.textContent = `${nudge.remaining} unemployment ${nudge.remaining === 1 ? 'day' : 'days'} remaining — every application counts.`;
      optClockRow.style.display = 'flex';
    },
  );

  // ---- Settings panel ("Default plugin view": Expanded / Minimized) ----
  const settingsPanel = document.createElement('div');
  settingsPanel.style.cssText = `
    display:none;flex:1 1 auto;min-height:0;max-height:calc(100vh - 72px);
    max-height:calc(100dvh - 72px);padding:14px 12px 16px;
    overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;
    scrollbar-gutter:stable;-webkit-overflow-scrolling:touch;
  `;

  const settingsLabelRow = document.createElement('div');
  settingsLabelRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';
  const settingsLabel = document.createElement('span');
  settingsLabel.textContent = 'Default plugin view';
  settingsLabel.style.cssText = 'font-size:12.5px;font-weight:700;color:var(--tmo-widget-ink);';
  const helpBtn = document.createElement('button');
  helpBtn.type = 'button';
  helpBtn.textContent = '?';
  helpBtn.setAttribute('aria-label', 'What does this setting do?');
  helpBtn.title =
    'Choose how TrackMyOPT appears when a new job page loads: fully expanded, or minimized to a small tab you click to open.';
  helpBtn.style.cssText = `
    width:24px;height:24px;flex-shrink:0;border-radius:50%;border:1px solid var(--tmo-widget-border);
    background:var(--tmo-widget-surface-2);color:var(--tmo-widget-muted);font-size:11px;font-weight:700;line-height:1;
    cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;
  `;
  settingsLabelRow.appendChild(settingsLabel);
  settingsLabelRow.appendChild(helpBtn);
  settingsPanel.appendChild(settingsLabelRow);

  const helpText = document.createElement('p');
  helpText.textContent = 'This only changes how the widget first appears on a new job page — it does not affect the current one.';
  helpText.style.cssText = 'display:none;font-size:11px;color:var(--tmo-widget-muted);margin:0 0 10px;line-height:1.4;';
  settingsPanel.appendChild(helpText);
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
  });

  const segmented = document.createElement('div');
  segmented.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
  const expandedOptBtn = viewOptionBtn('Expanded');
  const minimizedOptBtn = viewOptionBtn('Minimized');
  segmented.appendChild(expandedOptBtn);
  segmented.appendChild(minimizedOptBtn);
  settingsPanel.appendChild(segmented);

  const savedNote = document.createElement('p');
  savedNote.style.cssText = 'margin:10px 0 0;font-size:11px;color:#2563eb;font-weight:700;min-height:14px;';
  settingsPanel.appendChild(savedNote);

  function paintViewOptions(selected: DefaultView) {
    expandedOptBtn.style.cssText = viewOptionStyle(selected === 'expanded');
    minimizedOptBtn.style.cssText = viewOptionStyle(selected === 'minimized');
  }
  paintViewOptions(defaultView);

  card.appendChild(header);
  card.appendChild(normalBody);
  card.appendChild(settingsPanel);

  // Minimized close menu (3 hide scopes)
  const menu = document.createElement('div');
  menu.style.cssText = `
    display:none;position:absolute;top:44px;right:64px;z-index:5;
    width:min(260px,calc(100vw - 32px));background:var(--tmo-widget-surface);border:1px solid var(--tmo-widget-border);border-radius:12px;
    box-shadow:var(--tmo-widget-shadow);overflow:hidden;padding:8px 0;color:var(--tmo-widget-ink);
  `;
  const menuItem = (label: string, onClick: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText =
      'display:block;width:100%;min-height:46px;text-align:left;padding:11px 18px;border:none;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:14px;font-weight:600;cursor:pointer;';
    b.addEventListener('mouseenter', () => (b.style.background = 'var(--tmo-widget-surface-2)'));
    b.addEventListener('mouseleave', () => (b.style.background = 'var(--tmo-widget-surface)'));
    b.addEventListener('focus', () => {
      b.style.background = 'var(--tmo-widget-info-surface)';
      b.style.outline = '2px solid var(--tmo-widget-accent)';
      b.style.outlineOffset = '-2px';
    });
    b.addEventListener('blur', () => {
      b.style.background = 'var(--tmo-widget-surface)';
      b.style.outline = 'none';
    });
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return b;
  };
  menu.appendChild(menuItem('Hide until next visit', () => { hideForThisVisit(); root.remove(); }));
  menu.appendChild(menuItem('Disable on this domain', () => { void hideForThisSite(); root.remove(); }));
  menu.appendChild(menuItem('Disable on all pages', () => { void hideForAllSites(); root.remove(); }));

  root.appendChild(tab);
  root.appendChild(card);
  root.appendChild(menu);

  let tabControlsRevealed = false;
  const setTabControlsRevealed = (revealed: boolean) => {
    if (tabControlsRevealed === revealed) return;
    tabControlsRevealed = revealed;
    tab.style.width = revealed ? '106px' : '62px';
    tab.style.boxShadow = revealed
      ? '0 9px 26px rgba(30,64,175,0.32)'
      : '0 7px 20px rgba(30,64,175,0.22)';
    tabOpenBtn.style.width = revealed ? '70px' : '62px';
    tabDragHandle.style.width = revealed ? '36px' : '0';
    tabDragHandle.style.opacity = revealed ? '1' : '0';
    tabDragHandle.style.transform = revealed ? 'translateX(0)' : 'translateX(10px)';
    tabDragHandle.style.pointerEvents = revealed ? 'auto' : 'none';
    tabDragHandle.tabIndex = revealed ? 0 : -1;
    tabCloseBtn.style.opacity = revealed ? '1' : '0';
    tabCloseBtn.style.transform = revealed ? 'scale(1)' : 'scale(0.72)';
    tabCloseBtn.style.pointerEvents = revealed ? 'auto' : 'none';
    tabCloseBtn.tabIndex = revealed ? 0 : -1;
  };
  const retractTabControlsWhenIdle = () => {
    window.setTimeout(() => {
      if (menu.style.display !== 'none') return;
      const active = document.activeElement;
      if (tab.matches(':hover')) return;
      if (active && (tab.contains(active) || menu.contains(active))) return;
      setTabControlsRevealed(false);
    }, 60);
  };

  tab.addEventListener('mouseenter', () => setTabControlsRevealed(true));
  tab.addEventListener('mouseleave', retractTabControlsWhenIdle);
  tab.addEventListener('focusin', () => setTabControlsRevealed(true));
  tab.addEventListener('focusout', retractTabControlsWhenIdle);

  attachDragBehavior(root, header);
  attachDragBehavior(root, tabDragHandle);

  // ---- collapse / expand ----
  const setCollapsed = (collapsed: boolean) => {
    setCollapsedPref(collapsed);
    card.style.display = collapsed ? 'none' : 'block';
    tab.style.display = collapsed ? 'flex' : 'none';
    menu.style.display = 'none';
    setTabControlsRevealed(false);
    document.removeEventListener('click', onDocClick, true);
    requestAnimationFrame(() => {
      const rect = root.getBoundingClientRect();
      const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
      if (rect.top < 8 || rect.top > maxTop) {
        root.style.top = `${Math.min(Math.max(8, rect.top), maxTop)}px`;
        root.style.transform = 'none';
      }
    });
  };
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); setCollapsed(true); });
  attachDragBehavior(root, tabOpenBtn, {
    allowButtonTarget: true,
    onTap: () => setCollapsed(false),
  });

  // ---- Settings panel open/close (swaps content in place; same widget card) ----
  function showSettings(show: boolean) {
    normalBody.style.display = show ? 'none' : 'block';
    settingsPanel.style.display = show ? 'block' : 'none';
    title.textContent = show ? 'Settings' : 'TrackMyOPT';
    settingsBtn.style.display = show ? 'none' : 'flex';
    closeBtn.style.display = show ? 'none' : 'flex';
    backBtn.style.display = show ? 'flex' : 'none';
    menu.style.display = 'none';
  }
  settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); showSettings(true); });
  backBtn.addEventListener('click', (e) => { e.stopPropagation(); showSettings(false); });

  /**
   * Persist the chosen default view, clear any per-session override so the new
   * default isn't immediately shadowed, and apply it to THIS widget right away
   * so the choice is visibly confirmed.
   */
  async function chooseDefaultView(view: DefaultView) {
    paintViewOptions(view);
    await setDefaultViewPref(view);
    clearSessionCollapsedOverride();
    setCollapsed(view === 'minimized');
    savedNote.textContent = 'Saved ✓';
    setTimeout(() => { savedNote.textContent = ''; }, 1500);
  }
  expandedOptBtn.addEventListener('click', (e) => { e.stopPropagation(); void chooseDefaultView('expanded'); });
  minimizedOptBtn.addEventListener('click', (e) => { e.stopPropagation(); void chooseDefaultView('minimized'); });

  // ---- close menu (open only while needed; no leaked global listener) ----
  const onDocClick = (e: MouseEvent) => {
    if (!root.contains(e.target as Node)) {
      menu.style.display = 'none';
      document.removeEventListener('click', onDocClick, true);
      setTabControlsRevealed(false);
    }
  };
  tabCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = menu.style.display === 'none';
    menu.style.display = opening ? 'block' : 'none';
    if (opening) {
      setTabControlsRevealed(true);
      menu.style.top = '44px';
      menu.style.bottom = 'auto';
      requestAnimationFrame(() => {
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.bottom > window.innerHeight - 8) {
          menu.style.top = 'auto';
          menu.style.bottom = '44px';
        }
      });
      setTimeout(() => document.addEventListener('click', onDocClick, true), 0);
      requestAnimationFrame(() => menu.querySelector<HTMLButtonElement>('button')?.focus());
    } else {
      document.removeEventListener('click', onDocClick, true);
      retractTabControlsWhenIdle();
    }
  });

  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    menu.style.display = 'none';
    document.removeEventListener('click', onDocClick, true);
    tabOpenBtn.focus();
  });

  tabDragHandle.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const rect = root.getBoundingClientRect();
    const delta = e.key === 'ArrowUp' ? -16 : 16;
    const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
    const nextTop = Math.min(Math.max(8, rect.top + delta), maxTop);
    root.style.top = `${nextTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.transform = 'none';
    saveWidgetPosition(nextTop);
  });

  const savedPosition = readWidgetPosition();
  if (savedPosition) {
    requestAnimationFrame(() => {
      const rect = root.getBoundingClientRect();
      const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
      root.style.top = `${Math.min(Math.max(8, savedPosition.top), maxTop)}px`;
      root.style.right = '0';
      root.style.left = 'auto';
      root.style.transform = 'none';
    });
  }

  const clampWidgetToViewport = () => {
    if (!root.isConnected) {
      window.removeEventListener('resize', clampWidgetToViewport);
      return;
    }
    const rect = root.getBoundingClientRect();
    const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
    const nextTop = Math.min(Math.max(8, rect.top), maxTop);
    root.style.top = `${nextTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.transform = 'none';
    saveWidgetPosition(nextTop);
  };
  window.addEventListener('resize', clampWidgetToViewport, { passive: true });
  widgetViewportResizeObserver?.disconnect();
  widgetViewportResizeObserver = new ResizeObserver(() => {
    if (!root.isConnected) return;
    clampWidgetToViewport();
  });
  widgetViewportResizeObserver.observe(card);

  // ---- actions ----
  prefillBtn.addEventListener('click', () => {
    void (async () => {
      const label = prefillBtn.querySelector<HTMLElement>('.tmo-action-label');
      let hasResume = false;
      prefillBtn.disabled = true;
      prefillBtn.setAttribute('aria-busy', 'true');
      prefillBtn.classList.add('tmo-is-filling');
      if (label) label.textContent = 'Prefilling…';
      try {
        const execution = await executeResolvedPrefill(job, 'step_by_step');
        hasResume = execution.hasResume;
        const result = execution.result;
        paintPrefillCoverage(prefillResultLine, result);
        if (AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
          await mountScreeningQuestionReviews(
            card,
            job,
            execution.hasResume,
            execution.jobDescription,
          );
        }
        trackPrefillExecution(execution, 'step_by_step', 'success');
      } catch {
        trackPrefillRuntimeFailure('step_by_step', hasResume);
      } finally {
        prefillBtn.disabled = false;
        prefillBtn.setAttribute('aria-busy', 'false');
        prefillBtn.classList.remove('tmo-is-filling');
        if (label) {
          label.textContent = hasResume || generatedResumeFor(job)
            ? 'Prefill application + resume'
            : 'Prefill application';
        }
      }
    })();
  });

  // Opens an explicit saved-resume/template chooser, then generates in the
  // widget with a live countdown and Download / Edit LaTeX actions.
  resumeBtn.addEventListener('click', () => {
    // Prefer the side panel: it hosts the run so it survives navigation, which
    // the in-widget flow cannot. chrome.sidePanel.open() must be called during
    // a user gesture, and the gesture may not survive the message round trip to
    // the service worker, so the in-widget chooser stays as the fallback and
    // remains the behaviour on Chrome < 114.
    try {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, (response) => {
        if (chrome.runtime.lastError || !response?.ok) {
          openResumeChooser(card, job);
        }
      });
    } catch {
      openResumeChooser(card, job);
    }
  });

  aiBtn.addEventListener('click', () => {
    openAiAnalysis(card, job);
  });

  // Once a job is in the tracker (saved just now, or found on load), the primary
  // button stops being a "save" and becomes a link into the dashboard tracker.
  let jobSavedState = false;
  let savedLookupPending = false;
  let duplicateApplication: DuplicateApplicationNotice | undefined;
  const setSavedLookupPending = (pending: boolean) => {
    savedLookupPending = pending;
    saveBtn.disabled = pending;
    saveBtn.setAttribute('aria-busy', pending ? 'true' : 'false');
    saveBtn.style.cursor = pending ? 'wait' : 'pointer';
    saveBtn.style.opacity = pending ? '0.78' : '1';
    const label = saveBtn.querySelector('.tmo-action-label') as HTMLElement | null;
    if (pending) {
      if (label) label.textContent = 'Checking saved state…';
      savedBadge.textContent = 'Checking…';
    } else if (!jobSavedState) {
      if (label) label.textContent = 'Save to job tracker';
      savedBadge.textContent = 'Not saved';
    }
  };
  const markJobSaved = (statusText: 'Applied' | 'Wishlist') => {
    jobSavedState = true;
    savedLookupPending = false;
    saveBtn.disabled = false;
    saveBtn.setAttribute('aria-busy', 'false');
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.opacity = '1';
    const label = saveBtn.querySelector('.tmo-action-label') as HTMLElement | null;
    if (label) label.textContent = 'View in tracker';
    savedBadge.textContent = statusText === 'Wishlist' ? 'Wishlist' : 'Saved ✓';
    savedBadge.style.background = 'var(--tmo-widget-success-surface)';
    savedBadge.style.color = 'var(--tmo-widget-success-ink)';
    saveBtn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
    saveBtn.style.boxShadow = '0 4px 12px rgba(16,185,129,0.28)';
    saveBtn.style.filter = 'none';
    saveBtn.style.transform = 'none';
  };

  const saveJobWithStatus = (status: ApplicationSaveStatus) => {
    const label = saveBtn.querySelector('.tmo-action-label') as HTMLElement | null;
    const prev = label?.textContent || 'Save to job tracker';
    saveBtn.disabled = true;
    if (label) label.textContent = 'Saving…';
    savedBadge.textContent = 'Saving…';
    chrome.runtime.sendMessage(
      {
        type: 'ADD_JOB_TO_TRACKER',
        job: buildJobSaveSnapshot(job, scrapeJobDescription()),
        status,
      },
      (response: { ok?: boolean; error?: string; id?: string } | undefined) => {
        saveBtn.disabled = false;
        if (chrome.runtime.lastError) {
          if (label) label.textContent = prev;
          savedBadge.textContent = 'Not saved';
          showMessage('TrackMyOPT: Sign in in the extension to save jobs.', true);
          trackWidgetAnalytics('extension_widget_job_saved', {
            status,
            outcome: 'error',
          });
          return;
        }
        if (response?.ok) {
          rememberTrackerApplicationId(job, response.id);
          markJobSaved(status === 'Applied' ? 'Applied' : 'Wishlist');
          void showPostSaveSuggestionOnce();
          showMessage(status === 'Applied' ? 'Application added to Job Tracker!' : 'Job saved to your Wishlist!', false);
          trackWidgetAnalytics('extension_widget_job_saved', {
            status,
            outcome: 'success',
          });
        } else {
          if (label) label.textContent = prev;
          savedBadge.textContent = 'Not saved';
          showMessage(response?.error || 'Failed to save job', true);
          trackWidgetAnalytics('extension_widget_job_saved', {
            status,
            outcome: response?.error === 'not_signed_in' ? 'not_signed_in' : 'error',
          });
        }
      }
    );
  };
  saveBtn.addEventListener('click', () => {
    if (savedLookupPending) return;
    if (jobSavedState) {
      window.open(`${WEBSITE_URL}/dashboard/career/job-tracker`, '_blank', 'noopener,noreferrer');
      return;
    }
    openApplicationStatusDialog(job, saveJobWithStatus, duplicateApplication);
  });

  // Paint the saved state on load so a revisited job doesn't show "Not saved".
  if (job.job_url) {
    setSavedLookupPending(true);
    chrome.runtime.sendMessage(
      {
        type: 'CHECK_JOB_SAVED',
        jobUrl: job.job_url,
        companyName: job.company_name,
        roleTitle: job.role_title,
      },
      (res: {
        ok?: boolean;
        saved?: boolean;
        id?: string;
        status?: 'Applied' | 'Wishlist';
        duplicateApplication?: DuplicateApplicationNotice;
      } | undefined) => {
        if (!chrome.runtime.lastError && res?.ok) {
          duplicateApplication = res.duplicateApplication;
        }
        if (!chrome.runtime.lastError && res?.ok && res.saved) {
          rememberTrackerApplicationId(job, res.id);
          markJobSaved(res.status === 'Wishlist' ? 'Wishlist' : 'Applied');
          return;
        }
        setSavedLookupPending(false);
      }
    );
  }

  // Initial state: an explicit per-session override (user already toggled
  // collapse/expand on this origin this session) wins; otherwise fall back to
  // the persisted "Default plugin view" setting from the Settings panel.
  const sessionOverride = readSessionCollapsedOverride();
  setCollapsed(sessionOverride !== null ? sessionOverride : defaultView === 'minimized');

  return root;
}

/** Small icon button for the widget header (collapse / close). */
function iconBtn(glyph: string, label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.title = label;
  b.textContent = glyph;
  b.style.cssText = `
    width:34px;height:34px;flex-shrink:0;padding:0;margin:0;border:none;border-radius:8px;
    background:transparent;color:var(--tmo-widget-accent-strong);font-size:18px;line-height:1;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
  `;
  b.addEventListener('mouseenter', () => (b.style.background = "rgba(37,99,235,0.1)"));
  b.addEventListener('mouseleave', () => (b.style.background = 'transparent'));
  return b;
}

/** Render the visa-sponsorship pill into `host` from a classifier result. */
function paintSponsorshipPill(host: HTMLElement, result: SponsorshipResult): void {
  const theme = {
    sponsors: {
      bg: 'var(--tmo-widget-success-surface)',
      fg: 'var(--tmo-widget-success-ink)',
      border: 'var(--tmo-widget-success-border)',
      iconName: 'checkCircle' as const,
      label: 'Mentions sponsorship',
      fallback: 'This posting mentions visa sponsorship.',
    },
    no_sponsorship: {
      bg: 'var(--tmo-widget-danger-surface)',
      fg: 'var(--tmo-widget-danger-ink)',
      border: 'var(--tmo-widget-danger-border)',
      iconName: 'alertTriangle' as const,
      label: 'No sponsorship',
      fallback: 'This posting appears to rule out visa sponsorship.',
    },
    unclear: {
      bg: 'var(--tmo-widget-surface-2)',
      fg: 'var(--tmo-widget-muted)',
      border: 'var(--tmo-widget-border)',
      iconName: 'info' as const,
      label: 'Sponsorship not stated',
      fallback: "The posting doesn't clearly state its visa-sponsorship policy.",
    },
  }[result.signal];

  host.textContent = '';
  const pill = document.createElement('span');
  pill.style.cssText = `
    display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;
    background:${theme.bg};color:${theme.fg};border:1px solid ${theme.border};
    font-size:11px;font-weight:750;line-height:1;max-width:100%;
  `;
  const ic = document.createElement('span');
  ic.style.cssText = 'display:flex;flex-shrink:0;';
  ic.innerHTML = icon(theme.iconName, 13, theme.fg);
  const text = document.createElement('span');
  text.textContent = theme.label;
  text.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  pill.appendChild(ic);
  pill.appendChild(text);
  pill.title = result.matchedSentence ? `“${result.matchedSentence}”` : theme.fallback;
  host.appendChild(pill);
}

/**
 * Action row inside the tools panel: colored icon chip + label + optional
 * sublabel, with a trailing chevron (default) or custom trailing element.
 * `iconSvg` should already be a white icon so it reads on the colored chip.
 */
function actionBtn(
  iconSvg: string,
  label: string,
  opts: { sublabel?: string; chip?: string; trailing?: string } = {}
): HTMLButtonElement {
  const chip = opts.chip || 'linear-gradient(135deg,#2563eb,#0ea5e9)';
  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText = `
    display:flex;align-items:center;gap:11px;width:100%;min-height:56px;padding:11px 12px;
    border:0;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;text-align:left;cursor:pointer;
    transition:background 160ms ease;
  `;
  b.addEventListener('mouseenter', () => (b.style.background = 'var(--tmo-widget-surface-2)'));
  b.addEventListener('mouseleave', () => (b.style.background = 'var(--tmo-widget-surface)'));
  b.addEventListener('focus', () => {
    b.style.background = 'var(--tmo-widget-info-surface)';
    b.style.outline = '2px solid var(--tmo-widget-focus)';
    b.style.outlineOffset = '-2px';
  });
  b.addEventListener('blur', () => {
    b.style.background = 'var(--tmo-widget-surface)';
    b.style.outline = 'none';
  });

  const chipEl = document.createElement('span');
  chipEl.innerHTML = iconSvg;
  chipEl.style.cssText = `
    width:34px;height:34px;flex:0 0 34px;border-radius:10px;background:${chip};
    display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(15,23,42,0.14);
  `;

  const textWrap = document.createElement('span');
  textWrap.style.cssText = 'flex:1;min-width:0;';
  const l = document.createElement('span');
  l.className = 'tmo-action-label';
  l.textContent = label;
  l.style.cssText = 'display:block;font-size:13px;font-weight:750;letter-spacing:-0.1px;';
  textWrap.appendChild(l);
  if (opts.sublabel) {
    const s = document.createElement('span');
    s.textContent = opts.sublabel;
    s.style.cssText = 'display:block;font-size:11px;color:var(--tmo-widget-muted);margin-top:1px;';
    textWrap.appendChild(s);
  }

  const trail = document.createElement('span');
  trail.style.cssText = 'display:flex;flex:0 0 auto;margin-left:auto;align-items:center;color:var(--tmo-widget-muted);';
  trail.innerHTML = opts.trailing ?? icon('chevronRight', 16, 'currentColor');

  b.appendChild(chipEl);
  b.appendChild(textWrap);
  b.appendChild(trail);
  return b;
}

// ── Generate custom resume (in-widget) ──────────────────────────────────────

const RESUME_PANEL_CLASS = 'tmo-resume-panel';

function ensureSpinKeyframes(): void {
  if (document.getElementById('tmo-spin-style')) return;
  const style = document.createElement('style');
  style.id = 'tmo-spin-style';
  style.textContent = '@keyframes tmo-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}

/** Best-effort job-description text from a document (page or fetched listing). */
function scrapeJobDescriptionFromDocument(
  doc: Document,
  source: JobDescriptionCandidate['source'] = 'specific',
): JobDescriptionCandidate[] {
  const candidates: JobDescriptionCandidate[] = [];
  const selectors = [
    '[data-testid*="jobDescription" i]',
    '[class*="job-description" i]',
    '[class*="jobDescription" i]',
    '[id*="job-description" i]',
    '[class*="description" i]',
    'main',
    'article',
  ];
  const root = doc.documentElement;
  if (!root) return candidates;

  if (source !== 'listing') {
    for (const frame of Array.from(doc.querySelectorAll<HTMLIFrameElement>('iframe'))) {
      try {
        const frameDocument = frame.contentDocument;
        const frameText = frameDocument?.body?.innerText || '';
        if (frameText) candidates.push({ source: 'frame', text: frameText });
        if (frameDocument) {
          for (const selector of selectors) {
            for (const element of Array.from(frameDocument.querySelectorAll<HTMLElement>(selector))) {
              if (element.innerText) candidates.push({ source: 'frame', text: element.innerText });
            }
          }
        }
      } catch {
        /* cross-origin frame; child-frame prefill remains isolated */
      }
    }
  }

  for (const selector of selectors) {
    for (const element of Array.from(doc.querySelectorAll<HTMLElement>(selector))) {
      if (element.closest(`#${WIDGET_ROOT_ID}, #tmo-resume-chooser, #tmo-application-status-dialog`)) continue;
      if (element.innerText) candidates.push({ source, text: element.innerText });
    }
  }

  const body = doc.body;
  if (body) {
    const outerText = Array.from(body.children || [])
      .filter((element) => ![
        WIDGET_ROOT_ID,
        'tmo-resume-chooser',
        'tmo-application-status-dialog',
        'tmo-easy-apply-toast',
      ].includes(element.id))
      .filter((element) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName))
      .map((element) => (element as HTMLElement).innerText || '')
      .filter(Boolean)
      .join('\n\n');
    if (outerText) {
      candidates.push({
        source: source === 'listing' ? 'listing' : 'outer',
        text: outerText,
      });
    }
  }

  return candidates;
}

/** Sync scrape of the open document only (no network). */
function scrapeJobDescription(): string {
  return chooseJobDescriptionCandidate(scrapeJobDescriptionFromDocument(document));
}

const listingJobDescriptionCache = new Map<string, string>();
const JD_SESSION_CACHE_KEY = 'tmo_jd_listing_cache_v1';

function readSessionJdCache(key: string): string {
  try {
    const raw = sessionStorage.getItem(JD_SESSION_CACHE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as Record<string, string>;
    const value = parsed[key];
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
}

function writeSessionJdCache(key: string, text: string): void {
  if (!text || text.length < 200) return;
  try {
    const raw = sessionStorage.getItem(JD_SESSION_CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    parsed[key] = text.slice(0, 15_000);
    // Cap entries so sessionStorage stays small across a long apply binge.
    const keys = Object.keys(parsed);
    if (keys.length > 20) {
      for (const stale of keys.slice(0, keys.length - 20)) delete parsed[stale];
    }
    sessionStorage.setItem(JD_SESSION_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // Best-effort only.
  }
}

function rememberJobDescription(pageUrl: string, text: string): void {
  if (!looksLikeRealJobPostingText(text)) return;
  const key = jobDescriptionCacheKey(pageUrl);
  listingJobDescriptionCache.set(key, text);
  writeSessionJdCache(key, text);
}

async function fetchWorkdayCxsJobDescription(pageUrl: string): Promise<string> {
  const cxsUrl = buildWorkdayCxsJobUrl(pageUrl);
  if (!cxsUrl) return '';
  try {
    const response = await fetch(cxsUrl, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return '';
    const payload = (await response.json().catch(() => null)) as unknown;
    return extractWorkdayJobDescriptionFromCxs(payload);
  } catch {
    return '';
  }
}

async function fetchListingJobDescription(listingUrl: string): Promise<string> {
  const cached = listingJobDescriptionCache.get(listingUrl);
  if (cached) return cached;
  const sessionCached = readSessionJdCache(listingUrl);
  if (sessionCached) {
    listingJobDescriptionCache.set(listingUrl, sessionCached);
    return sessionCached;
  }
  try {
    const response = await fetch(listingUrl, {
      credentials: 'include',
      headers: { Accept: 'text/html' },
    });
    if (!response.ok) return '';
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = chooseJobDescriptionCandidate(
      scrapeJobDescriptionFromDocument(doc, 'listing'),
    );
    if (text) {
      listingJobDescriptionCache.set(listingUrl, text);
      writeSessionJdCache(listingUrl, text);
    }
    return text;
  } catch {
    return '';
  }
}

/**
 * Prefer the real posting when the user is on an apply form (Workday, Jobvite,
 * Greenhouse, Lever, Ashby, iCIMS, …). Order:
 * 1) session/memory cache from the listing visit
 * 2) Workday CXS JSON (SPA-safe)
 * 3) HTML fetch of the sibling listing URL
 * 4) on-page scrape
 */
async function resolveJobDescription(pageUrl: string = window.location.href): Promise<string> {
  const scraped = scrapeJobDescription();
  const cacheKey = jobDescriptionCacheKey(pageUrl);
  rememberJobDescription(pageUrl, scraped);

  const cached =
    listingJobDescriptionCache.get(cacheKey) || readSessionJdCache(cacheKey);
  if (cached && looksLikeRealJobPostingText(cached)) {
    if (!looksLikeRealJobPostingText(scraped) || cached.length > scraped.length) {
      return cached;
    }
  }

  if (!shouldFetchListingJobDescription(pageUrl, scraped)) {
    return scraped;
  }

  const workdayText = await fetchWorkdayCxsJobDescription(pageUrl);
  if (workdayText && looksLikeRealJobPostingText(workdayText)) {
    rememberJobDescription(pageUrl, workdayText);
    return workdayText.slice(0, 15_000);
  }

  const listingUrl = deriveJobListingUrl(pageUrl) || cacheKey;
  const listingText = listingUrl
    ? await fetchListingJobDescription(listingUrl)
    : '';
  if (listingText) {
    rememberJobDescription(pageUrl, listingText);
  }

  return (
    chooseJobDescriptionCandidate([
      ...(workdayText ? [{ source: 'listing' as const, text: workdayText }] : []),
      ...(listingText ? [{ source: 'listing' as const, text: listingText }] : []),
      { source: 'outer', text: scraped },
    ]) || scraped
  );
}

function downloadGeneratedPdf(base64: string, filename: string): void {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function resumeMiniBtn(labelSvgAndText: string, primary: boolean): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = labelSvgAndText;
  b.style.cssText = `
    flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
    min-height:44px;padding:10px 9px;border-radius:9px;font:inherit;font-size:12.5px;font-weight:750;cursor:pointer;
    ${primary
      ? 'background:#2563eb;color:#fff;border:1px solid #2563eb;'
      : 'background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);border:1px solid var(--tmo-widget-border);'}
  `;
  b.addEventListener('focus', () => (b.style.outline = '3px solid var(--tmo-widget-focus)'));
  b.addEventListener('blur', () => (b.style.outline = 'none'));
  return b;
}

type SavedResumeOption = {
  id: string;
  filename: string;
  updatedAt?: string | null;
};

// Single source shared with the side panel. See agent/panel-templates.ts.
const SIDE_PANEL_TEMPLATES = RESUME_TEMPLATES_FOR_PANEL;

function modalFieldLabel(text: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.htmlFor = htmlFor;
  label.textContent = text;
  label.style.cssText = 'display:block;margin:0 0 6px;color:var(--tmo-widget-ink);font-size:12.5px;font-weight:750;';
  return label;
}

function modalSelect(id: string): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = id;
  select.style.cssText = `
    display:block;width:100%;height:44px;padding:0 34px 0 11px;border:1px solid var(--tmo-widget-border);
    border-radius:9px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:13px;cursor:pointer;
    outline:none;
  `;
  select.addEventListener('focus', () => {
    select.style.borderColor = 'var(--tmo-widget-accent)';
    select.style.boxShadow = '0 0 0 3px var(--tmo-widget-focus)';
  });
  select.addEventListener('blur', () => {
    select.style.borderColor = 'var(--tmo-widget-border)';
    select.style.boxShadow = 'none';
  });
  return select;
}

type ApplicationSaveStatus = 'Wishlist' | 'Applied';

function openApplicationStatusDialog(
  job: JobInfo,
  onSelect: (status: ApplicationSaveStatus) => void,
  duplicate?: DuplicateApplicationNotice,
): void {
  document.getElementById('tmo-application-status-dialog')?.remove();
  const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-application-status-dialog';
  applyWidgetThemeScope(overlay);
  overlay.setAttribute('popover', 'manual');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;width:auto;height:auto;margin:0;padding:16px;border:0;
    background:var(--tmo-widget-overlay);display:flex;align-items:center;justify-content:center;overflow:auto;
    color:var(--tmo-widget-ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  `;

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'tmo-application-status-title');
  dialog.style.cssText = `
    width:min(360px,calc(100vw - 24px));border:1px solid var(--tmo-widget-border);border-radius:16px;background:var(--tmo-widget-surface);
    box-shadow:var(--tmo-widget-shadow);overflow:hidden;color:var(--tmo-widget-ink);
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:17px 17px 13px;border-bottom:1px solid var(--tmo-widget-border);';
  const headingCopy = document.createElement('div');
  headingCopy.style.cssText = 'flex:1;min-width:0;';
  const heading = document.createElement('h2');
  heading.id = 'tmo-application-status-title';
  heading.textContent = 'Application Status';
  heading.style.cssText = 'margin:0;color:var(--tmo-widget-ink);font-size:17px;line-height:1.3;font-weight:800;';
  const description = document.createElement('p');
  description.textContent = `Have you applied for ${job.role_title || 'this job'}?`;
  description.style.cssText = 'margin:5px 0 0;color:var(--tmo-widget-muted);font-size:12.5px;line-height:1.45;';
  headingCopy.appendChild(heading);
  headingCopy.appendChild(description);

  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close application status');
  close.textContent = '×';
  close.style.cssText = 'width:44px;height:44px;flex:0 0 44px;border:0;border-radius:10px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);font:inherit;font-size:22px;cursor:pointer;';
  header.appendChild(headingCopy);
  header.appendChild(close);

  const body = document.createElement('div');
  body.style.cssText = 'display:grid;gap:9px;padding:15px 17px 17px;';

  if (duplicate) {
    const notice = formatDuplicateApplicationNotice(duplicate);
    const warning = document.createElement('div');
    warning.setAttribute('role', 'note');
    warning.style.cssText = `
      display:flex;align-items:flex-start;gap:8px;padding:10px 11px;border:1px solid var(--tmo-widget-warning-border);
      border-radius:10px;background:var(--tmo-widget-warning-surface);color:var(--tmo-widget-warning-ink);font-size:12px;line-height:1.45;
    `;
    const warningIcon = document.createElement('span');
    warningIcon.style.cssText = 'display:flex;flex:0 0 auto;margin-top:2px;';
    warningIcon.innerHTML = icon('info', 14, 'currentColor');
    const warningCopy = document.createElement('span');
    warningCopy.append('You applied to ');
    const duplicateRole = document.createElement('strong');
    duplicateRole.textContent = notice.roleTitle || 'a similar role';
    warningCopy.appendChild(duplicateRole);
    warningCopy.append(` at ${notice.companyName || 'this company'}`);
    if (notice.dateLabel) warningCopy.append(` on ${notice.dateLabel}`);
    warningCopy.append('. You can still save this posting.');
    warning.appendChild(warningIcon);
    warning.appendChild(warningCopy);
    body.appendChild(warning);
  }

  const option = (status: ApplicationSaveStatus, label: string, hint: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.cssText = `
      width:100%;min-height:58px;padding:11px 12px;border:1px solid var(--tmo-widget-border);border-radius:11px;
      background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);display:flex;align-items:center;gap:11px;text-align:left;font:inherit;cursor:pointer;
      transition:border-color 180ms ease,background 180ms ease,box-shadow 180ms ease;
    `;
    const marker = document.createElement('span');
    marker.style.cssText = 'width:18px;height:18px;flex:0 0 18px;border:2px solid var(--tmo-widget-muted);border-radius:50%;box-shadow:inset 0 0 0 4px var(--tmo-widget-surface);';
    const copy = document.createElement('span');
    copy.style.cssText = 'min-width:0;display:block;';
    const labelEl = document.createElement('strong');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display:block;color:var(--tmo-widget-ink);font-size:13.5px;line-height:1.3;';
    const hintEl = document.createElement('span');
    hintEl.textContent = hint;
    hintEl.style.cssText = 'display:block;margin-top:3px;color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.35;';
    copy.appendChild(labelEl);
    copy.appendChild(hintEl);
    button.appendChild(marker);
    button.appendChild(copy);
    button.addEventListener('mouseenter', () => {
      button.style.borderColor = 'var(--tmo-widget-accent)';
      button.style.background = 'var(--tmo-widget-info-surface)';
      marker.style.borderColor = 'var(--tmo-widget-accent)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = 'var(--tmo-widget-border)';
      button.style.background = 'var(--tmo-widget-surface)';
      marker.style.borderColor = 'var(--tmo-widget-muted)';
    });
    button.addEventListener('focus', () => (button.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.18)'));
    button.addEventListener('blur', () => (button.style.boxShadow = 'none'));
    button.addEventListener('click', () => {
      cleanup();
      onSelect(status);
    });
    return button;
  };

  const notApplied = option('Wishlist', 'I have not applied yet', 'Save this job to your Wishlist.');
  const applied = option('Applied', 'I applied', 'Save it as an active application.');
  body.appendChild(notApplied);
  body.appendChild(applied);
  dialog.appendChild(header);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    try { overlay.hidePopover?.(); } catch { /* already closed */ }
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cleanup();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [close, notApplied, applied];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  try {
    overlay.showPopover?.();
  } catch {
    overlay.removeAttribute('popover');
  }
  notApplied.focus();
}

// ── Analyze with AI (in-widget ATS fit) ─────────────────────────────────────

interface AnalyzeJobFitResponse {
  ok: boolean;
  error?: string;
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  gapSummary?: string;
  resumeName?: string;
}

/** Simple centered message inside the analysis dialog body. */
function renderAiMessage(body: HTMLElement, message: string): void {
  body.textContent = '';
  const p = document.createElement('p');
  p.textContent = message;
  p.style.cssText = 'margin:0;color:var(--tmo-widget-muted);font-size:13px;line-height:1.5;';
  body.appendChild(p);
}

/** Error / empty states, with an action button where one helps. */
function renderAiError(body: HTMLElement, error: string, card: HTMLElement, job: JobInfo): void {
  body.textContent = '';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
  const p = document.createElement('p');
  p.style.cssText = 'margin:0;color:var(--tmo-widget-muted);font-size:13px;line-height:1.5;';

  let action: HTMLButtonElement | null = null;
  const actionBtnStyled = (labelText: string): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = labelText;
    b.style.cssText =
      'align-self:flex-start;padding:9px 14px;border:0;border-radius:10px;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;font:inherit;font-size:12.5px;font-weight:750;cursor:pointer;';
    return b;
  };

  switch (error) {
    case 'not_signed_in':
      p.textContent = 'Sign in from the TrackMyOPT extension icon to analyze this job against your resume.';
      break;
    case 'no_base_resume':
      p.textContent = 'Save a base resume on TrackMyOPT first, then come back to see your ATS match for this job.';
      action = actionBtnStyled('Open resume generator');
      action.addEventListener('click', () => {
        window.open(`${WEBSITE_URL}/dashboard/career/resume-generator`, '_blank', 'noopener,noreferrer');
      });
      break;
    case 'no_job_description':
      p.textContent = "We couldn't read enough of this posting to analyze it. Open the full job description on the page, then try again.";
      break;
    case 'limit_reached':
      p.textContent = "You've reached this month's AI analysis limit. It resets next month, or upgrade for more.";
      action = actionBtnStyled('See plans');
      action.addEventListener('click', () => {
        window.open(`${WEBSITE_URL}/pricing`, '_blank', 'noopener,noreferrer');
      });
      break;
    default:
      p.textContent = 'Something went wrong analyzing this job. Please try again in a moment.';
  }

  wrap.appendChild(p);
  if (action) wrap.appendChild(action);
  body.appendChild(wrap);
}

/** Render the score ring, missing-keyword chips, and the resume-generator chain. */
function renderAiResult(
  body: HTMLElement,
  res: AnalyzeJobFitResponse,
  card: HTMLElement,
  job: JobInfo,
  closeDialog: () => void,
): void {
  body.textContent = '';
  const score = typeof res.matchScore === 'number' ? res.matchScore : 0;
  rememberJobFitScore(job, score);
  const matched = Array.isArray(res.matchedKeywords) ? res.matchedKeywords : [];
  const missing = Array.isArray(res.missingKeywords) ? res.missingKeywords : [];
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

  // Score ring + label
  const top = document.createElement('div');
  top.style.cssText = 'display:flex;align-items:center;gap:14px;';
  const ring = document.createElement('div');
  ring.style.cssText = 'position:relative;width:84px;height:84px;flex:0 0 84px;';
  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - score / 100);
  ring.innerHTML = `
    <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r="34" fill="none" stroke="var(--tmo-widget-border)" stroke-width="8"></circle>
      <circle cx="42" cy="42" r="34" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
        transform="rotate(-90 42 42)"></circle>
    </svg>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:800;color:var(--tmo-widget-ink);">${score}</div>`;
  const topText = document.createElement('div');
  topText.style.cssText = 'min-width:0;';
  const topTitle = document.createElement('div');
  topTitle.textContent = 'ATS match score';
  topTitle.style.cssText = 'font-size:14px;font-weight:800;color:var(--tmo-widget-ink);';
  const topSub = document.createElement('div');
  topSub.textContent = `vs ${res.resumeName || 'your saved resume'}`;
  topSub.style.cssText = 'font-size:12px;color:var(--tmo-widget-muted);margin-top:3px;overflow-wrap:anywhere;';
  topText.appendChild(topTitle);
  topText.appendChild(topSub);
  top.appendChild(ring);
  top.appendChild(topText);
  wrap.appendChild(top);

  // Matched keywords
  if (matched.length > 0) {
    const matchedSection = document.createElement('div');
    const matchedHeading = document.createElement('div');
    matchedHeading.textContent = `Matched keywords (${matched.length})`;
    matchedHeading.style.cssText = 'font-size:11.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--tmo-widget-muted);margin-bottom:8px;';
    const matchedChips = document.createElement('div');
    matchedChips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    for (const kw of matched) {
      const chip = document.createElement('span');
      chip.textContent = kw;
      chip.style.cssText =
        'padding:4px 9px;border-radius:999px;background:var(--tmo-widget-success-surface);color:var(--tmo-widget-success-ink);border:1px solid var(--tmo-widget-success-border);font-size:11.5px;font-weight:700;';
      matchedChips.appendChild(chip);
    }
    matchedSection.appendChild(matchedHeading);
    matchedSection.appendChild(matchedChips);
    wrap.appendChild(matchedSection);
  }

  // Missing keywords
  const kwSection = document.createElement('div');
  const kwHeading = document.createElement('div');
  kwHeading.style.cssText = 'font-size:11.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--tmo-widget-muted);margin-bottom:8px;';
  if (missing.length > 0) {
    kwHeading.textContent = `Missing keywords (${missing.length})`;
    kwSection.appendChild(kwHeading);
    const chips = document.createElement('div');
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    for (const kw of missing) {
      const chip = document.createElement('span');
      chip.textContent = kw;
      chip.style.cssText =
        'padding:4px 9px;border-radius:999px;background:var(--tmo-widget-warning-surface);color:var(--tmo-widget-warning-ink);border:1px solid var(--tmo-widget-warning-border);font-size:11.5px;font-weight:700;';
      chips.appendChild(chip);
    }
    kwSection.appendChild(chips);
  } else {
    kwHeading.textContent = 'Keyword coverage';
    kwSection.appendChild(kwHeading);
    const ok = document.createElement('p');
    ok.textContent = 'No major keyword gaps detected — your resume covers this posting well.';
    ok.style.cssText = 'margin:0;color:var(--tmo-widget-success-ink);font-size:12.5px;line-height:1.45;font-weight:600;';
    kwSection.appendChild(ok);
  }
  wrap.appendChild(kwSection);

  // Gap summary (optional)
  if (res.gapSummary && res.gapSummary.trim()) {
    const summary = document.createElement('p');
    summary.textContent = res.gapSummary.trim();
    summary.style.cssText = 'margin:0;color:var(--tmo-widget-muted);font-size:12.5px;line-height:1.5;';
    wrap.appendChild(summary);
  }

  // Chain into the resume generator
  const chain = document.createElement('button');
  chain.type = 'button';
  chain.innerHTML = `<span>${missing.length > 0 ? 'Add these to a tailored resume' : 'Generate a tailored resume'}</span>${icon('chevronRight', 16, '#fff')}`;
  chain.style.cssText =
    'display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:46px;margin-top:2px;padding:11px 14px;border:0;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(16,185,129,0.3);';
  chain.addEventListener('click', () => {
    closeDialog();
    openResumeChooser(card, job, missing);
  });
  wrap.appendChild(chain);

  body.appendChild(wrap);
}

/**
 * In-widget ATS fit analysis: score ring + missing-keyword chips against the
 * user's base resume, chaining into the resume generator. Backed by the live
 * /api/resume-generator/analyze-gap route (Bearer stays in the background).
 */
function openAiAnalysis(card: HTMLElement, job: JobInfo): void {
  document.getElementById('tmo-ai-analysis')?.remove();
  // Capture the posting text before mounting our modal so our own UI can never
  // leak into the analyzed job description. On apply routes, resolve the
  // sibling listing page so we score against the real JD.
  void resolveJobDescription().then((jobDescription) => {
    openAiAnalysisWithDescription(card, job, jobDescription);
  });
}

function openAiAnalysisWithDescription(
  card: HTMLElement,
  job: JobInfo,
  jobDescription: string,
): void {
  const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-ai-analysis';
  applyWidgetThemeScope(overlay);
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;background:var(--tmo-widget-overlay);
    display:flex;align-items:center;justify-content:center;padding:16px;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  `;
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'tmo-ai-dialog-title');
  dialog.style.cssText = `
    width:min(380px,calc(100vw - 24px));max-height:calc(100vh - 32px);overflow:auto;
    border:1px solid var(--tmo-widget-border);border-radius:16px;background:var(--tmo-widget-surface);box-shadow:var(--tmo-widget-shadow);color:var(--tmo-widget-ink);
  `;

  const dialogHeader = document.createElement('div');
  dialogHeader.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:18px 18px 14px;border-bottom:1px solid var(--tmo-widget-border);';
  const headerCopy = document.createElement('div');
  headerCopy.style.cssText = 'flex:1;min-width:0;';
  const heading = document.createElement('h2');
  heading.id = 'tmo-ai-dialog-title';
  heading.textContent = 'Analyze with AI';
  heading.style.cssText = 'margin:0;color:var(--tmo-widget-ink);font-size:17px;line-height:1.3;font-weight:800;letter-spacing:-0.02em;';
  const description = document.createElement('p');
  description.textContent = 'How your saved resume scores against this posting.';
  description.style.cssText = 'margin:5px 0 0;color:var(--tmo-widget-muted);font-size:12.5px;line-height:1.45;';
  headerCopy.appendChild(heading);
  headerCopy.appendChild(description);
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close analysis');
  close.textContent = '×';
  close.style.cssText = 'width:44px;height:44px;flex-shrink:0;border:0;border-radius:10px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);font-size:22px;line-height:1;cursor:pointer;';
  dialogHeader.appendChild(headerCopy);
  dialogHeader.appendChild(close);

  const body = document.createElement('div');
  body.style.cssText = 'padding:16px 18px 18px;';
  body.setAttribute('aria-live', 'polite');

  dialog.appendChild(dialogHeader);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  ensureSpinKeyframes();

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    try { overlay.hidePopover?.(); } catch { /* already closed */ }
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cleanup();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  try { overlay.showPopover?.(); } catch { overlay.removeAttribute('popover'); }
  close.focus();

  if (jobDescription.trim().length < 200) {
    trackWidgetAnalytics('extension_widget_job_analyzed', {
      outcome: 'no_job_description',
      error_code: 'no_job_description',
    });
    renderAiError(body, 'no_job_description', card, job);
    return;
  }

  const loading = document.createElement('div');
  loading.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:88px;color:var(--tmo-widget-muted);font-size:13px;';
  const spinner = document.createElement('span');
  spinner.style.cssText = 'width:17px;height:17px;border:2px solid var(--tmo-widget-border);border-top-color:#6366f1;border-radius:50%;animation:tmo-spin .8s linear infinite;';
  loading.appendChild(spinner);
  loading.append('Scoring your resume against this job…');
  body.appendChild(loading);

  chrome.runtime.sendMessage(
    { type: 'ANALYZE_JOB_FIT', jobDescription },
    (res: AnalyzeJobFitResponse | undefined) => {
      if (chrome.runtime.lastError) {
        trackWidgetAnalytics('extension_widget_job_analyzed', {
          outcome: 'error',
          error_code: 'runtime',
        });
        renderAiError(body, 'error', card, job);
        return;
      }
      if (!res || !res.ok) {
        const errorCode = res?.error || 'unknown';
        trackWidgetAnalytics('extension_widget_job_analyzed', {
          outcome: errorCode === 'limit_reached'
            ? 'limit'
            : errorCode === 'not_signed_in'
              ? 'not_signed_in'
              : errorCode === 'no_base_resume'
                ? 'no_base_resume'
                : errorCode === 'no_job_description'
                  ? 'no_job_description'
                  : 'error',
          error_code: errorCode === 'limit_reached'
            ? 'limit'
            : errorCode === 'base_failed' || errorCode === 'analyze_failed'
              ? 'analyze_failed'
              : errorCode,
        });
        renderAiError(body, res?.error || 'error', card, job);
        return;
      }
      trackWidgetAnalytics('extension_widget_job_analyzed', {
        outcome: 'success',
        score: res.matchScore,
        matched_keywords_count: res.matchedKeywords?.length ?? 0,
        missing_keywords_count: res.missingKeywords?.length ?? 0,
      });
      renderAiResult(body, res, card, job, cleanup);
    },
  );
}

/** Explicit resume/template chooser displayed before any generation starts. */
function openResumeChooser(card: HTMLElement, job: JobInfo, analyzedMissingKeywords: string[] = []): void {
  document.getElementById('tmo-resume-chooser')?.remove();
  void resolveJobDescription().then((jobDescription) => {
    openResumeChooserWithDescription(card, job, analyzedMissingKeywords, jobDescription);
  });
}

function openResumeChooserWithDescription(
  card: HTMLElement,
  job: JobInfo,
  analyzedMissingKeywords: string[],
  jobDescription: string,
): void {
  // Capture before mounting TrackMyOPT's modal so extension UI can never enter
  // the job-description payload or preview.
  const focusKeywords = [...new Set(analyzedMissingKeywords.map((keyword) => keyword.trim()).filter(Boolean))].slice(0, 12);
  const returnFocusTo = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-resume-chooser';
  applyWidgetThemeScope(overlay);
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;background:var(--tmo-widget-overlay);
    display:flex;align-items:center;justify-content:center;padding:16px;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  `;
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'tmo-resume-dialog-title');
  dialog.style.cssText = `
    width:min(380px,calc(100vw - 24px));max-height:calc(100vh - 32px);overflow:auto;
    border:1px solid var(--tmo-widget-border);border-radius:16px;background:var(--tmo-widget-surface);box-shadow:var(--tmo-widget-shadow);color:var(--tmo-widget-ink);
  `;

  const dialogHeader = document.createElement('div');
  dialogHeader.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:18px 18px 14px;border-bottom:1px solid var(--tmo-widget-border);';
  const headerCopy = document.createElement('div');
  headerCopy.style.cssText = 'flex:1;min-width:0;';
  const heading = document.createElement('h2');
  heading.id = 'tmo-resume-dialog-title';
  heading.textContent = 'Generate custom resume';
  heading.style.cssText = 'margin:0;color:var(--tmo-widget-ink);font-size:17px;line-height:1.3;font-weight:800;letter-spacing:-0.02em;';
  const description = document.createElement('p');
  description.textContent = 'Choose the resume and template to tailor for this job.';
  description.style.cssText = 'margin:5px 0 0;color:var(--tmo-widget-muted);font-size:12.5px;line-height:1.45;';
  headerCopy.appendChild(heading);
  headerCopy.appendChild(description);
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close resume generator');
  close.textContent = '×';
  close.style.cssText = 'width:44px;height:44px;flex-shrink:0;border:0;border-radius:10px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);font-size:22px;line-height:1;cursor:pointer;';
  dialogHeader.appendChild(headerCopy);
  dialogHeader.appendChild(close);

  const body = document.createElement('div');
  body.style.cssText = 'padding:16px 18px 18px;';
  body.setAttribute('aria-live', 'polite');
  const loading = document.createElement('div');
  loading.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:88px;color:var(--tmo-widget-muted);font-size:13px;';
  const spinner = document.createElement('span');
  spinner.style.cssText = 'width:17px;height:17px;border:2px solid var(--tmo-widget-border);border-top-color:var(--tmo-widget-accent);border-radius:50%;animation:tmo-spin .8s linear infinite;';
  loading.appendChild(spinner);
  loading.append('Loading your saved resumes…');
  body.appendChild(loading);

  dialog.appendChild(dialogHeader);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  ensureSpinKeyframes();

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      cleanup();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('button:not([disabled]),select:not([disabled])')
    )
      .filter((element) => element.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  close.focus();

  chrome.runtime.sendMessage(
    { type: 'LIST_SAVED_RESUMES' },
    (response: {
      ok?: boolean;
      error?: string;
      resumes?: SavedResumeOption[];
      accountEmail?: string;
    } | undefined) => {
      if (!document.body.contains(overlay)) return;
      body.textContent = '';
      if (chrome.runtime.lastError || !response?.ok) {
        const message = document.createElement('p');
        message.style.cssText = 'margin:0 0 12px;color:var(--tmo-color-danger-ink);font-size:13px;line-height:1.5;';
        message.textContent = response?.error === 'not_signed_in'
          ? 'Sign in to TrackMyOPT in the extension before generating a resume.'
          : 'We could not load your saved resumes. Please try again.';
        const retry = resumeMiniBtn('<span>Close and try again</span>', true);
        retry.addEventListener('click', cleanup);
        body.appendChild(message);
        body.appendChild(retry);
        return;
      }

      const resumes = response.resumes ?? [];
      if (resumes.length === 0) {
        const message = document.createElement('p');
        message.style.cssText = 'margin:0 0 12px;color:var(--tmo-widget-muted);font-size:13px;line-height:1.5;';
        message.textContent = response.accountEmail
          ? `No saved resumes were found for ${response.accountEmail}. Make sure the extension and TrackMyOPT website use the same account.`
          : 'No saved resumes were found for this extension account. Make sure the extension and TrackMyOPT website use the same account.';
        const refresh = resumeMiniBtn('<span>Check again</span>', false);
        refresh.addEventListener('click', () => {
          cleanup();
          openResumeChooser(card, job, focusKeywords);
        });
        const open = resumeMiniBtn('<span>Open resume generator</span>', true);
        open.addEventListener('click', () => {
          window.open(`${WEBSITE_URL}/dashboard/career/resume-generator`, '_blank', 'noopener');
          cleanup();
        });
        body.appendChild(message);
        body.appendChild(refresh);
        refresh.style.marginBottom = '8px';
        body.appendChild(open);
        return;
      }

      const resumeLabel = modalFieldLabel('Saved resume', 'tmo-saved-resume-select');
      const resumeSelect = modalSelect('tmo-saved-resume-select');
      for (const resume of resumes) {
        const option = document.createElement('option');
        option.value = resume.id;
        option.textContent = resume.filename;
        resumeSelect.appendChild(option);
      }

      const templateGroup = document.createElement('div');
      templateGroup.style.cssText = 'margin-top:15px;';
      const templateLabel = modalFieldLabel('Template', 'tmo-template-select');
      const templateSelect = modalSelect('tmo-template-select');
      for (const template of SIDE_PANEL_TEMPLATES) {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} — ${template.hint}`;
        templateSelect.appendChild(option);
      }
      templateGroup.appendChild(templateLabel);
      templateGroup.appendChild(templateSelect);

      const jobContext = document.createElement('div');
      jobContext.style.cssText = 'margin-top:15px;padding:10px 11px;border:1px solid var(--tmo-widget-info-border);border-radius:9px;background:var(--tmo-widget-info-surface);color:var(--tmo-widget-info-ink);font-size:12px;line-height:1.45;';
      jobContext.textContent = [job.role_title, job.company_name].filter(Boolean).join(' at ') || 'Current job posting';

      const analysisContext = document.createElement('div');
      if (focusKeywords.length > 0) {
        analysisContext.style.cssText = 'margin-top:10px;padding:10px 11px;border:1px solid var(--tmo-widget-warning-border);border-radius:9px;background:var(--tmo-widget-warning-surface);color:var(--tmo-widget-warning-ink);font-size:11.5px;line-height:1.45;';
        analysisContext.textContent = `AI focus keywords: ${focusKeywords.join(', ')}`;
      }

      const jdSection = document.createElement('div');
      jdSection.style.cssText = 'margin-top:15px;';
      const jdHeader = document.createElement('div');
      jdHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;';
      const jdLabel = document.createElement('span');
      jdLabel.textContent = 'Job description sent for tailoring';
      jdLabel.style.cssText = 'color:var(--tmo-widget-ink);font-size:12.5px;font-weight:750;';
      const jdCount = document.createElement('span');
      jdCount.textContent = `${jobDescription.length.toLocaleString()} characters`;
      jdCount.style.cssText = 'flex-shrink:0;color:var(--tmo-widget-muted);font-size:10.5px;font-weight:600;';
      jdHeader.appendChild(jdLabel);
      jdHeader.appendChild(jdCount);
      const jdPreview = document.createElement('div');
      jdPreview.setAttribute('role', 'textbox');
      jdPreview.setAttribute('aria-readonly', 'true');
      jdPreview.tabIndex = 0;
      jdPreview.textContent = jobDescription || 'No job description was detected on this page.';
      jdPreview.style.cssText = `
        max-height:132px;overflow:auto;padding:10px 11px;border:1px solid var(--tmo-widget-border);border-radius:9px;
        background:var(--tmo-widget-surface-2);color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.48;white-space:pre-wrap;
        overflow-wrap:anywhere;scrollbar-width:thin;
      `;
      jdPreview.addEventListener('focus', () => {
        jdPreview.style.borderColor = 'var(--tmo-widget-accent)';
        jdPreview.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.14)';
      });
      jdPreview.addEventListener('blur', () => {
        jdPreview.style.borderColor = 'var(--tmo-widget-border)';
        jdPreview.style.boxShadow = 'none';
      });
      jdSection.appendChild(jdHeader);
      jdSection.appendChild(jdPreview);

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:9px;margin-top:17px;';
      const cancel = resumeMiniBtn('<span>Cancel</span>', false);
      const generate = resumeMiniBtn(`${icon('sparkles', 15, '#fff')}<span>Generate</span>`, true);
      cancel.addEventListener('click', cleanup);
      generate.addEventListener('click', () => {
        const resumeId = resumeSelect.value;
        const templateId = templateSelect.value;
        if (!resumeId || !templateId) return;
        cleanup();
        openResumePanel(
          card,
          job,
          resumeId,
          templateId,
          jobDescription,
          focusKeywords,
          rememberedJobFitScore(job),
        );
      });
      actions.appendChild(cancel);
      actions.appendChild(generate);

      body.appendChild(resumeLabel);
      body.appendChild(resumeSelect);
      body.appendChild(templateGroup);
      body.appendChild(jobContext);
      if (focusKeywords.length > 0) body.appendChild(analysisContext);
      body.appendChild(jdSection);
      body.appendChild(actions);
      resumeSelect.focus();
    }
  );
}

/**
 * Adds a small dismiss (×) to a terminal resume panel. While a panel is present
 * the widget is held stable (isWidgetInteractionInFlight), so the user needs a
 * way to close a finished result and let the widget follow them to a new job.
 */
function addResumePanelDismiss(panel: HTMLElement): void {
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss resume panel');
  close.title = 'Dismiss';
  close.textContent = '×';
  close.style.cssText =
    'position:absolute;top:8px;right:8px;width:22px;height:22px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--tmo-widget-muted);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  close.addEventListener('mouseenter', () => (close.style.background = 'var(--tmo-widget-surface)'));
  close.addEventListener('mouseleave', () => (close.style.background = 'transparent'));
  close.addEventListener('click', () => {
    panel.remove();
    // Reconcile now that the interaction is over — the widget can follow the
    // user to whatever job they navigated to while the panel was open.
    scheduleInject();
  });
  panel.appendChild(close);
}

function renderResumeError(panel: HTMLElement, message: string): void {
  panel.textContent = '';
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:6px;align-items:flex-start;color:var(--tmo-color-danger-ink);font-size:12px;';
  const ic = document.createElement('span');
  ic.style.cssText = 'display:flex;flex-shrink:0;margin-top:1px;';
  ic.innerHTML = icon('alertTriangle', 14, 'var(--tmo-color-danger-ink)');
  const t = document.createElement('span');
  t.textContent = message;
  row.appendChild(ic);
  row.appendChild(t);
  panel.appendChild(row);
  addResumePanelDismiss(panel);
}

function renderResumeNeedBase(panel: HTMLElement): void {
  panel.textContent = '';
  const t = document.createElement('div');
  t.style.cssText = 'font-size:12px;color:var(--tmo-widget-ink);margin-bottom:8px;';
  t.textContent = 'Save a base resume on TrackMyOPT first, then generate a tailored one here.';
  const btn = resumeMiniBtn('Open resume generator', true);
  btn.addEventListener('click', () => {
    window.open(`${WEBSITE_URL}/dashboard/career/resume-generator`, '_blank', 'noopener');
  });
  panel.appendChild(t);
  panel.appendChild(btn);
  addResumePanelDismiss(panel);
}

function renderResumeResult(
  panel: HTMLElement,
  pdfBase64: string,
  job: JobInfo,
  artifact?: GeneratedResumeArtifactV1,
  editorUrl?: string,
  scores?: {
    baselineScore?: number;
    generatedScore?: number;
    scoreError?: 'limit_reached' | 'scan_failed';
  },
): void {
  panel.textContent = '';
  const head = document.createElement('div');
  head.style.cssText =
    'display:flex;align-items:center;gap:6px;font-weight:800;color:var(--tmo-color-success-ink);margin-bottom:8px;font-size:12.5px;';
  const hi = document.createElement('span');
  hi.style.cssText = 'display:flex;';
  hi.innerHTML = icon('checkCircle', 15, '#059669');
  const ht = document.createElement('span');
  ht.textContent = 'Resume ready';
  head.appendChild(hi);
  head.appendChild(ht);
  panel.appendChild(head);

  if (regenerationRecheckPending) {
    const recheckNote = document.createElement('div');
    recheckNote.style.cssText =
      'margin:0 0 10px;padding:8px 9px;border:1px solid #f59e0b;border-radius:8px;background:var(--tmo-color-warning-surface);color:var(--tmo-color-warning-ink);font-size:11.5px;line-height:1.45;';
    recheckNote.textContent =
      'Resume link refreshed. Fields filled earlier were not cleared or refilled; review them against this resume before submitting.';
    panel.appendChild(recheckNote);
    regenerationRecheckPending = false;
  }

  const comparison = buildScoreComparison(scores?.baselineScore, scores?.generatedScore);
  if (comparison) {
    const scoreCard = document.createElement('div');
    scoreCard.style.cssText = `
      margin:0 0 10px;padding:10px 11px;border:1px solid ${comparison.improved ? 'var(--tmo-widget-success-border)' : 'var(--tmo-widget-border)'};
      border-radius:10px;background:${comparison.improved ? 'var(--tmo-widget-success-surface)' : 'var(--tmo-widget-surface)'};
    `;
    const scoreLine = document.createElement('div');
    scoreLine.style.cssText = `
      display:flex;align-items:center;gap:7px;color:${comparison.improved ? 'var(--tmo-widget-success-ink)' : 'var(--tmo-widget-ink)'};
      font-size:13px;font-weight:800;
    `;
    const scoreIcon = document.createElement('span');
    scoreIcon.style.cssText = 'display:flex;flex:0 0 auto;';
    scoreIcon.innerHTML = icon(comparison.improved ? 'sparkles' : 'info', 15, 'currentColor');
    const scoreCopy = document.createElement('span');
    scoreCopy.textContent = comparison.baseline === undefined
      ? `Generated resume ATS score: ${comparison.generated}`
      : `ATS score ${comparison.baseline} → ${comparison.generated}`;
    scoreLine.appendChild(scoreIcon);
    scoreLine.appendChild(scoreCopy);
    scoreCard.appendChild(scoreLine);
    if (comparison.baseline !== undefined) {
      const scoreDetail = document.createElement('div');
      scoreDetail.textContent = comparison.improved
        ? `+${comparison.delta} after tailoring`
        : 'No score gain detected — review the tailored resume before applying.';
      scoreDetail.style.cssText = 'margin:4px 0 0 22px;color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.4;';
      scoreCard.appendChild(scoreDetail);
    }
    panel.appendChild(scoreCard);
  } else if (scores?.scoreError) {
    const scoreNote = document.createElement('p');
    scoreNote.style.cssText = 'margin:0 0 10px;color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.45;';
    scoreNote.textContent = scores.scoreError === 'limit_reached'
      ? 'Resume ready. ATS comparison is unavailable because your monthly scan limit was reached.'
      : 'Resume ready. ATS comparison could not be completed this time.';
    panel.appendChild(scoreNote);
  }

  const row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';
  const filename = artifact?.pdf.filename || generatedResumeFilename(job);
  if (artifact) {
    setCurrentGeneratedArtifact(artifact);
  } else {
    markCurrentArtifactInvalid('invalid', true);
  }

  const card = panel.parentElement;
  const prefillLabel = card?.querySelector<HTMLElement>('.tmo-prefill-button .tmo-action-label');
  if (prefillLabel) {
    prefillLabel.textContent = artifact
      ? 'Prefill application + resume'
      : 'Prefill application';
  }
  const prefillButton = card?.querySelector<HTMLButtonElement>('.tmo-prefill-button');
  if (prefillButton) {
    prefillButton.title = artifact
      ? 'Prefill profile fields and attach the custom resume generated for this job'
      : 'Prefill profile fields';
  }

  const dl = resumeMiniBtn(`${icon('fileText', 14, '#fff')}<span>Download</span>`, true);
  dl.title = 'Download the tailored resume as a PDF';
  dl.addEventListener('click', () => {
    downloadGeneratedPdf(pdfBase64, filename);
  });
  const ed = resumeMiniBtn(`${icon('fileText', 14)}<span>Edit</span>`, false);
  ed.disabled = !editorUrl;
  if (editorUrl) {
    ed.title = 'Open the generated resume in the TrackMyOPT LaTeX editor';
    ed.addEventListener('click', () => window.open(editorUrl, '_blank', 'noopener'));
  } else {
    ed.title = 'The editor handoff could not be prepared. Your PDF is still ready.';
    ed.style.opacity = '0.55';
    ed.style.cursor = 'not-allowed';
  }
  row.appendChild(dl);
  row.appendChild(ed);
  panel.appendChild(row);

  if (artifact && AUTOFILL_FEATURE_FLAGS.coverLetter) {
    mountCoverLetterReviewUi(panel, {
      artifact,
      jobDescription: lastResumeGenerationRequest?.jobDescription || '',
      initialLimits: {
        allowed: true,
        quotaPeriod: currentPlanEntitlements.planTier === 'free'
          ? 'month'
          : 'day',
        quotaLimit: currentPlanEntitlements.coverLettersMonthlyLimit ?? 25,
        quotaRemaining:
          currentPlanEntitlements.coverLettersMonthlyLimit ?? 25,
        dailyLimit: 25,
        dailyRemaining: 25,
        itemRegenerationLimit: 3,
        itemRegenerationsRemaining: 3,
      },
      sendMessage: (message) => new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: 'Cover-letter service is unavailable.' });
            return;
          }
          resolve(response || { ok: false, error: 'Cover-letter service returned no response.' });
        });
      }),
      onArtifactUpdated: setCurrentGeneratedArtifact,
      download: (attachment) => downloadGeneratedPdf(attachment.base64, attachment.filename),
      onUpgrade: () => {
        window.open(API_ENDPOINTS.PRICING, '_blank', 'noopener,noreferrer');
      },
    });
  }
  addResumePanelDismiss(panel);
}

/** Opens the in-card resume-generation panel: countdown → result / error. */
function openResumePanel(
  card: HTMLElement,
  job: JobInfo,
  resumeId: string,
  templateId: string,
  jobDescription: string,
  focusKeywords: string[] = [],
  baselineScore?: number,
): void {
  lastResumeGenerationRequest = {
    job: { ...job },
    resumeId,
    templateId,
    jobDescription,
    focusKeywords: [...focusKeywords],
    baselineScore,
  };
  card.querySelector('.' + RESUME_PANEL_CLASS)?.remove();
  ensureSpinKeyframes();

  const panel = document.createElement('div');
  panel.className = RESUME_PANEL_CLASS;
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');
  panel.style.cssText = 'position:relative;padding:14px 34px 14px 14px;border-top:1px solid var(--tmo-widget-border);background:var(--tmo-widget-surface-2);';
  card.appendChild(panel);

  const line = document.createElement('div');
  line.style.cssText =
    'display:flex;align-items:center;gap:8px;font-weight:700;color:var(--tmo-widget-ink);font-size:12px;';
  const spinner = document.createElement('div');
  spinner.style.cssText =
    'width:14px;height:14px;flex-shrink:0;border:2px solid var(--tmo-widget-border);border-top-color:var(--tmo-widget-accent);border-radius:50%;animation:tmo-spin 0.8s linear infinite;';
  const msg = document.createElement('span');
  msg.textContent = 'Tailoring your resume…';
  const timer = document.createElement('span');
  timer.style.cssText = 'margin-left:auto;color:var(--tmo-widget-muted);font-weight:600;';
  timer.textContent = '0s';
  line.appendChild(spinner);
  line.appendChild(msg);
  line.appendChild(timer);

  const sub = document.createElement('div');
  sub.style.cssText = 'color:var(--tmo-widget-muted);font-size:11px;margin-top:5px;';
  sub.textContent = 'Matching your saved resume to this job — usually 20–40s.';

  panel.appendChild(line);
  panel.appendChild(sub);

  let seconds = 0;
  const interval = window.setInterval(() => {
    seconds += 1;
    timer.textContent = `${seconds}s`;
  }, 1000);

  chrome.runtime.sendMessage(
    {
      type: 'GENERATE_RESUME',
      jobDescription,
      resumeId,
      templateId,
      companyName: job.company_name || '',
      roleTitle: job.role_title || '',
      jobUrl: window.location.href,
      jobKey: jobMemoryKey({
        jobUrl: job.job_url || window.location.href,
        companyName: job.company_name || '',
        roleTitle: job.role_title || '',
      }),
      outputFilename: generatedResumeFilename(job),
      focusKeywords,
      baselineScore,
      applicationId: trackerApplicationIdFor(job),
    },
    (
      res: {
        ok?: boolean;
        error?: string;
        detail?: string;
        pdfBase64?: string;
        editorUrl?: string;
        baselineScore?: number;
        generatedScore?: number;
        scoreError?: 'limit_reached' | 'scan_failed';
        artifact?: GeneratedResumeArtifactV1;
        structuredFieldsAvailable?: boolean;
      } | undefined
    ) => {
      window.clearInterval(interval);
      if (chrome.runtime.lastError) {
        trackWidgetAnalytics('extension_widget_resume_generated', {
          outcome: 'error',
          template_id: templateId,
          error_code: 'runtime',
        });
        renderResumeError(panel, 'Something went wrong. Please try again.');
        return;
      }
      if (res?.ok && res.pdfBase64) {
        const comparison = buildScoreComparison(res.baselineScore, res.generatedScore);
        trackWidgetAnalytics('extension_widget_resume_generated', {
          outcome: 'success',
          template_id: templateId,
          baseline_score: comparison?.baseline,
          generated_score: comparison?.generated,
          score_delta: comparison?.delta,
          error_code:
            res.structuredFieldsAvailable === false
              ? 'extraction_failed'
              : undefined,
        });
        renderResumeResult(panel, res.pdfBase64, job, res.artifact, res.editorUrl, {
          baselineScore: res.baselineScore,
          generatedScore: res.generatedScore,
          scoreError: res.scoreError,
        });
        if (res.structuredFieldsAvailable === false) {
          const copy = autofillErrorCopy('extraction_failed');
          const notice = document.createElement('p');
          notice.dataset.autofillError = 'extraction_failed';
          notice.setAttribute('role', 'status');
          notice.textContent = `${copy.message} ${copy.recovery}`;
          notice.style.cssText =
            'margin:10px 0 0;padding:9px;border:1px solid var(--tmo-widget-warning-border);border-radius:8px;background:var(--tmo-widget-warning-surface);color:var(--tmo-widget-warning-ink);font-size:11px;line-height:1.4;';
          panel.appendChild(notice);
        }
        return;
      }
      trackWidgetAnalytics('extension_widget_resume_generated', {
        outcome: res?.error === 'limit'
          ? 'limit'
          : res?.error === 'not_signed_in'
            ? 'not_signed_in'
            : res?.error === 'no_base_resume'
              ? 'no_base_resume'
              : res?.error === 'no_job_description'
                ? 'no_job_description'
                : 'error',
        template_id: templateId,
        error_code: res?.error === 'limit' || res?.error === 'compile_failed'
          ? res.error
          : res?.error === 'not_signed_in' || res?.error === 'no_base_resume' || res?.error === 'no_job_description'
            ? res.error
            : 'unknown',
      });
      switch (res?.error) {
        case 'not_signed_in':
          renderResumeError(panel, 'Sign in to TrackMyOPT in the extension first.');
          break;
        case 'no_base_resume':
          renderResumeNeedBase(panel);
          break;
        case 'no_template':
          renderResumeError(panel, 'Select a template and try again.');
          break;
        case 'no_job_description':
          renderResumeError(panel, "Couldn't read this job's description. Open the full posting and try again.");
          break;
        case 'limit':
          renderResumeError(panel, res.detail || 'You have reached your monthly resume limit. Upgrade to generate more.');
          break;
        case 'compile_failed':
          renderResumeError(panel, 'Resume built, but the PDF export failed. Please try again.');
          break;
        default:
          renderResumeError(panel, "Couldn't generate the resume. Please try again.");
      }
    }
  );
}

/** Segmented-control option button for the Settings panel (Expanded / Minimized). */
function viewOptionBtn(label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText = viewOptionStyle(false);
  return b;
}

function viewOptionStyle(selected: boolean): string {
  return [
    'flex:1',
    'padding:8px 0',
    'border-radius:8px',
    'font:inherit',
    'font-size:12px',
    'font-weight:700',
    'cursor:pointer',
    selected ? 'background:#2563eb' : 'background:var(--tmo-widget-surface)',
    selected ? 'color:#fff' : 'color:var(--tmo-widget-ink)',
    selected ? 'border:1px solid #2563eb' : 'border:1px solid var(--tmo-widget-border)',
  ].join(';');
}

function logoSvgFallback(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute(
    'd',
    'M4 14c2.5-1 5-4 6-7 1 3 3.5 6 6 7-2 1.5-4 2.5-6 2.5S6 15.5 4 14z'
  );
  path.setAttribute('fill', 'var(--tmo-color-success-ink)');
  path.setAttribute('opacity', '0.9');
  svg.appendChild(path);
  return svg;
}

function showMessage(message: string, isError: boolean) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    bottom: 110px;
    right: 24px;
    z-index: 2147483647;
    padding: 12px 20px;
    font-size: 14px;
    color: #fff;
    background: ${isError ? 'var(--tmo-color-danger-ink)' : '#059669'};
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

let lastUrl = location.href;
let injectDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const INJECT_DEBOUNCE_MS = 400;

async function injectOrRefreshButton() {
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
  widgetViewportResizeObserver?.disconnect();
  widgetViewportResizeObserver = null;
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
  widgetViewportResizeObserver?.disconnect();
  widgetViewportResizeObserver = null;
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
        const label = prefillButton.querySelector<HTMLElement>('.tmo-action-label');
        if (label) label.textContent = 'Prefill application + resume';
        prefillButton.title =
          'Prefill profile fields and attach the custom resume generated for this job';
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
