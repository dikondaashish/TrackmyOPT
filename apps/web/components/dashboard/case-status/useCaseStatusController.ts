'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseRealtimeSupported } from '@/lib/supabase/realtime-supported';
import {
  caseLimitMessage,
  getCaseTrackingLimit,
} from "@/lib/case-status/case-limits";
import {
  findRfeDate,
  PACKAGING_NOTICE_DISMISS_KEY,
  selectActiveCase,
  type CaseStatus,
} from "@/components/dashboard/case-status/case-status-section-helpers";
import { daysSinceEpochMs } from "@/lib/case-status/safe-dates";
import { getServiceCenterLocation } from '@/lib/case-status/case-status-display';
import {
  DEFAULT_FILING_CATEGORY,
  getFilingCategoryFormMismatch,
  isOptFilingCategory,
  normalizeFilingCategory,
  type FilingCategory,
} from '@/lib/case-status/filing-category';
import {
  shouldShowStatusChangeWedge,
  shouldShowStaleStatusUpsell,
  MANUAL_REFRESH_COUNT_SESSION_KEY,
  MANUAL_REFRESH_UPSELL_SESSION_KEY,
  STALE_STATUS_UPSELL_SESSION_KEY,
  CHECKOUT_UPSELL_TRIGGER,
  type CheckoutUpsellTrigger,
} from "@/lib/case-status/free-change-wedge";
import {
  CASE_INSIGHT_PROMPT_DELAY_MS,
  CASE_INSIGHT_PROMPT_SESSION_KEY,
  CASE_INSIGHT_PROMPT_STORAGE_KEY,
  parsePromptTimestamp,
  shouldShowCaseInsightPrompt,
} from '@/lib/case-status/free-case-insight-prompt';
import {
  captureCaseStatusCheckCompletedClient,
  captureFilingCategoryUpdated,
  captureUpgradePromptShown,
} from "@/lib/posthog-client";
import { getReceiptPrefix } from "@/lib/posthog/uscis-status-category";
import { requestNpsSurvey } from "@/lib/posthog/nps-survey";
import { validateReceiptNumber } from "@/lib/uscis/receipt-number-validation";
import {
  normalizeStatusHistory,
  withNormalizedStatusHistory,
} from "@/lib/case-status/normalize-status-history";
import { deriveCaseState } from "@/components/dashboard/case-status/panels/StickyCaseSwitcher";
import { useClientDate } from "@/hooks/useClientDate";
import { PRODUCT_CTAS } from "@/lib/messaging/product-copy";
import type { WeeklyTrendPoint } from "@/lib/community-opt/weekly-trend";
import type { ProcessingHistogram } from "@/lib/community-opt/estimate";
import type { CommunityEstimate, CommunitySummary } from "@/lib/community-opt/types";
import type { SimilarFilingPeers } from "@/lib/community-opt/similar-filing";
import type { JourneyStages } from "@/lib/community-opt/stages";
import { getPpClock } from "@/lib/case-status/premium-processing";

