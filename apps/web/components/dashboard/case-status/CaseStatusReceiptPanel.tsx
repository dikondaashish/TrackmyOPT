"use client";

import { useEffect } from "react";
import { trackReceiptEntry } from "@/lib/case-status/receipt-entry-observability";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";
import {
  type FilingCategory,
  normalizeFilingCategory,
} from "@/lib/case-status/filing-category";
import { FilingCategorySelect } from "@/components/dashboard/case-status/FilingCategorySelect";

type CaseStatusReceiptPanelProps = {
  mode: "onboarding" | "edit";
  receiptNumber: string;
  filingCategory: FilingCategory;
  onReceiptChange: (value: string) => void;
  onFilingCategoryChange: (value: FilingCategory) => void;
  onSave: () => void;
  isSaving: boolean;
  isPolling: boolean;
  error: string | null;
  success: boolean;
  onCancelEdit?: () => void;
  collapsedSummary?: string;
  onExpandEdit?: () => void;
};

export function CaseStatusReceiptPanel({
  mode,
  receiptNumber,
  filingCategory,
  onReceiptChange,
  onFilingCategoryChange,
  onSave,
  isSaving,
  isPolling,
  error,
  success,
  onCancelEdit,
  collapsedSummary,
  onExpandEdit,
}: CaseStatusReceiptPanelProps) {
  useEffect(() => {
    if (mode === "onboarding")
      trackReceiptEntry("receipt_entry_viewed", "case_status");
  }, [mode]);
  if (mode === "edit" && collapsedSummary && onExpandEdit) {
    return (
      <Card className="px-6 py-5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
              Tracked receipt
            </p>
            <p
              className="font-mono text-base font-semibold ph-mask mt-1.5"
              data-ph-mask
            >
              {collapsedSummary}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExpandEdit}
            className="w-full sm:w-auto gap-2 px-4 py-2.5 h-auto font-semibold bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg text-sm text-gray-900 dark:text-white"
          >
            <Pencil className="w-3.5 h-3.5" />
            Change receipt
          </Button>
        </div>
      </Card>
    );
  }

  const isOnboarding = mode === "onboarding";
  const isStemExtension =
    normalizeFilingCategory(filingCategory) === "stem_extension";
  const filingWindowHref = isStemExtension
    ? "/tools/stem-apply"
    : "/tools/opt-apply";
  const filingWindowLabel = isStemExtension
    ? "Check your STEM OPT filing window"
    : "Check your OPT filing window";

  return (
    <Card className="px-6 py-5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-none">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-semibold m-0 text-gray-900 dark:text-white">
            {isOnboarding
              ? "Know where your case stands"
              : "Update receipt number"}
          </h2>
          {isOnboarding && (
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Check your USCIS status. Manual tracking is free.
            </p>
          )}
        </div>
        {!isOnboarding && onCancelEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            className="font-semibold text-gray-500 dark:text-zinc-400 text-sm px-3"
          >
            <ChevronUp className="w-3.5 h-3.5 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {isOnboarding && (
        <div className="mb-6 rounded-lg bg-gray-50 dark:bg-zinc-900 px-4 py-4">
          <div className="text-sm space-y-2.5">
              <p className="font-semibold text-gray-900 dark:text-white">
                Where to find it
              </p>
              <div className="text-gray-700 dark:text-zinc-400 space-y-2">
                <p>
                  Your I-797C receipt notice or USCIS account. Look for 3
                  letters + 10 digits.
                </p>
                <p>
                  Haven&apos;t filed yet?{" "}
                  <Link
                    href={filingWindowHref}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    {filingWindowLabel}
                  </Link>
                </p>
              </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="filing-category-select"
            className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white"
          >
            What are you tracking?
          </label>
          <FilingCategorySelect
            id="filing-category-select"
            value={filingCategory}
            onChange={onFilingCategoryChange}
            describedBy="filing-category-help"
          />
          <p
            id="filing-category-help"
            className="text-xs text-gray-500 dark:text-zinc-400 mt-2"
          >
            Helps match your case with comparable timelines.
          </p>
        </div>

        <div>
          <label
            htmlFor="receipt-number-input"
            className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white"
          >
            USCIS Receipt Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:flex-1">
              <Input
                id="receipt-number-input"
                type="text"
                placeholder="e.g., IOE1234567890"
                value={receiptNumber}
                onChange={(e) => onReceiptChange(e.target.value.toUpperCase())}
                className="w-full font-mono ph-mask text-base h-11 px-4 rounded-lg border border-gray-300 dark:border-zinc-800 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-600 transition-colors bg-white dark:bg-zinc-950"
                data-ph-mask
                maxLength={13}
                aria-label="Enter your USCIS receipt number"
                aria-describedby="receipt-number-help"
                aria-required="true"
              />
              {/* Format hint overlay */}
              {!receiptNumber && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-zinc-500 font-mono pointer-events-none hidden sm:block">
                  XXX-XXXXXXXXXX
                </div>
              )}
            </div>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[130px] h-11 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm border-none"
              aria-label="Save and track your receipt number"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save & Track</>
              )}
            </Button>
          </div>
          <p
            id="receipt-number-help"
            className="text-xs text-gray-500 dark:text-zinc-400 mt-2"
          >
            13 characters: 3-letter prefix + 10 digits
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              {error}
            </p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Receipt number saved successfully!
            </p>
          </div>
        )}
        {isPolling && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Fetching status from USCIS… This may take a few seconds.
            </span>
          </div>
        )}
      </div>

      {isOnboarding && (
        <details className="mt-8 group">
          <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 list-none">
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
            How tracking works
          </summary>
          <ul className="mt-3.5 space-y-3 text-sm text-gray-600 dark:text-zinc-400 pl-5">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
              Free: save your receipt and refresh status anytime in this
              dashboard
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              Pro: automatic daily USCIS checks + email when your status changes
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              {CASE_STATUS_MESSAGING.howItWorksNotify}
            </li>
          </ul>
        </details>
      )}
    </Card>
  );
}
