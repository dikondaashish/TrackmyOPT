import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_RECEIPT_REENGAGEMENT_EMAIL_TYPE = "free_receipt_reengagement";

/** Max sends per invocation — drain the list across manual runs without hammering SMTP. */
export const FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH = 25;

type FreeReceiptReengagementCandidate = {
  userId: string;
  email: string;
  firstName: string | null;
  planTier: string | null;
};

/**
 * Free users with a saved USCIS receipt, no completed payment, and no prior
 * free_receipt_reengagement email.
 */
export async function findFreeReceiptReengagementCandidates(
  supabase: SupabaseClient,
  options?: { limit?: number }
): Promise<FreeReceiptReengagementCandidate[]> {
  const limit = options?.limit ?? FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH;

  const { data: caseRows, error: caseErr } = await supabase
    .from("case_status")
    .select("user_id")
    .not("receipt_number", "is", null);

  if (caseErr) {
    throw new Error(caseErr.message);
  }

  const receiptUserIds = [...new Set((caseRows || []).map((r) => r.user_id))];
  if (receiptUserIds.length === 0) return [];

  const [{ data: profiles }, { data: succeeded }, { data: alreadySent }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, email, first_name, premium_status, plan_tier")
        .in("user_id", receiptUserIds),
      supabase
        .from("payment_transactions")
        .select("user_id")
        .in("user_id", receiptUserIds)
        .eq("status", "succeeded"),
      supabase
        .from("email_queue")
        .select("user_id")
        .in("user_id", receiptUserIds)
        .eq("email_type", FREE_RECEIPT_REENGAGEMENT_EMAIL_TYPE),
    ]);

  const succeededSet = new Set((succeeded || []).map((r) => r.user_id));
  const sentSet = new Set((alreadySent || []).map((r) => r.user_id));

  const candidates: FreeReceiptReengagementCandidate[] = [];

  for (const profile of profiles || []) {
    if (profile.premium_status === true) continue;
    if (succeededSet.has(profile.user_id)) continue;
    if (sentSet.has(profile.user_id)) continue;

    const email = profile.email?.trim();
    if (!email) continue;

    candidates.push({
      userId: profile.user_id,
      email,
      firstName: profile.first_name ?? null,
      planTier: profile.plan_tier ?? null,
    });
  }

  candidates.sort((a, b) => a.userId.localeCompare(b.userId));

  return candidates.slice(0, Math.max(1, limit));
}
