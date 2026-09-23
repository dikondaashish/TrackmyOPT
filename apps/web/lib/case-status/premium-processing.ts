import type { CaseStatusHistoryEntry } from '@/lib/case-status/normalize-status-history';
import { normalizeStatusHistory } from '@/lib/case-status/normalize-status-history';
import { parseValidDate } from '@/lib/case-status/safe-dates';
import {
  addBusinessDays,
  businessDaysBetween,
  formatIsoDate,
  parseBusinessDate,
} from '@/lib/case-status/business-days';

/** Current Form I-765 premium-processing timeframe after prerequisites are met. */
export const PP_BUSINESS_DAY_LIMIT = 30;

export const PP_CONTACT = {
  phone: '800-375-5283',
  phoneDisplay: '(800) 375-5283',
  guidance:
    'Call the USCIS Contact Center and ask for Premium Processing follow-up on your I-765. Have your receipt number ready.',
  hours: 'Mon–Fri, 8am–8pm ET (automated info available 24/7)',
} as const;

type PpClock = {
  ppStart: string;
  deadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  daysOverdue: number;
};

function isPremiumProcessingText(text: string): boolean {
  const s = text.trim().toLowerCase().replace(/-/g, ' ');
  return (
    s.includes('premium processing') ||
    s.includes('changed to premium') ||
    s.includes('upgraded to premium')
  );
}

function historyEntries(
  history: CaseStatusHistoryEntry[] | unknown
): CaseStatusHistoryEntry[] {
  return normalizeStatusHistory(history);
}

type PpInput = {
  statusHistory: CaseStatusHistoryEntry[] | unknown;
  currentStatus?: string | null;
  currentDescription?: string | null;
  manualPpStart?: string | null;
  now?: Date;
};

/** Require an explicit year and round-trip calendar fields; Date.parse rolls Feb 30 over. */
function confirmedDate(
  value: string | null | undefined,
  now: Date
): string | null {
  const text = value?.trim();
  if (!text || !Number.isFinite(now.getTime())) return null;
  let iso: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) iso = text;
  else {
    const match = text.match(/^([A-Za-z]+)\s*(\d{1,2}),?\s+(\d{4})$/);
    if (!match) return null;
    const month = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ].findIndex(
      (m) =>
        m === match[1].toLowerCase() || m.slice(0, 3) === match[1].toLowerCase()
    );
    if (month < 0) return null;
    iso = `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`;
  }
  return parseValidDate(iso) && iso <= formatIsoDate(now) ? iso : null;
}

function startEvidence(
  entry: CaseStatusHistoryEntry,
  now: Date
): string | null {
  const explicit = entry.description?.match(
    /premium[ -]processing clock (?:was )?(?:started|restarted) on\s+([^.!\n]+)/i
  );
  if (explicit) return confirmedDate(explicit[1], now);
  return /premium[ -]processing clock (?:was )?(?:started|restarted)/i.test(
    entry.status
  )
    ? confirmedDate(entry.date, now)
    : null;
}

export function detectPpStart(input: PpInput): string | null {
  const now = input.now ?? new Date();
  const starts = historyEntries(input.statusHistory)
    .map((e) => startEvidence(e, now))
    .filter((s): s is string => Boolean(s))
    .sort();
  const current = startEvidence(
    {
      status: input.currentStatus ?? '',
      description: input.currentDescription ?? '',
      date: '',
    },
    now
  );
  return current ?? starts[0] ?? confirmedDate(input.manualPpStart, now);
}

const terminal = (status: string) =>
  /\b(?:approved|denied|rejected|withdrawn|closed)\b|card.*(?:produc|mail|deliver)/i.test(
    status
  );
const responseReceived = (status: string) =>
  /response.*(?:evidence|intent to deny).*receiv/i.test(status);
const stopped = (status: string) =>
  !responseReceived(status) &&
  /request for (?:(?:additional|initial) )?evidence|notice of intent to deny|premium.*clock.*stop/i.test(
    status
  );

export function resolvePpClockState(input: PpInput): {
  status: 'inactive' | 'unknown' | 'active' | 'stopped' | 'completed';
  clock: PpClock | null;
} {
  const now = input.now ?? new Date();
  const entries = historyEntries(input.statusHistory);
  const current = input.currentStatus ?? '';
  const enrolled =
    Boolean(input.manualPpStart) ||
    isPremiumProcessingText(current) ||
    entries.some((e) =>
      isPremiumProcessingText(`${e.status} ${e.description ?? ''}`)
    );
  if (!enrolled) return { status: 'inactive', clock: null };
  if (terminal(current) || entries.some((e) => terminal(e.status)))
    return { status: 'completed', clock: null };
  if (stopped(current)) return { status: 'stopped', clock: null };
  const stops = entries.filter((e) => stopped(e.status));
  const stopDates = stops.map((e) => confirmedDate(e.date, now));
  // An undated stop cannot safely be placed before a restart.
  if (stopDates.some((d) => !d)) return { status: 'unknown', clock: null };
  const lastStop = stopDates
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
  const restarts = entries
    .filter((e) => responseReceived(e.status))
    .map((e) => confirmedDate(e.date, now))
    .filter((d): d is string => Boolean(d));
  const explicitStarts = entries
    .map((e) => startEvidence(e, now))
    .filter((d): d is string => Boolean(d));
  const restart = [...restarts, ...explicitStarts]
    .filter((d) => lastStop && d > lastStop)
    .sort()
    .at(-1);
  if (lastStop && !restart) return { status: 'stopped', clock: null };
  if (responseReceived(current) && !restarts.length)
    return { status: 'unknown', clock: null };
  const start = restart ?? detectPpStart(input);
  return start
    ? { status: 'active', clock: getPpClock(start, now) }
    : { status: 'unknown', clock: null };
}

export function isPremiumProcessingActive(input: PpInput): boolean {
  return resolvePpClockState(input).status === 'active';
}

export function getPpClock(ppStartIso: string, now = new Date()): PpClock {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(ppStartIso) ||
    !parseValidDate(ppStartIso) ||
    !Number.isFinite(now.getTime())
  ) {
    throw new RangeError('Invalid premium processing date');
  }
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
    isOverdue: daysOverdue > 0,
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
  return detectPpStart({
    statusHistory,
    currentStatus,
    manualPpStart: existingManual,
  });
}
