/**
 * Dedicated is open for new purchases.
 *
 * Phase 6 closed it because the attorney benefit was being marketed without a
 * delivery path. That path now exists: Dedicated subscribers email TrackMyOPT,
 * we reply with available attorney appointment slots, and the subscriber books
 * one directly. Public copy in /disclaimer and /refund-policy describes exactly
 * that flow and no more.
 *
 * If attorney scheduling ever stops being delivered, set this back to false —
 * selling the plan without it is what the Phase 6 closure was avoiding.
 */
export const DEDICATED_OPEN_FOR_NEW_PURCHASES = true;

export function isDedicatedOpenForNewPurchases(): boolean {
  return DEDICATED_OPEN_FOR_NEW_PURCHASES;
}
