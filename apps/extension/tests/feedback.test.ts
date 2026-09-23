import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const code = requireLocal('esbuild').buildSync({ entryPoints: ['src/feedback.ts'], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
function harness(response: any = { ok: true }) {
  const dom = new JSDOM('<button id="trigger">Feedback</button>', { url: 'https://example.test' });
  const messages: any[] = [];
  const module = { exports: {} as any };
  vm.runInNewContext(code, { module, exports: module.exports, window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    chrome: { runtime: { getURL: (v: string) => v, getManifest: () => ({ version: '0.2.0' }), sendMessage: async (m: any) => { messages.push(m); return response; } } },
  });
  const trigger = dom.window.document.querySelector('button'); trigger.focus();
  module.exports.openFeedbackModal();
  const root = dom.window.document.querySelector('#tmo-feedback-modal').shadowRoot;
  return { dom, root, messages, open: module.exports.openFeedbackModal, form: root.querySelector('form'), submit: () => root.querySelector('.fb-submit').click() };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
test('feedback opens once, has accessible controls and restores focus on Escape', () => {
  const h = harness();
  try {
    h.open();
    assert.equal(h.dom.window.document.querySelectorAll('#tmo-feedback-modal').length, 1);
    assert.equal(h.root.querySelectorAll('input[type="radio"]').length, 11);
    assert.equal(h.root.querySelectorAll('input[type="checkbox"]').length, 6);
    assert.equal(h.form.getAttribute('aria-labelledby'), 'tmo-feedback-title');
    assert.equal(h.root.activeElement.getAttribute('aria-label'), '0 out of 10');
    h.dom.window.document.dispatchEvent(new h.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(h.dom.window.document.querySelector('#tmo-feedback-modal'), null);
    assert.equal(h.dom.window.document.activeElement.id, 'trigger');
    assert.equal(h.messages.length, 0);
  } finally { h.dom.window.close(); }
});
test('blank submission validates without sending', async () => {
  const h = harness();
  try { h.submit(); await tick(); assert.equal(h.messages.length, 0); assert.match(h.root.querySelector('.fb-status').textContent, /Choose a rating/); }
  finally { h.dom.window.close(); }
});
test('zero rating, multiple issues, and comments retain the API contract', async () => {
  const h = harness();
  try {
    h.root.querySelector('input[value="0"]').click();
    h.root.querySelectorAll('input[type="checkbox"]')[0].click();
    h.root.querySelectorAll('input[type="checkbox"]')[2].click();
    h.root.querySelector('textarea').value = '  Test feedback  ';
    h.submit(); await tick();
    const payload = JSON.parse(JSON.stringify(h.messages[0].payload));
    assert.deepEqual(payload, { rating: 0, aspects: ["Fields weren't filled correctly", 'Not enough sites are supported'], comment: 'Test feedback', version: '0.2.0' });
    assert.match(h.root.querySelector('.fb-success').textContent, /Thanks for sharing/);
    assert.equal(h.root.activeElement.className, 'fb-success');
    h.root.querySelector('.fb-done').click();
    assert.equal(h.dom.window.document.querySelector('#tmo-feedback-modal'), null);
  } finally { h.dom.window.close(); }
});
test('comment-only feedback stays supported and failed submissions retain drafts', async () => {
  const h = harness({ ok: false, error: 'Please try again later.' });
  try {
    h.root.querySelector('textarea').value = 'Keep this draft';
    h.submit(); await tick();
    assert.equal(h.messages[0].payload.rating, null);
    assert.equal(h.root.querySelector('textarea').value, 'Keep this draft');
    assert.equal(h.root.querySelector('.fb-submit').disabled, false);
    assert.match(h.root.querySelector('.fb-status').textContent, /try again later/);
  } finally { h.dom.window.close(); }
});
test('pending feedback cannot be submitted twice or accidentally dismissed', async () => {
  let finish: (v: any) => void = () => {};
  const h = harness(new Promise(resolve => { finish = resolve; }));
  try {
    h.root.querySelector('input[value="10"]').click(); h.submit();
    h.form.dispatchEvent(new h.dom.window.Event('submit', { bubbles: true, cancelable: true }));
    h.dom.window.document.dispatchEvent(new h.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(h.messages.length, 1);
    assert.ok(h.dom.window.document.querySelector('#tmo-feedback-modal'));
    finish({ ok: true }); await tick();
    assert.ok(h.root.querySelector('.fb-done'));
  } finally { h.dom.window.close(); }
});
test('keyboard focus wraps within the modal and backdrop click dismisses', () => {
  const h = harness();
  try {
    h.root.querySelector('.fb-submit').focus();
    h.dom.window.document.dispatchEvent(new h.dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    assert.equal(h.root.activeElement.className, 'fb-close');
    h.dom.window.document.dispatchEvent(new h.dom.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    assert.equal(h.root.activeElement.className, 'fb-submit');
    h.dom.window.document.querySelector('#tmo-feedback-modal').click();
    assert.equal(h.dom.window.document.querySelector('#tmo-feedback-modal'), null);
  } finally { h.dom.window.close(); }
});
