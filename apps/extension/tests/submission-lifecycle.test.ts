import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSubmissionLifecycle,
  outboxRetryDelay,
  type AttemptRecord,
  type AttemptView,
  type OutboxEntry,
} from '../src/submission/submission-lifecycle';
import { resolveEffectiveConfig, type EffectiveExtensionConfig } from '../src/platform-config/remote-config';
import { BASELINE_CONFIG } from '../src/platform-config/remote-config-baseline';
import type { SubmissionTrackerUpdate } from '../src/submission/submission-protocol';

const PAGE = 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1/apply';
const USER = '11111111-1111-4111-8111-111111111111';
const OTHER_USER = '22222222-2222-4222-8222-222222222222';
const JOB = { company_name: 'Acme', role_title: 'Data Analyst', job_url: 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1' };

function configWith(mode: 'off' | 'shadow' | 'active', extra: Partial<EffectiveExtensionConfig> = {}): EffectiveExtensionConfig {
  const config = resolveEffectiveConfig({ baseline: BASELINE_CONFIG, stored: null, now: 0, extensionVersion: '0.2.4' });
  return { ...config, detectors: { ...config.detectors, workday_network: mode }, ...extra };
}

function world(options: { mode?: 'off' | 'shadow' | 'active'; post?: (update: SubmissionTrackerUpdate) => { status: number; applicationId?: string } } = {}) {
  const storage = { session: {} as Record<string, AttemptRecord>, outbox: {} as Record<string, OutboxEntry> };
  let now = 1_000_000;
  let ids = 0;
  let user: string | null = USER;
  let config = configWith(options.mode ?? 'active');
  const posts: SubmissionTrackerUpdate[] = [];
  const notifications: Array<{ tabId: number; view: AttemptView }> = [];
  const reports: string[] = [];
  const telemetry: string[] = [];
  let post = options.post ?? (() => ({ status: 200, applicationId: 'app-1' }));
  const make = () => createSubmissionLifecycle({
    readSession: async () => structuredClone(storage.session),
    writeSession: async value => { storage.session = structuredClone(value); },
    readOutbox: async () => structuredClone(storage.outbox),
    writeOutbox: async value => { storage.outbox = structuredClone(value); },
    now: () => now,
    newAttemptId: () => `attempt_${String(++ids).padStart(16, '0')}`,
    userId: async () => user,
    config: async () => config,
    postUpdate: async update => { posts.push(update); return post(update); },
    notifyTab: (tabId, view) => notifications.push({ tabId, view }),
    report: input => reports.push(`${input.code}:${input.stage}`),
    telemetry: record => telemetry.push(`${record.status}:${record.confirmation ?? 'none'}:${record.shadow?.verdict ?? record.evidence?.verdict ?? 'none'}`),
  });
  return {
    storage, posts, notifications, reports, telemetry, lifecycle: make(), restart: make,
    advance: (ms: number) => { now += ms; },
    get now() { return now; },
    setUser: (value: string | null) => { user = value; },
    setConfig: (value: EffectiveExtensionConfig) => { config = value; },
    setPost: (value: typeof post) => { post = value; },
  };
}

const sender = (tabId = 7, url = PAGE, frameId = 0) => ({ tabId, frameId, url });
const result = (attemptId: string, verdict: string, startedAt: number, status = 200) => JSON.stringify({
  protocol: 1, detector: 'workday_network', attemptId, verdict, status, requestStartedAt: startedAt, observedAt: startedAt + 10,
});

async function begin(w: ReturnType<typeof world>, tab = 7) {
  const started = await w.lifecycle.begin(sender(tab), { job: JOB });
  assert.equal(started.ok, true);
  return (started as { attempt: AttemptView }).attempt;
}

test('an active detector confirms only on success evidence and syncs once', async () => {
  const w = world();
  const attempt = await begin(w);
  assert.equal(attempt.canArmNetwork, true);
  const confirmed = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: result(attempt.attemptId, 'success', w.now) });
  assert.equal(confirmed.attempt?.status, 'confirmed');
  assert.equal(confirmed.attempt?.confirmation, 'automatic');
  assert.equal(confirmed.attempt?.sync, 'synced');
  assert.equal(w.posts.length, 1);
  assert.equal(w.posts[0].attempt_id, attempt.attemptId, 'attempt id is the idempotency key');
  assert.deepEqual(Object.keys(w.posts[0].evidence).sort(), ['detector', 'kind', 'platform', 'ruleVersion', 'status', 'verdict']);
  assert.equal(JSON.stringify(w.posts[0]).includes('description'), false, 'no job description or response body');
  // Duplicate or late evidence cannot double-count.
  await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: result(attempt.attemptId, 'success', w.now) });
  assert.equal(w.posts.length, 1);
});

