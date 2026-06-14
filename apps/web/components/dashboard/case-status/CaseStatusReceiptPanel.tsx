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
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tracked receipt
            </p>
            <p className="font-mono text-sm font-semibold ph-mask mt-0.5" data-ph-mask>
              {collapsedSummary}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExpandEdit}
            className="w-full sm:w-auto"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Change receipt
          </Button>
        </div>
      </Card>
    );
  }

  const isOnboarding = mode === "onboarding";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {isOnboarding ? "Add your receipt number" : "Update receipt number"}
          </h2>
          {isOnboarding && (
            <p className="text-sm text-muted-foreground mt-1">
              {CASE_STATUS_MESSAGING.subhead}
            </p>
          )}
        </div>
        {!isOnboarding && onCancelEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit}>
            <ChevronUp className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {isOnboarding && (
        <div className="mb-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-900/20 p-4">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">Where to find it</p>
              <ul className="text-muted-foreground space-y-1.5 list-disc pl-4">
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
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
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
          <label htmlFor="receipt-number-input" className="block text-sm font-medium mb-2">
            USCIS Receipt Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="receipt-number-input"
              type="text"
              placeholder="e.g., IOE1234567890"
              value={receiptNumber}
              onChange={(e) => onReceiptChange(e.target.value.toUpperCase())}
              className="w-full sm:flex-1 font-mono ph-mask"
              data-ph-mask
              maxLength={13}
              aria-label="Enter your USCIS receipt number"
              aria-describedby="receipt-number-help"
              aria-required="true"
            />
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[120px]"
              aria-label="Save and track your receipt number"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Track"
              )}
            </Button>
          </div>
          <p id="receipt-number-help" className="text-sm text-muted-foreground mt-2">
            13 characters: 3-letter prefix + 10 digits
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Receipt number saved successfully!
            </p>
          </div>
        )}
        {isPolling && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Fetching status from USCIS… This may take a few seconds.
            </span>
          </div>
        )}
      </div>

      {isOnboarding && (
        <details className="mt-5 group">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 list-none">
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            How tracking works
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground pl-6">
            <li>Free: save your receipt and refresh status anytime in this dashboard</li>
            <li>Pro: automatic daily USCIS checks + email when your status changes</li>
            <li>{CASE_STATUS_MESSAGING.howItWorksNotify}</li>
          </ul>
        </details>
      )}
    </Card>
  );
}
