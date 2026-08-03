import type { SupabaseClient } from "@supabase/supabase-js";

/** PostHog group type for B2B2C university / campus partner attribution. */
export const UNIVERSITY_PARTNER_GROUP_TYPE = "university_partner";

type UniversityPartnerRecord = {
  code: string;
  name: string;
  clicks: number;
  signups: number;
  premiumConversions: number;
  isActive: boolean;
};

export type UniversityPartnerGroupProperties = {
  partner_name: string;
  referral_clicks: number;
  referral_signups: number;
  premium_conversions: number;
  is_active: boolean;
};

export function normalizePartnerGroupKey(code: string): string {
  return code.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase().slice(0, 50);
}

export function toPartnerGroupProperties(
  partner: UniversityPartnerRecord
): UniversityPartnerGroupProperties {
  return {
    partner_name: partner.name,
    referral_clicks: partner.clicks,
    referral_signups: partner.signups,
    premium_conversions: partner.premiumConversions,
    is_active: partner.isActive,
  };
}

export async function fetchUniversityPartnerByCode(
  supabase: SupabaseClient,
  code: string
): Promise<UniversityPartnerRecord | null> {
  const normalized = normalizePartnerGroupKey(code);
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("referrals")
    .select("code, name, clicks, signups, premium_conversions, is_active")
    .eq("code", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    code: data.code,
    name: data.name,
    clicks: data.clicks ?? 0,
    signups: data.signups ?? 0,
    premiumConversions: data.premium_conversions ?? 0,
    isActive: data.is_active ?? true,
  };
}

export async function listActiveUniversityPartners(
  supabase: SupabaseClient,
  options?: { limit?: number }
): Promise<UniversityPartnerRecord[]> {
  const limit = options?.limit ?? 100;

  const { data, error } = await supabase
    .from("referrals")
    .select("code, name, clicks, signups, premium_conversions, is_active")
    .eq("is_active", true)
    .order("code")
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    code: row.code,
    name: row.name,
    clicks: row.clicks ?? 0,
    signups: row.signups ?? 0,
    premiumConversions: row.premium_conversions ?? 0,
    isActive: row.is_active ?? true,
  }));
}
