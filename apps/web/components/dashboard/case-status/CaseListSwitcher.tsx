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
        <p className="text-sm font-medium text-muted-foreground">
          Your cases ({cases.length})
        </p>
        {canAddMore && (
          <Button type="button" variant="outline" size="sm" onClick={onAddCase}>
            <Plus className="w-4 h-4 mr-1" />
            Add case
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {cases.map((c) => {
          const isSelected = c.id === selectedId;
          const title =
            c.label?.trim() ||
            c.case_type ||
            getServiceCenterLabel(c.receipt_number);
          const status = formatStatusLabel(c.current_status, "Pending");

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "shrink-0 min-w-[200px] max-w-[260px] text-left rounded-xl border p-3 transition-colors",
                isSelected
                  ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 ring-1 ring-blue-500/40"
                  : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{title}</p>
                  <p className="text-xs font-mono text-muted-foreground truncate ph-mask" data-ph-mask>
                    {c.receipt_number.slice(0, 3)}••••••••••
                  </p>
                </div>
                {c.is_primary && (
                  <Star
                    className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500"
                    aria-label="Primary case"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{status}</p>
              {!c.is_primary && isSelected && (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
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
