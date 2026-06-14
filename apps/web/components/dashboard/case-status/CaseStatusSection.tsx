"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PricingModal } from "@/components/pricing/PricingModal";
import { CaseProcessingBenchmarks } from "@/components/dashboard/case-status/CaseProcessingBenchmarks";
import { NearbyCasesCohort } from "@/components/dashboard/case-status/NearbyCasesCohort";
import { CaseListSwitcher } from "@/components/dashboard/case-status/CaseListSwitcher";
import { WebPushEnableButton } from "@/components/dashboard/case-status/WebPushEnableButton";
import {
  caseLimitMessage,
  getCaseTrackingLimit,
} from "@/lib/case-status/case-limits";
import { CaseProgressStepper } from "@/components/dashboard/case-status/CaseProgressStepper";
import { CaseHistoryTimeline } from "@/components/dashboard/case-status/CaseHistoryTimeline";
import { UscisCaseStatusDisclaimer } from "@/components/legal/UscisCaseStatusDisclaimer";
import { CaseStatusPageViewTracker } from "@/components/analytics/CaseStatusPageViewTracker";
import { CaseStatusOverview } from "@/components/dashboard/case-status/CaseStatusOverview";
import { PremiumProcessingCountdown } from "@/components/dashboard/case-status/PremiumProcessingCountdown";
import { CaseStatusReceiptPanel } from "@/components/dashboard/case-status/CaseStatusReceiptPanel";
import { StatusChangeUpgradeBanner } from "@/components/dashboard/case-status/StatusChangeUpgradeBanner";
import { ManualRefreshUpsellPrompt } from "@/components/dashboard/case-status/ManualRefreshUpsellPrompt";
import {
  formatDaysAgoLabel,
  formatStatusLabel,
  getServiceCenterLabel,
} from "@/lib/case-status/case-status-display";
import {
  shouldShowStatusChangeWedge,
  MANUAL_REFRESH_COUNT_SESSION_KEY,
  MANUAL_REFRESH_UPSELL_SESSION_KEY,
  CHECKOUT_UPSELL_TRIGGER,
} from "@/lib/case-status/free-change-wedge";
import { captureUpgradePromptShown } from "@/lib/posthog-client";
import {
  CASE_STATUS_MESSAGING,
  PRODUCT_CTAS,
} from "@/lib/messaging/product-copy";
import { validateReceiptNumber } from "@/lib/uscis/receipt-number-validation";
import {
  normalizeStatusHistory,
  withNormalizedStatusHistory,
  type CaseStatusHistoryEntry,
} from "@/lib/case-status/normalize-status-history";
import {
  ClipboardCheck,
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Crown,
  Info,
  Edit,
  Trash2
} from "lucide-react";

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
  const [isRemoving, setIsRemoving] = useState(false);
  // ISS-030: explicit load error so UI can distinguish "no case" vs "couldn't load"
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wedgeDismissed, setWedgeDismissed] = useState(false);
  const [showManualRefreshUpsell, setShowManualRefreshUpsell] = useState(false);
  const [isEditingReceipt, setIsEditingReceipt] = useState(false);
  const [filingDateInput, setFilingDateInput] = useState("");
  const [filingDateSaving, setFilingDateSaving] = useState(false);

  const showStatusChangeWedge = useMemo(() => {
    if (wedgeDismissed || isPremium !== false || !caseStatus) return false;
    return shouldShowStatusChangeWedge(caseStatus, isPremium);
  }, [wedgeDismissed, isPremium, caseStatus]);

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

  // ── Supabase Realtime: Instant UI updates when cron updates DB ──
  useEffect(() => {
    if (!caseStatus?.receipt_number) return;

    const channel = supabase
      .channel('case-status-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'case_status',
          filter: `receipt_number=eq.${caseStatus.receipt_number}`,
        },
        (payload) => {
          // Realtime Case status updated
          // Merge the Realtime payload directly into state for instant UI refresh
          setCaseStatus((prev) => {
            if (!prev) return prev;
            return withNormalizedStatusHistory({
              ...prev,
              ...(payload.new as Partial<CaseStatus>),
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
            preferredId ?? selectedCaseId,
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

  const handleRemove = async () => {
    if (!caseStatus) return;
    if (!confirm('Are you sure you want to stop tracking this case? This will remove the receipt number from your dashboard.')) {
      return;
    }

    try {
      setIsRemoving(true);
      const response = await fetch(`/api/case-status?id=${encodeURIComponent(caseStatus.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const remaining = trackedCases.filter((c) => c.id !== caseStatus.id);
        applyCasesToState(remaining);
        if (remaining.length === 0) {
          setReceiptNumber("");
        }
        setError(null);
        setSuccess(false);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to remove case.');
      }
    } catch {
      setError('An error occurred while removing the case.');
    } finally {
      setIsRemoving(false);
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  return (
    <div className="space-y-6">
      <CaseStatusPageViewTracker
        isInitialLoadComplete={!isInitialLoad}
        hasReceipt={Boolean(caseStatus?.receipt_number)}
        hasStatus={Boolean(caseStatus?.current_status)}
        currentStatus={caseStatus?.current_status ?? null}
      />
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">USCIS Case Status Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Free: track and refresh in-app.{' '}
              <span className="font-semibold text-foreground">Pro:</span> daily auto-checks + email alerts on changes.
            </p>
          </div>
        </div>
        <UscisCaseStatusDisclaimer className="mt-4" />
      </div>

      {caseStatus ? (
        <>
          {trackedCases.length > 0 && (
            <CaseListSwitcher
              cases={trackedCases}
              selectedId={selectedCaseId ?? caseStatus.id}
              onSelect={selectCase}
              onSetPrimary={handleSetPrimary}
              onAddCase={handleStartAddCase}
              canAddMore={canAddMoreCases}
              isPremium={isPremium}
            />
          )}

          <CaseStatusOverview
            receiptNumber={caseStatus.receipt_number}
            currentStatus={caseStatus.current_status}
            receivedDate={caseStatus.received_date}
            lastCheckedAt={caseStatus.last_checked_at}
            lastStatusChangeAt={caseStatus.last_status_change_at}
            statusHistoryLength={caseStatus.status_history?.length ?? 0}
            isPremium={isPremium}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onUpgrade={() => setShowPricingModal(true)}
            formatDateTime={formatDate}
          />

          {caseStatus.last_check_failed_at && (caseStatus.consecutive_failures ?? 0) > 0 && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Last refresh failed: {formatDate(caseStatus.last_check_failed_at)}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    USCIS may be temporarily unreachable. We&apos;ll keep retrying. The status above is from your most recent successful check.
                    {caseStatus.last_check_error_message ? ` Reason: ${caseStatus.last_check_error_message}` : ''}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {showStatusChangeWedge && caseStatus.status_last_changed_at && (
            <StatusChangeUpgradeBanner
              statusLastChangedAt={caseStatus.status_last_changed_at}
              onAcknowledged={() => {
                setWedgeDismissed(true);
                setCaseStatus((prev) =>
                  prev
                    ? { ...prev, last_status_viewed_at: new Date().toISOString() }
                    : prev
                );
              }}
            />
          )}

          {showManualRefreshUpsell && (
            <ManualRefreshUpsellPrompt
              onDismiss={() => setShowManualRefreshUpsell(false)}
            />
          )}

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
              onCancelEdit={() => {
                setIsEditingReceipt(false);
                setReceiptNumber(caseStatus.receipt_number);
                setError(null);
                setSuccess(false);
              }}
            />
          ) : (
            <CaseStatusReceiptPanel
              mode="edit"
              receiptNumber={receiptNumber}
              onReceiptChange={setReceiptNumber}
              onSave={handleSave}
              isSaving={isSaving}
              isPolling={isPolling}
              error={error}
              success={success}
              collapsedSummary={caseStatus.receipt_number}
              onExpandEdit={() => setIsEditingReceipt(true)}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={toggleNotifications}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isPremium === false ? (
                <>
                  <Crown className="w-4 h-4" />
                  Email Alerts (Pro)
                </>
              ) : caseStatus.notifications_enabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  Email Alerts On
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  Email Alerts Off
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
            >
              <Trash2 className="w-4 h-4" />
              {isRemoving ? 'Removing...' : 'Stop Tracking'}
            </Button>
          </div>

          {process.env.NEXT_PUBLIC_USCIS_MOCK === 'true' &&
            process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' &&
            process.env.NODE_ENV !== 'production' && (
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" role="status">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">USCIS Mock Mode Active</p>
                  <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
                    The values you see are simulated for testing. Set USCIS_MOCK=false in production env.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <PremiumProcessingCountdown
            caseId={caseStatus.id}
            ppStartDate={caseStatus.pp_start_date ?? null}
            currentStatus={caseStatus.current_status}
            statusHistory={caseStatus.status_history ?? []}
            onSaved={() => void loadCaseStatus()}
          />

          {caseStatus.current_status && (
            <Card className="p-6 sm:p-7 border-0 shadow-lg">
              <h3 className="text-xs font-extrabold text-muted-foreground mb-5 uppercase tracking-widest">
                Case Progress (Form I-765)
              </h3>
              <CaseProgressStepper
                currentStatus={caseStatus.current_status}
                statusHistory={caseStatus.status_history}
              />
            </Card>
          )}

          <div className="pt-4">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Insights &amp; predictions
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />
            </div>
            <div className="space-y-7">
              <CaseProcessingBenchmarks />

              <NearbyCasesCohort
                receiptNumber={caseStatus.receipt_number}
                isPremium={isPremium}
                onUpgrade={() => setShowPricingModal(true)}
              />
            </div>
          </div>

          <Card className="p-6 sm:p-7 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-lg shadow-purple-500/5">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                {isPremium ? <Mail className="w-6 h-6 text-white" /> : <Crown className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                {isPremium ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Case Status Notifications</h3>
                      {!isEditingEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingEmail(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {isEditingEmail ? (
                      <div className="space-y-3">
                        <Input
                          type="email"
                          value={notificationEmail}
                          onChange={(e) => setNotificationEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="bg-white dark:bg-gray-900"
                          aria-label="Notification email address"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleEmailSave}
                            size="sm"
                            disabled={emailSaving}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {emailSaving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button onClick={() => setIsEditingEmail(false)} variant="outline" size="sm" disabled={emailSaving}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {notificationEmail || 'No email set'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          You will be notified when we detect a case status change.
                        </p>
                        <div className="mt-3">
                          <WebPushEnableButton />
                        </div>
                        <UscisCaseStatusDisclaimer variant="compact" showAlertNote className="mt-3" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {CASE_STATUS_MESSAGING.proFeatureTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {CASE_STATUS_MESSAGING.proFeatureBody}
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Email when USCIS posts a new status
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Daily automatic status checks (Pro)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Full status history in one place
                      </li>
                    </ul>
                    <Button
                      onClick={() => setShowPricingModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {PRODUCT_CTAS.upgradeToPro}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {caseStatus.status_history && caseStatus.status_history.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <Card className="p-6 sm:p-7 border-0 shadow-lg hover-lift transition-all">
                <CaseHistoryTimeline
                  statusHistory={caseStatus.status_history}
                  defaultExpanded={false}
                />
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
        </>
      ) : (
        <>
          {!loadError && (
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
        </>
      )}

      {!caseStatus && loadError && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" role="alert">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Couldn&apos;t load your case status.</strong>{' '}
              <span className="opacity-90">{loadError}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoadError(null);
                void loadCaseStatus(true);
              }}
            >
              Try again
            </Button>
          </div>
        </Card>
      )}

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        isPremium={isPremium ?? false}
      />
    </div>
  );
}
