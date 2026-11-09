#!/usr/bin/env node
/**
 * Render an in-article blog figure from a JSON spec, as SVG and PNG.
 *
 *   node scripts/blog-figures/render-figure.mjs scripts/blog-figures/specs/<name>.json
 *
 * Output: public/blog/figures/<slug>/<name>.svg and .png (1200 px wide).
 * Reference it from an article section with
 *   figure: { src: '/blog/figures/<slug>/<name>.png', alt, caption, width, height }
 *
 * Four figure types cover what the immigration guides need:
 *
 * "timeline"   ordered stages with an optional duration label on each step
 *   { "type": "timeline", "steps": [{ "label": "Case Was Received", "detail": "Day 0" }, ...] }
 *
 * "flow"       a decision path: each step is a question with a yes/no outcome
 *   { "type": "flow", "steps": [{ "question": "...", "yes": "...", "no": "..." }, ...] }
 *
 * "comparison" two or three columns of short rows
 *   { "type": "comparison", "columns": [{ "title": "Regular", "rows": ["...", "..."] }, ...] }
 *
 * "bar"        one series of horizontal bars with the value printed at the end
 *   { "type": "bar", "unit": "%", "max": 100, "bars": [{ "label": "(c)(3)(B)", "value": 96.8 }, ...] }
 *
 * Common fields: slug, name, title, subtitle (optional), source (printed at
 * the bottom, required for "bar").
 *
 * Chart rules follow the dataviz guidance: one hue for a single series, no
 * legend for one series (the title names it), thin bars with rounded data
 * ends anchored at the baseline, recessive grid, values in ink colours rather
 * than the series colour, and the underlying numbers also kept in an article
 * table so the figure is never the only way to read them.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const FONT = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const W = 1200;
const PAD = 64;

// Site palette (matches the cover generator and the light theme).
const C = {
  surface: '#ffffff',
  panel: '#f8fafc',
  border: '#e2e8f0',
  grid: '#e5e7eb',
  ink: '#0f172a',
  ink2: '#475569',
  muted: '#64748b',
  series: '#2563eb', // single-series hue
  navy: '#1e3a8a',
  yes: '#047857',
  no: '#b45309',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Greedy word wrap by an approximate character budget. */
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines, x, y, { size = 18, weight = 400, fill = C.ink, gap = 1.3, anchor = 'start' } = {}) {
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * size * gap}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(l)}</text>`
    )
    .join('\n  ');
}

function header(spec) {
  const title = wrap(spec.title, 60);
  const sub = spec.subtitle ? wrap(spec.subtitle, 90) : [];
  const svg = [
    textLines(title, PAD, PAD + 26, { size: 30, weight: 800 }),
    sub.length ? textLines(sub, PAD, PAD + 26 + title.length * 39 + 8, { size: 18, fill: C.ink2 }) : '',
  ].join('\n  ');
  return { svg, height: PAD + title.length * 39 + (sub.length ? sub.length * 24 + 16 : 0) + 24 };
}

function footer(spec, y) {
  if (!spec.source) return { svg: '', height: 0 };
  const lines = wrap(`Source: ${spec.source}`, 120);
  return { svg: textLines(lines, PAD, y + 22, { size: 14, fill: C.muted }), height: lines.length * 19 + 24 };
}

function renderTimeline(spec, top) {
  const steps = spec.steps;
  const rowH = 74;
  const x = PAD + 24;
  const parts = [`<line x1="${x}" y1="${top + 20}" x2="${x}" y2="${top + 20 + (steps.length - 1) * rowH}" stroke="${C.border}" stroke-width="4" stroke-linecap="round"/>`];
  steps.forEach((step, i) => {
    const y = top + 20 + i * rowH;
    parts.push(`<circle cx="${x}" cy="${y}" r="13" fill="${C.series}" stroke="${C.surface}" stroke-width="4"/>`);
    parts.push(`<text x="${x}" y="${y + 5}" font-family="${FONT}" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">${i + 1}</text>`);
    parts.push(textLines([step.label], x + 36, y + 6, { size: 20, weight: 700 }));
    if (step.detail) parts.push(textLines(wrap(step.detail, 70), x + 36, y + 32, { size: 16, fill: C.ink2 }));
  });
  return { svg: parts.join('\n  '), height: 20 + (steps.length - 1) * rowH + 56 };
}

function renderFlow(spec, top) {
  const parts = [];
  let y = top;
  const boxW = W - PAD * 2;
  spec.steps.forEach((step, i) => {
    const q = wrap(step.question, 80);
    const yes = wrap(`Yes: ${step.yes}`, 42);
    const no = wrap(`No: ${step.no}`, 42);
    const qH = q.length * 24 + 28;
    const aH = Math.max(yes.length, no.length) * 22 + 26;
    parts.push(`<rect x="${PAD}" y="${y}" width="${boxW}" height="${qH}" rx="14" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>`);
    parts.push(textLines(q, PAD + 22, y + 32, { size: 19, weight: 700 }));
    const ay = y + qH + 12;
    const half = (boxW - 16) / 2;
    parts.push(`<rect x="${PAD}" y="${ay}" width="${half}" height="${aH}" rx="12" fill="#ecfdf5" stroke="${C.yes}" stroke-width="1.5"/>`);
    parts.push(textLines(yes, PAD + 18, ay + 28, { size: 16, fill: C.ink }));
    parts.push(`<rect x="${PAD + half + 16}" y="${ay}" width="${half}" height="${aH}" rx="12" fill="#fffbeb" stroke="${C.no}" stroke-width="1.5"/>`);
    parts.push(textLines(no, PAD + half + 34, ay + 28, { size: 16, fill: C.ink }));
    y = ay + aH + (i < spec.steps.length - 1 ? 28 : 0);
  });
  return { svg: parts.join('\n  '), height: y - top + 16 };
}

