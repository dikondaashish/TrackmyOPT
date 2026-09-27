import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({
  stdin: {
    contents: "export { runPrefill } from './easy-apply-engine'; export { retryPrefillOperation } from './prefill-coverage';",
    resolveDir: resolve('src'),
  },
  bundle: true, write: false, format: 'cjs', platform: 'node',
}).outputFiles[0].text;

function fixture(t: any) {
  const dom = new JSDOM('<form id="application-form"><label for="first">First name</label><input id="first" name="first" required><label for="email">Email</label><input id="email" name="email" type="email" required></form>',
    { url: 'https://boards.greenhouse.io/example/jobs/123' });
  t.after(() => dom.window.close());
  dom.window.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 120, height: 30, x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 30 });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module, exports: module.exports, window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement,
    HTMLSelectElement: dom.window.HTMLSelectElement, HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
  });
  const first = dom.window.document.querySelector('#first') as HTMLInputElement;
  const email = dom.window.document.querySelector('#email') as HTMLInputElement;
  return { dom, first, email, api: module.exports };
}

test('targeted retry repairs only the failed control after DOM replacement and preserves user edits', async t => {
  const f = fixture(t);
  let rejectFirst = true;
  let firstWrites = 0;
  let emailWrites = 0;
  f.first.addEventListener('input', () => {
    firstWrites++;
    if (rejectFirst) f.dom.window.setTimeout(() => { f.first.value = ''; }, 5);
  });
  f.email.addEventListener('input', () => { emailWrites++; });
  const result = await f.api.runPrefill({
    profileFallback: { firstName: 'Test', email: 'test@example.test' }, quietResultToast: true,
  });
  assert.equal(f.first.value, '');
  assert.equal(f.email.value, 'test@example.test');
  assert.equal(result.retryOperations.length, 1);
  rejectFirst = false;
  f.email.value = 'applicant-correction@example.test';
  const replacement = f.first.cloneNode(true) as HTMLInputElement;
  f.first.replaceWith(replacement);
  const next = await f.api.retryPrefillOperation(result, result.retryOperations[0].id);
  assert.equal(replacement.value, 'Test');
  assert.equal(f.email.value, 'applicant-correction@example.test');
  assert.equal(emailWrites, 1, 'successful operations are not replayed');
  assert.equal(firstWrites, 1, 'the detached control is never written again');
  assert.equal(next.retryOperations.length, 0);
});

test('targeted retry does not overwrite a user-filled failed field', async t => {
  const f = fixture(t);
  f.first.addEventListener('input', () => f.dom.window.setTimeout(() => { f.first.value = ''; }, 5), { once: true });
  const result = await f.api.runPrefill({ profileFallback: { firstName: 'Test' }, quietResultToast: true });
  assert.equal(result.retryOperations.length, 1);
  f.first.value = 'Applicant choice';
  const next = await f.api.retryPrefillOperation(result, result.retryOperations[0].id);
  assert.equal(f.first.value, 'Applicant choice');
  assert.equal(next, result, 'no success is reported when the applicant has edited the field');
});

test('navigation invalidates a targeted retry without a write', async t => {
  const f = fixture(t);
  f.first.addEventListener('input', () => f.dom.window.setTimeout(() => { f.first.value = ''; }, 5), { once: true });
  const result = await f.api.runPrefill({ profileFallback: { firstName: 'Test' }, quietResultToast: true });
  f.dom.window.history.pushState({}, '', '/example/jobs/another');
  const next = await f.api.retryPrefillOperation(result, result.retryOperations[0].id);
  assert.equal(next, result);
  assert.equal(f.first.value, '');
});
