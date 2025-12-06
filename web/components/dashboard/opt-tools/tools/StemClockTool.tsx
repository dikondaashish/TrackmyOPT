"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Plus, Trash2, Save, Briefcase, Timer, Sparkles, ChevronRight, FileText, Info, Target } from "lucide-react";
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
  const [stemEndDate, setStemEndDate] = useState("");
  const [priorUnemployment, setPriorUnemployment] = useState("0");
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{
    used: number;
    remaining: number;
    max: number;
    priorDays: number;
    stemDays: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
  }, []);

  useEffect(() => {
    if (stemStartDate && stemEndDate) calculate();
  }, [stemStartDate, stemEndDate, priorUnemployment, employmentSpans]);

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
    const stemEnd = parseDate(stemEndDate);
    if (!stemStart || !stemEnd) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = today < stemEnd ? today : stemEnd;
    const totalDays = Math.max(0, daysBetween(stemStart, endDate));
    
    let employedDays = 0;
    for (const span of employmentSpans) {
      const spanStart = parseDate(span.start_date);
      if (!spanStart) continue;
      
      const spanEnd = span.end_date ? parseDate(span.end_date) : today;
      if (!spanEnd) continue;
      
      const effectiveStart = spanStart < stemStart ? stemStart : spanStart;
      const effectiveEnd = spanEnd > endDate ? endDate : spanEnd;
      
      if (effectiveStart <= effectiveEnd) {
        employedDays += daysBetween(effectiveStart, effectiveEnd);
      }
    }
    
    const stemUnemployed = Math.max(0, totalDays - employedDays);
    const priorDays = parseInt(priorUnemployment) || 0;
    const used = stemUnemployed + priorDays;
    const max = 150;
    const remaining = Math.max(0, max - used);

    setResults({ used, remaining, max, priorDays, stemDays: stemUnemployed });
  };

  const addEmploymentSpan = () => {
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
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const stemStart = parseDate(stemStartDate);
      await fetch('/api/opt-status', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stem_start_date: stemStart?.toISOString().split('T')[0],
        }),
      });
      setSyncStatus({ lastSynced: new Date(), isSyncing: false, error: null });
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: 'Failed to sync' }));
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track your 150-day aggregate unemployment limit</p>
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
                    <h2 className="text-lg font-bold mb-2">150-Day Aggregate Unemployment Limit</h2>
                    <p className="text-purple-100 leading-relaxed">
                      Your total unemployment (including prior OPT) cannot exceed <span className="font-semibold text-white">150 days aggregate</span> during STEM OPT. 
                      Track all your employment periods carefully to stay in compliance.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Employment History */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">STEM Employment History</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add your STEM OPT jobs</p>
                    </div>
                  </div>
                  <button
                    onClick={addEmploymentSpan}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Job
                  </button>
                </div>
              </div>
              
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
            </div>

            {/* Results - STEM Unemployment Clock with Live Ticking */}
            {results && (
              <div className="space-y-6">
                {/* Live Unemployment Clock */}
                <UnemploymentClock
                  daysUsed={results.used}
                  maxDays={results.max}
                  title="STEM Unemployment Tracker"
                  subtitle="150-day aggregate limit (OPT + STEM)"
                  type="stem"
                />

                {/* Key Stats Grid */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-[22px] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Unemployment Status</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aggregate 150-day limit</p>
                      </div>
                    </div>
                    
                    <ProgressBar used={results.used} max={results.max} label="Total Unemployment Days" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <ResultCard
                        icon="📊"
                        label="Prior OPT Days"
                        value={`${results.priorDays} days`}
                      />
                      <ResultCard
                        icon="⏱️"
                        label="STEM Days Used"
                        value={`${results.stemDays} days`}
                      />
                      <ResultCard
                        icon="✅"
                        label="Total Remaining"
                        value={`${results.remaining} days`}
                        status={results.remaining <= 15 ? 'critical' : results.remaining <= 50 ? 'warning' : 'ok'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      <span>150-day aggregate includes OPT</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>Report employment changes to DSO</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>E-Verify status required for STEM</span>
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
