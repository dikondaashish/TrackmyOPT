// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCaseEmailOptOutToken,
  verifyCaseEmailOptOutToken,
} from '../case-email-optout';

const m = vi.hoisted(() => ({ queue: vi.fn() }));
vi.mock('./queue', () => ({
  getAppBaseUrl: () => 'https://www.trackmyopt.com',
  queueTransactionalEmailSend: m.queue,
}));

import {
  buildFreeCaseUpdateEmailBodies,
  buildTrialProgressEmailBodies,
  sendFreeCaseUpdateEmail,
  stopCaseEmails,
} from './case-updates';

const USER = '11111111-1111-4111-8111-111111111111';
const CASE = '22222222-2222-4222-8222-222222222222';

/** Supabase stub: each table resolves to one fixed result. */
function db(tables: Record<string, { data?: unknown; error?: unknown }>) {
  const updates: Record<string, unknown> = {};
  const from = vi.fn((table: string) => {
    const result = { data: null, error: null, ...tables[table] };
    const chain: Record<string, unknown> = {};
    for (const method of ['select', 'eq'])
      chain[method] = vi.fn(() => chain);
    chain.update = vi.fn((value: unknown) => {
      updates[table] = value;
      return chain;
    });
    chain.maybeSingle = vi.fn(() => Promise.resolve(result));
    chain.then = (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve);
    return chain;
  });
  return { client: { from } as never, updates };
}

const freeAccount = {
  profiles: {
    data: {
      email: 'student@example.test',
      notification_email: null,
      first_name: 'Alex',
      premium_status: false,
      subscription_expires_at: null,
      plan_tier: null,
    },
  },
  email_preferences: { data: null },
  case_status: { data: { notifications_enabled: true } },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', 'test-signing-secret');
  vi.stubEnv('FREE_CASE_UPDATE_EMAILS', '');
  m.queue.mockResolvedValue({ ok: true, skipped: false, queueId: 'q1' });
});
afterEach(() => vi.unstubAllEnvs());

describe('case email opt-out token', () => {
  it('round-trips the account id and rejects tampering', () => {
    const token = createCaseEmailOptOutToken(USER, 'secret');
    expect(verifyCaseEmailOptOutToken(token, 'secret')).toBe(USER);
    expect(verifyCaseEmailOptOutToken(token, 'other-secret')).toBeNull();
    expect(verifyCaseEmailOptOutToken(`${token}x`, 'secret')).toBeNull();
    expect(verifyCaseEmailOptOutToken(`${token}.extra`, 'secret')).toBeNull();
    expect(verifyCaseEmailOptOutToken(null, 'secret')).toBeNull();
    expect(verifyCaseEmailOptOutToken(token, undefined)).toBeNull();
    expect(() => createCaseEmailOptOutToken('not-a-uuid', 'secret')).toThrow();
  });
});

