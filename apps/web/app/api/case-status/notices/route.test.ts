import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH } from './route';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  tier: vi.fn(),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.create }));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: mocks.tier,
}));
const id = '11111111-1111-4111-8111-111111111111';
const payload = { case_id: id, title: 'Response due', kind: 'rfe' };
const req = (method = 'POST', body: unknown = payload) =>
  new NextRequest(
    `https://example.test/api/case-status/notices?case_id=${id}`,
    { method, ...(method === 'GET' ? {} : { body: JSON.stringify(body) }) }
  );
const query = (result: unknown) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(result),
  maybeSingle: vi.fn().mockResolvedValue(result),
  limit: vi.fn().mockResolvedValue(result),
  then: (resolve: (r: unknown) => unknown) =>
    Promise.resolve(result).then(resolve),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('owner');
  mocks.tier.mockResolvedValue('pro');
});
it.each([GET, POST, PATCH])(
  'requires authentication before database access',
  async (handler) => {
    mocks.auth.mockResolvedValue(null);
    expect((await handler(req())).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  }
);
it.each([
  {},
  { ...payload, due_date: '2026-02-30', deadline_confirmed: true },
  { ...payload, due_date: '2027-01-01' },
])('rejects invalid or unconfirmed input', async (body) => {
  expect((await POST(req('POST', body))).status).toBe(400);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('rejects access to a different user case', async () => {
  const cases = query({ data: null, error: null });
  mocks.create.mockReturnValue({ from: () => cases });
  expect((await POST(req())).status).toBe(404);
  expect(cases.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(cases.insert).not.toHaveBeenCalled();
});
it('rejects a document belonging to another user', async () => {
  const cases = query({ data: { id }, error: null });
  const docs = query({ data: null, error: null });
  mocks.create.mockReturnValue({
    from: (table: string) => (table === 'case_status' ? cases : docs),
  });
  expect(
    (await POST(req('POST', { ...payload, document_id: id }))).status
  ).toBe(400);
  expect(docs.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(docs.insert).not.toHaveBeenCalled();
});
it('persists only the authenticated owner and explicit confirmed date', async () => {
  const q = query({ data: { id }, error: null, count: 0 });
  mocks.create.mockReturnValue({ from: () => q });
  expect(
    (
      await POST(
        req('POST', {
          ...payload,
          due_date: '2027-01-01',
          deadline_confirmed: true,
          user_id: 'attacker',
        })
      )
    ).status
  ).toBe(201);
  expect(q.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      user_id: 'owner',
      due_date: '2027-01-01',
      reminder_state: 'off',
      deadline_confirmed_at: expect.any(String),
    })
  );
});
it('blocks free-tier email reminders server-side', async () => {
  mocks.tier.mockResolvedValue('free');
  expect(
    (
      await POST(
        req('POST', {
          ...payload,
          due_date: '2090-01-01',
          deadline_confirmed: true,
          email_reminder: true,
        })
      )
    ).status
  ).toBe(403);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('cancels unsent reminders when marking complete and scopes all IDs', async () => {
  const q = query({ data: { id, reminder_state: 'pending' }, error: null });
  mocks.create.mockReturnValue({ from: () => q });
  expect(
    (await PATCH(req('PATCH', { id, case_id: id, complete: true }))).status
  ).toBe(200);
  expect(q.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(q.eq).toHaveBeenCalledWith('case_id', id);
  expect(q.neq).toHaveBeenCalledWith('reminder_state', 'sending');
  expect(q.update).toHaveBeenCalledWith(
    expect.objectContaining({
      reminder_state: 'cancelled',
      email_reminder: false,
    })
  );
});
it('preserves the sent history when completing a notice', async () => {
  const q = query({ data: { id, reminder_state: 'sent' }, error: null });
  mocks.create.mockReturnValue({ from: () => q });
  expect(
    (await PATCH(req('PATCH', { id, case_id: id, complete: true }))).status
  ).toBe(200);
  expect(q.update).toHaveBeenCalledWith(
    expect.objectContaining({ reminder_state: 'sent' })
  );
});
it('edits a notice without replaying an already sent reminder', async () => {
  const q = query({
    data: {
      id,
      reminder_state: 'sent',
      due_date: '2090-01-01',
      email_reminder: true,
      completed_at: null,
    },
    error: null,
  });
  mocks.create.mockReturnValue({ from: () => q });
  expect(
    (
      await PATCH(
        req('PATCH', {
          ...payload,
          id,
          title: 'Corrected title',
          due_date: '2090-01-01',
          deadline_confirmed: true,
          email_reminder: true,
        })
      )
    ).status
  ).toBe(200);
  expect(q.update).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Corrected title',
      reminder_state: 'sent',
    })
  );
  expect(q.eq).toHaveBeenCalledWith('reminder_state', 'sent');
  expect(q.is).toHaveBeenCalledWith('completed_at', null);
});
it.each(['sending', 'completed'])(
  'does not edit a %s notice',
  async (state) => {
    const q = query({
      data: {
        id,
        reminder_state: state === 'sending' ? 'sending' : 'off',
        completed_at: state === 'completed' ? '2026-09-01' : null,
      },
      error: null,
    });
    mocks.create.mockReturnValue({ from: () => q });
    expect((await PATCH(req('PATCH', { ...payload, id }))).status).toBe(409);
    expect(q.update).not.toHaveBeenCalled();
  }
);
it('shows an unavailable organizer rather than an empty success on a database failure', async () => {
  const cases = query({ data: { id }, error: null });
  const notices = query({ data: null, error: { message: 'offline' } });
  mocks.create.mockReturnValue({
    from: (table: string) => (table === 'case_status' ? cases : notices),
  });
  expect((await GET(req('GET'))).status).toBe(503);
});
