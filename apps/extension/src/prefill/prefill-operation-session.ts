/** Document-local generation: an old asynchronous operation cannot report or
 * write after another run, SPA navigation, or page teardown. No field data is
 * persisted or sent to telemetry. */
type State = { generation: number; url: string };
const states = new WeakMap<Document, State>();
const listening = new WeakSet<Document>();
export type PrefillOperationGuard = (() => boolean) & { readonly generation: number; readonly runId: string };

export function beginPrefillOperationSession(document: Document): PrefillOperationGuard {
  const state = states.get(document) ?? { generation: 0, url: document.location.href };
  state.generation += 1;
  state.url = document.location.href;
  states.set(document, state);
  if (!listening.has(document)) {
    const invalidate = () => { state.generation += 1; };
    document.defaultView?.addEventListener('pagehide', invalidate);
    document.defaultView?.addEventListener('popstate', invalidate);
    document.addEventListener('tmo-page-context-changed', invalidate);
    document.addEventListener('tmo-prefill-invalidated', invalidate);
    listening.add(document);
  }
  const generation = state.generation;
  const url = state.url;
  const current = (() => state.generation === generation && document.location.href === url) as PrefillOperationGuard;
  Object.defineProperties(current, {
    generation: { value: generation },
    runId: { value: `${generation}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}` },
  });
  return current;
}
