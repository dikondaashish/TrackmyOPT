"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Crown } from "lucide-react";
import {
  CHECKOUT_UPSELL_TRIGGER,
  formatStatusChangedDaysAgo,
} from "@/lib/case-status/free-change-wedge";
import { captureUpgradePromptShown } from "@/lib/posthog-client";
import { CASE_STATUS_MESSAGING, PRODUCT_CTAS } from "@/lib/messaging/product-copy";

type StatusChangeUpgradeBannerProps = {
  statusLastChangedAt: string;
  onAcknowledged: () => void;
  onStartTrial: () => void;
};

export function StatusChangeUpgradeBanner({
  statusLastChangedAt,
  onAcknowledged,
  onStartTrial,
}: StatusChangeUpgradeBannerProps) {
  const promptCapturedRef = useRef(false);
  const [daysAgoLabel, setDaysAgoLabel] = useState<string>("");

  useEffect(() => {
    setDaysAgoLabel(formatStatusChangedDaysAgo(statusLastChangedAt));
  }, [statusLastChangedAt]);

  useEffect(() => {
    if (promptCapturedRef.current) return;
    promptCapturedRef.current = true;
    captureUpgradePromptShown({
      trigger: CHECKOUT_UPSELL_TRIGGER.STATUS_CHANGE_WEDGE,
      source: "case_status_page",
      plan_suggested: "pro",
    });
  }, []);

  if (!daysAgoLabel) return null;

  const markViewed = async () => {
    try {
      await fetch("/api/case-status/viewed", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* non-blocking */
    }
    onAcknowledged();
  };

  const handleStartTrial = () => {
    // checkout_started fires server-side in create-checkout after Stripe session exists.
    onStartTrial();
    void markViewed();
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {CASE_STATUS_MESSAGING.statusChangeHeadline}{" "}
              <span className="font-normal text-gray-600 dark:text-gray-400">
                ({daysAgoLabel})
              </span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {CASE_STATUS_MESSAGING.statusChangeBody}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="ghost"
            className="h-10 text-sm text-gray-600 dark:text-gray-300"
            onClick={() => void markViewed()}
          >
            Got it
          </Button>
          <Button
            type="button"
            onClick={handleStartTrial}
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white h-10 px-4"
          >
            <Crown className="w-4 h-4" />
            {PRODUCT_CTAS.startTrial}
          </Button>
        </div>
      </div>
    </Card>
  );
}
