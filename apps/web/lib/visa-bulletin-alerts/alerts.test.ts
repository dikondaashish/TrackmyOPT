// @vitest-environment node
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { EMPLOYMENT_BULLETINS, latestBulletin } from '@/data/visa-bulletin/employment-cutoffs';
import {
  buildAlertEmail,
  confirm,
  createAlertToken,
  describeStatus,
  sendDueAlerts,
  subscribe,
  subscribeSchema,
  unsubscribe,
  verifyAlertToken,
  type Subscription,
} from './alerts';

type Row = Subscription & { created_at: string; source_page: string | null };
type Filter = (row: Row) => boolean;

/** Minimal in-memory stand-in for the PostgREST calls alerts.ts makes. */
function fakeSupabase(rows: Row[] = []) {
  function builder(op: 'select' | 'update' | 'delete' | 'insert', payload?: Partial<Row>) {
    const filters: Filter[] = [];
    let limit = Infinity;
    let returning = op === 'select';
    let single: 'single' | 'maybe' | null = null;
    const field = (row: Row, key: string) => (row as unknown as Record<string, unknown>)[key];
    const run = () => {
      if (op === 'insert') {
        const row = payload as Partial<Row>;
        if (rows.some((r) => r.email === row.email && r.category === row.category && r.chargeability === row.chargeability)) {
          return { data: null, error: { code: '23505' } };
        }
        const created = {
          id: randomUUID(), confirmed_at: null, confirmation_sent_at: null, last_bulletin_sent: null,
          priority_date: null, source_page: null, created_at: new Date().toISOString(), ...row,
        } as Row;
        rows.push(created);
        return { data: single ? created : [created], error: null };
      }
      const matched = rows.filter((r) => filters.every((f) => f(r))).slice(0, limit);
      if (op === 'update') matched.forEach((r) => Object.assign(r, payload));
      if (op === 'delete') matched.forEach((r) => rows.splice(rows.indexOf(r), 1));
      const data = returning ? matched.map((r) => ({ ...r })) : null;
      if (single) return { data: data?.[0] ?? null, error: null };
      return { data, error: null };
    };
    const api = {
      select: () => { returning = true; return api; },
      eq: (k: string, v: unknown) => { filters.push((r) => field(r, k) === v); return api; },
      is: (k: string, v: null) => { filters.push((r) => field(r, k) === v); return api; },
      not: (k: string, _op: 'is', v: null) => { filters.push((r) => field(r, k) !== v); return api; },
      lt: (k: string, v: string) => { filters.push((r) => String(field(r, k)) < v); return api; },
      or: (expr: string) => {
        const month = /lt\.(\d{4}-\d{2})/.exec(expr)![1]!;
        filters.push((r) => r.last_bulletin_sent === null || r.last_bulletin_sent < month);
        return api;
      },
      order: () => api,
      limit: (n: number) => { limit = n; return api; },
      single: () => { single = 'single'; return Promise.resolve(run()); },
      maybeSingle: () => { single = 'maybe'; return Promise.resolve(run()); },
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise.resolve(run()).then(resolve, reject),
    };
    return api;
  }
  const client = {
    from: () => ({
      select: () => builder('select'),
      insert: (payload: Partial<Row>) => builder('insert', payload),
      update: (payload: Partial<Row>) => builder('update', payload),
      delete: () => builder('delete'),
    }),
  };
  return { client: client as unknown as SupabaseClient, rows };
}

const SECRET = 'test-secret';
const deps = (supabase: SupabaseClient, sendMail = vi.fn().mockResolvedValue({ accepted: ['x'] })) => ({
  supabase, sendMail, from: 'TrackMyOPT <no-reply@trackmyopt.com>', baseUrl: 'https://www.trackmyopt.com', secret: SECRET,
});

describe('alert links', () => {
  it('signs per purpose and rejects tampering', () => {
    const id = randomUUID();
    const token = createAlertToken('confirm', id, SECRET);
    expect(verifyAlertToken('confirm', token, SECRET)).toBe(id);
    expect(verifyAlertToken('unsubscribe', token, SECRET)).toBeNull();
    expect(verifyAlertToken('confirm', token, 'other')).toBeNull();
    expect(verifyAlertToken('confirm', `${randomUUID()}.${token.split('.')[1]}`, SECRET)).toBeNull();
    expect(token).not.toContain('@');
  });
});

describe('input validation', () => {
  it('normalises email and treats an empty priority date as missing', () => {
    const parsed = subscribeSchema.parse({ email: ' Me@Example.COM ', category: 'eb2', chargeability: 'india', priorityDate: '' });
    expect(parsed.email).toBe('me@example.com');
    expect(parsed.priorityDate).toBeUndefined();
  });

  it('rejects future priority dates, unknown categories and odd source pages', () => {
    expect(subscribeSchema.safeParse({ email: 'a@b.co', category: 'eb2', chargeability: 'india', priorityDate: '2999-01-01' }).success).toBe(false);
    expect(subscribeSchema.safeParse({ email: 'a@b.co', category: 'f1', chargeability: 'india' }).success).toBe(false);
    expect(subscribeSchema.safeParse({ email: 'a@b.co', category: 'eb2', chargeability: 'india', sourcePage: 'https://evil' }).success).toBe(false);
  });
});

