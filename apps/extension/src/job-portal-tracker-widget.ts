/**
 * Job-portal floating tracker widget + in-widget AI/resume panels.
 * Module-level host bridges back into content-job-portal session state.
 */

import { mountAlignJobTitlesControl } from './align-job-titles-control';
import { RESUME_TEMPLATES_FOR_PANEL } from './agent/panel-templates';
import {
  type GeneratedResumeAttachment,
  type PrefillCoverageResult,
} from './easy-apply-engine';
import { openFeedbackModal } from './feedback';
import { icon } from './icons';
import {
  createResumeStatusRow,
  paintResumeStatusRow,
  prefillEntryCopy,
  resumeStatusAfterPrefill,
} from './resume-status-row';
import { API_ENDPOINTS, WEBSITE_URL } from './config';
import { classifySponsorship } from './sponsorship-signal';
import { buildJobSaveSnapshot } from './job-save-snapshot';
import {
  buildScoreComparison,
  jobMemoryKey,
  normalizeOptClockNudge,
  type DuplicateApplicationNotice,
} from './smart-flow';
import {
  type WidgetAnalyticsEvent,
  type WidgetAnalyticsProperties,
} from './widget-platform';
import {
  normalizeJobIdentityText,
  type GeneratedResumeArtifactV1,
} from './resume-autofill-contract';
import type { ArtifactInvalidReason } from './resume-artifact-lifecycle';
import type { AutofillPreferences } from './autofill-preferences';
import { mountCoverLetterReviewUi } from './cover-letter-review';
import { AUTOFILL_FEATURE_FLAGS } from './autofill-feature-flags';
import type { AutofillPlanEntitlements } from './autofill-plan-entitlements';
import { autofillErrorCopy } from './autofill-errors';
import {
  type PrefillArtifactStateReason,
  type PrefillSourceType,
} from './prefill-telemetry';
import {
  normalizeSavedPrivateApplicationAnswers,
  type SensitiveAnswerSession,
} from './sensitive-autofill';
import type { JobPortalLoginCredential } from './job-portal-login';
import {
  approvalMatchesJob,
  createPrivateApprovalBinding,
  type PrivateApprovalBinding,
} from './private-approval-session';
import { JobInfo, getJobInfo } from './job-posting-scrape';
import {
  DefaultView,
  clearSessionCollapsedOverride,
  hideForAllSites,
  hideForThisSite,
  hideForThisVisit,
  readSessionCollapsedOverride,
  readWidgetPosition,
  saveWidgetPosition,
  setCollapsedPref,
  setDefaultViewPref,
} from './widget-preferences';
import {
  ARTIFACT_INACTIVE_FALLBACK_CLASS,
  ARTIFACT_STALE_BANNER_CLASS,
  RESUME_PANEL_CLASS,
  WIDGET_ROOT_ID,
} from './widget-dom-ids';
import { resolveJobDescription, scrapeJobDescription } from './job-description-scrape';
import { renderAiError } from './job-portal-ai-message-ui';
import { renderAiResult } from './job-portal-ai-result-ui';
import {
  addResumePanelDismiss,
  renderResumeError,
  renderResumeNeedBase,
} from './job-portal-resume-panel-ui';
import {
  openApplicationStatusDialog,
  type ApplicationSaveStatus,
} from './job-portal-application-status-dialog';
import { attachDragBehavior } from './job-portal-drag';
import {
  generatedResumeFilename,
  jobContextFor,
  jobFingerprint,
  widgetJobSnapshot,
} from './job-portal-job-helpers';
import { paintPrefillCoverage } from './job-portal-prefill-coverage-ui';
import { applyWidgetThemeScope } from './job-portal-widget-theme';
import {
  actionBtn,
  downloadGeneratedPdf,
  ensureSpinKeyframes,
  iconBtn,
  logoSvgFallback,
  modalFieldLabel,
  modalSelect,
  paintPrefillButton,
  paintSponsorshipPill,
  resumeMiniBtn,
  selectField,
  showMessage,
  textField,
  viewOptionBtn,
  viewOptionStyle,
} from './job-portal-widget-ui';

export type PrefillExecutionSnapshot = {
  result: PrefillCoverageResult;
  hasResume: boolean;
  hasCoverLetter: boolean;
  jobDescription?: string;
  sourceType: PrefillSourceType;
  artifactStateReason: PrefillArtifactStateReason;
  stoppedReason?: 'expired' | 'job_changed' | 'invalid';
};

