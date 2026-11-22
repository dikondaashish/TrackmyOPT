import { createHmac } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({ fetchPartner: vi.fn(), capture: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/uscis/client', () => ({ fetchPartnerCaseStatus: m.fetchPartner }));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  withScope: (fn: (scope: unknown) => void) => fn({ setFingerprint: vi.fn() }),
}));

import { UnauthorizedReceiptLookupError } from '@/lib/uscis/errors';
import {
  checkPartnerCase,
  deliverStatusChange,
  MAX_NOTIFY_ATTEMPTS,
  parseReceipt,
  parseUserRef,
  signWebhook,
  verifyPartnerAuth,
  type PartnerCaseRow,
} from './service';

const row = (over: Partial<PartnerCaseRow> = {}): PartnerCaseRow => ({
  id: 'case-1',
  partner_user_ref: 'user-ref-0001',
  receipt_number: 'IOE0000000001',
  form_type: null,
  current_status: 'Case Was Received',
  status_description: null,
  received_date: null,
  status_history: [],
  status_changed_at: null,
  last_checked_at: null,
  next_check_at: '2026-11-22T00:00:00.000Z',
  consecutive_failures: 0,
  last_error_code: null,
  notify_pending: false,
  notify_previous_status: null,
  notify_attempts: 0,
  created_at: '2026-11-22T00:00:00.000Z',
  ...over,
});

/** Records every update payload; .maybeSingle() returns `returned`. */
function fakeDb(returned: (payload: Record<string, unknown>) => unknown = (p) => ({ ...row(), ...p })) {
  const updates: Record<string, unknown>[] = [];
  const filters: unknown[][] = [];
  const db = {
    from: () => ({
      update(payload: Record<string, unknown>) {
        updates.push(payload);
        const chain = {
          eq: (...args: unknown[]) => (filters.push(['eq', ...args]), chain),
          is: (...args: unknown[]) => (filters.push(['is', ...args]), chain),
          select: () => chain,
          maybeSingle: async () => ({ data: returned(payload), error: null }),
          then: (resolve: (v: unknown) => void) => resolve({ error: null }),
        };
        return chain;
      },
    }),
  } as unknown as SupabaseClient;
  return { db, updates, filters };
}

