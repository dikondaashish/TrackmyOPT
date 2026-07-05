"use client";

import { useState } from "react";
import { History, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDisplayDateLong } from "@/lib/case-status/safe-dates";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

interface UscisHistorySectionProps {
  history: CaseStatusHistoryEntry[];
}

const INITIAL_SHOW = 2;

function getIcon(status: string) {
  const s = status.toLowerCase();
  if (s.includes("approved") || s.includes("produced"))
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (s.includes("denied") || s.includes("rejected"))
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  if (s.includes("received") || s.includes("accepted"))
    return <FileCheck className="w-4 h-4 text-blue-500" />;
  return <Clock className="w-4 h-4 text-blue-400" />;
}

export function UscisHistorySection({ history }: UscisHistorySectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!history || history.length === 0) return null;

  const visible = expanded ? history : history.slice(0, INITIAL_SHOW);
  const hidden = history.length - INITIAL_SHOW;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <History className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">USCIS Update History</h2>
            <p className="text-xs text-muted-foreground">{history.length} total update{history.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {history.length > INITIAL_SHOW && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((p) => !p)}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1 text-xs"
          >
            {expanded ? (
              <><ChevronUp className="w-3.5 h-3.5" />Show less</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" />+{hidden} more</>
            )}
          </Button>
        )}
      </div>

      {/* Timeline entries */}
      <div className="relative space-y-3">
        {visible.length > 1 && (
          <div className="absolute left-[14px] top-8 bottom-4 w-0.5 bg-gradient-to-b from-emerald-400 via-blue-300 to-gray-200 dark:to-gray-700" />
        )}

        {visible.map((entry, i) => {
          const isFirst = i === 0;
          return (
            <EntryRow key={`${entry.date}-${i}`} entry={entry} isFirst={isFirst} />
          );
        })}
      </div>
    </div>
  );
}

function EntryRow({ entry, isFirst }: { entry: CaseStatusHistoryEntry; isFirst: boolean }) {
  const [showFull, setShowFull] = useState(isFirst);
  const hasDescription = Boolean(entry.description);
  const text = entry.description || entry.status;
  const truncated = text.length > 200;

  return (
    <div className="relative pl-9">
      {/* Dot */}
      <div
        className={cn(
          "absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center",
          isFirst
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md ring-4 ring-emerald-100 dark:ring-emerald-900/30"
            : "bg-white dark:bg-gray-900 border-2 border-emerald-400"
        )}
      >
        {isFirst ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        ) : (
          getIcon(entry.status)
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "p-3.5 rounded-xl border transition-colors",
          isFirst
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
            : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2">
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              isFirst
                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}
          >
            {formatDisplayDateLong(entry.date)}
          </span>
          {isFirst && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Most Recent
            </span>
          )}
        </div>

        {/* Status headline */}
        <p className={cn(
          "text-xs font-semibold mb-1",
          isFirst ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
        )}>
          {entry.status}
        </p>

        {/* Description (only show once — no duplicate) */}
        {hasDescription && (
          <>
            <p className={cn(
              "text-sm leading-relaxed",
              isFirst ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400",
              !showFull && truncated ? "line-clamp-3" : ""
            )}>
              {text}
            </p>
            {truncated && (
              <button
                onClick={() => setShowFull((p) => !p)}
                className="mt-1.5 text-xs text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
              >
                {showFull ? "Show less" : "Expand full notice"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
