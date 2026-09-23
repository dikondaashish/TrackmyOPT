import { normalizeSensitiveAnswerSession, type SensitiveAnswerSession } from './sensitive-autofill';

export type PrivatePrefillLoad = {
  status: 'ready' | 'empty' | 'unavailable' | 'stopped';
  answers: SensitiveAnswerSession;
};

/** Called only by an explicit Prefill action, never by panel mount or page load.
 * "confirmed" is an internal run guard: the Prefill click is now the consent.
 * The strict normalizer discards credentials and unrecognized properties.
 */
export async function loadPrivateAnswersForPrefill(
  shouldContinue: () => boolean,
): Promise<PrivatePrefillLoad> {
  const empty = { confirmed: false };
  if (!shouldContinue()) return { status: 'stopped', answers: empty };
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PRIVATE_PREFILL_ANSWERS' });
    if (!shouldContinue()) return { status: 'stopped', answers: empty };
    if (!response?.ok) return { status: 'unavailable', answers: empty };
    const data = response.data;
    if (!data) return { status: 'empty', answers: empty };
    if (typeof data !== 'object' || Array.isArray(data)) return { status: 'unavailable', answers: empty };
    const answers = normalizeSensitiveAnswerSession({ ...data, confirmed: true });
    if (!answers || Object.keys(answers).length === 1) return { status: 'empty', answers: empty };
    return { status: 'ready', answers };
  } catch {
    return { status: shouldContinue() ? 'unavailable' : 'stopped', answers: empty };
  }
}
