import type { SupabaseClient } from "@supabase/supabase-js";

export const D1_ACTIVATION_NUDGE_EMAIL_TYPE = "d1_activation_nudge";

/** Hours after onboarding before sending D1 nudge (if no dashboard view). */
export const D1_ACTIVATION_NUDGE_DELAY_HOURS = 24;

export const D1_ACTIVATION_NUDGE_DEFAULT_BATCH = 50;

export type D1ActivationNudgeCandidate = {
  userId: string;
  email: string;
  firstName: string | null;
  hasCaseStatus: boolean;
  caseStatusText: string | null;
  optDaysRemaining: number | null;
  optHeadline: string | null;
};

/**
 * Users who finished onboarding ≥24h ago, never opened the dashboard,
 * and have not received a D1 nudge.
 */
export async function findD1ActivationNudgeCandidates(
  supabase: SupabaseClient,
  options?: { limit?: number }
): Promise<D1ActivationNudgeCandidate[]> {
  const limit = options?.limit ?? D1_ACTIVATION_NUDGE_DEFAULT_BATCH;
  const cutoff = new Date(
    Date.now() - D1_ACTIVATION_NUDGE_DELAY_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select(
      "user_id, email, first_name, premium_status, onboarding_completed_at, first_dashboard_viewed_at"
    )
    .eq("onboarding_completed", true)
    .is("first_dashboard_viewed_at", null)
    .not("onboarding_completed_at", "is", null)
    .lte("onboarding_completed_at", cutoff)
    .eq("premium_status", false)
    .order("onboarding_completed_at", { ascending: true })
    .limit(Math.max(limit * 3, limit));

  if (profileErr) {
    throw new Error(profileErr.message);
  }

  if (!profiles?.length) return [];

  const userIds = profiles.map((p) => p.user_id);

  const [{ data: alreadySent }, { data: caseRows }, { data: optRows }] =
    await Promise.all([
      supabase
        .from("email_queue")
        .select("user_id")
        .in("user_id", userIds)
        .eq("email_type", D1_ACTIVATION_NUDGE_EMAIL_TYPE)
        .in("status", ["sent", "pending"]),
      supabase
        .from("case_status")
        .select("user_id, current_status")
        .in("user_id", userIds),
      supabase
        .from("opt_status")
        .select("user_id, opt_ead_end_date, opt_start_date")
        .in("user_id", userIds),
    ]);

  const sentSet = new Set((alreadySent || []).map((r) => r.user_id));
  const caseByUser = new Map(
    (caseRows || []).map((r) => [r.user_id, r.current_status as string | null])
  );
  const optByUser = new Map(
    (optRows || []).map((r) => [
      r.user_id,
      {
        opt_ead_end_date: r.opt_ead_end_date as string | null,
        opt_start_date: r.opt_start_date as string | null,
      },
    ])
  );

  const candidates: D1ActivationNudgeCandidate[] = [];

  for (const profile of profiles) {
    if (sentSet.has(profile.user_id)) continue;
    const email = profile.email?.trim();
    if (!email) continue;

    const caseStatus = caseByUser.get(profile.user_id) ?? null;
    const opt = optByUser.get(profile.user_id);
    let optDaysRemaining: number | null = null;
    let optHeadline: string | null = null;

    if (opt?.opt_ead_end_date) {
      const end = new Date(opt.opt_ead_end_date);
      if (!Number.isNaN(end.getTime())) {
        optDaysRemaining = Math.max(
          0,
          Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        );
        optHeadline = `${optDaysRemaining} day${optDaysRemaining === 1 ? "" : "s"} left on your OPT clock`;
      }
    }

    candidates.push({
      userId: profile.user_id,
      email,
      firstName: profile.first_name ?? null,
      hasCaseStatus: Boolean(caseStatus),
      caseStatusText: caseStatus,
      optDaysRemaining,
      optHeadline,
    });
  }

  candidates.sort((a, b) => a.userId.localeCompare(b.userId));
  return candidates.slice(0, Math.max(1, limit));
}
