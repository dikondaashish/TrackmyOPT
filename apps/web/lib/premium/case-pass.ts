/**
 * Case Pass: one payment for Pro access over a fixed term, with no renewal.
 *
 * The purchase lives in `payment_transactions` (plan_id `case_pass`) and the
 * access in the usual profile fields. Subscription code revokes access when
 * Stripe has no active subscription, so every such path asks this module
 * first and restores the pass instead of revoking while its term runs.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { CASE_PASS } from '@/lib/pricing/plan-config';

export const CASE_PASS_PURCHASE_TYPE = 'case_pass';
export const CASE_PASS_PLAN_ID = 'case_pass';
export const CASE_PASS_PRICE_CENTS = Math.round(CASE_PASS.price * 100);

const DAY_MS = 24 * 60 * 60 * 1000;

type CheckoutSessionLike = {
  metadata?: Record<string, string> | null;
  created?: number | null;
};

export function isCasePassCheckout(session: CheckoutSessionLike): boolean {
  return session.metadata?.purchase_type === CASE_PASS_PURCHASE_TYPE;
}

/** The term runs from the purchase, so webhook retries land on the same date. */
export function casePassExpiryFrom(purchasedAtMs: number): Date {
  return new Date(purchasedAtMs + CASE_PASS.durationDays * DAY_MS);
}

/** `payment_transactions.created_at` has no time zone; it is stored in UTC. */
function parseStoredUtc(value: string): number {
  return Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
}

/**
 * End of the account's running Case Pass, or null when it has none. A
 * refunded pass has status `refunded` and does not count.
 */
export async function getActiveCasePassExpiry(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<Date | null> {
  const since = new Date(
    now.getTime() - CASE_PASS.durationDays * DAY_MS
  ).toISOString();
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('created_at')
    .eq('user_id', userId)
    .eq('plan_id', CASE_PASS_PLAN_ID)
    .eq('status', 'succeeded')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1);
  // Fail towards keeping paid access: a lookup error must not look like "no pass".
  if (error) throw new Error('Case Pass lookup failed');
  const createdAt = data?.[0]?.created_at as string | undefined;
  if (!createdAt) return null;
  const purchasedAt = parseStoredUtc(createdAt);
  if (!Number.isFinite(purchasedAt)) return null;
  const expiry = casePassExpiryFrom(purchasedAt);
  return expiry.getTime() > now.getTime() ? expiry : null;
}

/**
 * Put a running Case Pass back on the profile. Returns the pass end date, or
 * null when the account has no running pass and nothing was changed.
 */
export async function restoreCasePassAccess(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<Date | null> {
  const expiry = await getActiveCasePassExpiry(supabase, userId, now);
  if (!expiry) return null;
  const { error } = await supabase
    .from('profiles')
    .update({
      premium_status: true,
      plan_tier: 'pro',
      subscription_expires_at: expiry.toISOString(),
    })
    .eq('user_id', userId);
  if (error) throw new Error('Case Pass access restore failed');
  return expiry;
}
