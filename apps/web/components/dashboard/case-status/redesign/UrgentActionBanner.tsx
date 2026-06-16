"use client";

import { AlertTriangle, Phone, Globe, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CaseState } from "./StickyCaseSwitcher";

interface PremiumProcessingInfo {
  overdueBusinessDays: number;
  deadlineDate: string;
}

interface UrgentActionBannerProps {
  caseState: CaseState;
  premiumProcessing?: PremiumProcessingInfo;
  rfeDate?: string | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

export function UrgentActionBanner({ caseState, premiumProcessing, rfeDate }: UrgentActionBannerProps) {
  if (caseState !== "urgent" && caseState !== "actionNeeded") return null;

  const isUrgent = caseState === "urgent";
  const isPPOverdue = isUrgent && premiumProcessing && premiumProcessing.overdueBusinessDays > 0;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border-l-4 p-4 sm:p-5",
        isUrgent
          ? "bg-red-50 dark:bg-red-950/30 border-l-red-500 border border-red-200 dark:border-red-800"
          : "bg-amber-50 dark:bg-amber-950/30 border-l-amber-500 border border-amber-200 dark:border-amber-800"
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={cn(
            "w-5 h-5 flex-shrink-0 mt-0.5",
            isUrgent ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
          )}
        />
        <div className="flex-1 min-w-0">
          {isPPOverdue ? (
            <>
              <p className={cn("text-sm font-extrabold uppercase tracking-wide mb-1", "text-red-700 dark:text-red-300")}>
                Premium Processing Overdue — {premiumProcessing.overdueBusinessDays} business day{premiumProcessing.overdueBusinessDays !== 1 ? "s" : ""} past deadline
              </p>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                USCIS committed to a decision by {formatDate(premiumProcessing.deadlineDate)}.
                You are entitled to contact the Premium Processing unit directly.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 gap-2"
                  asChild
                >
                  <a href="tel:18003755283">
                    <Phone className="w-3.5 h-3.5" />
                    Call USCIS (800) 375-5283
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 gap-2"
                  asChild
                >
                  <a href="https://my.uscis.gov/account" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-3.5 h-3.5" />
                    Submit Online Inquiry
                  </a>
                </Button>
              </div>
            </>
          ) : caseState === "actionNeeded" ? (
            <>
              <p className="text-sm font-extrabold uppercase tracking-wide mb-1 text-amber-700 dark:text-amber-300">
                Request for Evidence {rfeDate ? `— Received ${formatDate(rfeDate)}` : "Received"}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                USCIS needs additional documents. Respond before the RFE deadline or your case may be denied.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 gap-2"
                  asChild
                >
                  <a href="https://my.uscis.gov" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-3.5 h-3.5" />
                    View RFE Guide
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  Contact DSO
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-extrabold uppercase tracking-wide mb-1 text-red-700 dark:text-red-300">
                Action Required
              </p>
              <p className="text-sm text-red-800 dark:text-red-200">
                Your case requires immediate attention. Check USCIS for details.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
