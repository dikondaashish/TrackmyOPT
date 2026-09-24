import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET } from './route';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  tier: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: mocks.auth }));
vi.mock('@/lib/case-status/worker-observability', () => ({
  observeCaseWorker: (
    _name: string,
    _req: unknown,
    run: () => Promise<unknown>
  ) => run(),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.create }));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: mocks.tier,
}));
vi.mock('@/lib/notifications/email-smtp', () => ({
  getSmtpFromHeader: () => 'test@example.test',
}));
vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: mocks.send, close: mocks.close }),
  },
}));
const req = () =>
  new NextRequest('https://example.test/api/cron/send-case-deadline-reminders');
const notice = {
  id: 'notice',
  user_id: 'owner',
  case_id: 'case',
  title: 'Synthetic task',
  due_date: '2026-09-26',
};
function query(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then: (resolve: (r: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
}
function setup({ claim = true, optedOut = false, error = false } = {}) {
  const stale = query({ error: null });
  const expired = query({ error: null });
  const list = query({ data: [notice], error: error ? {} : null });
  const claimQuery = query({
    data: claim ? { id: notice.id } : null,
    error: null,
  });
  const save = query({ error: null });
  const from = vi
    .fn()
    .mockReturnValueOnce(stale)
    .mockReturnValueOnce(expired)
    .mockReturnValueOnce(list)
    .mockReturnValueOnce(
      query({ data: { notification_email: 'test@example.test' }, error: null })
    )
    .mockReturnValueOnce(query({ data: { id: 'case' }, error: null }))
    .mockReturnValueOnce(
      query({ data: { email_enabled: !optedOut }, error: null })
    )
    .mockReturnValueOnce(claimQuery)
    .mockReturnValue(save);
  mocks.create.mockReturnValue({ from });
  return { stale, expired, list, claimQuery, save };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-23T16:00:00Z'));
  mocks.auth.mockReturnValue(null);
  mocks.tier.mockResolvedValue('pro');
  mocks.send.mockResolvedValue({ accepted: ['test@example.test'] });
});
afterEach(() => vi.useRealTimers());
it('requires cron authentication before accessing data', async () => {
  mocks.auth.mockReturnValue(NextResponse.json({}, { status: 401 }));
  expect((await GET(req())).status).toBe(401);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('sends only after an atomic unchanged-date claim and records provider acceptance', async () => {
  const q = setup();
  expect(await (await GET(req())).json()).toMatchObject({ sent: 1, failed: 0 });
  expect(q.claimQuery.eq).toHaveBeenCalledWith('reminder_state', 'pending');
  expect(q.claimQuery.eq).toHaveBeenCalledWith('due_date', notice.due_date);
  expect(q.claimQuery.is).toHaveBeenCalledWith('completed_at', null);
  expect(q.save.update).toHaveBeenCalledWith(
    expect.objectContaining({
      reminder_state: 'sent',
      reminder_sent_at: expect.any(String),
    })
  );
  expect(mocks.send).toHaveBeenCalledTimes(1);
  expect(mocks.close).toHaveBeenCalled();
});
it('does not send when another run won the claim or the date changed', async () => {
  setup({ claim: false });
  expect((await GET(req())).status).toBe(200);
  expect(mocks.send).not.toHaveBeenCalled();
});
it.each(['optout', 'free'])('honors %s before sending', async (reason) => {
  const q = setup({ optedOut: reason === 'optout' });
  if (reason === 'free') mocks.tier.mockResolvedValue('free');
  expect(await (await GET(req())).json()).toMatchObject({ skipped: 1 });
  expect(mocks.send).not.toHaveBeenCalled();
  expect(q.claimQuery.update).toHaveBeenCalledWith({
    reminder_state: 'cancelled',
  });
});
it('does not falsely report a rejected email as sent', async () => {
  const q = setup();
  mocks.send.mockResolvedValue({ accepted: [] });
  expect((await GET(req())).status).toBe(503);
  expect(q.save.update).toHaveBeenCalledWith({ reminder_state: 'failed' });
});
it('reports database failure rather than success', async () => {
  setup({ error: true });
  expect((await GET(req())).status).toBe(503);
  expect(mocks.send).not.toHaveBeenCalled();
});
it('dry run never reconciles, claims or sends any email', async () => {
  const q = query({ count: 2, error: null });
  mocks.create.mockReturnValue({ from: () => q });
  const res = await GET(new NextRequest(req().url + '?dry_run=1'));
  expect(await res.json()).toMatchObject({
    dryRun: true,
    eligible: 2,
    sent: 0,
  });
  expect(q.update).not.toHaveBeenCalled();
  expect(mocks.send).not.toHaveBeenCalled();
});
