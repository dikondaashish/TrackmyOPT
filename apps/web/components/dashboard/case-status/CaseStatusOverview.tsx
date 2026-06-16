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
  Calendar,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

type CaseStatusOverviewProps = {
  receiptNumber: string;
  currentStatus: string | null;
  statusHistory: CaseStatusHistoryEntry[];
  lastStatusChangeAt: string | null;
  receivedDate: string | null;
  lastCheckedAt: string | null;
  statusHistoryLength: number;
  isPremium: boolean | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onUpgrade: () => void;
  formatDateTime: (iso: string | null) => string;
};

/* ── Status tone → gradient + glow color mapping ─────────────── */
function getStatusGradient(category: string) {
  switch (category) {
    case "approved":
      return {
        bg: "from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-800",
        glow: "rgba(16,185,129,0.4)",
        dot: "bg-emerald-400",
        pill: "bg-emerald-400/20 text-emerald-100 border-emerald-400/30",
      };
    case "denied":
      return {
        bg: "from-red-600 via-rose-600 to-pink-700 dark:from-red-700 dark:via-rose-700 dark:to-pink-800",
        glow: "rgba(239,68,68,0.4)",
        dot: "bg-red-400",
        pill: "bg-red-400/20 text-red-100 border-red-400/30",
      };
    case "action_required":
      return {
        bg: "from-amber-600 via-orange-600 to-yellow-700 dark:from-amber-700 dark:via-orange-700 dark:to-yellow-800",
        glow: "rgba(245,158,11,0.4)",
        dot: "bg-amber-400",
        pill: "bg-amber-400/20 text-amber-100 border-amber-400/30",
      };
    default:
      return {
        bg: "from-blue-600 via-indigo-600 to-violet-700 dark:from-blue-700 dark:via-indigo-700 dark:to-violet-800",
        glow: "rgba(99,102,241,0.4)",
        dot: "bg-blue-400",
        pill: "bg-blue-400/20 text-blue-100 border-blue-400/30",
      };
  }
}

/* ── Quick stat mini-card ─────────────────────────────────────── */
function QuickStat({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <div
      className="flex-1 min-w-[120px] rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 p-3 hover-lift"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1.5 text-white/60 mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-white leading-none animate-fade-in-scale">{value}</p>
    </div>
  );
}

export function CaseStatusOverview({
  receiptNumber,
  currentStatus,
  statusHistory,
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
  const hasLiveStatus = !isPlaceholderStatus(currentStatus);
  const gradient = getStatusGradient(explainer.category);

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

  // Rough progress % for the bar (based on common I-765 steps)
  const progressPct = hasLiveStatus
    ? explainer.category === "approved"
      ? 100
      : explainer.category === "denied"
        ? 100
        : statusHistoryLength <= 1
          ? 20
          : Math.min(80, 20 + statusHistoryLength * 15)
    : 5;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-2xl shadow-blue-900/10 dark:shadow-blue-900/30">
        {/* ── Hero gradient with animated mesh ──────────────────── */}
        <div
          className={cn(
            "relative px-5 py-7 sm:px-7 sm:py-8 text-white overflow-hidden",
            "bg-gradient-to-br animate-gradient-flow",
            gradient.bg
          )}
        >
          {/* Decorative mesh dots */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          {/* Decorative glow blob */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-white/8 blur-2xl" />

          <div className="relative z-10">
            {/* Top row: Status category + Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                {/* Status category pill */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn("w-2.5 h-2.5 rounded-full animate-glow-pulse", gradient.dot)}
                    style={{ "--glow-color": gradient.glow } as React.CSSProperties}
                  />
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                    gradient.pill
                  )}>
                    {hasLiveStatus ? explainer.title : "Checking USCIS"}
                  </span>
                </div>

                {/* Main status text */}
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight">
                  {formatStatusLabel(currentStatus, "Fetching your latest status…")}
                </h2>

                {/* Receipt & metadata chips */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/70">
                  <span className="font-mono inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {receiptNumber}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden />
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {serviceCenter}
                  </span>
                  {daysSinceFiled !== null && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden />
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {daysSinceFiled === 0
                          ? "Filed today"
                          : `${daysSinceFiled} day${daysSinceFiled === 1 ? "" : "s"} since filed`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/10"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-1.5", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "Refreshing…" : "Refresh"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyReceipt}
                  className="bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm shadow-lg shadow-black/10"
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

            {/* ── Quick Stats Row ────────────────────────────────── */}
            <div className="mt-6 flex flex-wrap gap-3">
              <QuickStat
                icon={<Calendar className="w-3.5 h-3.5" />}
                label="Days Since Filed"
                value={daysSinceFiled !== null ? `${daysSinceFiled}` : "—"}
                delay={0}
              />
              <QuickStat
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Last Change"
                value={daysSinceChange !== null ? `${daysSinceChange}d ago` : "—"}
                delay={100}
              />
              <QuickStat
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="Service Center"
                value={serviceCenter.split(" ")[0] || "—"}
                delay={200}
              />
              <QuickStat
                icon={<FileText className="w-3.5 h-3.5" />}
                label="Updates"
                value={`${statusHistoryLength}`}
                delay={300}
              />
            </div>

            {/* ── Last checked + auto-check info ──────────────────── */}
            <div className="mt-5 flex flex-col gap-1.5 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Last checked:{" "}
                <span className="font-medium text-white/90">
                  {lastCheckedAt ? formatDateTime(lastCheckedAt) : "Not yet"}
                </span>
              </p>
              {isPremium === true && lastCheckedAt && (
                <p className="text-white/50">{calculateNextAutoCheck(lastCheckedAt)}</p>
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

            {showNoChangeReassurance && (
              <p className="mt-3 text-sm text-white/60 rounded-xl bg-white/8 backdrop-blur-sm px-4 py-2.5 border border-white/10">
                No USCIS status change in the last {daysSinceChange} day
                {daysSinceChange === 1 ? "" : "s"} — we&apos;ll keep checking.
              </p>
            )}

            {/* ── Animated progress bar at bottom ─────────────────── */}
            <div className="mt-6 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-white/50 uppercase tracking-wider font-medium">
                <span>Case progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/60 to-white/90 animate-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Next steps section ────────────────────────────────── */}
        {nextSteps.length > 0 && (
          <div className="px-5 py-5 sm:px-7 bg-muted/30 border-t border-border/60">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
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
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm hover:border-blue-300 dark:hover:border-blue-700 hover-lift transition-all"
                    >
                      <span>
                        <span className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm hover:border-blue-300 dark:hover:border-blue-700 hover-lift transition-all"
                    >
                      <span>
                        <span className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
          statusHistory={statusHistory}
          lastStatusChangeAt={lastStatusChangeAt}
          lastCheckedAt={lastCheckedAt}
          formatLastChecked={formatDateTime}
        />
      )}
    </div>
  );
}
