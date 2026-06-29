"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Star, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceCenterLabel } from "@/lib/case-status/case-status-display";
import { getCurrentStatusDetail } from "@/lib/case-status/current-status-detail";
import { normalizeStatusHistory } from "@/lib/case-status/normalize-status-history";

export type TrackedCaseSummary = {
  id: string;
  receipt_number: string;
  current_status: string | null;
  label?: string | null;
  is_primary?: boolean | null;
  case_type?: string | null;
  status_history?: { date: string; status: string; description?: string }[];
};

type CaseListSwitcherProps = {
  cases: TrackedCaseSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onAddCase: () => void;
  onDelete: (caseId: string) => void;
  removingCaseId?: string | null;
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
  onDelete,
  removingCaseId = null,
  canAddMore,
}: CaseListSwitcherProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const validIds = new Set(cases.map((c) => c.id));
    setExpandedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [cases]);

  if (cases.length === 0) return null;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

          const dotColor = getStatusDotColor(c.current_status);
          const isExpanded = expandedIds.has(c.id);
          const isRemoving = removingCaseId === c.id;
          const deleteDisabled = Boolean(removingCaseId);

          const statusDetail = getCurrentStatusDetail({
            currentStatus: c.current_status,
            statusHistory: normalizeStatusHistory(c.status_history),
          });
          const hasDescription = Boolean(statusDetail.description);

          return (
            <div
              key={c.id}
              className={cn(
                "relative shrink-0 min-w-[280px] max-w-[340px]",
                isRemoving && "opacity-70"
              )}
            >
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                disabled={deleteDisabled}
                className={cn(
                  "absolute top-3 right-3 z-20 p-1.5 rounded-md border border-transparent",
                  "text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200",
                  "dark:hover:bg-red-950/40 dark:hover:border-red-900/50",
                  "transition-colors disabled:opacity-40 disabled:pointer-events-none"
                )}
                aria-label={`Stop tracking ${c.receipt_number}`}
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>

              <div
                role="button"
                tabIndex={isRemoving ? -1 : 0}
                onClick={() => !isRemoving && onSelect(c.id)}
                onKeyDown={(e) => {
                  if (isRemoving) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(c.id);
                  }
                }}
                aria-disabled={isRemoving}
                className={cn(
                  "text-left rounded-2xl border p-4 pr-11 transition-all duration-300 flex flex-col cursor-pointer",
                  isSelected
                    ? "border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/30 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover-lift",
                  isRemoving && "pointer-events-none"
                )}
              >
                {isSelected && (
                  <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                      <p className="text-sm font-bold truncate">{title}</p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate pl-4 ph-mask" data-ph-mask>
                      {c.receipt_number}
                    </p>
                  </div>
                  {c.is_primary && (
                    <Star
                      className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500 drop-shadow-sm mt-0.5"
                      aria-label="Primary case"
                    />
                  )}
                </div>

                <div className="pl-4 mt-3 flex-1 flex flex-col">
                  <p className="text-xs font-bold text-foreground">{statusDetail.title}</p>

                  {hasDescription && (
                    <div className="mt-1">
                      <p
                        className={cn(
                          "text-[11.5px] text-muted-foreground leading-relaxed whitespace-pre-line",
                          !isExpanded && "line-clamp-4"
                        )}
                      >
                        {statusDetail.description}
                      </p>
                      {(statusDetail.description?.length ?? 0) > 120 && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => toggleExpand(c.id, e)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleExpand(c.id, e as unknown as React.MouseEvent);
                            }
                          }}
                          className="text-[11.5px] text-blue-600 dark:text-blue-400 cursor-pointer font-medium hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          {isExpanded ? "Show less" : "Show full USCIS text"}
                        </span>
                      )}
                    </div>
                  )}

                  {statusDetail.date && (
                    <p className="text-[11px] text-muted-foreground/70 mt-2">{statusDetail.date}</p>
                  )}
                </div>

                {!c.is_primary && isSelected && (
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pl-4 self-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetPrimary(c.id);
                    }}
                  >
                    Set as dashboard primary
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
