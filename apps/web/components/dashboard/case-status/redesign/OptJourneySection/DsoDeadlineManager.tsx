"use client";

import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskStatus = "open" | "done" | "overdue";

interface DsoTask {
  id: string;
  title: string;
  dueDate?: string;
  status: TaskStatus;
  description: string;
}

interface DsoDeadlineManagerProps {
  tasks: DsoTask[];
}

function fmt(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return ""; }
}

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  done:    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
  open:    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  overdue: <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />,
};

const STATUS_LABEL: Record<TaskStatus, string> = {
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
            </div>
            <div className="flex-shrink-0 text-right">
              {task.dueDate && task.status !== "done" && (
                <p className={cn(
                  "text-xs font-semibold",
                  task.status === "overdue" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                )}>
                  Due {fmt(task.dueDate)}
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

// `now` is passed explicitly so the caller can use a client-only Date,
// preventing hydration mismatch #418. When null (SSR), no task is overdue.
export function buildDefaultDsoTasks(filedDate: string | null, now: Date | null = null): DsoTask[] {
  function addDays(iso: string | null, days: number): string | undefined {
    if (!iso) return undefined;
    try {
      const d = new Date(iso);
      d.setDate(d.getDate() + days);
      return d.toISOString();
    } catch { return undefined; }
  }

  const employerDue = addDays(filedDate, 10);
  const evalDue = addDays(filedDate, 180);

  const isOverdue = (iso?: string) => (iso && now) ? new Date(iso) < now : false;

  return [
    {
      id: "report-employer",
      title: "Report new employer to DSO",
      dueDate: employerDue,
      status: isOverdue(employerDue) ? "overdue" : "open",
      description: "Required within 10 days of starting employment on OPT.",
    },
    {
      id: "i983-plan",
      title: "I-983 Training Plan signed",
      dueDate: undefined,
      status: "open",
      description: "Required for STEM OPT extension — employer must sign.",
    },
    {
      id: "self-eval",
      title: "6-month self-evaluation",
      dueDate: evalDue,
      status: isOverdue(evalDue) ? "overdue" : "open",
      description: "Complete with employer supervisor at 6-month mark.",
    },
    {
      id: "address-change",
      title: "Address change reported",
      dueDate: undefined,
      status: "done",
      description: "Required within 10 days of moving to a new address.",
    },
  ];
}
