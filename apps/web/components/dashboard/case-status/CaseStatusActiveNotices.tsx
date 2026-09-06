"use client";

import { FilingCategoryConfirmBanner } from "@/components/dashboard/case-status/FilingCategoryConfirmBanner";
import {
  FormMismatchBanner,
  PackagingNoticeBanner,
  TrialCtaStrip,
} from "@/components/dashboard/case-status/CaseStatusSectionNotices";
import { StatusChangeUpgradeBanner } from "@/components/dashboard/case-status/StatusChangeUpgradeBanner";
import type { FilingCategory } from "@/lib/case-status/filing-category";

type CaseStatusActiveNoticesProps = {
  showPackagingNotice: boolean;
  packagingMessage: string;
  proUpgradeCta: string;
  onUpgrade: () => void;
  onDismissPackaging: () => void;
  showStatusChangeWedge: boolean;
  statusLastChangedAt: string | null | undefined;
  onWedgeAcknowledged: () => void;
  isPremium: boolean | null;
  trialMessage: string;
  showFilingCategoryPrompt: boolean;
  filingCategorySaving: boolean;
  onConfirmFilingCategory: (category: FilingCategory) => void;
  onDismissFilingCategory: () => void;
  formTypeMismatch: string | null;
};

export function CaseStatusActiveNotices({
  showPackagingNotice,
  packagingMessage,
  proUpgradeCta,
  onUpgrade,
  onDismissPackaging,
  showStatusChangeWedge,
  statusLastChangedAt,
  onWedgeAcknowledged,
  isPremium,
  trialMessage,
  showFilingCategoryPrompt,
  filingCategorySaving,
  onConfirmFilingCategory,
  onDismissFilingCategory,
  formTypeMismatch,
}: CaseStatusActiveNoticesProps) {
  return (
    <>
      {showPackagingNotice && (
        <PackagingNoticeBanner
          message={packagingMessage}
          ctaLabel={proUpgradeCta}
          onUpgrade={onUpgrade}
          onDismiss={onDismissPackaging}
        />
      )}

      {showStatusChangeWedge && statusLastChangedAt && (
        <StatusChangeUpgradeBanner
          statusLastChangedAt={statusLastChangedAt}
          onStartTrial={onUpgrade}
          ctaLabel={proUpgradeCta}
          onAcknowledged={onWedgeAcknowledged}
        />
      )}

      {isPremium === false && (
        <TrialCtaStrip
          message={trialMessage}
          ctaLabel={proUpgradeCta}
          onUpgrade={onUpgrade}
        />
      )}

      {showFilingCategoryPrompt && (
        <FilingCategoryConfirmBanner
          saving={filingCategorySaving}
          onConfirm={onConfirmFilingCategory}
          onDismiss={onDismissFilingCategory}
        />
      )}

      {formTypeMismatch && <FormMismatchBanner message={formTypeMismatch} />}
    </>
  );
}
