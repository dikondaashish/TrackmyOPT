/**
 * Small resume-panel paint helpers (error / need-base / dismiss).
 * Callers pass onDismiss — typically scheduleInject after panel removal.
 */

import { WEBSITE_URL } from './config';
import { icon } from './icons';
import { resumeMiniBtn } from './job-portal-widget-ui';

/**
 * Adds a small dismiss (×) to a terminal resume panel. While a panel is present
 * the widget is held stable (isWidgetInteractionInFlight), so the user needs a
 * way to close a finished result and let the widget follow them to a new job.
 */
export function addResumePanelDismiss(panel: HTMLElement, onDismiss: () => void): void {
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss resume panel');
  close.title = 'Dismiss';
  close.textContent = '×';
  close.style.cssText =
    'position:absolute;top:8px;right:8px;width:22px;height:22px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--tmo-widget-muted);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  close.addEventListener('mouseenter', () => (close.style.background = 'var(--tmo-widget-surface)'));
  close.addEventListener('mouseleave', () => (close.style.background = 'transparent'));
  close.addEventListener('click', () => {
    panel.remove();
    // Reconcile now that the interaction is over — the widget can follow the
    // user to whatever job they navigated to while the panel was open.
    onDismiss();
  });
  panel.appendChild(close);
}

export function renderResumeError(
  panel: HTMLElement,
  message: string,
  onDismiss: () => void,
): void {
  panel.textContent = '';
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:6px;align-items:flex-start;color:var(--tmo-color-danger-ink);font-size:12px;';
  const ic = document.createElement('span');
  ic.style.cssText = 'display:flex;flex-shrink:0;margin-top:1px;';
  ic.innerHTML = icon('alertTriangle', 14, 'var(--tmo-color-danger-ink)');
  const t = document.createElement('span');
  t.textContent = message;
  row.appendChild(ic);
  row.appendChild(t);
  panel.appendChild(row);
  addResumePanelDismiss(panel, onDismiss);
}

export function renderResumeNeedBase(panel: HTMLElement, onDismiss: () => void): void {
  panel.textContent = '';
  const t = document.createElement('div');
  t.style.cssText = 'font-size:12px;color:var(--tmo-widget-ink);margin-bottom:8px;';
  t.textContent = 'Save a base resume on TrackMyOPT first, then generate a tailored one here.';
  const btn = resumeMiniBtn('Open resume generator', true);
  btn.addEventListener('click', () => {
    window.open(`${WEBSITE_URL}/dashboard/career/resume-generator`, '_blank', 'noopener');
  });
  panel.appendChild(t);
  panel.appendChild(btn);
  addResumePanelDismiss(panel, onDismiss);
}
