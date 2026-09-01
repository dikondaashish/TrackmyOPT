import { icon } from './icons';
import {
  getAlignJobTitlesPreference,
  setAlignJobTitlesPreference,
} from './resume-generation-preferences';

export type AlignJobTitlesControl = {
  row: HTMLDivElement;
  checkbox: HTMLInputElement;
  getValue: () => boolean;
};

/** Checkbox + help tooltip for the widget resume chooser. */
export function mountAlignJobTitlesControl(): AlignJobTitlesControl {
  const row = document.createElement('div');
  row.style.cssText =
    'margin-top:15px;display:flex;align-items:center;gap:10px;padding:10px 11px;border:1px solid var(--tmo-widget-border);border-radius:9px;background:var(--tmo-widget-surface-2);';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'tmo-align-job-titles';
  checkbox.style.cssText =
    'width:16px;height:16px;margin:0;accent-color:var(--tmo-widget-accent);cursor:pointer;';

  const label = document.createElement('label');
  label.htmlFor = 'tmo-align-job-titles';
  label.textContent = 'Align job titles to this role';
  label.style.cssText =
    'flex:1;cursor:pointer;color:var(--tmo-widget-ink);font-size:12.5px;font-weight:650;line-height:1.35;';

  const helpWrap = document.createElement('div');
  helpWrap.style.cssText = 'position:relative;flex-shrink:0;';

  const helpBtn = document.createElement('button');
  helpBtn.type = 'button';
  helpBtn.setAttribute('aria-label', 'What does align job titles mean?');
  helpBtn.style.cssText =
    'display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--tmo-widget-muted);cursor:pointer;';
  helpBtn.innerHTML = icon('info', 15, 'currentColor');

  const tooltip = document.createElement('div');
  tooltip.style.cssText =
    'position:absolute;right:0;bottom:calc(100% + 8px);z-index:20;width:min(256px,calc(100vw - 48px));padding:10px 11px;border-radius:9px;background:#1f2937;color:#fff;font-size:11px;line-height:1.45;opacity:0;pointer-events:none;transition:opacity .15s ease;box-shadow:0 8px 24px rgba(15,23,42,.28);';
  tooltip.innerHTML = `
    <div style="font-weight:700;margin-bottom:4px;">Align job titles</div>
    <div style="color:#e5e7eb;">Rewrites employment titles as a career progression toward the role in this job description.</div>
    <div style="margin-top:8px;color:#d1d5db;">Example: Software Engineer roles may become Junior Data Analyst → Data Analyst → Lead Data Analyst → Senior Data Analyst when the posting targets that role.</div>
    <div style="margin-top:8px;color:#9ca3af;">Company names and dates stay the same. Off by default.</div>
  `;

  helpWrap.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
  });
  helpWrap.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
  helpWrap.appendChild(helpBtn);
  helpWrap.appendChild(tooltip);

  row.appendChild(checkbox);
  row.appendChild(label);
  row.appendChild(helpWrap);

  void getAlignJobTitlesPreference().then((enabled) => {
    checkbox.checked = enabled;
  });
  checkbox.addEventListener('change', () => {
    void setAlignJobTitlesPreference(checkbox.checked);
  });

  return {
    row,
    checkbox,
    getValue: () => checkbox.checked,
  };
}
