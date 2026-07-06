"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import {
  captureNpsDismissed,
  captureNpsSubmitted,
  setNpsLastShownPersonProperty,
} from "@/lib/posthog-client";
import {
  isAccountOldEnough,
  isWithinNpsCooldown,
  NPS_COOLDOWN_DAYS,
  NPS_LAST_SHOWN_KEY,
  NPS_LAST_SHOWN_PERSON_PROPERTY,
  NPS_MIN_ACCOUNT_AGE_DAYS,
  NPS_SHOW_DELAY_MS,
  resolveNpsCategory,
} from "@/lib/posthog/nps-survey";

function readNpsLastShown(): string | null {
  if (typeof window === "undefined") return null;

  const fromStorage = localStorage.getItem(NPS_LAST_SHOWN_KEY);
  if (fromStorage) return fromStorage;

  if (typeof posthog?.get_property === "function") {
    const fromPerson = posthog.get_property(NPS_LAST_SHOWN_PERSON_PROPERTY);
    if (typeof fromPerson === "string" && fromPerson.length > 0) {
      return fromPerson;
    }
  }

  return null;
}

function persistNpsLastShown(isoTimestamp: string): void {
  localStorage.setItem(NPS_LAST_SHOWN_KEY, isoTimestamp);
  setNpsLastShownPersonProperty(isoTimestamp);
}

/**
 * In-app NPS popover for dashboard users (14+ day accounts, 90-day cooldown).
 */
export function NpsSurvey() {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const evaluateEligibility = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.created_at || cancelled) return;

      if (!isAccountOldEnough(user.created_at, NPS_MIN_ACCOUNT_AGE_DAYS)) return;

      const lastShown = readNpsLastShown();
      if (isWithinNpsCooldown(lastShown, NPS_COOLDOWN_DAYS)) return;

      showTimer = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, NPS_SHOW_DELAY_MS);
    };

    void evaluateEligibility();

    return () => {
      cancelled = true;
      if (showTimer) clearTimeout(showTimer);
    };
  }, []);

  const dismiss = useCallback(() => {
    const now = new Date().toISOString();
    persistNpsLastShown(now);
    captureNpsDismissed();
    setVisible(false);
  }, []);

  const submit = useCallback(async () => {
    if (score == null || submitting) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const trimmedFeedback = feedback.trim();

      captureNpsSubmitted({
        score,
        ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
        category: resolveNpsCategory(score),
      });
      persistNpsLastShown(now);
      setVisible(false);
    } finally {
      setSubmitting(false);
    }
  }, [feedback, score, submitting]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      role="dialog"
      aria-label="Net Promoter Score survey"
    >
      <div
        className={cn(
          "pointer-events-auto relative overflow-hidden rounded-md border bg-white p-6 pr-10 shadow-lg",
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

        <div className="mt-4 flex flex-wrap gap-1.5">
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
              aria-pressed={score === value}
            >
              {value}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-gray-600 dark:text-gray-300">
          Optional feedback
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={3}
            placeholder="What could we improve?"
            className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </label>

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
            onClick={() => void submit()}
            disabled={score == null || submitting}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
