"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Collapsible } from "@/components/ui/collapsible";
import { 
  ClipboardCheck, 
  RefreshCw, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Globe
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

  useEffect(() => {
    loadCaseStatus();
  }, []);

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
      console.error('Error loading case status:', err);
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
              setTimeout(() => setSuccess(false), 3000);
              return;
            }
          }
          
          const isStagingNumber = /^(EAC|SRC|LIN)9999\d{6}$/i.test(receiptNumber);
          
          if (!isStagingNumber) {
            setError(`⚠️ Sandbox Mode: Cannot check real receipt numbers yet. We're currently in testing mode and can only check staging numbers like EAC9999103403.`);
          }
        };
        
        pollForStatus();
        
      } else {
        setError(result.error || 'Failed to save receipt number');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error('Error saving case status:', err);
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
      console.error('Error refreshing case status:', err);
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
      console.error('Error toggling notifications:', err);
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
            <label className="block text-sm font-medium mb-2">
              USCIS Receipt Number
            </label>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Try: EAC9999103403 (test number)"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                className="flex-1 font-mono"
                maxLength={13}
              />
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[120px]"
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
            <p className="text-sm text-muted-foreground mt-2">
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

          {/* 1. Recent Updated Case Message */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold">Recent Updated Case Message</h2>
              </div>
              
              <Collapsible
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{caseStatus.status_history[0].status}</span>
                    <span className="text-2xl">🎉</span>
                  </div>
                }
                defaultOpen={true}
                className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800"
                titleClassName="bg-gray-100 dark:bg-gray-800/50"
              >
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateShort(caseStatus.status_history[0].date)}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {caseStatus.status_history[0].description || caseStatus.current_status}
                  </p>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href="https://egov.uscis.gov/casestatus"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      Check online
                    </a>
                  </div>
                </div>
              </Collapsible>
            </Card>
          )}

          {/* 2. Case Message History */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Case Message History</h2>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                
                {/* Timeline Items */}
                <div className="space-y-8">
                  {caseStatus.status_history.map((item, index) => (
                    <div key={index} className="relative pl-10">
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-2 w-7 h-7 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      
                      {/* Date */}
                      <p className="text-sm font-semibold mb-3">
                        {formatDateShort(item.date)}
                      </p>
                      
                      {/* Status Card */}
                      {item.description ? (
                        <Collapsible
                          title={item.status}
                          defaultOpen={index === 0}
                          className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800"
                          titleClassName="bg-gray-100 dark:bg-gray-800/50"
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.description}
                          </p>
                        </Collapsible>
                      ) : (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {item.status}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* 3. My Case Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold">My case info</h2>
            </div>

            <div className="space-y-4">
              {/* Case Type */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Case Type</span>
                <span className="font-semibold text-right">
                  {caseStatus.case_type || 'Not available'}
                </span>
              </div>

              {/* Case Category */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Case Category</span>
                <span className="font-medium text-right text-sm max-w-md">
                  All other applications for employment authorization
                </span>
              </div>

              {/* Application Filing Date */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Application Filing Date</span>
                <span className="font-semibold">
                  {caseStatus.received_date ? formatDateShort(caseStatus.received_date) : 'Not available'}
                </span>
              </div>

              {/* Service Center */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Service Center</span>
                <span className="font-semibold">
                  {getServiceCenter(caseStatus.receipt_number)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-semibold text-right max-w-md">
                  {caseStatus.current_status || 'Fetching...'}
                </span>
              </div>

              {/* Time Information */}
              <div className="flex items-center justify-between pt-3 text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Total</span>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {getDaysAgo(caseStatus.received_date)}
                  </p>
                </div>
                <div className="w-px h-10 bg-gray-300 dark:border-gray-700"></div>
                <div className="text-right">
                  <span className="font-medium">Last update</span>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {getDaysAgo(caseStatus.last_status_change_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
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
    </div>
  );
}
