/**
 * Isolated-world side of submission confirmation (top frame only).
 *
 * 1. Observes trusted user activations of a Submit control (pointer or
 *    keyboard). It never clicks, submits, or blocks anything.
 * 2. In the same event turn, arms the page-context network monitor when the
 *    platform has one and remote config keeps it on; then registers the
 *    attempt with the background, which binds it to tab, frame, user and job.
 * 3. Relays untrusted page signals (monitor results, confirmation pages) as
 *    evidence. The background decides the outcome.
 */
import {
  ATTEMPT_TTL_MS,
  SUBMISSION_PAGE_EVENTS,
  SUBMISSION_PROTOCOL_VERSION,
  parseMonitorResultDetail,
  type SubmissionJobSnapshot,
} from './submission-protocol';
import { SUBMIT_LABEL_RE, WORKDAY_SUBMIT_SELECTOR } from './workday-submission-rules';
import type { AttemptView } from './submission-lifecycle';
import {
  detectorMode,
  platformForHostname,
  type EffectiveExtensionConfig,
} from '../platform-config/remote-config';

/** Final-step submit wording. "Apply" alone usually opens the form, so it is excluded. */
const SUBMIT_TEXT_RE = /^(?:submit|submit (?:my |your )?application|send (?:my )?application|finish (?:and|&) submit|complete (?:my )?application|submit and finish)$/i;
const LOCAL_DUPLICATE_WINDOW_MS = 10_000;
const FOLLOW_UP_CHECKS_MS = [1000, 3000, 6000, 10_000, 20_000];

export interface SubmissionCoordinatorDeps {
  win: Window & typeof globalThis;
  getJob: () => Promise<SubmissionJobSnapshot | null> | SubmissionJobSnapshot | null;
  send: (message: Record<string, unknown>) => Promise<unknown>;
  config: () => EffectiveExtensionConfig;
  isConfirmationPage: (doc: Document) => boolean;
  findApplicationRoot: () => HTMLElement | null;
  onStatus: (view: AttemptView) => void;
  /** A confirmation page with no attempt in this tab: ask, never assume. */
  onUnattributedConfirmation: () => void;
  isTrusted?: (event: Event) => boolean;
  now?: () => number;
  newAttemptId?: () => string;
}

