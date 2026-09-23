/**
 * Pure-ish job identity helpers used by the job-portal widget.
 */

import type { JobInfo } from './job-posting-scrape';
import type { JobContextIdentity } from './resume-autofill-contract';
import { jobUrlsReferToSameJob, normalizeJobIdentityText } from './resume-autofill-contract';
import { WIDGET_ROOT_ID } from './widget-dom-ids';
import { buildResumePdfFilename } from './resume-filename';

export function jobFingerprint(job: JobInfo): string {
  const url = new URL(window.location.href);
  url.hash = '';
  return [
    url.toString(),
    (job.company_name || '').trim().toLowerCase(),
    (job.role_title || '').trim().toLowerCase(),
  ].join('|');
}

export function jobContextFor(job: JobInfo): JobContextIdentity {
  return {
    jobUrl: window.location.href,
    companyName: job.company_name || '',
    roleTitle: job.role_title || '',
  };
}

export function generatedResumeFilename(job: JobInfo): string {
  return buildResumePdfFilename({ latex: '', jobDescription: '', jobTitle: job.role_title });
}

export type WidgetJobSnapshot = Pick<
  JobInfo,
  'company_name' | 'role_title' | 'job_url' | 'location' | 'salary_text' | 'company_logo_url'
>;

export function widgetJobSnapshot(job: JobInfo): WidgetJobSnapshot {
  return {
    company_name: job.company_name,
    role_title: job.role_title,
    job_url: job.job_url,
    location: job.location,
    salary_text: job.salary_text,
    company_logo_url: job.company_logo_url,
  };
}

export function shouldRefreshWidget(existing: HTMLElement, nextJob: JobInfo): boolean {
  let current: Partial<WidgetJobSnapshot> = {};
  try {
    current = JSON.parse(existing.dataset.tmoJobSnapshot || '{}') as Partial<WidgetJobSnapshot>;
  } catch {
    return true;
  }
  const next = widgetJobSnapshot(nextJob);
  if (
    !current.job_url || !jobUrlsReferToSameJob(current.job_url, next.job_url) ||
    (current.company_name && next.company_name && normalizeJobIdentityText(current.company_name) !== normalizeJobIdentityText(next.company_name)) ||
    (current.role_title && next.role_title && normalizeJobIdentityText(current.role_title) !== normalizeJobIdentityText(next.role_title))
  ) return true;

  // Metadata enrichment is painted in place, retaining focus, scroll and tools.
  return false;
}

/** Ignore our own animations, status text and modals in the page observer. */
export function hasPortalPageMutation(records: MutationRecord[]): boolean {
  const owned = (node: Node): boolean => {
    const element = node.nodeType === 1 ? node as Element : node.parentElement;
    return Boolean(element?.closest('[id^="tmo-"],.tmo-smart-answer-note'));
  };
  return records.some(record => {
    if (owned(record.target)) return false;
    if (Array.from(record.removedNodes).some(node => node.nodeType === 1 &&
        (node as Element).id === WIDGET_ROOT_ID && !node.isConnected)) return true;
    const changed = [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)];
    return changed.length === 0 || changed.some(node => !owned(node));
  });
}