describe('free case update email', () => {
  it('says a change was found without the status or a receipt number', () => {
    const bodies = buildFreeCaseUpdateEmailBodies({
      firstName: '<b>Alex</b>',
      optOutUrl: 'https://www.trackmyopt.com/stop?token=a&b=1',
    });
    expect(bodies.subject).toBe('Your USCIS case has an update');
    expect(bodies.html).not.toContain('<b>Alex</b>');
    expect(bodies.html).toContain('token=a&amp;b=1');
    expect(bodies.html).toContain('Stop case emails');
    expect(bodies.text).toContain('Stop case emails: https://www.trackmyopt.com/stop');
    for (const body of [bodies.html, bodies.text]) {
      expect(body).toContain('/dashboard/case-status?src=case_update_email');
      expect(body).not.toMatch(/approved|denied|received|[A-Z]{3}\d{10}/i);
    }
  });

  it('sends one notice to a Free account, with only the case id as data', async () => {
    const { client } = db(freeAccount);
    const result = await sendFreeCaseUpdateEmail({
      supabase: client,
      userId: USER,
      caseId: CASE,
    });
    expect(result).toMatchObject({ ok: true, skipped: false });
    const sent = m.queue.mock.calls[0]![0];
    expect(sent).toMatchObject({
      userId: USER,
      emailAddress: 'student@example.test',
      emailType: 'free_case_update',
      emailData: { case_id: CASE },
      dedupe: { kind: 'recent_same_type', withinHours: 20 },
    });
    const link = /unsubscribe\?token=([^"\s]+)/.exec(sent.text)![1]!;
    expect(
      verifyCaseEmailOptOutToken(
        decodeURIComponent(link),
        'test-signing-secret'
      )
    ).toBe(USER);
  });

  it.each([
    ['a paid account', { profiles: { data: { ...freeAccount.profiles.data, premium_status: true, plan_tier: 'pro' } } }, 'not_free'],
    ['case emails turned off', { case_status: { data: { notifications_enabled: false } } }, 'opted_out'],
    ['a removed case', { case_status: { data: null } }, 'opted_out'],
    ['the global email opt-out', { email_preferences: { data: { email_enabled: false } } }, 'opted_out'],
    ['no address on file', { profiles: { data: { ...freeAccount.profiles.data, email: ' ' } } }, 'no_address'],
  ])('does not send for %s', async (_label, override, reason) => {
    const { client } = db({ ...freeAccount, ...override });
    expect(
      await sendFreeCaseUpdateEmail({ supabase: client, userId: USER, caseId: CASE })
    ).toEqual({ ok: true, skipped: reason });
    expect(m.queue).not.toHaveBeenCalled();
  });

  it('can be paused, and fails closed without a signing secret or on a lookup error', async () => {
    vi.stubEnv('FREE_CASE_UPDATE_EMAILS', 'false');
    expect(
      await sendFreeCaseUpdateEmail({ supabase: db(freeAccount).client, userId: USER, caseId: CASE })
    ).toEqual({ ok: true, skipped: 'disabled' });

    vi.stubEnv('FREE_CASE_UPDATE_EMAILS', '');
    vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', '');
    vi.stubEnv('ADMIN_SECRET', '');
    expect(
      await sendFreeCaseUpdateEmail({ supabase: db(freeAccount).client, userId: USER, caseId: CASE })
    ).toEqual({ ok: false, error: 'signing_secret_missing' });

    vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', 'test-signing-secret');
    const broken = db({ ...freeAccount, profiles: { error: { message: 'down' } } });
    expect(
      await sendFreeCaseUpdateEmail({ supabase: broken.client, userId: USER, caseId: CASE })
    ).toEqual({ ok: false, error: 'lookup_failed' });
    expect(m.queue).not.toHaveBeenCalled();
  });

  it('stopping case emails turns off case notices and the weekly summary', async () => {
    const { client, updates } = db({});
    expect(await stopCaseEmails(client, USER)).toBe('ok');
    expect(updates.case_status).toEqual({ notifications_enabled: false });
    expect(updates.case_digest_preferences).toMatchObject({ enabled: false });
    const broken = db({ case_status: { error: { message: 'down' } } });
    expect(await stopCaseEmails(broken.client, USER)).toBe('unavailable');
  });
});

describe('trial progress email', () => {
  const base = { firstName: 'Alex', introEndDate: 'October 17, 2026' };
  it('reports the real counts and does not promise a price', () => {
    const quiet = buildTrialProgressEmailBodies({ ...base, checks: 3, cases: 1, changes: 0 });
    expect(quiet.text).toContain('checked USCIS for you 3 times across 1 saved case');
    expect(quiet.text).toContain('No status change so far');
    expect(quiet.text).toContain('runs through October 17, 2026');
    expect(quiet.text).not.toMatch(/\$\d/);

    const moved = buildTrialProgressEmailBodies({ ...base, checks: 1, cases: 2, changes: 1 });
    expect(moved.text).toContain('1 time across 2 saved cases');
    expect(moved.text).toContain('We recorded 1 status change.');
  });
  it('asks for a receipt when no case is saved, and handles a queued first check', () => {
    const empty = buildTrialProgressEmailBodies({ ...base, checks: 0, cases: 0, changes: 0, introEndDate: null });
    expect(empty.text).toContain('No receipt added yet');
    expect(empty.html).toContain('Add my receipt');
    expect(empty.text).not.toContain('runs through');
    const queued = buildTrialProgressEmailBodies({ ...base, checks: 0, cases: 1, changes: 0 });
    expect(queued.text).toContain('saved and queued for its daily check');
  });
});
