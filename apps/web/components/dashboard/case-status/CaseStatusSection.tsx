"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isSupabaseRealtimeSupported } from "@/lib/supabase/realtime-supported";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PricingModal } from "@/components/pricing/PricingModal";
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
import { addDaysIso, daysSinceEpochMs, formatDisplayDateShort, formatDisplayDateTime, parseValidDate } from "@/lib/case-status/safe-dates";
import { UscisCaseStatusDisclaimer } from "@/components/legal/UscisCaseStatusDisclaimer";
import { CaseStatusPageViewTracker } from "@/components/analytics/CaseStatusPageViewTracker";
import {
  formatDaysAgoLabel,
  formatStatusLabel,
  getServiceCenterLabel,
} from "@/lib/case-status/case-status-display";
import { Globe } from "lucide-react";
import { PremiumProcessingCountdown } from "@/components/dashboard/case-status/PremiumProcessingCountdown";
import { CaseStatusReceiptPanel } from "@/components/dashboard/case-status/CaseStatusReceiptPanel";
import { StatusChangeUpgradeBanner } from "@/components/dashboard/case-status/StatusChangeUpgradeBanner";
import { ManualRefreshUpsellPrompt } from "@/components/dashboard/case-status/ManualRefreshUpsellPrompt";
import {
  shouldShowStatusChangeWedge,
  shouldShowStaleStatusUpsell,
  MANUAL_REFRESH_COUNT_SESSION_KEY,
  MANUAL_REFRESH_UPSELL_SESSION_KEY,
  STALE_STATUS_UPSELL_SESSION_KEY,
  CHECKOUT_UPSELL_TRIGGER,
} from "@/lib/case-status/free-change-wedge";
import {
  captureCaseStatusCheckCompletedClient,
  captureUpgradePromptShown,
} from "@/lib/posthog-client";
import { getReceiptPrefix } from "@/lib/posthog/uscis-status-category";
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
} from "lucide-react";
import { StickyCaseSwitcher, deriveCaseState } from "@/components/dashboard/case-status/redesign/StickyCaseSwitcher";
import { useClientDate } from "@/hooks/useClientDate";
import { UrgentActionBanner } from "@/components/dashboard/case-status/redesign/UrgentActionBanner";
import { CaseHeroCard } from "@/components/dashboard/case-status/redesign/CaseHeroCard";
import { MonitorHealthStrip } from "@/components/dashboard/case-status/redesign/MonitorHealthStrip";
import { AnalyticsTabs } from "@/components/dashboard/case-status/redesign/AnalyticsTabs";
import { ToolsAccordion } from "@/components/dashboard/case-status/redesign/ToolsAccordion";
import { SmartNextSteps } from "@/components/dashboard/case-status/redesign/SmartNextSteps";
import { OptJourneySection } from "@/components/dashboard/case-status/redesign/OptJourneySection";
import { CaseInfoFooter } from "@/components/dashboard/case-status/redesign/CaseInfoFooter";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";

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
}

