#!/usr/bin/env node
/**
 * Render a 1200x630 blog cover from a small JSON spec, as SVG and PNG.
 *
 * The SVG matches the hand-made covers already in public/blog (cream canvas,
 * navy and blue accents, Inter). The PNG is rendered by sharp so social
 * previews, which do not reliably render SVG, get a raster file.
 *
 *   node scripts/blog-covers/render-cover.mjs spec.json
 *   node scripts/blog-covers/render-cover.mjs specs/*.json
 *
 * Spec:
 * {
 *   "slug": "december-2026-visa-bulletin-predictions",
 *   "chip": "MONTHLY OUTLOOK",
 *   "headline": ["December 2026", "Visa Bulletin:", "Predictions"],   // 1-3 lines
 *   "accentLine": 1,                                                   // index drawn in blue
 *   "subtitle": ["Scenario math from the official", "October and November tables."],
 *   "stats": [{ "value": "+3 wks", "label": "EB-3 INDIA" }, ...],      // 0-3 KPI cards
 *   "footer": "10 min read  |  November 8, 2026  |  Vinay Kumar",
 *   "lang": "en"
 * }
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const outDir = path.join(root, 'public/blog');
const FONT = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function headlineSize(lines) {
  const longest = Math.max(...lines.map((l) => l.length));
  if (longest <= 18) return 60;
  if (longest <= 24) return 52;
  if (longest <= 30) return 44;
  return 38;
}

export function renderSvg(spec) {
  const lines = spec.headline.slice(0, 3);
  const size = headlineSize(lines);
  const lineGap = Math.round(size * 1.18);
  const top = 262;
  const headline = lines
    .map((line, i) => {
      const fill = i === (spec.accentLine ?? 1) ? '#1e3a8a' : '#0f172a';
      return `<text x="80" y="${top + i * lineGap}" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${fill}" letter-spacing="-1.2">${esc(line)}</text>`;
    })
    .join('\n  ');

  const subtitleTop = top + lines.length * lineGap + 10;
  const subtitle = (spec.subtitle ?? [])
    .slice(0, 2)
    .map(
      (line, i) =>
        `<text x="80" y="${subtitleTop + i * 28}" font-family="${FONT}" font-size="19" fill="#475569">${esc(line)}</text>`
    )
    .join('\n  ');

  const stats = (spec.stats ?? []).slice(0, 3);
  const cardW = 200;
  const cardH = 108;
  const gap = 16;
  const statsRight = 1120;
  const statsTop = 440;
  const cards = stats
    .map((stat, i) => {
      const x = statsRight - (stats.length - i) * (cardW + gap) + gap;
      return `<g transform="translate(${x},${statsTop})">
    <rect width="${cardW}" height="${cardH}" rx="16" fill="url(#cardGrad)"/>
    <text x="${cardW / 2}" y="54" font-family="${FONT}" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${esc(stat.value)}</text>
    <text x="${cardW / 2}" y="86" font-family="${FONT}" font-size="12" font-weight="700" fill="#fde68a" text-anchor="middle" letter-spacing="1.8">${esc(stat.label)}</text>
  </g>`;
    })
    .join('\n  ');

  const chipW = Math.max(150, spec.chip.length * 9.2 + 48);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" lang="${esc(spec.lang ?? 'en')}">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e3a8a"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#eae7db"/>
  <circle cx="1100" cy="80" r="180" fill="#3b82f6" fill-opacity="0.10"/>
  <circle cx="120" cy="560" r="220" fill="#3b82f6" fill-opacity="0.07"/>

  <g transform="translate(80,80)">
    <rect width="56" height="56" rx="14" fill="#1e3a8a"/>
    <path d="M18 28 L28 34 L40 20" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="158" y="118" font-family="${FONT}" font-size="24" font-weight="800" fill="#0f172a">track<tspan fill="#3b82f6">my</tspan>opt</text>

  <g transform="translate(80,170)">
    <rect width="${chipW}" height="40" rx="20" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="${chipW / 2}" y="26" font-family="${FONT}" font-size="13" font-weight="700" fill="#92400e" text-anchor="middle" letter-spacing="1.5">${esc(spec.chip)}</text>
  </g>

  ${headline}

  ${subtitle}

  ${cards}

  <text x="80" y="594" font-family="${FONT}" font-size="14" fill="#64748b">${esc(spec.footer ?? '')}</text>
</svg>
`;
}

async function renderSpec(file) {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const svg = renderSvg(spec);
  const svgPath = path.join(outDir, `${spec.slug}.svg`);
  const pngPath = path.join(outDir, `${spec.slug}.png`);
  fs.writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg), { density: 144 })
    .png({ compressionLevel: 9, palette: true })
    .toFile(pngPath);
  const { size } = fs.statSync(pngPath);
  console.log(`${spec.slug}: ${path.relative(root, svgPath)}, ${path.relative(root, pngPath)} (${Math.round(size / 1024)} KB)`);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: render-cover.mjs <spec.json> [more.json ...]');
  process.exit(1);
}
for (const file of files) await renderSpec(file);
