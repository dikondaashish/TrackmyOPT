"use client";

import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { formatDisplayDateMonthDay } from "@/lib/case-status/safe-dates";
import type { OptComplianceAction } from "@/lib/case-status/opt-compliance-actions";
import { cn } from "@/lib/utils";

interface DsoDeadlineManagerProps {
  tasks: OptComplianceAction[];
}

const STATUS_ICON: Record<OptComplianceAction["status"], React.ReactNode> = {
  done:    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
  open:    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  overdue: <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />,
};

const STATUS_LABEL: Record<OptComplianceAction["status"], string> = {
  done:    "Done",
  open:    "Open",
  overdue: "Overdue",
};

export function DsoDeadlineManager({ tasks }: DsoDeadlineManagerProps) {
  const open    = tasks.filter((t) => t.status === "open" || t.status === "overdue");
  const done    = tasks.filter((t) => t.status === "done");

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-foreground">DSO &amp; Compliance Tasks</p>
        <span className="text-xs text-muted-foreground">
          {open.length} open · {done.length} done
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors",
              task.status === "overdue" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
              task.status === "open"    && "bg-white dark:bg-gray-900/30 border-gray-200 dark:border-gray-800",
              task.status === "done"    && "bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800 opacity-70"
            )}
          >
            {STATUS_ICON[task.status]}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium leading-tight",
                task.status === "done" && "line-through text-muted-foreground"
              )}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
              <a
                href={task.sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex min-h-11 items-center text-xs font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
              >
                Official guidance
              </a>
            </div>
            <div className="flex-shrink-0 text-right">
              {task.dueDate && task.status !== "done" && (
                <p className={cn(
                  "text-xs font-semibold",
                  task.status === "overdue" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                )}>
                  Due {formatDisplayDateMonthDay(task.dueDate)}
                </p>
              )}
              {task.status === "done" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {STATUS_LABEL[task.status]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
