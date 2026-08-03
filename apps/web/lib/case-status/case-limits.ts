/** Per-plan limits for tracked USCIS cases. */

const CASE_TRACKING_LIMITS = {
  free: 1,
  pro: 8,
} as const;

export function getCaseTrackingLimit(isPremium: boolean): number {
  return isPremium ? CASE_TRACKING_LIMITS.pro : CASE_TRACKING_LIMITS.free;
}

export function caseLimitMessage(isPremium: boolean): string {
  const limit = getCaseTrackingLimit(isPremium);
  if (isPremium) {
    return `You can track up to ${limit} cases on Pro.`;
  }
  return `Free accounts can track ${limit} case. Upgrade to Pro to track up to ${CASE_TRACKING_LIMITS.pro} cases.`;
}
