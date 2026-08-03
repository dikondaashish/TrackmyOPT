import type { SupabaseClient } from "@supabase/supabase-js";

const WELCOME_FREE_RESEND_EMAIL_TYPE = "welcome_free_resend";

/** Max sends per invocation — drain across manual runs without hammering SMTP. */
export const WELCOME_FREE_RESEND_DEFAULT_BATCH = 25;

type WelcomeFreeResendCandidate = {
  userId: string;
  email: string;
  firstName: string | null;
  planTier: string | null;
};

type FailedWelcomeRow = {
  user_id: string;
  email_address: string;
  created_at: string | null;
};

/**
 * Distinct users with a failed welcome_free (SMTP 535), no successful welcome_free,
 * and no prior welcome_free_resend. Excludes current Pro users.
 *
 * Email address comes from the failed queue row (profiles.email is often unset).
 */
export async function findWelcomeFreeResendCandidates(
  supabase: SupabaseClient,
  options?: { limit?: number }
): Promise<WelcomeFreeResendCandidate[]> {
  const all = await loadWelcomeFreeResendPool(supabase);
  const limit = options?.limit ?? WELCOME_FREE_RESEND_DEFAULT_BATCH;
  return all.slice(0, Math.max(1, limit));
}

/** Full eligible pool size (for dry-run reporting before draining). */
export async function countWelcomeFreeResendEligible(
  supabase: SupabaseClient
): Promise<number> {
  const all = await loadWelcomeFreeResendPool(supabase);
  return all.length;
}

async function loadWelcomeFreeResendPool(
  supabase: SupabaseClient
): Promise<WelcomeFreeResendCandidate[]> {
  const [{ data: failedRows, error: failedErr }, { data: sentRows }, { data: resentRows }] =
    await Promise.all([
      supabase
        .from("email_queue")
        .select("user_id, email_address, created_at")
        .eq("email_type", "welcome_free")
        .eq("status", "failed")
        .ilike("error_message", "%535%")
        .not("user_id", "is", null),
      supabase
        .from("email_queue")
        .select("user_id")
        .eq("email_type", "welcome_free")
        .eq("status", "sent")
        .not("user_id", "is", null),
      supabase
        .from("email_queue")
        .select("user_id")
        .eq("email_type", WELCOME_FREE_RESEND_EMAIL_TYPE)
        .not("user_id", "is", null),
    ]);

  if (failedErr) {
    throw new Error(failedErr.message);
  }

  const sentSet = new Set((sentRows || []).map((r) => r.user_id));
  const resentSet = new Set((resentRows || []).map((r) => r.user_id));

  const latestFailedByUser = new Map<string, FailedWelcomeRow>();
  for (const row of failedRows || []) {
    if (!row.user_id) continue;
    if (sentSet.has(row.user_id) || resentSet.has(row.user_id)) continue;

    const email = row.email_address?.trim();
    if (!email) continue;

    const existing = latestFailedByUser.get(row.user_id);
    if (
      !existing ||
      (row.created_at &&
        (!existing.created_at || row.created_at > existing.created_at))
    ) {
      latestFailedByUser.set(row.user_id, {
        user_id: row.user_id,
        email_address: email,
        created_at: row.created_at,
      });
    }
  }

  const userIds = [...latestFailedByUser.keys()];
  if (userIds.length === 0) return [];

  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("user_id, first_name, premium_status, plan_tier")
    .in("user_id", userIds);

  if (profileErr) {
    throw new Error(profileErr.message);
  }

  const profileByUser = new Map((profiles || []).map((p) => [p.user_id, p]));
  const candidates: WelcomeFreeResendCandidate[] = [];

  for (const userId of userIds) {
    const profile = profileByUser.get(userId);
    if (profile?.premium_status === true) continue;

    const failed = latestFailedByUser.get(userId)!;
    candidates.push({
      userId,
      email: failed.email_address,
      firstName: profile?.first_name ?? null,
      planTier: profile?.plan_tier ?? null,
    });
  }

  candidates.sort((a, b) => a.userId.localeCompare(b.userId));
  return candidates;
}
