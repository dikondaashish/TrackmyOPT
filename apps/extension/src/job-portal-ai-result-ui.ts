/**
 * Pure paint helper for the ATS fit analysis result body.
 * Callers supply remember/chain callbacks — no module-level widget state here.
 */

import { icon } from './icons';

export type AnalyzeJobFitPaintInput = {
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  gapSummary?: string;
  resumeName?: string;
};

/** Score ring + keyword chips + CTA into the resume generator. */
export function renderAiResult(
  body: HTMLElement,
  res: AnalyzeJobFitPaintInput,
  onRememberScore: (score: number) => void,
  onGenerateResume: (missingKeywords: string[]) => void,
): void {
  body.textContent = '';
  const score = typeof res.matchScore === 'number' ? res.matchScore : 0;
  onRememberScore(score);
  const matched = Array.isArray(res.matchedKeywords) ? res.matchedKeywords : [];
  const missing = Array.isArray(res.missingKeywords) ? res.missingKeywords : [];
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

  // Score ring + label
  const top = document.createElement('div');
  top.style.cssText = 'display:flex;align-items:center;gap:14px;';
  const ring = document.createElement('div');
  ring.style.cssText = 'position:relative;width:84px;height:84px;flex:0 0 84px;';
  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - score / 100);
  ring.innerHTML = `
    <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r="34" fill="none" stroke="var(--tmo-widget-border)" stroke-width="8"></circle>
      <circle cx="42" cy="42" r="34" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
        transform="rotate(-90 42 42)"></circle>
    </svg>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:800;color:var(--tmo-widget-ink);">${score}</div>`;
  const topText = document.createElement('div');
  topText.style.cssText = 'min-width:0;';
  const topTitle = document.createElement('div');
  topTitle.textContent = 'ATS match score';
  topTitle.style.cssText = 'font-size:14px;font-weight:800;color:var(--tmo-widget-ink);';
  const topSub = document.createElement('div');
  topSub.textContent = `vs ${res.resumeName || 'your saved resume'}`;
  topSub.style.cssText = 'font-size:12px;color:var(--tmo-widget-muted);margin-top:3px;overflow-wrap:anywhere;';
  topText.appendChild(topTitle);
  topText.appendChild(topSub);
  top.appendChild(ring);
  top.appendChild(topText);
  wrap.appendChild(top);

  // Matched keywords
  if (matched.length > 0) {
    const matchedSection = document.createElement('div');
    const matchedHeading = document.createElement('div');
    matchedHeading.textContent = `Matched keywords (${matched.length})`;
    matchedHeading.style.cssText = 'font-size:11.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--tmo-widget-muted);margin-bottom:8px;';
    const matchedChips = document.createElement('div');
    matchedChips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    for (const kw of matched) {
      const chip = document.createElement('span');
      chip.textContent = kw;
      chip.style.cssText =
        'padding:4px 9px;border-radius:999px;background:var(--tmo-widget-success-surface);color:var(--tmo-widget-success-ink);border:1px solid var(--tmo-widget-success-border);font-size:11.5px;font-weight:700;';
      matchedChips.appendChild(chip);
    }
    matchedSection.appendChild(matchedHeading);
    matchedSection.appendChild(matchedChips);
    wrap.appendChild(matchedSection);
  }

  // Missing keywords
  const kwSection = document.createElement('div');
  const kwHeading = document.createElement('div');
  kwHeading.style.cssText = 'font-size:11.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--tmo-widget-muted);margin-bottom:8px;';
  if (missing.length > 0) {
    kwHeading.textContent = `Missing keywords (${missing.length})`;
    kwSection.appendChild(kwHeading);
    const chips = document.createElement('div');
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    for (const kw of missing) {
      const chip = document.createElement('span');
      chip.textContent = kw;
      chip.style.cssText =
        'padding:4px 9px;border-radius:999px;background:var(--tmo-widget-warning-surface);color:var(--tmo-widget-warning-ink);border:1px solid var(--tmo-widget-warning-border);font-size:11.5px;font-weight:700;';
      chips.appendChild(chip);
    }
    kwSection.appendChild(chips);
  } else {
    kwHeading.textContent = 'Keyword coverage';
    kwSection.appendChild(kwHeading);
    const ok = document.createElement('p');
    ok.textContent = 'No major keyword gaps detected — your resume covers this posting well.';
    ok.style.cssText = 'margin:0;color:var(--tmo-widget-success-ink);font-size:12.5px;line-height:1.45;font-weight:600;';
    kwSection.appendChild(ok);
  }
  wrap.appendChild(kwSection);

  // Gap summary (optional)
  if (res.gapSummary && res.gapSummary.trim()) {
    const summary = document.createElement('p');
    summary.textContent = res.gapSummary.trim();
    summary.style.cssText = 'margin:0;color:var(--tmo-widget-muted);font-size:12.5px;line-height:1.5;';
    wrap.appendChild(summary);
  }

  // Chain into the resume generator
  const chain = document.createElement('button');
  chain.type = 'button';
  chain.innerHTML = `<span>${missing.length > 0 ? 'Add these to a tailored resume' : 'Generate a tailored resume'}</span>${icon('chevronRight', 16, '#fff')}`;
  chain.style.cssText =
    'display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:46px;margin-top:2px;padding:11px 14px;border:0;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(16,185,129,0.3);';
  chain.addEventListener('click', () => {
    onGenerateResume(missing);
  });
  wrap.appendChild(chain);

  body.appendChild(wrap);
}
