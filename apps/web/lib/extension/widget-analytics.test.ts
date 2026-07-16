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
});
