/**
 * Free-tier status change wedge — backend fields + client visibility helpers.
 */

export type FreeChangeWedgeFields = {
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

  const changedAt = new Date(caseRow.status_last_changed_at).getTime();
  if (Number.isNaN(changedAt)) return false;

  const viewedAt = caseRow.last_status_viewed_at
    ? new Date(caseRow.last_status_viewed_at).getTime()
    : 0;

  return changedAt > viewedAt;
}

export function formatStatusChangedDaysAgo(iso: string): string {
  const changed = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - changed.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export const MANUAL_REFRESH_UPSELL_SESSION_KEY =
  "trackmyopt_case_status_manual_refresh_upsell_shown";

export const MANUAL_REFRESH_COUNT_SESSION_KEY =
  "trackmyopt_case_status_manual_refresh_count";

export const CHECKOUT_UPSELL_TRIGGER = {
  STATUS_CHANGE_WEDGE: "status_change_wedge",
  SECOND_MANUAL_REFRESH: "second_manual_refresh",
} as const;

export type CheckoutUpsellTrigger =
  (typeof CHECKOUT_UPSELL_TRIGGER)[keyof typeof CHECKOUT_UPSELL_TRIGGER];
