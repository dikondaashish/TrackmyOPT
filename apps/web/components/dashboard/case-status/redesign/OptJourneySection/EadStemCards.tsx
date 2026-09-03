"use client";

import { CalendarDays, Shield } from "lucide-react";
import { addMonthsIso, formatDisplayMonthYear } from "@/lib/case-status/safe-dates";
import type { FilingCategory } from "@/lib/case-status/filing-category";
import { normalizeFilingCategory } from "@/lib/case-status/filing-category";

interface EadStemCardsProps {
  filingCategory?: FilingCategory | string | null;
  eadProjected: string | null;
  stemWindowOpens: string | null;
  capGapActive: boolean | null;
}

export function EadStemCards({
  filingCategory = null,
  eadProjected,
  stemWindowOpens,
  capGapActive,
}: EadStemCardsProps) {
  const isStemExtension = normalizeFilingCategory(filingCategory) === "stem_extension";
  const eadExpiry = addMonthsIso(eadProjected, isStemExtension ? 24 : 12);
  const stemWindowFromEad = addMonthsIso(eadExpiry, -3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {/* EAD card */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {isStemExtension ? "STEM OPT EAD" : "OPT EAD"}
          </p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {eadProjected
            ? `${formatDisplayMonthYear(eadProjected)} – ${formatDisplayMonthYear(eadExpiry)}`
            : "Pending decision"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isStemExtension
            ? "24-month STEM OPT extension period"
            : "12-month post-completion OPT period"}
        </p>
        {!isStemExtension && stemWindowFromEad && (
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
          {capGapActive === true
            ? "Cap-gap active"
            : capGapActive === false
              ? "Not active"
              : "Not verified"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {capGapActive === true
            ? "H-1B petition details indicate a cap-gap extension. Confirm the dates on your I-20 and with your DSO."
            : capGapActive === false
              ? "Your saved H-1B details do not indicate an active cap-gap extension."
              : "Add verified H-1B and I-20 details before relying on a cap-gap date."}
        </p>
      </div>
    </div>
  );
}
