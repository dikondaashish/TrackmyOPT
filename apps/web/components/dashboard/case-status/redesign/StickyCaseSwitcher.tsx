"use client";

import { Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFilingCategoryShortLabel } from "@/lib/case-status/filing-category";

export type CaseState = "urgent" | "actionNeeded" | "inProgress" | "pending" | "approved";

interface CaseTab {
  id: string;
  receiptNumber: string;
  formType?: string | null;
  filingCategory?: string | null;
  caseState: CaseState;
  isPrimary?: boolean;
}

interface StickyCaseSwitcherProps {
  cases: CaseTab[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCase?: () => void;
  canAddMore?: boolean;
}

const STATE_CONFIG: Record<CaseState, { dot: string; bg: string; activeBg: string; border: string; label: string }> = {
  urgent:      { dot: "bg-red-500",    bg: "bg-red-50 dark:bg-red-950/30",     activeBg: "bg-red-100 dark:bg-red-900/50",    border: "border-red-200 dark:border-red-800",    label: "🔴" },
  actionNeeded:{ dot: "bg-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/30", activeBg: "bg-amber-100 dark:bg-amber-900/50",border: "border-amber-200 dark:border-amber-800", label: "⚠" },
  inProgress:  { dot: "bg-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30",   activeBg: "bg-blue-100 dark:bg-blue-900/50",  border: "border-blue-200 dark:border-blue-800",  label: "🔵" },
  pending:     { dot: "bg-gray-400",   bg: "bg-gray-50 dark:bg-gray-900/30",   activeBg: "bg-gray-100 dark:bg-gray-800/60",  border: "border-gray-200 dark:border-gray-700",  label: "⏳" },
  approved:    { dot: "bg-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-950/20",activeBg:"bg-emerald-100 dark:bg-emerald-900/40",border:"border-emerald-200 dark:border-emerald-800",label:"✅" },
};

const STATE_ORDER: CaseState[] = ["urgent", "actionNeeded", "inProgress", "pending", "approved"];

export function deriveCaseState(currentStatus: string | null | undefined): CaseState {
  if (!currentStatus) return "pending";
  const s = currentStatus.toLowerCase();
  if (s.includes("denied") || s.includes("revoked")) return "actionNeeded";
  if (s.includes("request for evidence") || s.includes("rfe") || s.includes("interview")) return "actionNeeded";
  if (s.includes("approved") || s.includes("card was produced") || s.includes("mailed")) return "approved";
  if (s.includes("premium processing") || s.includes("actively review") || s.includes("biometric")) return "inProgress";
  if (s.includes("received") || s.includes("initial review")) return "pending";
  return "pending";
}

export function StickyCaseSwitcher({ cases, selectedId, onSelect, onAddCase, canAddMore = true }: StickyCaseSwitcherProps) {
  const sorted = [...cases].sort(
    (a, b) => STATE_ORDER.indexOf(a.caseState) - STATE_ORDER.indexOf(b.caseState)
  );

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {sorted.map((c) => {
          const cfg = STATE_CONFIG[c.caseState];
          const isActive = c.id === selectedId;
          const short = c.receiptNumber.slice(-7);
          const typeLabel = getFilingCategoryShortLabel(c.filingCategory);

          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              aria-pressed={isActive}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer min-h-[36px]",
                isActive
                  ? cn(cfg.activeBg, cfg.border, "shadow-sm ring-1 ring-inset ring-current/10")
                  : cn(cfg.bg, "border-transparent hover:border-current/20")
              )}
            >
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot, isActive && "animate-pulse")} />
              <span className="font-mono text-xs font-semibold tracking-wide">
                {typeLabel} · {short}
              </span>
              {c.isPrimary && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
            </button>
          );
        })}

        {canAddMore && (
          <button
            onClick={onAddCase}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-700 text-muted-foreground hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[36px] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add case
          </button>
        )}
      </div>
    </div>
  );
}
