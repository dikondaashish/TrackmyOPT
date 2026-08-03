import type { SupabaseClient } from "@supabase/supabase-js";

const AT_RISK_REENGAGEMENT_EMAIL_TYPE = "at_risk_reengagement";

/** Max sends per invocation — drain across weekly cron runs. */
export const AT_RISK_REENGAGEMENT_DEFAULT_BATCH = 25;

/** Mirrors PostHog cohort 396175: signed up in 90d, no activity in 14d. */
const AT_RISK_SIGNUP_WINDOW_DAYS = 90;
const AT_RISK_INACTIVITY_DAYS = 14;

type AtRiskReengagementCandidate = {
  userId: string;
  email: string;
  firstName: string | null;
  planTier: string | null;
};

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const PROFILE_LOOKUP_CHUNK = 50;

type ProfileRow = {
  user_id: string;
  email: string | null;
  first_name: string | null;
  plan_tier: string | null;
};

async function fetchProfilesByUserIds(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, ProfileRow>> {
  const profileById = new Map<string, ProfileRow>();
  if (userIds.length === 0) return profileById;

  for (let i = 0; i < userIds.length; i += PROFILE_LOOKUP_CHUNK) {
    const chunk = userIds.slice(i, i + PROFILE_LOOKUP_CHUNK);
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id, email, first_name, plan_tier")
      .in("user_id", chunk);

    if (profileErr) {
      throw new Error(profileErr.message);
    }

    for (const profile of profiles || []) {
      profileById.set(profile.user_id, profile);
    }
  }

  return profileById;
}

/**
 * Free and paid users who signed up in the last 90 days and have not signed in
 * (or had any session activity) in the last 14 days. Excludes users already
 * emailed via at_risk_reengagement.
 */
export async function findAtRiskReengagementCandidates(
  supabase: SupabaseClient,
  options?: { limit?: number }
): Promise<AtRiskReengagementCandidate[]> {
  const limit = options?.limit ?? AT_RISK_REENGAGEMENT_DEFAULT_BATCH;
  const signupCutoffMs = Date.now() - AT_RISK_SIGNUP_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const inactivityCutoffMs = Date.now() - AT_RISK_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

  const { data: alreadySent, error: sentErr } = await supabase
    .from("email_queue")
    .select("user_id")
    .eq("email_type", AT_RISK_REENGAGEMENT_EMAIL_TYPE);

  if (sentErr) {
    throw new Error(sentErr.message);
  }

  const sentSet = new Set((alreadySent || []).map((row) => row.user_id));

  const candidates: AtRiskReengagementCandidate[] = [];
  let page = 1;
  const perPage = 1000;

  while (candidates.length < limit) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }

    const users = data.users ?? [];
    if (users.length === 0) break;

    const eligibleIds: string[] = [];
    for (const user of users) {
      if (!user.email?.trim() || user.deleted_at) continue;
      if (sentSet.has(user.id)) continue;

      const createdMs = new Date(user.created_at).getTime();
      if (createdMs < signupCutoffMs) continue;

      const lastActiveMs = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).getTime()
        : createdMs;
      if (lastActiveMs >= inactivityCutoffMs) continue;

      eligibleIds.push(user.id);
    }

    if (eligibleIds.length > 0) {
      const profileById = await fetchProfilesByUserIds(supabase, eligibleIds);

      for (const userId of eligibleIds) {
        const authUser = users.find((u) => u.id === userId);
        if (!authUser?.email?.trim()) continue;

        const profile = profileById.get(userId);
        candidates.push({
          userId,
          email: profile?.email?.trim() || authUser.email.trim(),
          firstName: profile?.first_name ?? null,
          planTier: profile?.plan_tier ?? null,
        });

        if (candidates.length >= limit) break;
      }
    }

    if (candidates.length >= limit) break;
    if (users.length < perPage) break;
    page += 1;
  }

  candidates.sort((a, b) => a.userId.localeCompare(b.userId));
  return candidates.slice(0, limit);
}

/** Dry-run helper for cron reporting without listing all auth users. */
export async function countAtRiskReengagementEligible(
  supabase: SupabaseClient
): Promise<number> {
  const rows = await findAtRiskReengagementCandidates(supabase, {
    limit: AT_RISK_REENGAGEMENT_DEFAULT_BATCH,
  });
  return rows.length;
}

export function atRiskReengagementCutoffs(): {
  signupSinceIso: string;
  inactiveBeforeIso: string;
} {
  return {
    signupSinceIso: daysAgoIso(AT_RISK_SIGNUP_WINDOW_DAYS),
    inactiveBeforeIso: daysAgoIso(AT_RISK_INACTIVITY_DAYS),
  };
}
