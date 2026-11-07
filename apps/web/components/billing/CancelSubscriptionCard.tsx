"use client";

import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CancelSubscriptionCardProps {
  accessThroughDate: string | null;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CancelSubscriptionCard({
  accessThroughDate,
  onCancel,
  isLoading,
}: CancelSubscriptionCardProps) {
  const accessLabel = accessThroughDate
    ? new Date(accessThroughDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "the end of your current billing period";

  return (
    <div className="surface-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">Cancel subscription</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Canceling stops future renewal charges only. You keep full premium access until{" "}
            <strong className="text-foreground">{accessLabel}</strong>.
            No further charges are scheduled after that date unless you re-subscribe.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-950 dark:text-red-300 dark:hover:bg-red-950"
        onClick={onCancel}
        disabled={isLoading}
      >
        {isLoading ? "Opening billing portal…" : "Cancel subscription"}
        <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
      </Button>
      <p className="text-xs text-muted-foreground">
        You will confirm cancellation in Stripe&apos;s secure portal (same provider as checkout). We email a confirmation with your final access date.{" "}
        <Link href="/refund-policy" className="text-primary hover:underline">
          Refund Policy
        </Link>
      </p>
    </div>
  );
}
