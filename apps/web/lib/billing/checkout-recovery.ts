import type { SupabaseClient } from "@supabase/supabase-js";

/** Pending checkout must be at least this old before we nudge (avoid interrupting active sessions). */
export const CHECKOUT_RECOVERY_MIN_AGE_MS = 2 * 60 * 60 * 1000;

/** Stop nudging abandoners older than this (stale intent). */
export const CHECKOUT_RECOVERY_MAX_AGE_MS = 72 * 60 * 60 * 1000;

export type CheckoutAbandoner = {
  userId: string;
  email: string;
  firstName: string | null;
  planId: string | null;
  sessionCreatedAt: string;
  hoursSinceCheckout: number;
};

export function getCheckoutRecoveryWindowBounds(now = Date.now()): {
  minCreatedAt: string;
  maxCreatedAt: string;
} {
  return {
    minCreatedAt: new Date(now - CHECKOUT_RECOVERY_MAX_AGE_MS).toISOString(),
    maxCreatedAt: new Date(now - CHECKOUT_RECOVERY_MIN_AGE_MS).toISOString(),
  };
}

function hoursSince(iso: string, now = Date.now()): number {
  const ms = now - new Date(iso).getTime();
  return Math.max(0, Math.round(ms / (60 * 60 * 1000)));
}

/**
 * Free users with a pending Stripe checkout session (2–72h old), no completed payment,
 * and no prior checkout recovery email.
 */
export async function findCheckoutAbandoners(
  supabase: SupabaseClient,
  now = Date.now()
): Promise<CheckoutAbandoner[]> {
  const { minCreatedAt, maxCreatedAt } = getCheckoutRecoveryWindowBounds(now);

  const { data: pendingRows, error: pendingErr } = await supabase
    .from("payment_transactions")
    .select("user_id, created_at, stripe_checkout_session_id")
    .eq("status", "pending")
    .not("stripe_checkout_session_id", "is", null)
    .gte("created_at", minCreatedAt)
    .lte("created_at", maxCreatedAt);

  if (pendingErr) {
    throw new Error(pendingErr.message);
  }

  if (!pendingRows?.length) return [];

  // Latest pending session per user in the window
  const latestByUser = new Map<string, { created_at: string }>();
  for (const row of pendingRows) {
    const existing = latestByUser.get(row.user_id);
    if (!existing || row.created_at > existing.created_at) {
      latestByUser.set(row.user_id, { created_at: row.created_at });
    }
  }

  const userIds = [...latestByUser.keys()];
  if (userIds.length === 0) return [];

  const [{ data: profiles }, { data: succeeded }, { data: recoverySent }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, email, first_name, premium_status, plan_tier")
        .in("user_id", userIds),
      supabase
        .from("payment_transactions")
        .select("user_id")
        .in("user_id", userIds)
        .eq("status", "succeeded"),
      supabase
        .from("email_queue")
        .select("user_id")
        .in("user_id", userIds)
        .eq("email_type", "checkout_recovery"),
    ]);

  const succeededSet = new Set((succeeded || []).map((r) => r.user_id));
  const recoverySentSet = new Set((recoverySent || []).map((r) => r.user_id));

  const { data: consents } = await supabase
    .from("billing_consent_events")
    .select("user_id, plan_id, created_at")
    .in("user_id", userIds)
    .eq("event_type", "checkout_recurring_consent")
    .gte("created_at", minCreatedAt)
    .order("created_at", { ascending: false });

  const latestConsentPlan = new Map<string, string | null>();
  for (const c of consents || []) {
    if (!latestConsentPlan.has(c.user_id)) {
      latestConsentPlan.set(c.user_id, c.plan_id);
    }
  }

  const profileByUser = new Map((profiles || []).map((p) => [p.user_id, p]));
  const abandoners: CheckoutAbandoner[] = [];

  for (const userId of userIds) {
    if (succeededSet.has(userId) || recoverySentSet.has(userId)) continue;

    const profile = profileByUser.get(userId);
    if (!profile || profile.premium_status === true) continue;

    const email = profile.email?.trim();
    if (!email) continue;

    // Require a checkout consent event in the recovery window
    if (!latestConsentPlan.has(userId)) continue;

    const sessionCreatedAt = latestByUser.get(userId)!.created_at;

    abandoners.push({
      userId,
      email,
      firstName: profile.first_name ?? null,
      planId: latestConsentPlan.get(userId) ?? profile.plan_tier ?? null,
      sessionCreatedAt,
      hoursSinceCheckout: hoursSince(sessionCreatedAt, now),
    });
  }

  return abandoners;
}
