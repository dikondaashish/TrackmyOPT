"use client";

import { useEffect, useRef } from "react";
import {
  captureDashboardViewed,
  ANALYTICS_CONSENT_CHANGE_EVENT,
  isBrowserPostHogReady,
} from "@/lib/posthog-client";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { isPendingStatus } from "@/lib/posthog/uscis-status-category";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { supabase } from "@/lib/supabase/client";

const DASHBOARD_VIEWED_SESSION_KEY = "tmo:dashboard_viewed_captured";

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

/**
 * Fires `dashboard_viewed` once per browser session on any dashboard route.
 * Phase 4: no longer gated on onboarding_completed (that hid ~80% of the funnel).
 */
export function DashboardViewTracker() {
  const premium = usePremiumStatus();
  const trackedRef = useRef(false);
  const activityMarkedRef = useRef(false);

  useEffect(() => {
    if (premium.isLoading) return;

    const trackDashboardView = () => {
      if (trackedRef.current || !hasAnalyticsConsent() || !isBrowserPostHogReady()) {
        return;
      }
      try {
        if (sessionStorage.getItem(DASHBOARD_VIEWED_SESSION_KEY) === "1") {
          trackedRef.current = true;
          if (!activityMarkedRef.current) {
            activityMarkedRef.current = true;
            void markFirstDashboardViewed();
          }
          return;
        }
      } catch {
        /* ignore */
      }

      (async () => {
        let hasReceipt = false;
        let hasStatus = false;
        let isPending = false;
        let onboardingCompleted = false;
        let path = "/dashboard";

        try {
          path = window.location.pathname;
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

        // Stamp first dashboard view as soon as they hit any dashboard page.
        if (!activityMarkedRef.current) {
          activityMarkedRef.current = true;
          void markFirstDashboardViewed();
        }

        if (trackedRef.current) return;
        trackedRef.current = true;
        try {
          sessionStorage.setItem(DASHBOARD_VIEWED_SESSION_KEY, "1");
        } catch {
          /* ignore */
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
          path,
        });
      })();
    };

    trackDashboardView();

    const onConsentChange = (event: Event) => {
      const accepted = (event as CustomEvent<{ accepted: boolean }>).detail?.accepted;
      if (accepted) {
        trackedRef.current = false;
        try {
          sessionStorage.removeItem(DASHBOARD_VIEWED_SESSION_KEY);
        } catch {
          /* ignore */
        }
        trackDashboardView();
      }
    };

    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsentChange);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsentChange);
    };
  }, [premium.isLoading, premium.isPremium, premium.planName]);

  return null;
}
