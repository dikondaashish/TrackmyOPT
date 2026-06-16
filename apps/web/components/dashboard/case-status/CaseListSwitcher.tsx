"use client";

import { cn } from "@/lib/utils";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatStatusLabel } from "@/lib/case-status/case-status-display";
import { getServiceCenterLabel } from "@/lib/case-status/case-status-display";

export type TrackedCaseSummary = {
  id: string;
  receipt_number: string;
  current_status: string | null;
  label?: string | null;
  is_primary?: boolean | null;
  case_type?: string | null;
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

/* ── Status category → dot color ─────────────────────────────── */
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

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {cases.map((c) => {
          const isSelected = c.id === selectedId;
          const title =
            c.label?.trim() ||
            c.case_type ||
            getServiceCenterLabel(c.receipt_number);
          const status = formatStatusLabel(c.current_status, "Pending");
          const dotColor = getStatusDotColor(c.current_status);

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "shrink-0 min-w-[210px] max-w-[270px] text-left rounded-2xl border p-4 transition-all duration-300 relative group",
                isSelected
                  ? "border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/30 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                  : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover-lift"
              )}
            >
              {/* Active indicator bar at top */}
              {isSelected && (
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                    <p className="text-sm font-bold truncate">{title}</p>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate ph-mask pl-4" data-ph-mask>
                    {c.receipt_number.slice(0, 3)}••••••••••
                  </p>
                </div>
                {c.is_primary && (
                  <Star
                    className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500 drop-shadow-sm"
                    aria-label="Primary case"
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 pl-4">{status}</p>

              {!c.is_primary && isSelected && (
                <button
                  type="button"
                  className="mt-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pl-4"
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
