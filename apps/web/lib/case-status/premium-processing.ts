import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";
import { normalizeFilingDateToIso } from "@/lib/case-status/filing-date";
import {
  addBusinessDays,
  businessDaysBetween,
  formatIsoDate,
  parseBusinessDate,
} from "@/lib/case-status/business-days";

export const PP_BUSINESS_DAY_LIMIT = 15;

export const PP_CONTACT = {
  phone: "800-375-5283",
  phoneDisplay: "(800) 375-5283",
  guidance:
    "Call the USCIS Contact Center and ask for Premium Processing follow-up on your I-765. Have your receipt number ready.",
  hours: "Mon–Fri, 8am–8pm ET (automated info available 24/7)",
} as const;

export type PpClock = {
  ppStart: string;
  deadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  daysOverdue: number;
};

function isPremiumProcessingText(text: string): boolean {
  const s = text.trim().toLowerCase();
  return (
    s.includes("premium processing") ||
    s.includes("changed to premium") ||
    s.includes("upgraded to premium")
  );
}

function historyEntries(
  history: CaseStatusHistoryEntry[] | unknown
): CaseStatusHistoryEntry[] {
  if (!Array.isArray(history)) return [];
  return history.filter(
    (e): e is CaseStatusHistoryEntry =>
      e != null && typeof e === "object" && typeof (e as CaseStatusHistoryEntry).date === "string"
  );
}

/** Earliest PP-related date from USCIS status history (does not use manual override). */
export function detectPpStartFromHistory(
  history: CaseStatusHistoryEntry[] | unknown,
  currentStatus?: string | null
): string | null {
  let earliest: { iso: string; ts: number } | null = null;

  for (const entry of historyEntries(history)) {
    const text = `${entry.status} ${entry.description ?? ""}`;
    if (!isPremiumProcessingText(text)) continue;
    const iso = normalizeFilingDateToIso(entry.date);
    if (!iso) continue;
    const ts = Date.parse(`${iso}T12:00:00`);
    if (Number.isNaN(ts)) continue;
    if (!earliest || ts < earliest.ts) earliest = { iso, ts };
  }

  if (earliest) return earliest.iso;

  if (currentStatus && isPremiumProcessingText(currentStatus)) {
    return null;
  }

  return null;
}

export function detectPpStart({
  statusHistory,
  currentStatus,
  manualPpStart,
}: {
  statusHistory: CaseStatusHistoryEntry[] | unknown;
  currentStatus?: string | null;
  manualPpStart?: string | null;
}): string | null {
  const manual = normalizeFilingDateToIso(manualPpStart);
  if (manual) return manual;
  return detectPpStartFromHistory(statusHistory, currentStatus);
}

export function isPremiumProcessingActive({
  statusHistory,
  currentStatus,
  manualPpStart,
}: {
  statusHistory: CaseStatusHistoryEntry[] | unknown;
  currentStatus?: string | null;
  manualPpStart?: string | null;
}): boolean {
  if (detectPpStart({ statusHistory, currentStatus, manualPpStart })) return true;
  if (currentStatus && isPremiumProcessingText(currentStatus)) return true;
  return historyEntries(statusHistory).some((e) =>
    isPremiumProcessingText(`${e.status} ${e.description ?? ""}`)
  );
}

export function getPpClock(ppStartIso: string, now = new Date()): PpClock {
  const start = parseBusinessDate(ppStartIso);
  const deadline = addBusinessDays(start, PP_BUSINESS_DAY_LIMIT);
  const deadlineIso = formatIsoDate(deadline);
  const today = parseBusinessDate(formatIsoDate(now));

  if (today <= deadline) {
    const daysRemaining = businessDaysBetween(today, deadline);
    return {
      ppStart: ppStartIso,
      deadline: deadlineIso,
      daysRemaining,
      isOverdue: false,
      daysOverdue: 0,
    };
  }

  const daysOverdue = businessDaysBetween(deadline, today);
  return {
    ppStart: ppStartIso,
    deadline: deadlineIso,
    daysRemaining: 0,
    isOverdue: true,
    daysOverdue,
  };
}

export function resolvePpStartDateForStorage({
  existingManual,
  statusHistory,
  currentStatus,
}: {
  existingManual?: string | null;
  statusHistory: CaseStatusHistoryEntry[] | unknown;
  currentStatus?: string | null;
}): string | null {
  const manual = normalizeFilingDateToIso(existingManual);
  if (manual) return manual;
  return detectPpStartFromHistory(statusHistory, currentStatus);
}
