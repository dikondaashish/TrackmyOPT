import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { captureClientEvent } from '@/lib/posthog-client';
import { hasAnalyticsConsent } from '@/lib/cookie-consent';
import { resetNetworkFailureReporting } from '@/lib/sentry/options';
import { saveReceiptAndPoll } from './save-receipt-and-poll';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: vi.fn() }));
vi.mock('@/lib/cookie-consent', () => ({
  hasAnalyticsConsent: vi.fn(() => true),
}));
const receipt = 'IOE1234567890';
const saved = {
  id: 'synthetic-case',
  receipt_number: receipt,
  current_status: 'Status will be fetched shortly...',
  last_checked_at: null,
};
const resolved = {
  ...saved,
  current_status: 'Case Was Received',
  last_checked_at: '2026-10-11T00:00:00Z',
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  resetNetworkFailureReporting();
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('receipt enrollment and result measurement', () => {
  it('resolves the newly saved receipt even when another case is primary', async () => {
    fetchMock.mockResolvedValueOnce(response({ ok: true, data: saved }));
    fetchMock.mockResolvedValueOnce(
      response({
        ok: true,
        data: { ...resolved, receipt_number: 'EAC1234567890' },
        cases: [{ ...resolved, receipt_number: 'EAC1234567890' }, resolved],
      })
    );
    const result = await saveReceiptAndPoll(receipt, {
      source: 'case_status',
      maxAttempts: 1,
      pollIntervalMs: 0,
      setPrimary: false,
    });
    expect(result).toEqual({ ok: true, data: resolved, statusResolved: true });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      set_primary: false,
    });
    expect(captureClientEvent).toHaveBeenCalledWith('receipt_entry_saved', {
      source: 'case_status',
    });
    expect(captureClientEvent).toHaveBeenCalledWith(
      'receipt_entry_status_resolved',
      { source: 'case_status' }
    );
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('keeps a saved receipt when polling fails, without claiming activation', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ ok: true, data: saved }))
      .mockRejectedValue(new Error(`${receipt} private server body`));
    const result = await saveReceiptAndPoll(receipt, {
      maxAttempts: 2,
      pollIntervalMs: 0,
    });
    expect(result).toEqual({ ok: true, data: saved, statusResolved: false });
    expect(Sentry.captureException).toHaveBeenCalledOnce();
    expect(vi.mocked(Sentry.captureException).mock.calls[0][0]).toEqual(
      new Error('Receipt entry onboarding_wizard: poll network failure')
    );
    expect(captureClientEvent).not.toHaveBeenCalledWith(
      'receipt_entry_status_resolved',
      expect.anything()
    );
  });

  it('does not report an expected plan-limit rejection as an unexpected failure', async () => {
    fetchMock.mockResolvedValue(
      response(
        { ok: false, code: 'case_limit_reached', error: 'Case limit reached' },
        403
      )
    );
    expect(await saveReceiptAndPoll(receipt)).toEqual({
      ok: false,
      code: 'case_limit_reached',
      error: 'Case limit reached',
    });
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(captureClientEvent).toHaveBeenCalledWith(
      'receipt_entry_save_failed',
      { source: 'onboarding_wizard', reason: 'limit' }
    );
  });

  it.each([
    { ok: false, error: 'Temporary failure' },
    null,
    { ok: true, data: { ...saved, receipt_number: 'EAC1234567890' } },
  ])(
    'reports invalid/application success responses safely: %j',
    async (body) => {
      fetchMock.mockResolvedValue(response(body));
      const result = await saveReceiptAndPoll(receipt);
      expect(result.ok).toBe(false);
      expect(Sentry.captureException).toHaveBeenCalledOnce();
      expect(captureClientEvent).not.toHaveBeenCalledWith(
        'receipt_entry_saved',
        expect.anything()
      );
      expect(
        String(vi.mocked(Sentry.captureException).mock.calls[0][0])
      ).not.toContain(receipt);
    }
  );

  it('reports save network errors with a safe static diagnostic', async () => {
    fetchMock.mockRejectedValue(new Error(`${receipt} applicant@example.com`));
    expect((await saveReceiptAndPoll(receipt)).ok).toBe(false);
    expect(vi.mocked(Sentry.captureException).mock.calls[0][0]).toEqual(
      new Error('Receipt entry onboarding_wizard: save network failure')
    );
  });

  it('follows the browser network policy for dropped connections', async () => {
    fetchMock.mockRejectedValue(new TypeError('Load failed'));
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect((await saveReceiptAndPoll(receipt)).ok).toBe(false);
    expect(Sentry.captureException).not.toHaveBeenCalled();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await saveReceiptAndPoll(receipt);
    await saveReceiptAndPoll(receipt);
    // One report per page load: a real outage still surfaces, a flaky
    // connection does not fan out into an issue per request.
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('works without analytics consent and emits no client funnel events', async () => {
    vi.mocked(hasAnalyticsConsent).mockReturnValue(false);
    fetchMock
      .mockResolvedValueOnce(response({ ok: true, data: saved }))
      .mockResolvedValue(response({ ok: true, data: resolved }));
    expect((await saveReceiptAndPoll(receipt, { maxAttempts: 0 })).ok).toBe(
      true
    );
    expect(captureClientEvent).not.toHaveBeenCalled();
  });
});
