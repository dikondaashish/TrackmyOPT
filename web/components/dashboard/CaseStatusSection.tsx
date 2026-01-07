"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Collapsible } from "@/components/ui/collapsible";
import { PremiumUpsellModal } from "@/components/dashboard/PremiumUpsellModal";
import {
  ClipboardCheck,
  RefreshCw,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Crown,
  Info,
  Edit
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
  const [nextCheckTime, setNextCheckTime] = useState<string>("");
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    loadCaseStatus();
    checkPremiumStatus();
    loadUserEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!receiptNumber.trim()) {
      setError('Please enter a receipt number');
      return;
    }

    const receiptPattern = /^[A-Z]{3}\d{10}$/i;
    if (!receiptPattern.test(receiptNumber.toUpperCase())) {
      setError('Invalid receipt number format. Should be like IOE1234567890');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/case-status', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receipt_number: receiptNumber.toUpperCase(),
          notifications_enabled: caseStatus?.notifications_enabled ?? true,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSuccess(true);
        setIsPolling(true);

        let attempts = 0;
        const maxAttempts = 10;

        const pollForStatus = async () => {
          for (let i = 0; i < maxAttempts; i++) {
            attempts++;
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

          const isStagingNumber = /^(EAC|SRC|LIN)9999\d{6}$/i.test(receiptNumber);

          if (!isStagingNumber) {
            setError(`⚠️ Sandbox Mode: Cannot check real receipt numbers yet. We're currently in testing mode and can only check staging numbers like EAC9999103403.`);
          }
          setIsPolling(false);
        };

        pollForStatus();

      } else {
        setError(result.error || 'Failed to save receipt number');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!caseStatus) return;

    try {
      setIsRefreshing(true);
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
        setError(result.error || 'Failed to refresh status');
      }
    } catch (err) {
      setError('An error occurred while refreshing');
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleNotifications = async () => {
    if (!caseStatus) return;

    try {
      const response = await fetch('/api/case-status/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications_enabled: !caseStatus.notifications_enabled,
        }),
      });

      if (response.ok) {
        await loadCaseStatus();
      } else {
        setError('Failed to update notification settings');
      }
    } catch (err) {
      setError('An error occurred');
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
    };
    return centerMap[prefix] || 'Potomac Service Center';
  };

  const getStatusExplanation = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) {
      return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', explanation: 'Your case has been approved. You should receive an approval notice soon.' };
    } else if (statusLower.includes('pending') || statusLower.includes('received')) {
      return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', explanation: 'Your case is currently being reviewed by USCIS.' };
    } else if (statusLower.includes('ready') || statusLower.includes('scheduled')) {
      return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', explanation: 'USCIS is preparing for the next step in your case.' };
    } else if (statusLower.includes('produced') || statusLower.includes('mailed')) {
      return { color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', explanation: 'Your document has been produced and is being mailed to you.' };
    }
    return { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', explanation: 'Your case is being processed.' };
  };

  const calculateNextCheck = (lastCheckedAt: string | null) => {
    if (!lastCheckedAt) return 'Checking soon...';
    const lastCheck = new Date(lastCheckedAt);
    const nextCheck = new Date(lastCheck.getTime() + 6 * 60 * 60 * 1000); // Add 6 hours
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!notificationEmail || !emailRegex.test(notificationEmail)) {
      setError('Please enter a valid email address');
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
        setError(result.error || 'Failed to save email');
      }
    } catch (err) {
      setError('An error occurred while saving email');
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
          <h1 className="text-3xl font-bold">USCIS Case Status Tracker</h1>
        </div>
        <p className="text-muted-foreground">
          Track your USCIS case status automatically. We'll check every 6 hours and notify you when it changes.
        </p>
      </div>

      {/* Sandbox Mode Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              ⚠️ Sandbox Mode (Testing)
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              We're currently in testing mode using USCIS's sandbox API. This means we can ONLY check <strong>staging/test receipt numbers</strong>, not real ones.
            </p>

            <div className="mb-3 p-3 bg-amber-100 dark:bg-amber-900/40 border border-amber-400 dark:border-amber-600 rounded">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                🕐 <strong>Sandbox Operating Hours:</strong>
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Monday - Friday: 7:00 AM - 8:00 PM EST</strong>
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                ❌ Closed: Weekends and outside business hours (you'll get 503 errors)
              </p>
            </div>

            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <p><strong>✅ Test numbers that work (during business hours):</strong></p>
              <ul className="list-disc list-inside ml-2 mb-2">
                <li><code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">EAC9999103403</code> - Approved case</li>
                <li><code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">SRC9999102777</code> - Active case</li>
                <li><code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">LIN9999106498</code> - Pending case</li>
              </ul>
              <p><strong>❌ Real receipt numbers (like IOE9645083446) won't work yet.</strong></p>
              <p className="mt-2 text-xs">
                💡 <strong>For real receipt tracking:</strong> We're testing for 5 days, then we'll request production API access from USCIS.
                Check your real status at <a href="https://egov.uscis.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600">egov.uscis.gov</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Number Input */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enter Your Receipt Number</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="receipt-number-input" className="block text-sm font-medium mb-2">
              USCIS Receipt Number
            </label>
            <div className="flex gap-3">
              <Input
                id="receipt-number-input"
                type="text"
                placeholder="Try: EAC9999103403 (test number)"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                className="flex-1 font-mono"
                maxLength={13}
                aria-label="Enter your USCIS receipt number"
                aria-describedby="receipt-number-help"
                aria-required="true"
              />
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[120px]"
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
              <strong>Sandbox Mode:</strong> Use staging numbers like EAC9999103403, SRC9999102777, or LIN9999106498
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
              ✓ Receipt number saved successfully!
            </div>
          )}
          {isPolling && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">Fetching status from USCIS... This may take a few seconds.</span>
            </div>
          )}
        </div>
      </Card>

      {/* Case Status Sections - NEW DESIGN */}
      {caseStatus && (
        <>
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={toggleNotifications}
              className="flex items-center gap-2"
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
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Now
            </Button>
          </div>

          {/* Last Check Indicator */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Last checked: {formatDate(caseStatus.last_checked_at)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {calculateNextCheck(caseStatus.last_checked_at)} • Automatic checks every 6 hours
                  </p>
                </div>
              </div>
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          {/* Email Notification Settings - Premium Gated */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
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
                          📧 Get notified when your case status changes
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
                      Get notified via email and SMS the moment your case status changes. Never miss an important update!
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Instant email notifications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        SMS alerts (coming soon)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Automatic checks every 6 hours
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

          {/* 1. Recent Updated Case Message */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold">Recent Updated Case Message</h2>
              </div>

              {(() => {
                const statusInfo = getStatusExplanation(caseStatus.status_history[0].status);
                return (
                  <Collapsible
                    title={
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${statusInfo.color}`}>{caseStatus.status_history[0].status}</span>
                        <span className="text-2xl">🎉</span>
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
                      {/* Status Explanation */}
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
                          aria-label="Check your case status on USCIS website"
                        >
                          Check online
                        </a>
                      </div>
                    </div>
                  </Collapsible>
                );
              })()}
            </Card>
          )}

          {/* 2 & 3. Case Message History and My Case Info - Side by Side */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Case Message History - Enhanced Timeline */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Case Timeline</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your case journey from USCIS</p>
                  </div>
                </div>

                <div className="relative">
                  {/* Timeline Line - Gradient */}
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-gray-300 dark:to-gray-700"></div>

                  {/* Timeline Items */}
                  <div className="space-y-4">
                    {caseStatus.status_history.map((item, index) => {
                      const isFirst = index === 0;
                      const isCompleted = true; // All items from USCIS are completed events

                      return (
                        <div key={index} className="relative pl-10">
                          {/* Timeline Dot with Checkmark */}
                          <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isFirst
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-emerald-100 dark:ring-emerald-900/30'
                            : 'bg-white dark:bg-gray-800 border-2 border-emerald-500'
                            }`}>
                            {isFirst ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>

                          {/* Content Card */}
                          <div className={`p-4 rounded-xl transition-all ${isFirst
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg'
                            : 'bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                            }`}>
                            {/* Date Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFirst
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                {formatDateShort(item.date)}
                              </span>
                              {isFirst && (
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  ✓ Most Recent
                                </span>
                              )}
                            </div>

                            {/* Status Text */}
                            <p className={`text-sm leading-relaxed ${isFirst
                              ? 'font-medium text-gray-800 dark:text-gray-100'
                              : 'text-gray-600 dark:text-gray-400'
                              }`}>
                              {item.description || item.status}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Right: My Case Info */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold">My case info</h2>
                </div>

                <div className="space-y-3">
                  {/* Case Type */}
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Case Type</span>
                    <span className="text-sm font-semibold text-right">
                      {caseStatus.case_type || 'I-765'}
                    </span>
                  </div>

                  {/* Case Category */}
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Case Category</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">
                      All other applications for employment authorization
                    </span>
                  </div>

                  {/* Application Filing Date */}
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Application Filing Date</span>
                    <span className="text-sm font-semibold">
                      {caseStatus.received_date ? formatDateShort(caseStatus.received_date) : 'Not available'}
                    </span>
                  </div>

                  {/* Service Center */}
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Service Center</span>
                    <span className="text-sm font-semibold">
                      {getServiceCenter(caseStatus.receipt_number)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className="text-sm font-semibold text-right max-w-[60%]">
                      {caseStatus.current_status || 'Fetching...'}
                    </span>
                  </div>

                  {/* Time Information */}
                  <div className="flex items-center justify-between pt-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="text-xs font-medium">Total</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getDaysAgo(caseStatus.received_date)}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="text-right">
                      <span className="text-xs font-medium">Last update</span>
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
                  <span className="text-gray-600 dark:text-gray-400">Case Type:</span>
                  <p className="font-semibold">{caseStatus.case_type || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Received:</span>
                  <p className="font-semibold">{caseStatus.received_date || 'N/A'}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              We'll check your status every 6 hours and notify you when it changes.
            </p>
          </Card>
        )}

      {/* Help Text */}
      {!caseStatus && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">1.</span>
              Enter your USCIS receipt number above
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">2.</span>
              We'll automatically check your case status every 6 hours
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">3.</span>
              Get notified via email when your status changes (Premium feature)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">4.</span>
              View your complete status history in one place
            </li>
          </ul>
        </Card>
      )}

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Case Status Notifications"
      />
    </div>
  );
}
