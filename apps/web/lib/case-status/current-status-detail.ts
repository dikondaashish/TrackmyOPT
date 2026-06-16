import {
  formatStatusLabel,
  formatUscisStatusDate,
} from "@/lib/case-status/case-status-display";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

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
    const description =
      latest.description &&
      latest.description.trim() &&
      latest.description.trim() !== latest.status
        ? latest.description.trim()
        : null;

    return {
      title: resolvedTitle,
      description,
      date: latest.date || formatUscisStatusDate(lastStatusChangeAt),
    };
  }

  return {
    title,
    description: null,
    date: formatUscisStatusDate(lastStatusChangeAt),
  };
}
