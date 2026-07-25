import type { AutofillErrorCode } from './autofill-errors';
import type { AutofillFeatureFlags } from './autofill-feature-flags';
import type { AutofillPreferences } from './autofill-preferences';
import type { PrefillCoverageResult } from './prefill-coverage';
import type { WidgetAnalyticsProperties } from './widget-platform';

export type PrefillSourceType =
  | 'generated_resume'
  | 'profile_only'
  | 'unavailable';

export type PrefillArtifactStateReason =
  | 'none'
  | 'missing'
  | 'expired'
  | 'job_changed'
  | 'invalid'
  | 'feature_disabled'
  | 'unavailable';

/**
 * Converts a prefill run into bounded, content-free diagnostics. Keep this
 * function limited to enums, booleans, and counts: never add field labels,
 * values, resume data, question text, URLs, hashes, or file bytes.
 */
export function buildPrefillTelemetryProperties(input: {
  outcome: 'success' | 'error';
  result: PrefillCoverageResult;
  mode: AutofillPreferences['mode'];
  sourceType: PrefillSourceType;
  artifactStateReason: PrefillArtifactStateReason;
  hasResume: boolean;
  hasCoverLetter: boolean;
  featureFlags: Readonly<AutofillFeatureFlags>;
  errorCode?: AutofillErrorCode | 'runtime';
}): WidgetAnalyticsProperties {
  const { groups } = input.result;
  return {
    outcome: input.outcome,
    filled: input.result.filled,
    skipped: input.result.skipped,
    total: input.result.total,
    has_resume: input.hasResume,
    has_cover_letter: input.hasCoverLetter,
    adapter_id: input.result.adapterId ?? 'none',
    mode: input.mode,
    source_type: input.sourceType,
    artifact_state_reason: input.artifactStateReason,
    review_state: input.featureFlags.aiScreeningDrafts
      ? 'not_requested'
      : 'not_applicable',
    flag_artifact_prefill: input.featureFlags.artifactPrefill,
    flag_skills: input.featureFlags.skills,
    flag_continuous_mode: input.featureFlags.continuousMode,
    flag_ai_screening_drafts: input.featureFlags.aiScreeningDrafts,
    flag_cover_letter: input.featureFlags.coverLetter,
    flag_guided_autopilot: input.featureFlags.guidedAutopilot,
    flag_history_fields: input.featureFlags.historyFields,
    flag_ats_adapters: input.featureFlags.atsAdapters,
    resume_filled: groups.resume.filled,
    resume_skipped: groups.resume.skipped,
    cover_letter_filled: groups.cover_letter.filled,
    cover_letter_skipped: groups.cover_letter.skipped,
    contact_filled: groups.contact.filled,
    contact_skipped: groups.contact.skipped,
    skills_filled: groups.skills.filled,
    skills_skipped: groups.skills.skipped,
    experience_filled: groups.experience.filled,
    experience_skipped: groups.experience.skipped,
    education_filled: groups.education.filled,
    education_skipped: groups.education.skipped,
    error_code: input.errorCode,
  };
}
