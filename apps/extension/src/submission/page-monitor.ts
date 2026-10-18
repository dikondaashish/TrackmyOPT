/**
 * Page-context (MAIN world) submission monitor. Bundled into a tiny script
 * that runs at document_start on bundled platform hosts only.
 *
 * Interface with the isolated content script is three window CustomEvents
 * carrying JSON strings (submission-protocol.ts). The monitor is inert until
 * armed, and an arm is accepted only right after a trusted user activation of
 * the platform's Submit control (pointer click, or keyboard Enter/Space).
 *
 * Website safety invariants:
 *  - the site's fetch promise is returned unchanged, and the original fetch /
 *    XHR methods are always called with the original arguments;
 *  - only a cloned Response (or an already-buffered XHR body) is read, at most
 *    RESPONSE_MAX_BYTES within RESPONSE_READ_TIMEOUT_MS;
 *  - every monitor step is wrapped so an exception can never reach the site;
 *  - one result per arm; nothing is sent anywhere except the result event.
 */
import {
  ARM_ACTIVATION_WINDOW_MS,
  NETWORK_ARM_TTL_MS,
  RESPONSE_MAX_BYTES,
  RESPONSE_READ_TIMEOUT_MS,
  SUBMISSION_PAGE_EVENTS,
  SUBMISSION_PROTOCOL_VERSION,
  parseMonitorArmDetail,
  type MonitorResultDetail,
  type NetworkDetectorId,
  type NetworkVerdict,
} from './submission-protocol';
import type { ObservedResponse } from './workday-submission-rules';

export interface SubmissionMonitorSpec {
  detector: NetworkDetectorId;
  isSubmitControl: (element: Element) => boolean;
  matchRequest: (requestUrl: string, method: string, pageUrl: string) => string | null;
  classify: (response: ObservedResponse) => NetworkVerdict;
}

type MonitorWindow = Window & typeof globalThis;
interface Arm { attemptId: string; pageUrl: string; armedAt: number; requestPath: string | null; reported: boolean }
interface RequestToken { arm: Arm; requestPath: string; startedAt: number }

const INSTALLED = '__tmoSubmissionMonitorV1';

function usable(element: Element, win: MonitorWindow): boolean {
  if (!(element instanceof win.HTMLElement)) return false;
  if ((element as HTMLButtonElement).disabled ||
      element.closest('[disabled],[aria-disabled="true"],[hidden],[inert],[aria-hidden="true"]')) return false;
  const style = win.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
  return /jsdom/i.test(win.navigator.userAgent) || element.getClientRects().length > 0;
}

export async function readBoundedText(
  stream: ReadableStream<Uint8Array> | null,
  win: MonitorWindow,
  maxBytes = RESPONSE_MAX_BYTES,
  timeoutMs = RESPONSE_READ_TIMEOUT_MS,
): Promise<{ text: string } | { failure: 'unreadable' | 'oversize' | 'timeout' }> {
  if (!stream) return { failure: 'unreadable' };
  const reader = stream.getReader();
  let timedOut = false;
  const timer = win.setTimeout(() => { timedOut = true; reader.cancel().catch(() => {}); }, timeoutMs);
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (timedOut) return { failure: 'timeout' };
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) { reader.cancel().catch(() => {}); return { failure: 'oversize' }; }
      text += decoder.decode(value, { stream: true });
    }
    return timedOut ? { failure: 'timeout' } : { text: text + decoder.decode() };
  } catch {
    return { failure: timedOut ? 'timeout' : 'unreadable' };
  } finally {
    win.clearTimeout(timer);
    try { reader.releaseLock(); } catch { /* already released */ }
  }
}

function parseJson(text: string): { body: unknown } | { failure: 'malformed' } {
  try { return { body: JSON.parse(text) }; } catch { return { failure: 'malformed' }; }
}

export interface MonitorOptions {
  now?: () => number;
  /** Tests only: jsdom cannot create trusted events. */
  isTrusted?: (event: Event) => boolean;
  maxBytes?: number;
  readTimeoutMs?: number;
}

