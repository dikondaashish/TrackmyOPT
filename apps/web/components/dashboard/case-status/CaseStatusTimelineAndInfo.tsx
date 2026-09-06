"use client";

import { Card } from "@/components/ui/card";
import { CaseHistoryTimeline } from "@/components/dashboard/case-status/CaseHistoryTimeline";
import {
  CaseInformationCard,
  CaseInformationPendingCard,
} from "@/components/dashboard/case-status/CaseInformationCard";
import { CaseTimelineErrorBoundary } from "@/components/dashboard/case-status/CaseTimelineErrorBoundary";
import type { CaseStatus } from "@/components/dashboard/case-status/case-status-section-helpers";
import type { FilingCategory } from "@/lib/case-status/filing-category";

type CaseStatusTimelineAndInfoProps = {
  caseStatus: CaseStatus;
  safeStatusHistory: CaseStatus["status_history"];
  serviceCenterLocation: string | null;
  filingCategorySaving: boolean;
  onFilingCategoryChange: (value: FilingCategory) => void;
  filingDateInput: string;
  onFilingDateInputChange: (value: string) => void;
  filingDateSaving: boolean;
  onSaveFilingDate: () => void;
};

export function CaseStatusTimelineAndInfo({
  caseStatus,
  safeStatusHistory,
  serviceCenterLocation,
  filingCategorySaving,
  onFilingCategoryChange,
  filingDateInput,
  onFilingDateInputChange,
  filingDateSaving,
  onSaveFilingDate,
}: CaseStatusTimelineAndInfoProps) {
  if (safeStatusHistory.length === 0) {
    return (
      <CaseInformationPendingCard
        receiptNumber={caseStatus.receipt_number}
        caseType={caseStatus.case_type}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
      <Card className="p-6 sm:p-7 border-0 shadow-lg hover-lift transition-all">
        <CaseTimelineErrorBoundary>
          <CaseHistoryTimeline
            statusHistory={safeStatusHistory}
            defaultExpanded={false}
          />
        </CaseTimelineErrorBoundary>
      </Card>

      <CaseInformationCard
        caseStatus={caseStatus}
        serviceCenterLocation={serviceCenterLocation}
        filingCategorySaving={filingCategorySaving}
        onFilingCategoryChange={onFilingCategoryChange}
        filingDateInput={filingDateInput}
        onFilingDateInputChange={onFilingDateInputChange}
        filingDateSaving={filingDateSaving}
        onSaveFilingDate={onSaveFilingDate}
      />
    </div>
  );
}
