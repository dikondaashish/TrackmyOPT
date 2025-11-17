'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  calculateOPTDates, 
  calculateUnemploymentDays, 
  getUnemploymentStatus,
  formatDate,
  formatDateRange,
  isoToMMDDYYYY,
  type OPTDates,
  type EmploymentSpan,
} from '@/lib/optCalculations';
import { DateSelector } from './DateSelector';

interface Profile {
  user_id: string;
  timezone: string;
  is_stem_eligible: boolean;
  created_at: string;
}

interface OptStatus {
  user_id: string;
  program_end_date: string;
  dso_recommendation_date: string | null;
  opt_ead_end_date: string;
  opt_start_date: string;
  stem_start_date: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardClientProps {
  profile: Profile;
  optStatus: OptStatus | null;
  employmentSpans: EmploymentSpan[];
  userEmail: string;
}

export default function DashboardClient({ 
  profile, 
  optStatus, 
  employmentSpans: initialSpans,
  userEmail 
}: DashboardClientProps) {
  // Calculate dates if we have OPT data
  let calculated = null;
  let unemployment = null;
  
  if (optStatus) {
    calculated = calculateOPTDates(optStatus as OPTDates);
    unemployment = calculateUnemploymentDays(
      optStatus.opt_start_date,
      optStatus.opt_ead_end_date,
      initialSpans
    );
  }

  const unemploymentStatus = unemployment ? getUnemploymentStatus(unemployment.used, unemployment.max) : null;

  return (
    <>

      {/* Summary Cards */}
      {optStatus && calculated && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Card 1: OPT Filing Window */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              OPT Filing Window
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
              {formatDate(calculated.earliestFileDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              → {formatDate(calculated.mustArriveBy)}
            </p>
            <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              See details
            </button>
          </div>

          {/* Card 2: Next Deadline */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition">
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Next Deadline
            </h3>
            {calculated.nextDeadline ? (
              <>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {calculated.nextDeadline.daysLeft} days left
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {calculated.nextDeadline.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatDate(calculated.nextDeadline.date)}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            )}
          </div>

          {/* Card 3: Unemployment Clock */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Unemployment Clock
            </h3>
            {unemployment && unemploymentStatus && (
              <>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {unemployment.used} / {unemployment.max} days
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  unemploymentStatus.level === 'ok' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  unemploymentStatus.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {unemploymentStatus.level === 'ok' ? '✅' : 
                   unemploymentStatus.level === 'warning' ? '⚠️' : '🚨'} {unemploymentStatus.label}
                </span>
              </>
            )}
          </div>

          {/* Card 4: STEM Status */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition">
            <div className="text-2xl mb-2">🎒</div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              STEM Status
            </h3>
            <p className="text-sm text-gray-900 dark:text-white">
              {profile.is_stem_eligible ? 'Eligible' : 'Not eligible'}
            </p>
            {profile.is_stem_eligible && optStatus.stem_start_date && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Start: {formatDate(optStatus.stem_start_date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {optStatus && calculated && (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📅</span> Your OPT Timeline
          </h2>
          <div className="space-y-4">
            <TimelineItem 
              label="Program End Date"
              date={optStatus.program_end_date}
              description="Last day of studies"
              color="gray"
            />
            {optStatus.dso_recommendation_date && (
              <TimelineItem 
                label="DSO Recommendation"
                date={optStatus.dso_recommendation_date}
                description="Optional, if received"
                color="gray"
              />
            )}
            <TimelineItem 
              label="Earliest File Date"
              date={calculated.earliestFileDate}
              description="90 days before program end"
              color="blue"
            />
            <TimelineItem 
              label="Recommended Target"
              date={calculated.recommendedTarget}
              description="Recommended submission"
              color="blue"
            />
            <TimelineItem 
              label="Must Arrive By"
              date={calculated.mustArriveBy}
              description="Hard deadline"
              color="red"
            />
            <TimelineItem 
              label="OPT Start Window"
              date={`${formatDateRange(calculated.optStartEarliest, calculated.optStartLatest)}`}
              description="Earliest - Latest"
              color="gray"
              isRange
            />
            {profile.is_stem_eligible && optStatus.stem_start_date && (
              <TimelineItem 
                label="STEM Start Date"
                date={optStatus.stem_start_date}
                description="If STEM-eligible"
                color="purple"
              />
            )}
          </div>
        </div>
      )}

      {/* Your Dates - Date Selector */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅</span> Your Dates
          </h2>
          <a
            href="/dashboard/opt-dates"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit Dates →
          </a>
        </div>

        <DateSelector />
      </div>
    </>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  label: string;
  date: string | Date;
  description: string;
  color: 'gray' | 'blue' | 'red' | 'purple';
  isRange?: boolean;
}

function TimelineItem({ label, date, description, color, isRange }: TimelineItemProps) {
  const colorClasses = {
    gray: 'bg-gray-200 dark:bg-gray-700',
    blue: 'bg-blue-500 dark:bg-blue-600',
    red: 'bg-red-500 dark:bg-red-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
  };

  const displayDate = isRange 
    ? (typeof date === 'string' ? date : formatDate(date))
    : formatDate(date);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></div>
        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
      </div>
      <div className="flex-1 pb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
        <p className="text-sm text-gray-900 dark:text-gray-200 mt-1">{displayDate}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

