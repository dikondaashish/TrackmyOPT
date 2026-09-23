import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const localRequire = createRequire(resolve('package.json'));
const { JSDOM } = localRequire('jsdom');
const { buildSync } = localRequire('esbuild');
const code = buildSync({ entryPoints: ['src/job-tracker-review.ts'], bundle: true, write: false, platform: 'node', format: 'cjs' }).outputFiles[0].text;
function harness(lookup: any = { ok: true, saved: false }, save: any = { ok: true, id: 'test', status: 'Wishlist' }, html?: string) {
  const dom = new JSDOM(html ?? '<title>Job Application for Engineer at Acme</title><h1>Engineer</h1><div class="job__location">Remote</div>', { url: 'https://job-boards.greenhouse.io/acme/jobs/123' });
  Object.defineProperty(dom.window.HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });
  const messages: any[] = [];
  const module = { exports: {} as any };
  const ctx = { module, exports: module.exports, require: localRequire, window: dom.window,
    document: dom.window.document, location: dom.window.location, HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element, CustomEvent: dom.window.CustomEvent, URL,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window), setTimeout: () => 0, clearTimeout: () => {},
    chrome: { runtime: { sendMessage: async (message: any) => {
      messages.push(message);
      return message.type === 'CHECK_JOB_SAVED' ? lookup : save;
    } } },
  };
  vm.runInNewContext(code, ctx);
  return { dom, messages, review: module.exports.reviewJobForTracker as () => Promise<any> };
}
test('popup review opens once without saving, even when assistant is hidden', async () => {
  const h = harness();
  try {
    h.dom.window.sessionStorage.setItem('tmo_job_widget_hide_session', '1');
    assert.equal((await h.review()).ok, true);
    assert.equal((await h.review()).ok, true);
    assert.equal(h.dom.window.document.querySelectorAll('[role="dialog"]').length, 1);
    assert.equal(h.messages.filter(m => m.type === 'ADD_JOB_TO_TRACKER').length, 0);
    h.dom.window.document.querySelector('[aria-label="Close application status"]').click();
    assert.equal(h.messages.length, 1);
  } finally { h.dom.window.close(); }
});
for (const status of ['Wishlist', 'Applied']) {
  test(`review saves ${status} only after explicit choice, using the frozen posting`, async () => {
    const h = harness({ ok: true, saved: false }, { ok: true, status, id: 'test' });
    try {
      await h.review();
      h.dom.window.document.querySelector('h1').textContent = 'Different role';
      const buttons = Array.from(h.dom.window.document.querySelectorAll('button')) as HTMLButtonElement[];
      buttons.find(b => b.textContent?.includes(status === 'Wishlist' ? 'I have not applied yet' : 'I applied'))!.click();
      await new Promise(resolve => setImmediate(resolve));
      const saves = h.messages.filter(m => m.type === 'ADD_JOB_TO_TRACKER');
      assert.equal(saves.length, 1);
      assert.equal(saves[0].status, status);
      assert.equal(saves[0].job.role_title, 'Engineer');
    } finally { h.dom.window.close(); }
  });
}
test('signed-out and failed lookups do not offer a misleading save dialog', async () => {
  for (const error of ['not_signed_in', 'lookup_failed']) {
    const h = harness({ ok: false, error });
    try {
      assert.equal((await h.review()).ok, false);
      assert.equal(h.dom.window.document.querySelector('[role="dialog"]'), null);
      assert.equal(h.messages.length, 1);
    } finally { h.dom.window.close(); }
  }
});
test('existing Applied job is acknowledged without a second save', async () => {
  const h = harness({ ok: true, saved: true, status: 'Applied' });
  try {
    assert.equal((await h.review()).ok, true);
    assert.equal(h.dom.window.document.querySelector('[role="dialog"]'), null);
    assert.match(h.dom.window.document.body.textContent, /already in your tracker/);
    assert.equal(h.messages.length, 1);
  } finally { h.dom.window.close(); }
});
test('existing Wishlist can be reviewed and promoted', async () => {
  const h = harness({ ok: true, saved: true, status: 'Wishlist' });
  try {
    assert.equal((await h.review()).ok, true);
    assert.ok(h.dom.window.document.querySelector('[role="dialog"]'));
  } finally { h.dom.window.close(); }
});
test('save failure is shown, never painted as successful', async () => {
  const h = harness(undefined, { ok: false, error: 'Save unavailable' });
  try {
    await h.review();
    const button = Array.from(h.dom.window.document.querySelectorAll('button')).find((b: any) => b.textContent.includes('I applied')) as HTMLButtonElement;
    button.click();
    await new Promise(resolve => setImmediate(resolve));
    assert.match(h.dom.window.document.body.textContent, /Save unavailable/);
    assert.doesNotMatch(h.dom.window.document.body.textContent, /Job saved in your tracker/);
    assert.equal(h.dom.window.document.querySelector('[role="alert"]')?.textContent, 'Save unavailable');
  } finally { h.dom.window.close(); }
});
test('non-posting page reports a useful error without contacting tracker', async () => {
  const h = harness(undefined, undefined, '<h1>Careers</h1>');
  try {
    const result = await h.review();
    assert.equal(result.ok, false);
    assert.match(result.error, /specific job listing/);
    assert.equal(h.messages.length, 0);
  } finally { h.dom.window.close(); }
});
test('job description is captured before the asynchronous saved-state lookup', async () => {
  let release: (value: unknown) => void = () => {};
  const lookup = new Promise(resolve => { release = resolve; });
  const h = harness(lookup, undefined, '<title>Engineer at Acme</title><h1>Engineer</h1><div class="job__description">Original role responsibilities: ' + 'Build software. '.repeat(30) + '</div>');
  try {
    const pending = h.review();
    h.dom.window.document.querySelector('.job__description').textContent = 'Different job. '.repeat(30);
    release({ ok: true, saved: false });
    await pending;
    const button = Array.from(h.dom.window.document.querySelectorAll('button')).find((b: any) => b.textContent.includes('I applied')) as HTMLButtonElement;
    button.click();
    await new Promise(resolve => setImmediate(resolve));
    const saved = h.messages.find(m => m.type === 'ADD_JOB_TO_TRACKER');
    assert.match(saved.job.job_description || '', /Original role responsibilities/);
  } finally { h.dom.window.close(); }
});
