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

/** Whole days since a date string (non-negative). */
export function daysSinceNow(
  value: string | null | undefined,
  nowMs: number = Date.now()
): number {
  return daysSinceEpochMs(value, nowMs);
}

/** Parse YYYY-MM-DD at noon local-safe, or fall back to ISO parse. */
export function parseDateOnlyAtNoon(value: string | null | undefined): Date | null {
  if (value == null || !String(value).trim()) return null;
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parseValidDate(`${trimmed}T12:00:00`);
  }
  return parseValidDate(trimmed);
}

/** Business days elapsed after a deadline (0 when not overdue). */
export function countBusinessDaysOverdue(
  deadlineIso: string | null | undefined,
  nowMs: number = Date.now()
): number {
  const deadline = parseValidDate(deadlineIso);
  if (!deadline || !Number.isFinite(nowMs)) return 0;
  const now = new Date(nowMs);
  if (now <= deadline) return 0;
  let count = 0;
  const cur = new Date(deadline);
  cur.setDate(cur.getDate() + 1);
  while (cur <= now) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function isDateBeforeMs(
  iso: string | null | undefined,
  nowMs: number
): boolean {
  const d = parseValidDate(iso);
  if (!d || !Number.isFinite(nowMs)) return false;
  return d.getTime() < nowMs;
}

/** Safe short date for UI (invalid → em dash). */
export function formatDisplayDateShort(
  value: string | null | undefined
): string {
  const date = parseValidDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Safe date+time for UI (invalid → em dash). */
export function formatDisplayDateTime(
  value: string | null | undefined
): string {
  const date = parseValidDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Safe long date for UI (invalid → em dash). */
export function formatDisplayDateLong(
  value: string | null | undefined
): string {
  const date = parseValidDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Safe month+year for UI (invalid → em dash). */
export function formatDisplayMonthYear(
  value: string | null | undefined
): string {
  const date = parseValidDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Safe date-only display at noon (invalid → em dash). */
export function formatDisplayDateNoon(
  value: string | null | undefined
): string {
  const date = parseDateOnlyAtNoon(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Month + day only (invalid → empty string). */
export function formatDisplayDateMonthDay(
  value: string | null | undefined
): string {
  const date = parseValidDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Add calendar months; returns ISO or null. */
export function addMonthsIso(
  value: string | null | undefined,
  months: number
): string | null {
  const base = parseValidDate(value);
  if (!base) return null;
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return Number.isFinite(next.getTime()) ? next.toISOString() : null;
}

/** Start of local calendar day for a given epoch ms. */
export function startOfLocalDayMs(nowMs: number): number {
  if (!Number.isFinite(nowMs)) return 0;
  const d = new Date(nowMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Relative past time: "just now", "5 min ago", etc. */
export function formatRelativePast(
  iso: string | null | undefined,
  nowMs: number = Date.now()
): string {
  const base = parseValidDate(iso);
  if (!base || !Number.isFinite(nowMs)) return "—";
  const diff = nowMs - base.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDisplayDateShort(iso);
}

/** Countdown until a future instant: "2h 05m", "soon", etc. */
export function formatUntilFuture(
  iso: string | null | undefined,
  nowMs: number = Date.now()
): string {
  const base = parseValidDate(iso);
  if (!base || !Number.isFinite(nowMs)) return "—";
  const diff = base.getTime() - nowMs;
  if (diff <= 0) return "soon";
  const hrs = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, "0")}m`;
  return `${mins}m`;
}

/** Checked-at stamp for monitor strip. */
export function formatCheckedAt(
  iso: string | null | undefined
): string {
  const date = parseValidDate(iso);
  if (!date) return "—";
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " @ " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}
