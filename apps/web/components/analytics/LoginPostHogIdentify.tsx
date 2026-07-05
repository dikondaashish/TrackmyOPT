"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { identifyLoginSessionUser } from "@/lib/posthog-client";

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

      identifyLoginSessionUser(user);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
