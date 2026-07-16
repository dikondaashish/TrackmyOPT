import assert from 'node:assert/strict';
import {
  WIDGET_TOKENS,
  buildWidgetThemeCss,
  isDarkCssColor,
  normalizeWidgetAnalyticsProperties,
  type WidgetAnalyticsEvent,
} from '../src/widget-platform';
import { toolSurfaceCard } from '../src/tool-page-theme';

assert.equal(WIDGET_TOKENS.light.surface, '#ffffff');
assert.equal(WIDGET_TOKENS.light.ink, '#0f172a');
assert.equal(WIDGET_TOKENS.dark.surface, '#161b22');
assert.equal(WIDGET_TOKENS.dark.accent, '#5eead4');

const themeCss = buildWidgetThemeCss('.tmo-widget-theme-scope');
assert.match(themeCss, /\.tmo-widget-theme-scope/);
assert.match(themeCss, /@media \(prefers-color-scheme: dark\)/);
assert.match(themeCss, /--tmo-widget-surface:#ffffff/);
assert.match(themeCss, /--tmo-widget-surface:#161b22/);
assert.match(themeCss, /prefers-reduced-motion: reduce/);
assert.equal(isDarkCssColor('rgb(9, 13, 20)'), true);
assert.equal(isDarkCssColor('rgba(255, 255, 255, 0)'), false);
assert.equal(isDarkCssColor('#f8fafc'), false);

const event: WidgetAnalyticsEvent = 'extension_widget_prefill_completed';
assert.deepEqual(
  normalizeWidgetAnalyticsProperties(event, {
    site_family: 'LinkedIn',
    outcome: 'success',
    filled: 8.9,
    skipped: -3,
    total: 9999,
    has_resume: true,
    job_url: 'https://example.com/private-job',
    company_name: 'Private Company',
  }),
  {
    source: 'chrome_extension',
    site_family: 'linkedin',
    outcome: 'success',
    filled: 9,
    skipped: 0,
    total: 500,
    has_resume: true,
  },
  'analytics keeps bounded low-cardinality properties and drops job data',
);

assert.deepEqual(
  normalizeWidgetAnalyticsProperties('extension_widget_sponsorship_classified', {
    signal: 'no_sponsorship',
    refreshed: true,
  }),
  {
    source: 'chrome_extension',
    signal: 'no_sponsorship',
    refreshed: true,
  },
);

// A tailored resume can score worse than the baseline: score_delta must keep
// its sign (bounded to [-100, 100]) instead of being clamped to 0 like counts.
assert.deepEqual(
  normalizeWidgetAnalyticsProperties('extension_widget_resume_generated', {
    site_family: 'greenhouse',
    outcome: 'success',
    template_id: 'tech',
    baseline_score: 71,
    generated_score: 58,
    score_delta: -13,
  }),
  {
    source: 'chrome_extension',
    site_family: 'greenhouse',
    outcome: 'success',
    template_id: 'tech',
    baseline_score: 71,
    generated_score: 58,
    score_delta: -13,
  },
  'score_delta preserves a negative (worse) delta',
);
assert.deepEqual(
  normalizeWidgetAnalyticsProperties('extension_widget_resume_generated', {
    score_delta: -9999,
  }),
  { source: 'chrome_extension', score_delta: -100 },
  'score_delta is bounded to -100 at the low end',
);

const blueSurface = toolSurfaceCard('blue');
assert.match(blueSurface, /var\(--tool-blue-surface\)/);
assert.match(blueSurface, /var\(--tool-blue-border\)/);
assert.match(blueSurface, /var\(--ink\)/);
assert.doesNotMatch(blueSurface, /linear-gradient/);

console.log('widget-platform: dark tokens, safe analytics, and popup surfaces passed');
