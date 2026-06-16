"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MilestoneStatus = "done" | "active" | "upcoming";

interface Milestone {
  key: string;
  label: string;
  date: string | null;
  status: MilestoneStatus;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

function formatShort(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch { return "—"; }
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <div>
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          return (
            <div key={m.key} className="flex items-start flex-1 last:flex-initial">
              <div className="flex flex-col items-center min-w-0 flex-1">
                {/* Node */}
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                  m.status === "done"    && "bg-emerald-500 shadow-md shadow-emerald-500/30",
                  m.status === "active"  && "bg-blue-500 shadow-md shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/30",
                  m.status === "upcoming"&& "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
                )}>
                  {m.status === "done"    && <CheckCircle2 className="w-4 h-4 text-white" />}
                  {m.status === "active"  && <Loader2 className="w-4 h-4 text-white animate-spin" />}
                  {m.status === "upcoming"&& <Circle className="w-4 h-4 text-gray-400" />}
                </div>
                {/* Label */}
                <span className={cn(
                  "mt-2 text-[10px] font-semibold text-center leading-tight px-1 max-w-[80px]",
                  m.status === "done"    && "text-emerald-600 dark:text-emerald-400",
                  m.status === "active"  && "text-blue-600 dark:text-blue-400",
                  m.status === "upcoming"&& "text-muted-foreground"
                )}>
                  {m.label}
                </span>
                {/* Date */}
                <span className="mt-0.5 text-[9px] text-muted-foreground text-center">
                  {formatShort(m.date)}
                </span>
              </div>
              {/* Connector */}
              {!isLast && (
                <div className="flex-1 mt-4 mx-1">
                  <div className="h-0.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all",
                      m.status === "done"   ? "bg-emerald-400 w-full" :
                      m.status === "active" ? "bg-blue-400 w-1/2" : "w-0"
                    )} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-3">
        {milestones.map((m) => (
          <div key={m.key} className="flex items-center gap-3">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
              m.status === "done"    && "bg-emerald-500",
              m.status === "active"  && "bg-blue-500 ring-3 ring-blue-100 dark:ring-blue-900/30",
              m.status === "upcoming"&& "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
            )}>
              {m.status === "done"    && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              {m.status === "active"  && <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />}
              {m.status === "upcoming"&& <Circle className="w-3.5 h-3.5 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-semibold",
                m.status === "done"    && "text-emerald-600 dark:text-emerald-400",
                m.status === "active"  && "text-blue-600 dark:text-blue-400",
                m.status === "upcoming"&& "text-muted-foreground"
              )}>{m.label}</p>
              <p className="text-[10px] text-muted-foreground">{formatShort(m.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildMilestones(
  optFiledDate: string | null,
  eadProjected: string | null,
  stemWindowOpens: string | null,
  stemFiled?: string | null
): Milestone[] {
  const now = Date.now();
  const isPast = (iso: string | null) => iso ? new Date(iso).getTime() < now : false;

  return [
    {
      key: "f1",
      label: "F-1 Active",
      date: null,
      status: "done",
    },
    {
      key: "opt-filed",
      label: "OPT Filed",
      date: optFiledDate,
      status: isPast(optFiledDate) ? "done" : "upcoming",
    },
    {
      key: "ead",
      label: "EAD Decision",
      date: eadProjected,
      status: !eadProjected ? "upcoming"
        : isPast(eadProjected) ? "done"
        : "active",
    },
    {
      key: "employment",
      label: "Employment",
      date: eadProjected,
      status: !eadProjected ? "upcoming" : isPast(eadProjected) ? "done" : "upcoming",
    },
    {
      key: "stem-window",
      label: "STEM Window",
      date: stemWindowOpens,
      status: !stemWindowOpens ? "upcoming" : isPast(stemWindowOpens) ? "done" : "upcoming",
    },
    {
      key: "stem-filed",
      label: "STEM Filed",
      date: stemFiled ?? null,
      status: stemFiled ? (isPast(stemFiled) ? "done" : "active") : "upcoming",
    },
    {
      key: "h1b",
      label: "H-1B",
      date: null,
      status: "upcoming",
    },
  ];
}
