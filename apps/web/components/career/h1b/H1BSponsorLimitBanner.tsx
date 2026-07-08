"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureUpgradePromptShown } from "@/lib/posthog-client";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";

type H1BSponsorLimitBannerProps = {
  totalCount: number;
  isPremium: boolean;
};

export function H1BSponsorLimitBanner({
  totalCount,
  isPremium,
}: H1BSponsorLimitBannerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (isPremium || totalCount <= FREE_H1B_SPONSOR_LIMIT || trackedRef.current) return;
    trackedRef.current = true;
    captureUpgradePromptShown({ source: "h1b_limit" });
  }, [isPremium, totalCount]);

  if (isPremium || totalCount <= FREE_H1B_SPONSOR_LIMIT) {
    return null;
  }

  const lockedCount = totalCount - FREE_H1B_SPONSOR_LIMIT;

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Showing top {FREE_H1B_SPONSOR_LIMIT} of {totalCount.toLocaleString()} sponsors
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lockedCount.toLocaleString()} more companies with approval analytics are on Pro.
          </p>
        </div>
      </div>
      <Button asChild className="shrink-0">
        <Link href="/premium/checkout?planId=pro&interval=year">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}
