import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { installSubmissionMonitor } from '../src/submission/page-monitor';
import { createSubmissionCoordinator } from '../src/submission/submission-coordinator';
import { createSubmissionLifecycle, type AttemptView } from '../src/submission/submission-lifecycle';
import {
  SUBMIT_LABEL_RE,
  WORKDAY_SUBMIT_SELECTOR,
  classifyWorkdayFinalizeResponse,
  matchWorkdayFinalizeRequest,
} from '../src/submission/workday-submission-rules';
import { resolveEffectiveConfig, type EffectiveExtensionConfig } from '../src/platform-config/remote-config';
import { BASELINE_CONFIG } from '../src/platform-config/remote-config-baseline';
import { isApplicationSuccessPage } from '../src/job-portal/job-portal-application-success';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');
const WORKDAY = 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1/apply/applyManually';
const JOB = { company_name: 'Acme', role_title: 'Data Analyst', job_url: 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1' };

function config(mode: 'off' | 'shadow' | 'active'): EffectiveExtensionConfig {
  const base = resolveEffectiveConfig({ baseline: BASELINE_CONFIG, stored: null, now: 0, extensionVersion: '0.2.4' });
  return { ...base, detectors: { ...base.detectors, workday_network: mode } };
}

/** One tab: real monitor + coordinator + lifecycle, with the site's own handler. */
function tab(options: { url?: string; html?: string; mode?: 'off' | 'shadow' | 'active'; reply?: () => Response; job?: typeof JOB | null } = {}) {
  const url = options.url ?? WORKDAY;
  const dom = new JSDOM(options.html ?? `<main><div data-automation-id="applyFlowPage"><h2>Review</h2>
    <button data-automation-id="pageFooterNextButton" type="button">Submit</button></div></main>`, { url });
  const win = dom.window;
  const effective = config(options.mode ?? 'active');
  const storage: Record<string, unknown> = {};
  const outbox: Record<string, unknown> = {};
  const posts: unknown[] = [];
  const statuses: AttemptView[] = [];
  let prompts = 0;
  const lifecycle = createSubmissionLifecycle({
    readSession: async () => structuredClone(storage) as never,
    writeSession: async value => { for (const key of Object.keys(storage)) delete storage[key]; Object.assign(storage, structuredClone(value)); },
    readOutbox: async () => structuredClone(outbox) as never,
    writeOutbox: async value => { for (const key of Object.keys(outbox)) delete outbox[key]; Object.assign(outbox, structuredClone(value)); },
    now: () => Date.now(),
    newAttemptId: () => `server_${Math.random().toString(36).slice(2).padEnd(16, '0')}`,
    userId: async () => '11111111-1111-4111-8111-111111111111',
    config: async () => effective,
    postUpdate: async update => { posts.push(update); return { status: 200, applicationId: 'app-1' }; },
    notifyTab: () => {},
    report: () => {},
    telemetry: () => {},
  });
  const sender = () => ({ tabId: 3, frameId: 0, url: win.location.href });
  const send = async (message: Record<string, unknown>) => {
    switch (message.type) {
      case 'SUBMISSION_ATTEMPT_BEGIN': return lifecycle.begin(sender(), { job: message.job, proposedAttemptId: message.attemptId });
      case 'SUBMISSION_EVIDENCE': return lifecycle.evidence(sender(), { attemptId: message.attemptId, kind: message.kind, detail: message.detail });
      case 'SUBMISSION_MANUAL_CONFIRM': return lifecycle.manualConfirm(sender(), { attemptId: message.attemptId, job: message.job });
      case 'SUBMISSION_STATUS_FOR_TAB': return lifecycle.statusForTab(sender());
      default: return null;
    }
  };
  // The page world: monitor installed at document_start, then the site's own
  // submit handler, which sends the finalize request in the click turn.
  const siteFetch = async () => options.reply?.() ?? new Response(JSON.stringify({ id: 'app-77' }), { status: 200 });
  win.fetch = siteFetch as never;
  installSubmissionMonitor(win, {
    detector: 'workday_network',
    isSubmitControl: element => element.matches(WORKDAY_SUBMIT_SELECTOR) && SUBMIT_LABEL_RE.test(element.textContent!.trim()),
    matchRequest: matchWorkdayFinalizeRequest,
    classify: classifyWorkdayFinalizeResponse,
  }, { isTrusted: () => true });
  const coordinator = createSubmissionCoordinator({
    win, send, getJob: () => options.job === undefined ? JOB : options.job,
    config: () => effective, isConfirmationPage: isApplicationSuccessPage,
    findApplicationRoot: () => win.document.querySelector('form, [data-automation-id="applyFlowPage"]'),
    onStatus: view => statuses.push(view), onUnattributedConfirmation: () => { prompts += 1; },
    isTrusted: () => true,
  });
  coordinator.start();
  const submit = win.document.querySelector('button') as HTMLButtonElement | null;
  submit?.addEventListener('click', () => {
    void win.fetch('/wday/cxs/acme/jobapplication/abc123/finalize', { method: 'POST', body: '{}' });
  });
  const settle = () => new Promise(done => setTimeout(done, 40));
  return { win, dom, submit, coordinator, storage, posts, statuses, settle, get prompts() { return prompts; } };
}

test('Workday: the click arms the monitor in time for a request sent in the same turn', async () => {
  const t = tab();
  t.submit!.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  const last = t.statuses.at(-1)!;
  assert.equal(last.status, 'confirmed');
  assert.equal(last.confirmation, 'automatic');
  assert.equal(last.sync, 'synced');
  assert.equal(t.posts.length, 1);
  t.dom.window.close();
});

test('Workday shadow mode observes the success but leaves the decision to page evidence', async () => {
  const t = tab({ mode: 'shadow' });
  t.submit!.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  assert.equal(t.statuses.at(-1)!.status, 'pending');
  assert.equal(t.posts.length, 0);
  // Workday then renders its confirmation inside the same single-page app.
  t.win.document.body.innerHTML = '<div data-automation-id="applicationConfirmationPage"><h2>Application submitted</h2></div>';
  await t.coordinator.checkConfirmationPage();
  assert.equal(t.statuses.at(-1)!.status, 'confirmed');
  assert.equal(t.posts.length, 1);
  t.dom.window.close();
});

test('Workday errors in an HTTP 200 response mark the submission failed, not applied', async () => {
  const t = tab({ reply: () => new Response(JSON.stringify({ errors: [{ message: 'Required' }] }), { status: 200 }) });
  t.submit!.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  assert.equal(t.statuses.at(-1)!.status, 'failed');
  assert.equal(t.posts.length, 0);
  // The applicant can still record that they submitted it.
  const manual = await t.coordinator.confirmManually();
  assert.equal(manual?.confirmation, 'manual');
  t.dom.window.close();
});

test('keyboard Enter on the Submit button is a supported submission path', async () => {
  const t = tab();
  t.submit!.focus();
  t.submit!.dispatchEvent(new t.win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  t.submit!.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0, detail: 0 }));
  await t.settle();
  assert.equal(t.statuses.at(-1)!.status, 'confirmed');
  assert.equal(t.posts.length, 1, 'keydown and its click form one attempt');
  t.dom.window.close();
});

