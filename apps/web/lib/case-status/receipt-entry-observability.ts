import * as Sentry from '@sentry/nextjs';
import { hasConsent } from '@/lib/privacy/privacy-manager';
import { captureClientEvent } from '@/lib/posthog-client';
import { shouldReportCaughtNetworkFailure } from '@/lib/sentry/options';

export type ReceiptEntrySource = 'onboarding_wizard' | 'case_status';
type ReceiptEntryEvent =
  | 'receipt_entry_viewed'
  | 'receipt_entry_submitted'
  | 'receipt_entry_validation_failed'
  | 'receipt_entry_save_failed'
  | 'receipt_entry_saved'
  | 'receipt_entry_status_resolved';

export function trackReceiptEntry(
  event: ReceiptEntryEvent,
  source: ReceiptEntrySource,
  reason?: 'empty' | 'format' | 'limit' | 'request' | 'network' | 'response'
) {
  // Actions before consent are not replayed later. Never include receipt input,
  // response bodies, case IDs, or exception text in analytics or diagnostics.
  if (!hasConsent('analytics')) return;
  captureClientEvent(event, { source, ...(reason ? { reason } : {}) });
}

export function reportReceiptEntryFailure(
  source: ReceiptEntrySource,
  stage: 'save' | 'poll' | 'load',
  kind: 'network' | 'response'
) {
  // A visitor's dropped connection follows the shared browser network policy:
  // skipped offline/hidden, and at most one network report per page load.
  if (kind === 'network' && !shouldReportCaughtNetworkFailure()) return;
  Sentry.captureException(
    new Error(`Receipt entry ${source}: ${stage} ${kind} failure`)
  );
}
