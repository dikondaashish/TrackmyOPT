import { AUTOFILL_PREFERENCES_KEY } from './autofill-preferences';
import { isPrefillUndoAllowed } from './prefill-undo';

/** Frame messages can arrive after the user has stopped Continuous mode. */
export async function withPrefillModeGuard(
  continuous: boolean,
  run: (shouldContinue: () => boolean) => Promise<void>,
): Promise<void> {
  let active = true;
  const pageUrl = window.location.href;
  const stop = () => { active = false; };
  const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (continuous && area === 'sync' && changes[AUTOFILL_PREFERENCES_KEY]) stop();
  };
  chrome.storage.onChanged.addListener(onChange);
  window.addEventListener('pagehide', stop, { once: true });
  const shouldContinue = () => active && isPrefillUndoAllowed() && window.location.href === pageUrl;
  try {
    if (continuous) {
      const stored = await chrome.storage.sync.get(AUTOFILL_PREFERENCES_KEY).catch(() => null);
      if (stored?.[AUTOFILL_PREFERENCES_KEY]?.mode !== 'continuous') return;
    }
    if (shouldContinue()) await run(shouldContinue);
  } finally {
    chrome.storage.onChanged.removeListener(onChange);
    window.removeEventListener('pagehide', stop);
  }
}
