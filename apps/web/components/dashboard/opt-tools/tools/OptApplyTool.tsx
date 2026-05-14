"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, Save, Calendar, Clock, Target, FileText, Sparkles, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../DateInput";
import { ResultCard } from "../ResultCard";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";
import { TickingClock, TickingClockCompact } from "../TickingClock";
import { PricingModal } from "@/components/pricing/PricingModal";

interface CalculatedDates {
  earliestFile: Date;
  mustArriveBy: Date;
  optStartEarliest: Date;
  optStartLatest: Date;
  daysUntilDeadline: number;
}

export function OptApplyTool() {
  const router = useRouter();
  const [programEndDate, setProgramEndDate] = useState("");
  const [dsoRecommendationDate, setDsoRecommendationDate] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [results, setResults] = useState<CalculatedDates | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    lastSynced: null as Date | null,
    isSyncing: false,
    error: null as string | null,
  });
  const [isPremium, setIsPremium] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
     
  }, []);

  // Auto-calculate when dates change
  useEffect(() => {
    if (programEndDate) {
      calculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programEndDate, dsoRecommendationDate]);

  // Auto-fill DSO recommendation date when program end date changes
  const handleProgramEndDateChange = (value: string) => {
    setProgramEndDate(value);
    // Always auto-fill DSO recommendation date to match program end date
    if (value) {
      setDsoRecommendationDate(value);
    }
  };

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      // Load dates from the same API as OPT Dates page for perfect sync
      const [datesRes, premiumRes] = await Promise.all([
        fetch('/api/opt/calculator', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/premium/status', { credentials: 'include' }),
      ]);

      if (datesRes.ok) {
        const result = await datesRes.json();
        if (result.ok && result.data) {
          if (result.data.program_end_date) {
            setProgramEndDate(result.data.program_end_date);
          }
          if (result.data.dso_recommendation_date) {
            setDsoRecommendationDate(result.data.dso_recommendation_date);
          }
        }
        setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
      }

      if (premiumRes.ok) {
        const premiumData = await premiumRes.json();
        setIsPremium(premiumData.isPremium || false);
      }
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

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const daysBetween = (date1: Date, date2: Date): number => {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculate = () => {
    const programEnd = parseDate(programEndDate);
    if (!programEnd) {
      setResults(null);
      return;
    }

    const dsoRec = parseDate(dsoRecommendationDate);

    const earliestFile = addDays(programEnd, -90);

    // NOTE: Synced with Chrome Extension logic (extension/src/pages/opt-apply.ts)
    // The extension strictly treats the filing deadline as Program End Date + 60 days.
    // It does NOT shorten the window based on the DSO recommendation date.
    // We maintain this behavior for consistency across platforms.
    const mustArriveBy = addDays(programEnd, 60);

    const optStartEarliest = programEnd;
    const optStartLatest = addDays(programEnd, 60);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setResults({
      earliestFile,
      mustArriveBy,
      optStartEarliest,
      optStartLatest,
      daysUntilDeadline: daysBetween(today, mustArriveBy),
    });
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
          program_end_date: programEndDate,
          dso_recommendation_date: dsoRecommendationDate || programEndDate,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/opt-tools')}
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OPT Apply Dates</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Calculate your I-765 filing window</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">Post-Completion OPT Filing Rules</h2>
                    <p className="text-blue-100 leading-relaxed">
                      You can apply <span className="font-semibold text-white">90 days before</span> your program ends, up to <span className="font-semibold text-white">60 days after</span>.
                      USCIS must receive your I-765 within <span className="font-semibold text-white">30 days</span> of your DSO's recommendation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Input Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Important Dates</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter dates from your I-20</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateInput
                    label="Program End Date"
                    value={programEndDate}
                    onChange={handleProgramEndDateChange}
                    description="From your I-20 (required)"
                    required
                  />
                  <DateInput
                    label="DSO Recommendation Date"
                    value={dsoRecommendationDate}
                    onChange={setDsoRecommendationDate}
                    description="When DSO signed your I-20"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !programEndDate}
                    className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl shadow-lg transition-all duration-200 ${saveSuccess
                      ? 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                      } disabled:from-gray-400 disabled:to-gray-500 text-white`}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results - Filing Timeline with Ticking Clock */}
            {results && (
              <div className="space-y-6">
                {/* Live Ticking Clock */}
                <TickingClock
                  targetDate={results.mustArriveBy}
                  title="Time Until Filing Deadline"
                  subtitle={`USCIS must receive by ${formatDateForDisplay(results.mustArriveBy)}`}
                  gradient="from-blue-600 via-indigo-600 to-purple-600"
                  toolType="opt-apply"
                  startDate={results.earliestFile}
                />

                {/* Key Dates Grid */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-[22px] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Filing Timeline</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Key dates based on your I-20</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ResultCard
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        }
                        label="Earliest Filing Date"
                        value={formatDateForDisplay(results.earliestFile)}
                        subtext="90 days before program end"
                      />
                      <ResultCard
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        }
                        label="Filing Deadline"
                        value={formatDateForDisplay(results.mustArriveBy)}
                        subtext="USCIS receipt deadline"
                        status={results.daysUntilDeadline <= 14 ? 'critical' : results.daysUntilDeadline <= 30 ? 'warning' : 'ok'}
                      />
                      <ResultCard
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        }
                        label="OPT Can Start"
                        value={formatDateForDisplay(results.optStartEarliest)}
                        subtext="Your program end date"
                      />
                      <ResultCard
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                        }
                        label="Latest OPT Start"
                        value={formatDateForDisplay(results.optStartLatest)}
                        subtext="60 days after program end"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Reminders */}
            <EmailReminder
              toolType="opt-apply"
              isPremium={isPremium}
              onUpgradeClick={() => setShowPricingModal(true)}
            />
          </div>

          {/* Right Sidebar - Live Stats & Widgets */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Compact Countdown in Sidebar */}
              {results && (
                <TickingClockCompact
                  targetDate={results.mustArriveBy}
                  title="Filing Deadline"
                  gradient="from-blue-600 to-indigo-600"
                  toolType="opt-apply"
                  startDate={results.earliestFile}
                />
              )}

              <LiveStatsWidget toolType="opt-apply" />

              {/* Quick Tips */}
              <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Pro Tips</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-blue-600" />
                      </div>
                      <span>File early to avoid processing delays</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-blue-600" />
                      </div>
                      <span>Use USPS tracking for I-765 package</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-blue-600" />
                      </div>
                      <span>Keep copies of all documents filed</span>
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
