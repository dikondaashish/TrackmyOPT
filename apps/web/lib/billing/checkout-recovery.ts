import type { SupabaseClient } from "@supabase/supabase-js";
import { isDedicatedOpenForNewPurchases } from "@/lib/pricing/dedicated-availability";

/** Pending checkout must be at least this old before we nudge (avoid interrupting active sessions). */
export const CHECKOUT_RECOVERY_MIN_AGE_MS = 2 * 60 * 60 * 1000;

/** Stop nudging abandoners older than this (stale intent). */
export const CHECKOUT_RECOVERY_MAX_AGE_MS = 72 * 60 * 60 * 1000;

type CheckoutAbandoner = {
  userId: string;
  email: string;
  firstName: string | null;
  planId: string | null;
  billingInterval: "month" | "year" | null;
  stripeCheckoutSessionId: string;
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
 * Prefer an open Stripe Checkout session URL; otherwise a fresh checkout deep link.
 * Pure helper so cron + tests don't need live Stripe.
 */
export function resolveCheckoutResumeUrl(args: {
  appBaseUrl: string;
  planId: string | null;
  billingInterval: "month" | "year" | null;
  stripeSession?: { status: string | null; url: string | null } | null;
}): { url: string; kind: "open_session" | "fresh_checkout" } {
  const base = args.appBaseUrl.replace(/\/$/, "");
  if (
    args.stripeSession?.status === "open" &&
    typeof args.stripeSession.url === "string" &&
    args.stripeSession.url.startsWith("https://")
  ) {
    return { url: args.stripeSession.url, kind: "open_session" };
  }

  const plan =
    args.planId === "dedicated" && isDedicatedOpenForNewPurchases()
      ? "dedicated"
      : "pro";
  const interval = args.billingInterval === "month" ? "month" : "year";
  return {
    url: `${base}/premium/checkout?planId=${plan}&interval=${interval}`,
    kind: "fresh_checkout",
  };
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
  const latestByUser = new Map<
    string,
    { created_at: string; stripe_checkout_session_id: string }
  >();
  for (const row of pendingRows) {
    const sid = row.stripe_checkout_session_id;
    if (typeof sid !== "string" || !sid) continue;
    const existing = latestByUser.get(row.user_id);
    if (!existing || row.created_at > existing.created_at) {
      latestByUser.set(row.user_id, {
        created_at: row.created_at,
        stripe_checkout_session_id: sid,
      });
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
    .select("user_id, plan_id, billing_interval, created_at")
    .in("user_id", userIds)
    .eq("event_type", "checkout_recurring_consent")
    .gte("created_at", minCreatedAt)
    .order("created_at", { ascending: false });

  const latestConsent = new Map<
    string,
    { planId: string | null; interval: "month" | "year" | null }
  >();
  for (const c of consents || []) {
    if (!latestConsent.has(c.user_id)) {
      const interval =
        c.billing_interval === "month" || c.billing_interval === "year"
          ? c.billing_interval
          : null;
      latestConsent.set(c.user_id, {
        planId: typeof c.plan_id === "string" ? c.plan_id : null,
        interval,
      });
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
    if (!latestConsent.has(userId)) continue;

    const latest = latestByUser.get(userId)!;
    const consent = latestConsent.get(userId)!;

    abandoners.push({
      userId,
      email,
      firstName: profile.first_name ?? null,
      planId: consent.planId ?? profile.plan_tier ?? null,
      billingInterval: consent.interval,
      stripeCheckoutSessionId: latest.stripe_checkout_session_id,
      sessionCreatedAt: latest.created_at,
      hoursSinceCheckout: hoursSince(latest.created_at, now),
    });
  }

  return abandoners;
}
