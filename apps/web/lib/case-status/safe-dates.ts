/** Parse user/DB date strings without throwing during render. */
export function parseValidDate(value: string | null | undefined): Date | null {
  if (value == null || !String(value).trim()) return null;
  const parsed = new Date(String(value).trim());
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

/** Add calendar days and return ISO string, or null when input is invalid. */
export function addDaysIso(
  value: string | null | undefined,
  days: number
): string | null {
  const base = parseValidDate(value);
  if (!base) return null;
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return Number.isFinite(next.getTime()) ? next.toISOString() : null;
}

/** Whole days between a date string and a known epoch ms (non-negative). */
export function daysSinceEpochMs(
  value: string | null | undefined,
  nowMs: number
): number {
  const base = parseValidDate(value);
  if (!base || !Number.isFinite(nowMs)) return 0;
  const diff = nowMs - base.getTime();
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.floor(diff / 86_400_000);
}
