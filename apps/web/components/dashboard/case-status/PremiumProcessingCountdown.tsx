"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Phone, Timer, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";
import {
  detectPpStart,
  getPpClock,
  isPremiumProcessingActive,
  PP_BUSINESS_DAY_LIMIT,
  PP_CONTACT,
} from "@/lib/case-status/premium-processing";

type PremiumProcessingCountdownProps = {
  caseId: string;
  ppStartDate: string | null;
  currentStatus: string | null;
  statusHistory: CaseStatusHistoryEntry[];
  onSaved: () => void | Promise<void>;
};

function fmtDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PremiumProcessingCountdown({
  caseId,
  ppStartDate,
  currentStatus,
  statusHistory,
  onSaved,
}: PremiumProcessingCountdownProps) {
  const [ppDateInput, setPpDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const active = isPremiumProcessingActive({ statusHistory, currentStatus, manualPpStart: ppStartDate });
  const resolvedStart = useMemo(
    () => detectPpStart({ statusHistory, currentStatus, manualPpStart: ppStartDate }),
    [statusHistory, currentStatus, ppStartDate]
  );
  const clock = useMemo(() => (resolvedStart ? getPpClock(resolvedStart) : null), [resolvedStart]);

  if (!active) return null;

  const isOverdue = clock?.isOverdue ?? false;
  const accent = isOverdue ? "#FF3B30" : "#FF9F0A";
  const iconBg = isOverdue ? "bg-red-50 dark:bg-red-950/30" : "bg-amber-50 dark:bg-amber-950/30";
  const iconColor = isOverdue ? "text-red-500" : "text-amber-500";
  const borderAccent = isOverdue ? "border-l-red-500" : "border-l-amber-500";
  const borderCard = isOverdue ? "border-red-100 dark:border-red-900/40" : "border-amber-100 dark:border-amber-900/40";
  const numBg = isOverdue ? "bg-red-50/60 dark:bg-red-950/20 border-red-100 dark:border-red-900/30" : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30";

  const handleSavePpStart = async () => {
    if (!ppDateInput) { setSaveError("Please select a date."); return; }
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch("/api/case-status/pp-start", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, pp_start_date: ppDateInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setSaveError(data.error || "Could not save."); return; }
      setPpDateInput("");
      await onSaved();
    } catch {
      setSaveError("Could not save PP start date.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border border-l-[5px] rounded-2xl shadow-lg overflow-hidden",
        borderCard,
        borderAccent
      )}
      role="alert"
    >
      <div className="flex items-stretch">
        {/* Main content */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 p-5 sm:p-6 flex-1 min-w-0">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", iconBg)}>
            {isOverdue
              ? <AlertTriangle className={cn("w-7 h-7", iconColor)} />
              : <Timer className={cn("w-7 h-7", iconColor)} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("text-[11px] font-bold uppercase tracking-[0.4px]", iconColor)}>
                Premium Processing
              </span>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-lg", isOverdue ? "bg-red-50 text-red-500 dark:bg-red-950/40" : "bg-amber-50 text-amber-500 dark:bg-amber-950/40")}>
                {isOverdue ? "Deadline passed" : "Active"}
              </span>
            </div>
            <h3 className="text-[17px] sm:text-lg font-bold mt-1.5 text-gray-900 dark:text-gray-100 leading-snug">
              {!clock
                ? "PP active — add start date to track deadline"
                : isOverdue
                  ? "Premium processing deadline has passed"
                  : `Decision due in ${clock.daysRemaining} business day${clock.daysRemaining === 1 ? "" : "s"}`}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug">
              {clock
                ? isOverdue
                  ? `USCIS committed to a decision by ${fmtDate(clock.deadline)} (${PP_BUSINESS_DAY_LIMIT} business days). It's now ${clock.daysOverdue} day${clock.daysOverdue === 1 ? "" : "s"} overdue.`
                  : `Deadline: ${fmtDate(clock.deadline)} · Started ${fmtDate(clock.ppStart)}`
                : "We detected Premium Processing on your case but need the start date to run the 15-business-day clock."}
            </p>
            {!clock && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
                <Input
                  type="date"
                  value={ppDateInput}
                  onChange={(e) => setPpDateInput(e.target.value)}
                  className="h-8 text-sm max-w-[180px]"
                  aria-label="Premium Processing start date"
                />
                <Button size="sm" onClick={() => void handleSavePpStart()} disabled={saving || !ppDateInput}>
                  {saving ? "Saving…" : "Set start date"}
                </Button>
                {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Big number */}
        {clock && (
          <div className={cn("flex flex-col items-center justify-center px-5 sm:px-7 border-x shrink-0", numBg)}>
            <div className={cn("text-[34px] sm:text-[38px] font-bold leading-none", iconColor)}>
              {isOverdue ? `+${clock.daysOverdue}` : clock.daysRemaining}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 whitespace-nowrap text-center font-medium">
              {isOverdue ? "days overdue" : "days left"}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {clock && (
          <div className="flex flex-col gap-2 p-4 sm:p-5 justify-center shrink-0">
            <a
              href={`tel:${PP_CONTACT.phone}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap",
                isOverdue ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
              )}
            >
              <Phone className="w-4 h-4" />
              Contact USCIS PP
            </a>
            <a
              href="https://egov.uscis.gov/casestatus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              USCIS.gov
            </a>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {clock && (
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: clock.isOverdue
                ? "100%"
                : `${Math.max(4, Math.round((1 - clock.daysRemaining / PP_BUSINESS_DAY_LIMIT) * 100))}%`,
              background: accent,
            }}
          />
        </div>
      )}
    </div>
  );
}
