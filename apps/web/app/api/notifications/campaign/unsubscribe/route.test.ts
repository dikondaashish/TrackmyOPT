// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createUnsubscribeToken, verifyUnsubscribeToken, unsubscribeCampaignRecipient } from '@/lib/notifications/campaign-unsubscribe';
import { createCampaignToken } from '@/lib/notifications/campaign-tracking';
import { GET, HEAD, POST } from './route';

const m = vi.hoisted(() => ({ admin: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: m.admin }));
const id = '00000000-0000-4000-8000-000000000001';
const secret = 'synthetic-secret';
const token = createUnsubscribeToken(id, secret);
const request = (value = token) => new NextRequest(`https://www.trackmyopt.com/api/notifications/campaign/unsubscribe?token=${encodeURIComponent(value)}`);
function setup(results: object[]) {
  const q = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(),
    then: (resolve: (result: object) => unknown) => Promise.resolve(results.shift()!).then(resolve) };
  const client = { from: vi.fn().mockReturnValue(q) };
  m.admin.mockReturnValue(client);
  return q;
}
const message = { data: { user_id: id, email_address: 'fictional@example.invalid', email_data: { campaign_id: 'test' }, status: 'sent' }, error: null };
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', secret); });
afterEach(() => vi.unstubAllEnvs());

it('rejects tampering, wrong secrets, malformed tokens and tracking-token substitution', () => {
  expect(verifyUnsubscribeToken(token, secret)).toBe(id);
  for (const value of [token + 'x', token + '.extra', 'invalid', 'x'.repeat(200),
    createCampaignToken({ messageId: id, kind: 'open', linkKey: '', expiresAt: Date.now() + 10000 }, secret)]) {
    expect(verifyUnsubscribeToken(value, secret)).toBeNull();
  }
  expect(verifyUnsubscribeToken(token, 'wrong')).toBeNull();
});
it('GET only presents confirmation and HEAD never changes preferences', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('method="post"');
  expect(response.headers.get('cache-control')).toContain('no-store');
  expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  expect((await HEAD()).status).toBe(200);
  expect(m.admin).not.toHaveBeenCalled();
});
it('rejects unsigned POSTs before any database access', async () => {
  expect((await POST(request('invalid'))).status).toBe(400);
  expect(m.admin).not.toHaveBeenCalled();
});
it('unsubscribes without touching reminder preferences or the saved email address', async () => {
  const q = setup([message, { data: [{ user_id: id }], error: null }]);
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('You’re unsubscribed');
  expect(q.update).toHaveBeenCalledExactlyOnceWith({ marketing_emails: false });
  expect(q.insert).not.toHaveBeenCalled();
});
it('supports a mail-provider one-click POST without cookies or authentication', async () => {
  setup([message, { data: [{ user_id: id }], error: null }]);
  const response = await POST(new NextRequest(request().url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' }));
  expect(response.status).toBe(200);
});
it('creates only the missing preference and handles a concurrent insert', async () => {
  const q = setup([message, { data: [], error: null }, { error: { code: '23505' } }, { data: [{ user_id: id }], error: null }]);
  expect(await unsubscribeCampaignRecipient(m.admin(), id)).toBe('ok');
  expect(q.insert).toHaveBeenCalledWith({ user_id: id, email_address: 'fictional@example.invalid', marketing_emails: false });
  expect(q.update).toHaveBeenCalledTimes(2);
});
it('does not report success on a database failure or missing column', async () => {
  setup([message, { error: { code: '42703' } }]);
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain('You’re unsubscribed');
});
it('does not mutate preferences for missing or non-campaign records', async () => {
  for (const data of [null, { ...message.data, email_data: {} }, { ...message.data, status: 'pending' }]) {
    const q = setup([{ data, error: null }]);
    expect((await POST(request())).status).toBe(404);
    expect(q.update).not.toHaveBeenCalled();
  }
});
