import { COLORS, SHADOW, type ThemeName } from './design/tokens';
import { buildThemeCss } from './design/theme-css';

/**
 * Widget-shaped view of the shared design tokens.
 *
 * The values used to be duplicated here and in popup.css. They now derive from
 * src/design/tokens.ts, so the widget and the popup cannot drift apart. The
 * key names are kept for the ~178 inline `cssText` call sites that reference
 * `--tmo-widget-*`; new code should use the primitives in src/design instead.
 */
function widgetPalette(theme: ThemeName) {
  const c = COLORS[theme];
  return {
    background: c.bg,
    surface: c.surface,
    surface2: c.surfaceRaised,
    border: c.border,
    ink: c.ink,
    muted: c.inkMuted,
    accent: c.accent,
    accentStrong: c.accentStrong,
    focus: c.focusRing,
    shadow: SHADOW[theme]['3'],
    overlay: c.overlay,
    successSurface: c.successSurface,
    successBorder: c.successBorder,
    successInk: c.successInk,
    warningSurface: c.warningSurface,
    warningBorder: c.warningBorder,
    warningInk: c.warningInk,
    dangerSurface: c.dangerSurface,
    dangerBorder: c.dangerBorder,
    dangerInk: c.dangerInk,
    infoSurface: c.infoSurface,
    infoBorder: c.infoBorder,
    infoInk: c.infoInk,
  };
}

export const WIDGET_TOKENS = {
  light: widgetPalette('light'),
  dark: widgetPalette('dark'),
} as const;

type WidgetTheme = keyof typeof WIDGET_TOKENS;
type WidgetTokenName = keyof (typeof WIDGET_TOKENS)['light'];

const CSS_TOKEN_NAMES: Record<WidgetTokenName, string> = {
  background: 'background',
  surface: 'surface',
  surface2: 'surface-2',
  border: 'border',
  ink: 'ink',
  muted: 'muted',
  accent: 'accent',
  accentStrong: 'accent-strong',
  focus: 'focus',
  shadow: 'shadow',
  overlay: 'overlay',
  successSurface: 'success-surface',
  successBorder: 'success-border',
  successInk: 'success-ink',
  warningSurface: 'warning-surface',
  warningBorder: 'warning-border',
  warningInk: 'warning-ink',
  dangerSurface: 'danger-surface',
  dangerBorder: 'danger-border',
  dangerInk: 'danger-ink',
  infoSurface: 'info-surface',
  infoBorder: 'info-border',
  infoInk: 'info-ink',
};

function tokenDeclarations(theme: WidgetTheme): string {
  return Object.entries(WIDGET_TOKENS[theme])
    .map(([name, value]) => `--tmo-widget-${CSS_TOKEN_NAMES[name as WidgetTokenName]}:${value}`)
    .join(';');
}

/**
 * Widget stylesheet.
 *
 * Emits the full canonical token set (`--tmo-color-*`, `--tmo-space-*`,
 * `--tmo-text-*`, …) as well as the `--tmo-widget-*` names the existing inline
 * styles use. Without the canonical set, a `var(--tmo-color-accent)` written
 * inside the widget would silently fail to resolve.
 */
export function buildWidgetThemeCss(scopeSelector: string): string {
  const scope = scopeSelector.trim() || '.tmo-widget-theme-scope';
  return [
    buildThemeCss({ scope, legacyAliases: true, baseRules: true }),
    // Widget-specific names layered on top of the canonical tokens.
    `${scope}{${tokenDeclarations('light')};color:var(--tmo-widget-ink)}`,
    `@media (prefers-color-scheme: dark){${scope}:not([data-tmo-theme="light"]){${tokenDeclarations('dark')}}}`,
    `${scope}[data-tmo-theme="dark"]{${tokenDeclarations('dark')}}`,
  ].join('\n');
}

/** True for opaque CSS colors whose perceived luminance is dark. */
export function isDarkCssColor(value: string): boolean {
  const color = value.trim().toLowerCase();
  let channels: [number, number, number] | null = null;
  const rgb = color.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/);
  if (rgb) {
    if (rgb[4] !== undefined && Number(rgb[4]) <= 0.05) return false;
    channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  } else {
    const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
    if (hex?.length === 3) {
      channels = [...hex].map((part) => Number.parseInt(part + part, 16)) as [number, number, number];
    } else if (hex?.length === 6) {
      channels = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as [number, number, number];
    }
  }
  if (!channels || channels.some((channel) => !Number.isFinite(channel))) return false;
  const [red, green, blue] = channels;
  return (red * 0.2126 + green * 0.7152 + blue * 0.0722) < 128;
}

export const WIDGET_ANALYTICS_EVENTS = [
  'extension_widget_shown',
  'extension_widget_sponsorship_classified',
  'extension_widget_job_saved',
  'extension_widget_prefill_completed',
  'extension_widget_screening_review_state',
  'extension_widget_job_analyzed',
  'extension_widget_resume_generated',
  'extension_widget_guided_navigation',
] as const;

export type WidgetAnalyticsEvent = (typeof WIDGET_ANALYTICS_EVENTS)[number];
export type WidgetAnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

const SITE_FAMILIES = [
  'linkedin', 'indeed', 'glassdoor', 'greenhouse', 'lever', 'workday',
  'ashby', 'icims', 'smartrecruiters', 'jobvite', 'handshake', 'other',
] as const;

