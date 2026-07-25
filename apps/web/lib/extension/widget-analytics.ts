export const EXTENSION_WIDGET_EVENTS = [
  'extension_widget_shown',
  'extension_widget_sponsorship_classified',
  'extension_widget_job_saved',
  'extension_widget_prefill_completed',
  'extension_widget_screening_review_state',
  'extension_widget_job_analyzed',
  'extension_widget_resume_generated',
] as const;

export type ExtensionWidgetEvent = (typeof EXTENSION_WIDGET_EVENTS)[number];

const EVENT_SET = new Set<string>(EXTENSION_WIDGET_EVENTS);
const EVENT_KEYS: Record<ExtensionWidgetEvent, readonly string[]> = {
  extension_widget_shown: ['site_family', 'default_view'],
  extension_widget_sponsorship_classified: [
    'site_family',
    'signal',
    'refreshed',
  ],
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
  extension_widget_job_analyzed: [
    'site_family',
    'outcome',
    'score',
    'matched_keywords_count',
    'missing_keywords_count',
    'error_code',
  ],
  extension_widget_resume_generated: [
    'site_family',
    'outcome',
    'template_id',
    'baseline_score',
    'generated_score',
    'score_delta',
    'error_code',
  ],
};
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
    'extraction_failed',
    'unsupported_control',
    'draft_review_pending',
    'attachment_failed',
    'unknown',
  ],
  adapter_id: ['generic', 'workday', 'greenhouse', 'none'],
  mode: ['step_by_step', 'continuous'],
  source_type: ['generated_resume', 'profile_only', 'unavailable'],
  artifact_state_reason: [
    'none',
    'missing',
    'expired',
    'job_changed',
    'invalid',
    'feature_disabled',
    'unavailable',
  ],
  review_state: [
    'not_applicable',
    'not_requested',
    'needs_review',
    'confirmed',
    'edited',
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
]);
const SAFE_SIGNED_NUMBER_KEYS = new Set(['score_delta']);
const SAFE_BOOLEAN_KEYS = new Set([
  'has_resume',
  'has_cover_letter',
  'refreshed',
  'flag_artifact_prefill',
  'flag_skills',
  'flag_continuous_mode',
  'flag_ai_screening_drafts',
  'flag_cover_letter',
  'flag_history_fields',
  'flag_ats_adapters',
]);

function boundedInteger(
  value: unknown,
  min = 0,
  max = 500,
): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(min, Math.min(max, Math.round(value)));
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
  const allowedKeys = new Set(EVENT_KEYS[event]);

  for (const key of allowedKeys) {
    const value = raw[key];
    const allowed = SAFE_STRING_VALUES[key];
    if (allowed && typeof value === 'string' && allowed.includes(value)) {
      properties[key] = value;
      continue;
    }
    if (SAFE_NUMBER_KEYS.has(key)) {
      const normalized = boundedInteger(value);
      if (normalized !== undefined) properties[key] = normalized;
      continue;
    }
    if (SAFE_SIGNED_NUMBER_KEYS.has(key)) {
      const normalized = boundedInteger(value, -100, 100);
      if (normalized !== undefined) properties[key] = normalized;
      continue;
    }
    if (SAFE_BOOLEAN_KEYS.has(key) && typeof value === 'boolean') {
      properties[key] = value;
    }
  }

  return { event, properties };
}
