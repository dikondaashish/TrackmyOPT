"use client";

import { cn } from "@/lib/utils";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UscisOfficialStatusBlock } from "@/components/dashboard/case-status/UscisOfficialStatusBlock";
import { getCurrentStatusDetail } from "@/lib/case-status/current-status-detail";
import { getServiceCenterLabel } from "@/lib/case-status/case-status-display";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

export type TrackedCaseSummary = {
  id: string;
  receipt_number: string;
  current_status: string | null;
  label?: string | null;
  is_primary?: boolean | null;
  case_type?: string | null;
  status_history?: CaseStatusHistoryEntry[];
  last_status_change_at?: string | null;
};

type CaseListSwitcherProps = {
  cases: TrackedCaseSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onAddCase: () => void;
  canAddMore: boolean;
  isPremium: boolean | null;
};

function getStatusDotColor(status: string | null): string {
  const s = (status ?? "").toLowerCase();
  if (s.includes("approved") || s.includes("produced")) return "bg-emerald-500";
  if (s.includes("denied") || s.includes("rejected")) return "bg-red-500";
  if (s.includes("rfe") || s.includes("evidence")) return "bg-amber-500";
  if (!s || s.includes("checking") || s.includes("fetching")) return "bg-gray-400";
  return "bg-blue-500";
}

export function CaseListSwitcher({
  cases,
  selectedId,
  onSelect,
  onSetPrimary,
  onAddCase,
  canAddMore,
}: CaseListSwitcherProps) {
  if (cases.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Your cases ({cases.length})
        </p>
        {canAddMore && (
          <Button type="button" variant="outline" size="sm" onClick={onAddCase} className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" />
            Add case
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cases.map((c) => {
          const isSelected = c.id === selectedId;
          const caseLabel =
            c.label?.trim() ||
            c.case_type ||
            getServiceCenterLabel(c.receipt_number);
          const dotColor = getStatusDotColor(c.current_status);
          const statusDetail = getCurrentStatusDetail({
            currentStatus: c.current_status,
            statusHistory: c.status_history ?? [],
            lastStatusChangeAt: c.last_status_change_at,
          });

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full text-left rounded-2xl border p-4 sm:p-5 transition-all duration-300 relative",
                isSelected
                  ? "border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/30 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10 sm:col-span-2"
                  : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover-lift"
              )}
            >
              {isSelected && (
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                    <p className="text-sm font-bold text-foreground">{caseLabel}</p>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-1 pl-4">
                    {c.receipt_number}
                  </p>
                </div>
                {c.is_primary && (
                  <Star
                    className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500 drop-shadow-sm"
                    aria-label="Primary case"
                  />
                )}
              </div>

              <div className="mt-4 pl-4 border-t border-border/50 pt-4">
                {isSelected ? (
                  <UscisOfficialStatusBlock
                    title={statusDetail.title}
                    description={statusDetail.description}
                    date={statusDetail.date}
                    defaultExpanded
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{statusDetail.title}</p>
                )}
              </div>

              {!c.is_primary && isSelected && (
                <button
                  type="button"
                  className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pl-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPrimary(c.id);
                  }}
                >
                  Set as dashboard primary
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
