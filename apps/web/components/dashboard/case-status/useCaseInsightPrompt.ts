'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CaseStatus } from '@/components/dashboard/case-status/case-status-section-helpers';
import { CHECKOUT_UPSELL_TRIGGER } from '@/lib/case-status/free-change-wedge';
import type { CheckoutUpsellTrigger } from '@/lib/case-status/free-change-wedge';
import {
  CASE_INSIGHT_PROMPT_DELAY_MS,
  CASE_INSIGHT_PROMPT_SESSION_KEY,
  CASE_INSIGHT_PROMPT_STORAGE_KEY,
  parsePromptTimestamp,
  shouldShowCaseInsightPrompt,
} from '@/lib/case-status/free-case-insight-prompt';
import { captureUpgradePromptShown } from '@/lib/posthog-client';

interface UseCaseInsightPromptArgs {
  caseStatus: CaseStatus | null;
  isPremium: boolean | null;
  showPricingModal: boolean;
  showStatusChangeWedge: boolean;
  showManualRefreshUpsell: boolean;
  showStaleStatusUpsell: boolean;
  showCaseInsightUpgrade: boolean;
  setPricingModalPlan: Dispatch<SetStateAction<'pro' | 'dedicated'>>;
  setShowPricingModal: Dispatch<SetStateAction<boolean>>;
}

/**
 * Owns the "case insight" upgrade prompt: the idle-timer reveal and the
 * post-receipt reveal. `pendingReceiptInsightRef` is flagged by the save flow.
 */
export function useCaseInsightPrompt({
  caseStatus,
  isPremium,
  showPricingModal,
  showStatusChangeWedge,
  showManualRefreshUpsell,
  showStaleStatusUpsell,
  showCaseInsightUpgrade,
  setPricingModalPlan,
  setShowPricingModal,
}: UseCaseInsightPromptArgs) {
  const caseInsightPromptHandledRef = useRef(false);
  const pendingReceiptInsightRef = useRef(false);

  const revealCaseInsightUpgrade = useCallback(
    (trigger: CheckoutUpsellTrigger) => {
      if (
        typeof window === 'undefined' ||
        caseInsightPromptHandledRef.current
      ) {
        return false;
      }

      const nowMs = Date.now();
      let shownThisSession = false;
      let lastShownAtMs: number | null = null;
      try {
        shownThisSession =
          window.sessionStorage.getItem(CASE_INSIGHT_PROMPT_SESSION_KEY) ===
          '1';
        lastShownAtMs = parsePromptTimestamp(
          window.localStorage.getItem(CASE_INSIGHT_PROMPT_STORAGE_KEY)
        );
      } catch {
        // Storage may be unavailable in hardened browsers. The in-memory guard
        // still prevents repeats during this mount.
      }

      if (
        !shouldShowCaseInsightPrompt({
          isPremium,
          hasCase: Boolean(caseStatus),
          hasResolvedStatus: Boolean(
            caseStatus?.current_status &&
              caseStatus.current_status !== 'Status will be fetched shortly...'
          ),
          competingPromptOpen:
            showPricingModal || showStatusChangeWedge || showCaseInsightUpgrade,
          shownThisSession,
          lastShownAtMs,
          nowMs,
        })
      ) {
        return false;
      }

      caseInsightPromptHandledRef.current = true;
      try {
        window.sessionStorage.setItem(CASE_INSIGHT_PROMPT_SESSION_KEY, '1');
        window.localStorage.setItem(
          CASE_INSIGHT_PROMPT_STORAGE_KEY,
          String(nowMs)
        );
      } catch {
        /* non-blocking */
      }
      setPricingModalPlan('pro');
      setShowPricingModal(true);
      captureUpgradePromptShown({
        trigger,
        source: 'case_status_page',
        plan_suggested: 'pro',
      });
      return true;
    },
    [
      caseStatus,
      isPremium,
      setPricingModalPlan,
      setShowPricingModal,
      showCaseInsightUpgrade,
      showPricingModal,
      showStatusChangeWedge,
    ]
  );

  useEffect(() => {
    if (caseInsightPromptHandledRef.current) return;

    let shownThisSession = false;
    let lastShownAtMs: number | null = null;
    try {
      shownThisSession =
        window.sessionStorage.getItem(CASE_INSIGHT_PROMPT_SESSION_KEY) === '1';
      lastShownAtMs = parsePromptTimestamp(
        window.localStorage.getItem(CASE_INSIGHT_PROMPT_STORAGE_KEY)
      );
    } catch {
      /* storage may be unavailable */
    }

    const eligible = shouldShowCaseInsightPrompt({
      isPremium,
      hasCase: Boolean(caseStatus),
      hasResolvedStatus: Boolean(
        caseStatus?.current_status &&
          caseStatus.current_status !== 'Status will be fetched shortly...'
      ),
      competingPromptOpen:
        showPricingModal ||
        showStatusChangeWedge ||
        showManualRefreshUpsell ||
        showStaleStatusUpsell ||
        showCaseInsightUpgrade,
      shownThisSession,
      lastShownAtMs,
    });

    if (!eligible) return;

    const timer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        revealCaseInsightUpgrade(CHECKOUT_UPSELL_TRIGGER.CASE_INSIGHT);
      }
    }, CASE_INSIGHT_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    caseStatus,
    isPremium,
    revealCaseInsightUpgrade,
    showCaseInsightUpgrade,
    showManualRefreshUpsell,
    showPricingModal,
    showStaleStatusUpsell,
    showStatusChangeWedge,
  ]);

  useEffect(() => {
    if (!pendingReceiptInsightRef.current) return;
    if (
      isPremium !== false ||
      !caseStatus?.current_status ||
      caseStatus.current_status === 'Status will be fetched shortly...'
    ) {
      return;
    }

    pendingReceiptInsightRef.current = false;
    const timer = window.setTimeout(() => {
      revealCaseInsightUpgrade(CHECKOUT_UPSELL_TRIGGER.RECEIPT_ADDED);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [caseStatus, isPremium, revealCaseInsightUpgrade]);

  return { revealCaseInsightUpgrade, pendingReceiptInsightRef };
}
