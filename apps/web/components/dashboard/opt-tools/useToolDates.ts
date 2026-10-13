'use client';

import { useEffect, useRef, useState } from 'react';
import type { ToolAudience } from './ToolUpgradePrompt';
import { isoToMMDDYYYY } from '@/lib/immigration/opt-calculations';
import {
  calendarDateISO,
  localTodayISO,
} from '@/lib/immigration/calendar-days';

export type ToolDates = Record<
  | 'program_end_date'
  | 'dso_recommendation_date'
  | 'opt_start_date'
  | 'opt_ead_end_date'
  | 'stem_start_date'
  | 'stem_dso_recommendation_date',
  string
>;
const EMPTY: ToolDates = {
  program_end_date: '',
  dso_recommendation_date: '',
  opt_start_date: '',
  opt_ead_end_date: '',
  stem_start_date: '',
  stem_dso_recommendation_date: '',
};

export function useToolDates() {
  const [dates, setDates] = useState<ToolDates>(EMPTY);
  const [saved, setSaved] = useState<ToolDates>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [premium, setPremium] = useState(false);
  const [premiumKnown, setPremiumKnown] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const version = useRef(0);
  const saveLock = useRef(false);
  // Static pages can outlive their build date. Keep SSR and the first browser
  // render identical, then calculate the visitor's local date after hydration.
  const [today, setToday] = useState('');

  useEffect(() => {
    const refresh = () => setToday(localTodayISO());
    refresh();
    const timer = setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const requestedVersion = version.current;
    void (async () => {
      let stage = 'network';
      let status: number | 'none' = 'none';
      try {
        const res = await fetch('/api/opt/calculator', {
          credentials: 'include',
          cache: 'no-store',
        });
        status = res.status;
        stage = 'http';
        if (res.status === 401) {
          if (!cancelled) setGuest(true);
          return;
        }
        if (res.status >= 400 && res.status < 500) {
          if (!cancelled) setLoadError(true);
          return;
        }
        if (!res.ok) throw new Error();
        stage = 'json';
        const body = await res.json();
        stage = 'payload';
        if (!body?.ok) throw new Error();
        stage = 'processing';
        if (!cancelled && version.current === requestedVersion) {
          const loaded = { ...EMPTY };
          for (const key of Object.keys(EMPTY) as (keyof ToolDates)[])
            loaded[key] = body.data?.[key] ? isoToMMDDYYYY(body.data[key]) : '';
          setDates(loaded);
          setSaved(loaded);
          setGuest(false);
        }
      } catch {
        if (!cancelled) {
          // Only fixed stages and the numeric HTTP status enter diagnostics.
          console.error(
            `OPT tools: failed to load saved dates (stage=${stage}, status=${status})`
          );
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    let planStage = 'network';
    let planStatus: number | 'none' = 'none';
    void fetch('/api/premium/status', { credentials: 'include' })
      .then(async (res) => {
        planStatus = res.status;
        planStage = 'http';
        if (cancelled || (res.status >= 400 && res.status < 500)) return;
        if (!res.ok) throw new Error();
        planStage = 'json';
        const body = await res.json();
        planStage = 'payload';
        if (body?.error && body.error !== 'Not authenticated')
          throw new Error();
        if (typeof body?.isPremium !== 'boolean') throw new Error();
        if (!cancelled) {
          setPremium(body.isPremium);
          setPremiumKnown(true);
        }
      })
      .catch(() => {
        if (!cancelled)
          console.error(
            `OPT tools: failed to load plan status (stage=${planStage}, status=${planStatus})`
          );
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function change(key: keyof ToolDates, value: string) {
    version.current++;
    setDates((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setSaveError('');
  }
  async function save(keys: (keyof ToolDates)[]) {
    if (saveLock.current || guest || loadError || loading) return;
    if (keys.some((key) => dates[key].trim() && !calendarDateISO(dates[key])))
      return;
    const submitted = { ...dates };
    const submittedVersion = version.current;
    // Only changed fields are sent, so another tool's saved dates aren't replayed.
    const patch = Object.fromEntries(
      keys
        .filter((key) => dates[key] !== saved[key])
        .map((key) => [
          key,
          dates[key].trim() ? isoToMMDDYYYY(dates[key].trim()) : null,
        ])
    );
    if (!Object.keys(patch).length) {
      setSuccess(true);
      return;
    }
    saveLock.current = true;
    setSaving(true);
    setSaveError('');
    setSuccess(false);
    let unexpectedFailure = true;
    try {
      const res = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      unexpectedFailure = !(res.status >= 400 && res.status < 500);
      const body = await res.json();
      if (!res.ok || !body.ok)
        throw new Error(
          res.status === 401
            ? 'Your session expired. Sign in again before saving.'
            : 'Could not save your dates. Your edits are still here; please try again.'
        );
      setSaved((prev) => ({
        ...prev,
        ...Object.fromEntries(keys.map((key) => [key, submitted[key]])),
      }));
      if (version.current === submittedVersion) setSuccess(true);
    } catch (error) {
      if (unexpectedFailure) console.error('OPT tools: failed to save dates');
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not save your dates. Please try again.'
      );
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }
  function retry() {
    setPremiumKnown(false);
    setLoading(true);
    setLoadError(false);
    setAttempt((value) => value + 1);
  }
  return {
    dates,
    saved,
    change,
    save,
    retry,
    loading,
    guest,
    loadError,
    saveError,
    saving,
    success,
    premium,
    audience: (loading || loadError || !premiumKnown
      ? 'unknown'
      : premium
        ? 'premium'
        : guest
          ? 'guest'
          : 'free') as ToolAudience,
    today,
  };
}
