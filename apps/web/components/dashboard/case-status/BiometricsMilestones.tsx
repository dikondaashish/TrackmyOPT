'use client';

import { useState, useId, useRef } from 'react';
import { CaseProgressStepper } from './CaseProgressStepper';
import { getBiometricsState } from '@/lib/case-status/i765-stepper';
import {
  calendarDateISO,
  localTodayISO,
} from '@/lib/immigration/calendar-days';
import type { CaseStatusHistoryEntry } from '@/lib/case-status/normalize-status-history';

export function BiometricsMilestones({
  caseId,
  currentStatus,
  history,
  attendedDate,
  onSaved,
}: {
  caseId: string;
  currentStatus: string | null;
  history: Array<Partial<CaseStatusHistoryEntry>>;
  attendedDate?: string | null;
  onSaved?: () => void;
}) {
  const [savedDate, setSavedDate] = useState(attendedDate ?? null);
  const [date, setDate] = useState(attendedDate ?? '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const inputId = useId();
  const official = getBiometricsState(currentStatus, history);
  const canConfirm = official === 'scheduled' || Boolean(savedDate);
  async function save(value: string | null) {
    if (lock.current) return;
    if (
      value !== null &&
      (!calendarDateISO(value) || value > localTodayISO())
    ) {
      setError('Enter the date you attended, today or earlier.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/case-status/biometrics', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, completed_date: value }),
      });
      const body = await response.json();
      if (!response.ok || body.ok !== true)
        throw new Error('Could not save your confirmation. Please try again.');
      setSavedDate(value);
      setDate(value ?? '');
      setEditing(false);
      onSaved?.();
    } catch {
      setError('Could not save your confirmation. Please try again.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <CaseProgressStepper
        currentStatus={currentStatus}
        statusHistory={history}
        userBiometricsDate={savedDate}
      />
      {canConfirm && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-sm">
          {savedDate && !editing ? (
            <>
              <p className="font-medium">
                Attendance confirmed by you: {savedDate}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(true)}
                  className="min-h-11 font-medium underline focus-visible:ring-2"
                >
                  Edit attendance date
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void save(null)}
                  className="min-h-11 underline focus-visible:ring-2"
                >
                  Undo confirmation
                </button>
              </div>
            </>
          ) : !editing ? (
            <>
              <p className="font-medium">
                Have you completed your biometrics appointment?
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-2 min-h-11 rounded-lg bg-blue-600 px-3 font-medium text-white hover:bg-blue-700 focus-visible:ring-2"
              >
                Yes, I attended
              </button>
              <p className="mt-1 text-xs text-muted-foreground">
                Not yet? Leave it as scheduled.
              </p>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void save(date);
              }}
              className="space-y-2"
            >
              <label htmlFor={inputId} className="block font-medium">
                Date you completed biometrics
              </label>
              <input
                id={inputId}
                type="date"
                required
                max={localTodayISO()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={busy}
                className="min-h-11 rounded-lg border border-input bg-background px-3 focus-visible:ring-2"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={busy || !date}
                  className="min-h-11 rounded-lg bg-blue-600 px-3 font-medium text-white disabled:opacity-50 focus-visible:ring-2"
                >
                  {busy ? 'Saving…' : 'Confirm attendance'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(false);
                    setDate(savedDate ?? '');
                    setError('');
                  }}
                  className="min-h-11 underline focus-visible:ring-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Your attendance record only. The official USCIS status stays
            unchanged; this does not confirm USCIS received or processed your
            biometrics.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  );
}
