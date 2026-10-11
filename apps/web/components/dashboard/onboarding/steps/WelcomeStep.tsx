import Link from "next/link";
import { ArrowRight, CalendarDays, Radar } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  onTrackCase: () => void;
  onSkipForNow: () => void;
  skipForNowClassName: string;
}

const choiceClassName =
  "group flex w-full items-center gap-3 rounded-2xl border p-4 sm:gap-4 sm:p-5 text-left transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:active:scale-[0.98] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600";

export function WelcomeStep({
  onNext,
  onTrackCase,
  onSkipForNow,
  skipForNowClassName,
}: WelcomeStepProps) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5 sm:gap-7">
      <div className="text-center">
        <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          Welcome to TrackMyOPT
        </p>
        <h2
          id="onboarding-wizard-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
        >
          What brings you here?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Pick a starting point. You can do both.
        </p>
      </div>
      <div className="space-y-3">
        <Link
          href="/dashboard/case-status"
          onNavigate={onTrackCase}
          className={`${choiceClassName} border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40`}
        >
          <span className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Radar className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold text-foreground">
              Track my case
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Check your USCIS receipt.
            </span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-blue-600"
            aria-hidden="true"
          />
        </Link>
        <button
          type="button"
          onClick={onNext}
          className={`${choiceClassName} border-border bg-background`}
        >
          <span className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold text-foreground">
              Set up OPT dates
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Deadlines and unemployment days.
            </span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </div>
      <button
        type="button"
        onClick={onSkipForNow}
        className={`self-center py-2 ${skipForNowClassName}`}
        aria-label="Skip onboarding for now"
      >
        Skip for now
      </button>
    </div>
  );
}
