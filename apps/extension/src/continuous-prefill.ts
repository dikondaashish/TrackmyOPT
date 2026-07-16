import type { AutofillPreferences } from './autofill-preferences';

export interface ContinuousPrefillDecision {
  mode: AutofillPreferences['mode'];
  signature: string;
  previousSignature: string;
  inFlight: boolean;
}

/** Pure gate used by the DOM observer to stay opt-in and idempotent. */
export function shouldRunContinuousPrefill(input: ContinuousPrefillDecision): boolean {
  return (
    input.mode === 'continuous' &&
    input.signature.length > 0 &&
    input.signature !== input.previousSignature &&
    !input.inFlight
  );
}
