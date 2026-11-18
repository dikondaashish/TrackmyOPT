// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  CASE_PASS_PRICE_CENTS,
  casePassExpiryFrom,
  getActiveCasePassExpiry,
  isCasePassCheckout,
  restoreCasePassAccess,
} from '../case-pass';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

type Result = { data?: unknown; error?: unknown };

/** Supabase stub: one fixed result per table, with the calls recorded. */
function db(tables: Record<string, Result>) {
  const filters: Array<[string, string, unknown]> = [];
  const updates: Record<string, unknown> = {};
  const from = (table: string) => {
    const result = { data: null, error: null, ...tables[table] };
    const chain: Record<string, unknown> = {};
    for (const method of ['select', 'order', 'limit'])
      chain[method] = () => chain;
    for (const method of ['eq', 'gte'])
      chain[method] = (column: string, value: unknown) => {
        filters.push([table, `${method}:${column}`, value]);
        return chain;
      };
    chain.update = (value: unknown) => {
      updates[table] = value;
      return chain;
    };
    chain.then = (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve);
    return chain;
  };
  return { client: { from } as never, filters, updates };
}

describe('Case Pass basics', () => {
  it('costs $9.99 and runs 180 days from the purchase', () => {
    expect(CASE_PASS_PRICE_CENTS).toBe(999);
    expect(casePassExpiryFrom(NOW.getTime()).toISOString()).toBe(
      new Date(NOW.getTime() + 180 * DAY).toISOString()
    );
  });

  it('recognises its checkout sessions by purchase type', () => {
    expect(
      isCasePassCheckout({ metadata: { purchase_type: 'case_pass' } })
    ).toBe(true);
    expect(isCasePassCheckout({ metadata: { planId: 'pro' } })).toBe(false);
    expect(isCasePassCheckout({ metadata: null })).toBe(false);
  });
});

describe('getActiveCasePassExpiry', () => {
  it('finds a paid pass inside its term, reading the stored time as UTC', async () => {
    const { client, filters } = db({
      payment_transactions: { data: [{ created_at: '2026-10-01 08:00:00' }] },
    });
    const expiry = await getActiveCasePassExpiry(client, 'user-1', NOW);
    expect(expiry?.toISOString()).toBe(
      new Date(Date.parse('2026-10-01T08:00:00Z') + 180 * DAY).toISOString()
    );
    expect(filters).toEqual(
      expect.arrayContaining([
        ['payment_transactions', 'eq:user_id', 'user-1'],
        ['payment_transactions', 'eq:plan_id', 'case_pass'],
        ['payment_transactions', 'eq:status', 'succeeded'],
        [
          'payment_transactions',
          'gte:created_at',
          new Date(NOW.getTime() - 180 * DAY).toISOString(),
        ],
      ])
    );
  });

  it('returns null with no pass, an unreadable date, or a term that has ended', async () => {
    expect(
      await getActiveCasePassExpiry(
        db({ payment_transactions: { data: [] } }).client,
        'user-1',
        NOW
      )
    ).toBeNull();
    expect(
      await getActiveCasePassExpiry(
        db({ payment_transactions: { data: [{ created_at: 'nonsense' }] } })
          .client,
        'user-1',
        NOW
      )
    ).toBeNull();
    const ended = new Date(NOW.getTime() - 180 * DAY).toISOString();
    expect(
      await getActiveCasePassExpiry(
        db({ payment_transactions: { data: [{ created_at: ended }] } }).client,
        'user-1',
        NOW
      )
    ).toBeNull();
  });

  it('throws on a lookup error so callers do not treat it as "no pass"', async () => {
    await expect(
      getActiveCasePassExpiry(
        db({ payment_transactions: { error: { message: 'down' } } }).client,
        'user-1',
        NOW
      )
    ).rejects.toThrow('Case Pass lookup failed');
  });
});

describe('restoreCasePassAccess', () => {
  it('puts a running pass back on the profile', async () => {
    const { client, updates, filters } = db({
      payment_transactions: {
        data: [{ created_at: '2026-11-01T00:00:00Z' }],
      },
    });
    const expiry = await restoreCasePassAccess(client, 'user-1', NOW);
    expect(expiry?.toISOString()).toBe('2027-04-30T00:00:00.000Z');
    expect(updates.profiles).toEqual({
      premium_status: true,
      plan_tier: 'pro',
      subscription_expires_at: '2027-04-30T00:00:00.000Z',
    });
    expect(filters).toContainEqual(['profiles', 'eq:user_id', 'user-1']);
  });

  it('changes nothing without a running pass', async () => {
    const { client, updates } = db({ payment_transactions: { data: [] } });
    expect(await restoreCasePassAccess(client, 'user-1', NOW)).toBeNull();
    expect(updates.profiles).toBeUndefined();
  });

  it('throws when the profile cannot be updated', async () => {
    const { client } = db({
      payment_transactions: {
        data: [{ created_at: '2026-11-01T00:00:00Z' }],
      },
      profiles: { error: { message: 'down' } },
    });
    await expect(restoreCasePassAccess(client, 'user-1', NOW)).rejects.toThrow(
      'Case Pass access restore failed'
    );
  });
});
