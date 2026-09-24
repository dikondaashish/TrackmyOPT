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
  useEffect(() => {
    const abort = new AbortController();
    const load = () =>
      fetch(
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
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => {
      abort.abort();
      clearInterval(timer);
    };
  }, [caseId]);
  return (
    <span className="basis-full mt-1">
      {state?.next
        ? `${state.next.state === 'running' ? 'Check started from queue' : 'Queued check (scheduled start)'}: ${formatCheckedAt(state.next.scheduled_for)}. If this time has passed, the check is delayed; use manual refresh.`
        : 'Daily batch configured for 14:00 UTC; no per-case queued time is confirmed yet.'}
      {state?.attempt &&
        ` Last worker attempt: ${formatCheckedAt(state.attempt.attempted_at)} (${state.attempt.state}).`}
    </span>
  );
}
