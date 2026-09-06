/**
 * Prefill coverage summary UI painted into the widget coverage line.
 */

import { jumpToPrefillField, type PrefillCoverageResult } from './easy-apply-engine';
import { formatPrefillCoverageSummary } from './prefill-coverage';

export function paintPrefillCoverage(
  line: HTMLElement,
  result: PrefillCoverageResult,
): void {
  line.textContent = '';
  const scan = result.applicationScan;
  const scannedFieldCount =
    (scan?.requiredTotal ?? 0) + (scan?.optionalTotal ?? 0);
  if (result.total === 0 && scannedFieldCount === 0) {
    line.style.display = 'none';
    return;
  }
  line.style.display = 'block';

  if (scan && scannedFieldCount > 0) {
    const scanHeader = document.createElement('div');
    scanHeader.style.cssText =
      'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;color:var(--tmo-widget-text);';
    const scanTitle = document.createElement('strong');
    scanTitle.textContent = 'TrackMyOPT scanned this page';
    scanTitle.style.cssText = 'font-size:12px;line-height:1.35;';
    const percent = document.createElement('strong');
    percent.textContent = `${scan.requiredPercent}%`;
    percent.style.cssText =
      `font-size:12px;color:${scan.unansweredRequired === 0 ? 'var(--tmo-color-success-ink)' : 'var(--tmo-color-warning-ink)'};`;
    scanHeader.append(scanTitle, percent);
    line.appendChild(scanHeader);

    const count = document.createElement('div');
    count.textContent =
      `${scan.requiredFilled}/${scan.requiredTotal} required fields filled`;
    count.style.cssText =
      'margin-top:3px;color:var(--tmo-widget-muted);font-size:11.5px;';
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
      'height:6px;margin-top:7px;overflow:hidden;border-radius:999px;background:#dbe4f0;';
    const fill = document.createElement('div');
    fill.style.cssText =
      `height:100%;width:${scan.requiredPercent}%;border-radius:inherit;background:` +
      (scan.unansweredRequired === 0
        ? 'linear-gradient(90deg,#10b981,#059669);'
        : 'linear-gradient(90deg,#2563eb,#0ea5e9);');
    track.appendChild(fill);
    line.appendChild(track);

    const appendFieldGroup = (
      title: string,
      fields: typeof scan.required
    ) => {
      if (fields.length === 0) return;
      const details = document.createElement('details');
      details.style.cssText =
        'margin-top:7px;border-top:1px solid var(--tmo-widget-border);padding-top:6px;';
      const detailsSummary = document.createElement('summary');
      detailsSummary.textContent = `${title} (${fields.length})`;
      detailsSummary.style.cssText =
        'cursor:pointer;color:var(--tmo-widget-text);font-weight:800;';
      details.appendChild(detailsSummary);
      const list = document.createElement('div');
      list.style.cssText =
        'display:grid;gap:4px;margin-top:6px;max-height:154px;overflow:auto;padding-right:2px;';
      for (const field of fields) {
        const item = document.createElement('div');
        item.style.cssText =
          'display:flex;align-items:flex-start;justify-content:space-between;gap:8px;';
        const label = document.createElement('span');
        label.textContent = field.label;
        label.style.cssText =
          'min-width:0;overflow-wrap:anywhere;color:var(--tmo-widget-text);';
        const state = document.createElement('span');
        state.textContent = field.filled
          ? '✓ Filled'
          : field.required
            ? 'Needs you'
            : 'Optional';
        state.style.cssText =
          `flex:0 0 auto;font-weight:800;color:${
            field.filled ? 'var(--tmo-color-success-ink)' : field.required ? 'var(--tmo-color-warning-ink)' : 'var(--tmo-widget-muted)'
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
  summary.textContent = formatPrefillCoverageSummary(result);
  summary.style.cssText =
    `display:block;${scan && scannedFieldCount > 0 ? 'margin-top:7px;' : ''}`;
  line.appendChild(summary);
  if (result.skipped > 0 && result.firstSkippedSelector) {
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.textContent = 'Jump to first';
    jump.style.cssText =
      'padding:0;border:0;background:transparent;color:var(--tmo-color-warning-ink);font:inherit;font-weight:800;text-decoration:underline;cursor:pointer;';
    jump.addEventListener('click', () => {
      jumpToPrefillField(result.firstSkippedSelector || '');
    });
    line.append('—');
    line.appendChild(jump);
  }
}
