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
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    program_end_date: optStatus?.program_end_date ? isoToMMDDYYYY(optStatus.program_end_date) : '',
    dso_recommendation_date: optStatus?.dso_recommendation_date ? isoToMMDDYYYY(optStatus.dso_recommendation_date) : '',
    opt_ead_end_date: optStatus?.opt_ead_end_date ? isoToMMDDYYYY(optStatus.opt_ead_end_date) : '',
    opt_start_date: optStatus?.opt_start_date ? isoToMMDDYYYY(optStatus.opt_start_date) : '',
    stem_start_date: optStatus?.stem_start_date ? isoToMMDDYYYY(optStatus.stem_start_date) : '',
    is_stem_eligible: profile.is_stem_eligible,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timezone: profile.timezone,
          is_stem_eligible: formData.is_stem_eligible,
          program_end_date: formData.program_end_date,
          dso_recommendation_date: formData.dso_recommendation_date || null,
          opt_ead_end_date: formData.opt_ead_end_date,
          opt_start_date: formData.opt_start_date,
          stem_start_date: formData.is_stem_eligible ? formData.stem_start_date : null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.details || data.error || 'Failed to save');
      }

      setSuccess(true);
      setEditMode(false);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      program_end_date: optStatus?.program_end_date ? isoToMMDDYYYY(optStatus.program_end_date) : '',
      dso_recommendation_date: optStatus?.dso_recommendation_date ? isoToMMDDYYYY(optStatus.dso_recommendation_date) : '',
      opt_ead_end_date: optStatus?.opt_ead_end_date ? isoToMMDDYYYY(optStatus.opt_ead_end_date) : '',
      opt_start_date: optStatus?.opt_start_date ? isoToMMDDYYYY(optStatus.opt_start_date) : '',
      stem_start_date: optStatus?.stem_start_date ? isoToMMDDYYYY(optStatus.stem_start_date) : '',
      is_stem_eligible: profile.is_stem_eligible,
    });
    setEditMode(false);
    setError(null);
  };

  return (
    <>
      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top">
          <span className="text-xl">✅</span>
          <span className="font-medium">Your dates have been saved successfully!</span>
        </div>
      )}

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

      {/* Your Dates - Editable Form */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>✏️</span> Your Dates
          </h2>
          {!editMode && optStatus && (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.program_end_date}
                onChange={(e) => setFormData({ ...formData, program_end_date: e.target.value })}
                placeholder="MM/DD/YYYY"
                disabled={!editMode || loading}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            {/* DSO Recommendation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DSO Recommendation Date <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.dso_recommendation_date}
                onChange={(e) => setFormData({ ...formData, dso_recommendation_date: e.target.value })}
                placeholder="MM/DD/YYYY"
                disabled={!editMode || loading}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            {/* OPT EAD End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current OPT EAD End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.opt_ead_end_date}
                onChange={(e) => setFormData({ ...formData, opt_ead_end_date: e.target.value })}
                placeholder="MM/DD/YYYY"
                disabled={!editMode || loading}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            {/* OPT Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OPT Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.opt_start_date}
                onChange={(e) => setFormData({ ...formData, opt_start_date: e.target.value })}
                placeholder="MM/DD/YYYY"
                disabled={!editMode || loading}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          </div>

          {/* STEM Eligible Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_stem_eligible"
              checked={formData.is_stem_eligible}
              onChange={(e) => setFormData({ ...formData, is_stem_eligible: e.target.checked })}
              disabled={!editMode || loading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="is_stem_eligible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              I'm STEM-eligible
            </label>
          </div>

          {/* STEM Start Date */}
          {formData.is_stem_eligible && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                STEM OPT Start Date
              </label>
              <input
                type="text"
                value={formData.stem_start_date}
                onChange={(e) => setFormData({ ...formData, stem_start_date: e.target.value })}
                placeholder="MM/DD/YYYY"
                disabled={!editMode || loading}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          )}

          {/* Buttons */}
          {editMode && (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
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
    ? date 
    : formatDate(typeof date === 'string' ? date : date);

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

