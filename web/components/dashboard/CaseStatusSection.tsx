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

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
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

  const getDaysAgo = (dateString: string | null) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getServiceCenter = (receipt: string) => {
    const prefix = receipt.substring(0, 3).toUpperCase();
    const centers: Record<string, string> = {
      EAC: 'Vermont Service Center',
      WAC: 'California Service Center',
      LIN: 'Nebraska Service Center',
      SRC: 'Texas Service Center',
      MSC: 'National Benefits Center',
      NBC: 'National Benefits Center',
      IOE: 'USCIS Electronic Immigration System',
      YSC: 'Potomac Service Center',
    };
    return centers[prefix] || 'Unknown Service Center';
  };

  const getCaseCategory = (caseType: string | null) => {
    if (!caseType) return 'USCIS Case';
    const categories: Record<string, string> = {
      'I-765': 'Application for Employment Authorization',
      'I-130': 'Petition for Alien Relative',
      'I-140': 'Immigrant Petition for Alien Worker',
      'I-485': 'Application to Register Permanent Residence',
      'I-539': 'Application to Extend/Change Nonimmigrant Status',
      'I-90': 'Application to Replace Permanent Resident Card',
      'N-400': 'Application for Naturalization',
      'N-600': 'Application for Certificate of Citizenship',
    };
    return categories[caseType] || 'USCIS Case';
  };

  const renderDescription = (description: string | undefined) => {
    if (!description) return null;
    
    // Check if description contains HTML links
    if (description.includes('<a')) {
      // Parse HTML links and render them properly
      const linkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;
      let keyCounter = 0;
      
      // Reset regex lastIndex
      linkRegex.lastIndex = 0;
      
      while ((match = linkRegex.exec(description)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(description.substring(lastIndex, match.index));
        }
        // Add the link
        parts.push(
          <a 
            key={`link-${keyCounter++}`}
            href={match[1]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {match[2]}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      
      // Add remaining text
      if (lastIndex < description.length) {
        parts.push(description.substring(lastIndex));
      }
      
      return parts.length > 0 ? <>{parts}</> : description;
    }
    
    // No HTML, return as plain text
    return description;
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
            
            {/* Operating Hours Warning */}
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
      {!caseStatus && (
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
      )}

      {/* Case Status Dashboard */}
      {caseStatus && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Recent Updated Case Message */}
            <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-lg font-bold">Recent Updated Case Message</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {caseStatus.current_status}
                    {caseStatus.current_status?.toLowerCase().includes('card') && <span className="text-2xl">🎉</span>}
                  </h3>
                  <button onClick={() => window.open('https://egov.uscis.gov', '_blank')} className="text-sm text-blue-600 hover:underline font-medium">
                    Check online
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {formatDateOnly(caseStatus.last_status_change_at || caseStatus.last_checked_at)}
                </p>
                
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {renderDescription(caseStatus.status_history?.[0]?.description) || 
                   `Your case status is currently "${caseStatus.current_status}". This status was last updated on ${formatDateOnly(caseStatus.last_status_change_at || caseStatus.last_checked_at)}.`}
                </div>
              </div>
            </Card>

            {/* 2. Case Message History */}
            <Card className="p-6 border-none shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold">Case Message History</h2>
              </div>
              
              <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
                {(caseStatus.status_history || []).map((item, index) => {
                  const isMostRecent = index === 0;
                  return (
                    <div key={index} className="relative">
                      {/* Timeline dot - filled for most recent, hollow for others */}
                      {isMostRecent ? (
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-950" />
                      ) : (
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 ring-2 ring-white dark:ring-slate-950" />
                      )}
                      
                      <div className="mb-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatDateOnly(item.date)}
                        </span>
                      </div>
                      
                      <div className={`rounded-lg p-4 mt-2 ${isMostRecent ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-900'}`}>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          {item.status}
                        </h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {renderDescription(item.description) || item.status}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatDate(item.date)}
                      </div>
                    </div>
                  );
                })}
                
                {(!caseStatus.status_history || caseStatus.status_history.length === 0) && (
                  <div className="text-sm text-muted-foreground">No history available yet.</div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - My Case Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold">My case info</h2>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-muted-foreground">Case Type</span>
                  <span className="font-semibold">{caseStatus.case_type || 'Unknown'}</span>
                </div>

                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-muted-foreground block mb-1">Case Category</span>
                  <span className="font-medium text-sm">
                    {getCaseCategory(caseStatus.case_type)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-muted-foreground">Application Filing Date</span>
                  <span className="font-semibold">
                    {caseStatus.received_date 
                      ? new Date(caseStatus.received_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </span>
                </div>

                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-muted-foreground block mb-1">Service Center</span>
                  <span className="font-medium text-sm">
                    {getServiceCenter(caseStatus.receipt_number)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="font-semibold text-right">{caseStatus.current_status}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Total</span>
                    <span className="font-semibold">
                      {getDaysAgo(caseStatus.received_date)} days ago
                    </span>
                  </div>
                  <div className="border-l border-slate-100 dark:border-slate-800 pl-4">
                    <span className="text-xs text-muted-foreground block mb-1">Last update</span>
                    <span className="font-semibold">
                      {getDaysAgo(caseStatus.last_status_change_at || caseStatus.last_checked_at)} days ago
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={toggleNotifications}
                  >
                    {caseStatus.notifications_enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

