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

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, is_stem_eligible")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      identifyTrackMyOptUser(user.id, {
        plan_tier: resolvePlanTier(premium.isPremium, premium.planName),
        premium_status: premium.isPremium === true,
        onboarding_completed: profile?.onboarding_completed === true,
        is_stem_eligible: profile?.is_stem_eligible === true,
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
