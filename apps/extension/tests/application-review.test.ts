/**
 * Field outcomes from the real engine and the review-before-submit panel,
 * run against jsdom forms. Values are fictitious test data.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const bundle = local('esbuild').buildSync({
  stdin: {
    contents: [
      "export { runPrefill } from './easy-apply/easy-apply-engine';",
      "export { buildApplicationReview } from './review/application-review';",
      "export { mountApplicationReview, unmountApplicationReview } from './review/application-review-ui';",
      "export { scanApplicationFields } from './prefill/application-field-scan';",
      "export { markAnswerSource, answerSourceOf } from './review/field-outcomes';",
    ].join('\n'),
    resolveDir: resolve('src'),
  },
  bundle: true, write: false, format: 'cjs', platform: 'node',
}).outputFiles[0].text;

const profile = {
  firstName: 'Test', lastName: 'Applicant', email: 'test.applicant@example.test',
  phone: '+1 (555) 123-4567', country: 'United States', state: 'TX', city: 'Dallas', postalCode: '75201',
};
/** The module runs in a vm realm; compare plain copies of its values. */
const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

function page(t: { after: (fn: () => void) => void }, body: string) {
  const dom = new JSDOM(`<form id="application-form">${body}</form><div id="widget-line"></div>`,
    { url: 'https://careers.example.test/jobs/42/apply' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 120, height: 30, x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 30 });
  w.HTMLElement.prototype.scrollIntoView = () => {};
  const module = { exports: {} as any };
  vm.runInNewContext(bundle, {
    module, exports: module.exports, window: w, document: w.document, Node: w.Node,
    HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, HTMLSelectElement: w.HTMLSelectElement,
    HTMLTextAreaElement: w.HTMLTextAreaElement, HTMLButtonElement: w.HTMLButtonElement,
    Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, MutationObserver: w.MutationObserver,
    setTimeout: w.setTimeout.bind(w), clearTimeout: w.clearTimeout.bind(w),
  });
  const $ = <T extends Element = HTMLInputElement>(selector: string) => w.document.querySelector(selector) as unknown as T;
  const form = $('#application-form') as unknown as HTMLElement;
  return { w, $, api: module.exports, form, line: $('#widget-line') as unknown as HTMLElement };
}
const wait = (ms: number) => new Promise(done => setTimeout(done, ms));

test('filled, kept, missing, and paused fields are reported separately', async (t) => {
  const h = page(t, `
    <label for="first">First name</label><input id="first" required>
    <label for="email">Email</label><input id="email" type="email" value="old.address@example.test" required>
    <label for="why">Why do you want to work here?</label><textarea id="why" required></textarea>
    <label for="phone">Phone</label><input id="phone" type="tel" required>`);
  const result = await h.api.runPrefill({ profileFallback: profile, quietResultToast: true, blockedCapabilities: new Set(['skills']) });
  const byId = (id: string) => result.fieldOutcomes.find((outcome: any) => outcome.control.id === id);
  assert.equal(h.$('#first').value, 'Test');
  assert.equal(byId('first').status, 'filled');
  assert.equal(byId('first').source, 'profile');
  assert.equal(h.$('#email').value, 'old.address@example.test', 'an existing answer is never overwritten');
  assert.equal(byId('email').status, 'kept_existing');
  const review = h.api.buildApplicationReview({ scan: h.api.scanApplicationFields(h.form), outcomes: result.fieldOutcomes,
    resume: {}, root: h.form });
  assert.deepEqual(plain(review.filled.map((item: any) => [item.label, item.detail])),
    [['First name', 'From your saved profile'], ['Phone', 'From your saved profile']]);
  assert.deepEqual(plain(review.needsConfirmation.map((item: any) => [item.label, item.actions])),
    [['Email', ['use_suggested', 'keep_mine', 'go_to']]]);
  assert.deepEqual(plain(review.missingRequired.map((item: any) => item.label)), ['Why do you want to work here?']);
  assert.equal(review.status, 'needs_attention');
  // The applicant chooses to use the saved value: it is written and verified.
  assert.equal(await byId('email').replace(), true);
  assert.equal(h.$('#email').value, 'test.applicant@example.test');
});

test('a paused capability marks fields as paused instead of filling them', async (t) => {
  const h = page(t, '<label for="first">First name</label><input id="first" required>');
  const result = await h.api.runPrefill({ profileFallback: profile, quietResultToast: true, blockedCapabilities: new Set(['contact']) });
  assert.equal(h.$('#first').value, '');
  assert.deepEqual(plain(result.fieldOutcomes.map((outcome: any) => [outcome.status, outcome.reason])), [['unsupported', 'feature_paused']]);
  const review = h.api.buildApplicationReview({ scan: h.api.scanApplicationFields(h.form), outcomes: result.fieldOutcomes, resume: {}, root: h.form });
  assert.match(review.problems[0].detail, /Paused by TrackMyOPT/);
});

test('server label phrases add synonyms for bundled kinds and can mark labels to skip', async (t) => {
  const h = page(t, `<label for="zip">Mailing area number</label><input id="zip">
    <label for="first">First name</label><input id="first">`);
  await h.api.runPrefill({ profileFallback: profile, quietResultToast: true, fieldRules: {
    labelAliases: [{ kind: 'postalCode', phrases: ['mailing area number'] }], ignoreLabels: ['first name'],
  } });
  assert.equal(h.$('#zip').value, '75201');
  assert.equal(h.$('#first').value, '', 'an ignored label is left for the applicant');
});