export function widgetSiteFamily(hostname: string): (typeof SITE_FAMILIES)[number] {
  const host = hostname.toLowerCase();
  if (host.includes('linkedin.')) return 'linkedin';
  if (host.includes('indeed.')) return 'indeed';
  if (host.includes('glassdoor.')) return 'glassdoor';
  if (host.includes('greenhouse.') || host.includes('greenhouse.io')) return 'greenhouse';
  if (host.includes('lever.co')) return 'lever';
  if (host.includes('myworkdayjobs.') || host.includes('workday.')) return 'workday';
  if (host.includes('ashbyhq.')) return 'ashby';
  if (host.includes('icims.')) return 'icims';
  if (host.includes('smartrecruiters.')) return 'smartrecruiters';
  if (host.includes('jobvite.')) return 'jobvite';
  if (host.includes('joinhandshake.')) return 'handshake';
  return 'other';
}

const EVENT_KEYS: Record<WidgetAnalyticsEvent, readonly string[]> = {
  extension_widget_shown: ['site_family', 'default_view'],
  extension_widget_sponsorship_classified: ['site_family', 'signal', 'refreshed'],
  extension_widget_job_saved: ['site_family', 'status', 'outcome'],
  extension_widget_prefill_completed: [
    'site_family',
    'outcome',
    'filled',
    'skipped',
    'total',
    'has_resume',
    'has_cover_letter',
    'adapter_id',
    'mode',
    'source_type',
    'artifact_state_reason',
    'review_state',
    'flag_artifact_prefill',
    'flag_skills',
    'flag_continuous_mode',
    'flag_ai_screening_drafts',
    'flag_cover_letter',
    'flag_guided_autopilot',
    'flag_history_fields',
    'flag_ats_adapters',
    'resume_filled',
    'resume_skipped',
    'cover_letter_filled',
    'cover_letter_skipped',
    'contact_filled',
    'contact_skipped',
    'skills_filled',
    'skills_skipped',
    'experience_filled',
    'experience_skipped',
    'education_filled',
    'education_skipped',
    'error_code',
  ],
  extension_widget_screening_review_state: ['site_family', 'review_state'],
  extension_widget_job_analyzed: ['site_family', 'outcome', 'score', 'matched_keywords_count', 'missing_keywords_count', 'error_code'],
  extension_widget_resume_generated: ['site_family', 'outcome', 'template_id', 'baseline_score', 'generated_score', 'score_delta', 'error_code'],
  extension_widget_guided_navigation: ['site_family', 'navigation_outcome'],
};

const ENUM_VALUES: Record<string, readonly string[]> = {
  site_family: SITE_FAMILIES,
  default_view: ['expanded', 'minimized'],
  signal: ['sponsors', 'no_sponsorship', 'unclear'],
  status: ['Applied', 'Wishlist'],
  outcome: ['success', 'error', 'limit', 'not_signed_in', 'no_job_description', 'no_base_resume'],
  template_id: ['professional', 'tech', 'modern', 'academic', 'executive', 'creative'],
  error_code: [
    'network', 'runtime', 'not_signed_in', 'no_job_description',
    'no_base_resume', 'limit', 'compile_failed', 'analyze_failed',
    'extraction_failed', 'unsupported_control', 'draft_review_pending',
    'attachment_failed', 'unknown',
  ],
  adapter_id: ['generic', 'workday', 'greenhouse', 'none'],
  mode: ['step_by_step', 'continuous'],
  source_type: ['generated_resume', 'profile_only', 'unavailable'],
  artifact_state_reason: [
    'none', 'missing', 'expired', 'job_changed', 'invalid',
    'feature_disabled', 'unavailable',
  ],
  review_state: [
    'not_applicable', 'not_requested', 'needs_review', 'confirmed', 'edited',
  ],
  navigation_outcome: [
    'advanced',
    'stopped_final_step',
    'stopped_review_step',
    'blocked_required_fields',
    'no_safe_control',
    'stopped',
  ],
};

const NUMBER_KEYS = new Set([
  'filled', 'skipped', 'total', 'score', 'matched_keywords_count',
  'missing_keywords_count', 'baseline_score', 'generated_score',
  'resume_filled', 'resume_skipped',
  'cover_letter_filled', 'cover_letter_skipped',
  'contact_filled', 'contact_skipped',
  'skills_filled', 'skills_skipped',
  'experience_filled', 'experience_skipped',
  'education_filled', 'education_skipped',
]);
// `score_delta` is signed: a tailored resume can score worse than the baseline,
// so it must keep its sign instead of being clamped to 0 like the counts above.
const SIGNED_NUMBER_KEYS = new Set(['score_delta']);
const BOOLEAN_KEYS = new Set([
  'has_resume', 'has_cover_letter', 'refreshed',
  'flag_artifact_prefill', 'flag_skills', 'flag_continuous_mode',
  'flag_ai_screening_drafts', 'flag_cover_letter', 'flag_history_fields',
  'flag_ats_adapters', 'flag_guided_autopilot',
]);

function boundedInteger(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function normalizeWidgetAnalyticsProperties(
  event: WidgetAnalyticsEvent,
  input: unknown,
): WidgetAnalyticsProperties {
  const source = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const result: WidgetAnalyticsProperties = { source: 'chrome_extension' };
  for (const key of EVENT_KEYS[event]) {
    const value = source[key];
    if (NUMBER_KEYS.has(key)) {
      const normalized = boundedInteger(value, 0, 500);
      if (normalized !== undefined) result[key] = normalized;
      continue;
    }
    if (SIGNED_NUMBER_KEYS.has(key)) {
      const normalized = boundedInteger(value, -100, 100);
      if (normalized !== undefined) result[key] = normalized;
      continue;
    }
    if (BOOLEAN_KEYS.has(key)) {
      if (typeof value === 'boolean') result[key] = value;
      continue;
    }
    const allowed = ENUM_VALUES[key];
    if (!allowed || typeof value !== 'string') continue;
    const candidate = key === 'site_family' ? value.trim().toLowerCase() : value.trim();
    if (allowed.includes(candidate)) result[key] = candidate;
  }
  return result;
}
