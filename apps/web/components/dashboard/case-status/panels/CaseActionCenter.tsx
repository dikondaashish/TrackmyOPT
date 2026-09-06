"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileSearch,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildCaseActionPlan,
  type CaseActionPriority,
} from "@/lib/case-status/case-action-plan";
import { cn } from "@/lib/utils";

const PRIORITY_UI: Record<
  CaseActionPriority,
  { label: string; icon: typeof Eye; panel: string; iconBox: string }
> = {
  urgent: {
    label: "Action required",
    icon: AlertTriangle,
    panel: "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20",
    iconBox: "bg-red-600 text-white",
  },
  review: {
    label: "Review carefully",
    icon: FileSearch,
    panel: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20",
    iconBox: "bg-amber-500 text-white",
  },
  monitor: {
    label: "Monitoring",
    icon: Eye,
    panel: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
    iconBox: "bg-blue-600 text-white",
  },
  complete: {
    label: "USCIS milestone reached",
    icon: CheckCircle2,
    panel: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
    iconBox: "bg-emerald-600 text-white",
  },
};

export function CaseActionCenter({
  statusText,
  daysSinceFiled,
}: {
  statusText: string | null | undefined;
  daysSinceFiled: number | null;
}) {
  const plan = buildCaseActionPlan({ statusText, daysSinceFiled });
  const ui = PRIORITY_UI[plan.priority];
  const Icon = ui.icon;

  return (
    <Card
      className={cn("overflow-hidden border shadow-sm", ui.panel)}
      aria-labelledby="case-action-center-title"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", ui.iconBox)}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Case Action Center · {ui.label}
            </p>
            <h2 id="case-action-center-title" className="mt-1 text-lg font-extrabold text-foreground sm:text-xl">
              {plan.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/80">
              {plan.summary}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-black/5 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">What to do next</p>
          <p className="mt-1.5 text-sm leading-6 text-foreground">{plan.nextStep}</p>

          {plan.actions.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {plan.actions.map((action) => {
                const content = (
                  <>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block font-semibold">{action.label}</span>
                      {action.description && (
                        <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">
                          {action.description}
                        </span>
                      )}
                    </span>
                    {action.external ? (
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                  </>
                );

                return action.external ? (
                  <Button key={action.href} asChild variant="outline" className="h-auto min-h-11 justify-between gap-3 py-3">
                    <a href={action.href} target="_blank" rel="noopener noreferrer">{content}</a>
                  </Button>
                ) : (
                  <Button key={action.href} asChild variant="outline" className="h-auto min-h-11 justify-between gap-3 py-3">
                    <Link href={action.href}>{content}</Link>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Planning guidance only. Your USCIS notice and online account control.</p>
          <a
            href={plan.officialSource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {plan.officialSource.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </Card>
  );
}
