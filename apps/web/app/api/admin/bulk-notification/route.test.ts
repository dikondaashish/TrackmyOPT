// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { POST } from './route';

const m = vi.hoisted(() => ({ create: vi.fn(), send: vi.fn(), close: vi.fn(), register: vi.fn(), trackedSend: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: m.create }));
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail: m.send, close: m.close }) } }));
vi.mock('@/lib/notifications/campaign-send', () => ({ registerEmailCampaign: m.register, sendTrackedCampaignEmail: m.trackedSend }));
const ids = Array.from({ length: 3 }, (_, i) => `00000000-0000-4000-8000-00000000000${i}`);
const url = 'https://www.trackmyopt.com/pricing';
const body = { type: 'service_announcement', subject: 'Update', htmlContent: `<a href="${url}">Try Pro</a><a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a>`, plainTextContent: url + "\n{{UNSUBSCRIBE_URL}}", recipientUserIds: ids, dryRun: false, campaign: { id: 'campaign', links: { pro_intro: url } } };
function request(value: unknown = body, authorized = true) {
  return new NextRequest('https://www.trackmyopt.com/api/admin/bulk-notification', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorized ? { authorization: 'Bearer test-secret' } : {}) }, body: JSON.stringify(value) });
}
function query(result: object) {
  return { select: vi.fn().mockReturnThis(), not: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), then: (resolve: (result: object) => unknown) => Promise.resolve(result).then(resolve) };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('ADMIN_SECRET', 'test-secret');
  vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', 'test-secret');
  vi.stubEnv('CAMPAIGN_SMTP_HOST', 'smtp.example.invalid');
  vi.stubEnv('CAMPAIGN_SMTP_USER', 'test');
  vi.stubEnv('CAMPAIGN_SMTP_PASS', 'test');
  m.register.mockResolvedValue(undefined);
  m.trackedSend.mockResolvedValue('sent');
});
afterEach(() => vi.unstubAllEnvs());
it('does not access recipients or send without authorization', async () => {
  expect((await POST(request(body, false))).status).toBe(401);
  expect(m.create).not.toHaveBeenCalled();
});
it('rejects an unfinished campaign and nonmarketing tracking before sending', async () => {
  expect((await POST(request({ ...body, htmlContent: body.htmlContent + '{{POSTAL_ADDRESS}}' }))).status).toBe(400);
  expect((await POST(request({ ...body, type: 'policy_change' }))).status).toBe(400);
  expect(m.create).not.toHaveBeenCalled();
});
it('fails closed when marketing preferences cannot be checked', async () => {
  const from = vi.fn().mockReturnValueOnce(query({ data: [{ user_id: 'user', email: 'test@example.invalid', first_name: null }], error: null })).mockReturnValueOnce(query({ error: { message: 'unavailable' } }));
  m.create.mockReturnValue({ from });
  expect((await POST(request())).status).toBe(503);
  expect(m.trackedSend).not.toHaveBeenCalled();
  expect(m.send).not.toHaveBeenCalled();
});
it('honors marketing opt-outs and blocked addresses, and reports duplicates separately', async () => {
  const users = ['opted-out', 'blocked', 'eligible'].map(user_id => ({ user_id, email: `${user_id}@example.invalid`, first_name: null }));
  const from = vi.fn().mockReturnValueOnce(query({ data: users, error: null })).mockReturnValueOnce(query({ data: [{ user_id: 'opted-out' }], error: null })).mockReturnValueOnce(query({ data: [{ email: 'blocked@example.invalid' }], error: null }));
  m.create.mockReturnValue({ from });
  m.trackedSend.mockResolvedValue('duplicate');
  expect(await (await POST(request())).json()).toMatchObject({ sent: 0, eligible: 2, skippedOptOut: 1, suppressed: 1, duplicate: 1 });
  expect(m.trackedSend).toHaveBeenCalledTimes(1);
  expect(m.trackedSend).toHaveBeenCalledWith(expect.objectContaining({ email: 'eligible@example.invalid' }));
  expect(m.send).not.toHaveBeenCalled();
  expect(m.close).toHaveBeenCalledTimes(1);
});
it('checks every preference page beyond the default 1,000 rows', async () => {
  const users = Array.from({ length: 1001 }, (_, i) => ({ user_id: `user-${i}`, email: `test-${i}@example.invalid`, first_name: null }));
  const from = vi.fn()
    .mockReturnValueOnce(query({ data: users.slice(0, 1000), error: null }))
    .mockReturnValueOnce(query({ data: users.slice(1000), error: null }))
    .mockReturnValueOnce(query({ data: users.slice(0, 1000).map(u => ({ user_id: u.user_id })), error: null }))
    .mockReturnValueOnce(query({ data: users.slice(1000).map(u => ({ user_id: u.user_id })), error: null }));
  m.create.mockReturnValue({ from });
  expect(await (await POST(request())).json()).toMatchObject({ totalUsers: 1001, eligible: 0, skippedOptOut: 1001, sent: 0 });
  expect(m.trackedSend).not.toHaveBeenCalled();
  expect(m.send).not.toHaveBeenCalled();
});
it('resolves every supported recipient placeholder in both MIME bodies', async () => {
  const from = vi.fn().mockReturnValueOnce(query({ data: [{ user_id: 'synthetic-user', email: 'test@example.invalid', first_name: 'A&B$&' }], error: null }))
    .mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(query({ data: [], error: null }));
  m.create.mockReturnValue({ from });
  await POST(request({ ...body, htmlContent: body.htmlContent + '<p>{{firstName}} {{firstName}} {{userId}}</p>', plainTextContent: body.plainTextContent + '\n{{firstName}} {{firstName}} {{userId}}' }));
  expect(m.trackedSend).toHaveBeenCalledWith(expect.objectContaining({ html: body.htmlContent + '<p>A&amp;B$&amp; A&amp;B$&amp; synthetic-user</p>', text: body.plainTextContent + '\nA&B$& A&B$& synthetic-user' }));
});

it('requires an explicit limited recipient list before accessing the database', async () => {
  for (const recipientUserIds of [undefined, [], ['not-a-uuid'], Array(101).fill(ids[0])]) {
    expect((await POST(request({ ...body, recipientUserIds }))).status).toBe(400);
  }
  expect(m.create).not.toHaveBeenCalled();
});
it('defaults to a read-only preflight and restricts the profile query to selected IDs', async () => {
  vi.stubEnv('CAMPAIGN_SMTP_HOST', '');
  const profiles = query({ data: [{ user_id: ids[0], email: 'test@example.invalid', first_name: null }], error: null });
  m.create.mockReturnValue({ from: vi.fn().mockReturnValueOnce(profiles)
    .mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(query({ data: [], error: null })) });
  expect(await (await POST(request({ ...body, dryRun: undefined }))).json()).toMatchObject({ dryRun: true, sent: 0, eligible: 1 });
  expect(profiles.in).toHaveBeenCalledWith('user_id', ids);
  expect(m.register).not.toHaveBeenCalled();
  expect(m.trackedSend).not.toHaveBeenCalled();
  expect(m.send).not.toHaveBeenCalled();
});
it('fails before registration or SMTP if suppressions are unavailable', async () => {
  m.create.mockReturnValue({ from: vi.fn().mockReturnValueOnce(query({ data: [{ user_id: ids[0], email: 'test@example.invalid' }], error: null }))
    .mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(query({ error: {} })) });
  expect((await POST(request())).status).toBe(503);
  expect(m.register).not.toHaveBeenCalled();
  expect(m.trackedSend).not.toHaveBeenCalled();
});
