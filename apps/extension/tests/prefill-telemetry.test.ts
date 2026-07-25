import assert from 'node:assert/strict';

import { AUTOFILL_FEATURE_FLAGS } from '../src/autofill-feature-flags';
import { emptyPrefillCoverage } from '../src/prefill-coverage';
import { buildPrefillTelemetryProperties } from '../src/prefill-telemetry';
import { normalizeWidgetAnalyticsProperties } from '../src/widget-platform';

const coverage = emptyPrefillCoverage();
coverage.adapterId = 'greenhouse';
coverage.filled = 6;
coverage.skipped = 2;
coverage.total = 8;
coverage.groups.resume = { filled: 1, skipped: 0, total: 1 };
coverage.groups.contact = { filled: 3, skipped: 1, total: 4 };
coverage.groups.experience = { filled: 2, skipped: 1, total: 3 };

const properties = normalizeWidgetAnalyticsProperties(
  'extension_widget_prefill_completed',
  {
    ...buildPrefillTelemetryProperties({
      outcome: 'success',
      result: coverage,
      mode: 'step_by_step',
      sourceType: 'generated_resume',
      artifactStateReason: 'none',
      hasResume: true,
      hasCoverLetter: false,
      featureFlags: AUTOFILL_FEATURE_FLAGS,
    }),
    question_text: 'Why should we hire you?',
    answer_text: 'Private answer',
    resume_text: 'Private resume',
    official_title: 'Private title',
    generated_content_hash: 'a'.repeat(64),
    pdf_base64: 'JVBERi0xLjQK',
  }
);

assert.deepEqual(properties, {
  source: 'chrome_extension',
  outcome: 'success',
  filled: 6,
  skipped: 2,
  total: 8,
  has_resume: true,
  has_cover_letter: false,
  adapter_id: 'greenhouse',
  mode: 'step_by_step',
  source_type: 'generated_resume',
  artifact_state_reason: 'none',
  review_state: 'not_requested',
  flag_artifact_prefill: true,
  flag_skills: true,
  flag_continuous_mode: true,
  flag_ai_screening_drafts: true,
  flag_cover_letter: true,
  flag_guided_autopilot: true,
  flag_history_fields: true,
  flag_ats_adapters: true,
  resume_filled: 1,
  resume_skipped: 0,
  cover_letter_filled: 0,
  cover_letter_skipped: 0,
  contact_filled: 3,
  contact_skipped: 1,
  skills_filled: 0,
  skills_skipped: 0,
  experience_filled: 2,
  experience_skipped: 1,
  education_filled: 0,
  education_skipped: 0,
});

console.log(
  'prefill-telemetry: bounded diagnostics and content dropping passed'
);
