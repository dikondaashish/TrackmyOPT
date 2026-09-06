/**
 * AI analysis dialog message / error body paint helpers.
 */

import { WEBSITE_URL } from './config';
import type { JobInfo } from './job-posting-scrape';

/** Simple centered message inside the analysis dialog body. */
export function renderAiMessage(body: HTMLElement, message: string): void {
  body.textContent = '';
  const p = document.createElement('p');
  p.textContent = message;
  p.style.cssText = 'margin:0;color:var(--tmo-widget-muted);font-size:13px;line-height:1.5;';
  body.appendChild(p);
}

/** Error / empty states, with an action button where one helps. */
export function renderAiError(body: HTMLElement, error: string, _card: HTMLElement, _job: JobInfo): void {
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
