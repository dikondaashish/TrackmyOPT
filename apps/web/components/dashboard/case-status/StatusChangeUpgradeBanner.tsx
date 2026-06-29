"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Bell, Crown } from "lucide-react";
import {
  CHECKOUT_UPSELL_TRIGGER,
  formatStatusChangedDaysAgo,
} from "@/lib/case-status/free-change-wedge";
import {
  captureCheckoutStarted,
  captureUpgradePromptShown,
} from "@/lib/posthog-client";

type StatusChangeUpgradeBannerProps = {
  statusLastChangedAt: string;
  onAcknowledged: () => void;
};

export function StatusChangeUpgradeBanner({
  statusLastChangedAt,
  onAcknowledged,
}: StatusChangeUpgradeBannerProps) {
  const promptCapturedRef = useRef(false);

  // Hydration fix: formatStatusChangedDaysAgo calls new Date() by default.
  // Initialise to "" (renders nothing in the sentence) so server and client
  // produce identical HTML on first paint; update after mount with real value.
  const [daysAgoLabel, setDaysAgoLabel] = useState<string>("");

  useEffect(() => {
    // Set the real label once we're on the client (post-hydration).
    setDaysAgoLabel(formatStatusChangedDaysAgo(statusLastChangedAt));
  }, [statusLastChangedAt]);

  useEffect(() => {
    if (promptCapturedRef.current) return;
    promptCapturedRef.current = true;
    captureUpgradePromptShown({
      trigger: CHECKOUT_UPSELL_TRIGGER.STATUS_CHANGE_WEDGE,
    });
  }, []);

  // Don't render at all until the client label is ready — prevents a flash
  // of "Your case status changed ." with an empty daysAgoLabel.
  if (!daysAgoLabel) return null;

  const handleCheckoutClick = async () => {
    captureCheckoutStarted({
      trigger: CHECKOUT_UPSELL_TRIGGER.STATUS_CHANGE_WEDGE,
    });
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

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Your case status changed {daysAgoLabel}.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              We&apos;re checking daily — upgrade to Pro to be emailed the moment it
              changes.
            </p>
          </div>
        </div>
        <Link
          href="/premium/checkout?planId=pro&interval=year"
          onClick={handleCheckoutClick}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium h-10 px-4 w-full sm:w-auto shrink-0"
        >
          <Crown className="w-4 h-4" />
          Upgrade to Pro
        </Link>
      </div>
    </Card>
  );
}