export type JobTrackerWidgetHost = {
  trackWidgetAnalytics: (
    event: WidgetAnalyticsEvent,
    properties?: WidgetAnalyticsProperties,
  ) => void;
  trackWidgetAnalyticsOnce: (
    event: WidgetAnalyticsEvent,
    job: JobInfo,
    properties?: WidgetAnalyticsProperties,
  ) => void;
  getArtifactStaleReason: () => ArtifactInvalidReason | null;
  rememberTrackerApplicationId: (job: JobInfo, applicationId?: string) => void;
  trackerApplicationIdFor: (job: JobInfo) => string | undefined;
  reconcileArtifactAvailabilityOnWidgetMount: (
    job: JobInfo,
    prefillBtn: HTMLButtonElement,
    artifactInactiveFallback: HTMLElement,
  ) => Promise<void>;
  generatedResumeFor: (job: JobInfo) => GeneratedResumeAttachment | undefined;
  executeResolvedPrefill: (
    job: JobInfo,
    mode: AutofillPreferences['mode'],
  ) => Promise<PrefillExecutionSnapshot>;
  trackPrefillExecution: (
    execution: PrefillExecutionSnapshot,
    mode: AutofillPreferences['mode'],
    outcome: 'success' | 'error',
  ) => void;
  trackPrefillRuntimeFailure: (
    mode: AutofillPreferences['mode'],
    hasResume?: boolean,
  ) => void;
  mountScreeningQuestionReviews: (
    card: HTMLElement,
    job: JobInfo,
    hasResolvedArtifact?: boolean,
    resolvedJobDescription?: string,
  ) => Promise<void>;
  markPostSaveSuggestionSeen: (job: JobInfo) => Promise<boolean>;
  paintGuidedStateUi: () => void;
  stopGuidedAutopilot: () => Promise<void>;
  setCurrentGeneratedArtifact: (artifact: GeneratedResumeArtifactV1) => void;
  markCurrentArtifactInvalid: (
    reason: ArtifactInvalidReason,
    discard: boolean,
  ) => void;
  getPlanEntitlements: () => Readonly<AutofillPlanEntitlements>;
  scheduleInject: () => void;
  clearPrivateApplicationApproval: () => void;
  commitSensitiveApproval: (payload: {
    login: JobPortalLoginCredential | null;
    session: SensitiveAnswerSession;
    binding: PrivateApprovalBinding;
  }) => void;
};

let host: JobTrackerWidgetHost;

/** Wire content-script session/helpers before mounting the widget. */
export function setJobTrackerWidgetHost(next: JobTrackerWidgetHost): void {
  host = next;
}

type LastResumeGenerationRequest = {
  job: JobInfo;
  resumeId: string;
  templateId: string;
  jobDescription: string;
  focusKeywords: string[];
  alignJobTitles?: boolean;
  baselineScore?: number;
};

let lastResumeGenerationRequest: LastResumeGenerationRequest | null = null;
let regenerationRecheckPending = false;
let latestJobFitScore: { jobFingerprint: string; score: number } | null = null;
let widgetViewportResizeObserver: ResizeObserver | null = null;

/** Used by screening drafts when a tailored JD was already captured. */
export function getLastResumeJobDescription(): string {
  return lastResumeGenerationRequest?.jobDescription || '';
}

export function disconnectWidgetViewportObserver(): void {
  widgetViewportResizeObserver?.disconnect();
  widgetViewportResizeObserver = null;
}


