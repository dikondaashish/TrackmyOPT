'use client';
import Link from 'next/link';
import type { CaseNotice } from '@/lib/case-status/notices';
const control =
  'w-full rounded-lg border border-border bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const action =
  'inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-blue-600 hover:bg-muted focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 disabled:opacity-50';
export function CaseNoticeForm({
  prefix,
  editing,
  documents,
  documentsError,
  busy,
  isPro,
  save,
  documentId,
  setDocumentId,
}: {
  prefix: string;
  editing: CaseNotice | null;
  documents: Array<{ id: string; filename: string }>;
  documentsError: boolean;
  busy: boolean;
  isPro: boolean;
  save: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  documentId: string;
  setDocumentId: (value: string) => void;
}) {
  return (
    <form
      key={editing?.id ?? 'new'}
      onSubmit={save}
      className="mt-4 space-y-3 border-t border-border pt-4"
    >
      <div>
        <label htmlFor={`${prefix}-title`} className="text-sm font-medium">
          Notice or task title
        </label>
        <input
          id={`${prefix}-title`}
          name="title"
          defaultValue={editing?.title ?? ''}
          required
          maxLength={120}
          className={control}
          placeholder="Response to evidence request"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-kind`} className="text-sm font-medium">
            Type
          </label>
          <select
            id={`${prefix}-kind`}
            name="kind"
            className={control}
            defaultValue={editing?.kind ?? 'receipt'}
          >
            <option value="receipt">Receipt</option>
            <option value="rfe">Request for evidence</option>
            <option value="noid">Notice of intent to deny</option>
            <option value="approval">Approval</option>
            <option value="dso">DSO task</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-date`} className="text-sm font-medium">
            Exact deadline (optional)
          </label>
          <input
            id={`${prefix}-date`}
            name="due_date"
            type="date"
            defaultValue={editing?.due_date ?? ''}
            className={control}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${prefix}-doc`} className="text-sm font-medium">
          Attach a document from your vault (optional)
        </label>
        <select
          id={`${prefix}-doc`}
          name="document_id"
          className={control}
          value={documentId}
          onChange={(event) => setDocumentId(event.target.value)}
        >
          <option value="">No document attached</option>
          {documentId && !documents.some((d) => d.id === documentId) && (
            <option value={documentId}>Previously attached document</option>
          )}
          {documents.map((d) => (
            <option value={d.id} key={d.id}>
              {d.filename}
            </option>
          ))}
        </select>
        <Link href="/dashboard/documents" className={action}>
          Upload or review documents
        </Link>
        {documentsError && (
          <p role="status" className="text-xs">
            Documents could not load. You can still save a deadline without an
            attachment.
          </p>
        )}
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input name="confirmed" type="checkbox" />I verified this deadline
        against my notice or with my DSO.
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          name="reminder"
          type="checkbox"
          disabled={!isPro}
          defaultChecked={isPro && !!editing?.email_reminder}
        />
        Email me 3 days before the deadline{!isPro && ' (Pro)'}
      </label>
      <p className="text-xs text-muted-foreground">
        Nearer deadlines are picked up by the next hourly run. Calendar alerts
        depend on your calendar settings. Do not rely on email alone for a legal
        deadline.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? 'Saving…' : editing ? 'Save changes' : 'Save notice'}
      </button>
    </form>
  );
}
