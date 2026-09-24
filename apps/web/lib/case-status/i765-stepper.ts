/** I-765 case progress stepper helpers (biometrics often waived for OPT). */

const I765_CASE_STEPS = [
  { id: 1, name: 'Received', shortName: 'Received', key: 'received' as const },
  {
    id: 2,
    name: 'Biometrics',
    shortName: 'Biometrics',
    key: 'biometrics' as const,
  },
  { id: 3, name: 'Active Review', shortName: 'Review', key: 'review' as const },
  { id: 4, name: 'Decision', shortName: 'Decision', key: 'decision' as const },
  { id: 5, name: 'Card Produced', shortName: 'Card', key: 'card' as const },
] as const;

export function mentionsBiometrics(status: string): boolean {
  const lower = status.trim().toLowerCase();
  if (!lower) return false;
  return (
    lower.includes('biometric') ||
    lower.includes('fingerprint') ||
    lower.includes('finger print') ||
    (lower.includes('appointment') &&
      (lower.includes('asc') || lower.includes('support center')))
  );
}

/** True when USCIS status history shows a biometrics-related update. */
export function biometricsAppliesToCase(
  currentStatus: string | null,
  statusHistory: Array<{
    status?: string | null;
    description?: string | null;
  }> = []
): boolean {
  const statuses = [
    currentStatus,
    ...statusHistory.flatMap((e) => [e.status, e.description]),
  ].filter((s): s is string => typeof s === 'string' && s.trim().length > 0);

  return statuses.some(mentionsBiometrics);
}

export type BiometricsState =
  | 'unrecorded'
  | 'pending'
  | 'completed'
  | 'reused'
  | 'waived';

/** Completion requires explicit evidence, not a fee or appointment update. */
export function getBiometricsState(
  currentStatus: string | null | undefined,
  history: Array<{ status?: string | null; description?: string | null }> = []
): BiometricsState {
  const texts = [
    currentStatus,
    ...history.flatMap((entry) => [entry.status, entry.description]),
  ];
  let result: BiometricsState = 'unrecorded';
  for (const text of texts) {
    if (!text) continue;
    for (const sentence of text
      .replace(/<[^>]*>/g, ' ')
      .toLowerCase()
      .split(/[.!?]/)) {
      if (!mentionsBiometrics(sentence)) continue;
      if (result === 'unrecorded') result = 'pending';
      if (/\b(fee|payment)\b/.test(sentence)) continue;
      if (
        /\b(not|never|awaiting|pending|will|must|need to|scheduled|unable|failed)\b/.test(
          sentence
        )
      )
        continue;
      if (
        /\b(completed|taken|applied|captured|collected|processed)\b/.test(
          sentence
        )
      )
        return 'completed';
      if (/\b(reused|reusing)\b/.test(sentence)) result = 'reused';
      else if (/\bwaived\b/.test(sentence) && result !== 'reused')
        result = 'waived';
    }
  }
  return result;
}

/** Map USCIS status text to the full 5-step model (before biometrics skip). */
export function mapStatusToRawStep(status: string | null): number {
  if (typeof status !== 'string' || !status.trim()) return 0;

  const lowerStatus = status.trim().toLowerCase();

  if (
    lowerStatus.includes('card was mailed') ||
    lowerStatus.includes('card was produced') ||
    lowerStatus.includes('card was delivered') ||
    lowerStatus.includes('card was picked up') ||
    lowerStatus.includes('new card is being produced')
  ) {
    return 5;
  }

  if (
    lowerStatus.includes('was approved') ||
    lowerStatus.includes('was denied') ||
    lowerStatus.includes('case approved') ||
    lowerStatus.includes('case denied')
  ) {
    return 4;
  }

  if (
    lowerStatus.includes('actively reviewed') ||
    lowerStatus.includes('being reviewed') ||
    lowerStatus.includes('under review') ||
    lowerStatus.includes('request for evidence') ||
    lowerStatus.includes('rfe')
  ) {
    return 3;
  }

  if (mentionsBiometrics(lowerStatus)) {
    return 2;
  }

  if (
    lowerStatus.includes('received') ||
    lowerStatus.includes('acceptance') ||
    lowerStatus.includes('fee was accepted')
  ) {
    return 1;
  }

  return 1;
}

export function getVisibleI765Steps(skipBiometrics: boolean) {
  if (!skipBiometrics) return [...I765_CASE_STEPS];
  return I765_CASE_STEPS.filter((s) => s.key !== 'biometrics');
}

/** Convert raw 5-step index to visible step index when biometrics is hidden. */
export function toDisplayStep(
  rawStep: number,
  skipBiometrics: boolean
): number {
  if (!skipBiometrics || rawStep <= 0) return rawStep;
  if (rawStep <= 1) return 1;
  if (rawStep === 2) return 1;
  return rawStep - 1;
}
