'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellPlus, BookmarkPlus, ExternalLink, FilePenLine, GitCompareArrows, Loader2, PencilLine } from 'lucide-react';
import { saveVerifiedJobToTracker, setVerifiedJobFollowup } from '@/app/dashboard/career/job-tracker/actions';

type JobCardActionsProps = {
  jobId: string;
  companyName: string;
  title: string;
  jobUrl: string | null;
  sponsorId: string | null;
};

function resumeGeneratorHref(companyName: string, title: string) {
  const params = new URLSearchParams({ company: companyName, role: title });
  return `/dashboard/career/resume-generator?${params.toString()}`;
}

export function JobCardActions({ jobId, companyName, title, jobUrl, sponsorId }: JobCardActionsProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showFollowup, setShowFollowup] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupState, setFollowupState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveToTracker = async () => {
    try {
      setSaveState('saving');
      await saveVerifiedJobToTracker(jobId);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const saveFollowup = async () => {
    if (!followupDate) return;
    try {
      setFollowupState('saving');
      await setVerifiedJobFollowup(jobId, followupDate);
      setFollowupState('saved');
    } catch {
      setFollowupState('error');
    }
  };

  return (
    <section className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800" aria-label="Safe job actions">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveToTracker}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {saveState === 'saving' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <BookmarkPlus className="size-4" aria-hidden="true" />}
          {saveState === 'saved' ? 'Saved to tracker' : 'Save to job tracker'}
        </button>
        {jobUrl && (
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
          >
            Open original posting <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        )}
        <Link
          href={resumeGeneratorHref(companyName, title)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100"
        >
          Tailor resume <FilePenLine className="size-4" aria-hidden="true" />
        </Link>
        {sponsorId ? (
          <Link
            href={`/dashboard/career/h1b-sponsors/${sponsorId}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
          >
            Compare sponsor profile <GitCompareArrows className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center text-sm text-gray-600 dark:text-gray-300">Sponsor profile unavailable until employer identity is confirmed.</span>
        )}
        <button
          type="button"
          onClick={() => setShowFollowup((current) => !current)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
          aria-expanded={showFollowup}
        >
          <BellPlus className="size-4" aria-hidden="true" /> Set follow-up date
        </button>
        <Link
          href="/dashboard/career/job-tracker"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
        >
          <PencilLine className="size-4" aria-hidden="true" /> Record interview or application manually
        </Link>
      </div>

      {saveState === 'error' && <p className="text-sm text-red-700 dark:text-red-300">Could not save this job. Please try again.</p>}

      {showFollowup && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900" aria-label="Set a follow-up date">
          <label className="grid gap-1 text-sm font-medium text-gray-800 dark:text-gray-100">
            Follow-up date
            <input
              type="date"
              value={followupDate}
              onChange={(event) => setFollowupDate(event.target.value)}
              className="min-h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={saveFollowup}
            disabled={!followupDate || followupState === 'saving' || followupState === 'saved'}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {followupState === 'saving' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {followupState === 'saved' ? 'Follow-up saved' : 'Save follow-up'}
          </button>
          {followupState === 'error' && <p className="text-sm text-red-700 dark:text-red-300">Could not save the follow-up. Please try again.</p>}
        </div>
      )}
      <p className="text-xs leading-5 text-gray-600 dark:text-gray-300">These actions only save information you choose to your tracker or open existing tools. They never submit an application or contact an employer.</p>
    </section>
  );
}
