'use client';
import { useEffect, useState } from 'react';
import { formatCheckedAt } from '@/lib/case-status/safe-dates';
type Schedule = {
  next?: { scheduled_for: string; state: string } | null;
  attempt?: {
    attempted_at: string;
    state: string;
    error_code: string | null;
  } | null;
};
export function CheckSchedule({ caseId }: { caseId: string }) {
  const [state, setState] = useState<Schedule | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    const load = () => {
      setNow(new Date());
      return fetch(
        `/api/case-status/monitor-schedule?case_id=${encodeURIComponent(caseId)}`,
        { signal: abort.signal, credentials: 'include' }
      )
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((body) => {
          if (!abort.signal.aborted) setState(body);
        })
        .catch(() => {
          if (!abort.signal.aborted) setState(null);
        });
    };
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => {
      abort.abort();
      clearInterval(timer);
    };
  }, [caseId]);
  const next = state?.next;
  const delayed =
    next?.state !== 'running' &&
    now &&
    next &&
    new Date(next.scheduled_for).getTime() < now.getTime();
  return (
    <div>
      <div className="font-medium text-foreground tabular-nums">
        {next
          ? formatCheckedAt(next.scheduled_for)
          : 'Queue time not confirmed'}
      </div>
      {next && (
        <div className="mt-1">
          {next.state === 'running'
            ? 'Started · not yet completed'
            : delayed
              ? 'Delayed · refresh manually to retry'
              : 'Queued · scheduled start'}
        </div>
      )}
      <details className="mt-2">
        <summary className="w-fit cursor-pointer rounded text-blue-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 dark:text-blue-400">
          Schedule details
        </summary>
        <div className="mt-2 space-y-1">
          <div>
            Daily batch: 14:00 UTC. Queue timing varies; a scheduled start is
            not a completed check.
          </div>
          {state?.attempt ? (
            <div>
              Last worker attempt: {formatCheckedAt(state.attempt.attempted_at)}{' '}
              ({state.attempt.state}).
            </div>
          ) : (
            <div>No worker attempt confirmed.</div>
          )}
        </div>
      </details>
    </div>
  );
}
