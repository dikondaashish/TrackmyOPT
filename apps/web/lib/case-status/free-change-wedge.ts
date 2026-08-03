/**
 * Free-tier status change wedge — backend fields + client visibility helpers.
 */

/** Wedge copy and visibility only apply to changes within this window. */
export const STATUS_CHANGE_WEDGE_MAX_AGE_DAYS = 14;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getStatusChangeAgeDays(iso: string, now = new Date()): number | null {
  const changed = new Date(iso);
  const changedAt = changed.getTime();
  if (Number.isNaN(changedAt)) return null;
  return Math.max(0, Math.floor((now.getTime() - changedAt) / MS_PER_DAY));
}

export function isStatusChangeWithinWedgeWindow(
  iso: string,
  now = new Date()
): boolean {
  const days = getStatusChangeAgeDays(iso, now);
  return days !== null && days <= STATUS_CHANGE_WEDGE_MAX_AGE_DAYS;
}

type FreeChangeWedgeFields = {
  status_last_changed_at?: string | null;
  last_change_alert_suppressed?: boolean | null;
  last_status_viewed_at?: string | null;
};

export function applyFreeUserChangeWedgeToUpdate(
  updateData: Record<string, unknown>,
  options: {
    hasStatusChanged: boolean;
    isFirstCheck: boolean;
    isPremium: boolean;
  }
): void {
  if (options.isPremium || options.isFirstCheck || !options.hasStatusChanged) {
    return;
  }
  updateData.status_last_changed_at = new Date().toISOString();
  updateData.last_change_alert_suppressed = true;
}

export function shouldShowStatusChangeWedge(
  caseRow: FreeChangeWedgeFields | null | undefined,
  isPremium: boolean | null
): boolean {
  if (isPremium !== false || !caseRow) return false;
  if (!caseRow.last_change_alert_suppressed) return false;
  if (!caseRow.status_last_changed_at) return false;

  if (!isStatusChangeWithinWedgeWindow(caseRow.status_last_changed_at)) {
    return false;
  }

  const changedAt = new Date(caseRow.status_last_changed_at).getTime();
  if (Number.isNaN(changedAt)) return false;

  const viewedAt = caseRow.last_status_viewed_at
    ? new Date(caseRow.last_status_viewed_at).getTime()
    : 0;

  return changedAt > viewedAt;
}

export function formatStatusChangedDaysAgo(iso: string, now = new Date()): string {
  const days = getStatusChangeAgeDays(iso, now);
  if (days === null) return "recently";
  if (days > STATUS_CHANGE_WEDGE_MAX_AGE_DAYS) return "recently";

  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export const MANUAL_REFRESH_UPSELL_SESSION_KEY =
  "trackmyopt_case_status_manual_refresh_upsell_shown";

export const MANUAL_REFRESH_COUNT_SESSION_KEY =
  "trackmyopt_case_status_manual_refresh_count";

export const STALE_STATUS_UPSELL_SESSION_KEY =
  "trackmyopt_case_status_stale_upsell_shown";

/** Free status older than this is treated as stale for Pro auto-check upsell. */
export const STALE_STATUS_MS = 24 * 60 * 60 * 1000;

export function shouldShowStaleStatusUpsell(
  lastCheckedAt: string | null | undefined,
  isPremium: boolean | null,
  nowMs = Date.now()
): boolean {
  if (isPremium !== false || !lastCheckedAt) return false;
  const checkedAt = new Date(lastCheckedAt).getTime();
  if (Number.isNaN(checkedAt)) return false;
  return nowMs - checkedAt >= STALE_STATUS_MS;
}

export const CHECKOUT_UPSELL_TRIGGER = {
  STATUS_CHANGE_WEDGE: "status_change_wedge",
  SECOND_MANUAL_REFRESH: "second_manual_refresh",
  STALE_STATUS: "stale_status",
  RECEIPT_ADDED: "receipt_added",
} as const;

export type CheckoutUpsellTrigger =
  (typeof CHECKOUT_UPSELL_TRIGGER)[keyof typeof CHECKOUT_UPSELL_TRIGGER];

export const RECEIPT_ADDED_UPSELL_SESSION_KEY =
  "trackmyopt_case_status_receipt_added_upsell_shown";
