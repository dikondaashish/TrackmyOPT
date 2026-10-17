import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { installSubmissionMonitor } from '../src/submission/page-monitor';
import {
  SUBMIT_LABEL_RE,
  WORKDAY_SUBMIT_SELECTOR,
  classifyWorkdayFinalizeResponse,
  matchWorkdayFinalizeRequest,
} from '../src/submission/workday-submission-rules';
import {
  SUBMISSION_PAGE_EVENTS,
  parseMonitorArmDetail,
  parseMonitorResultDetail,
  verdictOutcome,
  type MonitorResultDetail,
} from '../src/submission/submission-protocol';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');
const PAGE = 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1/apply/applyManually';
const FINALIZE = 'https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/jobapplication/abc123/finalize';

type Reply = () => Response | Promise<Response>;

function setup(reply: Reply, options: { trusted?: boolean; readTimeoutMs?: number; maxBytes?: number } = {}) {
  const dom = new JSDOM(`<main><div data-automation-id="pageFooter">
    <button data-automation-id="pageFooterNextButton" type="button">Submit</button>
    <button data-automation-id="pageFooterBackButton" type="button">Back</button></div></main>`, { url: PAGE });
  const win = dom.window;
  let clock = 1_000_000;
  const siteCalls: unknown[][] = [];
  win.fetch = (...args: unknown[]) => { siteCalls.push(args); return Promise.resolve(reply()); };
  const results: MonitorResultDetail[] = [];
  win.addEventListener(SUBMISSION_PAGE_EVENTS.result, (event: Event) => {
    const parsed = parseMonitorResultDetail((event as CustomEvent).detail);
    assert.ok(parsed, 'result detail always validates');
    results.push(parsed!);
  });
  const handle = installSubmissionMonitor(win, {
    detector: 'workday_network',
    isSubmitControl: element => element.matches(WORKDAY_SUBMIT_SELECTOR) && SUBMIT_LABEL_RE.test(element.textContent!.trim()),
    matchRequest: matchWorkdayFinalizeRequest,
    classify: classifyWorkdayFinalizeResponse,
  }, { now: () => clock, isTrusted: () => options.trusted !== false, readTimeoutMs: options.readTimeoutMs, maxBytes: options.maxBytes });
  assert.ok(handle);
  const submit = win.document.querySelector('[data-automation-id="pageFooterNextButton"]') as HTMLButtonElement;
  const arm = (attemptId = 'attempt_0123456789abcdef', pageUrl = PAGE) => win.dispatchEvent(new win.CustomEvent(SUBMISSION_PAGE_EVENTS.arm, {
    detail: JSON.stringify({ protocol: 1, detector: 'workday_network', attemptId, pageUrl, armedAt: clock }),
  }));
  const click = (target: Element = submit) => target.dispatchEvent(new win.MouseEvent('click', { bubbles: true, button: 0 }));
  const settle = () => new Promise(resolveSettle => setTimeout(resolveSettle, 20));
  return { win, dom, submit, arm, click, results, siteCalls, settle, advance: (ms: number) => { clock += ms; } };
}

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init });

async function submitWith(reply: Reply, options?: Parameters<typeof setup>[1], url = FINALIZE, method = 'POST') {
  const h = setup(reply, options);
  h.click();
  h.arm();
  const response = await h.win.fetch(url, { method, body: '{}' });
  await h.settle();
  return { ...h, response };
}

test('a finalize response with an application id is a confirmed submission', async () => {
  const h = await submitWith(() => json({ id: 'app-123', status: 'SUBMITTED' }));
  assert.equal(h.results.length, 1);
  assert.equal(h.results[0].verdict, 'success');
  assert.equal(verdictOutcome(h.results[0].verdict), 'confirmed');
  assert.equal(h.results[0].attemptId, 'attempt_0123456789abcdef');
  // The site's own response is untouched and still readable.
  assert.deepEqual(await h.response.json(), { id: 'app-123', status: 'SUBMITTED' });
  h.dom.window.close();
});

test('HTTP 200 alone is never success: application errors, missing ids, and non-JSON', async () => {
  for (const [body, verdict] of [
    [{ errors: [{ code: 'REQUIRED' }] }, 'application_error'],
    [{ id: 'x', error: 'conflict' }, 'application_error'],
    [{ status: 'ok' }, 'malformed'],
    [{ id: '' }, 'malformed'],
    [[{ id: 'x' }], 'malformed'],
  ] as const) {
    const h = await submitWith(() => json(body));
    assert.equal(h.results[0]?.verdict, verdict, JSON.stringify(body));
    h.dom.window.close();
  }
  const html = await submitWith(() => new Response('<html>ok</html>', { status: 200 }));
  assert.equal(html.results[0].verdict, 'malformed');
  assert.equal(verdictOutcome('malformed'), 'inconclusive');
  html.dom.window.close();
});

