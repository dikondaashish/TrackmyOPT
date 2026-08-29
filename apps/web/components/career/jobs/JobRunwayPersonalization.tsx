import { AlertTriangle, ChevronDown, Clock3, Sparkles } from 'lucide-react';
import { isHighPriorityThisWeek, type RunwayContext } from '@/lib/job-board/runway';

export function JobRunwaySummary({ runway }: { runway: RunwayContext | null }) {
  if (!runway) return null;

  return (
    <aside aria-label="Your OPT runway">
      <details className="group rounded-lg border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-50">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
          <Clock3 className="size-4 shrink-0" aria-hidden="true" />
          <span>You have {runway.remaining} unemployment days remaining.</span>
          <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-1.5 border-t border-amber-200 px-3 py-2.5 text-xs leading-5 dark:border-amber-900/70">
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
      </details>
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-blue-100">
          <Sparkles className="size-3.5" aria-hidden="true" /> Recently posted, sponsor-evidenced role
        </span>
      )}
      {highPriority && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/60 dark:text-amber-50">
          <AlertTriangle className="size-3.5" aria-hidden="true" /> High-priority this week
        </span>
      )}
    </div>
  );
}
