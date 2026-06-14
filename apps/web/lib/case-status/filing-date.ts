import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a filing date string into `yyyy-mm-dd` for Postgres DATE, or null. */
export function normalizeFilingDateToIso(
  value: string | null | undefined
): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (ISO_DATE_RE.test(trimmed)) {
    const parsed = Date.parse(`${trimmed}T12:00:00`);
    return Number.isNaN(parsed) ? null : trimmed;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;

  const d = new Date(parsed);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function historyEntryTimestamp(entry: CaseStatusHistoryEntry): number | null {
  const ts = Date.parse(entry.date);
  return Number.isNaN(ts) ? null : ts;
}

function isReceivedStatus(status: string): boolean {
  return status.trim().toLowerCase().includes("received");
}

/**
 * Pick the earliest status-history entry that looks like a receipt / case received notice.
 */
export function deriveReceivedDateFromHistory(
  history: CaseStatusHistoryEntry[] | unknown
): string | null {
  if (!Array.isArray(history)) return null;

  let earliest: { iso: string; ts: number } | null = null;

  for (const item of history) {
    if (item == null || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const status =
      typeof record.status === "string"
        ? record.status
        : typeof record.completedText === "string"
          ? record.completedText
          : "";
    const date = typeof record.date === "string" ? record.date : "";
    if (!status || !date || !isReceivedStatus(status)) continue;

    const iso = normalizeFilingDateToIso(date);
    const ts = iso ? Date.parse(`${iso}T12:00:00`) : historyEntryTimestamp({
      status,
      date,
    });
    if (ts === null || !iso) continue;

    if (!earliest || ts < earliest.ts) {
      earliest = { iso, ts };
    }
  }

  return earliest?.iso ?? null;
}

/** Non-destructive resolve order for USCIS checks. */
export function resolveReceivedDate({
  uscisReceivedDate,
  statusHistory,
  existingReceivedDate,
}: {
  uscisReceivedDate: string | null | undefined;
  statusHistory: CaseStatusHistoryEntry[] | unknown;
  existingReceivedDate: string | null | undefined;
}): string | null {
  return (
    normalizeFilingDateToIso(uscisReceivedDate) ??
    deriveReceivedDateFromHistory(statusHistory) ??
    normalizeFilingDateToIso(existingReceivedDate)
  );
}
