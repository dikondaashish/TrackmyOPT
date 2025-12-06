"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Plus, Trash2, Save, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../DateInput";
import { ResultCard, ProgressBar } from "../ResultCard";
import { SyncStatus } from "../SyncStatus";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";

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
  const [userEmail, setUserEmail] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    if (stemStartDate && stemEndDate) calculate();
  }, [stemStartDate, stemEndDate, priorUnemployment, employmentSpans]);

  const loadSavedData = async () => {
    try {
      const [optRes, profileRes] = await Promise.all([
        fetch('/api/opt-status', { credentials: 'include' }),
        fetch('/api/user/profile', { credentials: 'include' }),
      ]);

      if (optRes.ok) {
        const data = await optRes.json();
        if (data.status) {
          if (data.status.stem_start_date) setStemStartDate(formatDateForInput(data.status.stem_start_date));
          // Assume STEM ends 24 months after start if not stored
        }
      }

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserEmail(profile.email || '');
        setIsPremium(profile.is_premium || false);
      }

      setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
    } catch (error) {
      console.error('Failed to load data:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard/opt-tools')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">STEM Clock Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your 150-day aggregate unemployment limit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">150-Day Aggregate Limit</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Your total unemployment (including prior OPT) cannot exceed 150 days aggregate during STEM OPT.
                  </p>
                </div>
              </div>
            </div>

            {/* STEM Period */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">STEM OPT Period</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateInput
                  label="STEM Start Date"
                  value={stemStartDate}
                  onChange={setStemStartDate}
                  description="From your STEM EAD card"
                  required
                />
                <DateInput
                  label="STEM End Date"
                  value={stemEndDate}
                  onChange={setStemEndDate}
                  description="From your STEM EAD card"
                  required
                />
              </div>
            </div>

            {/* Prior Unemployment */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prior OPT Unemployment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter the number of unemployment days you accumulated during your initial OPT period
              </p>
              <div className="max-w-xs">
                <input
                  type="number"
                  value={priorUnemployment}
                  onChange={(e) => setPriorUnemployment(e.target.value)}
                  min="0"
                  max="90"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg font-medium"
                />
                <p className="text-xs text-gray-500 mt-2">Max 90 days from initial OPT</p>
              </div>
            </div>

            {/* Employment Spans */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">STEM Employment History</h2>
                <button
                  onClick={addEmploymentSpan}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Job
                </button>
              </div>

              {employmentSpans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No STEM employment periods added</p>
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

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save & Sync'}
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">STEM Unemployment Status</h2>
                
                <div className={`p-6 rounded-2xl text-center ${
                  results.remaining <= 15 ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                  results.remaining <= 50 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                  'bg-gradient-to-br from-purple-500 to-violet-600'
                } text-white`}>
                  <p className="text-sm font-medium opacity-90 mb-2">Days Remaining</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">{results.remaining}</span>
                    <span className="text-xl opacity-80">of {results.max}</span>
                  </div>
                  <p className="text-sm opacity-80 mt-2">Aggregate limit</p>
                </div>

                <ProgressBar used={results.used} max={results.max} label="Total Unemployment Days" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            )}

            {/* Email Reminders */}
            <EmailReminder
              toolType="stem-clock"
              isPremium={isPremium}
            />

            <SyncStatus
              lastSynced={syncStatus.lastSynced}
              isSyncing={syncStatus.isSyncing}
              error={syncStatus.error}
              email={userEmail}
              onSync={handleSave}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <LiveStatsWidget toolType="stem-clock" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
