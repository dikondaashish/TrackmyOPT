import { rememberedJobFitScore } from './state';
import { sendToolMessage, prepareJobTool, type SavedResumeOption } from './tool-common';
import { openResumePanel } from './resume-panel';
import { widgetActiveElement } from '../../widget/widget-dom';
import { mountAlignJobTitlesControl } from '../../prefill/align-job-titles-control';
import { RESUME_TEMPLATES_FOR_PANEL } from '../../agent/panel-templates';
import { icon } from '../../shared/icons';
import { WEBSITE_URL } from '../../shared/config';
import { JobInfo } from '../../job/job-posting-scrape';
import { resolveJobDescription } from '../../job/job-description-scrape';
import { applyWidgetThemeScope } from '../job-portal-widget-theme';
import { ensureSpinKeyframes, modalFieldLabel, modalSelect, resumeMiniBtn } from '../job-portal-widget-ui';

// Single source shared with the side panel. See agent/panel-templates.ts.
const SIDE_PANEL_TEMPLATES = RESUME_TEMPLATES_FOR_PANEL;
export function openResumeChooser(card: HTMLElement, job: JobInfo, analyzedMissingKeywords: string[] = []): void {
  void prepareJobTool(card, card.querySelector('.tmo-resume-button'), async (isCurrent) => {
    if (document.getElementById('tmo-resume-chooser')) return;
    const jobDescription = await resolveJobDescription();
    if (isCurrent()) openResumeChooserWithDescription(card, job, analyzedMissingKeywords, jobDescription);
  });
}

export function openResumeChooserWithDescription(
  card: HTMLElement,
  job: JobInfo,
  analyzedMissingKeywords: string[],
  jobDescription: string,
): void {
  const actionUrl = location.href;
  // Capture before mounting TrackMyOPT's modal so extension UI can never enter
  // the job-description payload or preview.
  const focusKeywords = [...new Set(analyzedMissingKeywords.map((keyword) => keyword.trim()).filter(Boolean))].slice(0, 12);
  const focused = widgetActiveElement();
  const returnFocusTo = focused instanceof HTMLElement ? focused : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-resume-chooser';
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
    document.removeEventListener('tmo-page-context-changed', cleanup);
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
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
    if (event.shiftKey && widgetActiveElement() === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && widgetActiveElement() === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('tmo-page-context-changed', cleanup);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  close.focus();

  try { overlay.showPopover?.(); } catch { overlay.removeAttribute('popover'); }
  sendToolMessage(
    { type: 'LIST_SAVED_RESUMES' },
    (response: {
      ok?: boolean;
      error?: string;
      resumes?: SavedResumeOption[];
      accountEmail?: string;
    } | undefined) => {
      if (!overlay.isConnected || !card.isConnected || location.href !== actionUrl) return;
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

