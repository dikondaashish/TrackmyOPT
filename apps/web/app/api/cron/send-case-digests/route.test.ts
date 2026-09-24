import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const m = vi.hoisted(() => ({
  create: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
  tier: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: m.create }));
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: m.send, close: m.close }) },
}));
vi.mock('@/lib/notifications/email-smtp', () => ({
  getSmtpFromHeader: () => 'test@example.test',
}));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  resolveActivePlanTier: m.tier,
}));
vi.mock('@/lib/case-status/worker-observability', () => ({
  observeCaseWorker: (
    _name: string,
    _req: unknown,
    run: () => Promise<unknown>
  ) => run(),
}));
function query(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then: (resolve: (r: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
}
const req = (dry = false) =>
  new NextRequest(
    'https://example.test/api/cron/send-case-digests' +
      (dry ? '?dry_run=1' : '')
  );
function setup({
  claim = true,
  optout = false,
  lateOptout = false,
  duplicate = false,
} = {}) {
  const candidates = query({
    data: [{ user_id: 'owner', updated_at: '2026-09-23' }],
    error: null,
  });
  const claimQ = query({
    data: claim ? { user_id: 'owner' } : null,
    error: null,
  });
  const delivery = query({ error: duplicate ? { code: '23505' } : null });
  const final = query({ error: null });
  const queries = [
    candidates,
    query({ error: null }),
    query({ data: { email: 'test@example.test' }, error: null }),
    query({ data: { email_enabled: !optout }, error: null }),
    query({
      data: [{ current_status: 'Received', last_checked_at: null }],
      error: null,
    }),
    query({ data: [], error: null }),
    claimQ,
    delivery,
    query({ data: { enabled: !lateOptout }, error: null }),
    query({ data: { email_enabled: true }, error: null }),
    final,
  ];
  const from = vi.fn();
  queries.forEach((q) => from.mockReturnValueOnce(q));
  m.create.mockReturnValue({ from });
  return { candidates, claimQ, final, from };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-23T12:00:00Z'));
  m.tier.mockReturnValue('pro');
  m.send.mockResolvedValue({ accepted: ['test@example.test'] });
});
afterEach(() => vi.useRealTimers());
it('dry run does not write or connect to SMTP', async () => {
  const q = setup();
  expect(await (await GET(req(true))).json()).toMatchObject({
    dryRun: true,
    sent: 0,
    eligible: 1,
  });
  expect(q.from).toHaveBeenCalledTimes(1);
  expect(m.send).not.toHaveBeenCalled();
});
it('claims the week and unchanged preference before sending', async () => {
  const q = setup();
  expect(await (await GET(req())).json()).toMatchObject({ sent: 1, failed: 0 });
  expect(q.claimQ.eq).toHaveBeenCalledWith('enabled', true);
  expect(q.claimQ.eq).toHaveBeenCalledWith('updated_at', '2026-09-23');
  expect(q.claimQ.or).toHaveBeenCalledWith(
    'last_digest_week.is.null,last_digest_week.lt.2026-09-21'
  );
  expect(q.final.update).toHaveBeenCalledWith(
    expect.objectContaining({ state: 'sent' })
  );
});
it.each(['lost-claim', 'duplicate', 'optout', 'late-optout', 'free'])(
  'does not send for %s',
  async (reason) => {
    setup({
      claim: reason !== 'lost-claim',
      duplicate: reason === 'duplicate',
      optout: reason === 'optout',
      lateOptout: reason === 'late-optout',
    });
    if (reason === 'free') m.tier.mockReturnValue('free');
    await GET(req());
    expect(m.send).not.toHaveBeenCalled();
  }
);
it('records rejection as failed and never retries uncertain SMTP', async () => {
  const q = setup();
  m.send.mockRejectedValue(new Error('timeout'));
  expect((await GET(req())).status).toBe(503);
  expect(m.send).toHaveBeenCalledTimes(1);
  expect(q.final.update).toHaveBeenCalledWith(
    expect.objectContaining({ state: 'failed' })
  );
});