describe('status text', () => {
  const november = EMPLOYMENT_BULLETINS.find((b) => b.month === '2026-11')!;

  it('explains a priority date that is behind but inside the filing chart', () => {
    const status = describeStatus(november, 'eb2', 'india', '2014-06-01');
    expect(status.headline).toBe('November 2026 Visa Bulletin: EB-2 India Final Action Date is Nov 1, 2013');
    expect(status.lines.join(' ')).toContain('about 7 months behind the Final Action Date');
    expect(status.lines.join(' ')).toContain('does not block an I-485 filing');
  });

  it('says when a priority date is current', () => {
    const status = describeStatus(november, 'eb1', 'row', '2020-01-01');
    expect(status.lines.join(' ')).toContain('is current under the Final Action Dates');
  });

  it('builds an alert email with an unsubscribe link and no unresolved HTML', () => {
    const mail = buildAlertEmail({
      sub: { category: 'eb3', chargeability: 'china', priority_date: null },
      bulletin: november,
      baseUrl: 'https://www.trackmyopt.com',
      unsubscribeUrl: 'https://www.trackmyopt.com/api/visa-bulletin-alerts/unsubscribe?token=x',
    });
    expect(mail.subject).toContain('EB-3 China');
    expect(mail.text).toContain('Unsubscribe: https://www.trackmyopt.com/api/visa-bulletin-alerts/unsubscribe?token=x');
    expect(mail.html).toContain('/blog/november-2026-visa-bulletin-predictions-opt-workers');
  });
});

describe('subscription lifecycle', () => {
  const input = { email: 'reader@example.com', category: 'eb2' as const, chargeability: 'india' as const, priorityDate: '2015-02-01' };

  it('creates a pending alert and sends one confirmation email', async () => {
    const db = fakeSupabase();
    const d = deps(db.client);
    expect(await subscribe(input, d)).toBe('sent');
    expect(db.rows).toHaveLength(1);
    expect(db.rows[0]!.confirmation_sent_at).not.toBeNull();
    const mail = d.sendMail.mock.calls[0]![0];
    expect(mail.to).toBe('reader@example.com');
    expect(mail.text).toContain('/api/visa-bulletin-alerts/confirm?token=');
    // A second submit within the hour sends nothing.
    expect(await subscribe(input, d)).toBe('recently_sent');
    expect(d.sendMail).toHaveBeenCalledTimes(1);
  });

  it('caps alerts per address and leaves confirmed alerts untouched', async () => {
    const db = fakeSupabase();
    const d = deps(db.client);
    for (const category of ['eb1', 'eb2', 'eb3'] as const) await subscribe({ ...input, category }, d);
    expect(await subscribe({ ...input, category: 'eb5' }, d)).toBe('limit');
    db.rows[1]!.confirmed_at = new Date().toISOString();
    expect(await subscribe({ ...input, category: 'eb2', priorityDate: '2010-01-01' }, d)).toBe('already_confirmed');
    expect(db.rows[1]!.priority_date).toBe('2015-02-01');
  });

  it('confirms without sending the current bulletin again, then unsubscribes by deleting', async () => {
    const db = fakeSupabase();
    await subscribe(input, deps(db.client));
    const id = db.rows[0]!.id;
    const outcome = await confirm(db.client, id);
    expect(outcome.result).toBe('ok');
    expect(db.rows[0]!.last_bulletin_sent).toBe(latestBulletin().month);
    expect((await confirm(db.client, randomUUID())).result).toBe('missing');
    await unsubscribe(db.client, id);
    expect(db.rows).toHaveLength(0);
  });
});

describe('monthly send', () => {
  const month = latestBulletin().month;
  const row = (over: Partial<Row>): Row => ({
    id: randomUUID(), email: 'a@example.com', category: 'eb2', chargeability: 'india', priority_date: null,
    confirmed_at: '2026-10-01T00:00:00Z', confirmation_sent_at: null, last_bulletin_sent: '2026-10',
    source_page: null, created_at: '2026-10-01T00:00:00Z', ...over,
  });

  it('sends once to due subscribers, skips the rest and deletes stale pending rows', async () => {
    const db = fakeSupabase([
      row({ email: 'due@example.com' }),
      row({ email: 'done@example.com', last_bulletin_sent: month }),
      row({ email: 'pending@example.com', confirmed_at: null, created_at: '2026-01-01T00:00:00Z' }),
    ]);
    const d = deps(db.client);
    const result = await sendDueAlerts(d);
    expect(result).toMatchObject({ month, due: 1, sent: 1, failed: 0, pendingDeleted: 1 });
    expect(d.sendMail.mock.calls[0]![0].to).toBe('due@example.com');
    expect(d.sendMail.mock.calls[0]![0].headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect((await sendDueAlerts(d)).sent).toBe(0);
  });

  it('releases the claim when sending fails and reports without the address', async () => {
    const db = fakeSupabase([row({ email: 'fail@example.com' })]);
    const onError = vi.fn();
    const sendMail = vi.fn().mockRejectedValue(new Error('550 fail@example.com rejected'));
    const result = await sendDueAlerts({ ...deps(db.client, sendMail), onError });
    expect(result.failed).toBe(1);
    expect(db.rows[0]!.last_bulletin_sent).toBe('2026-10');
    expect(String(onError.mock.calls[0]![0])).not.toContain('@');
  });
});
