/**
 * Phase 6: Dedicated is grandfathered for existing subscribers but closed to new sales.
 * Flip to true only if attorney/priority delivery is real and marketed honestly again.
 */
export const DEDICATED_OPEN_FOR_NEW_PURCHASES = false;

export function isDedicatedOpenForNewPurchases(): boolean {
  return DEDICATED_OPEN_FOR_NEW_PURCHASES;
}
