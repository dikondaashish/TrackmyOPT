import type { DiagnosticCode, DiagnosticStage } from './diagnostics-protocol';
import type { PlatformId } from '../platform-config/remote-config';

/**
 * Relay a content-free failure signal to the worker, which reports it to
 * Sentry through the web API. Only closed enums are sent; never page data.
 */
export function reportContentDiagnostic(
  code: DiagnosticCode,
  stage: DiagnosticStage = 'processing',
  platform?: PlatformId,
): void {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;
    void chrome.runtime.sendMessage({ type: 'REPORT_DIAGNOSTIC', signal: { code, stage, ...(platform ? { platform } : {}) } })
      .catch(() => {});
  } catch {
    // Extension context invalidated: nothing to report to.
  }
}
