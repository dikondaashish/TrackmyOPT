"use client";

import { CalendarDays, Shield } from "lucide-react";
import { addMonthsIso, formatDisplayMonthYear } from "@/lib/case-status/safe-dates";

interface EadStemCardsProps {
  eadProjected: string | null;
  stemWindowOpens: string | null;
  capGapActive: boolean;
}

export function EadStemCards({ eadProjected, stemWindowOpens, capGapActive }: EadStemCardsProps) {
  const eadExpiry = addMonthsIso(eadProjected, 12);
  const stemWindowFromEad = addMonthsIso(eadExpiry, -3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {/* OPT EAD Card */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">OPT EAD</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {eadProjected
            ? `${formatDisplayMonthYear(eadProjected)} – ${formatDisplayMonthYear(eadExpiry)}`
            : "Pending decision"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">12-month post-completion OPT period</p>
        {stemWindowFromEad && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
            STEM window opens:{" "}
            {formatDisplayMonthYear(stemWindowOpens ?? stemWindowFromEad)}
          </p>
        )}
      </div>

      {/* Cap-Gap Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cap-Gap Status</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {capGapActive ? "Cap-gap active" : "Not active"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {capGapActive
            ? "H-1B petition filed — your status is protected until Oct 1."
            : "No H-1B petition on file. Not eligible for cap-gap extension."}
        </p>
      </div>
    </div>
  );
}
