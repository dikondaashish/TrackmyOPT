"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Collapsible } from "@/components/ui/collapsible";
import { PremiumUpsellModal } from "@/components/dashboard/widgets/PremiumUpsellModal";
import { CaseProgressStepper } from "@/components/dashboard/case-status/CaseProgressStepper";
import { CaseHistoryTimeline } from "@/components/dashboard/case-status/CaseHistoryTimeline";
import {
  ClipboardCheck,
  RefreshCw,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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
  last_checked_at: string | null;
  last_status_change_at: string | null;
  status_history: Array<{
    status: string;
    date: string;
    description?: string;
  }>;
  change_log: Array<{
    date: string;
    old_status: string;
    new_status: string;
  }>;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function CaseStatusSection() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    loadCaseStatus();
    checkPremiumStatus();
    loadUserEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setCaseStatus((prev) =>
            prev ? { ...prev, ...(payload.new as Partial<CaseStatus>) } : prev
          );
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
        setIsPremium(data.isPremium || false);
      }
    } catch {
      // Premium check failed silently
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

  const loadCaseStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/case-status', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data) {
          setCaseStatus(result.data);
          setReceiptNumber(result.data.receipt_number);
          return result.data;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    const trimmed = receiptNumber.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a receipt number.');
      return;
    }

    const receiptPattern = /^[A-Z]{3}\d{10}$/;
    if (!receiptPattern.test(trimmed)) {
      setError('Invalid format. A receipt number is 3 letters followed by 10 digits (e.g., IOE1234567890).');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/case-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_number: trimmed,
          notifications_enabled: caseStatus?.notifications_enabled ?? true,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSuccess(true);
        setIsPolling(true);

        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const data = await loadCaseStatus();

          const hasStatus = data?.current_status &&
            data.current_status !== 'Status will be fetched shortly...' &&
            data.last_checked_at;

          if (hasStatus) {
            setSuccess(true);
            setIsPolling(false);
            setTimeout(() => setSuccess(false), 3000);
            return;
          }
        }

        setError('Status check is taking longer than expected. It will update automatically — please check back shortly.');
        setIsPolling(false);
      } else {
        setError(result.error || 'Failed to save receipt number.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
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
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        await loadCaseStatus();
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
    if (!confirm('Are you sure you want to stop tracking this case? This will remove the receipt number from your dashboard.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/case-status', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCaseStatus(null);
        setReceiptNumber("");
        setError(null);
        setSuccess(false);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to remove case.');
      }
    } catch {
      setError('An error occurred while removing the case.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!caseStatus) return;

    try {
      const response = await fetch('/api/case-status/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications_enabled: !caseStatus.notifications_enabled,
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

  const getDaysAgo = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const getServiceCenter = (receiptNumber: string) => {
    const prefix = receiptNumber.substring(0, 3).toUpperCase();
    const centerMap: { [key: string]: string } = {
      'IOE': 'National Benefits Center',
      'EAC': 'Vermont Service Center',
      'WAC': 'California Service Center',
      'LIN': 'Nebraska Service Center',
      'SRC': 'Texas Service Center',
      'MSC': 'National Benefits Center',
      'NBC': 'National Benefits Center',
      'YSC': 'Potomac Service Center',
    };
    return centerMap[prefix] || 'USCIS Service Center';
  };

  const getStatusExplanation = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) {
      return { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-200 dark:border-green-800', explanation: 'Your case has been approved. You should receive an approval notice soon.' };
    } else if (statusLower.includes('denied') || statusLower.includes('rejected') || statusLower.includes('terminated')) {
      return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-200 dark:border-red-800', explanation: 'Your case was not approved. Review the notice for next steps, including any appeal options.' };
    } else if (statusLower.includes('evidence')) {
      return { color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800', explanation: 'USCIS needs more information. Check your mail for a Request for Evidence (RFE) and respond by the deadline.' };
    } else if (statusLower.includes('pending') || statusLower.includes('received')) {
      return { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-200 dark:border-yellow-800', explanation: 'Your case is currently being reviewed by USCIS.' };
    } else if (statusLower.includes('ready') || statusLower.includes('scheduled')) {
      return { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-800', explanation: 'USCIS is preparing for the next step in your case.' };
    } else if (statusLower.includes('produced') || statusLower.includes('mailed') || statusLower.includes('delivered')) {
      return { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-200 dark:border-purple-800', explanation: 'Your document has been produced and is being mailed to you.' };
    }
    return { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/30', borderColor: 'border-gray-200 dark:border-gray-700', explanation: 'Your case is being processed.' };
  };

  const calculateNextCheck = (lastCheckedAt: string | null) => {
    if (!lastCheckedAt) return 'Checking soon...';
    const lastCheck = new Date(lastCheckedAt);
    const nextCheck = new Date(lastCheck.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (nextCheck <= now) return 'Checking soon...';

    const hoursLeft = Math.floor((nextCheck.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesLeft = Math.floor(((nextCheck.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 0) {
      return `Next check in ${hoursLeft}h ${minutesLeft}m`;
    }
    return `Next check in ${minutesLeft}m`;
  };

  const handleEmailSave = async () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!notificationEmail || !emailRegex.test(notificationEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold">USCIS Case Status Tracker</h1>
        </div>
        <p className="text-muted-foreground">
          Track your USCIS case status automatically. We check daily and notify you when it changes.
        </p>
      </div>

      {/* Receipt Number Input */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enter Your Receipt Number</h2>
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
                onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                className="w-full sm:flex-1 font-mono"
                maxLength={13}
                aria-label="Enter your USCIS receipt number"
                aria-describedby="receipt-number-help"
                aria-required="true"
              />
              <Button
                onClick={handleSave}
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
                  'Save & Track'
                )}
              </Button>
            </div>
            <p id="receipt-number-help" className="text-sm text-muted-foreground mt-2">
              13 characters: 3-letter prefix + 10 digits (e.g., IOE1234567890)
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
              <p className="text-sm text-green-700 dark:text-green-300">Receipt number saved successfully!</p>
            </div>
          )}
          {isPolling && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Fetching status from USCIS... This may take a few seconds.</span>
            </div>
          )}
        </div>
      </Card>

      {/* Case Status Sections */}
      {caseStatus && (
        <>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={toggleNotifications}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {caseStatus.notifications_enabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  Notifications On
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  Notifications Off
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          </div>

          {/* Last Check Indicator */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Last checked: {formatDate(caseStatus.last_checked_at)}
                  </p>
                  {isPremium ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {calculateNextCheck(caseStatus.last_checked_at)} &middot; Automatic daily checks
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Manual refresh only &middot;{' '}
                      <button
                        onClick={() => setShowPremiumModal(true)}
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Upgrade for auto-checks
                      </button>
                    </p>
                  )}
                </div>
              </div>
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 hidden sm:block" />
            </div>
          </Card>

          {/* Visual Progress Stepper */}
          {caseStatus.current_status && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
                Case Progress
              </h3>
              <CaseProgressStepper currentStatus={caseStatus.current_status} />
            </Card>
          )}

          {/* Email Notification Settings - Premium Gated */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                {isPremium ? <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" /> : <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
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
                          <Button onClick={handleEmailSave} size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Save
                          </Button>
                          <Button onClick={() => setIsEditingEmail(false)} variant="outline" size="sm">
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
                          You will be notified when your case status changes.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Premium Feature: Instant Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Get notified via email the moment your case status changes. Never miss an important update.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Instant email notifications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Automatic daily status checks
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Detailed status history
                      </li>
                    </ul>
                    <Button
                      onClick={() => setShowPremiumModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Recent Updated Case Message */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold">Latest Case Update</h2>
              </div>

              {(() => {
                const statusInfo = getStatusExplanation(caseStatus.status_history[0].status);
                return (
                  <Collapsible
                    title={
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${statusInfo.color}`}>{caseStatus.status_history[0].status}</span>
                      </div>
                    }
                    defaultOpen={true}
                    className={`${statusInfo.bgColor} dark:bg-gray-900/20 border ${statusInfo.borderColor}`}
                    titleClassName={`${statusInfo.bgColor} dark:bg-gray-800/50`}
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateShort(caseStatus.status_history[0].date)}
                      </p>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {caseStatus.status_history[0].description || caseStatus.current_status}
                      </p>
                      <div className={`p-3 rounded-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                        <div className="flex items-start gap-2">
                          <Info className={`w-4 h-4 mt-0.5 ${statusInfo.color}`} />
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            <strong>What this means:</strong> {statusInfo.explanation}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href="https://egov.uscis.gov/casestatus"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          aria-label="Check your case status on the official USCIS website"
                        >
                          View on USCIS.gov
                        </a>
                      </div>
                    </div>
                  </Collapsible>
                );
              })()}
            </Card>
          )}

          {/* Case History and Case Info - Side by Side */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Case History Timeline */}
              <Card className="p-6">
                <CaseHistoryTimeline
                  statusHistory={caseStatus.status_history}
                  defaultExpanded={false}
                />
              </Card>

              {/* Right: Case Info */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold">Case Information</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Case Type</span>
                    <span className="text-sm font-semibold text-right">
                      {caseStatus.case_type || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Receipt Number</span>
                    <span className="text-sm font-semibold font-mono text-right">
                      {caseStatus.receipt_number}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Filing Date</span>
                    <span className="text-sm font-semibold text-right">
                      {caseStatus.received_date ? formatDateShort(caseStatus.received_date) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Service Center</span>
                    <span className="text-sm font-semibold text-right">
                      {getServiceCenter(caseStatus.receipt_number)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Status</span>
                    <span className="text-sm font-semibold text-right max-w-[60%]">
                      {caseStatus.current_status || 'Fetching...'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="text-xs font-medium">Time Since Filed</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getDaysAgo(caseStatus.received_date)}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="text-right">
                      <span className="text-xs font-medium">Last Status Change</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getDaysAgo(caseStatus.last_status_change_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Fallback: Show current status if status_history is empty */}
      {caseStatus && caseStatus.current_status &&
        (!caseStatus.status_history || caseStatus.status_history.length === 0) && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold">Current Status</h2>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-gray-100">{caseStatus.current_status}</p>
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Case Type</span>
                  <p className="font-semibold">{caseStatus.case_type || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Filed</span>
                  <p className="font-semibold">{caseStatus.received_date || '—'}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your status will be checked daily. You will be notified when it changes.
            </p>
          </Card>
        )}

      {/* Help Text */}
      {!caseStatus && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium">1.</span>
              Enter your 13-character USCIS receipt number above
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium">2.</span>
              We automatically check your case status with USCIS daily
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium">3.</span>
              Get notified via email when your status changes (Premium)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium">4.</span>
              View your complete status history in one place
            </li>
          </ul>
        </Card>
      )}

      <PremiumUpsellModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Case Status Notifications"
      />
    </div>
  );
}
