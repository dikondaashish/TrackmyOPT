'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseRealtimeSupported } from '@/lib/supabase/realtime-supported';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PricingModal } from '@/components/pricing/PricingModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  caseLimitMessage,
  getCaseTrackingLimit,
} from "@/lib/case-status/case-limits";
import { CaseHistoryTimeline } from "@/components/dashboard/case-status/CaseHistoryTimeline";
import {
  CaseStatusPanelErrorBoundary,
  CaseTimelineErrorBoundary,
} from "@/components/dashboard/case-status/CaseTimelineErrorBoundary";
import { daysSinceEpochMs, formatDisplayDateShort, formatDisplayDateTime } from "@/lib/case-status/safe-dates";
import { UscisCaseStatusDisclaimer } from "@/components/legal/UscisCaseStatusDisclaimer";
import { CaseStatusPageViewTracker } from "@/components/analytics/CaseStatusPageViewTracker";
import {
  formatDaysAgoLabel,
  formatStatusLabel,
  getServiceCenterLabel,
  getServiceCenterLocation,
} from '@/lib/case-status/case-status-display';
import {
  DEFAULT_FILING_CATEGORY,
  getFilingCategoryFormMismatch,
  isOptFilingCategory,
  normalizeFilingCategory,
  type FilingCategory,
} from '@/lib/case-status/filing-category';
import { FilingCategorySelect } from '@/components/dashboard/case-status/FilingCategorySelect';
import { FilingCategoryConfirmBanner } from '@/components/dashboard/case-status/FilingCategoryConfirmBanner';
import { Globe } from 'lucide-react';
import { PremiumProcessingCountdown } from '@/components/dashboard/case-status/PremiumProcessingCountdown';
import { CaseStatusReceiptPanel } from '@/components/dashboard/case-status/CaseStatusReceiptPanel';
import { StatusChangeUpgradeBanner } from '@/components/dashboard/case-status/StatusChangeUpgradeBanner';
import { ManualRefreshUpsellPrompt } from '@/components/dashboard/case-status/ManualRefreshUpsellPrompt';
import { CaseInsightUpgradeDialog } from '@/components/dashboard/case-status/CaseInsightUpgradeDialog';
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
  type CaseStatusHistoryEntry,
} from "@/lib/case-status/normalize-status-history";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  X,
  Crown,
} from "lucide-react";
import { StickyCaseSwitcher, deriveCaseState } from "@/components/dashboard/case-status/redesign/StickyCaseSwitcher";
import { useClientDate } from "@/hooks/useClientDate";
import { UrgentActionBanner } from "@/components/dashboard/case-status/redesign/UrgentActionBanner";
import { CaseHeroCard } from "@/components/dashboard/case-status/redesign/CaseHeroCard";
import { MonitorHealthStrip } from "@/components/dashboard/case-status/redesign/MonitorHealthStrip";
import { AnalyticsTabs } from "@/components/dashboard/case-status/redesign/AnalyticsTabs";
import { ToolsAccordion } from "@/components/dashboard/case-status/redesign/ToolsAccordion";
import { CaseActionCenter } from "@/components/dashboard/case-status/redesign/CaseActionCenter";
import { DedicatedConsultationCard } from "@/components/dashboard/case-status/redesign/DedicatedConsultationCard";
import { OptJourneySection } from "@/components/dashboard/case-status/redesign/OptJourneySection";
import { CaseInfoFooter } from "@/components/dashboard/case-status/redesign/CaseInfoFooter";
import {
  CASE_STATUS_MESSAGING,
  PRODUCT_CTAS,
} from "@/lib/messaging/product-copy";
import type { WeeklyTrendPoint } from "@/lib/community-opt/weekly-trend";
import type { ProcessingHistogram } from "@/lib/community-opt/estimate";
import type { CommunityEstimate, CommunitySummary } from "@/lib/community-opt/types";
import type { SimilarFilingPeers } from "@/lib/community-opt/similar-filing";
import type { JourneyStages } from "@/lib/community-opt/stages";
import { deriveJourneyPhase } from "@/lib/community-opt/stages";
import { getPpClock } from "@/lib/case-status/premium-processing";

const PACKAGING_NOTICE_DISMISS_KEY = "tmo_packaging_notice_dismissed_v1";

