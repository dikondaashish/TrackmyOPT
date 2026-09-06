"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilingCategorySelect } from "@/components/dashboard/case-status/FilingCategorySelect";
import {
  formatDaysAgoLabel,
  formatStatusLabel,
  getServiceCenterLabel,
} from "@/lib/case-status/case-status-display";
import {
  normalizeFilingCategory,
  type FilingCategory,
} from "@/lib/case-status/filing-category";
import { formatDisplayDateShort } from "@/lib/case-status/safe-dates";
import { Globe } from "lucide-react";

type CaseInfoFields = {
  receipt_number: string;
  case_type: string | null;
  filing_category?: string | null;
  received_date: string | null;
  current_status: string | null;
  last_status_change_at: string | null;
};

type CaseInformationCardProps = {
  caseStatus: CaseInfoFields;
  serviceCenterLocation: string | null;
  filingCategorySaving: boolean;
  onFilingCategoryChange: (value: FilingCategory) => void;
  filingDateInput: string;
  onFilingDateInputChange: (value: string) => void;
  filingDateSaving: boolean;
  onSaveFilingDate: () => void;
};

export function CaseInformationCard({
  caseStatus,
  serviceCenterLocation,
  filingCategorySaving,
  onFilingCategoryChange,
  filingDateInput,
  onFilingDateInputChange,
  filingDateSaving,
  onSaveFilingDate,
}: CaseInformationCardProps) {
  return (
    <Card className="p-6 sm:p-7 border-0 shadow-lg hover-lift transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-extrabold">Case Information</h2>
      </div>

      <div className="space-y-3">
        <div className="flex max-md:flex-col max-md:items-start max-md:gap-2 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filing Type</span>
          <div className="w-full sm:w-auto sm:min-w-[240px] max-md:w-full">
            <FilingCategorySelect
              id="case-info-filing-category"
              value={normalizeFilingCategory(caseStatus.filing_category)}
              onChange={onFilingCategoryChange}
              disabled={filingCategorySaving}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">USCIS Form</span>
          <span className="text-sm font-semibold max-md:text-left text-right">
            {caseStatus.case_type || "I-765"}
          </span>
        </div>

        <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Receipt Number</span>
          <span
            className="text-sm font-semibold font-mono max-md:text-left text-right ph-mask"
            data-ph-mask
            data-receipt-display
          >
            {caseStatus.receipt_number}
          </span>
        </div>

        <div className="flex max-md:flex-col max-md:items-start max-md:gap-2 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filing Date</span>
          {caseStatus.received_date ? (
            <span className="text-sm font-semibold max-md:text-left text-right">
              {formatDisplayDateShort(caseStatus.received_date)}
            </span>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto max-md:w-full">
              <Input
                type="date"
                value={filingDateInput}
                onChange={(e) => onFilingDateInputChange(e.target.value)}
                className="h-9 text-sm max-md:w-full"
                aria-label="Filing date"
              />
              <Button
                type="button"
                size="sm"
                onClick={onSaveFilingDate}
                disabled={filingDateSaving || !filingDateInput}
                className="shrink-0"
              >
                {filingDateSaving ? "Saving…" : "Add date"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Service Center</span>
          <div className="max-md:text-left text-right ph-mask" data-ph-mask>
            <p className="text-sm font-semibold">
              {getServiceCenterLabel(caseStatus.receipt_number)}
            </p>
            {serviceCenterLocation && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {serviceCenterLocation}
              </p>
            )}
          </div>
        </div>

        <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Status</span>
          <span className="text-sm font-semibold max-md:text-left max-md:max-w-full text-right max-w-[60%]">
            {formatStatusLabel(caseStatus.current_status, "Checking USCIS status…")}
          </span>
        </div>

        <div className="flex max-md:flex-col max-md:items-stretch max-md:gap-3 items-center justify-between pt-4 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span className="text-xs font-medium">Time Since Filed</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatDaysAgoLabel(caseStatus.received_date)}
            </p>
          </div>
          <div className="max-md:hidden w-px h-10 bg-gray-300 dark:bg-gray-700" />
          <div className="max-md:text-left text-right">
            <span className="text-xs font-medium">Last Status Change</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatDaysAgoLabel(caseStatus.last_status_change_at)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CaseInformationPendingCard({
  receiptNumber,
  caseType,
}: {
  receiptNumber: string;
  caseType: string | null;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-lg font-bold">Case Information</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Status history will appear here after USCIS posts updates.
      </p>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">Receipt</span>
          <span className="text-sm font-mono font-semibold ph-mask" data-ph-mask>
            {receiptNumber}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-muted-foreground">Case Type</span>
          <span className="text-sm font-semibold">
            {caseType || "Form I-765 (OPT)"}
          </span>
        </div>
      </div>
    </Card>
  );
}
