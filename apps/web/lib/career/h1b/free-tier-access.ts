import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";

export function isPremiumH1bProfile(profile: {
  premium_status?: boolean | null;
  plan_tier?: string | null;
} | null): boolean {
  return profile?.premium_status === true;
}

/** Top-N sponsor ids by approval volume (matches list API ordering). */
async function fetchFreeTierSponsorIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("h1b_sponsors")
    .select("id")
    .order("total_approvals", { ascending: false })
    .limit(FREE_H1B_SPONSOR_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((row) => String(row.id)));
}

export async function isSponsorInFreeTier(
  supabase: SupabaseClient,
  sponsorId: string
): Promise<boolean> {
  const allowed = await fetchFreeTierSponsorIds(supabase);
  return allowed.has(sponsorId);
}
