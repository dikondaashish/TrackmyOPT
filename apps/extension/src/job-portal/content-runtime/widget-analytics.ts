import { jobMemoryKey } from '../../prefill/smart-flow';
import { reportContentDiagnostic } from '../../shared/content-diagnostics';
import { platformForHostname } from '../../platform-config/remote-config';
import { normalizeWidgetAnalyticsProperties, widgetSiteFamily, type WidgetAnalyticsEvent, type WidgetAnalyticsProperties } from '../../widget/widget-platform';
import { emptyPrefillCoverage } from '../../prefill/prefill-coverage';
import { type AutofillPreferences } from '../../prefill/autofill-preferences';
import { AUTOFILL_FEATURE_FLAGS } from '../../prefill/autofill-feature-flags';
import { buildPrefillTelemetryProperties } from '../../prefill/prefill-telemetry';
import { JobInfo } from '../../job/job-posting-scrape';
import { type PrefillExecutionSnapshot } from '../job-portal-tracker-widget';
/** Best-effort widget analytics and prefill telemetry. The once-per-job dedupe set lives only here. */

const trackedWidgetAnalytics = new Set<string>();

export function trackWidgetAnalytics(
  event: WidgetAnalyticsEvent,
  properties: WidgetAnalyticsProperties = {},
): void {
  const safeProperties = normalizeWidgetAnalyticsProperties(event, {
    site_family: widgetSiteFamily(window.location.hostname),
    ...properties,
  });
  try {
    chrome.runtime.sendMessage(
      { type: 'TRACK_WIDGET_EVENT', event, properties: safeProperties },
      () => void chrome.runtime.lastError,
    );
  } catch {
    // Analytics is best-effort and must never interrupt a user action.
  }
}

export function trackWidgetAnalyticsOnce(
  event: WidgetAnalyticsEvent,
  job: JobInfo,
  properties: WidgetAnalyticsProperties = {},
  variant = '',
): void {
  const key = `${event}|${jobMemoryKey({
    jobUrl: job.job_url,
    companyName: job.company_name,
    roleTitle: job.role_title,
  })}|${variant}`;
  if (trackedWidgetAnalytics.has(key)) return;
  trackedWidgetAnalytics.add(key);
  trackWidgetAnalytics(event, properties);
}

export function trackPrefillExecution(
  execution: PrefillExecutionSnapshot,
  mode: AutofillPreferences['mode'],
  outcome: 'success' | 'error',
): void {
  trackWidgetAnalytics(
    'extension_widget_prefill_completed',
    buildPrefillTelemetryProperties({
      outcome,
      result: execution.result,
      mode,
      sourceType: execution.sourceType,
      artifactStateReason: execution.artifactStateReason,
      hasResume: execution.hasResume,
      hasCoverLetter: execution.hasCoverLetter,
      featureFlags: AUTOFILL_FEATURE_FLAGS,
    }),
  );
}

export function trackPrefillRuntimeFailure(
  mode: AutofillPreferences['mode'],
  hasResume = false,
): void {
  // An unexpected runtime failure is also an error signal for Sentry (content-free).
  reportContentDiagnostic('prefill_runtime_error', 'processing', platformForHostname(location.hostname));
  trackWidgetAnalytics(
    'extension_widget_prefill_completed',
    buildPrefillTelemetryProperties({
      outcome: 'error',
      result: emptyPrefillCoverage(),
      mode,
      sourceType: 'unavailable',
      artifactStateReason: 'unavailable',
      hasResume,
      hasCoverLetter: false,
      featureFlags: AUTOFILL_FEATURE_FLAGS,
      errorCode: 'runtime',
    }),
  );
}
