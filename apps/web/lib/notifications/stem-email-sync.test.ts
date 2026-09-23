// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => ({
  profile: {} as Record<string, unknown>,
  opt: {} as Record<string, unknown>,
  queue: [] as Record<string, unknown>[],
  updates: [] as Record<string, unknown>[],
  inserts: [] as Record<string, unknown>[],
  selects: [] as string[],
  dedup: false,
  optError: false,
  smtp: vi.fn().mockResolvedValue({ messageId: 'test-message' }),
  enqueue: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock('@/lib/notifications/email-smtp', () => ({
  sendMailWithRetry: state.smtp, getSmtpFromHeader: () => 'test@example.com',
}));
vi.mock('@/lib/notifications/transactional/queue', () => ({
  queueTransactionalEmailSend: state.enqueue,
  getTransactionalEmailFromHeader: () => 'test@example.com',
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: async () => 'user-1' }));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({
  from(table: string) {
    let inserting = false;
    let premiumOnly = false;
    const result = (single = false) => {
      if (table === 'profiles') return { data: single ? state.profile : premiumOnly && !state.profile.premium_status ? [] : [state.profile], error: null };
      if (table === 'opt_status') return { data: state.optError ? null : single ? state.opt : [state.opt], error: state.optError ? { message: 'offline' } : null };
      if (table === 'employment_spans') return { data: [], error: null };
      return inserting ? { data: { id: 'queue-1' }, error: state.dedup ? { code: '23505' } : null } : { data: state.queue, error: null };
    };
    const query: Record<string, any> = {
      select: (columns: string) => { state.selects.push(columns); return query; },
      eq: (key: string) => { if (key === 'premium_status') premiumOnly = true; return query; },
      is: () => query, gte: () => query, lte: () => query, lt: () => query, in: () => query,
      insert: (data: Record<string, unknown>) => { inserting = true; state.inserts.push(data); return query; },
      update: (data: Record<string, unknown>) => { state.updates.push(data); return query; },
      single: async () => result(true), maybeSingle: async () => result(true),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
    };
    return query;
  },
}) }));

import { GET as daily } from '@/app/api/cron/send-daily-reminders/route';
import { GET as windowAlert } from '@/app/api/cron/stem-opt-window-alert/route';
import { GET as retry } from '@/app/api/cron/retry-pending-emails/route';
import { POST as enroll } from '@/app/api/user/tool-email/route';

const cronRequest = () => new NextRequest('https://example.com/api/cron/test');
const enrollRequest = () => new NextRequest('https://example.com/api/user/tool-email', {
  method: 'POST', body: JSON.stringify({ tool: 'stem_apply', email: 'new@example.com' }),
});
const sentHtml = () => String(state.smtp.mock.calls[0]?.[0].html);
afterEach(() => vi.useRealTimers());

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-22T12:00:00Z'));
  vi.clearAllMocks();
  state.profile = { user_id: 'user-1', first_name: 'Test', premium_status: true, stem_apply_email: 'old@example.com' };
  state.opt = { user_id: 'user-1', opt_ead_end_date: '2026-11-30', stem_dso_recommendation_date: '2026-08-01', dso_recommendation_date: '2025-01-01', stem_start_date: null };
  state.queue = [];
  state.updates = [];
  state.inserts = [];
  state.selects = [];
  state.dedup = false;
  state.optError = false;
});

