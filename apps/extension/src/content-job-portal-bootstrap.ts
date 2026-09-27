import { shouldActivatePortal } from './portal-activation';
import { isCareerPage } from './career-sites';

type PortalRuntime = typeof import('./content-job-portal');
const state = globalThis as typeof globalThis & { __tmoPortalBootstrap?: boolean };
if (!state.__tmoPortalBootstrap) {
  state.__tmoPortalBootstrap = true;
  let runtime: Promise<PortalRuntime> | undefined;
  const load = () => runtime ??= import(chrome.runtime.getURL('content-job-portal-runtime.js'))
    .catch(error => { runtime = undefined; throw error; });
  const handled = new Set(['TMO_PREFILL_SAVED_RESUME', 'TMO_GET_JOB_CONTEXT',
    'GENERATED_RESUME_ARTIFACT_READY', 'CLEAR_RESUME_AUTOFILL_ARTIFACT', 'RUN_PREFILL_IN_CHILD_FRAME']);
  // Keep one relay registered: callers arriving while the module loads receive
  // the same response as later callers. Never execute a request twice.
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || !handled.has(message?.type)) return false;
    if (message.type === 'RUN_PREFILL_IN_CHILD_FRAME' ? window.top === window.self : window.top !== window.self) return false;
    void load().then(module => {
      let replied = false;
      const reply = (value: unknown) => { replied = true; respond(value); };
      const pending = module.handlePortalMessage(message, sender, reply);
      if (!pending && !replied) respond(null);
    }).catch(() => respond({ ok: false, error: 'extension_unavailable' }));
    return true;
  });
  const activate = () => {
    if (window.top === window.self && shouldActivatePortal(isCareerPage(), location.pathname)) void load().catch(() => {});
  };
  activate();
  // Bounded checks cover a late-rendered career page without a global observer.
  for (const delay of [1000, 3000, 8000]) window.setTimeout(activate, delay);
  document.addEventListener('click', event => {
    if ((event.target as Element)?.closest?.('a[href]')) window.setTimeout(activate, 500);
  }, { capture: true, passive: true });
  window.addEventListener('popstate', activate);
  window.addEventListener('hashchange', activate);
}
