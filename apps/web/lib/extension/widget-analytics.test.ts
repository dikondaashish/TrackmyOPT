import { describe, expect, it } from 'vitest';
import { normalizeExtensionWidgetAnalytics } from './widget-analytics';

describe('normalizeExtensionWidgetAnalytics', () => {
  it('accepts a canonical widget action with safe bounded properties', () => {
    expect(
      normalizeExtensionWidgetAnalytics({
        event: 'extension_widget_job_analyzed',
        properties: {
          outcome: 'success',
          score: 84.6,
          matched_keywords_count: 11,
          missing_keywords_count: 3,
          job_url: 'https://jobs.example.com/private',
        },
      })
    ).toEqual({
      event: 'extension_widget_job_analyzed',
      properties: {
        source: 'chrome_extension',
        outcome: 'success',
        score: 85,
        matched_keywords_count: 11,
        missing_keywords_count: 3,
      },
    });
  });

  it('rejects unknown event names', () => {
    expect(
      normalizeExtensionWidgetAnalytics({
        event: 'arbitrary_event',
        properties: {},
      })
    ).toBeNull();
  });

  it('drops URLs, job text, company names, and unknown properties', () => {
    expect(
      normalizeExtensionWidgetAnalytics({
        event: 'extension_widget_shown',
        properties: {
          site_family: 'greenhouse',
          default_view: 'expanded',
          job_url: 'https://example.com/secret',
          job_description: 'private posting text',
          company_name: 'Example',
          arbitrary: 'value',
        },
      })
    ).toEqual({
      event: 'extension_widget_shown',
      properties: {
        source: 'chrome_extension',
        site_family: 'greenhouse',
        default_view: 'expanded',
      },
    });
  });

  it('accepts bounded prefill diagnostics without accepting application content', () => {
    expect(
      normalizeExtensionWidgetAnalytics({
        event: 'extension_widget_prefill_completed',
        properties: {
          site_family: 'workday',
          outcome: 'success',
          adapter_id: 'workday',
          mode: 'continuous',
          source_type: 'generated_resume',
          artifact_state_reason: 'none',
          review_state: 'not_applicable',
          flag_artifact_prefill: true,
          flag_skills: false,
          flag_continuous_mode: true,
          flag_ai_screening_drafts: false,
          flag_cover_letter: false,
          flag_history_fields: true,
          flag_ats_adapters: true,
          resume_filled: 1,
          experience_filled: 4,
          experience_skipped: 2,
          has_resume: true,
          has_cover_letter: false,
          applicant_name: 'Private Applicant',
          employer_name: 'Private Employer',
          official_title: 'Private Title',
          question_text: 'Private question',
          answer_text: 'Private answer',
          resume_text: 'Private resume',
          cover_letter_text: 'Private letter',
          generated_content_hash: 'a'.repeat(64),
          pdf_base64: 'JVBERi0xLjQK',
          job_url: 'https://example.com/private',
        },
      }),
    ).toEqual({
      event: 'extension_widget_prefill_completed',
      properties: {
        source: 'chrome_extension',
        site_family: 'workday',
        outcome: 'success',
        adapter_id: 'workday',
        mode: 'continuous',
        source_type: 'generated_resume',
        artifact_state_reason: 'none',
        review_state: 'not_applicable',
        flag_artifact_prefill: true,
        flag_skills: false,
        flag_continuous_mode: true,
        flag_ai_screening_drafts: false,
        flag_cover_letter: false,
        flag_history_fields: true,
        flag_ats_adapters: true,
        resume_filled: 1,
        experience_filled: 4,
        experience_skipped: 2,
        has_resume: true,
        has_cover_letter: false,
      },
    });
  });

  it('applies the event-specific allowlist and preserves signed score deltas', () => {
    expect(
      normalizeExtensionWidgetAnalytics({
        event: 'extension_widget_resume_generated',
        properties: {
          score_delta: -23.6,
          adapter_id: 'workday',
          resume_filled: 1,
        },
      }),
    ).toEqual({
      event: 'extension_widget_resume_generated',
      properties: {
        source: 'chrome_extension',
        score_delta: -24,
      },
    });
  });

  it('accepts only the review-state enum for screening review telemetry', () => {
    expect(
      normalizeExtensionWidgetAnalytics({
        event: 'extension_widget_screening_review_state',
        properties: {
          site_family: 'greenhouse',
          review_state: 'edited',
          question_text: 'Private question',
          answer_text: 'Private answer',
        },
      }),
    ).toEqual({
      event: 'extension_widget_screening_review_state',
      properties: {
        source: 'chrome_extension',
        site_family: 'greenhouse',
        review_state: 'edited',
      },
    });
  });
});
