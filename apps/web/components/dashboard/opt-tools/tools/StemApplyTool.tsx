"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Info, Save, Shield, GraduationCap, Lightbulb, ChevronRight, FileText, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../../opt/OptDateInput";
import { ResultCard } from "../ResultCard";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";
import { TickingClock, TickingClockCompact } from "../TickingClock";
import { PricingModal } from "@/components/pricing/PricingModal";
import { addDays, daysBetween, getStemFilingWindow } from "@/lib/immigration/opt-calculations";
import { optDateInputToISO } from "@/lib/immigration/opt-dates-page-utils";

export function StemApplyTool() {
  const router = useRouter();
  const [optEndDate, setOptEndDate] = useState("");
  const [recommendationDate, setRecommendationDate] = useState("");
  const [savedDates, setSavedDates] = useState({ optEndDate: '', recommendationDate: '' });
  const editVersion = useRef(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const version = editVersion.current;
    void (async () => {
      try {
        const response = await fetch('/api/opt/calculator', { credentials: 'include', cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load dates');
        const result = await response.json();
        if (!result.ok) throw new Error('Failed to load dates');
        if (!cancelled && version === editVersion.current) {
          setOptEndDate(result.data?.opt_ead_end_date || '');
          setRecommendationDate(result.data?.stem_dso_recommendation_date || '');
          setSavedDates({
            optEndDate: result.data?.opt_ead_end_date || '',
            recommendationDate: result.data?.stem_dso_recommendation_date || '',
          });
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    void (async () => {
      try {
        const response = await fetch('/api/premium/status', { credentials: 'include' });
        if (response.ok) {
          const result = await response.json();
          if (!cancelled) setIsPremium(result.isPremium || false);
        }
      } catch {
        // Premium status must not prevent dates from loading.
      }
    })();
    return () => { cancelled = true; };
  }, [loadAttempt]);

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const optEndISO = optDateInputToISO(optEndDate);
  const recommendationISO = optDateInputToISO(recommendationDate);
  const recommendationInvalid = !!recommendationDate.trim() && !recommendationISO;
  const filingWindow = optEndISO && !recommendationInvalid
    ? getStemFilingWindow(optEndISO, recommendationISO)
    : null;
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const results = filingWindow && optEndISO ? {
    earliestFile: new Date(`${filingWindow.earliestFile}T00:00:00`),
    deadline: new Date(`${filingWindow.hardDeadline}T00:00:00`),
    pendingExtensionEnd: new Date(`${addDays(optEndISO, 180)}T00:00:00`),
    daysUntilDeadline: daysBetween(todayISO, filingWindow.hardDeadline),
  } : null;
  const isDirty = optEndDate.trim() !== savedDates.optEndDate || recommendationDate.trim() !== savedDates.recommendationDate;

  const handleSave = async () => {
    if (isSaving || loadError || !optEndISO || recommendationInvalid) return;
    const version = editVersion.current;
    const submittedDates = { optEndDate: optEndDate.trim(), recommendationDate: recommendationDate.trim() };
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Use the same API as OPT Dates page for perfect sync
      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opt_ead_end_date: optEndDate.trim(),
          stem_dso_recommendation_date: recommendationDate.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save dates');
      const result = await response.json();
      if (!result.ok) throw new Error('Failed to save dates');
      setSavedDates(submittedDates);
      if (version === editVersion.current) setSaveSuccess(true);
    } catch {
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">STEM OPT Apply Dates</p>
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
                      A timely STEM application may extend work authorization for <span className="font-semibold text-white">up to 180 days</span> while it is pending. Confirm eligibility with your DSO.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Input Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your STEM Filing Dates</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use your EAD card and STEM recommendation</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="max-w-md space-y-6 text-gray-900 dark:text-gray-100">
                  <DateInput
                    id="stem-apply-opt-end-date"
                    label="Current OPT EAD End Date"
                    value={optEndDate}
                    onChange={(value) => {
                      editVersion.current += 1;
                      setSaveSuccess(false);
                      setOptEndDate(value);
                    }}
                    description="From your OPT Employment Authorization Document"
                    error={optEndDate.trim() && !optEndISO ? 'Enter a valid date (MM/DD/YYYY)' : null}
                  />
                  <DateInput
                    id="stem-apply-dso-recommendation-date"
                    label="STEM DSO Recommendation Date"
                    value={recommendationDate}
                    onChange={(value) => {
                      editVersion.current += 1;
                      setSaveSuccess(false);
                      setRecommendationDate(value);
                    }}
                    description="Date your DSO recommended the STEM extension in SEVIS; separate from your initial OPT recommendation. Clear to remove."
                    error={recommendationInvalid ? 'Enter a valid date (MM/DD/YYYY)' : null}
                    optional
                  />
                </div>

                {loadError && (
                  <p role="alert" className="mt-4 text-sm text-red-600">
                    Could not load your saved dates.{' '}
                    <button type="button" className="underline" onClick={() => {
                      setIsLoading(true);
                      setLoadError(false);
                      setLoadAttempt(attempt => attempt + 1);
                    }}>Try again</button>
                  </p>
                )}

                {!loadError && isDirty && (
                  <p role="status" className="mt-4 text-sm text-amber-700 dark:text-amber-300">
                    Unsaved preview: dashboard dates and email reminders still use your saved dates. Save to sync these changes.
                  </p>
                )}

                {/* Save Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || loadError || !optEndISO || recommendationInvalid}
                    className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl shadow-lg transition-all duration-200 ${saveSuccess
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
                  title="Time Until STEM Filing Deadline"
                  subtitle={`File STEM extension before ${formatDateForDisplay(results.deadline)}`}
                  gradient="from-emerald-500 via-green-500 to-teal-500"
                  toolType="stem-apply"
                  startDate={results.earliestFile}
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
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        }
                        label="Earliest Filing"
                        value={formatDateForDisplay(results.earliestFile)}
                        subtext="90 days before OPT ends"
                      />
                      <ResultCard
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        }
                        label="Filing Deadline"
                        value={formatDateForDisplay(results.deadline)}
                        subtext={filingWindow?.isDsoLimited ? 'Limited by STEM DSO recommendation' : 'Before OPT expires'}
                        status={results.daysUntilDeadline <= 14 ? 'critical' : results.daysUntilDeadline <= 30 ? 'warning' : 'ok'}
                      />
                      <ResultCard
                        icon={
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        }
                        label="Pending Extension Limit"
                        value={formatDateForDisplay(results.pendingExtensionEnd)}
                        subtext="Up to 180 days; may end sooner"
                      />
                    </div>
                  </div>
                </div>

                {/* Pending STEM extension work authorization */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
                  <div className="relative z-10 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Work Authorization While STEM Is Pending</h3>
                      <p className="text-emerald-100 leading-relaxed">
                        If eligible and filed timely, your work authorization may continue for <span className="font-semibold text-white">up to 180 days</span> after your OPT expires or until USCIS makes a decision, whichever comes first. Confirm your eligibility and dates with your DSO.
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
                  startDate={results.earliestFile}
                />
              )}

              <LiveStatsWidget toolType="stem-apply" />

              {/* Pro Tips */}
              <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-4 h-4 text-white" />
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
