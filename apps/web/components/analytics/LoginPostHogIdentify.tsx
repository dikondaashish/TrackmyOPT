"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { identifyTrackMyOptUser } from "@/lib/posthog-client";

/**
 * Links anonymous PostHog activity when a returning user lands on /login with an
 * active session (before dashboard shell mounts PostHogIdentify).
 */
export function LoginPostHogIdentify() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      identifyTrackMyOptUser(user.id, {
        plan_tier: "free",
        premium_status: false,
        onboarding_completed: false,
        provider:
          typeof user.app_metadata?.provider === "string"
            ? user.app_metadata.provider
            : undefined,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
