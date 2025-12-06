"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Plus, Trash2, Save, Briefcase, Clock, Sparkles, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../DateInput";
import { ResultCard, ProgressBar } from "../ResultCard";
import { SyncStatus } from "../SyncStatus";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";
import { PricingModal } from "@/components/pricing/PricingModal";

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
  employer_name: string;
}

export function OptClockTool() {
  const router = useRouter();
  const [optStartDate, setOptStartDate] = useState("");
  const [optEndDate, setOptEndDate] = useState("");
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{ used: number; remaining: number; max: number } | null>(null);
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
    if (optStartDate && optEndDate) {
      calculate();
    }
  }, [optStartDate, optEndDate, employmentSpans]);

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      const [datesRes, spansRes, premiumRes] = await Promise.all([
        fetch('/api/opt/calculator', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/employment-spans', { credentials: 'include' }),
        fetch('/api/premium/status', { credentials: 'include' }),
      ]);

      if (datesRes.ok) {
        const result = await datesRes.json();
        if (result.ok && result.data) {
          if (result.data.opt_start_date) setOptStartDate(result.data.opt_start_date);
          if (result.data.opt_ead_end_date) setOptEndDate(result.data.opt_ead_end_date);
        }
      }

      if (spansRes.ok) {
        const data = await spansRes.json();
        if (data.spans) {
          setEmploymentSpans(data.spans.map((s: any) => ({
            id: s.id,
            start_date: s.start_date ? formatDateForInput(s.start_date) : '',
            end_date: s.end_date ? formatDateForInput(s.end_date) : null,
            employer_name: s.employer_name || '',
          })));
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
    const optStart = parseDate(optStartDate);
    const optEnd = parseDate(optEndDate);
    if (!optStart || !optEnd) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = today < optEnd ? today : optEnd;
    const totalDays = Math.max(0, daysBetween(optStart, endDate));
    
    let employedDays = 0;
    for (const span of employmentSpans) {
      const spanStart = parseDate(span.start_date);
      if (!spanStart) continue;
      
      const spanEnd = span.end_date ? parseDate(span.end_date) : today;
      if (!spanEnd) continue;
      
      const effectiveStart = spanStart < optStart ? optStart : spanStart;
      const effectiveEnd = spanEnd > endDate ? endDate : spanEnd;
      
      if (effectiveStart <= effectiveEnd) {
        employedDays += daysBetween(effectiveStart, effectiveEnd);
      }
    }
    
    const used = Math.max(0, totalDays - employedDays);
    const max = 90;
    const remaining = Math.max(0, max - used);

    setResults({ used, remaining, max });
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
      const optStart = parseDate(optStartDate);
      const optEnd = parseDate(optEndDate);

      await fetch('/api/opt-status', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opt_start_date: optStart?.toISOString().split('T')[0],
          opt_ead_end_date: optEnd?.toISOString().split('T')[0],
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard/opt-tools')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OPT Clock Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your 90-day unemployment limit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Warning Card */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">90-Day Unemployment Limit</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    During post-completion OPT, you cannot be unemployed for more than 90 days total.
                  </p>
                </div>
              </div>
            </div>

            {/* OPT Period */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">OPT Period</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateInput
                  label="OPT Start Date"
                  value={optStartDate}
                  onChange={setOptStartDate}
                  description="From your EAD card"
                  required
                />
                <DateInput
                  label="OPT End Date"
                  value={optEndDate}
                  onChange={setOptEndDate}
                  description="From your EAD card"
                  required
                />
              </div>
            </div>

            {/* Employment Spans */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employment History</h2>
                <button
                  onClick={addEmploymentSpan}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Job
                </button>
              </div>

              {employmentSpans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No employment periods added</p>
                  <p className="text-sm mt-1">Add your jobs to calculate unemployment days</p>
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

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save & Sync'}
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Unemployment Status</h2>
                
                {/* Main Counter */}
                <div className={`p-6 rounded-2xl text-center ${
                  results.remaining <= 10 ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                  results.remaining <= 30 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                  'bg-gradient-to-br from-green-500 to-emerald-600'
                } text-white`}>
                  <p className="text-sm font-medium opacity-90 mb-2">Days Remaining</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">{results.remaining}</span>
                    <span className="text-xl opacity-80">of {results.max}</span>
                  </div>
                </div>

                <ProgressBar used={results.used} max={results.max} label="Unemployment Days Used" />

                <div className="grid grid-cols-2 gap-4">
                  <ResultCard
                    icon="⏱️"
                    label="Days Used"
                    value={`${results.used} days`}
                    status={getStatus(results.used, results.max)}
                  />
                  <ResultCard
                    icon="✅"
                    label="Days Remaining"
                    value={`${results.remaining} days`}
                    status={results.remaining <= 10 ? 'critical' : results.remaining <= 30 ? 'warning' : 'ok'}
                  />
                </div>
              </div>
            )}

            {/* Email Reminders */}
            <EmailReminder
              toolType="opt-clock"
              isPremium={isPremium}
              onUpgradeClick={() => setShowPricingModal(true)}
            />

            <SyncStatus
              lastSynced={syncStatus.lastSynced}
              isSyncing={syncStatus.isSyncing}
              error={syncStatus.error}
              onSync={handleSave}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <LiveStatsWidget toolType="opt-clock" />
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
