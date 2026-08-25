"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Clock, Phone, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";
import {
  detectPpStart,
  getPpClock,
  isPremiumProcessingActive,
  PP_BUSINESS_DAY_LIMIT,
  PP_CONTACT,
} from "@/lib/case-status/premium-processing";
import { formatDisplayDateNoon } from "@/lib/case-status/safe-dates";

type PremiumProcessingCountdownProps = {
  caseId: string;
  ppStartDate: string | null;
  currentStatus: string | null;
  statusHistory: CaseStatusHistoryEntry[];
  onSaved: () => void | Promise<void>;
};

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

  const active = isPremiumProcessingActive({
    statusHistory,
    currentStatus,
    manualPpStart: ppStartDate,
  });

  const resolvedStart = useMemo(
    () =>
      detectPpStart({
        statusHistory,
        currentStatus,
        manualPpStart: ppStartDate,
      }),
    [statusHistory, currentStatus, ppStartDate]
  );

  const clock = useMemo(
    () => (resolvedStart ? getPpClock(resolvedStart) : null),
    [resolvedStart]
  );

  if (!active) return null;

  const handleSavePpStart = async () => {
    if (!ppDateInput) {
      setSaveError("Please select the date USCIS started Premium Processing.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/case-status/pp-start", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, pp_start_date: ppDateInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data.error || "Could not save PP start date.");
        return;
      }
      setPpDateInput("");
      await onSaved();
    } catch {
      setSaveError("Could not save PP start date.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-lg",
        clock?.isOverdue
          ? "ring-2 ring-red-500/40 shadow-red-500/10"
          : "shadow-amber-500/10"
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "px-5 py-5 sm:px-7 text-white",
          clock?.isOverdue
            ? "bg-gradient-to-br from-red-600 via-rose-600 to-orange-700"
            : "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
            {clock?.isOverdue ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Timer className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
              Premium Processing
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold mt-0.5">
              {clock?.isOverdue
                ? `Overdue by ${clock.daysOverdue} business day${clock.daysOverdue === 1 ? "" : "s"}`
                : clock
                  ? `${clock.daysRemaining} business day${clock.daysRemaining === 1 ? "" : "s"} remaining`
                  : "PP active — add start date"}
            </h3>
            {clock && (
              <p className="text-sm text-white/90 mt-1">
                Deadline:{" "}
                <span className="font-bold">{formatDisplayDateNoon(clock.deadline)}</span>
                <span className="text-white/70">
                  {" "}
                  ({PP_BUSINESS_DAY_LIMIT} business days from{" "}
                  {formatDisplayDateNoon(clock.ppStart)})
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4 bg-card">
        {!clock && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              USCIS shows Premium Processing on your case, but we need the start date to
              run the {PP_BUSINESS_DAY_LIMIT}-business-day clock.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="date"
                value={ppDateInput}
                onChange={(e) => setPpDateInput(e.target.value)}
                className="h-9 text-sm"
                aria-label="Premium Processing start date"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSavePpStart()}
                disabled={saving || !ppDateInput}
              >
                {saving ? "Saving…" : "Save PP start date"}
              </Button>
            </div>
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
            )}
          </div>
        )}

        {clock?.isOverdue && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Past the {PP_BUSINESS_DAY_LIMIT}-business-day PP target — contact USCIS
            </p>
            <p className="text-sm text-red-800 dark:text-red-200 mt-2">
              {PP_CONTACT.guidance}
            </p>
            <a
              href={`tel:${PP_CONTACT.phone}`}
              className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-red-700 dark:text-red-300 hover:underline"
            >
              <Phone className="w-4 h-4" />
              USCIS Contact Center {PP_CONTACT.phoneDisplay}
            </a>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
              {PP_CONTACT.hours}
            </p>
          </div>
        )}

        {clock && !clock.isOverdue && (
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            USCIS targets a decision within {PP_BUSINESS_DAY_LIMIT} business days of
            Premium Processing. We&apos;ll keep checking your case automatically.
          </p>
        )}
      </div>
    </Card>
  );
}
