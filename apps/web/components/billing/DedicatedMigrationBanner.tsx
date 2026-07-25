"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

/**
 * Phase 6: existing Dedicated subscribers can switch to Pro in-app
 * (Dedicated is closed for new purchases).
 */
export function DedicatedMigrationBanner() {
  const premium = usePremiumStatus();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const plan = (premium.planName || "").toLowerCase();
  if (premium.isLoading || premium.isPremium !== true || plan !== "dedicated" || done) {
    return null;
  }

  const switchToPro = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/premium/create-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pro",
          interval: "year",
          recurringBillingAccepted: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.type === "subscription_updated" && typeof data.redirect === "string") {
        setDone(true);
        window.location.href = data.redirect;
        return;
      }
      if (res.ok && data.type === "checkout" && typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }
      if (typeof data.portalUrl === "string") {
        window.location.href = data.portalUrl;
        return;
      }
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not switch plans. Try Settings → Manage billing, or email support@trackmyopt.com."
      );
    } catch {
      setError("Network error. Please try again or contact support@trackmyopt.com.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-sky-200 bg-sky-50 px-4 py-3 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm">
          <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Dedicated is no longer sold to new customers.</p>
            <p className="mt-0.5 text-sky-900/80 dark:text-sky-100/80">
              You keep full access. Prefer Pro? Same daily USCIS auto-checks and alerts at the Pro
              price — switch anytime (proration applied by Stripe).
            </p>
            {error ? <p className="mt-1 text-xs text-red-700 dark:text-red-300">{error}</p> : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 bg-sky-900 text-sky-50 hover:bg-sky-800"
          disabled={busy}
          onClick={() => void switchToPro()}
        >
          {busy ? "Switching…" : "Switch to Pro"}
        </Button>
      </div>
    </div>
  );
}
