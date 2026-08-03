import type { SupabaseClient } from "@supabase/supabase-js";
import { identifyServerUser } from "@/lib/posthog-server";

type UserLtvSnapshot = {
  userId: string;
  lifetimeRevenueCents: number;
  lifetimePaymentCount: number;
  firstPaymentDate: string | null;
  lastPaymentDate: string | null;
  currency: string;
};

export const LTV_SYNC_DEFAULT_BATCH = 50;

function toDateOnly(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

/** Aggregate succeeded payments for one user from Supabase. */
async function computeUserLtv(
  supabase: SupabaseClient,
  userId: string
): Promise<UserLtvSnapshot | null> {
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("amount, currency, created_at")
    .eq("user_id", userId)
    .eq("status", "succeeded")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  if (rows.length === 0) return null;

  let lifetimeRevenueCents = 0;
  for (const row of rows) {
    lifetimeRevenueCents += Number(row.amount) || 0;
  }

  const firstPaymentDate = toDateOnly(rows[0]?.created_at);
  const lastPaymentDate = toDateOnly(rows[rows.length - 1]?.created_at);
  const currency = (rows[rows.length - 1]?.currency ?? "usd").toLowerCase();

  return {
    userId,
    lifetimeRevenueCents,
    lifetimePaymentCount: rows.length,
    firstPaymentDate,
    lastPaymentDate,
    currency,
  };
}

/** Push LTV person properties to PostHog (no PII). */
export async function syncUserLtvToPostHog(
  supabase: SupabaseClient,
  userId: string
): Promise<UserLtvSnapshot | null> {
  const snapshot = await computeUserLtv(supabase, userId);
  if (!snapshot) return null;

  await identifyServerUser(userId, {
    lifetime_revenue_cents: snapshot.lifetimeRevenueCents,
    lifetime_payment_count: snapshot.lifetimePaymentCount,
    first_payment_date: snapshot.firstPaymentDate,
    last_payment_date: snapshot.lastPaymentDate,
    ltv_currency: snapshot.currency,
  });

  return snapshot;
}

/**
 * Batch LTV sync for users with at least one succeeded payment.
 * Ordered by user_id for stable pagination across cron runs.
 */
export async function findLtvSyncCandidates(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<string[]> {
  const limit = options?.limit ?? LTV_SYNC_DEFAULT_BATCH;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("payment_transactions")
    .select("user_id")
    .eq("status", "succeeded");

  if (error) {
    throw new Error(error.message);
  }

  const unique = [...new Set((data ?? []).map((row) => row.user_id))].sort();
  return unique.slice(offset, offset + limit);
}

export async function syncLtvBatch(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<{ synced: number; skipped: number }> {
  let synced = 0;
  let skipped = 0;

  for (const userId of userIds) {
    const snapshot = await syncUserLtvToPostHog(supabase, userId);
    if (snapshot) synced += 1;
    else skipped += 1;
  }

  return { synced, skipped };
}