export function useCaseStatusController() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [filingCategory, setFilingCategory] = useState<FilingCategory>(DEFAULT_FILING_CATEGORY);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [communityPrediction, setCommunityPrediction] =
    useState<CommunityEstimate | null>(null);
  const [communityHeatmap, setCommunityHeatmap] = useState<
    Array<{ month: string; buckets: number[] }>
  >([]);
  const [communityWeeklyTrend, setCommunityWeeklyTrend] = useState<
    WeeklyTrendPoint[]
  >([]);
  const [communityHistogram, setCommunityHistogram] =
    useState<ProcessingHistogram | null>(null);
  const [communitySimilarFiling, setCommunitySimilarFiling] =
    useState<SimilarFilingPeers | null>(null);
  const [communitySummary, setCommunitySummary] =
    useState<CommunitySummary | null>(null);
  const [communityStages, setCommunityStages] = useState<JourneyStages | null>(
    null
  );
  const [communityEstimateLoading, setCommunityEstimateLoading] = useState(false);
  const [trackedCases, setTrackedCases] = useState<CaseStatus[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isAddingCase, setIsAddingCase] = useState(false);
  // isInitialLoad guards the full-page spinner on first mount only.
  // Subsequent reloads (polling, refresh) use isRefreshing so the UI doesn't collapse.
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // null = still loading, true/false = resolved — prevents free-tier flash for Pro users
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [proIntroEligible, setProIntroEligible] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingModalPlan, setPricingModalPlan] = useState<"pro" | "dedicated">(
    "pro"
  );
  const [notificationEmail, setNotificationEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [casePendingDelete, setCasePendingDelete] = useState<{
    id: string;
    receipt_number: string;
  } | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  // ISS-030: explicit load error so UI can distinguish "no case" vs "couldn't load"
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wedgeDismissed, setWedgeDismissed] = useState(false);
  const [packagingNoticeDismissed, setPackagingNoticeDismissed] = useState(true);
  const [showManualRefreshUpsell, setShowManualRefreshUpsell] = useState(false);
  const [showStaleStatusUpsell, setShowStaleStatusUpsell] = useState(false);
  const [showCaseInsightUpgrade, setShowCaseInsightUpgrade] = useState(false);
  const caseInsightPromptHandledRef = useRef(false);
  const pendingReceiptInsightRef = useRef(false);
  const [isEditingReceipt, setIsEditingReceipt] = useState(false);
  const [filingDateInput, setFilingDateInput] = useState("");
  const [filingDateSaving, setFilingDateSaving] = useState(false);
  const [filingCategorySaving, setFilingCategorySaving] = useState(false);
  const [filingCategoryPromptDismissed, setFilingCategoryPromptDismissed] = useState(false);

  const showStatusChangeWedge = useMemo(() => {
    if (wedgeDismissed || isPremium !== false || !caseStatus) return false;
    return shouldShowStatusChangeWedge(caseStatus, isPremium);
  }, [wedgeDismissed, isPremium, caseStatus]);

  const openProTrialModal = useCallback((trigger?: CheckoutUpsellTrigger) => {
    setPricingModalPlan('pro');
    setShowPricingModal(true);
    if (trigger) {
      captureUpgradePromptShown({
        trigger,
        source: 'case_status_page',
        plan_suggested: 'pro',
      });
    }
  }, []);

  const openDedicatedModal = useCallback(() => {
    setPricingModalPlan("dedicated");
    setShowPricingModal(true);
    captureUpgradePromptShown({
      trigger: "case_status_attorney_access",
      source: "case_status_page",
      plan_suggested: "dedicated",
    });
  }, []);

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
      setShowCaseInsightUpgrade(true);
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

  useEffect(() => {
    try {
      setPackagingNoticeDismissed(
        window.localStorage.getItem(PACKAGING_NOTICE_DISMISS_KEY) === "1"
      );
    } catch {
      setPackagingNoticeDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (isPremium !== false || !caseStatus?.last_checked_at) return;
    if (!shouldShowStaleStatusUpsell(caseStatus.last_checked_at, isPremium)) return;
    try {
      if (sessionStorage.getItem(STALE_STATUS_UPSELL_SESSION_KEY) === "1") return;
      sessionStorage.setItem(STALE_STATUS_UPSELL_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowStaleStatusUpsell(true);
    captureUpgradePromptShown({
      trigger: CHECKOUT_UPSELL_TRIGGER.STALE_STATUS,
      source: "case_status_page",
      plan_suggested: "pro",
    });
  }, [isPremium, caseStatus?.last_checked_at, caseStatus?.id]);

  const showPackagingNotice =
    !packagingNoticeDismissed && isPremium === false && Boolean(caseStatus);

  const proUpgradeCta = proIntroEligible
    ? PRODUCT_CTAS.startTrial
    : PRODUCT_CTAS.upgradeToPro;

  const nextCheckAt = useMemo(() => {
    if (isPremium !== true || !caseStatus?.last_checked_at) return null;
    const next = new Date(
      new Date(caseStatus.last_checked_at).getTime() + 24 * 60 * 60 * 1000
    );
    return Number.isNaN(next.getTime()) ? null : next.toISOString();
  }, [isPremium, caseStatus?.last_checked_at]);

  // Client-only date — null during SSR/hydration to prevent error #418.
  const clientNow = useClientDate();
  const clientNowMs = clientNow ? clientNow.getTime() : null;

  const safeStatusHistory = useMemo(
    () =>
      Array.isArray(caseStatus?.status_history)
        ? caseStatus.status_history
        : normalizeStatusHistory(caseStatus?.status_history),
    [caseStatus?.status_history]
  );

  const caseLimit = getCaseTrackingLimit(isPremium === true);
  const canAddMoreCases = trackedCases.length < caseLimit;

  const applyCasesToState = useCallback(
    (
      cases: CaseStatus[],
      preferredId?: string | null,
      primaryCaseId?: string | null
    ) => {
      const normalized = cases.map((c) => withNormalizedStatusHistory(c));
      setTrackedCases(normalized);
      if (normalized.length === 0) {
        setCaseStatus(null);
        setSelectedCaseId(null);
        return;
      }
      const active = selectActiveCase(normalized, preferredId, primaryCaseId);
      setSelectedCaseId(active.id);
      setCaseStatus(active);
      setReceiptNumber(active.receipt_number);
      setFilingCategory(normalizeFilingCategory(active.filing_category));
    },
    []
  );

  const selectCase = useCallback(
    (caseId: string) => {
      const found = trackedCases.find((c) => c.id === caseId);
      if (!found) return;
      setSelectedCaseId(caseId);
      setCaseStatus(withNormalizedStatusHistory(found));
      setReceiptNumber(found.receipt_number);
      setFilingCategory(normalizeFilingCategory(found.filing_category));
      setIsAddingCase(false);
      setError(null);
      setSuccess(false);
    },
    [trackedCases]
  );

  useEffect(() => {
    loadCaseStatus(true);
    checkPremiumStatus();
    loadUserEmail();
     
  }, []);

  useEffect(() => {
    if (!deleteNotice) return;
    const timer = setTimeout(() => setDeleteNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [deleteNotice]);

  // ── Supabase Realtime: Instant UI updates when cron updates DB ──
  useEffect(() => {
    if (!caseStatus?.receipt_number || !isSupabaseRealtimeSupported()) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`case-status-realtime-${caseStatus.receipt_number}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "case_status",
            filter: `receipt_number=eq.${caseStatus.receipt_number}`,
          },
          (payload) => {
            setCaseStatus((prev) => {
              if (!prev) return prev;
              return withNormalizedStatusHistory({
                ...prev,
                ...(payload.new as Partial<CaseStatus>),
              });
            });
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn("Case status realtime unavailable:", status);
          }
        });
    } catch (error) {
      console.warn("Case status realtime subscription skipped:", error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* non-blocking */
        }
      }
    };
  }, [caseStatus?.receipt_number]);

  // Community processing-time estimate (partner timelines — not USCIS API).
  useEffect(() => {
    if (!caseStatus?.receipt_number) {
      setCommunityPrediction(null);
      setCommunitySummary(null);
      setCommunityStages(null);
      setCommunityHeatmap([]);
      setCommunityWeeklyTrend([]);
      setCommunityHistogram(null);
      setCommunitySimilarFiling(null);
      return;
    }

    if (!isOptFilingCategory(caseStatus.filing_category)) {
      setCommunityPrediction(null);
      setCommunitySummary(null);
      setCommunityStages(null);
      setCommunityHeatmap([]);
      setCommunityWeeklyTrend([]);
      setCommunityHistogram(null);
      setCommunitySimilarFiling(null);
      setCommunityEstimateLoading(false);
      return;
    }

    const controller = new AbortController();
    const days =
      clientNowMs !== null
        ? daysSinceEpochMs(caseStatus.received_date, clientNowMs)
        : 0;

    // Prefix only — it is all the service-center lookup needs, and it keeps
    // full receipt numbers out of request logs.
    const params = new URLSearchParams({
      receipt_prefix: caseStatus.receipt_number.slice(0, 3),
      days: String(days),
    });
    if (caseStatus.case_type) params.set("case_type", caseStatus.case_type);
    if (caseStatus.label) params.set("label", caseStatus.label);
    if (caseStatus.filing_category) {
      params.set("filing_category", caseStatus.filing_category);
    }
    if (caseStatus.pp_start_date) params.set("pp_start", caseStatus.pp_start_date);
    if (caseStatus.received_date) params.set("received", caseStatus.received_date);

    setCommunityEstimateLoading(true);
    void fetch(`/api/case-status/community-estimate?${params}`, {
      signal: controller.signal,
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{
          ok?: boolean;
          prediction?: CommunityEstimate | null;
          summary?: CommunitySummary | null;
          stages?: JourneyStages | null;
          heatmap?: Array<{ month: string; buckets: number[] }>;
          weeklyTrend?: WeeklyTrendPoint[];
          histogram?: ProcessingHistogram | null;
          similarFiling?: SimilarFilingPeers | null;
        }>;
      })
      .then((body) => {
        if (!body || controller.signal.aborted) return;
        setCommunityPrediction(body.prediction ?? null);
        setCommunitySummary(body.summary ?? null);
        setCommunityStages(body.stages ?? null);
        setCommunityHeatmap(body.heatmap ?? []);
        setCommunityWeeklyTrend(body.weeklyTrend ?? []);
        setCommunityHistogram(body.histogram ?? null);
        setCommunitySimilarFiling(body.similarFiling ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCommunityPrediction(null);
          setCommunitySummary(null);
          setCommunityStages(null);
          setCommunityHeatmap([]);
          setCommunityWeeklyTrend([]);
          setCommunityHistogram(null);
          setCommunitySimilarFiling(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCommunityEstimateLoading(false);
      });

    return () => controller.abort();
  }, [
    caseStatus?.receipt_number,
    caseStatus?.case_type,
    caseStatus?.label,
    caseStatus?.filing_category,
    caseStatus?.pp_start_date,
    caseStatus?.received_date,
    clientNowMs,
  ]);

  const filingCategoryPromptKey = caseStatus?.id
    ? `tmo_filing_prompt_dismissed_${caseStatus.id}`
    : null;

  useEffect(() => {
    if (!filingCategoryPromptKey) {
      setFilingCategoryPromptDismissed(false);
      return;
    }
    setFilingCategoryPromptDismissed(
      sessionStorage.getItem(filingCategoryPromptKey) === "1"
    );
  }, [filingCategoryPromptKey]);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/premium/status', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium === true);
        setProIntroEligible(
          data.isPremium !== true &&
            (data.proPaidIntroEligible === true ||
              data.proFreeTrialEligible === true)
        );
      } else {
        // Treat fetch errors as unknown, not as "free" — avoids false upsell on transient failures
        setIsPremium(null);
        setProIntroEligible(false);
      }
    } catch {
      setIsPremium(null);
      setProIntroEligible(false);
    }
  };

  const loadUserEmail = async () => {
    try {
      const response = await fetch('/api/user/notification-email', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationEmail(data.email || "");
      }
    } catch {
      // Email load failed silently
    }
  };

  const loadCaseStatus = async (
    isInitial = false,
    preferredId?: string | null
  ) => {
    try {
      const response = await fetch('/api/case-status', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        if (!result.ok) {
          setLoadError('Could not load your case status.');
          return null;
        }
        const cases: CaseStatus[] = result.cases?.length
          ? result.cases
          : result.data
            ? [result.data]
            : [];
        if (cases.length > 0) {
          applyCasesToState(
            cases,
            preferredId !== undefined ? preferredId : selectedCaseId,
            result.primaryCaseId
          );
          setLoadError(null);
          return cases.find((c) => c.id === selectedCaseId) ?? cases[0];
        }
        setTrackedCases([]);
        setCaseStatus(null);
        setSelectedCaseId(null);
        setLoadError(null);
        return null;
      }
      // ISS-030: differentiate "no case" from "couldn't load"
      setLoadError('Could not load your case status.');
      return null;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Network error while loading case status.');
      return null;
    } finally {
      if (isInitial) setIsInitialLoad(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    const trimmed = receiptNumber.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a receipt number.");
      return;
    }

    const validation = validateReceiptNumber(trimmed);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const isNewCase =
      isAddingCase ||
      !trackedCases.some((c) => c.receipt_number === validation.normalized);

    if (isNewCase && !canAddMoreCases) {
      setError(caseLimitMessage(isPremium === true));
      if (isPremium === false) openProTrialModal();
      return;
    }

    const wasFirstCase = trackedCases.length === 0;

    try {
      setIsSaving(true);
      setIsPolling(true);

      const response = await fetch("/api/case-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt_number: validation.normalized,
          notifications_enabled: caseStatus?.notifications_enabled ?? true,
          set_primary: trackedCases.length === 0,
          filing_category: filingCategory,
        }),
      });

      const postResult = await response.json().catch(() => ({}));
      if (!response.ok || !postResult.ok) {
        setError(
          (typeof postResult.error === "string" && postResult.error) ||
            "Failed to save receipt number."
        );
        if (postResult.code === "case_limit_reached" && isPremium === false) {
          openProTrialModal();
        }
        return;
      }

      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const data = await loadCaseStatus();
        if (
          data?.current_status &&
          data.last_checked_at &&
          data.current_status !== "Status will be fetched shortly..."
        ) {
          break;
        }
      }

      const data = await loadCaseStatus();
      const statusResolved = Boolean(
        data?.current_status &&
          data.last_checked_at &&
          data.current_status !== "Status will be fetched shortly..."
      );
      if (data) {
        setIsEditingReceipt(false);
        setIsAddingCase(false);
      }
      setSuccess(true);

      if (
        isPremium === false &&
        (wasFirstCase || isNewCase) &&
        statusResolved
      ) {
        pendingReceiptInsightRef.current = true;
      }

      if (wasFirstCase && statusResolved) {
        requestNpsSurvey({
          trigger: "case_status_first_success",
          planTier: isPremium === true ? "pro" : "free",
        });
      }

      if (!statusResolved) {
        setError(
          "Status check is taking longer than expected. It will update automatically — please check back shortly."
        );
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
      setIsPolling(false);
    }
  };

  const handleRefresh = async () => {
    if (!caseStatus) return;

    try {
      setIsRefreshing(true);
      setError(null);
      const response = await fetch('/api/case-status/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseStatus.id }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        captureCaseStatusCheckCompletedClient({
          trigger: "manual",
          receipt_prefix: getReceiptPrefix(caseStatus.receipt_number),
        });
        await loadCaseStatus();

        if (isPremium === false && typeof window !== "undefined") {
          const prev = parseInt(
            sessionStorage.getItem(MANUAL_REFRESH_COUNT_SESSION_KEY) || "0",
            10
          );
          const count = prev + 1;
          sessionStorage.setItem(MANUAL_REFRESH_COUNT_SESSION_KEY, String(count));

          if (
            count === 2 &&
            !sessionStorage.getItem(MANUAL_REFRESH_UPSELL_SESSION_KEY)
          ) {
            sessionStorage.setItem(MANUAL_REFRESH_UPSELL_SESSION_KEY, "1");
            setShowManualRefreshUpsell(true);
            captureUpgradePromptShown({
              trigger: CHECKOUT_UPSELL_TRIGGER.SECOND_MANUAL_REFRESH,
              source: "case_status_page",
              plan_suggested: "pro",
            });
          }
        }
      } else {
        setError(result.error || 'Failed to refresh status. Please try again.');
      }
    } catch {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const requestDeleteCase = (caseId: string) => {
    const target = trackedCases.find((c) => c.id === caseId);
    if (!target) return;
    setCasePendingDelete({
      id: target.id,
      receipt_number: target.receipt_number,
    });
  };

  const confirmDeleteCase = async () => {
    if (!casePendingDelete) return;
    const { id: caseId, receipt_number: deletedReceipt } = casePendingDelete;
    setCasePendingDelete(null);

    const nextPreferred =
      selectedCaseId && selectedCaseId !== caseId ? selectedCaseId : null;

    try {
      setIsRemoving(caseId);
      const response = await fetch(`/api/case-status?id=${encodeURIComponent(caseId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await loadCaseStatus(false, nextPreferred);
        setDeleteNotice(`Stopped tracking ${deletedReceipt}.`);
        setError(null);
        setSuccess(false);
        setIsAddingCase(false);
        setIsEditingReceipt(false);
      } else {
        const result = await response.json();
        setError(result.error || "Failed to remove case.");
      }
    } catch {
      setError("An error occurred while removing the case.");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleRemove = () => {
    if (!caseStatus) return;
    requestDeleteCase(caseStatus.id);
  };

  const handleSetPrimary = async (caseId: string) => {
    try {
      const response = await fetch("/api/case-status/primary", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId }),
      });
      if (response.ok) {
        await loadCaseStatus();
      }
    } catch {
      setError("Could not update primary case.");
    }
  };

  const handleStartAddCase = () => {
    if (!canAddMoreCases) {
      setError(caseLimitMessage(isPremium === true));
      if (isPremium === false) openProTrialModal();
      return;
    }
    setIsAddingCase(true);
    setReceiptNumber("");
    setFilingCategory(DEFAULT_FILING_CATEGORY);
    setError(null);
    setSuccess(false);
    setIsEditingReceipt(true);
  };

  const toggleNotifications = async () => {
    if (!caseStatus) return;

    if (isPremium === false) {
      openProTrialModal();
      return;
    }

    try {
      const response = await fetch('/api/case-status/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications_enabled: !caseStatus.notifications_enabled,
          case_id: caseStatus.id,
        }),
      });

      if (response.ok) {
        await loadCaseStatus();
      } else {
        setError('Failed to update notification settings.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  const handleFilingCategoryUpdate = async (
    next: FilingCategory,
    source: "confirm_banner" | "case_info" | "enrollment" = "case_info"
  ) => {
    if (!caseStatus || next === normalizeFilingCategory(caseStatus.filing_category)) return;

    try {
      setFilingCategorySaving(true);
      setError(null);
      const response = await fetch("/api/case-status/filing-category", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseStatus.id,
          filing_category: next,
        }),
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        setFilingCategory(next);
        captureFilingCategoryUpdated({ filing_category: next, source });
        await loadCaseStatus();
      } else {
        setError(result.error || "Failed to update filing type.");
      }
    } catch {
      setError("An error occurred while updating filing type.");
    } finally {
      setFilingCategorySaving(false);
    }
  };

  const handleSaveFilingDate = async () => {
    if (!caseStatus || !filingDateInput) {
      setError("Please enter a valid filing date.");
      return;
    }

    try {
      setFilingDateSaving(true);
      setError(null);
      const response = await fetch("/api/case-status/filing-date", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseStatus.id,
          received_date: filingDateInput,
        }),
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        await loadCaseStatus();
        setFilingDateInput("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save filing date.");
      }
    } catch {
      setError("An error occurred while saving filing date.");
    } finally {
      setFilingDateSaving(false);
    }
  };

  const handleEmailSave = async () => {
    if (isPremium === false) {
      openProTrialModal();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!notificationEmail || !emailRegex.test(notificationEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setEmailSaving(true);
    try {
      const response = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notificationEmail, toolType: 'case-status' }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsEditingEmail(false);
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to save email.');
      }
    } catch {
      setError('An error occurred while saving email.');
    } finally {
      setEmailSaving(false);
    }
  };

  // ── Derived state for new layout ──────────────────────────────────────────
  const caseState = deriveCaseState(caseStatus?.current_status);

  // PP overdue calculation — 0 until clientNow is available (post-hydration).
  const ppStartDate = caseStatus?.pp_start_date ?? null;
  const ppClock =
    ppStartDate && clientNowMs !== null
      ? getPpClock(ppStartDate, new Date(clientNowMs))
      : null;
  const ppOverdueDays = ppClock?.daysOverdue ?? 0;
  const ppDeadlineDate = ppClock?.deadline ?? null;
  const daysSinceFiled =
    clientNowMs !== null
      ? daysSinceEpochMs(caseStatus?.received_date, clientNowMs)
      : null;
  const serviceCenterLocation = getServiceCenterLocation(caseStatus?.receipt_number);

  const isOptCase = isOptFilingCategory(caseStatus?.filing_category);
  const isStemExtension =
    normalizeFilingCategory(caseStatus?.filing_category) === "stem_extension";

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
    isInitialLoad,
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
    safeStatusHistory,
    showPackagingNotice,
    proUpgradeCta,
    nextCheckAt,
    clientNowMs,
    deleteNotice,
    caseStatus,
    loadError,
    receiptNumber,
    filingCategory,
    isSaving,
    isPolling,
    error,
    success,
    trackedCases,
    selectedCaseId,
    isRemoving,
    canAddMoreCases,
    showStatusChangeWedge,
    isPremium,
    filingCategorySaving,
    filingCategoryPromptKey,
    isEditingReceipt,
    isRefreshing,
    notificationEmail,
    communityPrediction,
    communitySummary,
    communityStages,
    communityHeatmap,
    communityWeeklyTrend,
    communityHistogram,
    communitySimilarFiling,
    communityEstimateLoading,
    filingDateInput,
    filingDateSaving,
    isEditingEmail,
    emailSaving,
    showManualRefreshUpsell,
    showStaleStatusUpsell,
    casePendingDelete,
    showCaseInsightUpgrade,
    proIntroEligible,
    showPricingModal,
    pricingModalPlan,
    setLoadError,
    setReceiptNumber,
    setFilingCategory,
    setPackagingNoticeDismissed,
    setWedgeDismissed,
    setCaseStatus,
    setFilingCategoryPromptDismissed,
    setIsEditingReceipt,
    setError,
    setSuccess,
    setIsEditingEmail,
    setFilingDateInput,
    setNotificationEmail,
    setShowManualRefreshUpsell,
    setShowStaleStatusUpsell,
    setCasePendingDelete,
    setShowCaseInsightUpgrade,
    setShowPricingModal,
    loadCaseStatus,
    handleSave,
    selectCase,
    requestDeleteCase,
    handleStartAddCase,
    openProTrialModal,
    handleFilingCategoryUpdate,
    handleRefresh,
    handleRemove,
    openDedicatedModal,
    handleSaveFilingDate,
    toggleNotifications,
    handleEmailSave,
    confirmDeleteCase,
  };
}
