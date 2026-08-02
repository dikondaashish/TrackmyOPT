import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLORS, FONT_SIZE, SPACE, RADIUS } from '../src/design/tokens';
import { buildThemeCss } from '../src/design/theme-css';
import { WIDGET_TOKENS } from '../src/widget-platform';

// The unit-test runner executes from apps/extension.
const ROOT = process.cwd();
const CSS = buildThemeCss({ scope: ':root' });

// --- token completeness -----------------------------------------------------

assert.deepEqual(
  Object.keys(COLORS.light).sort(),
  Object.keys(COLORS.dark).sort(),
  'every colour token must exist in both themes'
);
for (const [theme, values] of Object.entries(COLORS)) {
  for (const [name, value] of Object.entries(values)) {
    assert.ok(value.trim().length > 0, `${theme}.${name} is empty`);
  }
}

// --- the widget must not hold a second copy of the palette ------------------

assert.equal(WIDGET_TOKENS.light.surface, COLORS.light.surface);
assert.equal(WIDGET_TOKENS.dark.surface, COLORS.dark.surface);
assert.equal(WIDGET_TOKENS.light.infoBorder, COLORS.light.infoBorder);
assert.equal(WIDGET_TOKENS.dark.accent, COLORS.dark.accent);

// --- emitted CSS ------------------------------------------------------------

assert.match(CSS, /--tmo-color-surface:#ffffff/);
assert.match(CSS, /--tmo-color-surface:#161b22/);
assert.match(CSS, /--tmo-text-md:13px/);
assert.match(CSS, /--tmo-space-4:16px/);
assert.match(CSS, /--tmo-radius-md:13px/);

// All three theme triggers. The popup previously switched only on .dark-mode
// and the widget only on prefers-color-scheme, so they could disagree.
assert.match(CSS, /@media \(prefers-color-scheme:dark\)/);
assert.ok(CSS.includes('[data-tmo-theme="dark"]'), 'attribute theme trigger missing');
assert.ok(CSS.includes('.dark-mode'), 'legacy class theme trigger missing');

// An explicit light setting must beat an OS dark preference.
assert.ok(
  CSS.includes(':not([data-tmo-theme="light"])'),
  'OS dark rule must not apply when light is explicitly forced'
);
assert.ok(CSS.includes(':root[data-tmo-theme="light"]'), 'explicit light override missing');

// Legacy aliases keep popup.css and the widget's inline styles working.
for (const alias of [
  '--bg:', '--surface:', '--surface-2:', '--border:', '--ink:', '--muted:', '--accent:',
  '--tool-blue-surface:', '--tool-green-ink:', '--tool-red-border:',
  '--tmo-widget-surface:', '--tmo-widget-info-border:', '--tmo-widget-danger-ink:',
  '--shadow-card:', '--radius-md:',
]) {
  assert.ok(CSS.includes(alias), `legacy alias ${alias} is not emitted`);
}

assert.match(CSS, /:focus-visible\{outline:2px solid/, 'focus must always be visible');
assert.match(CSS, /@media \(prefers-reduced-motion:reduce\)/);
assert.match(CSS, /\.tmo-ds-btn--primary:not\(:disabled\).*?:hover/, 'primary buttons must have hover styles');
assert.match(CSS, /\.tmo-ds-btn--secondary:not\(:disabled\).*?:hover/, 'secondary buttons must have hover styles');

// --- scales -----------------------------------------------------------------

// popup.css previously shipped 7.5px, 9.5px, 10.5px, 11.5px and 12.5px, which
// render inconsistently across device pixel ratios.
for (const [name, value] of Object.entries(FONT_SIZE)) {
  assert.match(value, /^\d+px$/, `font size ${name} (${value}) is not a whole pixel`);
}
for (const value of Object.values(SPACE)) {
  assert.ok(/^(0|\d+px)$/.test(value), `space step ${value} is not a whole pixel`);
}
for (const value of Object.values(RADIUS)) {
  assert.match(value, /^\d+px$/, `radius ${value} is not a whole pixel`);
}

// --- the duplicate token set must stay deleted ------------------------------

const popupCss = fs.readFileSync(path.join(ROOT, 'public', 'popup.css'), 'utf-8');
for (const token of ['--surface:', '--ink:', '--muted:', '--tool-blue-surface:']) {
  assert.ok(
    !popupCss.includes(token),
    `popup.css defines ${token} again — that reintroduces the duplicate token set`
  );
}

const popupHtml = fs.readFileSync(path.join(ROOT, 'public', 'popup.html'), 'utf-8');
// Read the actual <link> order — a comment mentioning a filename must not count.
const linkedStylesheets = [...popupHtml.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]);
assert.ok(linkedStylesheets.includes('tokens.css'), 'popup.html does not link tokens.css');
assert.ok(
  linkedStylesheets.indexOf('tokens.css') < linkedStylesheets.indexOf('popup.css'),
  `tokens.css must load before popup.css (got ${linkedStylesheets.join(', ')})`
);

// --- no framework creep -----------------------------------------------------

const designDir = path.join(ROOT, 'src', 'design');
for (const file of fs.readdirSync(designDir)) {
  if (!file.endsWith('.ts')) continue;
  const source = fs.readFileSync(path.join(designDir, file), 'utf-8');
  for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
    assert.ok(
      match[1].startsWith('.'),
      `${file} imports non-relative '${match[1]}' — the extension bundles no framework`
    );
  }
}

console.log('design-system: tokens unified, themes consistent, scales normalised');
