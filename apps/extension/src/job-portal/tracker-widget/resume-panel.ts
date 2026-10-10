import {
  host,
  getLastResumeGenerationRequest,
  setLastResumeGenerationRequest,
  getRegenerationRecheckPending,
  setRegenerationRecheckPending,
} from './state';
import { sendToolMessage } from './tool-common';
import { icon } from '../../shared/icons';
import { API_ENDPOINTS } from '../../shared/config';
import { buildScoreComparison, jobMemoryKey } from '../../prefill/smart-flow';
import { jobUrlsReferToSameJob, type GeneratedResumeArtifactV1 } from '../../resume/resume-autofill-contract';
import { mountCoverLetterReviewUi } from '../../resume/cover-letter-review';
import { AUTOFILL_FEATURE_FLAGS } from '../../prefill/autofill-feature-flags';
import { autofillErrorCopy } from '../../prefill/autofill-errors';
import { JobInfo } from '../../job/job-posting-scrape';
import { RESUME_PANEL_CLASS } from '../../widget/widget-dom-ids';
import { addResumePanelDismiss, renderResumeError, renderResumeNeedBase } from '../job-portal-resume-panel-ui';
import { generatedResumeFilename } from '../job-portal-job-helpers';
import { downloadGeneratedPdf, ensureSpinKeyframes, paintPrefillButton, resumeMiniBtn } from '../job-portal-widget-ui';

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
  generatedFilename?: string,
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

  if (getRegenerationRecheckPending()) {
    const recheckNote = document.createElement('div');
    recheckNote.style.cssText =
      'margin:0 0 10px;padding:8px 9px;border:1px solid #f59e0b;border-radius:8px;background:var(--tmo-color-warning-surface);color:var(--tmo-color-warning-ink);font-size:11.5px;line-height:1.45;';
    recheckNote.textContent =
      'Resume link refreshed. Fields filled earlier were not cleared or refilled; review them against this resume before submitting.';
    panel.appendChild(recheckNote);
    setRegenerationRecheckPending(false);
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
  const filename = artifact?.pdf.filename || generatedFilename || generatedResumeFilename(job);
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
      jobDescription: getLastResumeGenerationRequest()?.jobDescription || '',
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
  const generationUrl = location.href;
  setLastResumeGenerationRequest({
    job: { ...job },
    resumeId,
    templateId,
    jobDescription,
    focusKeywords: [...focusKeywords],
    alignJobTitles,
    baselineScore,
  });
  card.querySelector('.' + RESUME_PANEL_CLASS)?.remove();
  ensureSpinKeyframes();

  const panel = document.createElement('div');
  panel.className = RESUME_PANEL_CLASS;
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');
  panel.style.cssText = 'position:relative;padding:14px 34px 14px 14px;border-top:1px solid var(--tmo-widget-border);background:var(--tmo-widget-surface-2);';
  (card.querySelector('.tmo-job-widget-scroll-body') || card).appendChild(panel);

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
    if (!panel.isConnected) { window.clearInterval(interval); return; }
    seconds += 1;
    timer.textContent = `${seconds}s`;
  }, 1000);

  sendToolMessage(
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
        filename?: string;
        editorUrl?: string;
        baselineScore?: number;
        generatedScore?: number;
        scoreError?: 'limit_reached' | 'scan_failed';
        artifact?: GeneratedResumeArtifactV1;
        structuredFieldsAvailable?: boolean;
      } | undefined
    ) => {
      window.clearInterval(interval);
      if (!panel.isConnected || !jobUrlsReferToSameJob(generationUrl, location.href)) return;
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
        }, res.filename);
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
    },
    180_000,
  );
}