interface CaseStatus {
  id: string;
  receipt_number: string;
  current_status: string | null;
  case_type: string | null;
  received_date: string | null;
  pp_start_date?: string | null;
  last_checked_at: string | null;
  last_status_change_at: string | null;
  last_status_viewed_at?: string | null;
  status_last_changed_at?: string | null;
  last_change_alert_suppressed?: boolean;
  status_history: CaseStatusHistoryEntry[];
  change_log: Array<{
    date: string;
    old_status: string;
    new_status: string;
  }>;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  // ISS-012: failure-state surfaces
  last_check_failed_at?: string | null;
  last_check_error_code?: string | null;
  last_check_error_message?: string | null;
  consecutive_failures?: number;
  is_primary?: boolean;
  label?: string | null;
  filing_category?: string | null;
  filing_category_confirmed_at?: string | null;
}

export function CaseStatusSection() {
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
      const activeId =
        (preferredId && normalized.find((c) => c.id === preferredId)?.id) ||
        (primaryCaseId && normalized.find((c) => c.id === primaryCaseId)?.id) ||
        normalized.find((c) => c.is_primary)?.id ||
        normalized[0].id;
      const active = normalized.find((c) => c.id === activeId) ?? normalized[0];
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

  const formatDate = (dateString: string | null) =>
    formatDisplayDateTime(dateString);

  const formatDateShort = (dateString: string) =>
    formatDisplayDateShort(dateString);

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

  if (isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
          <ClipboardCheck className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground font-medium">Loading your case status…</p>
      </div>
    );
  }

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

  const formTypeMismatch = getFilingCategoryFormMismatch(
    caseStatus?.filing_category,
    caseStatus?.case_type
  );

  const showFilingCategoryPrompt =
    Boolean(caseStatus) &&
    isOptFilingCategory(caseStatus?.filing_category) &&
    !caseStatus?.filing_category_confirmed_at &&
    !filingCategoryPromptDismissed;

  const rfeDate: string | null = (() => {
    const rfe = safeStatusHistory.find(
      (e) =>
        typeof e.status === "string" &&
        e.status.toLowerCase().includes("request for evidence")
    );
    return rfe?.date ?? null;
  })();

  return (
    <div className="space-y-5">
      <CaseStatusPageViewTracker
        isInitialLoadComplete={!isInitialLoad}
        hasReceipt={Boolean(caseStatus?.receipt_number)}
        hasStatus={Boolean(caseStatus?.current_status)}
        currentStatus={caseStatus?.current_status ?? null}
      />
      {/* Minimal page title — no marketing copy */}
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">USCIS Case Status</h1>

      {/* ── Delete success banner ── */}
      {deleteNotice && (
        <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" role="status">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{deleteNotice}</p>
          </div>
        </Card>
      )}

      {/* ── Load error (no case) ── */}
      {!caseStatus && loadError && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" role="alert">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Couldn&apos;t load your case status.</strong>{' '}
              <span className="opacity-90">{loadError}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setLoadError(null); void loadCaseStatus(true); }}>
              Try again
            </Button>
          </div>
        </Card>
      )}

      {/* ── Onboarding (no case yet) ── */}
      {!caseStatus && !loadError && (
        <CaseStatusReceiptPanel
          mode="onboarding"
          receiptNumber={receiptNumber}
          filingCategory={filingCategory}
          onReceiptChange={setReceiptNumber}
          onFilingCategoryChange={setFilingCategory}
          onSave={handleSave}
          isSaving={isSaving}
          isPolling={isPolling}
          error={error}
          success={success}
        />
      )}

      {caseStatus && (
        <>
          {/* ── 1. STICKY CASE SWITCHER ── */}
          {trackedCases.length > 0 && (
            <StickyCaseSwitcher
              cases={trackedCases.map((c) => ({
                id: c.id,
                receiptNumber: c.receipt_number,
                formType: c.case_type ?? null,
                filingCategory: c.filing_category ?? null,
                caseState: deriveCaseState(c.current_status),
                isPrimary: c.is_primary,
              }))}
              selectedId={selectedCaseId ?? caseStatus.id}
              onSelect={selectCase}
              onDeleteCase={requestDeleteCase}
              deletingCaseId={isRemoving}
              onAddCase={handleStartAddCase}
              canAddMore={canAddMoreCases}
            />
          )}

          {/* ── 2. URGENT ACTION BANNER ── */}
          <UrgentActionBanner
            caseState={caseState}
            premiumProcessing={
              ppOverdueDays > 0 && ppDeadlineDate
                ? { overdueBusinessDays: ppOverdueDays, deadlineDate: ppDeadlineDate }
                : undefined
            }
            rfeDate={rfeDate}
          />

          {/* ── 2b. Packaging clarification (free users with a case) ── */}
          {showPackagingNotice && (
            <Card
              className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              role="status"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-100 flex-1">
                  {CASE_STATUS_MESSAGING.packagingChangeNotice}{" "}
                  <button
                    type="button"
                    onClick={() => openProTrialModal()}
                    className="font-medium underline underline-offset-2 hover:no-underline cursor-pointer"
                  >
                    {proUpgradeCta}
                  </button>
                </p>
                <button
                  type="button"
                  aria-label="Dismiss packaging notice"
                  className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                  onClick={() => {
                    setPackagingNoticeDismissed(true);
                    try {
                      window.localStorage.setItem(PACKAGING_NOTICE_DISMISS_KEY, "1");
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          )}

          {/* ── 2c. Status-change upgrade wedge (free users) ── */}
          {showStatusChangeWedge && caseStatus.status_last_changed_at && (
            <StatusChangeUpgradeBanner
              statusLastChangedAt={caseStatus.status_last_changed_at}
              onStartTrial={() => openProTrialModal()}
              ctaLabel={proUpgradeCta}
              onAcknowledged={() => {
                setWedgeDismissed(true);
                setCaseStatus((prev) => prev ? { ...prev, last_status_viewed_at: new Date().toISOString() } : prev);
              }}
            />
          )}

          {/* Persistent trial CTA for free users with a receipt */}
          {isPremium === false && (
            <Card className="p-3 border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm text-purple-950 dark:text-purple-100 flex-1">
                  {CASE_STATUS_MESSAGING.trialCtaStrip}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                  onClick={() => openProTrialModal()}
                >
                  <Crown className="w-4 h-4 mr-1.5" />
                  {proUpgradeCta}
                </Button>
              </div>
            </Card>
          )}

          {/* ── Filing type backfill (legacy users) ── */}
          {showFilingCategoryPrompt && (
            <FilingCategoryConfirmBanner
              saving={filingCategorySaving}
              onConfirm={(category) => void handleFilingCategoryUpdate(category, "confirm_banner")}
              onDismiss={() => {
                if (filingCategoryPromptKey) {
                  sessionStorage.setItem(filingCategoryPromptKey, "1");
                }
                setFilingCategoryPromptDismissed(true);
              }}
            />
          )}

          {/* ── Form mismatch warning ── */}
          {formTypeMismatch && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" role="status">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-100">{formTypeMismatch}</p>
              </div>
            </Card>
          )}

          {/* ── 3. MAIN CASE HERO CARD ── */}
          {isEditingReceipt ? (
            <CaseStatusReceiptPanel
              mode="edit"
              receiptNumber={receiptNumber}
              filingCategory={filingCategory}
              onReceiptChange={setReceiptNumber}
              onFilingCategoryChange={setFilingCategory}
              onSave={handleSave}
              isSaving={isSaving}
              isPolling={isPolling}
              error={error}
              success={success}
              onCancelEdit={() => {
                setIsEditingReceipt(false);
                setReceiptNumber(caseStatus.receipt_number);
                setFilingCategory(normalizeFilingCategory(caseStatus.filing_category));
                setError(null);
                setSuccess(false);
              }}
            />
          ) : (
            <CaseStatusPanelErrorBoundary area="hero">
              <CaseHeroCard
                caseStatus={{ ...caseStatus, status_history: safeStatusHistory }}
                caseState={caseState}
                ppOverdueDays={ppOverdueDays}
                ppDeadlineDate={ppDeadlineDate}
                updateCount={safeStatusHistory.length}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onManageCase={() => {
                  setIsEditingReceipt(true);
                  setReceiptNumber(caseStatus.receipt_number);
                  setFilingCategory(normalizeFilingCategory(caseStatus.filing_category));
                }}
                onDelete={handleRemove}
                isDeleting={isRemoving === caseStatus.id}
                refreshError={error}
              />
            </CaseStatusPanelErrorBoundary>
          )}

          {/* ── 3a. CASE ACTION CENTER ── */}
          <CaseStatusPanelErrorBoundary area="case_action_center">
            <CaseActionCenter
              statusText={caseStatus.current_status}
              daysSinceFiled={daysSinceFiled}
            />
          </CaseStatusPanelErrorBoundary>

          <CaseStatusPanelErrorBoundary area="dedicated_consultation">
            <DedicatedConsultationCard
              caseId={caseStatus.id}
              onCompareDedicated={openDedicatedModal}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 3b. Refresh failed inline warning ── */}
          {caseStatus.last_check_failed_at && (caseStatus.consecutive_failures ?? 0) > 0 && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  {isPremium === true
                    ? `Last auto-check failed (${formatDate(caseStatus.last_check_failed_at)}). USCIS may be unreachable — we will keep retrying.`
                    : `Last check failed (${formatDate(caseStatus.last_check_failed_at)}). Try a manual refresh, or upgrade to Pro for daily auto-checks.`}
                </p>
              </div>
            </Card>
          )}

          {/* ── 4. MONITOR HEALTH STRIP ── */}
          <CaseStatusPanelErrorBoundary area="monitor_health">
            <MonitorHealthStrip
              monitorActive={isPremium === true}
              lastCheckedAt={caseStatus.last_checked_at}
              nextCheckAt={nextCheckAt}
              emailAlertsEnabled={caseStatus.notifications_enabled}
              emailAddress={notificationEmail}
              onEditEmail={() => setIsEditingEmail(true)}
              onUpgrade={
                isPremium === false ? () => openProTrialModal() : undefined
              }
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 4b. PP Countdown (keep existing component) ── */}
          <CaseStatusPanelErrorBoundary area="pp_countdown">
            <PremiumProcessingCountdown
              caseId={caseStatus.id}
              ppStartDate={caseStatus.pp_start_date ?? null}
              currentStatus={caseStatus.current_status}
              statusHistory={safeStatusHistory}
              onSaved={() => void loadCaseStatus()}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 5. ANALYTICS SECTION ── */}
          <Card className="p-5 sm:p-6 border-0 shadow-lg">
            <CaseStatusPanelErrorBoundary area="analytics">
              <AnalyticsTabs
                receiptNumber={caseStatus.receipt_number}
                isPremium={isPremium}
                onUpgrade={() => openProTrialModal()}
                daysSinceFiled={daysSinceFiled ?? 0}
                prediction={communityPrediction ?? undefined}
                summary={communitySummary}
                stages={communityStages}
                phase={deriveJourneyPhase(caseStatus.current_status)}
                heatmap={communityHeatmap}
                weeklyTrend={communityWeeklyTrend}
                histogram={communityHistogram}
                similarFiling={communitySimilarFiling}
                receivedDate={caseStatus.received_date}
                premiumProcessing={Boolean(caseStatus.pp_start_date)}
                estimateLoading={communityEstimateLoading}
                estimatesAvailable={isOptCase}
              />
            </CaseStatusPanelErrorBoundary>
          </Card>

          {/* ── 6. OPT JOURNEY SECTION ── */}
          {isOptCase && (
            <CaseStatusPanelErrorBoundary area="opt_journey">
              <OptJourneySection
                optFiledDate={caseStatus.received_date ?? null}
                eadProjected={null}
                stemWindowOpens={null}
              />
            </CaseStatusPanelErrorBoundary>
          )}

          {/* ── 7. CASE TIMELINE + CASE INFORMATION (original layout) ── */}
          {safeStatusHistory.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <Card className="p-6 sm:p-7 border-0 shadow-lg hover-lift transition-all">
                <CaseTimelineErrorBoundary>
                  <CaseHistoryTimeline
                    statusHistory={safeStatusHistory}
                    defaultExpanded={false}
                  />
                </CaseTimelineErrorBoundary>
              </Card>

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
                        onChange={(value) => void handleFilingCategoryUpdate(value)}
                        disabled={filingCategorySaving}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">USCIS Form</span>
                    <span className="text-sm font-semibold max-md:text-left text-right">
                      {caseStatus.case_type || 'I-765'}
                    </span>
                  </div>

                  <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Receipt Number</span>
                    <span className="text-sm font-semibold font-mono max-md:text-left text-right ph-mask" data-ph-mask data-receipt-display>
                      {caseStatus.receipt_number}
                    </span>
                  </div>

                  <div className="flex max-md:flex-col max-md:items-start max-md:gap-2 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Filing Date</span>
                    {caseStatus.received_date ? (
                      <span className="text-sm font-semibold max-md:text-left text-right">
                        {formatDateShort(caseStatus.received_date)}
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto max-md:w-full">
                        <Input
                          type="date"
                          value={filingDateInput}
                          onChange={(e) => setFilingDateInput(e.target.value)}
                          className="h-9 text-sm max-md:w-full"
                          aria-label="Filing date"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void handleSaveFilingDate()}
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">{serviceCenterLocation}</p>
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
            </div>
          ) : (
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
                  <span className="text-sm font-mono font-semibold ph-mask" data-ph-mask>{caseStatus.receipt_number}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Case Type</span>
                  <span className="text-sm font-semibold">{caseStatus.case_type || 'Form I-765 (OPT)'}</span>
                </div>
              </div>
            </Card>
          )}

          {/* ── 7. TOOLS ACCORDION ── */}
          <CaseStatusPanelErrorBoundary area="tools">
            <ToolsAccordion
              notifications={{
                isPremium,
                emailAlertsOn: caseStatus.notifications_enabled,
                emailAddress: notificationEmail,
                isEditingEmail,
                emailSaving,
                onToggleEmail: toggleNotifications,
                onStartEditEmail: () => setIsEditingEmail(true),
                onCancelEditEmail: () => setIsEditingEmail(false),
                onSaveEmail: handleEmailSave,
                onEmailChange: setNotificationEmail,
                onUpgrade: () => openProTrialModal(),
              }}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 8b. Manual refresh / stale upsells ── */}
          {showManualRefreshUpsell && (
            <ManualRefreshUpsellPrompt
              onStartTrial={() => openProTrialModal()}
              onDismiss={() => setShowManualRefreshUpsell(false)}
              ctaLabel={proUpgradeCta}
            />
          )}
          {!showManualRefreshUpsell &&
            !showStatusChangeWedge &&
            showStaleStatusUpsell && (
              <ManualRefreshUpsellPrompt
                trigger={CHECKOUT_UPSELL_TRIGGER.STALE_STATUS}
                message={CASE_STATUS_MESSAGING.staleStatusNotice}
                onStartTrial={() => openProTrialModal()}
                onDismiss={() => setShowStaleStatusUpsell(false)}
                ctaLabel={proUpgradeCta}
              />
            )}

          {/* ── Dev: mock mode badge ── */}
          {process.env.NEXT_PUBLIC_USCIS_MOCK === 'true' &&
            process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' &&
            process.env.NODE_ENV !== 'production' && (
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" role="status">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">USCIS Mock Mode Active</p>
                  <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">Simulated data. Set USCIS_MOCK=false in production.</p>
                </div>
              </div>
            </Card>
          )}

          {/* ── 10. CASE INFO FOOTER (collapsed) ── */}
          <CaseStatusPanelErrorBoundary area="case_info_footer">
            <CaseInfoFooter caseStatus={caseStatus} />
          </CaseStatusPanelErrorBoundary>

          {/* ── 11. DISCLAIMER (single instance) ── */}
          <UscisCaseStatusDisclaimer className="mt-2" />
        </>
      )}

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog
        open={casePendingDelete !== null}
        onOpenChange={(open) => { if (!open && !isRemoving) setCasePendingDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop tracking this case?</AlertDialogTitle>
            <AlertDialogDescription>
              {casePendingDelete ? (
                <>Remove <span className="font-mono font-semibold text-foreground">{casePendingDelete.receipt_number}</span> from your dashboard. You can add it again later.</>
              ) : (
                "This will remove the case from your dashboard."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(isRemoving)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={Boolean(isRemoving)}
              onClick={(e) => { e.preventDefault(); void confirmDeleteCase(); }}
            >
              {isRemoving ? "Removing…" : "Stop tracking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CaseInsightUpgradeDialog
        open={showCaseInsightUpgrade}
        onOpenChange={setShowCaseInsightUpgrade}
        onUpgrade={() => {
          setShowCaseInsightUpgrade(false);
          openProTrialModal();
        }}
        introEligible={proIntroEligible}
        daysSinceFiled={
          clientNowMs !== null
            ? daysSinceEpochMs(caseStatus?.received_date, clientNowMs)
            : 0
        }
        typicalWaitDays={communitySummary?.medianDays}
        cohortSize={communitySummary?.cohortSize}
      />

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        isPremium={isPremium ?? false}
        initialPlan={pricingModalPlan}
        initialInterval="year"
      />
    </div>
  );
}
