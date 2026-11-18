// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { findTrialProgressCandidates } from './trial-progress';

const NOW = new Date('2026-11-18T16:10:00Z');
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

type Result = { data?: unknown; error?: unknown; count?: number };

/** Supabase stub. `email_queue` answers the trial_started read first, then the sent-check. */
function db(tables: Record<string, Result | Result[]>) {
  const calls: Array<{ table: string; filters: Array<[string, unknown]> }> = [];
  const seen: Record<string, number> = {};
  const from = (table: string) => {
    const entry = tables[table];
    const index = seen[table] ?? 0;
    seen[table] = index + 1;
    const result = {
      data: null,
      error: null,
      ...(Array.isArray(entry) ? entry[Math.min(index, entry.length - 1)] : entry),
    };
    const call = { table, filters: [] as Array<[string, unknown]> };
    calls.push(call);
    const chain: Record<string, unknown> = {};
    for (const method of ['select', 'in', 'order', 'limit'])
      chain[method] = () => chain;
    for (const method of ['eq', 'gte', 'lte'])
      chain[method] = (column: string, value: unknown) => {
        call.filters.push([`${method}:${column}`, value]);
        return chain;
      };
    chain.then = (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve);
    return chain;
  };
  return { client: { from } as never, calls };
}

const started = (userId: string, id: string) => ({
  id,
  user_id: userId,
  email_address: `${id}@example.test`,
  email_data: { trial_end_date: 'November 22, 2026' },
  created_at: '2026-11-15T12:00:00Z',
});
const pro = (userId: string) => ({
  user_id: userId,
  first_name: 'Alex',
  premium_status: true,
  subscription_expires_at: null,
  plan_tier: 'pro',
});

describe('findTrialProgressCandidates', () => {
  it('reads the 3 to 5 day window and counts checks and changes since the start', async () => {
    const { client, calls } = db({
      email_queue: [{ data: [started(A, 'ts-a')] }, { data: [] }],
      profiles: { data: [pro(A)] },
      email_preferences: { data: [] },
      case_status: {
        data: [
          {
            user_id: A,
            change_log: [{ date: '2026-11-16T14:00:00Z' }, { date: '2026-10-01' }, null],
          },
          { user_id: A, change_log: null },
        ],
      },
      case_check_jobs: { count: 6 },
    });
    expect(await findTrialProgressCandidates(client, { now: NOW })).toEqual([
      {
        userId: A,
        email: 'ts-a@example.test',
        firstName: 'Alex',
        trialStartedId: 'ts-a',
        introEndDate: 'November 22, 2026',
        checks: 6,
        cases: 2,
        changes: 1,
      },
    ]);
    expect(calls[0]!.filters).toEqual(
      expect.arrayContaining([
        ['eq:email_type', 'trial_started'],
        ['eq:status', 'sent'],
        ['gte:created_at', '2026-11-13T16:10:00.000Z'],
        ['lte:created_at', '2026-11-15T16:10:00.000Z'],
      ])
    );
    const jobs = calls.find((call) => call.table === 'case_check_jobs')!;
    expect(jobs.filters).toEqual(
      expect.arrayContaining([
        ['eq:user_id', A],
        ['eq:state', 'succeeded'],
        ['gte:completed_at', '2026-11-15T12:00:00Z'],
      ])
    );
  });

  it('skips accounts that already got it, cancelled, or opted out of email', async () => {
    const { client } = db({
      email_queue: [
        { data: [started(A, 'ts-a'), started(B, 'ts-b'), started(C, 'ts-c')] },
        { data: [{ user_id: A }] },
      ],
      profiles: { data: [pro(A), { ...pro(B), premium_status: false }, pro(C)] },
      email_preferences: { data: [{ user_id: C, email_enabled: false }] },
      case_status: { data: [] },
      case_check_jobs: { count: 0 },
    });
    expect(await findTrialProgressCandidates(client, { now: NOW })).toEqual([]);
  });

  it('throws on a failed lookup instead of sending from partial data', async () => {
    await expect(
      findTrialProgressCandidates(
        db({ email_queue: { error: { message: 'down' } } }).client,
        { now: NOW }
      )
    ).rejects.toThrow('Trial start lookup failed');
    await expect(
      findTrialProgressCandidates(
        db({
          email_queue: [{ data: [started(A, 'ts-a')] }, { data: [] }],
          profiles: { error: { message: 'down' } },
          email_preferences: { data: [] },
          case_status: { data: [] },
        }).client,
        { now: NOW }
      )
    ).rejects.toThrow('Trial progress lookup failed');
  });
});
