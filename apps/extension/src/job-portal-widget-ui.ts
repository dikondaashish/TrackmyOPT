/**
 * Small DOM factories and paint helpers for the job-portal widget UI.
 * No module-level mutable state — callers pass hosts/values explicitly.
 */

import { icon } from './icons';
import {
  RESUME_STATUS_ROW_CLASS,
  paintResumeStatusRow,
  prefillEntryCopy,
  type ResumeStatusState,
} from './resume-status-row';
import type { SponsorshipResult } from './sponsorship-signal';

/** Small icon button for the widget header (collapse / close). */
export function iconBtn(glyph: string, label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.title = label;
  b.textContent = glyph;
  b.style.cssText = `
    width:34px;height:34px;flex-shrink:0;padding:0;margin:0;border:none;border-radius:8px;
    background:transparent;color:var(--tmo-widget-accent-strong);font-size:18px;line-height:1;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
  `;
  b.addEventListener('mouseenter', () => (b.style.background = "rgba(37,99,235,0.1)"));
  b.addEventListener('mouseleave', () => (b.style.background = 'transparent'));
  return b;
}

/** Render the visa-sponsorship pill into `host` from a classifier result. */
export function paintSponsorshipPill(host: HTMLElement, result: SponsorshipResult): void {
  const theme = {
    sponsors: {
      bg: 'var(--tmo-widget-success-surface)',
      fg: 'var(--tmo-widget-success-ink)',
      border: 'var(--tmo-widget-success-border)',
      iconName: 'checkCircle' as const,
      label: 'Mentions sponsorship',
      fallback: 'This posting mentions visa sponsorship.',
    },
    no_sponsorship: {
      bg: 'var(--tmo-widget-danger-surface)',
      fg: 'var(--tmo-widget-danger-ink)',
      border: 'var(--tmo-widget-danger-border)',
      iconName: 'alertTriangle' as const,
      label: 'No sponsorship',
      fallback: 'This posting appears to rule out visa sponsorship.',
    },
    unclear: {
      bg: 'var(--tmo-widget-surface-2)',
      fg: 'var(--tmo-widget-muted)',
      border: 'var(--tmo-widget-border)',
      iconName: 'info' as const,
      label: 'Sponsorship not stated',
      fallback: "The posting doesn't clearly state its visa-sponsorship policy.",
    },
  }[result.signal];

  host.textContent = '';
  const pill = document.createElement('span');
  pill.style.cssText = `
    display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;
    background:${theme.bg};color:${theme.fg};border:1px solid ${theme.border};
    font-size:11px;font-weight:750;line-height:1;max-width:100%;
  `;
  const ic = document.createElement('span');
  ic.style.cssText = 'display:flex;flex-shrink:0;';
  ic.innerHTML = icon(theme.iconName, 13, theme.fg);
  const text = document.createElement('span');
  text.textContent = theme.label;
  text.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  pill.appendChild(ic);
  pill.appendChild(text);
  pill.title = result.matchedSentence ? `“${result.matchedSentence}”` : theme.fallback;
  host.appendChild(pill);
}

/** Point a Prefill control at the shared copy for the current resume state. */
export function paintPrefillButton(
  button: HTMLButtonElement | null | undefined,
  hasResume: boolean,
): void {
  if (!button) return;
  const copy = prefillEntryCopy(hasResume);
  const label = button.querySelector<HTMLElement>('.tmo-action-label');
  if (label) label.textContent = copy.label;
  const sublabel = button.querySelector<HTMLElement>('.tmo-action-sublabel');
  if (sublabel) sublabel.textContent = copy.sublabel;
  button.title = copy.title;
}

/** Repaint every mounted status row — the widget may be rebuilt mid-flow. */
export function syncResumeStatusRows(state: ResumeStatusState, detail?: string): void {
  for (const row of Array.from(
    document.querySelectorAll<HTMLElement>(`.${RESUME_STATUS_ROW_CLASS}`),
  )) {
    paintResumeStatusRow(row, state, detail);
  }
}

/**
 * Action row inside the tools panel: colored icon chip + label + optional
 * sublabel, with a trailing chevron (default) or custom trailing element.
 * `iconSvg` should already be a white icon so it reads on the colored chip.
 */
export function actionBtn(
  iconSvg: string,
  label: string,
  opts: { sublabel?: string; chip?: string; trailing?: string } = {}
): HTMLButtonElement {
  const chip = opts.chip || 'linear-gradient(135deg,#2563eb,#0ea5e9)';
  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText = `
    display:flex;align-items:center;gap:11px;width:100%;min-height:56px;padding:11px 12px;
    border:0;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;text-align:left;cursor:pointer;
    transition:background 160ms ease;
  `;
  b.addEventListener('mouseenter', () => (b.style.background = 'var(--tmo-widget-surface-2)'));
  b.addEventListener('mouseleave', () => (b.style.background = 'var(--tmo-widget-surface)'));
  b.addEventListener('focus', () => {
    b.style.background = 'var(--tmo-widget-info-surface)';
    b.style.outline = '2px solid var(--tmo-widget-focus)';
    b.style.outlineOffset = '-2px';
  });
  b.addEventListener('blur', () => {
    b.style.background = 'var(--tmo-widget-surface)';
    b.style.outline = 'none';
  });

  const chipEl = document.createElement('span');
  chipEl.innerHTML = iconSvg;
  chipEl.style.cssText = `
    width:34px;height:34px;flex:0 0 34px;border-radius:10px;background:${chip};
    display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(15,23,42,0.14);
  `;

  const textWrap = document.createElement('span');
  textWrap.style.cssText = 'flex:1;min-width:0;';
  const l = document.createElement('span');
  l.className = 'tmo-action-label';
  l.textContent = label;
  l.style.cssText = 'display:block;font-size:13px;font-weight:750;letter-spacing:-0.1px;';
  textWrap.appendChild(l);
  if (opts.sublabel) {
    const s = document.createElement('span');
    s.className = 'tmo-action-sublabel';
    s.textContent = opts.sublabel;
    s.style.cssText = 'display:block;font-size:11px;color:var(--tmo-widget-muted);margin-top:1px;';
    textWrap.appendChild(s);
  }

  const trail = document.createElement('span');
  trail.style.cssText = 'display:flex;flex:0 0 auto;margin-left:auto;align-items:center;color:var(--tmo-widget-muted);';
  trail.innerHTML = opts.trailing ?? icon('chevronRight', 16, 'currentColor');

  b.appendChild(chipEl);
  b.appendChild(textWrap);
  b.appendChild(trail);
  return b;
}