test('failed, redirected, and unexpected statuses are classified without success', async () => {
  const failed = await submitWith(() => json({ errors: [] }, { status: 422 }));
  assert.equal(failed.results[0].verdict, 'http_error');
  assert.equal(verdictOutcome('http_error'), 'failed');
  assert.equal(failed.results[0].status, 422);
  failed.dom.window.close();
  const redirected = Object.defineProperty(json({ id: 'x' }), 'redirected', { value: true });
  const r = await submitWith(() => redirected);
  assert.equal(r.results[0].verdict, 'redirected');
  r.dom.window.close();
  const noContent = await submitWith(() => new Response(null, { status: 204 }));
  assert.equal(noContent.results[0].verdict, 'unexpected_status');
  noContent.dom.window.close();
});

test('timed-out and oversized responses are inconclusive and the site still gets its response', async () => {
  const slow = await submitWith(() => new Response(new ReadableStream({ start() { /* never closes */ } }), { status: 200 }), { readTimeoutMs: 30 });
  await new Promise(done => setTimeout(done, 80));
  assert.equal(slow.results[0].verdict, 'timeout');
  assert.ok(slow.response.body, 'the original body stream is still the site\'s to read');
  slow.dom.window.close();
  const big = await submitWith(() => json({ id: 'x', padding: 'x'.repeat(2000) }), { maxBytes: 512 });
  assert.equal(big.results[0].verdict, 'oversize');
  assert.equal((await big.response.json()).id, 'x');
  big.dom.window.close();
});

test('network errors are reported as inconclusive and still reject for the site', async () => {
  const failing = setup(() => Promise.reject(new TypeError('offline')) as never);
  failing.click(); failing.arm();
  await assert.rejects(failing.win.fetch(FINALIZE, { method: 'POST' }), /offline/);
  await failing.settle();
  assert.equal(failing.results[0].verdict, 'network_error');
  failing.dom.window.close();
});

test('unrelated requests are never inspected', async () => {
  for (const [url, method] of [
    ['https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/External/job/Analyst', 'GET'],
    [FINALIZE, 'GET'],
    ['https://evil.example/wday/cxs/acme/jobapplication/abc123/finalize', 'POST'],
    [`${FINALIZE}?type=other`, 'POST'],
    ['https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/jobapplication/abc123/validate', 'POST'],
  ] as const) {
    const h = await submitWith(() => json({ id: 'x' }), {}, url, method);
    assert.equal(h.results.length, 0, `${method} ${url}`);
    h.dom.window.close();
  }
  const agency = await submitWith(() => json({ id: 'x' }), {}, `${FINALIZE}?type=completeAgencySubmission`);
  assert.equal(agency.results.length, 1);
  agency.dom.window.close();
});

test('arming requires a recent trusted Submit activation on the same page', async () => {
  const untrusted = setup(() => json({ id: 'x' }), { trusted: false });
  untrusted.click(); untrusted.arm();
  await untrusted.win.fetch(FINALIZE, { method: 'POST' }); await untrusted.settle();
  assert.equal(untrusted.results.length, 0, 'synthetic page clicks cannot arm');
  untrusted.dom.window.close();

  const noClick = setup(() => json({ id: 'x' }));
  noClick.arm();
  await noClick.win.fetch(FINALIZE, { method: 'POST' }); await noClick.settle();
  assert.equal(noClick.results.length, 0, 'a forged arm without a click is ignored');
  noClick.dom.window.close();

  const stale = setup(() => json({ id: 'x' }));
  stale.click(); stale.advance(2000); stale.arm();
  await stale.win.fetch(FINALIZE, { method: 'POST' }); await stale.settle();
  assert.equal(stale.results.length, 0, 'a stale activation is ignored');
  stale.dom.window.close();

  const back = setup(() => json({ id: 'x' }));
  back.click(back.win.document.querySelector('[data-automation-id="pageFooterBackButton"]')!); back.arm();
  await back.win.fetch(FINALIZE, { method: 'POST' }); await back.settle();
  assert.equal(back.results.length, 0, 'other footer buttons do not arm');
  back.dom.window.close();

  const otherPage = setup(() => json({ id: 'x' }));
  otherPage.click(); otherPage.arm('attempt_0123456789abcdef', 'https://acme.wd5.myworkdayjobs.com/other');
  await otherPage.win.fetch(FINALIZE, { method: 'POST' }); await otherPage.settle();
  assert.equal(otherPage.results.length, 0);
  otherPage.dom.window.close();
});

test('keyboard activation of the Submit button arms the monitor', async () => {
  const h = setup(() => json({ id: 'x' }));
  h.submit.focus();
  h.submit.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  h.arm();
  await h.win.fetch(FINALIZE, { method: 'POST' }); await h.settle();
  assert.equal(h.results[0]?.verdict, 'success');
  h.dom.window.close();
});

