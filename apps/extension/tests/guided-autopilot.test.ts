import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const code = requireLocal('esbuild').buildSync({ entryPoints: ['src/guided-autopilot.ts'], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
function check(html: string, inFrame = false) {
  const dom = new JSDOM(`<form>${html}</form>`); let clicks = 0;
  const module = { exports: {} as any };
  vm.runInNewContext(code, { module, exports: module.exports, window: dom.window, document: dom.window.document,
    Document: dom.window.Document, HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement, HTMLButtonElement: dom.window.HTMLButtonElement });
  let root = dom.window.document.querySelector('form');
  if (inFrame) {
    const frame = dom.window.document.createElement('iframe'); dom.window.document.body.appendChild(frame);
    frame.contentDocument.body.innerHTML = `<form>${html}</form>`; root = frame.contentDocument.querySelector('form');
  }
  root.addEventListener('click', () => { clicks++; });
  const clicked = new WeakSet();
  return { dom, root, run: () => module.exports.runGuidedNavigation(root, clicked), clicks: () => clicks };
}
const cases: Array<[string, string, string]> = [
  ['login and create-account stay manual even after password fill', '<label>Password<input type="password" value="test"></label><button type="button">Next</button>', 'no_safe_control'],
  ['AI draft must be reviewed before automatic navigation', '<textarea>Draft answer</textarea><div class="tmo-smart-answer-note" data-review-state="needs-review">AI draft · Review</div><button type="button">Next</button>', 'stopped_review_step'],
  ['AI request in flight blocks navigation', '<div class="tmo-smart-answer-note" data-review-state="pending">Drafting</div><button type="button">Next</button>', 'stopped_review_step'],
  ['safe next', '<input value="Test"><button type="button">Next</button>', 'advanced'],
  ['required unanswered', '<input required><button type="button">Next</button>', 'blocked_required_fields'],
  ['required invalid email', '<input type="email" required value="invalid"><button type="button">Next</button>', 'blocked_required_fields'],
  ['aria-invalid answer', '<input value="Test" aria-invalid="true"><button type="button">Next</button>', 'blocked_required_fields'],
  ['submit typed next', '<button type="submit">Next</button>', 'no_safe_control'],
  ['final action after next', '<button type="button">Next</button><button type="button">Submit</button>', 'stopped_final_step'],
  ['review action after next', '<button type="button">Next</button><button type="button">Review</button>', 'stopped_review_step'],
  ['conflicting accessible name', '<button type="button" aria-label="Next">Submit application</button>', 'stopped_final_step'],
  ['review heading', '<h2>Review application</h2><button type="button">Next</button>', 'stopped_review_step'],
  ['hidden ancestor next', '<div hidden><button type="button">Next</button></div>', 'no_safe_control'],
  ['disabled fieldset next', '<fieldset disabled><button type="button">Next</button></fieldset>', 'no_safe_control'],
  ['ambiguous next controls', '<button type="button">Next</button><button type="button">Continue</button>', 'no_safe_control'],
  ['unscoped done', '<button type="button">Done</button>', 'no_safe_control'],
  ['section done', '<div role="dialog" aria-label="Edit work experience"><input value="Test"><button type="button">Done</button></div>', 'advanced'],
  ['embedded application requires manual navigation', '<iframe></iframe><button type="button">Next</button>', 'no_safe_control'],
];
for (const [name, html, expected] of cases) test(`guided safety: ${name}`, () => {
  const h = check(html); try { assert.equal(h.run().outcome, expected); assert.equal(h.clicks(), expected === 'advanced' ? 1 : 0); }
  finally { h.dom.window.close(); }
});
test('guided safety: a shadow-hosted required field is not silently skipped', () => {
  const h = check('<div id="host"></div><button type="button">Next</button>');
  try { h.root.querySelector('#host').attachShadow({mode:'open'}).innerHTML='<input required>'; assert.equal(h.run().outcome,'no_safe_control'); assert.equal(h.clicks(),0); }
  finally {h.dom.window.close();}
});
test('guided safety: a control is never clicked twice on the same step', () => {
  const h = check('<button type="button">Next</button>'); try { h.run(); h.run(); assert.equal(h.clicks(), 1); }
  finally { h.dom.window.close(); }
});
test('guided safety: submit-typed Next is also blocked inside a same-origin frame', () => {
  const h = check('<button type="submit">Next</button>', true);
  try { assert.equal(h.run().outcome, 'no_safe_control'); assert.equal(h.clicks(), 0); }
  finally { h.dom.window.close(); }
});