test('server phrases can never fill a sensitive question', async (t) => {
  const h = page(t, '<label for="visa">Visa sponsorship email</label><input id="visa">');
  await h.api.runPrefill({ profileFallback: profile, quietResultToast: true, fieldRules: {
    labelAliases: [{ kind: 'email', phrases: ['visa sponsorship email'] }],
  } });
  assert.equal(h.$('#visa').value, '');
});

test('the review panel distinguishes suggestions, refreshes on edits, and never says complete', async (t) => {
  const h = page(t, `
    <label for="first">First name</label><input id="first" required>
    <label for="why">Why do you want to work here?</label><textarea id="why" required></textarea>
    <label for="cover">Anything else?</label><textarea id="cover"></textarea>`);
  const result = await h.api.runPrefill({ profileFallback: profile, quietResultToast: true });
  h.$('#cover').value = 'Drafted answer';
  h.api.markAnswerSource(h.$('#cover'), 'generated');
  const review = h.api.mountApplicationReview(h.line, result, h.form);
  assert.equal(review.status, 'needs_attention');
  const status = h.line.querySelector('[role="status"]')!;
  assert.equal(status.getAttribute('aria-live'), 'polite');
  assert.match(status.textContent!, /2 items need your attention/);
  const groups = Array.from(h.line.querySelectorAll('details h4')).map(node => node.textContent);
  assert.deepEqual(groups, ['Missing required answers (1)', 'Needs your confirmation (1)', 'Filled (1)']);
  assert.match(h.line.textContent!, /AI suggestion — review before submitting/);
  // Every control in the panel is a real button with an accessible name.
  for (const control of Array.from(h.line.querySelectorAll('button'))) {
    assert.equal(control.getAttribute('type'), 'button');
    assert.ok(control.getAttribute('aria-label'), 'each action names its field');
  }
  // The applicant accepts the suggestion.
  (Array.from(h.line.querySelectorAll('button')).find(button => button.textContent === 'Looks right') as HTMLButtonElement).click();
  await wait(10);
  assert.match(h.line.querySelector('[role="status"]')!.textContent!, /1 item needs your attention/);
  // The applicant answers the missing question; the panel refreshes itself.
  h.$('#why').value = 'Because of the mission.';
  h.$('#why').dispatchEvent(new h.w.Event('input', { bubbles: true }));
  await wait(500);
  const finalStatus = h.line.querySelector('[role="status"]')!.textContent!;
  assert.match(finalStatus, /Every required field TrackMyOPT can see has an answer/);
  assert.doesNotMatch(finalStatus, /complete/i);
  // A newly required field revealed by the site is noticed without another click.
  h.form.insertAdjacentHTML('beforeend', '<label for="late">Preferred start date</label><input id="late" required>');
  await wait(500);
  assert.match(h.line.querySelector('[role="status"]')!.textContent!, /1 item needs your attention/);
  h.api.unmountApplicationReview(h.line);
});

test('forms with sections TrackMyOPT cannot inspect are never reported ready', async (t) => {
  const h = page(t, '<label for="first">First name</label><input id="first" required><iframe id="frame"></iframe>');
  Object.defineProperty(h.$('#frame'), 'contentDocument', { get: () => null });
  const result = await h.api.runPrefill({ profileFallback: profile, quietResultToast: true });
  const review = h.api.buildApplicationReview({ scan: h.api.scanApplicationFields(h.form), outcomes: result.fieldOutcomes, resume: {}, root: h.form });
  assert.equal(review.status, 'incomplete_inspection');
  assert.match(review.statusText, /cannot inspect/);
});

test('authorization questions needing confirmation offer Yes and No in the panel', async (t) => {
  const h = page(t, '<label for="auth">Are you eligible to work for any employer in the US right now?</label><select id="auth" required><option value="">Select</option><option>Yes</option><option>No</option></select>');
  const answered: string[] = [];
  const outcomes = [{ control: h.$('#auth'), status: 'needs_confirmation', reason: 'meaning_changed',
    question: 'Are you eligible to work for any employer in the US right now?', proposedAnswer: 'Yes (current work authorization)',
    answerWith: async (answer: string) => { answered.push(answer); return true; } }];
  h.api.mountApplicationReview(h.line, { filled: 0, skipped: 0, total: 0, groups: {}, fieldOutcomes: outcomes }, h.form);
  assert.match(h.line.textContent!, /worded differently/);
  assert.match(h.line.textContent!, /Your saved answer: Yes \(current work authorization\)/);
  const yes = Array.from(h.line.querySelectorAll('button')).find(button => button.textContent === 'Yes') as HTMLButtonElement;
  assert.match(yes.getAttribute('aria-label')!, /Are you eligible to work/);
  yes.click();
  await wait(10);
  assert.deepEqual(answered, ['yes']);
  h.api.unmountApplicationReview(h.line);
});

test('resume status is explicit about attached, unverified, kept, and failed uploads', async (t) => {
  const h = page(t, '<label for="first">First name</label><input id="first">');
  const review = (resume: Record<string, unknown>) => h.api.buildApplicationReview({ scan: h.api.scanApplicationFields(h.form), outcomes: [], resume, root: h.form });
  assert.equal(review({ result: 'attached', verification: 'verified', filename: 'Resume.pdf' }).resume.text, 'Your tailored resume (Resume.pdf) is attached.');
  assert.equal(review({ result: 'attached', verification: 'unverified' }).resume.state, 'attached_unverified');
  assert.equal(review({ result: 'already_present' }).resume.state, 'kept_existing');
  const rejected = review({ result: 'attached', verification: 'rejected' });
  assert.equal(rejected.resume.state, 'failed');
  assert.equal(rejected.problems[0].label, 'Resume');
  assert.equal(review({}).resume.state, 'none');
});