describe('STEM daily reminders', () => {
  it('sends each tool only to its enrolled address under one daily dedup claim', async () => {
    state.profile.opt_clock_email = 'opt@example.com';
    state.opt.opt_start_date = '2026-09-01';
    await daily(cronRequest());
    const mails = state.smtp.mock.calls.map(call => call[0]);
    expect(mails).toHaveLength(2);
    expect(mails.find(m => m.to === 'old@example.com')?.html).toContain('September 30, 2026');
    expect(mails.find(m => m.to === 'opt@example.com')?.html).not.toContain('STEM OPT Extension');
    expect(state.inserts.filter(row => row.email_type === 'daily_reminder')).toHaveLength(1);
  });

  it('combines tools when their enrolled address is the same', async () => {
    state.profile.opt_clock_email = 'old@example.com';
    state.opt.opt_start_date = '2026-09-01';
    await daily(cronRequest());
    expect(state.smtp).toHaveBeenCalledTimes(1);
    expect(sentHtml()).toContain('STEM OPT Extension');
    expect(sentHtml()).toContain('OPT Unemployment');
  });
  it('counts down to DSO + 60 and labels EAD expiration separately', async () => {
    await daily(cronRequest());
    expect(sentHtml()).toContain('September 30, 2026');
    expect(sentHtml()).toContain('November 30, 2026');
    expect(sentHtml()).toContain('Effective filing deadline');
    expect(state.smtp.mock.calls[0][0].subject).toContain('8 days');
    expect(sentHtml()).not.toMatch(/cap-gap|\$410/i);
  });

  it('warns after the DSO deadline even with time left on the EAD', async () => {
    state.opt.stem_dso_recommendation_date = '2026-07-01';
    await daily(cronRequest());
    expect(sentHtml()).toContain('deadline has passed');
    expect(sentHtml()).not.toMatch(/You have time|apply for your STEM extension now|submit.*immediately/i);
    expect(state.smtp.mock.calls[0][0].subject).toContain('deadline has passed');
  });

  it('uses EAD expiration when it precedes the recommendation deadline', async () => {
    state.opt.stem_dso_recommendation_date = '2026-09-01';
    state.opt.opt_ead_end_date = '2026-09-30';
    await daily(cronRequest());
    expect(state.smtp.mock.calls[0][0].subject).toContain('8 days');
    expect(sentHtml()).toContain('October 31, 2026');
    expect(sentHtml()).toContain('September 30, 2026');
  });

  it('calls out the deadline day without negative countdowns', async () => {
    vi.setSystemTime(new Date('2026-09-30T23:59:00Z'));
    await daily(cronRequest());
    expect(sentHtml()).toContain('filing deadline is today');
    expect(sentHtml()).not.toContain('deadline has passed');
  });

  it('marks missing STEM DSO dates as estimates without using the initial OPT DSO date', async () => {
    state.opt.stem_dso_recommendation_date = null;
    await daily(cronRequest());
    expect(sentHtml()).toMatch(/estimate/i);
    expect(sentHtml()).toContain('STEM DSO recommendation date is missing');
    expect(sentHtml()).not.toContain('You have time');
  });

  it.each(['premium', 'enrollment', 'dedup', 'stem-started'])('preserves the %s guard', async (guard) => {
    if (guard === 'premium') state.profile.premium_status = false;
    if (guard === 'enrollment') state.profile.stem_apply_email = null;
    if (guard === 'dedup') state.dedup = true;
    if (guard === 'stem-started') state.opt.stem_start_date = '2026-09-01';
    await daily(cronRequest());
    expect(state.smtp).not.toHaveBeenCalled();
  });
});

describe('STEM enrollment', () => {
  it('includes the effective deadline and separate EAD expiration', async () => {
    await enroll(enrollRequest());
    expect(sentHtml()).toContain('September 30, 2026');
    expect(sentHtml()).toContain('November 30, 2026');
    expect(sentHtml()).toContain('Effective filing deadline');
    expect(sentHtml()).not.toMatch(/cap-gap/i);
    expect(state.selects.some(s => s.includes('stem_dso_recommendation_date'))).toBe(true);
  });
  it('warns on a passed recommendation deadline', async () => {
    state.opt.stem_dso_recommendation_date = '2026-07-01';
    await enroll(enrollRequest());
    expect(sentHtml()).toContain('deadline has passed');
  });
  it('marks enrollment without a recommendation as an estimate', async () => {
    state.opt.stem_dso_recommendation_date = null;
    await enroll(enrollRequest());
    expect(sentHtml()).toContain('Estimated filing deadline (EAD only)');
    expect(sentHtml()).toContain('STEM DSO recommendation date is missing');
  });
  it('does not invent dates if the enrollment timeline cannot be loaded', async () => {
    state.optError = true;
    await enroll(enrollRequest());
    expect(sentHtml()).toContain('STEM filing dates are unavailable');
  });
  it.each(['free', 'unchanged'])('does not send for %s enrollment', async guard => {
    if (guard === 'free') state.profile.premium_status = false;
    else state.profile.stem_apply_email = 'new@example.com';
    await enroll(enrollRequest());
    expect(state.smtp).not.toHaveBeenCalled();
  });
});

