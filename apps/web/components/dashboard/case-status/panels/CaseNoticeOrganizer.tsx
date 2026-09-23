'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import type { CaseNotice } from '@/lib/case-status/notices';
import { downloadDeadlineCalendar } from '@/lib/case-status/calendar';
import { formatDisplayDateNoon } from '@/lib/case-status/safe-dates';

import { CaseNoticeForm } from './CaseNoticeForm';
const action =
  'inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-blue-600 hover:bg-muted focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 disabled:opacity-50';
const REMINDER_LABELS = {
  off: 'Email reminder off',
  pending: 'Email reminder queued',
  sending: 'Email handoff in progress',
  sent: 'Accepted by email provider, inbox delivery unconfirmed',
  failed: 'Email could not be confirmed. Use your calendar.',
  cancelled: 'Reminder cancelled',
};

export function CaseNoticeOrganizer({
  caseId,
  isPro,
}: {
  caseId: string;
  isPro: boolean;
}) {
  const prefix = useId();
  const [notices, setNotices] = useState<CaseNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CaseNotice | null>(null);
  const [documentId, setDocumentId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<
    Array<{ id: string; filename: string }>
  >([]);
  const [documentsError, setDocumentsError] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/case-status/notices?case_id=${encodeURIComponent(caseId)}`, {
      signal: abort.signal,
      credentials: 'include',
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Could not load notices');
        return body;
      })
      .then((body) => {
        if (!abort.signal.aborted) setNotices(body.notices ?? []);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [caseId, revision]);
  useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    fetch('/api/documents', { signal: abort.signal, credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => {
        if (!abort.signal.aborted) setDocuments(body.documents ?? []);
      })
      .catch(() => {
        if (!abort.signal.aborted) setDocumentsError(true);
      });
    return () => abort.abort();
  }, [open]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/case-status/notices', {
        method: editing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          case_id: caseId,
          title: values.get('title'),
          kind: values.get('kind'),
          document_id: values.get('document_id') || null,
          due_date: values.get('due_date') || null,
          deadline_confirmed: values.get('confirmed') === 'on',
          email_reminder: values.get('reminder') === 'on',
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not save notice');
      form.reset();
      setOpen(false);
      setEditing(null);
      setLoading(true);
      setRevision((r) => r + 1);
      setMessage('Notice saved for this case.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save notice');
    } finally {
      setBusy(false);
    }
  }
  async function complete(id: string) {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/case-status/notices', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, case_id: caseId, complete: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not complete notice');
      setRevision((r) => r + 1);
      setMessage('Marked complete. Any unsent reminder is cancelled.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not update');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-labelledby={`${prefix}-heading`}
      className="rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${prefix}-heading`} className="text-base font-semibold">
          Notices &amp; confirmed deadlines
        </h2>
        <button
          type="button"
          className={action}
          disabled={loading || !!error || busy}
          onClick={() => {
            setDocumentsError(false);
            setEditing(null);
            setDocumentId('');
            setOpen(!open);
          }}
          aria-expanded={open}
        >
          {open ? 'Cancel' : 'Add notice'}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Keep receipt, RFE and DSO tasks with this case. Copy deadlines from the
        official notice or confirm them with your DSO.
      </p>
      {loading && (
        <p role="status" className="mt-3 text-sm">
          Loading notices…
        </p>
      )}
      {error && (
        <div role="alert" className="mt-3 text-sm">
          {error}{' '}
          <button
            type="button"
            className={action}
            onClick={() => {
              setLoading(true);
              setError('');
              setRevision((r) => r + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      {!loading && !error && notices.length === 0 && !open && (
        <p className="mt-4 text-sm text-muted-foreground">
          No notices saved for this case yet.
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      )}
      {open && (
        <CaseNoticeForm
          key={editing?.id ?? 'new'}
          prefix={prefix}
          editing={editing}
          documents={documents}
          documentsError={documentsError}
          busy={busy}
          isPro={isPro}
          save={save}
          documentId={documentId}
          setDocumentId={setDocumentId}
        />
      )}
      <ul className="mt-3 divide-y divide-border">
        {notices.map((n) => (
          <li key={n.id} className="py-3 ph-mask" data-ph-mask>
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="text-sm font-medium">{n.title}</h3>
              <span className="text-xs text-muted-foreground">
                {n.completed_at
                  ? 'Completed'
                  : n.due_date
                    ? `Due ${formatDisplayDateNoon(n.due_date)}`
                    : 'No deadline'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {REMINDER_LABELS[n.reminder_state]}
              {n.document_id ? ' · Document attached in your vault' : ''}
            </p>
            <div className="flex flex-wrap gap-1">
              {!n.completed_at && (
                <button
                  className={action}
                  type="button"
                  disabled={busy || n.reminder_state === 'sending'}
                  onClick={() => {
                    setDocumentsError(false);
                    setEditing(n);
                    setDocumentId(n.document_id ?? '');
                    setMessage('');
                    setOpen(true);
                  }}
                >
                  Edit notice
                </button>
              )}
              {n.due_date && !n.completed_at && (
                <button
                  className={action}
                  type="button"
                  onClick={() =>
                    downloadDeadlineCalendar(n.title, n.due_date!, n.id)
                  }
                >
                  Add to calendar
                </button>
              )}
              {n.document_id && (
                <Link href="/dashboard/documents" className={action}>
                  Open document vault
                </Link>
              )}
              {!n.completed_at && (
                <button
                  className={action}
                  type="button"
                  disabled={busy || n.reminder_state === 'sending'}
                  onClick={() => void complete(n.id)}
                >
                  Mark complete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
