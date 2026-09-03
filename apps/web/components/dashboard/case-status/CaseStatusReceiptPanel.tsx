"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Pencil,
} from "lucide-react";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";
import Link from "next/link";
import { type FilingCategory } from "@/lib/case-status/filing-category";
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
  if (mode === "edit" && collapsedSummary && onExpandEdit) {
    return (
      <Card className="px-[24px] py-[22px] bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.4px] text-[#86868B]">
              Tracked receipt
            </p>
            <p className="font-mono text-[15px] font-bold ph-mask mt-[6px]" data-ph-mask>
              {collapsedSummary}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExpandEdit}
            className="w-full sm:w-auto gap-[8px] px-[16px] py-[10px] h-auto font-semibold bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[11px] text-[12.5px] text-[#1D1D1F] dark:text-white"
          >
            <Pencil className="w-[14px] h-[14px]" />
            Change receipt
          </Button>
        </div>
      </Card>
    );
  }

  const isOnboarding = mode === "onboarding";

  return (
    <Card className="px-[24px] py-[22px] bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-[12px] mb-[24px]">
        <div>
          <h2 className="text-[16.5px] font-bold tracking-[-0.3px] m-0 text-[#1D1D1F] dark:text-white">
            {isOnboarding ? "Add your receipt number" : "Update receipt number"}
          </h2>
          {isOnboarding && (
            <p className="text-[12px] text-[#86868B] mt-[3px]">
              {CASE_STATUS_MESSAGING.subhead}
            </p>
          )}
        </div>
        {!isOnboarding && onCancelEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} className="font-semibold text-[#86868B] text-[12.5px] px-[12px]">
            <ChevronUp className="w-[14px] h-[14px] mr-[4px]" />
            Cancel
          </Button>
        )}
      </div>

      {isOnboarding && (
        <div className="mb-[24px] rounded-[14px] border border-black/5 dark:border-white/5 bg-[#FAFAFB] dark:bg-zinc-900 px-[16px] py-[15px]">
          <div className="flex gap-[14px]">
            <div className="w-[36px] h-[36px] rounded-[10px] bg-white dark:bg-zinc-800 border border-black/5 flex items-center justify-center shrink-0">
              <FileText className="w-[18px] h-[18px] text-[#86868B]" />
            </div>
            <div className="text-[13px] space-y-[10px] pt-[2px]">
              <p className="font-bold text-[#1D1D1F] dark:text-white">Where to find it</p>
              <ul className="text-[#48484A] dark:text-zinc-400 space-y-[10px] list-disc pl-[16px]">
                <li>
                  On your <strong className="text-[#1D1D1F] dark:text-white font-semibold">I-797C receipt notice</strong>{" "}
                  — 13 characters at the top (e.g. IOE1234567890)
                </li>
                <li>
                  In your USCIS online account under your I-765 submission
                </li>
                <li>
                  Haven&apos;t filed yet?{" "}
                  <Link
                    href="/dashboard/opt-tools/opt-apply"
                    className="text-[#0A84FF] font-semibold hover:underline"
                  >
                    Check your OPT filing window
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-[16px]">
        <div>
          <label htmlFor="filing-category-select" className="block text-[13px] font-bold mb-[8px] text-[#1D1D1F] dark:text-white">
            What are you tracking?
          </label>
          <FilingCategorySelect
            id="filing-category-select"
            value={filingCategory}
            onChange={onFilingCategoryChange}
            describedBy="filing-category-help"
          />
          <p id="filing-category-help" className="text-[12px] text-[#86868B] mt-[8px]">
            Used for approval-time estimates. USCIS form is typically I-765 for both.
          </p>
        </div>

        <div>
          <label htmlFor="receipt-number-input" className="block text-[13px] font-bold mb-[8px] text-[#1D1D1F] dark:text-white">
            USCIS Receipt Number
          </label>
          <div className="flex flex-col sm:flex-row gap-[12px]">
            <div className="relative w-full sm:flex-1">
              <Input
                id="receipt-number-input"
                type="text"
                placeholder="e.g., IOE1234567890"
                value={receiptNumber}
                onChange={(e) => onReceiptChange(e.target.value.toUpperCase())}
                className="w-full font-mono ph-mask text-[15px] h-[42px] px-[16px] rounded-[11px] border border-black/10 dark:border-white/10 focus:ring-[3px] focus:ring-[#0A84FF]/20 focus:border-[#0A84FF] transition-all bg-white dark:bg-zinc-950"
                data-ph-mask
                maxLength={13}
                aria-label="Enter your USCIS receipt number"
                aria-describedby="receipt-number-help"
                aria-required="true"
              />
              {/* Format hint overlay */}
              {!receiptNumber && (
                <div className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[11px] text-[#A1A1A6] font-mono pointer-events-none hidden sm:block">
                  XXX-XXXXXXXXXX
                </div>
              )}
            </div>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[130px] h-[42px] px-[16px] py-[10px] bg-[#0A84FF] hover:bg-[#0070E0] text-white rounded-[11px] font-bold text-[13px] border-none"
              aria-label="Save and track your receipt number"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-[14px] h-[14px] mr-[8px] animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save & Track
                </>
              )}
            </Button>
          </div>
          <p id="receipt-number-help" className="text-[12px] text-[#86868B] mt-[8px]">
            13 characters: 3-letter prefix + 10 digits
          </p>
        </div>

        {error && (
          <div className="p-[16px] bg-[#FFF2F2] dark:bg-red-900/20 border border-[#FF3B30]/20 rounded-[12px] flex items-start gap-[12px]">
            <AlertCircle className="w-[20px] h-[20px] text-[#FF3B30] flex-shrink-0 mt-[2px]" />
            <p className="text-[13px] text-[#C22820] dark:text-red-300 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-[16px] bg-[#EAF8EE] dark:bg-[#34C759]/10 border border-[#34C759]/20 rounded-[12px] flex items-start gap-[12px]">
            <CheckCircle2 className="w-[20px] h-[20px] text-[#34C759] flex-shrink-0 mt-[2px]" />
            <p className="text-[13px] text-[#1E9E4A] dark:text-[#34C759] font-medium">
              Receipt number saved successfully!
            </p>
          </div>
        )}
        {isPolling && (
          <div className="p-[16px] bg-[#EAF4FF] dark:bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[12px] flex items-center gap-[12px]">
            <Loader2 className="w-[20px] h-[20px] animate-spin text-[#0A84FF] flex-shrink-0" />
            <span className="text-[13px] text-[#0A6CE0] dark:text-[#0A84FF] font-medium">
              Fetching status from USCIS… This may take a few seconds.
            </span>
          </div>
        )}
      </div>

      {isOnboarding && (
        <details className="mt-[32px] group">
          <summary className="flex cursor-pointer items-center gap-[6px] text-[12.5px] font-semibold text-[#0A84FF] list-none">
            <ChevronDown className="w-[14px] h-[14px] transition-transform group-open:rotate-180" />
            How tracking works
          </summary>
          <ul className="mt-[14px] space-y-[12px] text-[13px] text-[#6E6E73] pl-[20px]">
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#34C759] mt-[7px] shrink-0" />
              Free: save your receipt and refresh status anytime in this dashboard
            </li>
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#0A84FF] mt-[7px] shrink-0" />
              Pro: automatic daily USCIS checks + email when your status changes
            </li>
            <li className="flex items-start gap-[10px]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#FF9F0A] mt-[7px] shrink-0" />
              {CASE_STATUS_MESSAGING.howItWorksNotify}
            </li>
          </ul>
        </details>
      )}
    </Card>
  );
}
