'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellPlus, BookmarkPlus, ChevronDown, ExternalLink, FilePenLine, GitCompareArrows, Loader2, PencilLine } from 'lucide-react';
import { saveVerifiedJobToTracker, setVerifiedJobFollowup } from '@/app/dashboard/career/job-tracker/actions';

type JobCardActionsProps = {
  jobId: string;
  companyName: string;
  title: string;
  jobUrl: string | null;
  sponsorId: string | null;
  initialSaved?: boolean;
  onSaved?: () => void;
  variant?: 'card' | 'list';
};

function resumeGeneratorHref(companyName: string, title: string) {
  const params = new URLSearchParams({ company: companyName, role: title });
  return `/dashboard/career/resume-generator?${params.toString()}`;
}

export function JobCardActions({ jobId, companyName, title, jobUrl, sponsorId, initialSaved = false, onSaved, variant = 'card' }: JobCardActionsProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(initialSaved ? 'saved' : 'idle');
  const [showFollowup, setShowFollowup] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupState, setFollowupState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveToTracker = async () => {
    try {
      setSaveState('saving');
      await saveVerifiedJobToTracker(jobId);
      setSaveState('saved');
      onSaved?.();
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

  const isList = variant === 'list';

  return (
    <section className={isList ? 'w-full sm:w-40' : 'border-t border-slate-950/10 bg-white/25 px-5 py-4 dark:border-white/10 dark:bg-slate-950/25 sm:px-6'} aria-label="Safe job actions">
      <div className={isList ? 'flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch' : 'flex flex-wrap items-center gap-2'}>
        <button
          type="button"
          onClick={saveToTracker}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-950/10 bg-white/45 px-3.5 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100 dark:hover:bg-slate-950/75 ${isList ? 'flex-1 sm:w-full' : ''}`}
        >
          {saveState === 'saving' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <BookmarkPlus className="size-4" aria-hidden="true" />}
          {saveState === 'saved' ? (isList ? 'Added' : 'Saved') : (isList ? 'Add to tracker' : 'Save')}
        </button>
        {jobUrl && (
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 ${isList ? 'flex-1 sm:w-full' : ''}`}
          >
            {isList ? 'Apply on ATS' : 'View role'} <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        )}
        <details className="group relative">
          <summary className={`inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-300 dark:hover:bg-slate-900 ${isList ? 'w-full' : ''}`}>
            More tools <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className={`absolute z-10 mt-2 grid w-[min(21rem,calc(100vw-3rem))] gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950 ${isList ? 'right-0' : 'left-0'}`}>
            <Link
              href={resumeGeneratorHref(companyName, title)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-100 dark:hover:bg-blue-950/40"
            >
              <FilePenLine className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Tailor resume
            </Link>
            {sponsorId ? (
              <Link
                href={`/dashboard/career/h1b-sponsors/${sponsorId}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-100 dark:hover:bg-blue-950/40"
              >
                <GitCompareArrows className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Compare sponsor profile
              </Link>
            ) : (
              <span className="px-3 py-2 text-sm leading-5 text-slate-600 dark:text-slate-300">Sponsor profile unavailable until employer identity is confirmed.</span>
            )}
            <button
              type="button"
              onClick={() => setShowFollowup((current) => !current)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-100 dark:hover:bg-blue-950/40"
              aria-expanded={showFollowup}
            >
              <BellPlus className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Set follow-up date
            </button>
            {showFollowup && (
              <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900" aria-label="Set a follow-up date">
                <label className="grid gap-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                  Follow-up date
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(event) => setFollowupDate(event.target.value)}
                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={saveFollowup}
                  disabled={!followupDate || followupState === 'saving' || followupState === 'saved'}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {followupState === 'saving' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {followupState === 'saved' ? 'Follow-up saved' : 'Save follow-up'}
                </button>
                {followupState === 'error' && <p className="text-sm text-red-700 dark:text-red-300">Could not save the follow-up. Please try again.</p>}
              </div>
            )}
            <Link
              href="/dashboard/career/job-tracker"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-100 dark:hover:bg-blue-950/40"
            >
              <PencilLine className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Record interview or application manually
            </Link>
          </div>
        </details>
      </div>

      {saveState === 'error' && <p className="text-sm text-red-700 dark:text-red-300">Could not save this job. Please try again.</p>}
      <p className={isList ? 'sr-only' : 'text-xs leading-5 text-slate-500 dark:text-slate-400'}>These actions only save information you choose to your tracker or open existing tools. They never submit an application or contact an employer.</p>
    </section>
  );
}
