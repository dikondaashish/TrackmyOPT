"use client";

import { RefreshCw, Copy, Settings2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CaseProgressStepper } from "@/components/dashboard/case-status/CaseProgressStepper";
import { getServiceCenterLabel } from "@/lib/case-status/case-status-display";
import { cn } from "@/lib/utils";
import type { CaseState } from "./StickyCaseSwitcher";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";
import { useState } from "react";

interface StatCardProps {
  value: string;
  label: string;
  sublabel?: string;
  urgent?: boolean;
}

function StatCard({ value, label, sublabel, urgent }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex-1 min-w-0 rounded-xl px-3 py-2.5 text-center border",
        urgent
          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800"
      )}
    >
      <p className={cn("text-xl font-extrabold leading-tight", urgent ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100")}>
        {value}
      </p>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-tight mt-0.5">{label}</p>
      {sublabel && <p className={cn("text-[10px] mt-0.5 font-medium", urgent ? "text-red-500" : "text-muted-foreground")}>{sublabel}</p>}
    </div>
  );
}

function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return "—"; }
}

function daysSince(dateString: string | null | undefined): number {
  if (!dateString) return 0;
  try {
    return Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  } catch { return 0; }
}

interface CaseHeroCardProps {
  caseStatus: {
    id: string;
    receipt_number: string;
    case_type?: string | null;
    received_date?: string | null;
    last_status_change_at?: string | null;
    current_status?: string | null;
    status_history?: CaseStatusHistoryEntry[];
    pp_start_date?: string | null;
  };
  caseState: CaseState;
  ppOverdueDays?: number;
  ppDeadlineDate?: string | null;
  updateCount?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onManageCase?: () => void;
  refreshError?: string | null;
}

export function CaseHeroCard({
  caseStatus,
  caseState,
  ppOverdueDays = 0,
  ppDeadlineDate,
  updateCount = 0,
  isRefreshing = false,
  onRefresh,
  onManageCase,
  refreshError,
}: CaseHeroCardProps) {
  const [copied, setCopied] = useState(false);

  const days = daysSince(caseStatus.received_date);
  const serviceCenter = getServiceCenterLabel(caseStatus.receipt_number);
  const lastChangeDate = caseStatus.last_status_change_at
    ? formatDateShort(caseStatus.last_status_change_at)
    : "—";
  const ppActive = Boolean(caseStatus.pp_start_date);
  const isUrgent = caseState === "urgent";

  const handleCopy = () => {
    void navigator.clipboard.writeText(caseStatus.receipt_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card className="p-5 sm:p-6 border-0 shadow-lg overflow-hidden">
      {/* Identity header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-bold text-foreground text-base">{caseStatus.case_type || "I-765"}</span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="font-mono font-semibold ph-mask" data-ph-mask>{caseStatus.receipt_number}</span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span>{serviceCenter}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            {caseStatus.received_date && (
              <span>Filed: {formatDateShort(caseStatus.received_date)}</span>
            )}
            {days > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span>Day {days}</span>
              </>
            )}
            {ppActive && (
              <>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span className={cn("font-semibold", isUrgent ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>
                  {isUrgent ? "PP Overdue" : "Premium Processing Active"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      {caseStatus.current_status && (
        <div className="mb-5">
          <CaseProgressStepper
            currentStatus={caseStatus.current_status}
            statusHistory={caseStatus.status_history}
          />
        </div>
      )}

      {/* 4-stat strip */}
      <div className="flex gap-2 mb-5 flex-wrap sm:flex-nowrap">
        <StatCard value={days > 0 ? `${days}d` : "—"} label="Since filed" />
        <StatCard value={String(updateCount)} label="USCIS updates" />
        <StatCard value={lastChangeDate} label="Last change" />
        {ppOverdueDays > 0 ? (
          <StatCard
            value={`${ppOverdueDays}d`}
            label="PP overdue"
            sublabel="Deadline exceeded"
            urgent
          />
        ) : ppDeadlineDate ? (
          <StatCard value={formatDateShort(ppDeadlineDate)} label="PP deadline" />
        ) : null}
      </div>

      {/* Inline actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />}
          {isRefreshing ? "Checking…" : "Refresh"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy receipt"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onManageCase}
          className="gap-2"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Manage case
        </Button>
      </div>

      {refreshError && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{refreshError}</p>
      )}
    </Card>
  );
}
