import { requestJobContextSession } from '../../job/job-context-session';
import { getJobInfo, type JobInfo } from '../../job/job-posting-scrape';
import { findApplicationForm } from '../../easy-apply/easy-apply-engine';
import { isApplicationSuccessPage } from '../job-portal-application-success';
import {
  createSubmissionCoordinator,
  type SubmissionCoordinator,
} from '../../submission/submission-coordinator';
import { normalizeSubmissionJob, type SubmissionJobSnapshot } from '../../submission/submission-protocol';
import type { AttemptView } from '../../submission/submission-lifecycle';
import { currentEffectiveConfig, loadEffectiveConfig } from '../../platform-config/effective-config-client';
import {
  mountSubmissionStatus,
  setSubmissionUiActions,
  setSubmissionUiState,
} from '../job-portal-submission-status-ui';

/** Stored posting context is trusted for at most this long. */
const JOB_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000;
let coordinator: SubmissionCoordinator | null = null;

function snapshotFrom(job: JobInfo | null | undefined): SubmissionJobSnapshot | null {
  if (!job) return null;
  return normalizeSubmissionJob({
    company_name: job.company_name, role_title: job.role_title,
    job_url: job.job_url || window.location.href, location: job.location,
  });
}

/** The posting being applied to: this page, or the posting saved earlier in this tab. */
async function currentJob(): Promise<SubmissionJobSnapshot | null> {
  const fromPage = snapshotFrom(getJobInfo());
  if (fromPage) return fromPage;
  const stored = await requestJobContextSession('read');
  const context = stored?.context as { job?: JobInfo; storedAt?: number } | undefined;
  return context?.job && Date.now() - (context.storedAt ?? 0) <= JOB_CONTEXT_MAX_AGE_MS ? snapshotFrom(context.job) : null;
}

function showAttempt(view: AttemptView): void {
  setSubmissionUiState({ kind: 'attempt', attempt: view });
}

/** Top frame only. Idempotent; never clicks or submits anything. */
export function startSubmissionTracking(): void {
  if (coordinator || window.top !== window.self) return;
  void loadEffectiveConfig();
  coordinator = createSubmissionCoordinator({
    win: window,
    getJob: currentJob,
    send: message => chrome.runtime.sendMessage(message),
    config: currentEffectiveConfig,
    isConfirmationPage: isApplicationSuccessPage,
    findApplicationRoot: findApplicationForm,
    onStatus: showAttempt,
    onUnattributedConfirmation: () => setSubmissionUiState({ kind: 'unattributed_confirmation' }),
  });
  setSubmissionUiActions({ confirmManually: () => coordinator?.confirmManually() ?? Promise.resolve(null) });
  coordinator.start();
}

/** Replaces the old success-page auto-add: page evidence counts only for an
 * attempt started in this tab; otherwise the applicant is asked. */
export function checkSubmissionConfirmationPage(): void {
  void coordinator?.checkConfirmationPage().catch(() => {});
}

export function handleSubmissionStatusMessage(attempt: unknown): void {
  const view = attempt as AttemptView | null;
  if (!view || typeof view.attemptId !== 'string' || typeof view.status !== 'string') return;
  coordinator?.applyStatus(view);
}

/** Re-paint after the widget re-renders its card. */
export function remountSubmissionStatus(): void {
  mountSubmissionStatus();
}

export function stopSubmissionTracking(): void {
  coordinator?.stop();
  coordinator = null;
}
