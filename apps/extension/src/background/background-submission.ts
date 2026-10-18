import { WEBSITE_URL } from '../shared/config';
import { getExtensionBearerToken } from './background-auth';
import { reportExtensionDiagnostic } from './background-diagnostics';
import { trackWidgetEvent } from './background-profile';
import { widgetSiteFamily } from '../widget/widget-platform';
import {
  ATTEMPTS_KEY,
  OUTBOX_KEY,
  createSubmissionLifecycle,
  type AttemptRecord,
  type AttemptView,
  type SubmissionLifecycle,
} from '../submission/submission-lifecycle';
import type { SubmissionTrackerUpdate } from '../submission/submission-protocol';
import { normalizeEffectiveConfig } from '../platform-config/remote-config';
import { baselineEffectiveConfig } from '../platform-config/remote-config-baseline';
import { EFFECTIVE_CONFIG_KEY } from './background-remote-config';

export const SUBMISSION_ALARM = 'tmo-submission-sweep';

/** The signed-in account an attempt belongs to (from our own bearer JWT). */
export function userIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { userId?: unknown; sub?: unknown };
    const id = typeof payload.userId === 'string' ? payload.userId : typeof payload.sub === 'string' ? payload.sub : null;
    return id && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
  } catch { return null; }
}

function randomAttemptId(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function postUpdate(update: SubmissionTrackerUpdate): Promise<{ status: number; applicationId?: string }> {
  let bearer = await getExtensionBearerToken();
  if (!bearer) return { status: 401 };
  const send = (token: string) => fetch(`${WEBSITE_URL}/api/extension/application-submission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(update),
  });
  let response = await send(bearer);
  if (response.status === 401) {
    bearer = await getExtensionBearerToken(true);
    if (!bearer) return { status: 401 };
    response = await send(bearer);
  }
  const body = (await response.json().catch(() => ({}))) as { application_id?: unknown };
  return {
    status: response.status,
    ...(typeof body.application_id === 'string' ? { applicationId: body.application_id } : {}),
  };
}

function submissionTelemetry(record: AttemptRecord): void {
  const outcome = record.status === 'pending' ? null : record.status;
  if (!outcome) return;
  let host = '';
  try { host = new URL(record.pageUrl).hostname; } catch { /* keep other */ }
  void trackWidgetEvent('extension_submission_outcome', {
    site_family: widgetSiteFamily(host),
    submission_outcome: outcome,
    confirmation_source: record.confirmation ?? 'none',
    evidence_kind: record.evidence?.kind ?? 'none',
    network_detector_mode: record.modes.workday_network,
    network_verdict: record.shadow?.verdict ?? record.evidence?.verdict ?? 'none',
  }).catch(() => {});
}

export function createChromeSubmissionLifecycle(): SubmissionLifecycle {
  return createSubmissionLifecycle({
    readSession: async () => (await chrome.storage.session.get(ATTEMPTS_KEY))[ATTEMPTS_KEY],
    writeSession: attempts => chrome.storage.session.set({ [ATTEMPTS_KEY]: attempts }),
    readOutbox: async () => (await chrome.storage.local.get(OUTBOX_KEY))[OUTBOX_KEY],
    writeOutbox: outbox => chrome.storage.local.set({ [OUTBOX_KEY]: outbox }),
    now: () => Date.now(),
    newAttemptId: randomAttemptId,
    userId: async () => userIdFromToken(await getExtensionBearerToken().catch(() => null)),
    config: async () => normalizeEffectiveConfig(
      (await chrome.storage.local.get(EFFECTIVE_CONFIG_KEY))[EFFECTIVE_CONFIG_KEY], baselineEffectiveConfig()),
    postUpdate,
    notifyTab: (tabId: number, view: AttemptView) => {
      void chrome.tabs.sendMessage(tabId, { type: 'TMO_SUBMISSION_STATUS', attempt: view }, { frameId: 0 }).catch(() => {});
    },
    report: input => { void reportExtensionDiagnostic(input); },
    telemetry: submissionTelemetry,
  });
}

/** Re-created on each worker start; alarms may not survive every restart path. */
export async function ensureSubmissionAlarm(): Promise<void> {
  if (!chrome.alarms) return;
  if (!(await chrome.alarms.get(SUBMISSION_ALARM).catch(() => undefined))) {
    await chrome.alarms.create(SUBMISSION_ALARM, { delayInMinutes: 1, periodInMinutes: 1 });
  }
}

/** Message routing; returns true when the response is asynchronous. */
export function handleSubmissionMessage(
  lifecycle: SubmissionLifecycle,
  message: { type?: string; [key: string]: unknown },
  sender: chrome.runtime.MessageSender,
  respond: (value: unknown) => void,
): boolean {
  const from = { tabId: sender.tab?.id, frameId: sender.frameId, url: sender.url };
  const reply = (work: Promise<unknown>) => { void work.then(respond).catch(() => respond({ ok: false, error: 'unavailable' })); return true; };
  // Only our own content scripts may drive the lifecycle; pages cannot message the worker.
  if (sender.id !== chrome.runtime.id || !sender.tab) return false;
  switch (message.type) {
    case 'SUBMISSION_ATTEMPT_BEGIN': return reply(lifecycle.begin(from, { job: message.job, proposedAttemptId: message.attemptId }));
    case 'SUBMISSION_EVIDENCE': return reply(lifecycle.evidence(from, { attemptId: message.attemptId, kind: message.kind, detail: message.detail }));
    case 'SUBMISSION_MANUAL_CONFIRM': return reply(lifecycle.manualConfirm(from, { attemptId: message.attemptId, job: message.job }));
    case 'SUBMISSION_STATUS_FOR_TAB': return reply(lifecycle.statusForTab(from));
    default: return false;
  }
}