export function createSensitiveAnswerPanel(job: JobInfo): HTMLElement {
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
      host.clearPrivateApplicationApproval();
      status.textContent =
        'This application changed. Review the private answers again for the current job.';
      return;
    }
    const nextSession: SensitiveAnswerSession = {
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
    host.commitSensitiveApproval({
      login: loadedJobPortalLogin,
      session: nextSession,
      binding: panelApprovalBinding,
    });
    status.textContent =
      loadedJobPortalLogin
        ? 'Approved for this application. Prefill can use the masked portal login and these exact answers.'
        : 'Approved for this application. Prefill can use these exact answers.';
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

export function createJobTrackerWidget(job: JobInfo, defaultView: DefaultView): HTMLElement {
  const root = document.createElement('div');
  root.id = WIDGET_ROOT_ID;
  applyWidgetThemeScope(root);
  root.dataset.tmoJobSnapshot = JSON.stringify(widgetJobSnapshot(job));
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'TrackMyOPT job assistant');
  host.trackWidgetAnalyticsOnce('extension_widget_shown', job, { default_view: defaultView });

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
    host.trackWidgetAnalyticsOnce(
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
      host.trackWidgetAnalyticsOnce(
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

  const initialPrefillCopy = prefillEntryCopy(Boolean(host.generatedResumeFor(job)));
  const prefillBtn = actionBtn(icon('zap', 16, '#fff'), initialPrefillCopy.label, {
    sublabel: initialPrefillCopy.sublabel,
    chip: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
  });
  prefillBtn.classList.add('tmo-prefill-button');
  prefillBtn.title = initialPrefillCopy.title;
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
        prior.baselineScore,
        prior.alignJobTitles,
      );
    } else {
      resumeBtn.click();
    }
  });
  artifactStaleBanner.appendChild(artifactStaleCopy);
  artifactStaleBanner.appendChild(artifactStaleAction);
  if (host.getArtifactStaleReason()) artifactStaleBanner.style.display = 'block';
  const artifactInactiveFallback = document.createElement('div');
  artifactInactiveFallback.className = ARTIFACT_INACTIVE_FALLBACK_CLASS;
  artifactInactiveFallback.style.cssText =
    'display:none;padding:10px 12px;border-top:1px solid #f59e0b;background:var(--tmo-color-warning-surface);color:var(--tmo-color-warning-ink);font-size:11.5px;font-weight:800;line-height:1.45;';

  const rowDivider = () => {
    const d = document.createElement('div');
    d.style.cssText = 'height:1px;background:var(--tmo-widget-border);margin:0 12px;';
    return d;
  };

  const resumeStatusRow = createResumeStatusRow();
  toolsPanel.appendChild(resumeStatusRow);
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
    stop.addEventListener('click', () => void host.stopGuidedAutopilot());
    guidedHost.append(copy, stop);
    toolsPanel.appendChild(guidedHost);
    toolsPanel.appendChild(createSensitiveAnswerPanel(job));
    host.paintGuidedStateUi();
  }
  toolsPanel.appendChild(artifactStaleBanner);
  toolsPanel.appendChild(artifactInactiveFallback);
  toolsPanel.appendChild(rowDivider());
  toolsPanel.appendChild(resumeBtn);
  toolsPanel.appendChild(rowDivider());
  toolsPanel.appendChild(aiBtn);
  void host.reconcileArtifactAvailabilityOnWidgetMount(
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
    if (await host.markPostSaveSuggestionSeen(job)) nextStepHost.style.display = 'flex';
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
        const execution = await host.executeResolvedPrefill(job, 'step_by_step');
        hasResume = execution.hasResume;
        const result = execution.result;
        paintPrefillCoverage(prefillResultLine, result);
        // Report what actually happened to the file, not what was offered:
        // a resume can be resolved and still not attach when the upload field
        // is on a later step or already holds a file.
        const status = resumeStatusAfterPrefill({
          attachedCount: result.groups.resume.filled,
          hasResume: execution.hasResume,
        });
        paintResumeStatusRow(resumeStatusRow, status.state, status.detail);
        if (AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
          await host.mountScreeningQuestionReviews(
            card,
            job,
            execution.hasResume,
            execution.jobDescription,
          );
        }
        host.trackPrefillExecution(execution, 'step_by_step', 'success');
      } catch {
        host.trackPrefillRuntimeFailure('step_by_step', hasResume);
      } finally {
        prefillBtn.disabled = false;
        prefillBtn.setAttribute('aria-busy', 'false');
        prefillBtn.classList.remove('tmo-is-filling');
        paintPrefillButton(
          prefillBtn,
          Boolean(hasResume || host.generatedResumeFor(job)),
        );
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
          host.trackWidgetAnalytics('extension_widget_job_saved', {
            status,
            outcome: 'error',
          });
          return;
        }
        if (response?.ok) {
          host.rememberTrackerApplicationId(job, response.id);
          markJobSaved(status === 'Applied' ? 'Applied' : 'Wishlist');
          void showPostSaveSuggestionOnce();
          showMessage(status === 'Applied' ? 'Application added to Job Tracker!' : 'Job saved to your Wishlist!', false);
          host.trackWidgetAnalytics('extension_widget_job_saved', {
            status,
            outcome: 'success',
          });
        } else {
          if (label) label.textContent = prev;
          savedBadge.textContent = 'Not saved';
          showMessage(response?.error || 'Failed to save job', true);
          host.trackWidgetAnalytics('extension_widget_job_saved', {
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
          host.rememberTrackerApplicationId(job, res.id);
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

type SavedResumeOption = {
  id: string;
  filename: string;
  updatedAt?: string | null;
};

// Single source shared with the side panel. See agent/panel-templates.ts.
const SIDE_PANEL_TEMPLATES = RESUME_TEMPLATES_FOR_PANEL;

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

/** Render the score ring, missing-keyword chips, and the resume-generator chain. */
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

export function openAiAnalysisWithDescription(
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
    host.trackWidgetAnalytics('extension_widget_job_analyzed', {
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
        host.trackWidgetAnalytics('extension_widget_job_analyzed', {
          outcome: 'error',
          error_code: 'runtime',
        });
        renderAiError(body, 'error', card, job);
        return;
      }
      if (!res || !res.ok) {
        const errorCode = res?.error || 'unknown';
        host.trackWidgetAnalytics('extension_widget_job_analyzed', {
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
      host.trackWidgetAnalytics('extension_widget_job_analyzed', {
        outcome: 'success',
        score: res.matchScore,
        matched_keywords_count: res.matchedKeywords?.length ?? 0,
        missing_keywords_count: res.missingKeywords?.length ?? 0,
      });
      renderAiResult(
        body,
        res,
        (score) => rememberJobFitScore(job, score),
        (missing) => {
          cleanup();
          openResumeChooser(card, job, missing);
        },
      );
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

export function openResumeChooserWithDescription(
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
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]),select:not([disabled]),input:not([disabled])'
      )
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

      const alignJobTitlesControl = mountAlignJobTitlesControl();

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
          alignJobTitlesControl.getValue(),
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
      body.appendChild(alignJobTitlesControl.row);
      body.appendChild(actions);
      resumeSelect.focus();
    }
  );
}

export function renderResumeResult(
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
    host.setCurrentGeneratedArtifact(artifact);
  } else {
    host.markCurrentArtifactInvalid('invalid', true);
  }

  const card = panel.parentElement;
  paintPrefillButton(
    card?.querySelector<HTMLButtonElement>('.tmo-prefill-button'),
    Boolean(artifact),
  );

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
        quotaPeriod: host.getPlanEntitlements().planTier === 'free'
          ? 'month'
          : 'day',
        quotaLimit: host.getPlanEntitlements().coverLettersMonthlyLimit ?? 25,
        quotaRemaining:
          host.getPlanEntitlements().coverLettersMonthlyLimit ?? 25,
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
      onArtifactUpdated: host.setCurrentGeneratedArtifact,
      download: (attachment) => downloadGeneratedPdf(attachment.base64, attachment.filename),
      onUpgrade: () => {
        window.open(API_ENDPOINTS.PRICING, '_blank', 'noopener,noreferrer');
      },
    });
  }
  addResumePanelDismiss(panel, host.scheduleInject);
}

