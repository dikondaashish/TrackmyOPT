/**
 * After an explicit Prefill, the applicant may advance to another step
 * (Personal Info → My Experience). Step-by-step mode never fills on its own,
 * so the widget says when new fillable fields appear and asks for one click.
 *
 * Signatures come from getPrefillCandidateSignature(): "url|token|token…",
 * memory-only identities of empty eligible controls, never values or labels.
 */
export const NEXT_STEP_NUDGE_WINDOW_MS = 30 * 60 * 1_000;

/** Eligible controls present now that were not present after the last run. */
export function newCandidateCount(previous: string, current: string): number {
  if (!current) return 0;
  const before = new Set(previous ? previous.split('|').slice(1) : []);
  return current.split('|').slice(1).filter(token => !before.has(token)).length;
}

export function shouldNudgeNextStep(input: {
  mode: 'step_by_step' | 'continuous';
  lastExplicitAt: number | null;
  now: number;
  lastSignature: string;
  currentSignature: string;
  lastNudgedSignature: string;
  inFlight: boolean;
}): boolean {
  if (input.mode !== 'step_by_step' || input.inFlight || input.lastExplicitAt === null) return false;
  if (input.now - input.lastExplicitAt > NEXT_STEP_NUDGE_WINDOW_MS) return false;
  if (!input.currentSignature || input.currentSignature === input.lastNudgedSignature) return false;
  return newCandidateCount(input.lastSignature, input.currentSignature) > 0;
}

export const NEXT_STEP_NUDGE_COPY =
  'New fields appeared on this step. Click Prefill this application to fill them.';
