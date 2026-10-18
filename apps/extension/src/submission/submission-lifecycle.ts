/**
 * Background-owned application-attempt lifecycle.
 *
 *   pending ──network success (active detector) / confirmation page──▶ confirmed
 *      │  └─network application error / HTTP error (active detector)──▶ failed
 *      └─TTL passes with no success evidence────────────────────────▶ not_confirmed
 *   pending | not_confirmed | failed ──user confirms ("I applied")──▶ confirmed (manual)
 *
 * confirmed ──▶ tracker outbox ──▶ synced   (idempotent on attemptId)
 *                     └─ temporary failure: retried with backoff; the user
 *                        sees "Application submitted; tracker sync pending".
 *
 * Every attempt is bound to what the background observed itself: the sender
 * tab and frame, page URL, platform (from the sender's hostname, never from
 * the message), signed-in user, and job snapshot. Page events are untrusted.
 * Nothing here ever submits an application.
 */
import {
  ATTEMPT_TTL_MS,
  NETWORK_ARM_TTL_MS,
  isAttemptId,
  normalizeSubmissionJob,
  parseMonitorResultDetail,
  verdictOutcome,
  type ConfirmationSource,
  type NetworkVerdict,
  type SubmissionEvidence,
  type SubmissionJobSnapshot,
  type SubmissionStatus,
  type SubmissionTrackerUpdate,
} from './submission-protocol';
import {
  detectorMode,
  platformForHostname,
  type DetectorMode,
  type EffectiveExtensionConfig,
  type PlatformId,
} from '../platform-config/remote-config';
import type { DiagnosticCode, DiagnosticStage } from '../shared/diagnostics-protocol';

export const ATTEMPTS_KEY = 'tmo_submission_attempts_v1';
export const OUTBOX_KEY = 'tmo_tracker_outbox_v1';
const MAX_ATTEMPTS = 50;
const MAX_OUTBOX = 100;
const DUPLICATE_BEGIN_WINDOW_MS = 10_000;
const RETAIN_RESOLVED_MS = 24 * 60 * 60 * 1000;
const OUTBOX_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const OUTBOX_FIRST_RETRY_MS = 60_000;
const OUTBOX_MAX_RETRY_MS = 6 * 60 * 60 * 1000;

export type SyncState = 'not_required' | 'pending' | 'synced' | 'signed_out' | 'abandoned' | 'rejected';

export interface AttemptRecord {
  attemptId: string;
  tabId: number;
  frameId: number;
  pageUrl: string;
  platform: PlatformId;
  userId: string | null;
  job: SubmissionJobSnapshot;
  createdAt: number;
  expiresAt: number;
  status: SubmissionStatus;
  modes: { workday_network: DetectorMode; page_confirmation: DetectorMode };
  ruleVersion: string;
  evidence?: SubmissionEvidence;
  confirmation?: ConfirmationSource;
  resolvedAt?: number;
  shadow?: { verdict: NetworkVerdict; status: number };
  sync: SyncState;
  applicationId?: string;
}

export interface OutboxEntry {
  update: SubmissionTrackerUpdate;
  userId: string;
  tries: number;
  queuedAt: number;
  nextAttemptAt: number;
}

/** What a page may learn about its own tab's attempts. */
export interface AttemptView {
  attemptId: string;
  status: SubmissionStatus;
  confirmation: ConfirmationSource | null;
  sync: SyncState;
  roleTitle: string;
  companyName: string;
  canArmNetwork: boolean;
}

export interface Sender { tabId?: number; frameId?: number; url?: string }

export interface LifecycleDeps {
  readSession: () => Promise<Record<string, AttemptRecord> | undefined>;
  writeSession: (attempts: Record<string, AttemptRecord>) => Promise<void>;
  readOutbox: () => Promise<Record<string, OutboxEntry> | undefined>;
  writeOutbox: (outbox: Record<string, OutboxEntry>) => Promise<void>;
  now: () => number;
  newAttemptId: () => string;
  userId: () => Promise<string | null>;
  config: () => Promise<EffectiveExtensionConfig>;
  postUpdate: (update: SubmissionTrackerUpdate) => Promise<{ status: number; applicationId?: string }>;
  notifyTab: (tabId: number, view: AttemptView) => void;
  report: (input: { code: DiagnosticCode; stage: DiagnosticStage; platform?: PlatformId; status?: number }) => void;
  telemetry: (record: AttemptRecord) => void;
}

function viewOf(record: AttemptRecord): AttemptView {
  return {
    attemptId: record.attemptId, status: record.status, confirmation: record.confirmation ?? null, sync: record.sync,
    roleTitle: record.job.role_title, companyName: record.job.company_name,
    canArmNetwork: record.status === 'pending' && record.platform === 'workday' && record.modes.workday_network !== 'off',
  };
}

