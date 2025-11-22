"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ClipboardCheck, 
  RefreshCw, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Crown
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
          return result.data; // Return data for polling check
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

    // Validate receipt number format
    if (!receiptNumber.trim()) {
      setError('Please enter a receipt number');
      return;
    }

    const receiptPattern = /^[A-Z]{3}\d{10}$/i; // e.g., IOE1234567890
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
        
        // Poll for status update (USCIS check happens asynchronously)
        console.log('✅ Receipt number saved, waiting for USCIS status check...');
        
        // Poll every 2 seconds for up to 20 seconds (10 attempts)
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollForStatus = async () => {
          for (let i = 0; i < maxAttempts; i++) {
            attempts++;
            console.log(`📡 Polling attempt ${attempts}/${maxAttempts}...`);
            
            // Wait 2 seconds before checking
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const data = await loadCaseStatus();
            
            // Check if status has been fetched
            const hasStatus = data?.current_status && 
                             data.current_status !== 'Status will be fetched shortly...' &&
                             data.last_checked_at;
            
            if (hasStatus) {
              console.log('✅ Status fetched successfully!', data.current_status);
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
              return;
            }
          }
          
          // Max attempts reached - check if it's a sandbox limitation
          console.error('⏱️ Status check is taking longer than expected.');
          
          // Check if user entered a real receipt number (starts with IOE, WAC, LIN, etc but not EAC9999... or SRC9999...)
          const isStagingNumber = /^(EAC|SRC|LIN)9999\d{6}$/i.test(receiptNumber);
          
          if (!isStagingNumber) {
            console.error('❌ SANDBOX MODE LIMITATION:');
            console.error(`   Your receipt number: ${receiptNumber}`);
            console.error(`   This appears to be a REAL receipt number.`);
            console.error(`   Sandbox only accepts STAGING numbers like:`);
            console.error(`   - EAC9999103403 (test number)`);
            console.error(`   - SRC9999102777 (test number)`);
            console.error(`💡 To check REAL receipt numbers, we need production API access.`);
            
            setError(`⚠️ Sandbox Mode: Cannot check real receipt numbers yet. We're currently in testing mode and can only check staging numbers like EAC9999103403. To enable real receipt tracking, we need production API access from USCIS (requires 5 days of testing). For now, check your status manually at egov.uscis.gov`);
          } else {
            console.log('💡 Try clicking "Refresh Now" or check back in a minute.');
          }
        };
        
        // Run polling in background
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

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes('approved')) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (status.toLowerCase().includes('pending')) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-blue-500" />;
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
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <p><strong>✅ Test numbers that work:</strong></p>
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

          {/* Error/Success Messages */}
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

      {/* Current Status */}
      {caseStatus && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Status</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleNotifications}
                  title={caseStatus.notifications_enabled ? "Notifications enabled" : "Notifications disabled"}
                >
                  {caseStatus.notifications_enabled ? (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications On
                    </>
                  ) : (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Notifications Off
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Now
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Receipt Number */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receipt Number</p>
                <p className="text-lg font-mono font-semibold">{caseStatus.receipt_number}</p>
              </div>

              {/* Current Status */}
              {caseStatus.current_status ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(caseStatus.current_status)}
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {caseStatus.current_status}
                      </p>
                      {caseStatus.case_type && (
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Case Type: {caseStatus.case_type}
                        </p>
                      )}
                      {caseStatus.received_date && (
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Received: {formatDate(caseStatus.received_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-muted-foreground text-center">
                    Status will be fetched shortly...
                  </p>
                </div>
              )}

              {/* Last Checked */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Last checked: {formatDate(caseStatus.last_checked_at)}
                </span>
                {caseStatus.last_status_change_at && (
                  <span>
                    Last changed: {formatDate(caseStatus.last_status_change_at)}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Premium Feature Notice */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Premium Feature: Instant Notifications</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get notified via email and SMS the moment your case status changes. Never miss an important update!
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
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
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </Card>

          {/* Status History */}
          {caseStatus.status_history && caseStatus.status_history.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Status History</h2>
              <div className="space-y-4">
                {caseStatus.status_history.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0"
                  >
                    <div className="pt-1">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.status}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
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