test('application errors fail the attempt; inconclusive results wait for other evidence', async () => {
  const w = world();
  const failed = await begin(w);
  const outcome = await w.lifecycle.evidence(sender(), { attemptId: failed.attemptId, kind: 'network', detail: result(failed.attemptId, 'application_error', w.now) });
  assert.equal(outcome.attempt?.status, 'failed');
  assert.equal(w.posts.length, 0, 'a failure never marks Applied');

  const w2 = world();
  const unsure = await begin(w2);
  const pending = await w2.lifecycle.evidence(sender(), { attemptId: unsure.attemptId, kind: 'network', detail: result(unsure.attemptId, 'malformed', w2.now) });
  assert.equal(pending.attempt?.status, 'pending');
  const viaPage = await w2.lifecycle.evidence(sender(7, 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1/apply/confirmation'),
    { attemptId: unsure.attemptId, kind: 'page' });
  assert.equal(viaPage.attempt?.status, 'confirmed', 'the scoped confirmation-page fallback still applies');
});

test('shadow mode records the network verdict without changing the outcome', async () => {
  const w = world({ mode: 'shadow' });
  const attempt = await begin(w);
  const shadow = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: result(attempt.attemptId, 'success', w.now) });
  assert.equal(shadow.attempt?.status, 'pending');
  assert.equal(w.posts.length, 0);
  w.advance(16 * 60 * 1000);
  await w.lifecycle.sweep();
  assert.equal(w.storage.session[attempt.attemptId].status, 'not_confirmed');
  assert.deepEqual(w.telemetry, ['not_confirmed:none:success'], 'agreement data is reported value-free');
});

test('a detector killed mid-attempt stops accepting network evidence', async () => {
  const w = world({ mode: 'active' });
  const attempt = await begin(w);
  w.setConfig(configWith('active', { killSwitches: { detectors: { workday_network: { disabled: true, reason: 'incident' } } } }));
  const ignored = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: result(attempt.attemptId, 'success', w.now) });
  assert.equal(ignored.attempt?.status, 'pending');
  assert.equal(w.posts.length, 0);
});

test('evidence from another tab, frame, origin, or a stale request is rejected', async () => {
  const w = world();
  const attempt = await begin(w);
  const detail = result(attempt.attemptId, 'success', w.now);
  assert.equal((await w.lifecycle.evidence(sender(8), { attemptId: attempt.attemptId, kind: 'network', detail })).ok, false);
  assert.equal((await w.lifecycle.evidence(sender(7, PAGE, 3), { attemptId: attempt.attemptId, kind: 'network', detail })).ok, false);
  assert.equal((await w.lifecycle.evidence(sender(7, 'https://evil.example/x'), { attemptId: attempt.attemptId, kind: 'network', detail })).ok, false);
  assert.equal((await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: result(attempt.attemptId, 'success', w.now - 60_000) })).ok, false);
  assert.equal((await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: result('attempt_9999999999999999', 'success', w.now) })).ok, false);
  assert.equal((await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'network', detail: '{"protocol":1}' })).ok, false);
  w.advance(16 * 60 * 1000);
  assert.equal((await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' })).error, 'expired');
  assert.equal(w.posts.length, 0);
  assert.ok(w.reports.every(report => report === 'submission_result_rejected:validation'));
});

test('duplicate clicks reuse one attempt; separate tabs stay separate', async () => {
  const w = world();
  const first = await begin(w, 7);
  const again = await begin(w, 7);
  const otherTab = await begin(w, 9);
  assert.equal(first.attemptId, again.attemptId);
  assert.notEqual(first.attemptId, otherTab.attemptId);
  w.advance(11_000);
  const retry = await begin(w, 7);
  assert.notEqual(retry.attemptId, first.attemptId, 'a deliberate retry later is a new attempt');
  await w.lifecycle.evidence(sender(9), { attemptId: otherTab.attemptId, kind: 'page' });
  assert.equal(w.storage.session[first.attemptId].status, 'pending');
  assert.equal(w.storage.session[otherTab.attemptId].status, 'confirmed');
});

test('top-frame https senders only', async () => {
  const w = world();
  assert.equal((await w.lifecycle.begin(sender(7, PAGE, 2), { job: JOB })).ok, false);
  assert.equal((await w.lifecycle.begin(sender(7, 'http://acme.example/apply'), { job: JOB })).ok, false);
  assert.equal((await w.lifecycle.begin(sender(7), { job: { ...JOB, job_url: 'javascript:alert(1)' } })).ok, false);
});

