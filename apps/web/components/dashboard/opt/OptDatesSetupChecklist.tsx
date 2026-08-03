"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import type { OptDatesStatusSnapshot } from "@/lib/immigration/opt-dates-page-utils";
import { cn } from "@/lib/utils";

interface OptDatesSetupChecklistProps {
  status: OptDatesStatusSnapshot;
  isDirty?: boolean;
  onScrollToEmployment?: () => void;
}

const STEPS = [
  {
    key: "hasProgramEnd" as const,
    label: "Program end date saved",
    hint: "Needed for OPT filing window",
    anchor: "#dates-before-opt",
  },
  {
    key: "hasOptStart" as const,
    label: "OPT start date saved",
    hint: "From your EAD card",
    anchor: "#dates-on-opt",
  },
  {
    key: "hasEmployment" as const,
    label: "At least one job added",
    hint: "Required for unemployment tracking",
    anchor: "#employment",
    isEmployment: true,
  },
  {
    key: "clockActive" as const,
    label: "Unemployment clock active",
    hint: "Shows your real compliance count",
    anchor: "#employment",
    isEmployment: true,
  },
];

export function OptDatesSetupChecklist({
  status,
  isDirty,
  onScrollToEmployment,
}: OptDatesSetupChecklistProps) {
  const allDone = status.checklistComplete === status.checklistTotal;

  if (allDone) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Setup complete — your OPT dates and employment history are tracked.
          </p>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
            Check the summary above anytime. Update jobs when you change employers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Your setup checklist</h2>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {status.checklistComplete}/{status.checklistTotal} done
        </span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        On active OPT, most students complete steps 2 and 3. Step 4 activates once job history is in place.
      </p>
      {isDirty && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          You have unsaved date changes — click <strong>Save Dates</strong> to keep them.
        </p>
      )}
      <ul className="space-y-2">
        {STEPS.map((step) => {
          const done = status[step.key];
          const Icon = done ? CheckCircle2 : Circle;
          const handleClick = step.isEmployment && onScrollToEmployment
            ? (e: React.MouseEvent) => {
                if (step.isEmployment) {
                  e.preventDefault();
                  onScrollToEmployment();
                }
              }
            : undefined;

          return (
            <li key={step.key}>
              <Link
                href={step.anchor}
                onClick={handleClick}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50",
                  done && "opacity-80"
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                />
                <div>
                  <p className={cn("text-sm font-medium", done && "line-through text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.hint}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
