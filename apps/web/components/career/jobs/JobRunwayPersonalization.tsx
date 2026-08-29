import { AlertTriangle, Clock3, Sparkles } from 'lucide-react';
import { isHighPriorityThisWeek, type RunwayContext } from '@/lib/job-board/runway';

export function JobRunwaySummary({ runway }: { runway: RunwayContext | null }) {
  if (!runway) return null;

  return (
    <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-50" aria-label="Your OPT runway">
      <div className="flex gap-3">
        <Clock3 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="space-y-2 leading-6">
          <p className="font-semibold">You have {runway.remaining} unemployment days remaining.</p>
          <p>
            This is based on your saved OPT dates and employment history ({runway.used} of {runway.max} days used).
            Viewing or saving a job does not change this clock. It updates only after you record qualifying employment and dates in your tracker.
          </p>
          {runway.stemActive && (
            <p className="font-medium">
              For STEM OPT, confirm role eligibility and employer requirements with your DSO and employer.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function JobUrgencyLabels({
  recentlyPosted,
  sponsorEvidenced,
  runway,
}: {
  recentlyPosted: boolean;
  sponsorEvidenced: boolean;
  runway: RunwayContext | null;
}) {
  const highPriority = isHighPriorityThisWeek(runway);
  if (!highPriority && !(recentlyPosted && sponsorEvidenced)) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label="Job priority context">
      {recentlyPosted && sponsorEvidenced && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950/60 dark:text-blue-100">
          <Sparkles className="size-3.5" aria-hidden="true" /> Recently posted, sponsor-evidenced role
        </span>
      )}
      {highPriority && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-950 dark:bg-amber-950/60 dark:text-amber-50">
          <AlertTriangle className="size-3.5" aria-hidden="true" /> High-priority this week
        </span>
      )}
    </div>
  );
}
