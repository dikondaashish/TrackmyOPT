/**
 * Daily batch auto-checks are a Pro entitlement.
 * Free users keep manual refresh via the web/API check endpoints.
 */

export type CaseQueueRow = {
  receipt_number: string;
  user_id: string;
};

/**
 * Keep only cases whose owner is in the premium user set.
 * Pure helper so the cron filter is unit-testable without Supabase/Bull.
 */
export function filterCasesForPremiumAutoCheck(
  cases: CaseQueueRow[],
  premiumUserIds: Iterable<string>,
): { premiumCases: CaseQueueRow[]; skippedFree: number } {
  const premium = new Set(
    [...premiumUserIds].filter((id) => typeof id === 'string' && id.length > 0),
  );
  const premiumCases: CaseQueueRow[] = [];
  let skippedFree = 0;

  for (const row of cases) {
    if (premium.has(row.user_id)) {
      premiumCases.push(row);
    } else {
      skippedFree += 1;
    }
  }

  return { premiumCases, skippedFree };
}
