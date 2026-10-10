import type { PrefillUndoResult } from './prefill-undo';
import {
  AUTOFILL_PREFERENCES_KEY,
  normalizeAutofillPreferences,
} from './autofill-preferences';

export async function requestPrefillUndo(
  runId: string,
  undoInCurrentDocument?: () => PrefillUndoResult
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
  // The widget itself does not grant activeTab. Chrome can reject programmatic
  // injection on a matched career page even though its content script is live.
  // In that case, undo the journal in this already-running isolated document.
  if (!response?.ok) {
    if (undoInCurrentDocument) return undoInCurrentDocument();
    throw new Error('Could not reach the application. Try again.');
  }
  return response.result;
}
