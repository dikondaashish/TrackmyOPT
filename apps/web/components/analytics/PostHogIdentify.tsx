"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase/client";
import { identifyTrackMyOptUser, associateUniversityPartnerGroup } from "@/lib/posthog-client";
import { normalizePartnerGroupKey } from "@/lib/posthog/university-partner-groups";
import {
  hasSuccessfulCaseCheck,
  resolveActivationState,
} from "@/lib/posthog/activation";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

type CaseSummary = { hasReceipt: boolean; hasSuccessfulCheck: boolean };

// Chromium, Safari and Firefox wordings for a request that got no HTTP response.
const NETWORK_FAILURE =
  /^(?:failed to fetch|load failed|networkerror when attempting to fetch resource\.?)$/i;

function isBrowserNetworkFailure(error: unknown): error is TypeError {
  return error instanceof TypeError && NETWORK_FAILURE.test(error.message);
}

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
    const controller = new AbortController();

    // Unmount aborts and offline transitions are expected teardown. Other
    // failures go to Sentry without response or account data: browser network
    // failures pass through as-is so Sentry's connectivity filter can classify
    // them, and anything else is replaced by a fixed message.
    const reportFailure = (error: unknown) => {
      if (cancelled || controller.signal.aborted || navigator.onLine === false)
        return;
      Sentry.captureException(
        isBrowserNetworkFailure(error)
          ? error
          : new Error("PostHog identify failed")
      );
    };

    // Case data only refines person properties; a failed check must not block
    // identification or overwrite earlier values with defaults.
    const loadCaseSummary = async (): Promise<CaseSummary | null> => {
      try {
        const caseRes = await fetch("/api/case-status", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!caseRes.ok) return null;
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
        const primary =
          cases.find((c) => c.receipt_number) ?? cases[0] ?? null;
        return {
          hasReceipt: Boolean(primary?.receipt_number),
          hasSuccessfulCheck: hasSuccessfulCaseCheck(primary),
        };
      } catch (error) {
        reportFailure(error);
        return null;
      }
    };

    void (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const [{ data: profile }, caseSummary] = await Promise.all([
          supabase
            .from("profiles")
            .select("onboarding_completed, is_stem_eligible, referred_by")
            .eq("user_id", user.id)
            .maybeSingle(),
          loadCaseSummary(),
        ]);

        if (cancelled) return;

        const onboardingCompleted = profile?.onboarding_completed === true;

        identifyTrackMyOptUser(user.id, {
          plan_tier: resolvePlanTier(premium.isPremium, premium.planName),
          premium_status: premium.isPremium === true,
          onboarding_completed: onboardingCompleted,
          is_stem_eligible: profile?.is_stem_eligible === true,
          has_receipt: caseSummary?.hasReceipt,
          activation_state: caseSummary
            ? resolveActivationState(caseSummary)
            : undefined,
          signup_date: user.created_at?.slice(0, 10),
          provider:
            typeof user.app_metadata?.provider === "string"
              ? user.app_metadata.provider
              : undefined,
          referred_by: profile?.referred_by ?? null,
        });

        const referralCode = profile?.referred_by
          ? normalizePartnerGroupKey(profile.referred_by)
          : "";
        if (referralCode) {
          associateUniversityPartnerGroup(referralCode, {
            partner_name: referralCode,
          });
          fetch("/api/analytics/partner-group", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode }),
          }).catch(() => undefined);
        }
      } catch (error) {
        reportFailure(error);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [premium.isLoading, premium.isPremium, premium.planName]);

  return null;
}
