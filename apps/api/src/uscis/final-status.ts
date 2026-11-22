// USCIS statuses after which a case normally never changes again. The daily
// sync does not queue these cases; a user's manual refresh still checks USCIS.
// Keep in sync with apps/web/lib/case-status/final-status.ts.
export const FINAL_STATUS_KEYWORDS = [
  'Card Was Delivered',
  'Case Was Denied',
  'Withdrawal Acknowledged',
  'Notice Explaining USCIS Actions Was Mailed',
  'Termination Notice Sent',
  'Refund Of An Unused Fee',
] as const;

export function isFinalCaseStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return FINAL_STATUS_KEYWORDS.some((keyword) => status.includes(keyword));
}
