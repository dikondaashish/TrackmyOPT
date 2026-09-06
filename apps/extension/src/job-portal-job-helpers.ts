/**
 * Pure-ish job identity helpers used by the job-portal widget.
 */

import type { JobInfo } from './job-posting-scrape';
import type { JobContextIdentity } from './resume-autofill-contract';

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
  const safeCompany = (job.company_name || 'company')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  return `TrackMyOPT-resume-${safeCompany}.pdf`;
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
