import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  shouldReportCaughtNetworkFailure: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => ({ captureException: mocks.captureException }));
vi.mock('@/lib/sentry/options', () => ({
  shouldReportCaughtNetworkFailure: mocks.shouldReportCaughtNetworkFailure,
}));
vi.mock('@/lib/privacy/privacy-manager', () => ({ hasConsent: () => false }));
vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: vi.fn() }));

import { reportReceiptEntryFailure } from './receipt-entry-observability';

const messages = () =>
  mocks.captureException.mock.calls.map(([error]) => (error as Error).message);

describe('reportReceiptEntryFailure', () => {
  beforeEach(() => {
    mocks.captureException.mockClear();
    mocks.shouldReportCaughtNetworkFailure.mockReset();
  });

  it('reports a response failure at once', () => {
    reportReceiptEntryFailure('case_status', 'load', 'response');
    expect(messages()).toEqual(['Receipt entry case_status: load response failure']);
    expect(mocks.shouldReportCaughtNetworkFailure).not.toHaveBeenCalled();
  });

  it('reports a network failure only when the shared policy keeps it', async () => {
    mocks.shouldReportCaughtNetworkFailure.mockResolvedValueOnce(false);
    reportReceiptEntryFailure('case_status', 'load', 'network');
    await vi.waitFor(() => expect(mocks.shouldReportCaughtNetworkFailure).toHaveBeenCalledOnce());
    await Promise.resolve();
    expect(mocks.captureException).not.toHaveBeenCalled();

    mocks.shouldReportCaughtNetworkFailure.mockResolvedValueOnce(true);
    reportReceiptEntryFailure('onboarding_wizard', 'save', 'network');
    await vi.waitFor(() =>
      expect(messages()).toEqual(['Receipt entry onboarding_wizard: save network failure'])
    );
  });
});
