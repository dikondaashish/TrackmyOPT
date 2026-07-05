"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { captureActivationCompleted } from "@/lib/posthog-client";
import { daysSinceSignupDate, isActivatedUser } from "@/lib/posthog/activation";

const ACTIVATION_CAPTURED_KEY = "tmo:activation_completed_captured";

/** Fires `activation_completed` once when onboarding + receipt + live status are all true. */
export function ActivationCompletedTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || localStorage.getItem(ACTIVATION_CAPTURED_KEY)) return;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, caseRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle(),
        fetch("/api/case-status", { credentials: "include", cache: "no-store" }),
      ]);

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
        const primary = cases.find((c) => c.receipt_number) ?? cases[0] ?? null;
        hasReceipt = Boolean(primary?.receipt_number);
        hasStatus = Boolean(primary?.current_status);
      }

      const onboardingCompleted = profile?.onboarding_completed === true;
      if (
        !isActivatedUser({ onboardingCompleted, hasReceipt, hasStatus }) ||
        trackedRef.current
      ) {
        return;
      }

      trackedRef.current = true;
      localStorage.setItem(ACTIVATION_CAPTURED_KEY, "1");
      captureActivationCompleted({
        days_since_signup: daysSinceSignupDate(user.created_at?.slice(0, 10)),
      });
    })();
  }, []);

  return null;
}
