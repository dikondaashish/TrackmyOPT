import { DEDICATED_ATTORNEY_BENEFIT } from "@/lib/pricing/plan-config";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DedicatedConsultationEligibility {
  eligible: boolean;
  eligibleAt: Date | null;
  daysRemaining: number;
}

export function getDedicatedConsultationEligibility(
  dedicatedStartedAt: string | null | undefined,
  now = new Date()
): DedicatedConsultationEligibility {
  if (!dedicatedStartedAt) {
    return { eligible: false, eligibleAt: null, daysRemaining: DEDICATED_ATTORNEY_BENEFIT.minimumContinuousPlanDays };
  }

  const startedAt = new Date(dedicatedStartedAt);
  if (Number.isNaN(startedAt.getTime())) {
    return { eligible: false, eligibleAt: null, daysRemaining: DEDICATED_ATTORNEY_BENEFIT.minimumContinuousPlanDays };
  }

  const eligibleAt = new Date(
    startedAt.getTime() + DEDICATED_ATTORNEY_BENEFIT.minimumContinuousPlanDays * DAY_MS
  );
  const remainingMs = Math.max(0, eligibleAt.getTime() - now.getTime());

  return {
    eligible: remainingMs === 0,
    eligibleAt,
    daysRemaining: Math.ceil(remainingMs / DAY_MS),
  };
}
