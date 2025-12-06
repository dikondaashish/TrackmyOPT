"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateInput } from "../DateInput";
import { ResultCard, CountdownCard } from "../ResultCard";
import { SyncStatus } from "../SyncStatus";
import { LiveStatsWidget } from "../LiveStatsWidget";
import { EmailReminder } from "../EmailReminder";

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
  const [results, setResults] = useState<CalculatedDates | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    lastSynced: null as Date | null,
    isSyncing: false,
    error: null as string | null,
  });
  const [userEmail, setUserEmail] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Auto-calculate when dates change
  useEffect(() => {
    if (programEndDate) {
      calculate();
    }
  }, [programEndDate, dsoRecommendationDate]);

  const loadSavedData = async () => {
    try {
      const response = await fetch('/api/opt-status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          if (data.status.program_end_date) {
            setProgramEndDate(formatDateForInput(data.status.program_end_date));
          }
          if (data.status.dso_recommendation_date) {
            setDsoRecommendationDate(formatDateForInput(data.status.dso_recommendation_date));
          }
        }
        setSyncStatus(prev => ({ ...prev, lastSynced: new Date() }));
      }
      
      // Get user email and premium status
      const profileRes = await fetch('/api/user/profile', { credentials: 'include' });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserEmail(profile.email || '');
        setIsPremium(profile.is_premium || false);
      }
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
    let mustArriveBy = addDays(programEnd, 60);
    
    if (dsoRec) {
      const dsoDeadline = addDays(dsoRec, 30);
      if (dsoDeadline < mustArriveBy) {
        mustArriveBy = dsoDeadline;
      }
    }
    
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
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const programEnd = parseDate(programEndDate);
      const dsoRec = parseDate(dsoRecommendationDate);

      const response = await fetch('/api/opt-status', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_end_date: programEnd?.toISOString().split('T')[0],
          dso_recommendation_date: dsoRec?.toISOString().split('T')[0] || null,
        }),
      });

      if (response.ok) {
        setSyncStatus({ lastSynced: new Date(), isSyncing: false, error: null });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: 'Failed to sync. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OPT Apply Dates</h1>
            <p className="text-gray-600 dark:text-gray-400">Calculate your OPT filing window</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Post-Completion OPT Filing Rules</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    You can apply 90 days before your program ends, up to 60 days after. USCIS must receive your I-765 within 30 days of your DSO's recommendation.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Enter Your Dates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateInput
                  label="Program End Date"
                  value={programEndDate}
                  onChange={setProgramEndDate}
                  description="From your I-20"
                  required
                />
                <DateInput
                  label="DSO Recommendation Date"
                  value={dsoRecommendationDate}
                  onChange={setDsoRecommendationDate}
                  description="When DSO signed your I-20 (optional)"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !programEndDate}
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your OPT Filing Timeline</h2>
                
                <CountdownCard
                  days={results.daysUntilDeadline}
                  label="Days Until Deadline"
                  deadline={`Must arrive by ${formatDateForDisplay(results.mustArriveBy)}`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultCard
                    icon="📅"
                    label="Earliest You Can File"
                    value={formatDateForDisplay(results.earliestFile)}
                    subtext="90 days before program end"
                  />
                  <ResultCard
                    icon="⏰"
                    label="Must Arrive By"
                    value={formatDateForDisplay(results.mustArriveBy)}
                    subtext="USCIS receipt deadline"
                    status={results.daysUntilDeadline <= 14 ? 'critical' : results.daysUntilDeadline <= 30 ? 'warning' : 'ok'}
                  />
                  <ResultCard
                    icon="🎯"
                    label="OPT Can Start"
                    value={formatDateForDisplay(results.optStartEarliest)}
                    subtext="Your program end date"
                  />
                  <ResultCard
                    icon="📆"
                    label="Latest OPT Start"
                    value={formatDateForDisplay(results.optStartLatest)}
                    subtext="60 days after program end"
                  />
                </div>
              </div>
            )}

            {/* Email Reminders */}
            <EmailReminder
              toolType="opt-apply"
              isPremium={isPremium}
            />

            {/* Sync Status */}
            <SyncStatus
              lastSynced={syncStatus.lastSynced}
              isSyncing={syncStatus.isSyncing}
              error={syncStatus.error}
              email={userEmail}
              onSync={handleSave}
            />
          </div>

          {/* Right Sidebar - Live Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <LiveStatsWidget toolType="opt-apply" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
