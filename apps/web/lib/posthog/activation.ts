/** Days from ISO signup date (YYYY-MM-DD) to today, UTC. */
export function daysSinceSignupDate(signupDate?: string | null): number | null {
  if (!signupDate || !/^\d{4}-\d{2}-\d{2}$/.test(signupDate)) return null;
  const start = Date.parse(`${signupDate}T00:00:00.000Z`);
  if (!Number.isFinite(start)) return null;
  const diffMs = Date.now() - start;
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

/** Phase 4 activation window: receipt + first successful check within this many hours of signup. */
export const ACTIVATION_WINDOW_HOURS = 24;

const PENDING_STATUS = "Status will be fetched shortly...";

export function hasSuccessfulCaseCheck(caseRow: {
  last_checked_at?: string | null;
  current_status?: string | null;
} | null | undefined): boolean {
  if (!caseRow?.last_checked_at || !caseRow.current_status) return false;
  if (caseRow.current_status === PENDING_STATUS) return false;
  return true;
}

/**
 * Phase 4 activation: receipt present + at least one successful case status check.
 * Onboarding is no longer required (it was blocking the funnel).
 */
export function isActivatedUser(input: {
  hasReceipt: boolean;
  hasSuccessfulCheck: boolean;
  /** @deprecated ignored — kept for call-site compatibility during Phase 4 cutover */
  onboardingCompleted?: boolean;
  /** @deprecated use hasSuccessfulCheck */
  hasStatus?: boolean;
}): boolean {
  const hasCheck =
    input.hasSuccessfulCheck ||
    (input.hasSuccessfulCheck === undefined && Boolean(input.hasStatus));
  return Boolean(input.hasReceipt && hasCheck);
}

export function isWithinActivationWindow(
  signupAtIso: string | null | undefined,
  nowMs = Date.now(),
  windowHours = ACTIVATION_WINDOW_HOURS
): boolean {
  if (!signupAtIso) return false;
  const signupMs = Date.parse(signupAtIso);
  if (!Number.isFinite(signupMs)) return false;
  return nowMs - signupMs <= windowHours * 60 * 60 * 1000;
}

/** Person property for PostHog — Phase 4 (onboarding does not gate activation). */
type ActivationState =
  | "no_receipt"
  | "receipt_pending_status"
  | "activated";

export function resolveActivationState(input: {
  hasReceipt: boolean;
  hasSuccessfulCheck: boolean;
}): ActivationState {
  if (!input.hasReceipt) return "no_receipt";
  if (!input.hasSuccessfulCheck) return "receipt_pending_status";
  return "activated";
}