/** Opens the in-card resume-generation panel: countdown → result / error. */
export function openResumePanel(
  card: HTMLElement,
  job: JobInfo,
  resumeId: string,
  templateId: string,
  jobDescription: string,
  focusKeywords: string[] = [],
  baselineScore?: number,
  alignJobTitles = false,
): void {
  lastResumeGenerationRequest = {
    job: { ...job },
    resumeId,
    templateId,
    jobDescription,
    focusKeywords: [...focusKeywords],
    alignJobTitles,
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
      applicationId: host.trackerApplicationIdFor(job),
      alignJobTitles,
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
        host.trackWidgetAnalytics('extension_widget_resume_generated', {
          outcome: 'error',
          template_id: templateId,
          error_code: 'runtime',
        });
        renderResumeError(panel, 'Something went wrong. Please try again.', host.scheduleInject);
        return;
      }
      if (res?.ok && res.pdfBase64) {
        const comparison = buildScoreComparison(res.baselineScore, res.generatedScore);
        host.trackWidgetAnalytics('extension_widget_resume_generated', {
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
      host.trackWidgetAnalytics('extension_widget_resume_generated', {
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
          renderResumeError(panel, 'Sign in to TrackMyOPT in the extension first.', host.scheduleInject);
          break;
        case 'no_base_resume':
          renderResumeNeedBase(panel, host.scheduleInject);
          break;
        case 'no_template':
          renderResumeError(panel, 'Select a template and try again.', host.scheduleInject);
          break;
        case 'no_job_description':
          renderResumeError(panel, "Couldn't read this job's description. Open the full posting and try again.", host.scheduleInject);
          break;
        case 'limit':
          renderResumeError(panel, res.detail || 'You have reached your monthly resume limit. Upgrade to generate more.', host.scheduleInject);
          break;
        case 'compile_failed':
          renderResumeError(panel, 'Resume built, but the PDF export failed. Please try again.', host.scheduleInject);
          break;
        default:
          renderResumeError(panel, "Couldn't generate the resume. Please try again.", host.scheduleInject);
      }
    }
  );
}

