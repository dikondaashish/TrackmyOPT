/** One relay per child document and generation, shared by both entrypoints.
 * A newer relay cancels pending async work from an older one. */
type RelayState = { sequence: number; runId: string; epoch: number };
const KEY = '__tmoPrefillRelayStateV1';

export function acceptPrefillRelay(message: { relaySequence?: unknown; undoRunId?: unknown }): (() => boolean) | null {
  const sequence = message.relaySequence;
  const runId = message.undoRunId;
  if (!Number.isSafeInteger(sequence) || Number(sequence) < 1 ||
      typeof runId !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(runId)) return null;
  const host = window as unknown as Record<string, RelayState>;
  let state = host[KEY];
  if (!state) {
    state = { sequence: 0, runId: '', epoch: 0 };
    host[KEY] = state;
    const invalidate = () => { state.epoch += 1; };
    window.addEventListener('pagehide', invalidate);
    window.addEventListener('popstate', invalidate);
    document.addEventListener('tmo-page-context-changed', invalidate);
  }
  if (Number(sequence) <= state.sequence) return null;
  state.sequence = Number(sequence);
  state.runId = runId;
  const epoch = state.epoch;
  const url = window.location.href;
  return () => state.sequence === sequence && state.runId === runId &&
    state.epoch === epoch && window.location.href === url;
}

/** A newer relay waits for the invalidated older run to release its journal.
 * Only the newest still-current relay may start; a deadline avoids a queue
 * that survives an unresponsive page operation. */
export async function waitForPrefillRelayTurn(
  current: () => boolean,
  busy: () => boolean,
  sleep: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
  timeoutMs = 12_000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (current() && busy()) {
    if (Date.now() >= deadline) return false;
    await sleep(50);
  }
  return current() && !busy();
}
