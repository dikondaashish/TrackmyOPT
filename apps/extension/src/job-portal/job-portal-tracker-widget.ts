import { isolateWidget, widgetActiveElement } from '../widget/widget-dom';
import { createPrefillUndoControl } from '../prefill/prefill-undo-ui';
import { openFeedbackModal } from '../shared/feedback';
import { icon } from '../shared/icons';
import { createResumeStatusRow, paintResumeStatusRow, prefillEntryCopy, resumeStatusAfterPrefill } from '../resume/resume-status-row';
import { WEBSITE_URL } from '../shared/config';
import { classifySponsorship } from '../job/sponsorship-signal';
import { buildJobSaveSnapshot } from '../job/job-save-snapshot';
import { normalizeOptClockNudge, type DuplicateApplicationNotice } from '../prefill/smart-flow';
import { normalizeJobIdentityText } from '../resume/resume-autofill-contract';
import { AUTOFILL_FEATURE_FLAGS } from '../prefill/autofill-feature-flags';
import { JobInfo } from '../job/job-posting-scrape';
import { DefaultView, clearSessionCollapsedOverride, hideForAllSites, hideForThisSite, hideForThisVisit, readSessionCollapsedOverride, readWidgetPosition, saveWidgetPosition, setCollapsedPref, setDefaultViewPref } from '../widget/widget-preferences';
import { ARTIFACT_INACTIVE_FALLBACK_CLASS, ARTIFACT_STALE_BANNER_CLASS, WIDGET_ROOT_ID } from '../widget/widget-dom-ids';
import { resolveJobDescription, scrapeJobDescription } from '../job/job-description-scrape';
import { createSensitiveAnswerPanel } from './job-portal-sensitive-answer-panel';
import { openApplicationStatusDialog, type ApplicationSaveStatus } from './job-portal-application-status-dialog';
import { attachDragBehavior } from './job-portal-drag';
import { widgetJobSnapshot } from './job-portal-job-helpers';
import { paintPrefillCoverage } from './job-portal-prefill-coverage-ui';
import { applyWidgetThemeScope } from './job-portal-widget-theme';
import { SIDEBAR_SHELL_CSS } from './job-portal-sidebar-shell';
import { sidebarHelp } from '../shared/sidebar-help';
import { actionBtn, ensureSpinKeyframes, iconBtn, logoSvgFallback, paintPrefillButton, paintSponsorshipPill, showMessage, viewOptionBtn, viewOptionStyle } from './job-portal-widget-ui';
import {
  host,
  getLastResumeGenerationRequest,
  setRegenerationRecheckPending,
  replaceWidgetViewportObserver,
} from './tracker-widget/state';
import { sendToolMessage, prepareJobTool } from './tracker-widget/tool-common';
import { openAiAnalysis } from './tracker-widget/ai-analysis';
import { openResumeChooser, openResumeChooserWithDescription } from './tracker-widget/resume-chooser';
import { openResumePanel } from './tracker-widget/resume-panel';
export type { PrefillExecutionSnapshot, JobTrackerWidgetHost } from './tracker-widget/state';
export {
  setJobTrackerWidgetHost,
  getLastResumeJobDescription,
  disconnectWidgetViewportObserver,
} from './tracker-widget/state';
export { openAiAnalysisWithDescription } from './tracker-widget/ai-analysis';
export { openResumeChooserWithDescription } from './tracker-widget/resume-chooser';
export { renderResumeResult, openResumePanel } from './tracker-widget/resume-panel';

