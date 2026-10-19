import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
const m = vi.hoisted(() => ({
  enrollment: vi.fn(),
  acquire: vi.fn(),
  defer: vi.fn(),
  fetch: vi.fn(),
  capture: vi.fn(),
  fingerprint: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  withScope: (fn: (scope: unknown) => void) =>
    fn({ setFingerprint: m.fingerprint, setTag: vi.fn() }),
}));
vi.mock('@/lib/uscis/enrollment-guard', () => ({
  assertReceiptEnrolledByUser: m.enrollment,
}));
vi.mock('./request-governor', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./request-governor')>()),
  acquireUSCISRequest: m.acquire,
  deferUSCISRequests: m.defer,
}));
import { fetchCaseStatus, parseUSCISResponse } from './client';
import { UnauthorizedReceiptLookupError } from './errors';
const input = {
  receiptNumber: 'IOE0000000001',
  userId: 'owner',
  callSite: 'synthetic',
  supabase: {} as SupabaseClient,
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', m.fetch);
  vi.stubEnv('USCIS_CLIENT_ID', 'synthetic-client');
  vi.stubEnv('USCIS_CLIENT_SECRET', 'synthetic-secret');
  m.enrollment.mockResolvedValue(input.receiptNumber);
  m.acquire.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it('verifies enrollment before accessing tokens or an allowance', async () => {
  m.enrollment.mockRejectedValue(new UnauthorizedReceiptLookupError());
  await expect(fetchCaseStatus(input)).rejects.toThrow(
    UnauthorizedReceiptLookupError
  );
  expect(m.acquire).not.toHaveBeenCalled();
  expect(m.fetch).not.toHaveBeenCalled();
});
it('handles IOE payloads without inventing omitted submitted dates', () => {
  expect(
    parseUSCISResponse(
      {
        case_status: {
          receiptNumber: input.receiptNumber,
          formType: 'I-765',
          current_case_status_text_en: 'Case Was Received',
          current_case_status_desc_en: 'Received',
        },
      },
      input.receiptNumber
    )
  ).toMatchObject({ receivedDate: null, histCaseStatus: [] });
});
it('keeps only a well-formed USCIS modifiedDate', () => {
  const parse = (modifiedDate: unknown) =>
    parseUSCISResponse(
      {
        case_status: {
          receiptNumber: input.receiptNumber,
          formType: 'I-765',
          current_case_status_text_en: 'Case Was Received',
          modifiedDate,
        },
      },
      input.receiptNumber
    ).modifiedDate;
  expect(parse('09-05-2023 14:28:46')).toBe('09-05-2023 14:28:46');
  expect(parse(undefined)).toBeNull();
  expect(parse('yesterday')).toBeNull();
  expect(parse({ at: 1 })).toBeNull();
});
it('refuses malformed or mismatched success bodies', () => {
  expect(() =>
    parseUSCISResponse(
      {
        case_status: {
          receiptNumber: 'IOE0000000002',
          current_case_status_text_en: 'Approved',
        },
      },
      input.receiptNumber
    )
  ).toThrow('Invalid USCIS');
});
it('accounts for OAuth and case calls, and shares an upstream throttle', async () => {
  m.fetch
    .mockResolvedValueOnce(
      Response.json({ access_token: 'synthetic-token', expires_in: 3600 })
    )
    .mockResolvedValueOnce(
      new Response(null, { status: 429, headers: { 'Retry-After': '120' } })
    );
  const result = await fetchCaseStatus(input);
  expect(result).toMatchObject({
    success: false,
    error: { code: 429, retryAfter: 120 },
  });
  expect(m.acquire).toHaveBeenCalledTimes(2);
  expect(m.defer).toHaveBeenCalledWith(input.supabase, 'production', 120);
});

function upstreamReturns(status: number) {
  // The token may be cached from an earlier test; answer by URL.
  m.fetch.mockImplementation(async (url: string) =>
    url.includes('/oauth/')
      ? Response.json({ access_token: 'synthetic-token', expires_in: 3600 })
      : new Response(null, { status })
  );
}

it('reports a USCIS outage once as a grouped warning, not a console error', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  upstreamReturns(522);
  const result = await fetchCaseStatus(input);
  expect(result).toMatchObject({
    success: false,
    error: { code: 522, upstreamUnavailable: true },
  });
  expect(m.fingerprint).toHaveBeenCalledWith(['uscis-api', 'upstream-unavailable']);
  expect(m.capture).toHaveBeenCalledWith('USCIS case-status API unavailable', 'warning');
  expect(consoleError).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

it('still reports rejected credentials as an error', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  upstreamReturns(403);
  const result = await fetchCaseStatus(input);
  expect(result).toMatchObject({
    success: false,
    error: { code: 403, upstreamUnavailable: false },
  });
  expect(m.capture).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalledWith('[USCIS] Case status request failed (403)');
  consoleError.mockRestore();
});
