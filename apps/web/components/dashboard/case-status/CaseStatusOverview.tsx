"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CaseStatusExplainerCard } from "@/components/dashboard/case-status/CaseStatusExplainerCard";
import {
  calculateNextAutoCheck,
  formatStatusLabel,
  getDaysSince,
  getServiceCenterLabel,
} from "@/lib/case-status/case-status-display";
import { getStatusNextSteps } from "@/lib/case-status/status-next-steps";
import { getStatusExplainer, isPlaceholderStatus } from "@/lib/uscis/status-explainer";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";
import {
  ChevronRight,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CaseStatusOverviewProps = {
  receiptNumber: string;
  currentStatus: string | null;
  receivedDate: string | null;
  lastCheckedAt: string | null;
  lastStatusChangeAt: string | null;
  statusHistoryLength: number;
  isPremium: boolean | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onUpgrade: () => void;
  formatDateTime: (iso: string | null) => string;
};

export function CaseStatusOverview({
  receiptNumber,
  currentStatus,
  receivedDate,
  lastCheckedAt,
  lastStatusChangeAt,
  statusHistoryLength,
  isPremium,
  isRefreshing,
  onRefresh,
  onUpgrade,
  formatDateTime,
}: CaseStatusOverviewProps) {
  const [copied, setCopied] = useState(false);
  const explainer = getStatusExplainer(
    isPlaceholderStatus(currentStatus) ? null : currentStatus
  );
  const daysSinceFiled = getDaysSince(receivedDate);
  const daysSinceChange = getDaysSince(lastStatusChangeAt);
  const nextSteps = getStatusNextSteps(explainer.category, daysSinceFiled);
  const serviceCenter = getServiceCenterLabel(receiptNumber);
  const receiptPrefix = receiptNumber.slice(0, 3);
  const hasLiveStatus = !isPlaceholderStatus(currentStatus);

  const handleCopyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const statusChangedRecently =
    daysSinceChange !== null &&
    daysSinceChange <= 7 &&
    statusHistoryLength > 1;

  const showNoChangeReassurance =
    hasLiveStatus &&
    daysSinceChange !== null &&
    daysSinceChange > 0 &&
    !statusChangedRecently;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-2 border-blue-200/80 dark:border-blue-800/80">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-800 px-5 py-6 sm:px-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                {hasLiveStatus ? explainer.title : "Checking USCIS"}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                {formatStatusLabel(currentStatus, "Fetching your latest status…")}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-blue-100">
                <span className="font-mono ph-mask" data-ph-mask>
                  {receiptPrefix}••••••••••
                </span>
                <span aria-hidden>·</span>
                <span>{serviceCenter}</span>
                {daysSinceFiled !== null && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      {daysSinceFiled === 0
                        ? "Filed today"
                        : `${daysSinceFiled} day${daysSinceFiled === 1 ? "" : "s"} since filed`}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="bg-white/15 text-white border-white/25 hover:bg-white/25"
              >
                <RefreshCw className={cn("w-4 h-4 mr-1.5", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyReceipt}
                className="bg-white/15 text-white border-white/25 hover:bg-white/25"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1.5" />
                ) : (
                  <Copy className="w-4 h-4 mr-1.5" />
                )}
                {copied ? "Copied" : "Copy receipt"}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 text-sm text-blue-100/90 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Last checked:{" "}
              <span className="font-medium text-white">
                {lastCheckedAt ? formatDateTime(lastCheckedAt) : "Not yet"}
              </span>
            </p>
            {isPremium === true && lastCheckedAt && (
              <p className="text-blue-100">{calculateNextAutoCheck(lastCheckedAt)}</p>
            )}
            {isPremium === false && (
              <button
                type="button"
                onClick={onUpgrade}
                className="text-left sm:text-right font-medium text-white underline-offset-2 hover:underline"
              >
                {CASE_STATUS_MESSAGING.upgradeForAutoChecks}
              </button>
            )}
          </div>

          {!showNoChangeReassurance ? null : (
            <p className="mt-3 text-sm text-blue-100/80 rounded-lg bg-white/10 px-3 py-2">
              No USCIS status change in the last {daysSinceChange} day
              {daysSinceChange === 1 ? "" : "s"} — we&apos;ll keep checking.
            </p>
          )}
        </div>

        {nextSteps.length > 0 && (
          <div className="px-5 py-4 sm:px-6 bg-muted/30 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Suggested next steps
            </p>
            <ul className="space-y-2">
              {nextSteps.map((step) => (
                <li key={step.href + step.label}>
                  {step.external ? (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <span>
                        <span className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {step.label}
                        </span>
                        {step.description && (
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {step.description}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground" />
                    </a>
                  ) : (
                    <Link
                      href={step.href}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <span>
                        <span className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {step.label}
                        </span>
                        {step.description && (
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {step.description}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {lastCheckedAt && (
        <CaseStatusExplainerCard
          currentStatus={currentStatus}
          lastCheckedAt={lastCheckedAt}
          formatLastChecked={formatDateTime}
        />
      )}
    </div>
  );
}
