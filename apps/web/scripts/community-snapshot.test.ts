// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { summarise } from './community-snapshot';

const row = (kind: string, month: string, days: number, premium = false) => ({
  case_kind: kind,
  premium_processing: premium,
  init_date: `${month}-10`,
  days_to_approval: days,
});

describe('community snapshot aggregation', () => {
  it('pools usable cases, splits receipt months and suppresses small cohorts', () => {
    const rows = [
      ...Array.from({ length: 15 }, (_, i) => row('initial_opt', '2026-06', 100 + i)),
      ...Array.from({ length: 3 }, (_, i) => row('initial_opt', '2026-07', 80 + i)),
      row('initial_opt', '2026-06', 3), // unusable: under 7 days
      row('initial_opt', '2026-06', 50, true),
    ];
    const out = summarise(rows) as Record<string, { pooled: { n: number; median: number }; byReceiptMonth: Array<Record<string, unknown>> }>;
    expect(out.initial_opt.pooled.n).toBe(18);
    expect(out.initial_opt.byReceiptMonth).toEqual([
      { month: '2026-06', n: 15, median: 107, p25: 104, p75: 111 },
      { month: '2026-07', n: 3, suppressed: true },
    ]);
    expect(out.initial_opt_premium.pooled.n).toBe(1);
    expect(out.stem_extension.pooled.n).toBe(0);
  });
});