describe('STEM window alerts and retries', () => {
  it('marks window alerts without a recommendation as estimates in both formats', async () => {
    state.opt.stem_dso_recommendation_date = null;
    await windowAlert(cronRequest());
    const mail = state.enqueue.mock.calls[0][0];
    for (const body of [mail.html, mail.text]) {
      expect(body).toContain('Estimated filing deadline (EAD only)');
      expect(body).toContain('STEM DSO recommendation date is missing');
    }
  });
  it('uses the stored STEM recommendation and preserves transactional dedup', async () => {
    await windowAlert(cronRequest());
    const mail = state.enqueue.mock.calls[0][0];
    expect(mail.html).toContain('September 30, 2026');
    expect(mail.text).toContain('November 30, 2026');
    expect(mail.dedupe).toEqual({ kind: 'stem_opt_window' });
    expect(mail.emailData.stem_dso_recommendation_date).toBe('2026-08-01');
    expect(mail.html + mail.text).not.toMatch(/cap-gap|due within 10 days of starting/i);
  });
  it('does not claim the window is open on the 91-day buffer day', async () => {
    state.opt.opt_ead_end_date = '2026-12-22';
    await windowAlert(cronRequest());
    expect(state.enqueue.mock.calls[0][0].text).toContain('opens on September 23, 2026');
    expect(state.enqueue.mock.calls[0][0].subject).not.toContain('now open');
  });
  it('rebuilds a queued window alert from current dates before SMTP', async () => {
    state.opt.stem_dso_recommendation_date = '2026-07-01';
    state.queue = [{ id: 'queue-1', user_id: 'user-1', email_address: 'old@example.com', email_type: 'stem_opt_window_open', email_subject: 'old open subject', body_html: '<p>You have time to apply</p>', body_text: 'old dates', retry_count: 0 }];
    await retry(cronRequest());
    expect(sentHtml()).toContain('deadline has passed');
    expect(sentHtml()).not.toContain('You have time');
    expect(state.smtp.mock.calls[0][0].subject).not.toContain('now open');
  });
  it('never retries stale STEM bodies when current dates cannot be loaded', async () => {
    state.optError = true;
    state.queue = [{ id: 'queue-1', user_id: 'user-1', email_address: 'old@example.com', email_type: 'stem_opt_window_open', body_html: 'stale', body_text: 'stale', retry_count: 0 }];
    await retry(cronRequest());
    expect(state.smtp).not.toHaveBeenCalled();
  });
  it('suppresses queued window alerts once STEM has started', async () => {
    state.opt.stem_start_date = '2026-09-01';
    state.queue = [{ id: 'queue-1', user_id: 'user-1', email_address: 'old@example.com', email_type: 'stem_opt_window_open', body_html: 'stale', body_text: 'stale', retry_count: 0 }];
    await retry(cronRequest());
    expect(state.smtp).not.toHaveBeenCalled();
  });

  it('does not send a queued window email to a superseded STEM address', async () => {
    state.profile.stem_apply_email = 'new@example.com';
    state.queue = [{ id: 'queue-1', user_id: 'user-1', email_address: 'old@example.com', email_type: 'stem_opt_window_open', body_html: 'stale', body_text: 'stale', retry_count: 0 }];
    await retry(cronRequest());
    expect(state.smtp).not.toHaveBeenCalled();
  });

  it('never replays a persisted daily countdown during the generic retry cron', async () => {
    state.queue = [{ id: 'queue-1', user_id: 'user-1', email_address: 'old@example.com', email_type: 'daily_reminder', body_html: 'old STEM countdown', body_text: 'old STEM countdown', retry_count: 0 }];
    await retry(cronRequest());
    expect(state.smtp).not.toHaveBeenCalled();
  });
});
