import type { SupabaseClient } from "@supabase/supabase-js";

type PolicyVersionRow = {
  policy_type: string;
  current_version: string;
  requires_consent: boolean;
  change_summary: string | null;
  effective_date: string | null;
};

type PolicyConsentRow = {
  policy_type: string;
  policy_version: string;
};

type PolicyNeedingConsent = {
  type: string;
  version: string;
  changeSummary: string | null;
  effectiveDate: string | null;
};

export function getPoliciesNeedingConsent(
  policyVersions: PolicyVersionRow[],
  userConsents: PolicyConsentRow[]
): PolicyNeedingConsent[] {
  return policyVersions
    .filter((policy) => policy.requires_consent)
    .filter((policy) => {
      const hasConsented = userConsents.some(
        (consent) =>
          consent.policy_type === policy.policy_type &&
          consent.policy_version === policy.current_version
      );
      return !hasConsented;
    })
    .map((policy) => ({
      type: policy.policy_type,
      version: policy.current_version,
      changeSummary: policy.change_summary,
      effectiveDate: policy.effective_date,
    }));
}

export async function recordPolicyConsentsBatch(args: {
  supabase: SupabaseClient;
  userId: string;
  policies: Array<{ policyType: string; policyVersion: string }>;
  consentMethod: "checkbox" | "modal" | "banner_click" | "checkout_checkbox";
  ipAddress: string;
  userAgent: string;
}): Promise<{ ok: boolean; recorded: number; errors: string[] }> {
  const { supabase, userId, policies, consentMethod, ipAddress, userAgent } = args;
  const errors: string[] = [];
  let recorded = 0;
  const consentedAt = new Date().toISOString();

  for (const policy of policies) {
    const { error } = await supabase.from("policy_consents").upsert(
      {
        user_id: userId,
        policy_type: policy.policyType,
        policy_version: policy.policyVersion,
        consent_method: consentMethod,
        ip_address: ipAddress,
        user_agent: userAgent,
        consented_at: consentedAt,
      },
      { onConflict: "user_id,policy_type,policy_version" }
    );

    if (error) {
      errors.push(`${policy.policyType}: ${error.message}`);
    } else {
      recorded += 1;
    }
  }

  return { ok: errors.length === 0, recorded, errors };
}

export const POLICY_CONSENT_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Security", href: "/security" },
] as const;