test('rapid duplicate clicks create one attempt and one tracker update', async () => {
  const t = tab({ mode: 'shadow' });
  for (let i = 0; i < 3; i += 1) t.submit!.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  assert.equal(Object.keys(t.storage).length, 1);
  t.dom.window.close();
});

test('generic sites: only a final Submit inside the application form starts an attempt', async () => {
  const t = tab({
    url: 'https://jobs.lever.co/acme/123/apply', mode: 'off',
    html: '<a href="/apply"><button type="button">Apply</button></a><form id="application-form"><input name="email"><button type="submit">Submit application</button></form><button type="button">Submit</button>',
  });
  const [apply, inForm, outside] = Array.from(t.win.document.querySelectorAll('button')) as HTMLButtonElement[];
  t.win.document.querySelector('form')!.addEventListener('submit', event => event.preventDefault());
  apply.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  outside.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  assert.equal(Object.keys(t.storage).length, 0, '"Apply" and controls outside the form are ignored');
  inForm.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  assert.equal(Object.keys(t.storage).length, 1);
  assert.equal(t.statuses.at(-1)!.canArmNetwork, false, 'no network detector on unverified platforms');
  t.dom.window.close();
});

test('a confirmation page with no attempt in this tab asks instead of marking Applied', async () => {
  const t = tab({ html: '<div data-automation-id="applicationSubmitted"><h1>Application submitted</h1></div>' });
  await t.coordinator.checkConfirmationPage();
  await t.coordinator.checkConfirmationPage();
  assert.equal(t.prompts, 1, 'asked once');
  assert.equal(t.posts.length, 0);
  t.dom.window.close();
});

test('without a known job, nothing is armed or recorded', async () => {
  const t = tab({ job: null });
  t.submit!.dispatchEvent(new t.win.MouseEvent('click', { bubbles: true, button: 0 }));
  await t.settle();
  assert.equal(Object.keys(t.storage).length, 0);
  assert.equal(t.posts.length, 0);
  t.dom.window.close();
});

test('a forged page result for an unknown attempt is ignored', async () => {
  const t = tab({ mode: 'shadow' });
  t.win.dispatchEvent(new t.win.CustomEvent('tmo:submission-monitor-result', { detail: JSON.stringify({
    protocol: 1, detector: 'workday_network', attemptId: 'attempt_forged000000000', verdict: 'success', status: 200,
    requestStartedAt: Date.now(), observedAt: Date.now() }) }));
  await t.settle();
  assert.equal(t.posts.length, 0);
  assert.equal(t.statuses.length, 0);
  t.dom.window.close();
});
