'use client';

import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  captureActivationCompleted,
  isBrowserPostHogReady,
} from '@/lib/posthog-client';
import { hasAnalyticsConsent } from '@/lib/cookie-consent';
import {
  daysSinceSignupDate,
  hasSuccessfulCaseCheck,
  isActivatedUser,
  isWithinActivationWindow,
} from '@/lib/posthog/activation';

const ACTIVATION_CAPTURED_KEY = 'tmo:activation_completed_captured';
const POLL_MS = 15_000;
const isOffline = () => navigator.onLine === false;
// Validate only the fields this probe consumes. Never include response data in reports.
const caseSchema = z.object({
  receipt_number: z.string().nullable().optional(),
  current_status: z.string().nullable().optional(),
  last_checked_at: z.string().nullable().optional(),
});
const caseResponseSchema = z
  .object({
    ok: z.literal(true),
    cases: z.array(caseSchema).optional(),
    data: caseSchema.nullable().optional(),
  })
  .refine((value) => value.cases !== undefined || value.data !== undefined);

/**
 * Fires `activation_completed` once when Phase 4 activation is met:
 * receipt present + successful case status check.
 * Re-checks on focus/visibility and polls so same-session activation is captured.
 */
export function ActivationCompletedTracker() {
  const trackedUserRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;
    let activeController: AbortController | null = null;

    const alreadyCaptured = (userId: string) => {
      try {
        return (
          localStorage.getItem(`${ACTIVATION_CAPTURED_KEY}:${userId}`) === '1'
        );
      } catch {
        return false;
      }
    };

    const tryCapture = async () => {
      if (
        cancelled ||
        requestInFlight ||
        isOffline() ||
        !hasAnalyticsConsent() ||
        !isBrowserPostHogReady()
      ) {
        return;
      }

      requestInFlight = true;
      const controller = new AbortController();
      activeController = controller;
      // Only fixed stages and numeric HTTP statuses enter diagnostics.
      let stage = 'auth';
      let status: number | 'none' = 'none';

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          // Missing/expired authentication is expected; provider failures are not.
          if (
            authError.status &&
            authError.status >= 400 &&
            authError.status < 500
          )
            return;
          // The auth client reports a request that got no response as status 0.
          if (authError.status === 0) stage = 'network';
          else if (authError.status) status = authError.status;
          throw new Error('Activation authentication check failed');
        }
        if (
          !user ||
          !hasAnalyticsConsent() ||
          !isBrowserPostHogReady() ||
          cancelled ||
          trackedUserRef.current === user.id ||
          alreadyCaptured(user.id)
        )
          return;

        stage = 'network';
        const caseRes = await fetch('/api/case-status', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        });
        status = caseRes.status;
        stage = 'http';

        let hasReceipt = false;
        let hasSuccessfulCheck = false;
        if (caseRes.ok) {
          stage = 'json';
          const body: unknown = await caseRes.json();
          stage = 'payload';
          const caseJson = caseResponseSchema.parse(body);
          const cases = caseJson.cases?.length
            ? caseJson.cases
            : caseJson.data
              ? [caseJson.data]
              : [];
          const primary =
            cases.find((c) => c.receipt_number) ?? cases[0] ?? null;
          hasReceipt = Boolean(primary?.receipt_number);
          hasSuccessfulCheck = hasSuccessfulCaseCheck(primary);
        }

        if (
          cancelled ||
          !hasAnalyticsConsent() ||
          !isBrowserPostHogReady() ||
          trackedUserRef.current === user.id ||
          alreadyCaptured(user.id) ||
          !isActivatedUser({ hasReceipt, hasSuccessfulCheck })
        ) {
          return;
        }

        stage = 'processing';
        captureActivationCompleted({
          days_since_signup: daysSinceSignupDate(user.created_at?.slice(0, 10)),
          within_24h: isWithinActivationWindow(user.created_at),
        });
        trackedUserRef.current = user.id;
        try {
          localStorage.setItem(`${ACTIVATION_CAPTURED_KEY}:${user.id}`, '1');
        } catch {
          /* ignore */
        }
      } catch {
        // Intentional teardown/offline transitions are expected. Other failures
        // stay observable through the Sentry console integration without user data;
        // `stage=network` lets Sentry apply its shared dropped-connection policy.
        if (!cancelled && !controller.signal.aborted && !isOffline()) {
          console.error(
            `[ActivationCompletedTracker] activation check failed (stage=${stage}, status=${status})`
          );
        }
      } finally {
        if (activeController === controller) activeController = null;
        requestInFlight = false;
      }
    };

    void tryCapture();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void tryCapture();
    };
    window.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onVisible);
    const pollId = window.setInterval(() => void tryCapture(), POLL_MS);

    return () => {
      cancelled = true;
      activeController?.abort();
      window.clearInterval(pollId);
      window.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onVisible);
    };
  }, []);

  return null;
}