function strongerMode(left: DetectorMode, right: DetectorMode): DetectorMode {
  const order: DetectorMode[] = ['off', 'shadow', 'active'];
  return order[Math.min(order.indexOf(left), order.indexOf(right))];
}

export function outboxRetryDelay(tries: number): number {
  return Math.min(OUTBOX_MAX_RETRY_MS, OUTBOX_FIRST_RETRY_MS * 2 ** Math.max(0, tries - 1));
}

function originOf(url: string): string | null {
  try { return new URL(url).origin; } catch { return null; }
}

export function createSubmissionLifecycle(deps: LifecycleDeps) {
  let queue: Promise<unknown> = Promise.resolve();
  /** All mutations run one at a time so tabs and messages cannot race. */
  const serialized = <T>(task: () => Promise<T>): Promise<T> => {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  };
  const load = async () => {
    const attempts = { ...((await deps.readSession()) ?? {}) };
    const now = deps.now();
    for (const [id, record] of Object.entries(attempts)) {
      if (!record || typeof record !== 'object' || !isAttemptId(record.attemptId)) delete attempts[id];
      else if (record.status !== 'pending' && now - (record.resolvedAt ?? record.createdAt) > RETAIN_RESOLVED_MS) delete attempts[id];
    }
    return attempts;
  };
  const save = async (attempts: Record<string, AttemptRecord>) => {
    const entries = Object.entries(attempts).sort((a, b) => b[1].createdAt - a[1].createdAt).slice(0, MAX_ATTEMPTS);
    await deps.writeSession(Object.fromEntries(entries));
  };
  const senderOk = (sender: Sender): sender is Required<Sender> =>
    Number.isInteger(sender.tabId) && sender.frameId === 0 && typeof sender.url === 'string' && sender.url.startsWith('https://');

  const resolve = (record: AttemptRecord, status: SubmissionStatus) => {
    record.status = status;
    record.resolvedAt = deps.now();
    deps.telemetry(record);
  };

  const enqueue = async (record: AttemptRecord) => {
    if (!record.userId) { record.sync = 'signed_out'; return; }
    const outbox = { ...((await deps.readOutbox()) ?? {}) };
    if (!outbox[record.attemptId]) {
      outbox[record.attemptId] = {
        userId: record.userId,
        tries: 0,
        queuedAt: deps.now(),
        nextAttemptAt: 0,
        update: {
          attempt_id: record.attemptId,
          confirmation: record.confirmation!,
          confirmed_at: new Date(record.resolvedAt ?? deps.now()).toISOString(),
          evidence: record.evidence!,
          job: record.job,
          ...(record.applicationId ? { application_id: record.applicationId } : {}),
        },
      };
      const kept = Object.entries(outbox).sort((a, b) => b[1].queuedAt - a[1].queuedAt).slice(0, MAX_OUTBOX);
      await deps.writeOutbox(Object.fromEntries(kept));
    }
    record.sync = 'pending';
  };

  const confirm = async (record: AttemptRecord, confirmation: ConfirmationSource, evidence: SubmissionEvidence) => {
    record.confirmation = confirmation;
    record.evidence = evidence;
    resolve(record, 'confirmed');
    await enqueue(record);
  };

  async function flushOutboxUnlocked(): Promise<void> {
    const outbox = { ...((await deps.readOutbox()) ?? {}) };
    const attempts = await load();
    const now = deps.now();
    const currentUser = await deps.userId();
    let changed = false;
    for (const [attemptId, entry] of Object.entries(outbox)) {
      const record = attempts[attemptId];
      const setSync = (sync: SyncState, applicationId?: string) => {
        if (!record) return;
        record.sync = sync;
        if (applicationId) record.applicationId = applicationId;
        deps.notifyTab(record.tabId, viewOf(record));
      };
      if (now - entry.queuedAt > OUTBOX_MAX_AGE_MS) {
        delete outbox[attemptId]; changed = true;
        deps.report({ code: 'tracker_sync_abandoned', stage: 'network', platform: entry.update.evidence.platform });
        setSync('abandoned');
        continue;
      }
      if (entry.nextAttemptAt > now) continue;
      // Never write one account's application into another signed-in account.
      if (!currentUser || currentUser !== entry.userId) { setSync('signed_out'); continue; }
      let result: { status: number; applicationId?: string };
      try { result = await deps.postUpdate(entry.update); } catch { result = { status: 0 }; }
      if (result.status >= 200 && result.status < 300) {
        delete outbox[attemptId]; changed = true;
        setSync('synced', result.applicationId);
      } else if (result.status === 401) {
        entry.nextAttemptAt = now + OUTBOX_FIRST_RETRY_MS; changed = true;
        setSync('signed_out');
      } else if (result.status >= 400 && result.status < 500 && result.status !== 408 && result.status !== 429) {
        // The server rejected this update (validation, ownership): retrying cannot help.
        delete outbox[attemptId]; changed = true;
        deps.report({ code: 'tracker_sync_failed', stage: 'http', platform: entry.update.evidence.platform, status: result.status });
        setSync('rejected');
      } else {
        entry.tries += 1;
        entry.nextAttemptAt = now + outboxRetryDelay(entry.tries);
        changed = true;
        if (entry.tries === 1 || entry.tries % 5 === 0) {
          deps.report({ code: 'tracker_sync_failed', stage: result.status ? 'http' : 'network', platform: entry.update.evidence.platform, status: result.status });
        }
        setSync('pending');
      }
    }
    if (changed) await deps.writeOutbox(outbox);
    await save(attempts);
  }

  return {
    /** A trusted Submit activation was observed in a top-level https page. */
    begin(sender: Sender, input: { job: unknown; proposedAttemptId?: unknown }): Promise<{ ok: true; attempt: AttemptView; ruleVersion: string } | { ok: false; error: string }> {
      return serialized(async () => {
        if (!senderOk(sender)) return { ok: false, error: 'invalid_sender' };
        const job = normalizeSubmissionJob(input.job);
        if (!job) return { ok: false, error: 'invalid_job' };
        const attempts = await load();
        const now = deps.now();
        const duplicate = Object.values(attempts).find(record => record.tabId === sender.tabId &&
          record.status === 'pending' && record.job.job_url === job.job_url && now - record.createdAt < DUPLICATE_BEGIN_WINDOW_MS);
        const config = await deps.config();
        if (duplicate) return { ok: true, attempt: viewOf(duplicate), ruleVersion: duplicate.ruleVersion };
        const platform = platformForHostname(new URL(sender.url).hostname);
        // The content script arms the page monitor synchronously in the click
        // turn, so it proposes the id; it is accepted only if well-formed and new.
        const attemptId = isAttemptId(input.proposedAttemptId) && !attempts[input.proposedAttemptId]
          ? input.proposedAttemptId : deps.newAttemptId();
        const record: AttemptRecord = {
          attemptId, tabId: sender.tabId, frameId: sender.frameId, pageUrl: sender.url, platform,
          userId: await deps.userId(), job, createdAt: now, expiresAt: now + ATTEMPT_TTL_MS, status: 'pending',
          modes: { workday_network: platform === 'workday' ? detectorMode(config, 'workday_network') : 'off',
            page_confirmation: detectorMode(config, 'page_confirmation') },
          ruleVersion: config.ruleVersion, sync: 'not_required',
        };
        attempts[record.attemptId] = record;
        await save(attempts);
        return { ok: true, attempt: viewOf(record), ruleVersion: record.ruleVersion };
      });
    },

    /** Untrusted evidence relayed by the isolated content script. */
    evidence(sender: Sender, input: { attemptId: unknown; kind: unknown; detail?: unknown }): Promise<{ ok: boolean; attempt?: AttemptView; error?: string }> {
      return serialized(async () => {
        if (!Number.isInteger(sender.tabId) || !isAttemptId(input.attemptId)) return { ok: false, error: 'invalid' };
        const attempts = await load();
        const record = attempts[input.attemptId];
        const now = deps.now();
        if (!record || record.tabId !== sender.tabId || sender.frameId !== record.frameId) return { ok: false, error: 'unknown_attempt' };
        if (record.status !== 'pending') return { ok: true, attempt: viewOf(record) };
        if (now > record.expiresAt) return { ok: false, error: 'expired' };
        const config = await deps.config();
        if (input.kind === 'network') {
          const detail = parseMonitorResultDetail(input.detail);
          const mode = strongerMode(record.modes.workday_network, detectorMode(config, 'workday_network'));
          const valid = detail && detail.attemptId === record.attemptId && record.platform === 'workday' &&
            // The page monitor requires the exact page URL when the request starts;
            // a single-page app may update its URL before the result arrives.
            !!sender.url && originOf(sender.url) === originOf(record.pageUrl) &&
            now - record.createdAt <= NETWORK_ARM_TTL_MS + 5_000 &&
            detail.requestStartedAt >= record.createdAt - 2_000;
          if (!valid) {
            deps.report({ code: 'submission_result_rejected', stage: 'validation', platform: record.platform });
            return { ok: false, error: 'rejected' };
          }
          if (mode === 'off') return { ok: true, attempt: viewOf(record) };
          if (mode === 'shadow') {
            record.shadow ??= { verdict: detail.verdict, status: detail.status };
          } else {
            const outcome = verdictOutcome(detail.verdict);
            const evidence: SubmissionEvidence = { kind: 'network', platform: record.platform, detector: 'workday_network',
              verdict: detail.verdict, status: detail.status, ruleVersion: config.ruleVersion };
            if (outcome === 'confirmed') await confirm(record, 'automatic', evidence);
            else if (outcome === 'failed') { record.evidence = evidence; resolve(record, 'failed'); }
            else record.shadow ??= { verdict: detail.verdict, status: detail.status };
          }
        } else if (input.kind === 'page') {
          const mode = strongerMode(record.modes.page_confirmation, detectorMode(config, 'page_confirmation'));
          // A confirmation page may be a new document in the same tab and site.
          if (mode !== 'active' || !sender.url || originOf(sender.url) !== originOf(record.pageUrl)) {
            return { ok: true, attempt: viewOf(record) };
          }
          await confirm(record, 'automatic', { kind: 'page', platform: record.platform, detector: 'page_confirmation', ruleVersion: config.ruleVersion });
        } else return { ok: false, error: 'invalid' };
        await save(attempts);
        if ((record.status as SubmissionStatus) === 'confirmed') await flushOutboxUnlocked();
        const latest = (await load())[record.attemptId] ?? record;
        deps.notifyTab(latest.tabId, viewOf(latest));
        return { ok: true, attempt: viewOf(latest) };
      });
    },

    /** The applicant says they applied. Recorded as a manual confirmation. */
    manualConfirm(sender: Sender, input: { attemptId?: unknown; job: unknown }): Promise<{ ok: boolean; attempt?: AttemptView; error?: string }> {
      return serialized(async () => {
        if (!senderOk(sender)) return { ok: false, error: 'invalid_sender' };
        const attempts = await load();
        const config = await deps.config();
        let record = isAttemptId(input.attemptId) ? attempts[input.attemptId] : undefined;
        if (record && record.tabId !== sender.tabId) return { ok: false, error: 'unknown_attempt' };
        if (record?.status === 'confirmed') return { ok: true, attempt: viewOf(record) };
        if (!record) {
          const job = normalizeSubmissionJob(input.job);
          if (!job) return { ok: false, error: 'invalid_job' };
          const now = deps.now();
          record = {
            attemptId: deps.newAttemptId(), tabId: sender.tabId, frameId: sender.frameId, pageUrl: sender.url,
            platform: platformForHostname(new URL(sender.url).hostname), userId: await deps.userId(), job,
            createdAt: now, expiresAt: now, status: 'pending', modes: { workday_network: 'off', page_confirmation: 'off' },
            ruleVersion: config.ruleVersion, sync: 'not_required',
          };
          attempts[record.attemptId] = record;
        }
        record.userId ??= await deps.userId();
        await confirm(record, 'manual', { kind: 'manual', platform: record.platform, detector: 'manual', ruleVersion: config.ruleVersion });
        await save(attempts);
        await flushOutboxUnlocked();
        const latest = (await load())[record.attemptId] ?? record;
        deps.notifyTab(latest.tabId, viewOf(latest));
        return { ok: true, attempt: viewOf(latest) };
      });
    },

    /** Recent attempts for the sender's own tab (after reloads or navigation). */
    statusForTab(sender: Sender): Promise<AttemptView[]> {
      return serialized(async () => {
        if (!Number.isInteger(sender.tabId)) return [];
        const attempts = await load();
        const now = deps.now();
        return Object.values(attempts)
          .filter(record => record.tabId === sender.tabId && now - record.createdAt <= ATTEMPT_TTL_MS * 2)
          .sort((a, b) => b.createdAt - a.createdAt).slice(0, 3).map(viewOf);
      });
    },

    /** Expire pending attempts and retry due tracker updates. */
    sweep(): Promise<void> {
      return serialized(async () => {
        const attempts = await load();
        const now = deps.now();
        for (const record of Object.values(attempts)) {
          if (record.status === 'pending' && now > record.expiresAt) {
            resolve(record, 'not_confirmed');
            deps.notifyTab(record.tabId, viewOf(record));
          }
        }
        await save(attempts);
        await flushOutboxUnlocked();
      });
    },

    flushOutbox(): Promise<void> { return serialized(flushOutboxUnlocked); },

    /** A closed tab's pending attempts can no longer produce evidence. */
    tabClosed(tabId: number): Promise<void> {
      return serialized(async () => {
        const attempts = await load();
        for (const record of Object.values(attempts)) {
          if (record.tabId === tabId && record.status === 'pending') resolve(record, 'not_confirmed');
        }
        await save(attempts);
      });
    },
  };
}

export type SubmissionLifecycle = ReturnType<typeof createSubmissionLifecycle>;