export function CaseStatusSection() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
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
  const [showPricingModal, setShowPricingModal] = useState(false);
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
  const [isEditingReceipt, setIsEditingReceipt] = useState(false);
  const [filingDateInput, setFilingDateInput] = useState("");
  const [filingDateSaving, setFilingDateSaving] = useState(false);

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
    });
  }, [isPremium, caseStatus?.last_checked_at, caseStatus?.id]);

  const showStatusChangeWedge = useMemo(() => {
    if (wedgeDismissed || isPremium !== false || !caseStatus) return false;
    return shouldShowStatusChangeWedge(caseStatus, isPremium);
  }, [wedgeDismissed, isPremium, caseStatus]);

  const showPackagingNotice =
    !packagingNoticeDismissed && isPremium === false && Boolean(caseStatus);

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

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/premium/status', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium === true);
      } else {
        // Treat fetch errors as unknown, not as "free" — avoids false upsell on transient failures
        setIsPremium(false);
      }
    } catch {
      setIsPremium(false);
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
      if (isPremium === false) setShowPricingModal(true);
      return;
    }

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
        }),
      });

      const postResult = await response.json().catch(() => ({}));
      if (!response.ok || !postResult.ok) {
        setError(
          (typeof postResult.error === "string" && postResult.error) ||
            "Failed to save receipt number."
        );
        if (postResult.code === "case_limit_reached" && isPremium === false) {
          setShowPricingModal(true);
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
      if (isPremium === false) setShowPricingModal(true);
      return;
    }
    setIsAddingCase(true);
    setReceiptNumber("");
    setError(null);
    setSuccess(false);
    setIsEditingReceipt(true);
  };

  const toggleNotifications = async () => {
    if (!caseStatus) return;

    if (isPremium === false) {
      setShowPricingModal(true);
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
      setShowPricingModal(true);
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
  const ppOverdueDays: number = (() => {
    if (!ppStartDate || clientNowMs === null) return 0;
    const start = parseValidDate(ppStartDate);
    if (!start) return 0;
    const deadline = new Date(start.getTime());
    deadline.setDate(deadline.getDate() + 15 * 7 / 5); // ~15 business days approx
    const diff = clientNowMs - deadline.getTime();
    if (!Number.isFinite(diff) || diff <= 0) return 0;
    return Math.floor(diff / 86_400_000);
  })();

  const ppDeadlineDate: string | null = addDaysIso(ppStartDate, 21);

  const eadProjectedDate = addDaysIso(caseStatus?.received_date ?? null, 115);
  const stemWindowOpensDate = addDaysIso(caseStatus?.received_date ?? null, 115 + 365 - 90);

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
          onReceiptChange={setReceiptNumber}
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
                caseState: deriveCaseState(c.current_status),
                isPrimary: c.is_primary,
              }))}
              selectedId={selectedCaseId ?? caseStatus.id}
              onSelect={selectCase}
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
                    onClick={() => setShowPricingModal(true)}
                    className="font-medium underline underline-offset-2 hover:no-underline cursor-pointer"
                  >
                    See Pro
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
              onAcknowledged={() => {
                setWedgeDismissed(true);
                setCaseStatus((prev) => prev ? { ...prev, last_status_viewed_at: new Date().toISOString() } : prev);
              }}
            />
          )}

          {/* ── 3. MAIN CASE HERO CARD ── */}
          {isEditingReceipt ? (
            <CaseStatusReceiptPanel
              mode="edit"
              receiptNumber={receiptNumber}
              onReceiptChange={setReceiptNumber}
              onSave={handleSave}
              isSaving={isSaving}
              isPolling={isPolling}
              error={error}
              success={success}
              onCancelEdit={() => { setIsEditingReceipt(false); setReceiptNumber(caseStatus.receipt_number); setError(null); setSuccess(false); }}
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
                onManageCase={() => setIsEditingReceipt(true)}
                refreshError={error}
              />
            </CaseStatusPanelErrorBoundary>
          )}

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
                isPremium === false ? () => setShowPricingModal(true) : undefined
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
                onUpgrade={() => setShowPricingModal(true)}
                daysSinceFiled={
                  clientNowMs !== null
                    ? daysSinceEpochMs(caseStatus.received_date, clientNowMs)
                    : 0
                }
              />
            </CaseStatusPanelErrorBoundary>
          </Card>

          {/* ── 6. OPT JOURNEY SECTION ── */}
          <CaseStatusPanelErrorBoundary area="opt_journey">
            <OptJourneySection
              optFiledDate={caseStatus.received_date ?? null}
              eadProjected={eadProjectedDate}
              stemWindowOpens={stemWindowOpensDate}
            />
          </CaseStatusPanelErrorBoundary>

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
                  <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Case Type</span>
                    <span className="text-sm font-semibold max-md:text-left text-right">
                      {caseStatus.case_type || 'Form I-765 (OPT)'}
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
                    <span className="text-sm font-semibold max-md:text-left text-right ph-mask" data-ph-mask>
                      {getServiceCenterLabel(caseStatus.receipt_number)}
                    </span>
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
                onUpgrade: () => setShowPricingModal(true),
              }}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 8. SMART NEXT STEPS ── */}
          <CaseStatusPanelErrorBoundary area="next_steps">
            <SmartNextSteps
              caseState={caseState}
              ppOverdueDays={ppOverdueDays}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 8b. Manual refresh / stale status upsell ── */}
          {showManualRefreshUpsell && (
            <ManualRefreshUpsellPrompt onDismiss={() => setShowManualRefreshUpsell(false)} />
          )}
          {!showManualRefreshUpsell &&
            !showStatusChangeWedge &&
            showStaleStatusUpsell && (
              <ManualRefreshUpsellPrompt
                trigger={CHECKOUT_UPSELL_TRIGGER.STALE_STATUS}
                message="Status may be outdated. Pro auto-checks USCIS daily and emails you when it changes."
                onDismiss={() => setShowStaleStatusUpsell(false)}
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

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        isPremium={isPremium ?? false}
      />
    </div>
  );
}
