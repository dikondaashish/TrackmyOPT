"use client";

import { useEffect, useRef } from "react";
import { captureDashboardViewed } from "@/lib/posthog-client";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { isPendingStatus } from "@/lib/posthog/uscis-status-category";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { supabase } from "@/lib/supabaseClient";

function resolvePlanTier(isPremium: boolean | null, planName: string | null): string {
  if (isPremium !== true) return "free";
  const normalized = (planName ?? "").toLowerCase();
  if (normalized === "dedicated") return "dedicated";
  if (normalized === "pro") return "pro";
  return normalized || "pro";
}

/** Fires `dashboard_viewed` once per dashboard mount. */
export function DashboardViewTracker() {
  const premium = usePremiumStatus();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || premium.isLoading) return;

    const trackDashboardView = () => {
      if (trackedRef.current || !hasAnalyticsConsent()) return;
      trackedRef.current = true;

      (async () => {
      let hasReceipt = false;
      let hasStatus = false;
      let isPending = false;
      let onboardingCompleted = false;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .maybeSingle();
          onboardingCompleted = profile?.onboarding_completed === true;
        }
      } catch {
        /* non-blocking */
      }

      try {
        const response = await fetch("/api/case-status", { credentials: "include" });
        if (response.ok) {
          const payload = await response.json();
          const caseData = payload?.data;
          hasReceipt = Boolean(caseData?.receipt_number);
          hasStatus = Boolean(caseData?.current_status);
          isPending = isPendingStatus(caseData?.current_status);
        }
      } catch {
        /* non-blocking */
      }

      captureDashboardViewed({
        has_receipt: hasReceipt,
        has_status: hasStatus,
        is_pending: isPending,
        plan_tier: resolvePlanTier(premium.isPremium, premium.planName),
        premium_status: premium.isPremium === true,
        onboarding_completed: onboardingCompleted,
      });
      })();
    };

    trackDashboardView();

    const onConsentChange = (event: Event) => {
      const accepted = (event as CustomEvent<{ accepted: boolean }>).detail?.accepted;
      if (accepted) trackDashboardView();
    };

    window.addEventListener("trackmyopt:analytics-consent", onConsentChange);
    return () => {
      window.removeEventListener("trackmyopt:analytics-consent", onConsentChange);
    };
  }, [premium.isLoading, premium.isPremium, premium.planName]);

  return null;
}
