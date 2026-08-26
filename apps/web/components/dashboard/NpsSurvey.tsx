"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { supabase } from "@/lib/supabase/client";
import {
  captureNpsDismissed,
  captureNpsShown,
  captureNpsSubmitted,
  setNpsLastShownPersonProperty,
} from "@/lib/posthog-client";
import {
  NPS_COOLDOWN_DAYS,
  NPS_LAST_SHOWN_KEY,
  NPS_REQUEST_EVENT,
  NPS_SHOW_DELAY_MS,
  isWithinNpsCooldown,
  resolveNpsCategory,
  type NpsPlanTier,
  type NpsRequest,
  type NpsTrigger,
} from "@/lib/posthog/nps-survey";

type NpsContext = {
  trigger: NpsTrigger;
  planTier: NpsPlanTier;
  pathname: string;
  daysSinceSignup: number | null;
};

function readNpsLastShown(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NPS_LAST_SHOWN_KEY);
}

function persistNpsLastShown(isoTimestamp: string): void {
  localStorage.setItem(NPS_LAST_SHOWN_KEY, isoTimestamp);
  setNpsLastShownPersonProperty(isoTimestamp);
}

function daysSinceSignup(createdAt: string | undefined): number | null {
  if (!createdAt) return null;
  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return null;
  return Math.max(0, Math.floor((Date.now() - createdAtMs) / 86_400_000));
}

/**
 * The only product NPS UI. It stays dormant until a caller reports a completed
 * milestone, avoiding dashboard-load interruptions and recording every shown,
 * dismissed, and submitted survey with the same trigger context.
 */
export function NpsSurvey() {
  const premium = usePremiumStatus();
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const contextRef = useRef<NpsContext | null>(null);
  const shownThisMount = useRef(false);

  const handleRequest = useCallback(async (request: NpsRequest) => {
    if (
      shownThisMount.current ||
      !hasAnalyticsConsent() ||
      isWithinNpsCooldown(readNpsLastShown(), NPS_COOLDOWN_DAYS)
    ) {
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || shownThisMount.current) return;

      shownThisMount.current = true;
      const nextContext: NpsContext = {
        trigger: request.trigger,
        planTier:
          premium.planName === "dedicated"
            ? "dedicated"
            : premium.isPremium === true
              ? "pro"
              : request.planTier,
        pathname: window.location.pathname,
        daysSinceSignup: daysSinceSignup(user.created_at),
      };

      window.setTimeout(() => {
        const now = new Date().toISOString();
        persistNpsLastShown(now);
        captureNpsShown({
          trigger: nextContext.trigger,
          plan_tier: nextContext.planTier,
          pathname: nextContext.pathname,
          days_since_signup: nextContext.daysSinceSignup,
        });
        contextRef.current = nextContext;
        setScore(null);
        setFeedback("");
        setVisible(true);
      }, NPS_SHOW_DELAY_MS);
    } catch {
      // Feedback must never disrupt the completed task that requested it.
    }
  }, [premium.isPremium, premium.planName]);

  useEffect(() => {
    const listener = (event: Event) => {
      const request = (event as CustomEvent<NpsRequest>).detail;
      if (!request?.trigger || !request.planTier) return;
      void handleRequest(request);
    };

    window.addEventListener(NPS_REQUEST_EVENT, listener);
    return () => window.removeEventListener(NPS_REQUEST_EVENT, listener);
  }, [handleRequest]);

  const dismiss = useCallback(() => {
    const context = contextRef.current;
    if (context) {
      captureNpsDismissed({
        trigger: context.trigger,
        plan_tier: context.planTier,
        pathname: context.pathname,
        days_since_signup: context.daysSinceSignup,
      });
    }
    setVisible(false);
  }, []);

  const submit = useCallback(() => {
    const context = contextRef.current;
    if (score == null || !context) return;

    const trimmedFeedback = feedback.trim();
    captureNpsSubmitted({
      trigger: context.trigger,
      plan_tier: context.planTier,
      pathname: context.pathname,
      days_since_signup: context.daysSinceSignup,
      score,
      ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
      category: resolveNpsCategory(score),
    });
    setVisible(false);
  }, [feedback, score]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm"
      role="dialog"
      aria-modal="false"
      aria-label="TrackMyOPT feedback survey"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-white p-6 pr-10 shadow-xl",
          "dark:border-gray-700 dark:bg-gray-800"
        )}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          aria-label="Dismiss survey"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          How likely are you to recommend TrackMyOPT?
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          0 = not likely · 10 = very likely
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Recommendation score">
          {Array.from({ length: 11 }, (_, value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScore(value)}
              className={cn(
                "h-8 w-8 rounded-md border text-xs font-medium transition-colors",
                score === value
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500"
              )}
              aria-label={`Rate TrackMyOPT ${value} out of 10`}
              aria-pressed={score === value}
            >
              {value}
            </button>
          ))}
        </div>

        <label
          className="mt-4 block text-xs font-medium text-gray-600 dark:text-gray-300"
          htmlFor="nps-feedback"
        >
          What would make TrackMyOPT a 10 for you? <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="nps-feedback"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={3}
          placeholder="Tell us what would help most"
          className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={score == null}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
