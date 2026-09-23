import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  aggregateApprovalStats,
  type ApprovalRow,
} from '../community-stats-builder';
const now = new Date('2026-09-23T12:00:00Z');
const rows = (count = 5): ApprovalRow[] =>
  Array.from({ length: count }, (_, index) => ({
    receipt_number: 'SYNTHETIC-' + index,
    user_id: 'user-' + index,
    case_type: 'I-765',
    filing_category: 'initial_opt',
    filing_category_confirmed_at: '2026-01-01',
    received_date: '2026-08-01',
    current_status: 'Case Was Approved',
    pp_start_date: null,
    status_history: [
      {
        status: 'Case Was Approved',
        date: '2026-09-' + String(10 + index).padStart(2, '0'),
      },
    ],
  }));
describe('honest approval statistics', () => {
  it('uses a median and does not invent recent reports', () => {
    const result = aggregateApprovalStats(rows(), 'initial_opt', now);
    expect(result.mainStat.value).toBe(42);
    expect(result.mainStat.label).toContain('Median');
    expect(result.recentReports).toEqual([]);
    expect(result.secondaryStat.value).toBe(0);
  });
  it('suppresses empty and small cohorts instead of publishing baseline numbers', () => {
    for (const source of [
      [],
      rows(4),
      rows().map((row) => ({ ...row, user_id: 'same-user' })),
    ]) {
      expect(aggregateApprovalStats(source, 'initial_opt', now)).toMatchObject({
        dataSource: 'insufficient',
        mainStat: { value: null },
        secondaryStat: { value: null },
        recentReports: [],
      });
    }
  });
  it('separates confirmed OPT and STEM without guessing from user profiles', () => {
    expect(
      aggregateApprovalStats(rows(), 'stem_extension', now).mainStat.value
    ).toBeNull();
    expect(
      aggregateApprovalStats(
        rows().map((row) => ({ ...row, filing_category: 'stem_extension' })),
        'stem_extension',
        now
      ).sampleSize
    ).toBe(5);
    expect(
      aggregateApprovalStats(
        rows().map((row) => ({ ...row, filing_category_confirmed_at: null })),
        'initial_opt',
        now
      ).mainStat.value
    ).toBeNull();
  });
  it.each([
    { received_date: null },
    { case_type: 'I-130' },
    { case_type: null },
    { pp_start_date: '2026-09-01' },
    { received_date: '2026-10-01' },
    { status_history: [{ status: 'Case Was Approved', date: 'invalid' }] },
    { status_history: [{ status: 'Case Was Approved', date: '2026-10-01' }] },
    { status_history: [{ status: 'Case Was Approved', date: '2026-01-01' }] },
    { status_history: [{ status: 'Card Was Delivered', date: '2026-09-10' }] },
    { current_status: 'Case Was Denied' },
  ])('excludes unreliable or incomparable rows %j', (patch) => {
    expect(
      aggregateApprovalStats(
        rows().map((row) => ({ ...row, ...patch })),
        'initial_opt',
        now
      ).mainStat.value
    ).toBeNull();
  });
  it('deduplicates receipt numbers and uses first approval, not later delivery', () => {
    expect(
      aggregateApprovalStats([...rows(), ...rows()], 'initial_opt', now)
        .sampleSize
    ).toBe(5);
    const source = rows().map((row) => ({
      ...row,
      status_history: [
        { status: 'Card Was Delivered', date: '2026-09-22' },
        { status: 'Case Was Approved', date: '2026-09-10' },
      ],
    }));
    expect(
      aggregateApprovalStats(source, 'initial_opt', now).mainStat.value
    ).toBe(40);
  });
});

const query = vi.hoisted(() => ({
  select: vi.fn(),
  in: vi.fn(),
  not: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => query }),
}));
beforeEach(() => {
  for (const key of ['select', 'in', 'not', 'order'] as const)
    query[key].mockReturnValue(query);
});
it('propagates database errors instead of replacing them with approval estimates', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'synthetic-test-key');
  query.limit.mockResolvedValue({
    error: { message: 'unavailable' },
    data: null,
  });
  try {
    const { buildCommunityStats } = await import('../community-stats-builder');
    await expect(buildCommunityStats()).rejects.toThrow(
      'Approval statistics query failed'
    );
  } finally {
    vi.unstubAllEnvs();
  }
});
