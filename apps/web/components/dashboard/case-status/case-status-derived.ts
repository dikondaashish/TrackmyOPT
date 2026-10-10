import {
  findRfeDate,
  type CaseStatus,
} from '@/components/dashboard/case-status/case-status-section-helpers';
import { daysSinceEpochMs } from '@/lib/case-status/safe-dates';
import { getServiceCenterLocation } from '@/lib/case-status/case-status-display';
import {
  getFilingCategoryFormMismatch,
  isOptFilingCategory,
  normalizeFilingCategory,
} from '@/lib/case-status/filing-category';
import { deriveCaseState } from '@/components/dashboard/case-status/panels/StickyCaseSwitcher';
import { resolvePpClockState } from '@/lib/case-status/premium-processing';

/** Pure derived view-state for the active case (no React state). */
export function deriveCaseStatusViewState(
  caseStatus: CaseStatus | null,
  clientNowMs: number | null,
  safeStatusHistory: CaseStatus['status_history'],
  filingCategoryPromptDismissed: boolean
) {
  const caseState = deriveCaseState(caseStatus?.current_status);

  // PP overdue calculation — 0 until clientNow is available (post-hydration).
  const ppStartDate = caseStatus?.pp_start_date ?? null;
  const ppClock =
    clientNowMs !== null &&
    isOptFilingCategory(caseStatus?.filing_category) &&
    !getFilingCategoryFormMismatch(
      caseStatus?.filing_category,
      caseStatus?.case_type
    )
      ? resolvePpClockState({
          manualPpStart: ppStartDate,
          statusHistory: safeStatusHistory,
          currentStatus: caseStatus?.current_status,
          now: new Date(clientNowMs),
        }).clock
      : null;
  const ppOverdueDays = ppClock?.daysOverdue ?? 0;
  const ppDeadlineDate = ppClock?.deadline ?? null;
  const daysSinceFiled =
    clientNowMs !== null
      ? daysSinceEpochMs(caseStatus?.received_date, clientNowMs)
      : null;
  const serviceCenterLocation = getServiceCenterLocation(
    caseStatus?.receipt_number
  );

  const isOptCase = isOptFilingCategory(caseStatus?.filing_category);
  const isStemExtension =
    normalizeFilingCategory(caseStatus?.filing_category) === 'stem_extension';

  const formTypeMismatch = getFilingCategoryFormMismatch(
    caseStatus?.filing_category,
    caseStatus?.case_type
  );

  const showFilingCategoryPrompt =
    Boolean(caseStatus) &&
    isOptFilingCategory(caseStatus?.filing_category) &&
    !caseStatus?.filing_category_confirmed_at &&
    !filingCategoryPromptDismissed;

  const rfeDate = findRfeDate(safeStatusHistory);

  return {
    caseState,
    ppOverdueDays,
    ppDeadlineDate,
    daysSinceFiled,
    serviceCenterLocation,
    isOptCase,
    isStemExtension,
    formTypeMismatch,
    showFilingCategoryPrompt,
    rfeDate,
  };
}
