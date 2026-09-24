'use client';
import { useState } from 'react';
import type { CaseNotice } from '@/lib/case-status/notices';
import type { OptComplianceAction } from '@/lib/case-status/opt-compliance-actions';

export const NOTICES_CHANGED = 'trackmyopt:case-notices-changed';
export function JourneyTaskActions({
  caseId,
  task,
  isPro,
  onNotice,
  notice,
  ready,
}: {
  caseId: string;
  task: OptComplianceAction;
  isPro: boolean;
  notice: CaseNotice | null;
  ready: boolean;
  onNotice: (key: string, notice: CaseNotice | null) => void;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const sourceKey = `${task.id}:${task.dueDate}`;
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/case-status/notices', {
        method: notice ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          notice
            ? { id: notice.id, case_id: caseId, complete: true }
            : {
                case_id: caseId,
                kind: 'dso',
                title: task.title,
                due_date: task.dueDate,
                source_key: sourceKey,
                deadline_confirmed: values.get('confirmed') === 'on',
                email_reminder: values.get('reminder') === 'on',
              }
        ),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not save task');
      onNotice(sourceKey, body.notice);
      setMessage(
        notice
          ? 'Completed; unsent reminder cancelled.'
          : 'Saved in your notice organizer.'
      );
      window.dispatchEvent(new Event(NOTICES_CHANGED));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }
  const future =
    task.dueDate && task.dueDate >= new Date().toISOString().slice(0, 10);
  return (
    <form onSubmit={save} className="mt-2 space-y-2 text-xs">
      {!notice && (
        <>
          <label className="flex min-h-8 items-center gap-2">
            <input type="checkbox" name="confirmed" required />I confirmed this
            deadline with my DSO
          </label>
          {isPro && future && (
            <label className="flex min-h-8 items-center gap-2">
              <input type="checkbox" name="reminder" />
              Email me near this deadline
            </label>
          )}
        </>
      )}
      {notice && (
        <p>
          {notice.completed_at
            ? 'Completed'
            : `Saved deadline: ${notice.due_date}`}{' '}
          · Reminder:{' '}
          {notice.reminder_state === 'sent'
            ? 'accepted by provider'
            : notice.reminder_state}
        </p>
      )}
      {!notice?.completed_at && (
        <button
          type="submit"
          className="min-h-11 font-semibold text-blue-600 underline disabled:opacity-50 dark:text-blue-400"
          disabled={!ready || busy || notice?.reminder_state === 'sending'}
        >
          {busy ? 'Saving…' : notice ? 'Mark completed' : 'Save confirmed task'}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
