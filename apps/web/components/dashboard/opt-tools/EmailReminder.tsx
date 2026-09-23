'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import {
  panelClass,
  toolButtonClass,
  toolThemes,
  type ToolSlug,
} from './tool-config';

export function EmailReminder({
  toolType,
  isPremium,
  onUpgradeClick,
}: {
  toolType: ToolSlug;
  isPremium: boolean;
  onUpgradeClick?: () => void;
}) {
  const id = useId();
  const buttonClass = toolButtonClass(toolType);
  const theme = toolThemes[toolType];
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);
  const key = toolType.replace('-', '_');
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/user/tool-email', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error();
        const body = await res.json();
        if (!cancelled) {
          const value = body.emails?.[key] || '';
          setEmail(value);
          setSaved(value);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);
  async function save(value: string) {
    if (lock.current || loading || loadError) return;
    lock.current = true;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: key, email: value }),
      });
      const body = await res.json();
      if (!res.ok || body.ok === false) throw new Error();
      setSaved(value);
      setEmail(value);
      setMessage(value ? 'Reminder preference saved.' : 'Reminders stopped.');
    } catch {
      setMessage('Could not update reminders. Please try again.');
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return (
    <section className={panelClass} aria-label="Email reminders">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${theme.surface} ${theme.text}`}
        >
          <Bell aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-semibold">Email reminders</h3>
          <p className="text-sm text-muted-foreground">
            Use your saved dates · Pro feature
          </p>
        </div>
      </div>
      {!isPremium ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Optional reminders, without changing your calculator.
          </p>
          {onUpgradeClick ? (
            <button
              type="button"
              className={buttonClass}
              onClick={onUpgradeClick}
            >
              View Pro plans
            </button>
          ) : (
            <Link href="/pricing" className={buttonClass}>
              View Pro plans
            </Link>
          )}
        </div>
      ) : loading ? (
        <p role="status" className="mt-3 text-muted-foreground">
          Loading reminder preferences…
        </p>
      ) : loadError ? (
        <div
          role="alert"
          className="mt-3 text-sm text-red-700 dark:text-red-300"
        >
          Could not load your reminder settings.{' '}
          <button
            type="button"
            className="min-h-11 px-2 underline"
            onClick={() => {
              setLoading(true);
              setLoadError(false);
              setAttempt((value) => value + 1);
            }}
          >
            Retry reminders
          </button>
        </div>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save(email.trim());
          }}
        >
          <label htmlFor={id} className="block text-sm font-medium">
            Reminder email
          </label>
          <input
            id={id}
            type="email"
            required
            autoComplete="email"
            value={email}
            disabled={saving}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            placeholder="you@example.com"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || !email.trim() || email.trim() === saved}
              className={buttonClass}
            >
              {saving ? 'Saving…' : 'Save reminder'}
            </button>
            {saved && (
              <button
                type="button"
                disabled={saving}
                className="min-h-11 px-3 text-sm font-medium text-red-700 underline focus-visible:ring-2 dark:text-red-300"
                onClick={() => save('')}
              >
                Stop reminders
              </button>
            )}
            <span className="text-sm text-muted-foreground">
              {saved ? 'Enabled' : 'Not enabled'}
            </span>
          </div>
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
