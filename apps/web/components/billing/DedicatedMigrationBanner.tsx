"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import {
  DEDICATED_CONSULTATION_MINUTES,
  DEDICATED_CONSULTATION_WAIT_DAYS,
} from "@/lib/legal/legal-config";
import { getDedicatedConsultationEligibility } from "@/lib/pricing/dedicated-consultation";

/** Shows active Dedicated members how to request their one-time consultation. */
export function DedicatedMigrationBanner() {
  const premium = usePremiumStatus();
  const plan = (premium.planName || "").toLowerCase();
  const [dedicatedStartedAt, setDedicatedStartedAt] = useState<string | null>(null);

  useEffect(() => {
    if (premium.isPremium !== true || plan !== "dedicated") {
      setDedicatedStartedAt(null);
      return;
    }

    const controller = new AbortController();
    void fetch("/api/premium/status", { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((status) => setDedicatedStartedAt(status?.dedicatedStartedAt ?? null))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDedicatedStartedAt(null);
      });
    return () => controller.abort();
  }, [plan, premium.isPremium]);

  if (premium.isLoading || premium.isPremium !== true || plan !== "dedicated") {
    return null;
  }

  const consultation = getDedicatedConsultationEligibility(dedicatedStartedAt);

  const subject = encodeURIComponent(
    `Dedicated ${DEDICATED_CONSULTATION_MINUTES}-minute attorney consultation request`
  );
  const body = encodeURIComponent(
    "Please help me request my one-time Dedicated attorney consultation. I understand scheduling is subject to attorney availability, conflict checks, and acceptance."
  );

  return (
    <div className="border-b border-purple-200 bg-purple-50 px-4 py-3 text-purple-950 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">
              {consultation.eligible
                ? "Your Dedicated consultation benefit is ready."
                : "Your Dedicated consultation has a 7-day eligibility wait."}
            </p>
            <p className="mt-0.5 text-purple-900/80 dark:text-purple-100/80">
              {consultation.eligible
                ? `Request your one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial consultation. One per account; attorney availability, conflict checks, and acceptance apply.`
                : consultation.eligibleAt
                  ? `Booking unlocks ${consultation.eligibleAt.toLocaleDateString()} after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days on Dedicated.`
                  : "Checking the start of your current Dedicated membership…"}
            </p>
          </div>
        </div>
        {consultation.eligible && (
          <Button asChild size="sm" className="shrink-0 bg-purple-900 text-white hover:bg-purple-800">
            <a href={`mailto:support@trackmyopt.com?subject=${subject}&body=${body}`}>
              Request consultation
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
