import { host, rememberJobFitScore } from './state';
import { sendToolMessage, prepareJobTool } from './tool-common';
import { openResumeChooser } from './resume-chooser';
import { widgetActiveElement } from '../../widget/widget-dom';
import { JobInfo } from '../../job/job-posting-scrape';
import { resolveJobDescription } from '../../job/job-description-scrape';
import { renderAiError } from '../job-portal-ai-message-ui';
import { renderAiResult } from '../job-portal-ai-result-ui';
import { applyWidgetThemeScope } from '../job-portal-widget-theme';
import { ensureSpinKeyframes } from '../job-portal-widget-ui';

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
export function openAiAnalysis(card: HTMLElement, job: JobInfo): void {
  // Capture the posting text before mounting our modal so our own UI can never
  // leak into the analyzed job description. On apply routes, resolve the
  // sibling listing page so we score against the real JD.
  void prepareJobTool(card, card.querySelector('.tmo-analysis-button'), async (isCurrent) => {
    if (document.getElementById('tmo-ai-analysis')) return;
    const jobDescription = await resolveJobDescription();
    if (isCurrent()) openAiAnalysisWithDescription(card, job, jobDescription);
  });
}

export function openAiAnalysisWithDescription(
  card: HTMLElement,
  job: JobInfo,
  jobDescription: string,
): void {
  const actionUrl = location.href;
  const focused = widgetActiveElement();
  const returnFocusTo = focused instanceof HTMLElement ? focused : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-ai-analysis';
  overlay.setAttribute('popover', 'manual');
  applyWidgetThemeScope(overlay);
  overlay.style.cssText = `
    position:fixed;inset:0;width:100%;height:100%;margin:0;border:0;box-sizing:border-box;z-index:2147483647;background:var(--tmo-widget-overlay);
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
    document.removeEventListener('tmo-page-context-changed', cleanup);
    try { overlay.hidePopover?.(); } catch { /* already closed */ }
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      cleanup();
    }
    if (event.key === 'Tab') {
      const items = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])'));
      const first = items[0]; const last = items[items.length - 1];
      if (first && event.shiftKey && widgetActiveElement() === first) { event.preventDefault(); last.focus(); }
      else if (last && !event.shiftKey && widgetActiveElement() === last) { event.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('tmo-page-context-changed', cleanup);
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

  sendToolMessage(
    { type: 'ANALYZE_JOB_FIT', jobDescription },
    (res: AnalyzeJobFitResponse | undefined) => {
      if (!overlay.isConnected || !card.isConnected || location.href !== actionUrl) return;
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
