"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { identifyTrackMyOptUser, associateUniversityPartnerGroup } from "@/lib/posthog-client";
import { normalizePartnerGroupKey } from "@/lib/posthog/university-partner-groups";
import {
  hasSuccessfulCaseCheck,
  resolveActivationState,
} from "@/lib/posthog/activation";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

function resolvePlanTier(
  isPremium: boolean | null,
  planName: string | null
): string {
  if (isPremium !== true) return "free";
  const normalized = (planName ?? "").toLowerCase();
  if (normalized === "dedicated") return "dedicated";
  if (normalized === "pro") return "pro";
  return normalized || "pro";
}

/**
 * Merges anonymous PostHog sessions with the logged-in Supabase user id.
 * Mounted once inside the dashboard shell (includes premium checkout overlay).
 */
export function PostHogIdentify() {
  const premium = usePremiumStatus();

  useEffect(() => {
    if (premium.isLoading) return;

    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const [{ data: profile }, caseRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("onboarding_completed, is_stem_eligible, referred_by")
          .eq("user_id", user.id)
          .maybeSingle(),
        fetch("/api/case-status", { credentials: "include", cache: "no-store" }),
      ]);

      if (cancelled) return;

      let hasReceipt = false;
      let hasSuccessfulCheck = false;
      if (caseRes.ok) {
        const caseJson = await caseRes.json().catch(() => null);
        const cases: Array<{
          receipt_number?: string;
          current_status?: string | null;
          last_checked_at?: string | null;
        }> = caseJson?.cases?.length
          ? caseJson.cases
          : caseJson?.data
            ? [caseJson.data]
            : [];
        const primary =
          cases.find((c) => c.receipt_number) ?? cases[0] ?? null;
        hasReceipt = Boolean(primary?.receipt_number);
        hasSuccessfulCheck = hasSuccessfulCaseCheck(primary);
      }

      const onboardingCompleted = profile?.onboarding_completed === true;

      identifyTrackMyOptUser(user.id, {
        plan_tier: resolvePlanTier(premium.isPremium, premium.planName),
        premium_status: premium.isPremium === true,
        onboarding_completed: onboardingCompleted,
        is_stem_eligible: profile?.is_stem_eligible === true,
        has_receipt: hasReceipt,
        activation_state: resolveActivationState({
          hasReceipt,
          hasSuccessfulCheck,
        }),
        signup_date: user.created_at?.slice(0, 10),
        provider:
          typeof user.app_metadata?.provider === "string"
            ? user.app_metadata.provider
            : undefined,
        referred_by: profile?.referred_by ?? null,
      });

      const referralCode = profile?.referred_by
        ? normalizePartnerGroupKey(profile.referred_by)
        : "";
      if (referralCode) {
        associateUniversityPartnerGroup(referralCode, {
          partner_name: referralCode,
        });
        fetch("/api/analytics/partner-group", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode }),
        }).catch(() => undefined);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [premium.isLoading, premium.isPremium, premium.planName]);

  return null;
}