test('one result per arm; expired and disarmed attempts report nothing', async () => {
  const h = setup(() => json({ id: 'x' }));
  h.click(); h.arm();
  await h.win.fetch(FINALIZE, { method: 'POST' });
  await h.win.fetch(FINALIZE, { method: 'POST' });
  await h.settle();
  assert.equal(h.results.length, 1, 'duplicate finalize retries produce one result');
  assert.equal(h.siteCalls.length, 2, 'every site request still goes through');
  h.dom.window.close();

  const expired = setup(() => json({ id: 'x' }));
  expired.click(); expired.arm(); expired.advance(5 * 60 * 1000 + 1);
  await expired.win.fetch(FINALIZE, { method: 'POST' }); await expired.settle();
  assert.equal(expired.results.length, 0);
  expired.dom.window.close();

  const disarmed = setup(() => json({ id: 'x' }));
  disarmed.click(); disarmed.arm();
  disarmed.win.dispatchEvent(new disarmed.win.CustomEvent(SUBMISSION_PAGE_EVENTS.disarm, { detail: 'attempt_0123456789abcdef' }));
  await disarmed.win.fetch(FINALIZE, { method: 'POST' }); await disarmed.settle();
  assert.equal(disarmed.results.length, 0);
  disarmed.dom.window.close();
});

test('malformed arm signals and odd fetch inputs never break site requests', async () => {
  const h = setup(() => json({ id: 'x' }));
  h.click();
  for (const detail of ['{', JSON.stringify({ protocol: 1 }), 42, JSON.stringify({ protocol: 1, detector: 'workday_network', attemptId: 'short', pageUrl: PAGE, armedAt: 1 })]) {
    h.win.dispatchEvent(new h.win.CustomEvent(SUBMISSION_PAGE_EVENTS.arm, { detail }));
  }
  const weird = { toString() { throw new Error('boom'); } };
  const response = await h.win.fetch(weird as never);
  assert.equal(response.status, 200);
  assert.equal(h.results.length, 0);
  assert.equal(parseMonitorArmDetail('{"protocol":1}'), null);
  h.dom.window.close();
});

test('XHR finalize responses are classified from the buffered body', async () => {
  for (const [status, text, verdict] of [
    [200, '{"id":"app-1"}', 'success'],
    [200, '{"errors":[{"message":"x"}]}', 'application_error'],
    [500, 'oops', 'http_error'],
    [200, 'not json', 'malformed'],
  ] as const) {
    const dom = new JSDOM('<button data-automation-id="pageFooterNextButton">Submit</button>', { url: PAGE });
    const win = dom.window;
    class FakeXhr extends win.EventTarget {
      status = 0; responseType = ''; responseText = ''; response: unknown = null; responseURL = '';
      open(_method: string, url: string) { this.responseURL = new URL(url, PAGE).href; }
      send() { setTimeout(() => { this.status = status; this.responseText = text; this.dispatchEvent(new win.Event('loadend')); }, 0); }
    }
    win.XMLHttpRequest = FakeXhr;
    const results: MonitorResultDetail[] = [];
    win.addEventListener(SUBMISSION_PAGE_EVENTS.result, (event: Event) => results.push(parseMonitorResultDetail((event as CustomEvent).detail)!));
    installSubmissionMonitor(win, {
      detector: 'workday_network', isSubmitControl: element => element.matches(WORKDAY_SUBMIT_SELECTOR),
      matchRequest: matchWorkdayFinalizeRequest, classify: classifyWorkdayFinalizeResponse,
    }, { isTrusted: () => true });
    win.document.querySelector('button')!.dispatchEvent(new win.MouseEvent('click', { bubbles: true, button: 0 }));
    win.dispatchEvent(new win.CustomEvent(SUBMISSION_PAGE_EVENTS.arm, { detail: JSON.stringify({
      protocol: 1, detector: 'workday_network', attemptId: 'attempt_0123456789abcdef', pageUrl: PAGE, armedAt: Date.now() }) }));
    const xhr = new win.XMLHttpRequest();
    xhr.open('POST', '/wday/cxs/acme/jobapplication/abc123/finalize');
    xhr.send('{}');
    await new Promise(done => setTimeout(done, 20));
    assert.equal(results[0]?.verdict, verdict, `${status} ${text}`);
    dom.window.close();
  }
});

test('the Workday request matcher is narrow and same-origin', () => {
  assert.equal(matchWorkdayFinalizeRequest(FINALIZE, 'post', PAGE), '/wday/cxs/acme/jobapplication/abc123/finalize');
  assert.equal(matchWorkdayFinalizeRequest(FINALIZE, 'POST', 'http://acme.wd5.myworkdayjobs.com/x'), null);
  assert.equal(matchWorkdayFinalizeRequest(FINALIZE, 'POST', 'https://acme.example.com/x'), null);
  assert.equal(matchWorkdayFinalizeRequest('https://other.wd5.myworkdayjobs.com/wday/cxs/acme/jobapplication/a/finalize', 'POST', PAGE), null);
  assert.equal(matchWorkdayFinalizeRequest(`${FINALIZE}#x`, 'POST', PAGE), null);
});