export function ensureSpinKeyframes(): void {
  if (document.getElementById('tmo-spin-style')) return;
  const style = document.createElement('style');
  style.id = 'tmo-spin-style';
  style.textContent = '@keyframes tmo-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}

export function downloadGeneratedPdf(base64: string, filename: string): void {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export function resumeMiniBtn(labelSvgAndText: string, primary: boolean): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = labelSvgAndText;
  b.style.cssText = `
    flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
    min-height:44px;padding:10px 9px;border-radius:9px;font:inherit;font-size:12.5px;font-weight:750;cursor:pointer;
    ${primary
      ? 'background:#2563eb;color:#fff;border:1px solid #2563eb;'
      : 'background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);border:1px solid var(--tmo-widget-border);'}
  `;
  b.addEventListener('focus', () => (b.style.outline = '3px solid var(--tmo-widget-focus)'));
  b.addEventListener('blur', () => (b.style.outline = 'none'));
  return b;
}

export function modalFieldLabel(text: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.htmlFor = htmlFor;
  label.textContent = text;
  label.style.cssText = 'display:block;margin:0 0 6px;color:var(--tmo-widget-ink);font-size:12.5px;font-weight:750;';
  return label;
}

export function modalSelect(id: string): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = id;
  select.style.cssText = `
    display:block;width:100%;height:44px;padding:0 34px 0 11px;border:1px solid var(--tmo-widget-border);
    border-radius:9px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:13px;cursor:pointer;
    outline:none;
  `;
  select.addEventListener('focus', () => {
    select.style.borderColor = 'var(--tmo-widget-accent)';
    select.style.boxShadow = '0 0 0 3px var(--tmo-widget-focus)';
  });
  select.addEventListener('blur', () => {
    select.style.borderColor = 'var(--tmo-widget-border)';
    select.style.boxShadow = 'none';
  });
  return select;
}

export function selectField(
  label: string,
  options: Array<[string, string]>
): { wrapper: HTMLLabelElement; control: HTMLSelectElement } {
  const wrapper = document.createElement('label');
  wrapper.style.cssText =
    'display:grid;gap:3px;color:var(--tmo-widget-ink);font-size:10.5px;font-weight:700;';
  wrapper.append(label);
  const control = document.createElement('select');
  control.style.cssText =
    'width:100%;min-height:32px;padding:5px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:11px;';
  for (const [value, text] of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    control.appendChild(option);
  }
  wrapper.appendChild(control);
  return { wrapper, control };
}

export function textField(
  label: string,
  type: 'text' | 'date' = 'text',
  placeholder = ''
): { wrapper: HTMLLabelElement; control: HTMLInputElement } {
  const wrapper = document.createElement('label');
  wrapper.style.cssText =
    'display:grid;gap:3px;color:var(--tmo-widget-ink);font-size:10.5px;font-weight:700;';
  wrapper.append(label);
  const control = document.createElement('input');
  control.type = type;
  control.placeholder = placeholder;
  control.autocomplete = 'off';
  control.style.cssText =
    'box-sizing:border-box;width:100%;min-height:32px;padding:5px 7px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:11px;';
  wrapper.appendChild(control);
  return { wrapper, control };
}

/** Segmented-control option button for the Settings panel (Expanded / Minimized). */
export function viewOptionBtn(label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText = viewOptionStyle(false);
  return b;
}

export function viewOptionStyle(selected: boolean): string {
  return [
    'flex:1',
    'padding:8px 0',
    'border-radius:8px',
    'font:inherit',
    'font-size:12px',
    'font-weight:700',
    'cursor:pointer',
    selected ? 'background:#2563eb' : 'background:var(--tmo-widget-surface)',
    selected ? 'color:#fff' : 'color:var(--tmo-widget-ink)',
    selected ? 'border:1px solid #2563eb' : 'border:1px solid var(--tmo-widget-border)',
  ].join(';');
}

export function logoSvgFallback(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute(
    'd',
    'M4 14c2.5-1 5-4 6-7 1 3 3.5 6 6 7-2 1.5-4 2.5-6 2.5S6 15.5 4 14z'
  );
  path.setAttribute('fill', 'var(--tmo-color-success-ink)');
  path.setAttribute('opacity', '0.9');
  svg.appendChild(path);
  return svg;
}

export function showMessage(message: string, isError: boolean): void {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    bottom: 110px;
    right: 24px;
    z-index: 2147483647;
    padding: 12px 20px;
    font-size: 14px;
    color: #fff;
    background: ${isError ? 'var(--tmo-color-danger-ink)' : '#059669'};
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