export function installSubmissionMonitor(
  win: MonitorWindow,
  spec: SubmissionMonitorSpec,
  options: MonitorOptions = {},
): { uninstall: () => void } | null {
  const now = options.now ?? (() => Date.now());
  const trusted = options.isTrusted ?? ((event: Event) => event.isTrusted);
  const maxBytes = options.maxBytes ?? RESPONSE_MAX_BYTES;
  const marker = win as unknown as Record<string, unknown>;
  if (marker[INSTALLED]) return null;
  try {
    Object.defineProperty(win, INSTALLED, { value: true, configurable: true });
  } catch { return null; }

  let lastActivationAt = 0;
  let arm: Arm | null = null;

  const noteActivation = (target: EventTarget | null, path: EventTarget[]) => {
    const control = [target, ...path].find((node): node is Element =>
      node instanceof win.Element && spec.isSubmitControl(node));
    if (control && usable(control, win)) lastActivationAt = now();
  };
  const onClick = (event: MouseEvent) => {
    try {
      // Pointer clicks use the primary button; keyboard activation of a button
      // dispatches a trusted click with detail 0, which is covered too.
      if (!trusted(event) || event.button !== 0) return;
      noteActivation(event.target, event.composedPath());
    } catch { /* never interfere with the site */ }
  };
  const onKeydown = (event: KeyboardEvent) => {
    try {
      if (!trusted(event) || (event.key !== 'Enter' && event.key !== ' ')) return;
      noteActivation(win.document.activeElement, event.composedPath());
    } catch { /* never interfere with the site */ }
  };
  const onArm = (event: Event) => {
    try {
      const detail = parseMonitorArmDetail((event as CustomEvent).detail);
      const at = now();
      if (!detail || detail.detector !== spec.detector) return;
      if (!lastActivationAt || at - lastActivationAt > ARM_ACTIVATION_WINDOW_MS) return;
      if (detail.pageUrl !== win.location.href || Math.abs(at - detail.armedAt) > ARM_ACTIVATION_WINDOW_MS) return;
      arm = { attemptId: detail.attemptId, pageUrl: detail.pageUrl, armedAt: at, requestPath: null, reported: false };
    } catch { /* ignore malformed signals */ }
  };
  const onDisarm = (event: Event) => {
    try { if (arm && (event as CustomEvent).detail === arm.attemptId) arm = null; } catch { /* ignore */ }
  };

  const begin = (requestUrl: string, method: string): RequestToken | null => {
    const current = arm;
    if (!current || current.reported || current.requestPath) return null;
    if (now() - current.armedAt > NETWORK_ARM_TTL_MS || win.location.href !== current.pageUrl) return null;
    const requestPath = spec.matchRequest(requestUrl, method, current.pageUrl);
    if (!requestPath) return null;
    current.requestPath = requestPath;
    return { arm: current, requestPath, startedAt: now() };
  };
  const report = (token: RequestToken, verdict: NetworkVerdict, status: number) => {
    try {
      if (arm !== token.arm || token.arm.reported) return;
      token.arm.reported = true;
      const detail: MonitorResultDetail = {
        protocol: SUBMISSION_PROTOCOL_VERSION, detector: spec.detector, attemptId: token.arm.attemptId,
        verdict, status, requestStartedAt: token.startedAt, observedAt: now(),
      };
      win.dispatchEvent(new win.CustomEvent(SUBMISSION_PAGE_EVENTS.result, { detail: JSON.stringify(detail) }));
    } catch { /* never interfere with the site */ }
  };
  const samePath = (responseUrl: string, token: RequestToken) => {
    try { return spec.matchRequest(responseUrl, 'POST', token.arm.pageUrl) === token.requestPath; } catch { return false; }
  };

  const observeFetch = async (token: RequestToken, response: Response) => {
    try {
      const redirected = response.redirected || (!!response.url && !samePath(response.url, token));
      if (redirected || response.status !== 200) {
        report(token, spec.classify({ status: response.status, redirected }), response.status);
        return;
      }
      const read = await readBoundedText(response.clone().body, win, maxBytes, options.readTimeoutMs);
      const parsed = 'text' in read ? parseJson(read.text) : read;
      report(token, spec.classify({
        status: response.status, redirected: false,
        ...('body' in parsed ? { body: parsed.body } : { readFailure: parsed.failure }),
      }), response.status);
    } catch {
      report(token, 'unreadable', response.status || 0);
    }
  };

  const originalFetch = win.fetch;
  if (typeof originalFetch === 'function') {
    const monitoredFetch = function (this: unknown, ...args: Parameters<typeof fetch>) {
      let token: RequestToken | null = null;
      try {
        const [input, init] = args;
        const isRequest = typeof win.Request === 'function' && input instanceof win.Request;
        const url = isRequest ? (input as Request).url : String(input);
        const method = init?.method ?? (isRequest ? (input as Request).method : 'GET');
        token = begin(new URL(url, win.location.href).href, method);
      } catch { token = null; }
      const promise = Reflect.apply(originalFetch, this, args) as Promise<Response>;
      if (token) {
        const observed = token;
        try {
          // Registered before the site's own handlers, so the clone is taken
          // before the site can consume the body.
          promise.then(response => observeFetch(observed, response), () => report(observed, 'network_error', 0));
        } catch { /* a non-standard promise: skip observation */ }
      }
      return promise;
    };
    win.fetch = monitoredFetch as typeof fetch;
  }

  const xhrProto = win.XMLHttpRequest?.prototype;
  const originalOpen = xhrProto?.open;
  const originalSend = xhrProto?.send;
  const xhrRequests = new WeakMap<XMLHttpRequest, { url: string; method: string }>();
  if (xhrProto && originalOpen && originalSend) {
    xhrProto.open = function (this: XMLHttpRequest, ...args: unknown[]) {
      try { xhrRequests.set(this, { method: String(args[0]), url: new URL(String(args[1]), win.location.href).href }); }
      catch { xhrRequests.delete(this); }
      return Reflect.apply(originalOpen, this, args);
    } as typeof xhrProto.open;
    xhrProto.send = function (this: XMLHttpRequest, ...args: unknown[]) {
      try {
        const request = xhrRequests.get(this);
        const token = request ? begin(request.url, request.method) : null;
        if (token) {
          const xhr = this;
          xhr.addEventListener('loadend', () => {
            try {
              if (xhr.status === 0) { report(token, 'network_error', 0); return; }
              if (xhr.responseURL && !samePath(xhr.responseURL, token)) {
                report(token, spec.classify({ status: xhr.status, redirected: true }), xhr.status);
                return;
              }
              if (xhr.status !== 200) { report(token, spec.classify({ status: xhr.status, redirected: false }), xhr.status); return; }
              let observed: ObservedResponse;
              if (xhr.responseType === 'json') {
                observed = xhr.response == null ? { status: 200, redirected: false, readFailure: 'malformed' }
                  : { status: 200, redirected: false, body: xhr.response };
              } else if (xhr.responseType === '' || xhr.responseType === 'text') {
                const text = xhr.responseText;
                if (text.length > maxBytes) observed = { status: 200, redirected: false, readFailure: 'oversize' };
                else {
                  const parsed = parseJson(text);
                  observed = 'body' in parsed ? { status: 200, redirected: false, body: parsed.body }
                    : { status: 200, redirected: false, readFailure: parsed.failure };
                }
              } else observed = { status: 200, redirected: false, readFailure: 'unreadable' };
              report(token, spec.classify(observed), 200);
            } catch { report(token, 'unreadable', xhr.status || 0); }
          }, { once: true });
        }
      } catch { /* never interfere with the site */ }
      return Reflect.apply(originalSend, this, args);
    } as typeof xhrProto.send;
  }

  win.document.addEventListener('click', onClick, true);
  win.document.addEventListener('keydown', onKeydown, true);
  win.addEventListener(SUBMISSION_PAGE_EVENTS.arm, onArm);
  win.addEventListener(SUBMISSION_PAGE_EVENTS.disarm, onDisarm);

  return {
    uninstall: () => {
      win.document.removeEventListener('click', onClick, true);
      win.document.removeEventListener('keydown', onKeydown, true);
      win.removeEventListener(SUBMISSION_PAGE_EVENTS.arm, onArm);
      win.removeEventListener(SUBMISSION_PAGE_EVENTS.disarm, onDisarm);
      if (originalFetch) win.fetch = originalFetch;
      if (xhrProto && originalOpen && originalSend) { xhrProto.open = originalOpen; xhrProto.send = originalSend; }
      delete marker[INSTALLED];
    },
  };
}
