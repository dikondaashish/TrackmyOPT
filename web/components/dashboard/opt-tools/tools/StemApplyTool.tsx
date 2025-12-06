"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, Save, Shield, GraduationCap, Sparkles, ChevronRight, FileText, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../DateInput";
import { ResultCard } from "../ResultCard";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";
import { TickingClock, TickingClockCompact } from "../TickingClock";
import { PricingModal } from "@/components/pricing/PricingModal";

export function StemApplyTool() {
  const router = useRouter();
  const [optEndDate, setOptEndDate] = useState("");
  const [results, setResults] = useState<{
    earliestFile: Date;
    deadline: Date;
    capGapEnd: Date;
    daysUntilDeadline: number;
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
  }, []);

  useEffect(() => {
    if (optEndDate) calculate();
  }, [optEndDate]);

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      const [datesRes, premiumRes] = await Promise.all([
        fetch('/api/opt/calculator', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/premium/status', { credentials: 'include' }),
      ]);

      if (datesRes.ok) {
        const result = await datesRes.json();
        if (result.ok && result.data?.opt_ead_end_date) {
          setOptEndDate(result.data.opt_ead_end_date);
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
    const optEnd = parseDate(optEndDate);
    if (!optEnd) {
      setResults(null);
      return;
    }

    const earliestFile = addDays(optEnd, -90);
    const deadline = optEnd;
    const capGapEnd = addDays(optEnd, 180);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setResults({
      earliestFile,
      deadline,
      capGapEnd,
      daysUntilDeadline: daysBetween(today, deadline),
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
          opt_ead_end_date: optEndDate,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">STEM OPT Apply Dates</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Calculate your STEM extension filing window</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">STEM OPT Extension Rules</h2>
                    <p className="text-emerald-100 leading-relaxed">
                      Apply up to <span className="font-semibold text-white">90 days before</span> your OPT expires. 
                      If filed timely, you get automatic <span className="font-semibold text-white">180-day cap-gap</span> work authorization while waiting for approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Input Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your OPT End Date</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter the date from your EAD card</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="max-w-md">
                  <DateInput
                    label="Current OPT EAD End Date"
                    value={optEndDate}
                    onChange={setOptEndDate}
                    description="From your OPT Employment Authorization Document"
                    required
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !optEndDate}
                    className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl shadow-lg transition-all duration-200 ${
                      saveSuccess 
                        ? 'bg-green-500 hover:bg-green-600 shadow-green-500/25' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
                    } disabled:from-gray-400 disabled:to-gray-500 text-white`}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results - STEM Filing Timeline with Ticking Clock */}
            {results && (
              <div className="space-y-6">
                {/* Live Ticking Clock */}
                <TickingClock
                  targetDate={results.deadline}
                  title="Time Until OPT Expires"
                  subtitle={`File STEM extension before ${formatDateForDisplay(results.deadline)}`}
                  gradient="from-emerald-500 via-green-500 to-teal-500"
                />

                {/* Key Dates Grid */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-[22px] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">STEM Filing Timeline</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Key dates for your extension</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <ResultCard
                        icon="📅"
                        label="Earliest Filing"
                        value={formatDateForDisplay(results.earliestFile)}
                        subtext="90 days before OPT ends"
                      />
                      <ResultCard
                        icon="⏰"
                        label="Filing Deadline"
                        value={formatDateForDisplay(results.deadline)}
                        subtext="Before OPT expires"
                        status={results.daysUntilDeadline <= 14 ? 'critical' : results.daysUntilDeadline <= 30 ? 'warning' : 'ok'}
                      />
                      <ResultCard
                        icon="🛡️"
                        label="Cap-Gap Ends"
                        value={formatDateForDisplay(results.capGapEnd)}
                        subtext="If filed timely"
                      />
                    </div>
                  </div>
                </div>

                {/* Cap-Gap Info */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
                  <div className="relative z-10 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Cap-Gap Protection</h3>
                      <p className="text-emerald-100 leading-relaxed">
                        If you file timely, you can continue working for <span className="font-semibold text-white">180 days</span> after your OPT expires while waiting for your STEM extension approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Reminders */}
            <EmailReminder
              toolType="stem-apply"
              isPremium={isPremium}
              onUpgradeClick={() => setShowPricingModal(true)}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Compact Countdown */}
              {results && (
                <TickingClockCompact
                  targetDate={results.deadline}
                  title="STEM Deadline"
                  gradient="from-emerald-500 to-teal-500"
                  toolType="stem-apply"
                />
              )}
              
              <LiveStatsWidget toolType="stem-apply" />
              
              {/* Pro Tips */}
              <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Pro Tips</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span>File STEM before OPT expires</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span>Get updated I-20 from DSO first</span>
                    </li>
                    <li className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
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
