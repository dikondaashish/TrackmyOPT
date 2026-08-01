"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { captureActivationCompleted } from "@/lib/posthog-client";
import {
  daysSinceSignupDate,
  hasSuccessfulCaseCheck,
  isActivatedUser,
  isWithinActivationWindow,
} from "@/lib/posthog/activation";

const ACTIVATION_CAPTURED_KEY = "tmo:activation_completed_captured";
const POLL_MS = 15_000;

/**
 * Fires `activation_completed` once when Phase 4 activation is met:
 * receipt present + successful case status check.
 * Re-checks on focus/visibility and polls so same-session activation is captured.
 */
export function ActivationCompletedTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;
    let activeController: AbortController | null = null;

    const alreadyCaptured = () => {
      try {
        return localStorage.getItem(ACTIVATION_CAPTURED_KEY) === "1";
      } catch {
        return false;
      }
    };

    const tryCapture = async () => {
      if (
        cancelled ||
        requestInFlight ||
        trackedRef.current ||
        alreadyCaptured()
      ) {
        return;
      }

      requestInFlight = true;
      const controller = new AbortController();
      activeController = controller;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const caseRes = await fetch("/api/case-status", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

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
          const primary = cases.find((c) => c.receipt_number) ?? cases[0] ?? null;
          hasReceipt = Boolean(primary?.receipt_number);
          hasSuccessfulCheck = hasSuccessfulCaseCheck(primary);
        }

        if (
          cancelled ||
          trackedRef.current ||
          alreadyCaptured() ||
          !isActivatedUser({ hasReceipt, hasSuccessfulCheck })
        ) {
          return;
        }

        trackedRef.current = true;
        try {
          localStorage.setItem(ACTIVATION_CAPTURED_KEY, "1");
        } catch {
          /* ignore */
        }
        captureActivationCompleted({
          days_since_signup: daysSinceSignupDate(user.created_at?.slice(0, 10)),
          within_24h: isWithinActivationWindow(user.created_at),
        });
      } catch {
        // This is a best-effort analytics probe. Offline transitions, aborted
        // navigations, and privacy tools must not surface as product errors.
      } finally {
        if (activeController === controller) activeController = null;
        requestInFlight = false;
      }
    };

    void tryCapture();

    const onVisible = () => {
      if (document.visibilityState === "visible") void tryCapture();
    };
    window.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const pollId = window.setInterval(() => void tryCapture(), POLL_MS);

    return () => {
      cancelled = true;
      activeController?.abort();
      window.clearInterval(pollId);
      window.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return null;
}
