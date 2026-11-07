"use client";

import { Crown, Shield } from "lucide-react";
import { PLAN_PICKER_GUIDE, shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";

export function PlanPickerGuide({ compact = false }: { compact?: boolean }) {
  const showDedicated = shouldShowDedicatedPlanForSale();
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-border bg-card p-3 md:p-3.5 text-left"
          : "rounded-xl border border-border bg-surface p-6 text-left"
      }
    >
      <h3
        className={
          compact
            ? "text-sm font-semibold text-foreground mb-2"
            : "text-lg font-bold text-foreground mb-4"
        }
      >
        {PLAN_PICKER_GUIDE.title}
      </h3>
      <div
        className={
          compact
            ? "space-y-2"
            : showDedicated
              ? "grid sm:grid-cols-2 gap-4"
              : "grid gap-4"
        }
      >
        <div className="flex gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <p className={compact ? "text-xs text-muted-foreground leading-snug" : "text-sm text-muted-foreground"}>
            <span className="font-semibold text-foreground">Pro — </span>
            {PLAN_PICKER_GUIDE.proLine}
          </p>
        </div>
        {showDedicated ? (
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className={compact ? "text-xs text-muted-foreground leading-snug" : "text-sm text-muted-foreground"}>
              <span className="font-semibold text-foreground">Dedicated — </span>
              {PLAN_PICKER_GUIDE.dedicatedLine}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