function controlLabel(element: Element): string {
  const text = element.tagName === 'INPUT' ? (element as HTMLInputElement).value : element.textContent || '';
  return (text || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
}

function defaultAttemptId(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createSubmissionCoordinator(deps: SubmissionCoordinatorDeps) {
  const { win } = deps;
  const doc = win.document;
  const now = deps.now ?? (() => Date.now());
  const trusted = deps.isTrusted ?? ((event: Event) => event.isTrusted);
  const newAttemptId = deps.newAttemptId ?? defaultAttemptId;
  let local: { attemptId: string; jobUrl: string; at: number; status: AttemptView['status'] } | null = null;
  let followUps: number[] = [];
  let started = false;
  let unattributedPrompted = false;

  const platform = () => platformForHostname(win.location.hostname);

  function submitControlFor(target: EventTarget | null, path: EventTarget[]): HTMLElement | null {
    const candidates = [target, ...path].filter((node): node is HTMLElement => node instanceof win.HTMLElement);
    for (const node of candidates) {
      const control = node.closest<HTMLElement>('button, input[type="submit"], [role="button"]');
      if (!control) continue;
      if ((control as HTMLButtonElement).disabled || control.getAttribute('aria-disabled') === 'true') return null;
      const label = controlLabel(control);
      if (platform() === 'workday') {
        return control.matches(WORKDAY_SUBMIT_SELECTOR) && SUBMIT_LABEL_RE.test(label) ? control : null;
      }
      if (!SUBMIT_TEXT_RE.test(label)) return null;
      // Generic sites: the control must belong to the application form.
      const root = deps.findApplicationRoot();
      const form = control.closest('form');
      return (root && root.contains(control)) || (form && (control as HTMLButtonElement).type === 'submit') ? control : null;
    }
    return null;
  }

  function arm(attemptId: string): void {
    win.dispatchEvent(new win.CustomEvent(SUBMISSION_PAGE_EVENTS.arm, { detail: JSON.stringify({
      protocol: SUBMISSION_PROTOCOL_VERSION, detector: 'workday_network', attemptId,
      pageUrl: win.location.href, armedAt: now(),
    }) }));
  }
  function disarm(attemptId: string): void {
    win.dispatchEvent(new win.CustomEvent(SUBMISSION_PAGE_EVENTS.disarm, { detail: attemptId }));
  }

  function scheduleFollowUps(): void {
    for (const id of followUps) win.clearTimeout(id);
    followUps = FOLLOW_UP_CHECKS_MS.map(delay => win.setTimeout(() => { void checkConfirmationPage(); }, delay));
  }

  async function activated(event: Event, target: EventTarget | null): Promise<void> {
    if (!trusted(event)) return;
    const control = submitControlFor(target, event.composedPath());
    if (!control) return;
    const config = deps.config();
    // Arm first, synchronously: the site may send its request in this turn.
    const reuse = local && local.status === 'pending' && now() - local.at < LOCAL_DUPLICATE_WINDOW_MS ? local : null;
    const attemptId = reuse?.attemptId ?? newAttemptId();
    const networkOn = platform() === 'workday' && detectorMode(config, 'workday_network') !== 'off';
    if (networkOn) arm(attemptId);
    // Recorded before any await: keyboard activation fires keydown and then a
    // click in the same turn, and both must share this attempt.
    const claimed = { attemptId, jobUrl: reuse?.jobUrl ?? '', at: reuse?.at ?? now(), status: 'pending' as const };
    local = claimed;
    if (reuse) return;
    const job = await deps.getJob();
    if (!job) { if (networkOn) disarm(attemptId); if (local === claimed) local = null; return; }
    claimed.jobUrl = job.job_url;
    const response = await deps.send({ type: 'SUBMISSION_ATTEMPT_BEGIN', attemptId, job }).catch(() => null) as
      { ok?: boolean; attempt?: AttemptView } | null;
    if (!response?.ok || !response.attempt) { if (networkOn) disarm(attemptId); if (local === claimed) local = null; return; }
    if (response.attempt.attemptId !== attemptId) {
      // The background already had a pending attempt for this job and tab.
      if (networkOn) { disarm(attemptId); arm(response.attempt.attemptId); }
      claimed.attemptId = response.attempt.attemptId;
    }
    deps.onStatus(response.attempt);
    scheduleFollowUps();
  }

  const onClick = (event: MouseEvent) => { if (event.button === 0) void activated(event, event.target).catch(() => {}); };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') void activated(event, doc.activeElement).catch(() => {});
  };
  const onResult = (event: Event) => {
    const raw = (event as CustomEvent).detail;
    const detail = parseMonitorResultDetail(raw);
    if (!detail || !local || detail.attemptId !== local.attemptId) return;
    disarm(detail.attemptId);
    void deps.send({ type: 'SUBMISSION_EVIDENCE', attemptId: detail.attemptId, kind: 'network', detail: raw })
      .then(response => {
        const attempt = (response as { attempt?: AttemptView } | null)?.attempt;
        if (attempt) applyStatus(attempt);
      }).catch(() => {});
  };

  function applyStatus(view: AttemptView): void {
    if (local && view.attemptId === local.attemptId) local.status = view.status;
    deps.onStatus(view);
  }

  /** Confirmation pages count only for an attempt started in this tab. */
  async function checkConfirmationPage(): Promise<void> {
    if (!doc.body || !deps.isConfirmationPage(doc)) return;
    let attemptId = local?.status === 'pending' ? local.attemptId : null;
    if (!attemptId) {
      const views = await deps.send({ type: 'SUBMISSION_STATUS_FOR_TAB' }).catch(() => []) as AttemptView[];
      const pending = Array.isArray(views) ? views.find(view => view.status === 'pending') : undefined;
      const settled = Array.isArray(views) ? views.find(view => view.status !== 'pending') : undefined;
      if (pending) attemptId = pending.attemptId;
      else {
        if (settled) applyStatus(settled);
        else if (!unattributedPrompted) { unattributedPrompted = true; deps.onUnattributedConfirmation(); }
        return;
      }
    }
    const response = await deps.send({ type: 'SUBMISSION_EVIDENCE', attemptId, kind: 'page' }).catch(() => null) as
      { attempt?: AttemptView } | null;
    if (response?.attempt) applyStatus(response.attempt);
  }

  return {
    start(): void {
      if (started) return;
      started = true;
      doc.addEventListener('click', onClick, true);
      doc.addEventListener('keydown', onKeydown, true);
      win.addEventListener(SUBMISSION_PAGE_EVENTS.result, onResult);
      // After a reload or navigation, show this tab's recent attempt state.
      void deps.send({ type: 'SUBMISSION_STATUS_FOR_TAB' }).then(views => {
        if (!Array.isArray(views) || !views.length) return;
        const latest = views[0] as AttemptView;
        if (latest.status === 'pending') local = { attemptId: latest.attemptId, jobUrl: '', at: now() - ATTEMPT_TTL_MS / 2, status: 'pending' };
        applyStatus(latest);
      }).catch(() => {});
    },
    stop(): void {
      started = false;
      doc.removeEventListener('click', onClick, true);
      doc.removeEventListener('keydown', onKeydown, true);
      win.removeEventListener(SUBMISSION_PAGE_EVENTS.result, onResult);
      for (const id of followUps) win.clearTimeout(id);
      followUps = [];
    },
    checkConfirmationPage,
    applyStatus,
    /** "I applied": recorded as a manual confirmation. */
    async confirmManually(): Promise<AttemptView | null> {
      const job = await deps.getJob();
      const response = await deps.send({ type: 'SUBMISSION_MANUAL_CONFIRM', attemptId: local?.attemptId, job })
        .catch(() => null) as { ok?: boolean; attempt?: AttemptView } | null;
      if (!response?.ok || !response.attempt) return null;
      applyStatus(response.attempt);
      return response.attempt;
    },
    currentAttemptId: () => local?.attemptId ?? null,
  };
}

export type SubmissionCoordinator = ReturnType<typeof createSubmissionCoordinator>;
