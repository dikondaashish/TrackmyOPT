import type { PrefillUndoResult } from './prefill-undo';
import {
  AUTOFILL_PREFERENCES_KEY,
  normalizeAutofillPreferences,
} from './autofill-preferences';

export async function requestPrefillUndo(
  runId: string
): Promise<PrefillUndoResult> {
  const stored = await chrome.storage.sync.get(AUTOFILL_PREFERENCES_KEY);
  await chrome.storage.sync.set({
    [AUTOFILL_PREFERENCES_KEY]: {
      ...normalizeAutofillPreferences(stored[AUTOFILL_PREFERENCES_KEY]),
      mode: 'step_by_step',
      guidedAutopilot: false,
    },
  });
  const response = await chrome.runtime.sendMessage({
    type: 'UNDO_LAST_PREFILL',
    runId,
  });
  if (!response?.ok)
    throw new Error('Could not reach the application. Try again.');
  return response.result;
}