test('tracker sync failure keeps the confirmed success locally and retries without duplicates', async () => {
  let fail = true;
  const w = world({ post: () => fail ? { status: 503 } : { status: 200, applicationId: 'app-9' } });
  const attempt = await begin(w);
  const confirmed = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  assert.equal(confirmed.attempt?.status, 'confirmed', 'never reported as a failed application');
  assert.equal(confirmed.attempt?.sync, 'pending', 'UI shows "tracker sync pending"');
  assert.ok(w.storage.outbox[attempt.attemptId]);
  await w.lifecycle.sweep();
  assert.equal(w.posts.length, 1, 'backoff prevents immediate re-posting');
  fail = false;
  w.advance(outboxRetryDelay(1) + 1);
  await w.lifecycle.sweep();
  assert.equal(w.posts.length, 2);
  assert.equal(w.posts[0].attempt_id, w.posts[1].attempt_id, 'retries reuse the idempotency key');
  assert.equal(w.storage.outbox[attempt.attemptId], undefined);
  assert.equal(w.storage.session[attempt.attemptId].sync, 'synced');
  assert.deepEqual(w.reports, ['tracker_sync_failed:http']);
});

test('service-worker restarts keep attempts and the outbox', async () => {
  const w = world({ post: () => ({ status: 0 }) });
  const attempt = await begin(w);
  const restarted = w.restart();
  const confirmed = await restarted.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  assert.equal(confirmed.attempt?.status, 'confirmed');
  w.setPost(() => ({ status: 200 }));
  w.advance(outboxRetryDelay(1) + 1);
  await w.restart().sweep();
  assert.equal(w.storage.session[attempt.attemptId].sync, 'synced');
});

test('a different signed-in account never receives another account\'s update', async () => {
  const w = world({ post: () => ({ status: 0 }) });
  const attempt = await begin(w);
  await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  w.setUser(OTHER_USER);
  w.setPost(() => ({ status: 200 }));
  w.advance(outboxRetryDelay(1) + 1);
  await w.lifecycle.sweep();
  assert.equal(w.posts.length, 1, 'only the original failed post');
  assert.equal(w.storage.session[attempt.attemptId].sync, 'signed_out');
  w.setUser(USER);
  await w.lifecycle.sweep();
  assert.equal(w.storage.session[attempt.attemptId].sync, 'synced');
});

test('server rejections (unauthorized ownership, validation) are not retried forever', async () => {
  const w = world({ post: () => ({ status: 404 }) });
  const attempt = await begin(w);
  const confirmed = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  assert.equal(confirmed.attempt?.sync, 'rejected');
  assert.equal(w.storage.outbox[attempt.attemptId], undefined);
  assert.deepEqual(w.reports, ['tracker_sync_failed:http']);
});

test('manual confirmation is recorded as manual, including after "not confirmed"', async () => {
  const w = world({ mode: 'shadow' });
  const attempt = await begin(w);
  w.advance(16 * 60 * 1000);
  await w.lifecycle.sweep();
  const manual = await w.lifecycle.manualConfirm(sender(), { attemptId: attempt.attemptId, job: JOB });
  assert.equal(manual.attempt?.confirmation, 'manual');
  assert.equal(w.posts[0].confirmation, 'manual');
  assert.equal(w.posts[0].evidence.kind, 'manual');
  const standalone = await w.lifecycle.manualConfirm(sender(), { job: JOB });
  assert.equal(standalone.attempt?.status, 'confirmed');
  assert.notEqual(standalone.attempt?.attemptId, attempt.attemptId);
  const otherTab = await w.lifecycle.manualConfirm(sender(9), { attemptId: attempt.attemptId, job: JOB });
  assert.equal(otherTab.ok, false);
});

test('signed-out confirmations stay local until that user signs in', async () => {
  const w = world();
  w.setUser(null);
  const attempt = await begin(w);
  const confirmed = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  assert.equal(confirmed.attempt?.sync, 'signed_out');
  assert.equal(w.posts.length, 0);
});

test('page confirmation disabled by config falls back to manual confirmation', async () => {
  const w = world();
  w.setConfig(configWith('active', { killSwitches: { detectors: { page_confirmation: { disabled: true, reason: 'site_change' } } } }));
  const attempt = await begin(w);
  const page = await w.lifecycle.evidence(sender(), { attemptId: attempt.attemptId, kind: 'page' });
  assert.equal(page.attempt?.status, 'pending');
});

test('closed tabs resolve their pending attempts as not confirmed', async () => {
  const w = world();
  const attempt = await begin(w);
  await w.lifecycle.tabClosed(7);
  assert.equal(w.storage.session[attempt.attemptId].status, 'not_confirmed');
  const views = await w.lifecycle.statusForTab({ tabId: 7 });
  assert.equal(views[0].status, 'not_confirmed');
  assert.deepEqual(await w.lifecycle.statusForTab({ tabId: 8 }), []);
});
