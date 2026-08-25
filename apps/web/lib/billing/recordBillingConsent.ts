import { createClient } from "@supabase/supabase-js";
import type { BillingInterval, PaidPlanId } from "./legal-config";
import { buildCheckoutDisclosures, LEGAL_POLICY_VERSIONS } from "@/lib/legal/legal-config";

export type BillingConsentEventType =
  | "checkout_recurring_consent"
  | "subscription_cancel_initiated"
  | "policy_material_change_notice";

export interface RecordBillingConsentInput {
  userId: string;
  eventType: BillingConsentEventType;
  planId?: PaidPlanId;
  interval?: BillingInterval;
  includeProIntro?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeSubscriptionId?: string | null;
  metadata?: Record<string, unknown>;
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function recordBillingConsentEvent(
  input: RecordBillingConsentInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();
    const disclosures =
      input.planId && input.interval
        ? buildCheckoutDisclosures({
            planId: input.planId,
            interval: input.interval,
            includeProIntro: input.includeProIntro ?? false,
          })
        : null;

    const row = {
      user_id: input.userId,
      event_type: input.eventType,
      plan_id: input.planId ?? null,
      billing_interval: input.interval ?? null,
      terms_version: LEGAL_POLICY_VERSIONS.terms_of_service,
      refund_policy_version: LEGAL_POLICY_VERSIONS.refund_policy,
      subscription_terms_version: LEGAL_POLICY_VERSIONS.subscription_billing_terms,
      disclosures_json: disclosures,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      metadata: input.metadata ?? {},
    };

    const { error } = await supabase.from("billing_consent_events").insert(row);

    if (error) {
      console.error("[billing] consent event insert failed:", error.message);
      return { ok: false, error: error.message };
    }

    if (input.eventType === "checkout_recurring_consent") {
      await supabase.from("policy_consents").upsert(
        {
          user_id: input.userId,
          policy_type: "subscription_billing_terms",
          policy_version: LEGAL_POLICY_VERSIONS.subscription_billing_terms,
          consent_method: "checkout_checkbox",
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null,
          consented_at: new Date().toISOString(),
        },
        { onConflict: "user_id,policy_type,policy_version" }
      );
      await supabase.from("policy_consents").upsert(
        {
          user_id: input.userId,
          policy_type: "refund_policy",
          policy_version: LEGAL_POLICY_VERSIONS.refund_policy,
          consent_method: "checkout_checkbox",
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null,
          consented_at: new Date().toISOString(),
        },
        { onConflict: "user_id,policy_type,policy_version" }
      );
    }

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}
