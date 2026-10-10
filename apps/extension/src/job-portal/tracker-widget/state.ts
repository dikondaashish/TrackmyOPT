import type { PrefillUndoResult } from '../../prefill/prefill-undo';
import { type GeneratedResumeAttachment, type PrefillCoverageResult } from '../../easy-apply/easy-apply-engine';
import { type WidgetAnalyticsEvent, type WidgetAnalyticsProperties } from '../../widget/widget-platform';
import { type GeneratedResumeArtifactV1 } from '../../resume/resume-autofill-contract';
import type { ArtifactInvalidReason } from '../../resume/resume-artifact-lifecycle';
import type { AutofillPreferences } from '../../prefill/autofill-preferences';
import type { AutofillPlanEntitlements } from '../../prefill/autofill-plan-entitlements';
import { type PrefillArtifactStateReason, type PrefillSourceType } from '../../prefill/prefill-telemetry';
import { JobInfo } from '../../job/job-posting-scrape';
import { jobFingerprint } from '../job-portal-job-helpers';
/** Module-level state for the job tracker widget: host bridge, last resume request, fit score, viewport observer. Each variable lives only here. */

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
  undoLastPrefill: () => Promise<PrefillUndoResult>;
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
};

export let host: JobTrackerWidgetHost;

/** Wire content-script session/helpers before mounting the widget. */
export function setJobTrackerWidgetHost(next: JobTrackerWidgetHost): void {
  host = next;
}

export type LastResumeGenerationRequest = {
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


export function rememberJobFitScore(job: JobInfo, score: number): void {
  if (!Number.isFinite(score)) return;
  latestJobFitScore = {
    jobFingerprint: jobFingerprint(job),
    score: Math.max(0, Math.min(100, score)),
  };
}

export function rememberedJobFitScore(job: JobInfo): number | undefined {
  return latestJobFitScore?.jobFingerprint === jobFingerprint(job)
    ? latestJobFitScore.score
    : undefined;
}
export function getLastResumeGenerationRequest(): LastResumeGenerationRequest | null {
  return lastResumeGenerationRequest;
}

export function setLastResumeGenerationRequest(next: LastResumeGenerationRequest | null): void {
  lastResumeGenerationRequest = next;
}

export function getRegenerationRecheckPending(): boolean {
  return regenerationRecheckPending;
}

export function setRegenerationRecheckPending(next: boolean): void {
  regenerationRecheckPending = next;
}

/** Disconnect any previous viewport observer and remember the new one. */
export function replaceWidgetViewportObserver(next: ResizeObserver): void {
  widgetViewportResizeObserver?.disconnect();
  widgetViewportResizeObserver = next;
}

