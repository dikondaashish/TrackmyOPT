/**
 * Prefill coverage summary UI painted into the widget coverage line.
 */

import { jumpToPrefillField, type PrefillCoverageResult } from './easy-apply-engine';
import { formatPrefillCoverageSummary } from './prefill-coverage';

export function paintPrefillCoverage(
  line: HTMLElement,
  result: PrefillCoverageResult,
): void {
  const openGroups = new Map(Array.from(line.querySelectorAll('details')).map(details => [details.dataset.group, details.open]));
  line.textContent = '';
  const scan = result.applicationScan;
  const scannedFieldCount =
    (scan?.requiredTotal ?? 0) + (scan?.optionalTotal ?? 0);
  if (result.total === 0 && scannedFieldCount === 0) {
    line.style.display = 'none';
    return;
  }
  line.style.display = 'block';
  line.style.lineHeight = '1.45';
  line.style.fontSize = '12px';
  line.style.padding = '14px';
  line.style.borderRadius = '12px';
  line.style.color = 'var(--tmo-widget-ink, #17243b)';
  line.style.background = 'var(--tmo-widget-surface-2, #f2f5fa)';
  line.style.border = '1px solid var(--tmo-widget-border, #dce3ed)';
  line.style.minWidth = '0';
  line.style.boxSizing = 'border-box';

  if (scan && scannedFieldCount > 0) {
    const scanHeader = document.createElement('div');
    scanHeader.style.cssText =
      'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;color:var(--tmo-widget-text);';
    const scanTitle = document.createElement('strong');
    scanTitle.textContent = 'Application progress';
    scanTitle.style.cssText = 'font-size:14px;line-height:1.4;font-weight:650;color:var(--tmo-widget-ink, #17243b);';
    const percent = document.createElement('strong');
    percent.textContent = scan.requiredTotal ? `${scan.requiredPercent}%` : '';
    percent.style.cssText =
      'font-size:13px;line-height:1.5;font-weight:650;font-variant-numeric:tabular-nums;color:var(--tmo-widget-accent-strong, #245bd6);';
    scanHeader.append(scanTitle, percent);
    line.appendChild(scanHeader);

    const count = document.createElement('div');
    count.textContent =
      scan.requiredTotal ? `${scan.requiredFilled} of ${scan.requiredTotal} required fields complete` : 'No required fields detected';
    count.style.cssText =
      'margin-top:3px;color:var(--tmo-widget-muted, #60718b);font-size:12px;line-height:1.5;';
    line.appendChild(count);

    const track = document.createElement('div');
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', String(scan.requiredPercent));
    track.setAttribute(
      'aria-label',
      `${scan.requiredFilled} of ${scan.requiredTotal} required fields filled`
    );
    track.style.cssText =
      'height:5px;margin:10px 0 14px;overflow:hidden;border-radius:999px;background:var(--tmo-widget-border, #dce3ed);';
    const fill = document.createElement('div');
    fill.style.cssText =
      `height:100%;width:${scan.requiredPercent}%;border-radius:inherit;background:` +
      (scan.unansweredRequired === 0
        ? 'var(--tmo-color-success-ink, #168465);'
        : 'var(--tmo-widget-accent-strong, #245bd6);');
    track.appendChild(fill);
    line.appendChild(track);

    const appendFieldGroup = (
      title: string,
      fields: typeof scan.required
    ) => {
      if (fields.length === 0) return;
      const details = document.createElement('details');
      details.dataset.group = title;
      details.open = openGroups.get(title) ?? (title === 'Required' && scan.unansweredRequired > 0);
      details.style.cssText =
        'margin-top:8px;border-top:1px solid var(--tmo-widget-border, #dce3ed);padding-top:4px;line-height:1.5;';
      const detailsSummary = document.createElement('summary');
      detailsSummary.textContent = `${title} (${fields.length})`;
      detailsSummary.style.cssText =
        'cursor:pointer;color:var(--tmo-widget-ink, #17243b);font:600 12px/1.5 system-ui;padding:9px 2px;min-height:36px;box-sizing:border-box;';
      details.appendChild(detailsSummary);
      const list = document.createElement('div');
      list.style.cssText =
        'display:grid;grid-auto-rows:max-content;gap:0;max-height:240px;overflow:auto;padding:0 4px 0 0;line-height:1.5;overscroll-behavior:contain;';
      for (const field of [...fields].sort((a,b) => Number(a.filled)-Number(b.filled))) {
        const item = document.createElement('div');
        item.style.cssText =
          'display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:12px;padding:9px 0;min-height:36px;box-sizing:border-box;line-height:1.5;';
        const label = document.createElement('span');
        label.textContent = field.label;
        label.style.cssText =
          'display:block;min-width:0;white-space:normal;overflow-wrap:anywhere;font:400 12px/1.5 system-ui;color:var(--tmo-widget-ink, #17243b);';
        const state = document.createElement('span');
        state.textContent = field.filled
          ? '✓ Done'
          : field.required
            ? 'Missing'
            : 'Optional';
        state.style.cssText =
          `display:block;white-space:nowrap;font:500 11px/1.65 system-ui;color:${
            field.filled ? 'var(--tmo-color-success-ink, #168465)' : field.required ? 'var(--tmo-color-warning-ink, #9b4b13)' : 'var(--tmo-widget-muted, #60718b)'
          };`;
        item.append(label, state);
        list.appendChild(item);
      }
      details.appendChild(list);
      line.appendChild(details);
    };

    appendFieldGroup('Required', scan.required);
    appendFieldGroup('Optional', scan.optional);
  }

  const summary = document.createElement('span');
  summary.textContent = scan && scannedFieldCount > 0
    ? (scan.unansweredRequired === 0 ? 'Review your answers before submitting.' : '')
    : formatPrefillCoverageSummary(result);
  summary.style.cssText =
    'display:block;margin-top:12px;font-size:12px;line-height:1.5;color:var(--tmo-widget-muted, #60718b);';
  if (summary.textContent) line.appendChild(summary);
  const firstRemaining = scan?.required.find(field => !field.filled)?.control;
  if (firstRemaining || (!scan && result.skipped > 0 && result.firstSkippedSelector)) {
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.textContent = 'Review missing fields';
    jump.style.cssText =
      'display:block;width:100%;min-height:40px;margin-top:12px;padding:9px 12px;border:1px solid var(--tmo-widget-border, #dce3ed);border-radius:8px;background:var(--tmo-widget-surface, #fafbfe);color:var(--tmo-widget-accent-strong, #245bd6);font:600 12px/1.5 system-ui;text-align:center;cursor:pointer;';
    jump.addEventListener('click', () => {
      if (firstRemaining?.isConnected) {
        const reduced = firstRemaining.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        firstRemaining.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
        firstRemaining.focus({ preventScroll: true });
      } else if (!scan) jumpToPrefillField(result.firstSkippedSelector || '');
    });
    line.appendChild(jump);
  }
}
