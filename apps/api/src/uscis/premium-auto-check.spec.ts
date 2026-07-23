import { filterCasesForPremiumAutoCheck } from './premium-auto-check';

describe('filterCasesForPremiumAutoCheck', () => {
  it('queues only premium owners and counts free skips', () => {
    const cases = [
      { receipt_number: 'IOE1', user_id: 'free-a' },
      { receipt_number: 'IOE2', user_id: 'pro-a' },
      { receipt_number: 'IOE3', user_id: 'free-b' },
      { receipt_number: 'IOE4', user_id: 'pro-a' },
    ];

    const result = filterCasesForPremiumAutoCheck(cases, ['pro-a', 'pro-b']);

    expect(result.premiumCases).toEqual([
      { receipt_number: 'IOE2', user_id: 'pro-a' },
      { receipt_number: 'IOE4', user_id: 'pro-a' },
    ]);
    expect(result.skippedFree).toBe(2);
  });

  it('queues nothing when nobody is premium', () => {
    const cases = [
      { receipt_number: 'IOE1', user_id: 'free-a' },
      { receipt_number: 'IOE2', user_id: 'free-b' },
    ];

    const result = filterCasesForPremiumAutoCheck(cases, []);

    expect(result.premiumCases).toEqual([]);
    expect(result.skippedFree).toBe(2);
  });

  it('ignores empty premium ids', () => {
    const cases = [{ receipt_number: 'IOE1', user_id: 'pro-a' }];
    const result = filterCasesForPremiumAutoCheck(cases, ['', 'pro-a']);
    expect(result.premiumCases).toHaveLength(1);
    expect(result.skippedFree).toBe(0);
  });
});
