/** I-765 case progress stepper helpers (biometrics often waived for OPT). */

export const I765_CASE_STEPS = [
  { id: 1, name: "Received", shortName: "Received", key: "received" as const },
  { id: 2, name: "Biometrics", shortName: "Biometrics", key: "biometrics" as const },
  { id: 3, name: "Active Review", shortName: "Review", key: "review" as const },
  { id: 4, name: "Decision", shortName: "Decision", key: "decision" as const },
  { id: 5, name: "Card Produced", shortName: "Card", key: "card" as const },
] as const;

export type I765StepKey = (typeof I765_CASE_STEPS)[number]["key"];

export function mentionsBiometrics(status: string): boolean {
  const lower = status.trim().toLowerCase();
  if (!lower) return false;
  return (
    lower.includes("biometric") ||
    lower.includes("fingerprint") ||
    lower.includes("finger print") ||
    (lower.includes("appointment") &&
      (lower.includes("asc") || lower.includes("support center")))
  );
}

/** True when USCIS status history shows a biometrics-related update. */
export function biometricsAppliesToCase(
  currentStatus: string | null,
  statusHistory: Array<{ status?: string | null }> = []
): boolean {
  const statuses = [
    currentStatus,
    ...statusHistory.map((e) => e.status ?? null),
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);

  return statuses.some(mentionsBiometrics);
}

/** Map USCIS status text to the full 5-step model (before biometrics skip). */
export function mapStatusToRawStep(status: string | null): number {
  if (typeof status !== "string" || !status.trim()) return 0;

  const lowerStatus = status.trim().toLowerCase();

  if (
    lowerStatus.includes("card was mailed") ||
    lowerStatus.includes("card was produced") ||
    lowerStatus.includes("card was delivered") ||
    lowerStatus.includes("card was picked up") ||
    lowerStatus.includes("new card is being produced")
  ) {
    return 5;
  }

  if (
    lowerStatus.includes("was approved") ||
    lowerStatus.includes("was denied") ||
    lowerStatus.includes("case approved") ||
    lowerStatus.includes("case denied")
  ) {
    return 4;
  }

  if (
    lowerStatus.includes("actively reviewed") ||
    lowerStatus.includes("being reviewed") ||
    lowerStatus.includes("under review") ||
    lowerStatus.includes("request for evidence") ||
    lowerStatus.includes("rfe")
  ) {
    return 3;
  }

  if (mentionsBiometrics(lowerStatus)) {
    return 2;
  }

  if (
    lowerStatus.includes("received") ||
    lowerStatus.includes("acceptance") ||
    lowerStatus.includes("fee was accepted")
  ) {
    return 1;
  }

  return 1;
}

export function getVisibleI765Steps(skipBiometrics: boolean) {
  if (!skipBiometrics) return [...I765_CASE_STEPS];
  return I765_CASE_STEPS.filter((s) => s.key !== "biometrics");
}

/** Convert raw 5-step index to visible step index when biometrics is hidden. */
export function toDisplayStep(rawStep: number, skipBiometrics: boolean): number {
  if (!skipBiometrics || rawStep <= 0) return rawStep;
  if (rawStep <= 1) return 1;
  if (rawStep === 2) return 1;
  return rawStep - 1;
}
