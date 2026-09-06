import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { FilingCategorySelect } from "@/components/dashboard/case-status/FilingCategorySelect";
import { isReceiptStepSkippable } from "@/lib/posthog/onboarding-receipt-variant";
import type { FilingCategory } from "@/lib/case-status/filing-category";
import type { CaseStatusRecord } from "@/lib/case-status/save-receipt-and-poll";
import type { OnboardingReceiptVariant } from "@/lib/posthog/onboarding-receipt-variant";

interface ReceiptStepProps {
  filingCategory: FilingCategory;
  onFilingCategoryChange: (category: FilingCategory) => void;
  receiptNumber: string;
  onReceiptNumberChange: (value: string) => void;
  receiptError: string | null;
  clearReceiptError: () => void;
  isReceiptSaving: boolean;
  receiptStatusPending: boolean;
  savedCaseStatus: CaseStatusRecord | null;
  receiptVariant: OnboardingReceiptVariant;
  onBack: () => void;
  onReceiptSkip: () => void;
  onSkipForNow: () => void;
  onReceiptFinish: () => void;
  onReceiptSave: () => void;
  skipForNowClassName: string;
}

export function ReceiptStep({
  filingCategory,
  onFilingCategoryChange,
  receiptNumber,
  onReceiptNumberChange,
  receiptError,
  clearReceiptError,
  isReceiptSaving,
  receiptStatusPending,
  savedCaseStatus,
  receiptVariant,
  onBack,
  onReceiptSkip,
  onSkipForNow,
  onReceiptFinish,
  onReceiptSave,
  skipForNowClassName,
}: ReceiptStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Track your USCIS case</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        We&apos;ll save your receipt so you can refresh status anytime on Free. Pro adds daily
        auto-checks and email when status changes. Free includes 1 case; Pro tracks up to 8.
      </p>

      <div className="space-y-4 flex-1">
        <div>
          <label htmlFor="onboarding-filing-category" className="block text-sm font-medium mb-2">
            What are you tracking?
          </label>
          <FilingCategorySelect
            id="onboarding-filing-category"
            value={filingCategory}
            onChange={onFilingCategoryChange}
            disabled={isReceiptSaving || Boolean(savedCaseStatus)}
            className="h-10 rounded-md"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Used for approval-time estimates. USCIS form is typically I-765 for both.
          </p>
        </div>

        <div>
          <label htmlFor="onboarding-receipt-input" className="block text-sm font-medium mb-2">
            USCIS Receipt Number
          </label>
          <Input
            id="onboarding-receipt-input"
            type="text"
            placeholder="e.g., IOE1234567890"
            value={receiptNumber}
            onChange={(e) => {
              onReceiptNumberChange(e.target.value.toUpperCase());
              if (receiptError) clearReceiptError();
            }}
            className="font-mono ph-mask"
            data-ph-mask
            maxLength={13}
            disabled={isReceiptSaving || Boolean(savedCaseStatus)}
            aria-describedby="onboarding-receipt-help"
          />
          <p id="onboarding-receipt-help" className="text-xs text-muted-foreground mt-2">
            13 characters: IOE, EAC, WAC, LIN, SRC, MSC, or YSC + 10 digits
          </p>
          {receiptError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
              {receiptError}
            </p>
          )}
        </div>

        {(isReceiptSaving || receiptStatusPending) && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Checking USCIS for your latest status...
            </p>
          </div>
        )}

        {savedCaseStatus?.current_status && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Current status
                </p>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                  {savedCaseStatus.current_status}
                </p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-2">
                  Pro users can add more cases anytime from Dashboard → Case Status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 flex items-center justify-between mt-auto border-t">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Button variant="ghost" onClick={onBack} disabled={isReceiptSaving}>
            Back
          </Button>
          {isReceiptStepSkippable(receiptVariant) && (
            <button
              type="button"
              onClick={onReceiptSkip}
              disabled={isReceiptSaving}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline text-left"
            >
              I don&apos;t have one yet / skip
            </button>
          )}
          <button
            type="button"
            onClick={onSkipForNow}
            disabled={isReceiptSaving}
            className={skipForNowClassName}
            aria-label="Skip onboarding for now"
          >
            Skip for now
          </button>
        </div>
        {savedCaseStatus ? (
          <Button onClick={onReceiptFinish} className="px-8">
            Go to dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onReceiptSave}
            disabled={isReceiptSaving || !receiptNumber.trim()}
            className="px-8"
          >
            {isReceiptSaving ? "Saving..." : "Save & check status"}
            {!isReceiptSaving && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
