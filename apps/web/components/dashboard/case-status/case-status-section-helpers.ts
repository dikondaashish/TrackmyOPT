import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

export const PACKAGING_NOTICE_DISMISS_KEY = "tmo_packaging_notice_dismissed_v1";

export interface CaseStatus {
  id: string;
  receipt_number: string;
  current_status: string | null;
  case_type: string | null;
  received_date: string | null;
  pp_start_date?: string | null;
  last_checked_at: string | null;
  last_status_change_at: string | null;
  last_status_viewed_at?: string | null;
  status_last_changed_at?: string | null;
  last_change_alert_suppressed?: boolean;
  status_history: CaseStatusHistoryEntry[];
  change_log: Array<{
    date: string;
    old_status: string;
    new_status: string;
  }>;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  // ISS-012: failure-state surfaces
  last_check_failed_at?: string | null;
  last_check_error_code?: string | null;
  last_check_error_message?: string | null;
  consecutive_failures?: number;
  is_primary?: boolean;
  label?: string | null;
  filing_category?: string | null;
  filing_category_confirmed_at?: string | null;
}

/** Prefer preferredId, then primaryCaseId, then is_primary flag, then first case. */
export function selectActiveCase<T extends { id: string; is_primary?: boolean }>(
  cases: T[],
  preferredId?: string | null,
  primaryCaseId?: string | null
): T {
  const activeId =
    (preferredId && cases.find((c) => c.id === preferredId)?.id) ||
    (primaryCaseId && cases.find((c) => c.id === primaryCaseId)?.id) ||
    cases.find((c) => c.is_primary)?.id ||
    cases[0].id;
  return cases.find((c) => c.id === activeId) ?? cases[0];
}

export function findRfeDate(
  history: Array<{ status?: string; date?: string }>
): string | null {
  const rfe = history.find(
    (e) =>
      typeof e.status === "string" &&
      e.status.toLowerCase().includes("request for evidence")
  );
  return rfe?.date ?? null;
}
