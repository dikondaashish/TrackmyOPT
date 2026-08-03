export const NPS_LAST_SHOWN_KEY = "nps_last_shown";
export const NPS_LAST_SHOWN_PERSON_PROPERTY = "nps_last_shown";

export const NPS_MIN_ACCOUNT_AGE_DAYS = 14;
export const NPS_COOLDOWN_DAYS = 90;
export const NPS_SHOW_DELAY_MS = 30_000;

type NpsCategory = "detractor" | "passive" | "promoter";

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
