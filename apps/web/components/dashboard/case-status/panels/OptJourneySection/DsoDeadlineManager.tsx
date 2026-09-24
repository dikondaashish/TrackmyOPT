'use client';

import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { formatDisplayDateNoon } from '@/lib/case-status/safe-dates';
import type { OptComplianceAction } from '@/lib/case-status/opt-compliance-actions';
import { cn } from '@/lib/utils';
import { downloadDeadlineCalendar } from '@/lib/case-status/calendar';
import { useState, useCallback, useEffect } from 'react';
import type { CaseNotice } from '@/lib/case-status/notices';
import { JourneyTaskActions, NOTICES_CHANGED } from './JourneyTaskActions';

interface DsoDeadlineManagerProps {
  tasks: OptComplianceAction[];
  caseId?: string;
  isPro?: boolean;
}

const STATUS_ICON: Record<OptComplianceAction['status'], React.ReactNode> = {
  done: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
  open: <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  overdue: <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />,
};

const STATUS_LABEL: Record<OptComplianceAction['status'], string> = {
  done: 'Done',
  open: 'Open',
  overdue: 'Overdue',
};

export function DsoDeadlineManager({
  tasks: generatedTasks,
  caseId,
  isPro = false,
}: DsoDeadlineManagerProps) {
  const [saved, setSaved] = useState<Record<string, CaseNotice | null>>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const onNotice = useCallback(
    (key: string, notice: CaseNotice | null) =>
      setSaved((prev) => ({ ...prev, [key]: notice })),
    []
  );
  useEffect(() => {
    if (!caseId) return;
    const abort = new AbortController();
    let revision = 0;
    function load() {
      const request = ++revision;
      return fetch(`/api/case-status/notices?case_id=${caseId}`, {
        signal: abort.signal,
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((body) => {
          if (!abort.signal.aborted && request === revision) {
            setSaved(
              Object.fromEntries(
                (body.notices as CaseNotice[])
                  .filter((n) => n.source_key)
                  .map((n) => [n.source_key!, n])
              )
            );
            setReady(true);
            setError('');
          }
        })
        .catch(() => {
          if (!abort.signal.aborted && request === revision) {
            setReady(false);
            setError(
              'Saved tasks could not load. Use the notice organizer or reload to retry.'
            );
          }
        });
    }
    void load();
    const refresh = () => void load();
    window.addEventListener(NOTICES_CHANGED, refresh);
    return () => {
      abort.abort();
      window.removeEventListener(NOTICES_CHANGED, refresh);
    };
  }, [caseId]);
  const tasks = generatedTasks.map((task) =>
    saved[`${task.id}:${task.dueDate}`]?.completed_at
      ? { ...task, status: 'done' as const }
      : task
  );
  const open = tasks.filter(
    (t) => t.status === 'open' || t.status === 'overdue'
  );
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-foreground">
          DSO &amp; Compliance Tasks
        </p>
        <span className="text-xs text-muted-foreground">
          {open.length} open · {done.length} done
        </span>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        Review dates with your DSO. A past date does not mean you missed a
        report. Confirm a task below to save it in your notice organizer;
        completion and reminder changes stay connected. Changes to the source
        dates create a new task to review, never silently change a saved
        deadline.
      </p>
      <div className="space-y-2">
        {error && (
          <p role="status" className="text-xs text-muted-foreground">
            {error}
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={`${task.id}:${task.dueDate}`}
            className={cn(
              'flex flex-wrap items-start gap-3 p-3 rounded-lg border text-sm transition-colors',
              task.status === 'overdue' &&
                'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
              task.status === 'open' &&
                'bg-white dark:bg-gray-900/30 border-gray-200 dark:border-gray-800',
              task.status === 'done' &&
                'bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800 opacity-70'
            )}
          >
            {STATUS_ICON[task.status]}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium leading-tight',
                  task.status === 'done' && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {task.description}
              </p>
              <a
                href={task.sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex min-h-11 items-center text-xs font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
              >
                Official guidance
              </a>
              {task.dueDate && task.status !== 'done' && (
                <button
                  type="button"
                  className="ml-3 min-h-11 text-xs font-semibold text-blue-600 underline focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
                  onClick={() =>
                    downloadDeadlineCalendar(
                      task.title,
                      task.dueDate!,
                      `${task.id}-${task.dueDate}`
                    )
                  }
                >
                  Add to calendar
                </button>
              )}
              {caseId && task.dueDate && (
                <JourneyTaskActions
                  caseId={caseId}
                  task={task}
                  isPro={isPro}
                  onNotice={onNotice}
                  notice={saved[`${task.id}:${task.dueDate}`] ?? null}
                  ready={ready}
                />
              )}
            </div>
            <div className="ml-7 w-full flex-shrink-0 sm:ml-0 sm:w-auto sm:text-right">
              {task.dueDate && task.status !== 'done' && (
                <p
                  className={cn(
                    'text-xs font-semibold',
                    task.status === 'overdue'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  )}
                >
                  Due {formatDisplayDateNoon(task.dueDate)}
                </p>
              )}
              {task.status === 'done' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {STATUS_LABEL[task.status]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
