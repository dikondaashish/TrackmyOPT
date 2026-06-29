/**
 * useClientDate — returns the current Date only after hydration.
 *
 * On the server (and during the first client render that React uses to
 * reconcile with the server HTML) this returns `null`.  After mount the real
 * current date is set, keeping the server/client HTML identical and
 * eliminating hydration error #418.
 *
 * Usage:
 *   const now = useClientDate();
 *   const daysLeft = now ? Math.ceil((expiry - now) / DAY_MS) : null;
 *   if (daysLeft === null) return <Skeleton />;
 */

"use client";

import { useState, useEffect } from "react";

export function useClientDate(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  return now;
}

/**
 * useClientYear — returns the current full year (e.g. 2026) after hydration.
 * Returns null during SSR / initial hydration so the server HTML is stable.
 */
export function useClientYear(): number | null {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
}
