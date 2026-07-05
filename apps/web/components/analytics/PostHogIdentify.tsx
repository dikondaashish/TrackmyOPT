"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { identifyTrackMyOptUser } from "@/lib/posthog-client";
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

function resolveActivationState(input: {
  onboardingCompleted: boolean;
  hasReceipt: boolean;
  hasStatus: boolean;
}): string {
  if (!input.onboardingCompleted) return "onboarding_incomplete";
  if (!input.hasReceipt) return "no_receipt";
  if (!input.hasStatus) return "receipt_pending_status";
  return "activated";
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
          .select("onboarding_completed, is_stem_eligible")
          .eq("user_id", user.id)
          .maybeSingle(),
        fetch("/api/case-status", { credentials: "include", cache: "no-store" }),
      ]);

      if (cancelled) return;

      let hasReceipt = false;
      let hasStatus = false;
      if (caseRes.ok) {
        const caseJson = await caseRes.json().catch(() => null);
        const cases: Array<{ receipt_number?: string; current_status?: string | null }> =
          caseJson?.cases?.length
            ? caseJson.cases
            : caseJson?.data
              ? [caseJson.data]
              : [];
        const primary =
          cases.find((c) => c.receipt_number) ?? cases[0] ?? null;
        hasReceipt = Boolean(primary?.receipt_number);
        hasStatus = Boolean(primary?.current_status);
      }

      const onboardingCompleted = profile?.onboarding_completed === true;

      identifyTrackMyOptUser(user.id, {
        plan_tier: resolvePlanTier(premium.isPremium, premium.planName),
        premium_status: premium.isPremium === true,
        onboarding_completed: onboardingCompleted,
        is_stem_eligible: profile?.is_stem_eligible === true,
        has_receipt: hasReceipt,
        activation_state: resolveActivationState({
          onboardingCompleted,
          hasReceipt,
          hasStatus,
        }),
        provider:
          typeof user.app_metadata?.provider === "string"
            ? user.app_metadata.provider
            : undefined,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [premium.isLoading, premium.isPremium, premium.planName]);

  return null;
}
