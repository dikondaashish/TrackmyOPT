'use client';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
export function ProductEmailPreference({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/email/marketing-preferences', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          setError('Email preference unavailable. Try again later.');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted || data === null) return;
        if (typeof data.enabled !== 'boolean')
          throw new Error('Invalid preference');
        setEnabled(data.enabled);
        setReady(true);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        Sentry.captureException(
          new Error('Product email preference load failed')
        );
        setError('Email preference unavailable. Try again later.');
      });
    return () => controller.abort();
  }, []);
  async function changePreference() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/email/marketing-preferences', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (!res.ok) {
        setError('Couldn’t save your choice. Please try again.');
        return;
      }
      const data = await res.json();
      if (typeof data.enabled !== 'boolean')
        throw new Error('Invalid preference result');
      setEnabled(data.enabled);
    } catch {
      Sentry.captureException(
        new Error('Product email preference save failed')
      );
      setError('Couldn’t save your choice. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      className={
        compact
          ? 'rounded-xl border p-4'
          : 'rounded-lg bg-white p-4 dark:bg-gray-800'
      }
    >
      <label className="flex items-center justify-between gap-4">
        <span>
          <span className="block text-sm font-medium">Product emails</span>
          <span className="block text-xs text-muted-foreground">
            Optional monitoring tips and Pro offers. Unsubscribe anytime.
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={!ready || saving}
          onChange={() => void changePreference()}
          className="h-5 w-5 shrink-0 accent-blue-600"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
