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
  Sparkles,
} from "lucide-react";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";
import Link from "next/link";

type CaseStatusReceiptPanelProps = {
  mode: "onboarding" | "edit";
  receiptNumber: string;
  onReceiptChange: (value: string) => void;
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
  onReceiptChange,
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
      <Card className="p-4 border-0 shadow-md hover-lift transition-all">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Tracked receipt
            </p>
            <p className="font-mono text-sm font-bold ph-mask mt-1" data-ph-mask>
              {collapsedSummary}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExpandEdit}
            className="w-full sm:w-auto gap-2 font-semibold"
          >
            <Pencil className="w-4 h-4" />
            Change receipt
          </Button>
        </div>
      </Card>
    );
  }

  const isOnboarding = mode === "onboarding";

  return (
    <Card className="p-6 sm:p-7 border-0 shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {isOnboarding ? "Add your receipt number" : "Update receipt number"}
          </h2>
          {isOnboarding && (
            <p className="text-sm text-muted-foreground mt-1">
              {CASE_STATUS_MESSAGING.subhead}
            </p>
          )}
        </div>
        {!isOnboarding && onCancelEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} className="font-semibold">
            <ChevronUp className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {isOnboarding && (
        <div className="mb-6 rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/15 p-5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm space-y-2">
              <p className="font-bold text-foreground">Where to find it</p>
              <ul className="text-muted-foreground space-y-2 list-disc pl-4">
                <li>
                  On your <strong className="text-foreground">I-797C receipt notice</strong>{" "}
                  — 13 characters at the top (e.g. IOE1234567890)
                </li>
                <li>
                  In your USCIS online account under your I-765 submission
                </li>
                <li>
                  Haven&apos;t filed yet?{" "}
                  <Link
                    href="/dashboard/opt-tools/opt-apply"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Check your OPT filing window
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="receipt-number-input" className="block text-sm font-bold mb-2">
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
                className="w-full font-mono ph-mask text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                data-ph-mask
                maxLength={13}
                aria-label="Enter your USCIS receipt number"
                aria-describedby="receipt-number-help"
                aria-required="true"
              />
              {/* Format hint overlay */}
              {!receiptNumber && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono pointer-events-none hidden sm:block">
                  XXX-XXXXXXXXXX
                </div>
              )}
            </div>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[130px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 font-semibold"
              aria-label="Save and track your receipt number"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Save & Track
                </>
              )}
            </Button>
          </div>
          <p id="receipt-number-help" className="text-xs text-muted-foreground mt-2">
            13 characters: 3-letter prefix + 10 digits
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-slide-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3 animate-slide-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              Receipt number saved successfully!
            </p>
          </div>
        )}
        {isPolling && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3 animate-slide-in">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Fetching status from USCIS… This may take a few seconds.
            </span>
          </div>
        )}
      </div>

      {isOnboarding && (
        <details className="mt-6 group">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 list-none">
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            How tracking works
          </summary>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground pl-6">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              Free: save your receipt and refresh status anytime in this dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              Pro: automatic daily USCIS checks + email when your status changes
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
              {CASE_STATUS_MESSAGING.howItWorksNotify}
            </li>
          </ul>
        </details>
      )}
    </Card>
  );
}