function renderComparison(spec, top) {
  const cols = spec.columns.slice(0, 3);
  const gap = 20;
  const colW = (W - PAD * 2 - gap * (cols.length - 1)) / cols.length;
  const chars = Math.floor(colW / 9.5);
  const bodies = cols.map((c) => c.rows.map((r) => wrap(r, chars)));
  const bodyH = Math.max(...bodies.map((rows) => rows.reduce((h, l) => h + l.length * 22 + 14, 0)));
  const h = 64 + bodyH + 16;
  const parts = [];
  cols.forEach((col, i) => {
    const x = PAD + i * (colW + gap);
    parts.push(`<rect x="${x}" y="${top}" width="${colW}" height="${h}" rx="14" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>`);
    parts.push(`<rect x="${x}" y="${top}" width="${colW}" height="52" rx="14" fill="${i === 0 ? C.navy : C.series}"/>`);
    parts.push(`<rect x="${x}" y="${top + 38}" width="${colW}" height="14" fill="${i === 0 ? C.navy : C.series}"/>`);
    parts.push(textLines([col.title], x + 20, top + 34, { size: 19, weight: 800, fill: '#ffffff' }));
    let y = top + 86;
    bodies[i].forEach((lines) => {
      parts.push(`<circle cx="${x + 24}" cy="${y - 6}" r="3.5" fill="${C.ink2}"/>`);
      parts.push(textLines(lines, x + 38, y, { size: 16 }));
      y += lines.length * 22 + 14;
    });
  });
  return { svg: parts.join('\n  '), height: h + 8 };
}

function renderBar(spec, top) {
  if (!spec.source) throw new Error(`${spec.name}: bar charts need a "source"`);
  const bars = spec.bars;
  const labelW = 300;
  const valueW = 110;
  const x0 = PAD + labelW;
  const plotW = W - PAD * 2 - labelW - valueW;
  const max = spec.max ?? Math.max(...bars.map((b) => b.value));
  const barH = 22;
  const rowH = 52;
  const unit = spec.unit ?? '';
  const parts = [];
  // Recessive grid at quarter steps.
  for (let t = 0; t <= 4; t++) {
    const gx = x0 + (plotW * t) / 4;
    const gv = (max * t) / 4;
    parts.push(`<line x1="${gx}" y1="${top}" x2="${gx}" y2="${top + bars.length * rowH}" stroke="${C.grid}" stroke-width="1"/>`);
    parts.push(`<text x="${gx}" y="${top + bars.length * rowH + 22}" font-family="${FONT}" font-size="13" fill="${C.muted}" text-anchor="middle">${esc(`${Number.isInteger(gv) ? gv : gv.toFixed(1)}${unit}`)}</text>`);
  }
  bars.forEach((bar, i) => {
    const y = top + i * rowH + (rowH - barH) / 2;
    const w = Math.max(2, (plotW * bar.value) / max);
    const labels = wrap(bar.label, 30);
    parts.push(textLines(labels, x0 - 16, y + barH / 2 + 6 - (labels.length - 1) * 10, { size: 16, weight: 600, anchor: 'end' }));
    // Square at the baseline, 4 px rounded data end.
    parts.push(`<path d="M${x0},${y} H${x0 + w - 4} a4,4 0 0 1 4,4 V${y + barH - 4} a4,4 0 0 1 -4,4 H${x0} Z" fill="${C.series}"><title>${esc(`${bar.label}: ${bar.value}${unit}`)}</title></path>`);
    parts.push(`<text x="${x0 + w + 10}" y="${y + barH / 2 + 6}" font-family="${FONT}" font-size="16" font-weight="700" fill="${C.ink}">${esc(`${bar.display ?? bar.value}${unit}`)}</text>`);
  });
  parts.push(`<line x1="${x0}" y1="${top}" x2="${x0}" y2="${top + bars.length * rowH}" stroke="${C.ink2}" stroke-width="1.5"/>`);
  return { svg: parts.join('\n  '), height: bars.length * rowH + 40 };
}

const RENDERERS = { timeline: renderTimeline, flow: renderFlow, comparison: renderComparison, bar: renderBar };

export function renderFigureSvg(spec) {
  const render = RENDERERS[spec.type];
  if (!render) throw new Error(`Unknown figure type "${spec.type}"`);
  const head = header(spec);
  const body = render(spec, head.height);
  const foot = footer(spec, head.height + body.height);
  const height = Math.ceil(head.height + body.height + foot.height + PAD / 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" role="img" aria-label="${esc(spec.title)}">
  <rect width="${W}" height="${height}" rx="18" fill="${C.surface}"/>
  ${head.svg}
  ${body.svg}
  ${foot.svg}
</svg>
`;
  return { svg, width: W, height };
}

async function renderSpecFile(file) {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!spec.slug || !spec.name) throw new Error(`${file}: "slug" and "name" are required`);
  const { svg, width, height } = renderFigureSvg(spec);
  const dir = path.join(root, 'public/blog/figures', spec.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${spec.name}.svg`), svg);
  const png = path.join(dir, `${spec.name}.png`);
  await sharp(Buffer.from(svg), { density: 144 }).resize(width).png({ compressionLevel: 9, palette: true }).toFile(png);
  console.log(`/blog/figures/${spec.slug}/${spec.name}.png  ${width}x${height}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: render-figure.mjs <spec.json> [more.json ...]');
    process.exit(1);
  }
  for (const file of files) await renderSpecFile(file);
}
