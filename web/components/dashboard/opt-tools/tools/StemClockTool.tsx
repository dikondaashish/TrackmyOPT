"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Plus, Trash2, Save, Briefcase, Timer, Sparkles, ChevronRight, ChevronDown, ChevronUp, FileText, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../DateInput";
import { ResultCard, ProgressBar } from "../ResultCard";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";
import { UnemploymentClock, UnemploymentClockCompact } from "../UnemploymentClock";
import { PricingModal } from "@/components/pricing/PricingModal";

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
  employer_name: string;
}

export function StemClockTool() {
  const router = useRouter();
  const [stemStartDate, setStemStartDate] = useState("");
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [showEmploymentHistory, setShowEmploymentHistory] = useState(false);
  const [results, setResults] = useState<{
    used: number;
    remaining: number;
    max: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    lastSynced: null as Date | null,
    isSyncing: false,
    error: null as string | null,
  });
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    loadSavedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stemStartDate) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stemStartDate, employmentSpans]);

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      const [datesRes, premiumRes] = await Promise.all([
        fetch('/api/opt/calculator', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/premium/status', { credentials: 'include' }),
      ]);

      if (datesRes.ok) {
        const result = await datesRes.json();
        if (result.ok && result.data) {
          if (result.data.stem_start_date) setStemStartDate(result.data.stem_start_date);
        }
      }

      if (premiumRes.ok) {
        const premiumData = await premiumRes.json();
        setIsPremium(premiumData.isPremium || false);
      }

      setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${date.getFullYear()}`;
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts.map(Number);
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
    return null;
  };

  const daysBetween = (date1: Date, date2: Date): number => {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculate = () => {
    const stemStart = parseDate(stemStartDate);
    if (!stemStart) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate from STEM start date to today
    const totalDays = Math.max(0, daysBetween(stemStart, today));
    
    let employedDays = 0;
    for (const span of employmentSpans) {
      const spanStart = parseDate(span.start_date);
      if (!spanStart) continue;
      
      const spanEnd = span.end_date ? parseDate(span.end_date) : today;
      if (!spanEnd) continue;
      
      const effectiveStart = spanStart < stemStart ? stemStart : spanStart;
      const effectiveEnd = spanEnd > today ? today : spanEnd;
      
      if (effectiveStart <= effectiveEnd) {
        employedDays += daysBetween(effectiveStart, effectiveEnd);
      }
    }
    
    const used = Math.max(0, totalDays - employedDays);
    const max = 60; // STEM OPT has 60-day unemployment limit (separate from initial OPT 90 days)
    const remaining = Math.max(0, max - used);

    setResults({ used, remaining, max });
  };

  const addEmploymentSpan = () => {
    setShowEmploymentHistory(true);
    setEmploymentSpans([...employmentSpans, {
      id: `temp-${Date.now()}`,
      start_date: "",
      end_date: null,
      employer_name: "",
    }]);
  };

  const updateSpan = (id: string, field: keyof EmploymentSpan, value: string | null) => {
    setEmploymentSpans(spans => spans.map(span => 
      span.id === id ? { ...span, [field]: value } : span
    ));
  };

  const removeSpan = (id: string) => {
    setEmploymentSpans(spans => spans.filter(span => span.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Use the same API as OPT Dates page for perfect sync
      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stem_start_date: stemStartDate,
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatus = (used: number, max: number): 'ok' | 'warning' | 'critical' => {
    if (used >= max * 0.89) return 'critical';
    if (used >= max * 0.67) return 'warning';
    return 'ok';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/opt-tools')}
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">STEM Clock Tracker</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track your 60-day unemployment limit</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 p-6 text-white shadow-xl shadow-purple-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">STEM OPT 60-Day Unemployment Limit</h2>
                    <p className="text-purple-100 leading-relaxed">
                      During your STEM OPT extension, you have <span className="font-semibold text-white">60 days of unemployment</span> allowed. 
                      This is separate from initial OPT (90 days) - each period has its own limit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEM Period - Date Input Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your STEM OPT Period</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter dates from your STEM EAD card</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="max-w-md">
                  <DateInput
                    label="STEM Start Date"
                    value={stemStartDate}
                    onChange={setStemStartDate}
                    description="From your STEM EAD card"
                    required
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !stemStartDate}
                    className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl shadow-lg transition-all duration-200 ${
                      saveSuccess 
                        ? 'bg-green-500 hover:bg-green-600 shadow-green-500/25' 
                        : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-purple-500/25'
                    } disabled:from-gray-400 disabled:to-gray-500 text-white`}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results - STEM Unemployment Clock with Live Ticking */}
            {results && (
              <div className="space-y-6">
                {/* Live Unemployment Clock */}
                <UnemploymentClock
                  daysUsed={results.used}
                  maxDays={results.max}
                  title="STEM Unemployment Tracker"
                  subtitle="60-day limit for STEM OPT extension"
                  type="stem"
                  startDate={parseDate(stemStartDate) || undefined}
                />

                {/* Key Stats Grid */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-[22px] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your STEM Unemployment Status</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">60-day limit for STEM OPT period</p>
                      </div>
                    </div>
                    
                    <ProgressBar used={results.used} max={results.max} label="STEM Unemployment Days" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <ResultCard
                        icon="⏱️"
                        label="Days Used"
                        value={`${results.used} days`}
                        status={results.used >= 50 ? 'critical' : results.used >= 30 ? 'warning' : 'ok'}
                      />
                      <ResultCard
                        icon="✅"
                        label="Days Remaining"
                        value={`${results.remaining} days`}
                        status={results.remaining <= 10 ? 'critical' : results.remaining <= 30 ? 'warning' : 'ok'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employment History - Collapsible */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <button
                onClick={() => setShowEmploymentHistory(!showEmploymentHistory)}
                className="w-full p-6 border-b border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">STEM Employment History</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {employmentSpans.length === 0 ? 'Add your STEM OPT jobs' : `${employmentSpans.length} job${employmentSpans.length > 1 ? 's' : ''} added`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); addEmploymentSpan(); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Job
                    </button>
                    {showEmploymentHistory ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
              
              {showEmploymentHistory && (
                <div className="p-6">
                  {employmentSpans.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">No STEM employment periods added</p>
                      <p className="text-sm mt-1">Add your STEM OPT jobs to calculate unemployment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {employmentSpans.map((span, index) => (
                        <div key={span.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-medium text-gray-900 dark:text-white">Job #{index + 1}</span>
                            <button
                              onClick={() => removeSpan(span.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employer</label>
                              <input
                                type="text"
                                value={span.employer_name}
                                onChange={(e) => updateSpan(span.id, 'employer_name', e.target.value)}
                                placeholder="Company name"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                              />
                            </div>
                            <DateInput
                              label="Start Date"
                              value={span.start_date}
                              onChange={(v) => updateSpan(span.id, 'start_date', v)}
                            />
                            <DateInput
                              label="End Date"
                              value={span.end_date || ''}
                              onChange={(v) => updateSpan(span.id, 'end_date', v || null)}
                              description="Leave blank if current"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Reminders */}
            <EmailReminder
              toolType="stem-clock"
              isPremium={isPremium}
              onUpgradeClick={() => setShowPricingModal(true)}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Compact Unemployment Clock */}
              {results && (
                <UnemploymentClockCompact
                  daysUsed={results.used}
                  maxDays={results.max}
                  title="Days Remaining"
                  type="stem"
                  startDate={parseDate(stemStartDate) || undefined}
                />
              )}
              
              <LiveStatsWidget toolType="stem-clock" />
              
              {/* Pro Tips */}
              <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-violet-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Pro Tips</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>STEM has 60-day limit (separate)</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>Initial OPT has 90-day limit</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>E-Verify employer required</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Modal */}
      <PricingModal 
        open={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />
    </div>
  );
}
