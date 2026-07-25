"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

/**
 * Phase 5: clear in-app retry CTA when Stripe subscription is past_due / unpaid.
 */
export function PastDueBillingBanner() {
  const premium = usePremiumStatus();
  const [billingStatus, setBillingStatus] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (premium.isLoading || premium.isPremium !== true) {
      setBillingStatus(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/premium/status", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && typeof data.billingStatus === "string") {
          setBillingStatus(data.billingStatus);
        }
      } catch {
        /* non-blocking */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [premium.isLoading, premium.isPremium]);

  if (billingStatus !== "past_due" && billingStatus !== "unpaid") {
    return null;
  }

  const openPortal = async () => {
    setOpening(true);
    try {
      const res = await fetch("/api/premium/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }
      window.location.href = "/dashboard/settings?tab=subscription";
    } catch {
      window.location.href = "/dashboard/settings?tab=subscription";
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Your last payment failed. Update your card to keep daily USCIS auto-checks
            and status-change emails without interruption.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 bg-amber-900 text-amber-50 hover:bg-amber-800"
          disabled={opening}
          onClick={() => void openPortal()}
        >
          {opening ? "Opening…" : "Update payment method"}
        </Button>
      </div>
    </div>
  );
}
