'use client';
import { useEffect, useState } from 'react';
export function WeeklyDigestSettings({ isPro }: { isPro: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/case-status/digest-preferences', {
      credentials: 'include',
      signal: abort.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => {
        if (!abort.signal.aborted) {
          setEnabled(body.enabled);
          setReady(true);
          if (body.delivery)
            setMessage(
              `Last weekly summary: ${body.delivery.state === 'sent' ? 'accepted by email provider (inbox unconfirmed)' : body.delivery.state}.`
            );
        }
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setMessage(
            'Weekly summary settings could not load. Reload to retry.'
          );
      });
    return () => abort.abort();
  }, []);
  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch('/api/case-status/digest-preferences', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not save');
      setEnabled(body.enabled);
      setMessage(
        body.enabled
          ? 'Weekly summary enabled. Your global email opt-out still applies.'
          : 'Weekly summary off.'
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="mt-3 rounded-lg border border-border p-3 text-sm"
      aria-label="Weekly case summary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">Weekly summary</h3>
          <p className="text-xs text-muted-foreground">
            Your case checks and saved deadlines in one email. Opt-in only;
            separate from instant alerts.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Weekly case summary email"
          disabled={!ready || busy || (!isPro && !enabled)}
          onClick={() => void toggle()}
          className="min-h-11 rounded-lg border border-border px-4 font-medium text-blue-600 disabled:opacity-50 dark:text-blue-400"
        >
          {busy ? 'Saving…' : enabled ? 'On' : 'Off'}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        One summary per UTC week, starting Monday. New opt-ins are picked up
        hourly. {!isPro && 'Requires Pro.'}
      </p>
      {message && (
        <p role="status" className="mt-2 text-xs">
          {message}
        </p>
      )}
    </section>
  );
}
