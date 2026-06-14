"use client";

import { Clock, Calendar, FileText } from "lucide-react";
import type { OptDatesStatusSnapshot } from "@/lib/immigration/optDatesPageUtils";
import { cn } from "@/lib/utils";

interface OptDatesStatusSummaryProps {
  status: OptDatesStatusSnapshot;
}

const toneStyles = {
  neutral: "border-border bg-card",
  good: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
  warning: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
  critical: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
};

const valueStyles = {
  neutral: "text-foreground",
  good: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
  critical: "text-red-700 dark:text-red-400",
};

function StatCard({
  icon,
  label,
  value,
  detail,
  tone,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: keyof typeof toneStyles;
  href?: string;
}) {
  const content = (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        toneStyles[tone],
        href && "hover:shadow-md cursor-pointer"
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("text-xl font-bold tracking-tight", valueStyles[tone])}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {content}
      </a>
    );
  }
  return content;
}

export function OptDatesStatusSummary({ status }: OptDatesStatusSummaryProps) {
  if (!status.hasProgramEnd && !status.hasOptStart) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label="Unemployment"
        value={status.unemploymentLabel}
        detail={status.unemploymentDetail}
        tone={status.unemploymentTone}
        href={status.hasOptStart ? "#employment" : undefined}
      />
      <StatCard
        icon={<Calendar className="h-4 w-4" />}
        label="OPT expires in"
        value={status.optEndLabel}
        detail={status.optEndDetail}
        tone={
          status.optEndLabel === "Expired"
            ? "critical"
            : status.optEndDaysLeft !== null && status.optEndDaysLeft <= 90
              ? "warning"
              : "neutral"
        }
      />
      <StatCard
        icon={<FileText className="h-4 w-4" />}
        label="Filing window"
        value={status.filingLabel}
        detail={status.filingDetail}
        tone={status.filingTone}
      />
    </div>
  );
}
