'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';

export function DocumentReminderEmail() {
  const [email, setEmail] = useState('');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/user/notification-email', { signal: controller.signal });
        if (!res.ok) throw new Error('Could not load your reminder email.');
        const data = await res.json();
        setEmail(data.email || '');
        setDraft(data.email || '');
        setEditing(!data.email);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load your reminder email.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: draft.trim(), toolType: 'documents' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save your reminder email. Please try again.');
      setEmail(data.email || draft.trim());
      setDraft(data.email || draft.trim());
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your reminder email. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-label="Expiry reminders" className="bg-white dark:bg-card rounded-lg p-3 border border-gray-200 dark:border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:flex sm:flex-wrap sm:gap-x-4">
        <h2 className="min-w-0 col-start-1 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
          <Mail className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
          Expiry Reminder Email
        </h2>
        {!editing && (
          <>
            <p className="col-start-1 row-start-2 min-w-0 sm:flex-1 break-all text-sm text-gray-600 dark:text-muted-foreground">
              {loading ? 'Loading…' : email}
            </p>
            {!loading && email && <button onClick={() => { setEditing(true); setSaved(false); setError(''); }} className="col-start-2 row-start-1 row-span-2 min-h-11 px-2 text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>}
          </>
        )}
      </div>
      {editing && (
        <form onSubmit={save} className="mt-2 flex flex-wrap gap-2">
          <label htmlFor="vault-reminder-email" className="sr-only">Reminder email address</label>
          <input id="vault-reminder-email" type="email" required maxLength={254} autoComplete="email" value={draft} onChange={e => setDraft(e.target.value)} disabled={saving} aria-describedby="vault-reminder-hint" placeholder="Enter email for document reminders" className="min-h-11 min-w-0 basis-full sm:basis-auto flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-muted dark:text-foreground" />
          <button type="submit" disabled={saving || !draft.trim()} className="min-h-11 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium">{saving ? 'Saving…' : 'Save'}</button>
          {email && <button type="button" disabled={saving} onClick={() => { setDraft(email); setEditing(false); setError(''); }} className="min-h-11 px-4 py-2 border border-gray-300 dark:border-border text-gray-700 dark:text-foreground text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors">Cancel</button>}
        </form>
      )}
      <p id="vault-reminder-hint" className="mt-1 text-xs text-gray-500 dark:text-muted-foreground">Get email reminders before your documents expire.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error} {!editing && <button onClick={() => setAttempt(value => value + 1)} className="min-h-11 px-2 font-medium underline">Retry</button>}</p>}
      {saved && <p role="status" className="mt-2 text-xs text-gray-600 dark:text-muted-foreground">Reminder email saved.</p>}
    </section>
  );
}
