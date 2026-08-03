"use client";

import { useEffect, useRef } from "react";
import { captureCaseStatusSummaryViewed } from "@/lib/posthog-client";
import { isPendingStatus } from "@/lib/posthog/uscis-status-category";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { supabase } from "@/lib/supabase/client";

type CaseStatusPageViewTrackerProps = {
  isInitialLoadComplete: boolean;
  hasReceipt: boolean;
  hasStatus: boolean;
  currentStatus: string | null;
};

function resolvePlanTier(isPremium: boolean | null, planName: string | null): string {
  if (isPremium !== true) return "free";
  const normalized = (planName ?? "").toLowerCase();
  if (normalized === "dedicated") return "dedicated";
  if (normalized === "pro") return "pro";
  return normalized || "pro";
}

/** Fires `case_status_summary_viewed` once per case status page mount. */
export function CaseStatusPageViewTracker({
  isInitialLoadComplete,
  hasReceipt,
  hasStatus,
  currentStatus,
}: CaseStatusPageViewTrackerProps) {
  const premium = usePremiumStatus();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isInitialLoadComplete || trackedRef.current || premium.isLoading) return;

    trackedRef.current = true;

    (async () => {
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

      captureCaseStatusSummaryViewed({
        has_receipt: hasReceipt,
        has_status: hasStatus,
        is_pending: isPendingStatus(currentStatus),
        plan_tier: resolvePlanTier(premium.isPremium, premium.planName),
        premium_status: premium.isPremium === true,
        onboarding_completed: onboardingCompleted,
      });
    })();
  }, [
    isInitialLoadComplete,
    hasReceipt,
    hasStatus,
    currentStatus,
    premium.isLoading,
    premium.isPremium,
    premium.planName,
  ]);

  return null;
}
