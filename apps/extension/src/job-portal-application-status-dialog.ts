/**
 * Application status (Wishlist / Applied) dialog for Save-to-tracker.
 */

import { icon } from './icons';
import type { JobInfo } from './job-posting-scrape';
import {
  formatDuplicateApplicationNotice,
  type DuplicateApplicationNotice,
} from './smart-flow';
import { applyWidgetThemeScope } from './job-portal-widget-theme';

export type ApplicationSaveStatus = 'Wishlist' | 'Applied';

export function openApplicationStatusDialog(
  job: JobInfo,
  onSelect: (status: ApplicationSaveStatus) => void,
  duplicate?: DuplicateApplicationNotice,
): void {
  document.getElementById('tmo-application-status-dialog')?.remove();
  const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-application-status-dialog';
  applyWidgetThemeScope(overlay);
  overlay.setAttribute('popover', 'manual');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;width:auto;height:auto;margin:0;padding:16px;border:0;
    background:var(--tmo-widget-overlay);display:flex;align-items:center;justify-content:center;overflow:auto;
    color:var(--tmo-widget-ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  `;

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'tmo-application-status-title');
  dialog.style.cssText = `
    width:min(360px,calc(100vw - 24px));border:1px solid var(--tmo-widget-border);border-radius:16px;background:var(--tmo-widget-surface);
    box-shadow:var(--tmo-widget-shadow);overflow:hidden;color:var(--tmo-widget-ink);
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:17px 17px 13px;border-bottom:1px solid var(--tmo-widget-border);';
  const headingCopy = document.createElement('div');
  headingCopy.style.cssText = 'flex:1;min-width:0;';
  const heading = document.createElement('h2');
  heading.id = 'tmo-application-status-title';
  heading.textContent = 'Application Status';
  heading.style.cssText = 'margin:0;color:var(--tmo-widget-ink);font-size:17px;line-height:1.3;font-weight:800;';
  const description = document.createElement('p');
  description.textContent = `Have you applied for ${job.role_title || 'this job'}?`;
  description.style.cssText = 'margin:5px 0 0;color:var(--tmo-widget-muted);font-size:12.5px;line-height:1.45;';
  headingCopy.appendChild(heading);
  headingCopy.appendChild(description);

  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close application status');
  close.textContent = '×';
  close.style.cssText = 'width:44px;height:44px;flex:0 0 44px;border:0;border-radius:10px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);font:inherit;font-size:22px;cursor:pointer;';
  header.appendChild(headingCopy);
  header.appendChild(close);

  const body = document.createElement('div');
  body.style.cssText = 'display:grid;gap:9px;padding:15px 17px 17px;';

  if (duplicate) {
    const notice = formatDuplicateApplicationNotice(duplicate);
    const warning = document.createElement('div');
    warning.setAttribute('role', 'note');
    warning.style.cssText = `
      display:flex;align-items:flex-start;gap:8px;padding:10px 11px;border:1px solid var(--tmo-widget-warning-border);
      border-radius:10px;background:var(--tmo-widget-warning-surface);color:var(--tmo-widget-warning-ink);font-size:12px;line-height:1.45;
    `;
    const warningIcon = document.createElement('span');
    warningIcon.style.cssText = 'display:flex;flex:0 0 auto;margin-top:2px;';
    warningIcon.innerHTML = icon('info', 14, 'currentColor');
    const warningCopy = document.createElement('span');
    warningCopy.append('You applied to ');
    const duplicateRole = document.createElement('strong');
    duplicateRole.textContent = notice.roleTitle || 'a similar role';
    warningCopy.appendChild(duplicateRole);
    warningCopy.append(` at ${notice.companyName || 'this company'}`);
    if (notice.dateLabel) warningCopy.append(` on ${notice.dateLabel}`);
    warningCopy.append('. You can still save this posting.');
    warning.appendChild(warningIcon);
    warning.appendChild(warningCopy);
    body.appendChild(warning);
  }

  const option = (status: ApplicationSaveStatus, label: string, hint: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.cssText = `
      width:100%;min-height:58px;padding:11px 12px;border:1px solid var(--tmo-widget-border);border-radius:11px;
      background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);display:flex;align-items:center;gap:11px;text-align:left;font:inherit;cursor:pointer;
      transition:border-color 180ms ease,background 180ms ease,box-shadow 180ms ease;
    `;
    const marker = document.createElement('span');
    marker.style.cssText = 'width:18px;height:18px;flex:0 0 18px;border:2px solid var(--tmo-widget-muted);border-radius:50%;box-shadow:inset 0 0 0 4px var(--tmo-widget-surface);';
    const copy = document.createElement('span');
    copy.style.cssText = 'min-width:0;display:block;';
    const labelEl = document.createElement('strong');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display:block;color:var(--tmo-widget-ink);font-size:13.5px;line-height:1.3;';
    const hintEl = document.createElement('span');
    hintEl.textContent = hint;
    hintEl.style.cssText = 'display:block;margin-top:3px;color:var(--tmo-widget-muted);font-size:11.5px;line-height:1.35;';
    copy.appendChild(labelEl);
    copy.appendChild(hintEl);
    button.appendChild(marker);
    button.appendChild(copy);
    button.addEventListener('mouseenter', () => {
      button.style.borderColor = 'var(--tmo-widget-accent)';
      button.style.background = 'var(--tmo-widget-info-surface)';
      marker.style.borderColor = 'var(--tmo-widget-accent)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = 'var(--tmo-widget-border)';
      button.style.background = 'var(--tmo-widget-surface)';
      marker.style.borderColor = 'var(--tmo-widget-muted)';
    });
    button.addEventListener('focus', () => (button.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.18)'));
    button.addEventListener('blur', () => (button.style.boxShadow = 'none'));
    button.addEventListener('click', () => {
      cleanup();
      onSelect(status);
    });
    return button;
  };

  const notApplied = option('Wishlist', 'I have not applied yet', 'Save this job to your Wishlist.');
  const applied = option('Applied', 'I applied', 'Save it as an active application.');
  body.appendChild(notApplied);
  body.appendChild(applied);
  dialog.appendChild(header);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    try { overlay.hidePopover?.(); } catch { /* already closed */ }
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cleanup();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [close, notApplied, applied];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  try {
    overlay.showPopover?.();
  } catch {
    overlay.removeAttribute('popover');
  }
  notApplied.focus();
}
