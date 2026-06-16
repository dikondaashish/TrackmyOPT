import {
  formatStatusLabel,
  formatUscisStatusDate,
} from "@/lib/case-status/case-status-display";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";
import {
  normalizeStatusCompareText,
  sanitizeUscisDescription,
} from "@/lib/case-status/uscis-status-text";

export type CurrentStatusDetail = {
  title: string;
  description: string | null;
  date: string | null;
};

export function getCurrentStatusDetail({
  currentStatus,
  statusHistory,
  lastStatusChangeAt,
}: {
  currentStatus: string | null | undefined;
  statusHistory: CaseStatusHistoryEntry[];
  lastStatusChangeAt?: string | null;
}): CurrentStatusDetail {
  const title = formatStatusLabel(currentStatus, "Pending");
  const latest = statusHistory[0];

  if (latest) {
    const resolvedTitle = formatStatusLabel(currentStatus ?? latest.status, latest.status);
    const rawDescription = latest.description?.trim() || null;
    const description =
      rawDescription &&
      normalizeStatusCompareText(rawDescription) !== normalizeStatusCompareText(latest.status)
        ? sanitizeUscisDescription(rawDescription)
        : null;

    return {
      title: resolvedTitle,
      description: description || null,
      date:
        formatUscisStatusDate(latest.date) ??
        formatUscisStatusDate(lastStatusChangeAt),
    };
  }

  return {
    title,
    description: null,
    date: formatUscisStatusDate(lastStatusChangeAt),
  };
}
