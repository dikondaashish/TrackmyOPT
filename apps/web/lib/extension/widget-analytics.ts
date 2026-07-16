export const EXTENSION_WIDGET_EVENTS = [
  'extension_widget_shown',
  'extension_widget_sponsorship_classified',
  'extension_widget_job_saved',
  'extension_widget_prefill_completed',
  'extension_widget_job_analyzed',
  'extension_widget_resume_generated',
] as const;

export type ExtensionWidgetEvent = (typeof EXTENSION_WIDGET_EVENTS)[number];

const EVENT_SET = new Set<string>(EXTENSION_WIDGET_EVENTS);
const SAFE_STRING_VALUES: Record<string, readonly string[]> = {
  site_family: [
    'linkedin',
    'indeed',
    'glassdoor',
    'greenhouse',
    'lever',
    'workday',
    'ashby',
    'icims',
    'smartrecruiters',
    'jobvite',
    'handshake',
    'other',
  ],
  default_view: ['expanded', 'minimized'],
  signal: ['sponsors', 'no_sponsorship', 'unclear'],
  status: ['Applied', 'Wishlist'],
  outcome: [
    'success',
    'error',
    'limit',
    'not_signed_in',
    'no_job_description',
    'no_base_resume',
  ],
  template_id: [
    'professional',
    'tech',
    'modern',
    'academic',
    'executive',
    'creative',
  ],
  error_code: [
    'network',
    'runtime',
    'not_signed_in',
    'no_job_description',
    'no_base_resume',
    'limit',
    'compile_failed',
    'analyze_failed',
    'unknown',
  ],
};
const SAFE_NUMBER_KEYS = new Set([
  'filled',
  'skipped',
  'total',
  'score',
  'matched_keywords_count',
  'missing_keywords_count',
  'baseline_score',
  'generated_score',
  'score_delta',
]);
const SAFE_BOOLEAN_KEYS = new Set(['has_resume', 'refreshed']);

function boundedInteger(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(500, Math.round(value)));
}

export function normalizeExtensionWidgetAnalytics(input: unknown): {
  event: ExtensionWidgetEvent;
  properties: Record<string, string | number | boolean>;
} | null {
  if (!input || typeof input !== 'object') return null;
  const body = input as { event?: unknown; properties?: unknown };
  if (typeof body.event !== 'string' || !EVENT_SET.has(body.event)) return null;
  const event = body.event as ExtensionWidgetEvent;
  const raw =
    body.properties && typeof body.properties === 'object'
      ? (body.properties as Record<string, unknown>)
      : {};
  const properties: Record<string, string | number | boolean> = {
    source: 'chrome_extension',
  };

  for (const [key, allowed] of Object.entries(SAFE_STRING_VALUES)) {
    const value = raw[key];
    if (typeof value === 'string' && allowed.includes(value))
      properties[key] = value;
  }
  for (const key of SAFE_NUMBER_KEYS) {
    const value = boundedInteger(raw[key]);
    if (value !== undefined) properties[key] = value;
  }
  for (const key of SAFE_BOOLEAN_KEYS) {
    if (typeof raw[key] === 'boolean') properties[key] = raw[key] as boolean;
  }

  return { event, properties };
}
