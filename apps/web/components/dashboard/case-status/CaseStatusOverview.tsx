"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CaseStatusExplainerCard } from "@/components/dashboard/case-status/CaseStatusExplainerCard";
import { CaseProgressStepper } from "@/components/dashboard/case-status/CaseProgressStepper";
import {
  calculateNextAutoCheck,
  formatStatusLabel,
  getDaysSince,
  getServiceCenterLabel,
} from "@/lib/case-status/case-status-display";
import { getStatusNextSteps } from "@/lib/case-status/status-next-steps";
import { getStatusExplainer, isPlaceholderStatus, USCIS_CASE_STATUS_URL } from "@/lib/uscis/status-explainer";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";
import {
  Clock,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
  Lock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CaseStatusOverviewProps = {
  receiptNumber: string;
  currentStatus: string | null;
  receivedDate: string | null;
  lastCheckedAt: string | null;
  lastStatusChangeAt: string | null;
  statusHistoryLength: number;
  statusHistory: CaseStatusHistoryEntry[];
  caseType: string | null;
  isPremium: boolean | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onUpgrade: () => void;
  formatDateTime: (iso: string | null) => string;
};

const ACCENT: Record<string, string> = {
  approved: "#1E9E4A",
  denied: "#FF3B30",
  action_required: "#FF9F0A",
  rfe: "#FF9F0A",
  premium_processing: "#FF9F0A",
  received: "#0A84FF",
  transferred: "#6E6E73",
  pending: "#0A84FF",
  other: "#0A84FF",
  unknown: "#86868B",
};

export function CaseStatusOverview({
  receiptNumber,
  currentStatus,
  receivedDate,
  lastCheckedAt,
  lastStatusChangeAt,
  statusHistoryLength,
  statusHistory,
  caseType,
  isPremium,
  isRefreshing,
  onRefresh,
  onUpgrade,
  formatDateTime,
}: CaseStatusOverviewProps) {
  const [copied, setCopied] = useState(false);

  const explainer = getStatusExplainer(isPlaceholderStatus(currentStatus) ? null : currentStatus);
  const accent = ACCENT[explainer.category] ?? "#0A84FF";
  const daysSinceFiled = getDaysSince(receivedDate);
  const daysSinceChange = getDaysSince(lastStatusChangeAt);
  const nextSteps = getStatusNextSteps(explainer.category, daysSinceFiled);
  const hasLiveStatus = !isPlaceholderStatus(currentStatus);

  const handleCopyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="space-y-4">
      {/* ── 2-column hero card ──────────────────────────────── */}
      <Card className="overflow-hidden border border-gray-100/80 dark:border-gray-800/80 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/30">
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr]">

          {/* ── Left: status info ─────────────────────────── */}
          <div className="p-6 sm:p-7 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            {/* Category label with accent dot */}
            <div
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4px]"
              style={{ color: accent }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: accent, boxShadow: `0 0 0 4px ${accent}22` }}
              />
              Current status
            </div>

            {/* Big status headline */}
            <h2 className="text-[24px] sm:text-[27px] font-bold tracking-tight leading-snug mt-3 text-gray-900 dark:text-gray-100">
              {formatStatusLabel(currentStatus, "Fetching your latest status…")}
            </h2>

            {/* What this means for you */}
            {hasLiveStatus && (
              <div className="mt-4 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06]"
                style={{ background: "#F5F7FA" }}>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.4px] mb-1.5">
                  What this means for you
                </p>
                <p className="text-[13.5px] text-gray-700 dark:text-gray-300 leading-[1.55]">
                  {explainer.meaning}
                </p>
              </div>
            )}

            {/* Footer row */}
            <div className="mt-4 flex items-center gap-3 flex-wrap text-[12.5px] text-gray-600 dark:text-gray-400">
              {daysSinceChange !== null && hasLiveStatus && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-green-500" />
                    No change in{" "}
                    <b className="text-gray-900 dark:text-gray-100">{daysSinceChange} day{daysSinceChange === 1 ? "" : "s"}</b>
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                </>
              )}
              <button
                type="button"
                onClick={() => void handleCopyReceipt()}
                className="inline-flex items-center gap-1.5 text-blue-500 font-semibold bg-transparent border-none cursor-pointer p-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy receipt"}
              </button>
            </div>

            {/* Last checked row */}
            <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500">
              <span>
                Last checked:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {lastCheckedAt ? formatDateTime(lastCheckedAt) : "Not yet"}
                </span>
              </span>
              {!lastCheckedAt && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="h-7 text-xs"
                >
                  Check now
                </Button>
              )}
            </div>

            {/* Official USCIS text */}
            {hasLiveStatus && (
              <details className="mt-3 group">
                <summary className="flex items-center gap-1.5 text-[12px] text-gray-400 cursor-pointer list-none select-none">
                  View official USCIS text
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[12.5px] text-gray-500 dark:text-gray-400 italic leading-relaxed">
                  &ldquo;{currentStatus}&rdquo;{" "}
                  <a
                    href={USCIS_CASE_STATUS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline not-italic inline-flex items-center gap-1"
                  >
                    Verify on USCIS.gov <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </details>
            )}
          </div>

          {/* ── Right: case progress ──────────────────────── */}
          <div className="p-6 sm:p-7 flex flex-col">
            <p className="text-[11.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.4px]">
              Case progress
            </p>
            <div className="mt-5 flex-1">
              <CaseProgressStepper
                currentStatus={currentStatus}
                statusHistory={statusHistory}
              />
            </div>

            {/* Auto-check / upgrade card */}
            <div className="mt-auto pt-5">
              {isPremium === true ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#EAF4FF] dark:bg-blue-950/20 border border-[rgba(10,132,255,0.18)] dark:border-blue-900/30">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-blue-900/20 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3px]">
                      Auto-check is on
                    </p>
                    <p className="text-[14px] font-bold mt-0.5 text-gray-900 dark:text-gray-100 leading-snug">
                      {lastCheckedAt
                        ? calculateNextAutoCheck(lastCheckedAt)
                        : "Checking soon…"}
                    </p>
                  </div>
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-green-600 dark:text-green-400 whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Alerts on
                  </span>
                </div>
              ) : isPremium === false ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shrink-0">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3px]">Automatic checks</p>
                    <p className="text-[13px] text-gray-700 dark:text-gray-300 mt-0.5 leading-snug">
                      Pro re-checks every 24h
                    </p>
                  </div>
                  <Button onClick={onUpgrade} size="sm" className="ml-auto shrink-0 bg-blue-500 hover:bg-blue-600 text-white">
                    {CASE_STATUS_MESSAGING.upgradeForAutoChecks.split(" ")[0]}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Suggested next steps ─────────────────────────────── */}
      {nextSteps.length > 0 && (
        <Card className="bg-gradient-to-br from-white to-gray-50/40 dark:from-gray-900 dark:to-gray-800/50 border border-gray-100/80 dark:border-gray-800/80 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-[16px] font-bold tracking-tight">Suggested next steps</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nextSteps.map((step) => (
              <div key={step.href + step.label}>
                {step.external ? (
                  <a
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    <span className="font-semibold text-[13.5px] text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{step.label}</span>
                    {step.description && <span className="text-xs text-gray-500 leading-snug">{step.description}</span>}
                    <span className="mt-1 text-[12px] font-semibold text-blue-500 flex items-center gap-1">
                      Learn more <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                ) : (
                  <Link
                    href={step.href}
                    className="group flex flex-col gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    <span className="font-semibold text-[13.5px] text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{step.label}</span>
                    {step.description && <span className="text-xs text-gray-500 leading-snug">{step.description}</span>}
                    <span className="mt-1 text-[12px] font-semibold text-blue-500 flex items-center gap-1">
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Explainer card ────────────────────────────────────── */}
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