export function createJobTrackerWidget(job: JobInfo, defaultView: DefaultView): HTMLElement {
  const root = document.createElement('div');
  root.id = WIDGET_ROOT_ID;
  applyWidgetThemeScope(root);
  root.dataset.tmoJobSnapshot = JSON.stringify(widgetJobSnapshot(job));
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'TrackMyOPT job assistant');
  host.trackWidgetAnalyticsOnce('extension_widget_shown', job, { default_view: defaultView });

  // Expanded: inset, full-height rail. Minimized: movable right-edge launcher.
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
      ${SIDEBAR_SHELL_CSS}
      @keyframes tmo-prefill-chip-pulse {
        0%,100% { opacity:1; }
        50% { opacity:.45; }
      }
      #${WIDGET_ROOT_ID} .tmo-prefill-button.tmo-is-filling > span:first-child {
        animation:tmo-prefill-chip-pulse 760ms ease-in-out infinite;
      }
      #${WIDGET_ROOT_ID} .tmo-prefill-button.tmo-is-filling {
        background:var(--tmo-color-action-fill);
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
  // Keep the compact launcher aligned with the website's deep-blue branding.
  const minimizedBrand = {
    navy: '#1e3a8a',
    deepBlue: '#1e40af',
    primary: '#2563eb',
    dot: 'var(--tmo-color-info-border)',
  } as const;

  const tab = document.createElement('div');
  tab.className = 'tmo-minimized-tab';
  tab.style.cssText = `
    display:none;position:relative;align-items:stretch;width:52px;height:60px;margin:0;
    border:1px solid ${minimizedBrand.primary};border-right:none;border-radius:13px 0 0 13px;
    background:${minimizedBrand.deepBlue};box-shadow:0 7px 20px rgba(30,64,175,0.22);overflow:visible;
    transition:width 220ms cubic-bezier(.2,.8,.2,1),box-shadow 220ms ease;
  `;

  const tabOpenBtn = document.createElement('button');
  tabOpenBtn.type = 'button';
  tabOpenBtn.title = 'Click to open · drag vertically to move';
  tabOpenBtn.setAttribute('aria-label', 'Open or vertically move TrackMyOPT job assistant');
  tabOpenBtn.style.cssText = `
    width:51px;height:58px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
    padding:0;border:0;border-radius:12px 0 0 12px;
    background:${minimizedBrand.deepBlue};cursor:pointer;
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
    width:0;height:58px;display:grid;grid-template-columns:repeat(2,4px);
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
  card.id = 'tmo-job-widget-panel';
  tabOpenBtn.setAttribute('aria-controls', card.id);

  // Fixed header stays reachable while the tools scroll below it.
  const header = document.createElement('div');
  header.className = 'tmo-job-widget-header';
  const logoRing = document.createElement('div');
  logoRing.style.cssText = `
    width:28px;height:28px;border-radius:6px;background:transparent;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  `;
  const logoImg = document.createElement('img');
  logoImg.src = extIcon; logoImg.alt = ''; logoImg.width = 28; logoImg.height = 28;
  logoImg.style.cssText = 'object-fit:contain;border-radius:3px;';
  logoImg.addEventListener('error', () => logoImg.replaceWith(logoSvgFallback()));
  logoRing.appendChild(logoImg);

  const title = document.createElement('span');
  title.textContent = 'TrackMyOPT';
  title.style.cssText =
    'font-size:13px;font-weight:700;color:inherit;letter-spacing:-0.02em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  const backBtn = iconBtn('‹', 'Back');
  const settingsBtn = iconBtn('⚙', 'Settings');
  const closeBtn = iconBtn('→', 'Minimize panel');
  settingsBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 6h4m4 0h10M3 12h10m4 0h4M3 18h4m4 0h10"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/></svg>';
  closeBtn.innerHTML = icon('chevronRight', 18);
  backBtn.innerHTML = icon('chevronRight', 18);
  backBtn.style.transform = 'rotate(180deg)';
  for (const button of [backBtn, settingsBtn, closeBtn]) {
    button.style.color = 'inherit'; button.style.width = '40px'; button.style.height = '40px';
  }
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
  jobLine.className = 'tmo-sidebar-job';
  jobLine.style.cssText = `
    margin:0;padding:16px 18px 12px;line-height:1.45;border:0;border-radius:0;
    background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);
  `;

  const roleEl = document.createElement('div');
  roleEl.textContent = job.role_title || 'Selected role';
  roleEl.title = job.role_title || 'Selected role';
  roleEl.style.cssText = 'margin:0;min-width:0;color:var(--tmo-widget-ink);font-size:19px;line-height:1.3;font-weight:700;letter-spacing:-.025em;overflow-wrap:anywhere;';
  roleEl.setAttribute('role', 'heading');
  roleEl.setAttribute('aria-level', '2');
  const savedBadge = document.createElement('span');
  savedBadge.textContent = 'Not saved';
  savedBadge.style.cssText = `
    flex:0 0 auto;padding:5px 9px;border-radius:999px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);
    font-size:11px;font-weight:600;white-space:nowrap;
  `;

  const companyRow = document.createElement('div');
  companyRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0;';
  const companyMark = document.createElement('span');
  companyMark.setAttribute('aria-hidden', 'true');
  companyMark.style.cssText = `
    width:30px;height:30px;flex:0 0 30px;border:1px solid var(--tmo-widget-border);border-radius:8px;background:var(--tmo-widget-surface);
    display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--tmo-widget-accent);font-size:12px;font-weight:800;
  `;
  const companyInitial = (job.company_name || 'C').trim().charAt(0).toUpperCase() || 'C';
  companyMark.textContent = companyInitial;
  const paintCompanyLogo = (url: string) => {
    const companyLogo = document.createElement('img');
    companyLogo.alt = '';
    companyLogo.draggable = false;
    companyLogo.style.cssText = 'width:25px;height:25px;object-fit:contain;display:block;';
    companyLogo.addEventListener('load', () => {
      companyMark.textContent = '';
      companyMark.appendChild(companyLogo);
    });
    companyLogo.addEventListener('error', () => (companyMark.textContent = companyInitial));
    companyLogo.src = url;
  };
  if (job.company_logo_url) paintCompanyLogo(job.company_logo_url);

  const companyEl = document.createElement('div');
  companyEl.textContent = job.company_name || 'Company';
  companyEl.title = job.company_name || 'Company';
  companyEl.style.cssText = 'min-width:0;flex:1;color:var(--tmo-widget-ink);font-size:13px;font-weight:600;overflow-wrap:anywhere;';
  companyRow.appendChild(companyMark);
  companyRow.appendChild(companyEl);
  companyRow.appendChild(savedBadge);

  jobLine.appendChild(roleEl);
  jobLine.appendChild(companyRow);

  const locationEl = document.createElement('div');
    locationEl.textContent = job.location || '';
    locationEl.hidden = !job.location;
    locationEl.style.cssText = 'margin-top:10px;color:var(--tmo-widget-muted);font-size:12px;font-weight:400;overflow-wrap:anywhere;';
    jobLine.appendChild(locationEl);
  const salaryEl = document.createElement('div');
    salaryEl.textContent = job.salary_text || '';
    salaryEl.hidden = !job.salary_text;
    salaryEl.style.cssText = 'margin-top:4px;color:var(--tmo-widget-ink);font-size:12px;font-weight:500;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;';
    jobLine.appendChild(salaryEl);
  // Update late-arriving metadata without replaying entry motion or losing any
  // action state. All handlers share this job object, so they get enrichment too.
  root.addEventListener('tmo-job-enriched', (event) => {
    const next = (event as CustomEvent<JobInfo>).detail;
    for (const key of ['company_name','role_title','location','salary_text','company_logo_url'] as const) {
      if (job[key] || !next[key]) continue;
      job[key] = next[key];
      if (key === 'location') { locationEl.textContent = next[key]!; locationEl.hidden = false; }
      if (key === 'salary_text') { salaryEl.textContent = next[key]!; salaryEl.hidden = false; }
      if (key === 'company_name') { companyEl.textContent = next[key]!; companyEl.title = next[key]!; }
      if (key === 'role_title') { roleEl.textContent = next[key]!; roleEl.title = next[key]!; }
      if (key === 'company_logo_url') paintCompanyLogo(next[key]!);
    }
    const snapshot = JSON.stringify(widgetJobSnapshot(job));
    if (root.dataset.tmoJobSnapshot !== snapshot) root.dataset.tmoJobSnapshot = snapshot;
  });

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

  // Tracker is a secondary action; Prefill owns the primary blue treatment.
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'tmo-sidebar-tracker';
  saveBtn.innerHTML = `${icon('bookmark', 16)}<span class="tmo-action-label" style="flex:1;text-align:left;">Save to job tracker</span>${icon('chevronRight', 16)}`;
  saveBtn.style.cssText = `
    display:flex;align-items:center;gap:10px;width:100%;min-height:46px;margin:0;padding:11px 14px;
    border:1px solid var(--tmo-widget-info-border);border-radius:10px;color:var(--tmo-widget-accent-strong);font:inherit;font-size:13px;font-weight:600;cursor:pointer;
    background:var(--tmo-widget-info-surface);
  `;
  saveBtn.addEventListener('mouseenter', () => {
    if (saveBtn.disabled) return;
    saveBtn.style.filter = 'brightness(1.06)';
  });
  saveBtn.addEventListener('mouseleave', () => {
    saveBtn.style.filter = 'none';
    saveBtn.style.transform = 'none';
  });
  saveBtn.addEventListener('focus', () => (saveBtn.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.35)'));
  saveBtn.addEventListener('blur', () => (saveBtn.style.boxShadow = 'none'));

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-direction:column;gap:14px;padding:0 18px 16px;';

  // Secondary tools grouped in a bordered panel with colored icon chips.
  const toolsPanel = document.createElement('div');
  toolsPanel.style.cssText =
    'border-top:1px solid var(--tmo-widget-border);padding-top:10px;background:var(--tmo-widget-surface);';
  toolsPanel.appendChild(sidebarHelp('Application tools', 'Prefill uses your saved profile. A tailored resume is attached only when one is ready for this job. Review all answers before submitting. TrackMyOPT never submits your application.'));

  const initialPrefillCopy = prefillEntryCopy(Boolean(host.generatedResumeFor(job)));
  const prefillBtn = actionBtn(icon('zap', 16, '#fff'), initialPrefillCopy.label, {
    sublabel: initialPrefillCopy.sublabel,
    chip: 'transparent',
  });
  prefillBtn.classList.add('tmo-prefill-button');
  prefillBtn.style.minHeight = '46px';
  // The visible resume-status row already explains the source. Keep the
  // shared sublabel for repaints, but avoid repeating that copy on the button.
  prefillBtn.querySelector<HTMLElement>('.tmo-action-sublabel')!.style.display = 'none';
  prefillBtn.title = initialPrefillCopy.title;
  const prefillResultLine = document.createElement('div');
  prefillResultLine.className = 'tmo-prefill-result-line';
  prefillResultLine.setAttribute('role', 'status');
  prefillResultLine.setAttribute('aria-live', 'polite');
  prefillResultLine.style.cssText =
    'display:none;align-items:center;flex-wrap:wrap;gap:4px;padding:8px 12px 9px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.4;border-top:1px solid var(--tmo-widget-border);';
  const resumeBtn = actionBtn(icon('fileText', 18, 'var(--tmo-color-stem-accent-strong)'), 'Generate custom resume', {
    sublabel: 'Tailored to this role',
    chip: 'var(--tmo-widget-surface-2)',
  });
  const aiBtn = actionBtn(icon('sparkles', 18, 'var(--tmo-widget-accent-strong)'), 'Analyze with AI', {
    sublabel: 'Fit score & keyword gaps',
    chip: 'var(--tmo-widget-surface-2)',
  });
  resumeBtn.classList.add('tmo-resume-button');
  aiBtn.classList.add('tmo-analysis-button');
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
    setRegenerationRecheckPending(true);
    const prior = getLastResumeGenerationRequest();
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
  const prefillProgressSlot = document.createElement('div');
  prefillProgressSlot.className = 'tmo-prefill-progress-slot';
  toolsPanel.appendChild(prefillProgressSlot);
  toolsPanel.appendChild(prefillResultLine);
  toolsPanel.appendChild(createPrefillUndoControl(() => host.undoLastPrefill()));
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
    host.paintGuidedStateUi();
  }
  toolsPanel.appendChild(artifactStaleBanner);
  toolsPanel.appendChild(artifactInactiveFallback);
  toolsPanel.appendChild(rowDivider());
  toolsPanel.appendChild(resumeBtn);
  toolsPanel.appendChild(rowDivider());
  toolsPanel.appendChild(aiBtn);
  toolsPanel.appendChild(createSensitiveAnswerPanel());
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
  feedbackRow.className = 'tmo-job-widget-footer';
  const feedbackBtn = document.createElement('button');
  feedbackBtn.type = 'button';
  feedbackBtn.innerHTML = `${icon('messageCircle', 14)}<span>Send feedback</span>`;
  feedbackBtn.style.cssText =
    'display:inline-flex;align-items:center;gap:7px;border:none;background:transparent;color:var(--tmo-widget-muted);font:inherit;font-size:12px;font-weight:500;cursor:pointer;padding:6px 8px;min-height:40px;';
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
    display:none;align-items:center;gap:9px;margin:0 18px 14px;padding:10px 12px;border-radius:10px;
    background:var(--tmo-widget-info-surface);color:var(--tmo-widget-info-ink);font-size:12px;font-weight:500;line-height:1.5;
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
    flex:1 1 auto;min-height:0;
    overflow-x:hidden;overflow-y:auto;
    overscroll-behavior:contain;scrollbar-gutter:stable;-webkit-overflow-scrolling:touch;
  `;
  normalBody.appendChild(jobLine);
  normalBody.appendChild(actions);
  normalBody.appendChild(optClockRow);

  chrome.runtime.sendMessage(
    { type: 'GET_OPT_CLOCK_NUDGE' },
    (res: { ok?: boolean; nudge?: unknown } | undefined) => {
      if (chrome.runtime.lastError || !res?.ok || !optClockRow.isConnected) return;
      const nudge = normalizeOptClockNudge(res.nudge);
      if (!nudge) return;
      optClockText.textContent = `${nudge.remaining} unemployment ${nudge.remaining === 1 ? 'day' : 'days'} remaining`;
      optClockRow.title = 'Based on your saved employment history in TrackMyOPT. Keep your employment records up to date.';
      optClockRow.style.display = 'flex';
    },
  );

  // ---- Settings panel ("Default plugin view": Expanded / Minimized) ----
  const settingsPanel = document.createElement('div');
  settingsPanel.style.cssText = `
    display:none;flex:1 1 auto;min-height:0;padding:16px;
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
  card.appendChild(feedbackRow);

  // Minimized close menu (3 hide scopes)
  const menu = document.createElement('div');
  menu.style.cssText = `
    display:none;position:absolute;top:44px;right:64px;z-index:5;
    width:min(260px,calc(100vw - 80px));background:var(--tmo-widget-surface);border:1px solid var(--tmo-widget-border);border-radius:12px;
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
    tab.style.width = revealed ? '96px' : '52px';
    tab.style.boxShadow = revealed
      ? '0 9px 26px rgba(30,64,175,0.32)'
      : '0 7px 20px rgba(30,64,175,0.22)';
    tabOpenBtn.style.width = revealed ? '59px' : '51px';
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
      const active = widgetActiveElement();
      if (tab.matches(':hover')) return;
      if (active && (tab.contains(active) || menu.contains(active))) return;
      setTabControlsRevealed(false);
    }, 60);
  };

  tab.addEventListener('mouseenter', () => setTabControlsRevealed(true));
  tab.addEventListener('mouseleave', retractTabControlsWhenIdle);
  tab.addEventListener('focusin', () => setTabControlsRevealed(true));
  tab.addEventListener('focusout', retractTabControlsWhenIdle);

  attachDragBehavior(root, tabDragHandle);

  // ---- collapse / expand ----
  const setCollapsed = (collapsed: boolean) => {
    setCollapsedPref(collapsed);
    root.dataset.collapsed = String(collapsed);
    card.style.display = collapsed ? 'none' : 'flex';
    tab.style.display = collapsed ? 'flex' : 'none';
    tabOpenBtn.setAttribute('aria-expanded', String(!collapsed));
    const savedTop = collapsed ? readWidgetPosition()?.top : undefined;
    root.style.top = collapsed ? (savedTop === undefined ? '50%' : `${savedTop}px`) : '16px';
    root.style.right = collapsed ? '0' : '16px';
    root.style.transform = collapsed && savedTop === undefined ? 'translateY(-50%)' : 'none';
    menu.style.display = 'none';
    setTabControlsRevealed(false);
    document.removeEventListener('click', onDocClick, true);
    requestAnimationFrame(() => {
      if (root.dataset.collapsed !== 'true') return;
      const rect = root.getBoundingClientRect();
      const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
      if (rect.top < 8 || rect.top > maxTop) {
        root.style.top = `${Math.min(Math.max(8, rect.top), maxTop)}px`;
        root.style.transform = 'none';
      }
    });
  };
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); setCollapsed(true); tabOpenBtn.focus({ preventScroll:true });
  });
  attachDragBehavior(root, tabOpenBtn, {
    allowButtonTarget: true,
    onTap: () => { setCollapsed(false); closeBtn.focus({ preventScroll:true }); },
  });

  // ---- Settings panel open/close (swaps content in place; same widget card) ----
  function showSettings(show: boolean) {
    normalBody.style.display = show ? 'none' : 'block';
    settingsPanel.style.display = show ? 'block' : 'none';
    title.textContent = show ? 'Settings' : 'TrackMyOPT';
    settingsBtn.style.display = show ? 'none' : 'flex';
    closeBtn.style.display = 'flex';
    backBtn.style.display = show ? 'flex' : 'none';
    menu.style.display = 'none';
    (show ? backBtn : settingsBtn).focus({ preventScroll:true });
  }
  settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); showSettings(true); });
  backBtn.addEventListener('click', (e) => { e.stopPropagation(); showSettings(false); });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || root.dataset.collapsed === 'true') return;
    e.preventDefault();
    e.stopPropagation();
    if (settingsPanel.style.display !== 'none') showSettings(false);
    else { setCollapsed(true); tabOpenBtn.focus({ preventScroll:true }); }
  });

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

  const clampWidgetToViewport = () => {
    if (!root.isConnected) {
      window.removeEventListener('resize', clampWidgetToViewport);
      return;
    }
    if (root.dataset.collapsed !== 'true') return;
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
  const viewportObserver = new ResizeObserver(() => {
    if (!root.isConnected) return;
    clampWidgetToViewport();
  });
  replaceWidgetViewportObserver(viewportObserver);
  viewportObserver.observe(card);

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
          attachmentResult: result.resumeAttachmentResult,
          verification: result.uploadVerification?.resume,
          hasResume: execution.hasResume,
        });
        paintResumeStatusRow(resumeStatusRow, status.state, status.detail);
        // Smart answers run as part of this explicit Prefill action. Their
        // inline review markers replace the extra Generate/Insert clicks.
        host.trackPrefillExecution(execution, 'step_by_step', result.paused ? 'error' : 'success');
      } catch {
        host.trackPrefillRuntimeFailure('step_by_step', hasResume);
        prefillResultLine.style.display = 'block';
        prefillResultLine.textContent = 'Prefill could not finish. Review the application and try again. If the extension was updated, reopen the application first.';
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
    void prepareJobTool(card, resumeBtn, async (isCurrent) => {
      const response = await new Promise<{ok?: boolean} | undefined>(resolve =>
        sendToolMessage({ type: 'OPEN_SIDE_PANEL' }, resolve, 8000));
      if (!isCurrent() || response?.ok) return;
      const description = await resolveJobDescription();
      if (isCurrent()) openResumeChooserWithDescription(card, job, [], description);
    });
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
    savedBadge.textContent = statusText;
    savedBadge.style.background = statusText === 'Wishlist' ? 'var(--tmo-widget-info-surface)' : 'var(--tmo-widget-success-surface)';
    savedBadge.style.color = statusText === 'Wishlist' ? 'var(--tmo-widget-info-ink)' : 'var(--tmo-widget-success-ink)';
    saveBtn.style.boxShadow = 'none';
    saveBtn.style.filter = 'none';
    saveBtn.style.transform = 'none';
  };

  root.addEventListener('tmo-tracker-saved', event => {
    const detail = (event as CustomEvent).detail;
    if (detail?.jobUrl !== job.job_url) return;
    host.rememberTrackerApplicationId(job, detail.id);
    markJobSaved(detail.status === 'Wishlist' ? 'Wishlist' : 'Applied');
  });

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
      (response: { ok?: boolean; error?: string; id?: string; status?: string } | undefined) => {
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
          const actualStatus = response.status || status;
          markJobSaved(actualStatus === 'Wishlist' ? 'Wishlist' : 'Applied');
          void showPostSaveSuggestionOnce();
          showMessage(actualStatus === 'Wishlist' ? 'Job saved to your Wishlist!' : 'Job saved in your tracker.', false);
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

  ensureSpinKeyframes();
  isolateWidget(root);
  return root;
}