const now = new Date('2026-11-22T12:00:00.000Z');
const ok = (status: string) => ({
  success: true,
  data: {
    receiptNumber: 'IOE0000000001',
    status,
    caseType: 'I-765',
    receivedDate: 'November 1, 2026',
    description: 'Synthetic description.',
    histCaseStatus: [{ date: '11-01-2026', completedText: 'Case Was Received' }],
    modifiedDate: null,
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', m.fetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('input parsing', () => {
  it('accepts opaque references and normalizes receipts', () => {
    expect(parseUserRef('user-ref-0001')).toBe('user-ref-0001');
    expect(parseUserRef('someone@example.com')).toBeNull();
    expect(parseUserRef('short')).toBeNull();
    expect(parseReceipt(' ioe0000000001 ')).toBe('IOE0000000001');
    expect(parseReceipt('IOE123')).toBeNull();
    expect(parseReceipt(42)).toBeNull();
  });
});

describe('verifyPartnerAuth', () => {
  const req = (auth?: string) =>
    new NextRequest('https://example.test/api/partner/cases', auth ? { headers: { authorization: auth } } : {});
  it('is off until the key is set', () => {
    vi.stubEnv('PARTNER_API_KEY', '');
    expect(verifyPartnerAuth(req('Bearer x'))?.status).toBe(503);
  });
  it('requires the exact bearer key', () => {
    vi.stubEnv('PARTNER_API_KEY', 'k'.repeat(40));
    expect(verifyPartnerAuth(req())?.status).toBe(401);
    expect(verifyPartnerAuth(req('Bearer wrong'))?.status).toBe(401);
    expect(verifyPartnerAuth(req(`Bearer ${'k'.repeat(40)}`))).toBeNull();
  });
});

describe('checkPartnerCase', () => {
  it('saves the first status without a notification', async () => {
    m.fetchPartner.mockResolvedValue(ok('Case Was Received'));
    const { db, updates } = fakeDb();
    const outcome = await checkPartnerCase(db, row({ current_status: null }), now);
    expect(outcome).toMatchObject({ kind: 'checked', changed: false });
    expect(updates[0]).toMatchObject({ current_status: 'Case Was Received', form_type: 'I-765', consecutive_failures: 0 });
    expect(updates[0].notify_pending).toBeUndefined();
    expect(updates[0].next_check_at).toBe('2026-11-23T12:00:00.000Z');
  });

  it('marks a changed status for delivery and keeps the previous one', async () => {
    m.fetchPartner.mockResolvedValue(ok('Case Was Approved'));
    const { db, updates } = fakeDb();
    const outcome = await checkPartnerCase(db, row(), now);
    expect(outcome).toMatchObject({ kind: 'checked', changed: true });
    expect(updates[0]).toMatchObject({
      notify_pending: true,
      notify_previous_status: 'Case Was Received',
      notify_attempts: 0,
      status_changed_at: now.toISOString(),
    });
  });

  it('keeps the oldest undelivered previous status', async () => {
    m.fetchPartner.mockResolvedValue(ok('Card Was Produced'));
    const { db, updates } = fakeDb();
    await checkPartnerCase(
      db,
      row({ current_status: 'Case Was Approved', notify_pending: true, notify_previous_status: 'Case Was Received' }),
      now
    );
    expect(updates[0].notify_previous_status).toBeUndefined();
    expect(updates[0].notify_pending).toBe(true);
  });

  it('stops the batch when USCIS asks to slow down', async () => {
    m.fetchPartner.mockResolvedValue({ success: false, error: { code: 429, message: '', userMessage: '', retryAfter: 120 } });
    const { db, updates } = fakeDb();
    expect(await checkPartnerCase(db, row(), now)).toEqual({ kind: 'deferred', code: 429 });
    expect(updates[0]).toMatchObject({ consecutive_failures: 1, last_error_code: 429, next_check_at: '2026-11-22T13:00:00.000Z' });
  });

  it('retries a missing case a day later', async () => {
    m.fetchPartner.mockResolvedValue({ success: false, error: { code: 404, message: '', userMessage: '' } });
    const { db, updates } = fakeDb();
    expect((await checkPartnerCase(db, row(), now)).kind).toBe('failed');
    expect(updates[0].next_check_at).toBe('2026-11-23T12:00:00.000Z');
  });

  it('treats a removed enrollment as removed, not an error', async () => {
    m.fetchPartner.mockRejectedValue(new UnauthorizedReceiptLookupError());
    const { db, updates } = fakeDb();
    expect(await checkPartnerCase(db, row(), now)).toEqual({ kind: 'removed' });
    expect(updates).toHaveLength(0);
  });
});

describe('deliverStatusChange', () => {
  const secret = 's'.repeat(40);
  beforeEach(() => {
    vi.stubEnv('PARTNER_WEBHOOK_URL', 'https://partner.example.test/api/hooks/case-status');
    vi.stubEnv('PARTNER_WEBHOOK_SECRET', secret);
  });
  const pending = row({ current_status: 'Case Was Approved', notify_pending: true, notify_previous_status: 'Case Was Received' });

  it('posts a signed payload and clears the flag on success', async () => {
    m.fetch.mockResolvedValue(new Response(null, { status: 204 }));
    const { db, updates, filters } = fakeDb();
    expect(await deliverStatusChange(db, pending, now)).toBe(true);
    const [url, init] = m.fetch.mock.calls[0];
    expect(url).toBe('https://partner.example.test/api/hooks/case-status');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ event: 'case.status_changed', previousStatus: 'Case Was Received' });
    expect(body.case).toMatchObject({ receiptNumber: 'IOE0000000001', status: 'Case Was Approved', userRef: 'user-ref-0001' });
    const ts = init.headers['X-Partner-Timestamp'];
    const expected = `sha256=${createHmac('sha256', secret).update(`${ts}.${init.body}`).digest('hex')}`;
    expect(init.headers['X-Partner-Signature']).toBe(expected);
    expect(signWebhook(secret, ts, init.body)).toBe(expected);
    expect(updates[0]).toEqual({ notify_pending: false, notify_previous_status: null, notify_attempts: 0 });
    expect(filters).toContainEqual(['eq', 'current_status', 'Case Was Approved']);
  });

  it('counts a failed attempt and warns once after the last retry', async () => {
    m.fetch.mockResolvedValue(new Response(null, { status: 500 }));
    const { db, updates } = fakeDb();
    expect(await deliverStatusChange(db, pending, now)).toBe(false);
    expect(updates[0]).toEqual({ notify_attempts: 1 });
    expect(m.capture).not.toHaveBeenCalled();
    await deliverStatusChange(db, { ...pending, notify_attempts: MAX_NOTIFY_ATTEMPTS - 1 }, now);
    expect(m.capture).toHaveBeenCalledTimes(1);
  });

  it('does nothing without an https webhook', async () => {
    vi.stubEnv('PARTNER_WEBHOOK_URL', 'http://partner.example.test/hook');
    const { db, updates } = fakeDb();
    expect(await deliverStatusChange(db, pending, now)).toBe(false);
    expect(m.fetch).not.toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });
});
