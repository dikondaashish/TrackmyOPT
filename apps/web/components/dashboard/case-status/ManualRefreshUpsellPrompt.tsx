"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import {
  CHECKOUT_UPSELL_TRIGGER,
  type CheckoutUpsellTrigger,
} from "@/lib/case-status/free-change-wedge";
import { captureCheckoutStarted } from "@/lib/posthog-client";

type ManualRefreshUpsellPromptProps = {
  onDismiss: () => void;
  trigger?: CheckoutUpsellTrigger;
  message?: string;
};

export function ManualRefreshUpsellPrompt({
  onDismiss,
  trigger = CHECKOUT_UPSELL_TRIGGER.SECOND_MANUAL_REFRESH,
  message = "We check automatically every day for Pro members — no manual refreshing.",
}: ManualRefreshUpsellPromptProps) {
  const handleCheckoutClick = () => {
    captureCheckoutStarted({ trigger });
  };

  return (
    <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-gray-100">{message}</p>
          <Button
            asChild
            variant="link"
            className="h-auto p-0 mt-2 text-purple-600 dark:text-purple-400 font-medium"
            onClick={handleCheckoutClick}
          >
            <Link href="/premium/checkout?planId=pro&interval=year">Upgrade to Pro</Link>
          </Button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
