"use client";

import { useEffect, useRef } from "react";
import { captureDashboardViewed, ANALYTICS_CONSENT_CHANGE_EVENT, isBrowserPostHogReady } from "@/lib/posthog-client";
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

async function markFirstDashboardViewed(): Promise<void> {
  try {
    await fetch("/api/profile/activity", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_dashboard_viewed: true }),
    });
  } catch {
    /* non-blocking */
  }
}

/** Fires `dashboard_viewed` once per dashboard mount. */
export function DashboardViewTracker() {
  const premium = usePremiumStatus();
  const trackedRef = useRef(false);
  const activityMarkedRef = useRef(false);

  useEffect(() => {
    if (premium.isLoading) return;

    const trackDashboardView = () => {
      if (trackedRef.current || !hasAnalyticsConsent() || !isBrowserPostHogReady()) return;

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

        if (!onboardingCompleted) return;

        if (!activityMarkedRef.current) {
          activityMarkedRef.current = true;
          void markFirstDashboardViewed();
        }

        if (trackedRef.current) return;
        trackedRef.current = true;

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

    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsentChange);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsentChange);
    };
  }, [premium.isLoading, premium.isPremium, premium.planName]);

  return null;
}
