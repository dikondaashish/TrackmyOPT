/** Document-local generation: an old asynchronous operation cannot report or
 * write after another run, SPA navigation, or page teardown. No field data is
 * persisted or sent to telemetry. */
type State = { generation: number; url: string };
const states = new WeakMap<Document, State>();
const listening = new WeakSet<Document>();

export function beginPrefillOperationSession(document: Document): () => boolean {
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
  return () => state.generation === generation && document.location.href === url;
}
