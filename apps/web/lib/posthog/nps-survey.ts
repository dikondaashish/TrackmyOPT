export const NPS_LAST_SHOWN_KEY = "nps_last_shown";
export const NPS_LAST_SHOWN_PERSON_PROPERTY = "nps_last_shown";

export const NPS_COOLDOWN_DAYS = 90;
export const NPS_SHOW_DELAY_MS = 1_200;
export const NPS_REQUEST_EVENT = "trackmyopt:nps-request";

export type NpsCategory = "detractor" | "passive" | "promoter";
export type NpsTrigger =
  | "case_status_first_success"
  | "resume_downloaded"
  | "ats_scan_completed";
export type NpsPlanTier = "free" | "pro" | "dedicated";

export type NpsRequest = {
  trigger: NpsTrigger;
  planTier: NpsPlanTier;
};

export function resolveNpsCategory(score: number): NpsCategory {
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
}

export function isAccountOldEnough(createdAt: string, minDays: number): boolean {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const ageMs = Date.now() - created.getTime();
  return ageMs >= minDays * 24 * 60 * 60 * 1000;
}

export function isWithinNpsCooldown(
  lastShownIso: string | null | undefined,
  cooldownDays: number
): boolean {
  if (!lastShownIso) return false;
  const lastShown = new Date(lastShownIso);
  if (Number.isNaN(lastShown.getTime())) return false;
  const elapsedMs = Date.now() - lastShown.getTime();
  return elapsedMs < cooldownDays * 24 * 60 * 60 * 1000;
}

/**
 * Request the single product NPS prompt after a completed user outcome. The
 * dashboard listener owns eligibility, display, and event capture so callers
 * cannot accidentally create an always-on or duplicate prompt.
 */
export function requestNpsSurvey(request: NpsRequest): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<NpsRequest>(NPS_REQUEST_EVENT, { detail: request })
  );
}
