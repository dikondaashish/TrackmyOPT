import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { selectAtsPrefillAdapter } from '../src/ats-prefill-adapters';
import { expandRepeatableRows } from '../src/repeatable-row-expansion';
import { fillRepeatableRecords } from '../src/repeatable-record-engine';
import { recoverPrefillControl } from '../src/prefill-control-recovery';
import { beginPrefillOperationSession } from '../src/prefill-operation-session';
import { acceptPrefillRelay, waitForPrefillRelayTurn } from '../src/prefill-relay-guard';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');

function fixture(host: string) {
  const dom = new JSDOM(`<form id="application-form"><fieldset data-testid="work-experience-section">
    <legend>Work Experience</legend><div data-record-index="0"><input aria-label="Company"><input aria-label="Job title"></div>
    <button type="button" aria-label="Add experience">Add experience</button>
    </fieldset><fieldset data-testid="education-section"><legend>Education</legend>
    <div data-record-index="0"><input aria-label="School"><input aria-label="Degree"></div>
    <button type="button" aria-label="Add education">Add education</button></fieldset></form>`,
    { url: `https://${host}/jobs/1/apply` });
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document,
    HTMLInputElement: dom.window.HTMLInputElement,
    HTMLButtonElement: dom.window.HTMLButtonElement,
    HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    HTMLSelectElement: dom.window.HTMLSelectElement,
  });
  const doc = dom.window.document;
  const form = doc.querySelector('form') as HTMLElement;
  return { dom, doc, form };
}

for (const [host, id] of [
  ['acme.myworkdayjobs.com', 'workday'],
  ['boards.greenhouse.io', 'greenhouse'],
  ['jobs.lever.co', 'lever'],
  ['jobs.ashbyhq.com', 'ashby'],
  ['jobs.smartrecruiters.com', 'smartrecruiters'],
  ['www.linkedin.com', 'linkedin'],
] as const) {
  test(`${id} exposes its explicit field and row capabilities`, async () => {
    const f = fixture(host);
    try {
      const adapter = selectAtsPrefillAdapter(f.doc);
      assert.equal(adapter.id, id);
      assert.equal(adapter.capabilities.contact, true);
      assert.equal(adapter.capabilities.searchableDropdown, true);
      if (id === 'linkedin') {
        assert.equal(adapter.capabilities.experience, false);
        assert.equal(adapter.capabilities.education, false);
        assert.equal(adapter.capabilities.addRecord, undefined);
        return;
      }
      assert.equal(adapter.capabilities.experience, true);
      assert.equal(adapter.capabilities.education, true);
      if (id === 'smartrecruiters') return; // OneClick uses an unsaved editor, exercised below.
      for (const section of ['experience', 'education'] as const) {
        const group = f.doc.querySelector(section === 'experience' ? 'fieldset:first-child' : 'fieldset:last-child')!;
        const button = group.querySelector('button')!;
        button.addEventListener('click', () => {
          const index = group.querySelectorAll('[data-record-index]').length;
          const row = f.doc.createElement('div');
          row.setAttribute('data-record-index', String(index));
          row.innerHTML = section === 'experience'
            ? '<input aria-label="Company"><input aria-label="Job title">'
            : '<input aria-label="School"><input aria-label="Degree">';
          group.insertBefore(row, button);
        });
        assert.equal(await expandRepeatableRows(adapter, f.form, section, 3, () => true), 2);
        assert.equal(group.querySelectorAll('[data-record-index]').length, 3);
        assert.equal(await expandRepeatableRows(adapter, f.form, section, 3, () => true), 0,
          'a second pass cannot add duplicate rows');
      }
    } finally { f.dom.window.close(); }
  });
}

test('SmartRecruiters OneClick opens one empty editor from zero rows and waits for manual save', async () => {
  const dom = new JSDOM(`<oc-oneclick-form>
    <div data-test="experience" class="form-section"><oc-button data-test="add-experience"><spl-button aria-label="Add experience entry">Add</spl-button></oc-button></div>
    <div data-test="education" class="form-section"><oc-button data-test="add-education"><spl-button aria-label="Add education entry">Add</spl-button></oc-button></div>
  </oc-oneclick-form>`, { url: 'https://jobs.smartrecruiters.com/oneclick-ui/company/demo' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document,
    HTMLInputElement: dom.window.HTMLInputElement, HTMLButtonElement: dom.window.HTMLButtonElement,
    HTMLTextAreaElement: dom.window.HTMLTextAreaElement, HTMLSelectElement: dom.window.HTMLSelectElement });
  try {
    const root = dom.window.document.querySelector('oc-oneclick-form') as HTMLElement;
    const adapter = selectAtsPrefillAdapter(dom.window.document);
    for (const section of ['experience', 'education'] as const) {
      const group = root.querySelector(`[data-test="${section}"]`)!;
      const button = group.querySelector('spl-button')!;
      let clicks = 0;
      button.addEventListener('click', () => {
        clicks++;
        const editor = dom.window.document.createElement('div');
        editor.setAttribute('data-test', `${section}-edit-form`);
        editor.innerHTML = `<input aria-label="${section === 'experience' ? 'Company' : 'School'}">`;
        group.append(editor);
      });
      assert.equal(await expandRepeatableRows(adapter, root, section, 3, () => true), 1);
      assert.equal(clicks, 1);
      assert.equal(await expandRepeatableRows(adapter, root, section, 3, () => true), 0);
      assert.equal(clicks, 1, 'an unsaved editor must not trigger another Add');
    }
  } finally { dom.window.close(); }
});

test('SmartRecruiters shadow date input is not treated as a committed native date', () => {
  const f = fixture('jobs.smartrecruiters.com');
  try {
    const host = f.doc.createElement('spl-date-field');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<input type="text" aria-label="From">';
    f.form.append(host);
    const input = shadow.querySelector('input')!;
    const result = fillRepeatableRecords('experience', [{
      element: input, section: 'experience', recordIndex: 0, field: 'startDate',
    }], { contact: {}, skills: [], education: [], certifications: [],
      experience: [{ company: 'Fictional Labs', title: 'Engineer', bullets: [], descriptionText: '',
        startDate: { originalText: 'March 2022', year: 2022, month: 3, precision: 'month' } }] });
    assert.equal(result.filledFields, 0);
    assert.equal(input.value, '');
  } finally { f.dom.window.close(); }
});

test('SmartRecruiters record identity crosses component shadow roots without merging rows', () => {
  const dom = new JSDOM('<oc-oneclick-form><div data-test="experience" class="form-section"><div data-test="experience-entry"><spl-autocomplete label="Title"></spl-autocomplete></div><div data-test="experience-entry"><spl-autocomplete label="Title"></spl-autocomplete></div></div></oc-oneclick-form>',
    { url: 'https://jobs.smartrecruiters.com/oneclick-ui/company/demo' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document,
    HTMLInputElement: dom.window.HTMLInputElement, HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    HTMLSelectElement: dom.window.HTMLSelectElement });
  try {
    for (const host of dom.window.document.querySelectorAll('spl-autocomplete')) {
      host.attachShadow({ mode: 'open' }).innerHTML = '<input role="combobox">';
    }
    const adapter = selectAtsPrefillAdapter(dom.window.document);
    const root = dom.window.document.querySelector('oc-oneclick-form') as HTMLElement;
    const controls = adapter.classifyRepeatableSections(root).filter(control => control.section === 'experience');
    assert.deepEqual(controls.map(control => [control.field, control.recordIndex]), [['title', 0], ['title', 1]]);
  } finally { dom.window.close(); }
});

test('row creation stops at ambiguous Add controls and protects existing edits', async () => {
  const f = fixture('jobs.lever.co');
  try {
    const adapter = selectAtsPrefillAdapter(f.doc);
    const group = f.doc.querySelector('fieldset')!;
    const button = group.querySelector('button')!;
    let clicks = 0;
    button.addEventListener('click', () => { clicks++; });
    group.append(button.cloneNode(true));
    assert.equal(await expandRepeatableRows(adapter, f.form, 'experience', 2, () => true), 0);
    group.lastElementChild?.remove();
    group.querySelector('input')!.value = 'Applicant company';
    assert.equal(await expandRepeatableRows(adapter, f.form, 'experience', 2, () => true), 0);
    assert.equal(clicks, 0);
    group.querySelector('input')!.value = '';
    button.setAttribute('type', 'submit');
    assert.equal(await expandRepeatableRows(adapter, f.form, 'experience', 2, () => true), 0);
    assert.equal(clicks, 0);
  } finally { f.dom.window.close(); }
});

test('async row creation is verified and cancellation prevents another click', async () => {
  const f = fixture('acme.myworkdayjobs.com');
  try {
    const adapter = selectAtsPrefillAdapter(f.doc);
    const group = f.doc.querySelector('fieldset')!;
    const button = group.querySelector('button')!;
    let clicks = 0;
    let active = true;
    button.addEventListener('click', () => {
      clicks++;
      f.dom.window.setTimeout(() => {
        const row = f.doc.createElement('div'); row.setAttribute('data-record-index', '1');
        row.innerHTML = '<input aria-label="Company">'; group.insertBefore(row, button);
        active = false;
      }, 10);
    });
    assert.equal(await expandRepeatableRows(adapter, f.form, 'experience', 4, () => active), 0,
      'cancelled operation does not report a completed expansion');
    assert.equal(clicks, 1, 'cancellation prevents a second Add click');
  } finally { f.dom.window.close(); }
});

test('control recovery requires a unique matching identity after replacement', () => {
  const f = fixture('boards.greenhouse.io');
  try {
    const old = f.doc.querySelector('input')!;
    old.id = 'company'; old.name = 'company';
    recoverPrefillControl(old);
    const next = old.cloneNode(true) as HTMLInputElement;
    old.replaceWith(next);
    assert.equal(recoverPrefillControl(old), next);
    next.after(next.cloneNode(true));
    assert.equal(recoverPrefillControl(old), null, 'ambiguous replacement is never chosen');
    f.form.replaceWith(f.form.cloneNode(true));
    assert.equal(recoverPrefillControl(old), null, 'a replaced form is not the same operation context');
    const unkeyed = f.doc.querySelectorAll('input')[2];
    unkeyed.remove();
    assert.equal(recoverPrefillControl(unkeyed), null);
  } finally { f.dom.window.close(); }
});

test('document generation invalidates older runs on restart, SPA navigation and cancellation', () => {
  const f = fixture('jobs.lever.co');
  try {
    const first = beginPrefillOperationSession(f.doc);
    assert.equal(first(), true);
    const second = beginPrefillOperationSession(f.doc);
    assert.equal(first(), false); assert.equal(second(), true);
    f.doc.dispatchEvent(new f.dom.window.Event('tmo-prefill-invalidated'));
    assert.equal(second(), false);
    const third = beginPrefillOperationSession(f.doc);
    f.dom.window.history.pushState({}, '', '/jobs/2/apply');
    assert.equal(third(), false);
  } finally { f.dom.window.close(); }
});

test('child-frame relay ignores stale/duplicate messages and navigation', () => {
  const f = fixture('jobs.lever.co');
  try {
    const first = acceptPrefillRelay({ relaySequence: 1, undoRunId: 'run-1' });
    assert.ok(first); assert.equal(first!(), true);
    assert.equal(acceptPrefillRelay({ relaySequence: 1, undoRunId: 'run-1' }), null);
    const second = acceptPrefillRelay({ relaySequence: 2, undoRunId: 'run-2' });
    assert.equal(first!(), false); assert.equal(second!(), true);
    assert.equal(acceptPrefillRelay({ relaySequence: 0, undoRunId: 'run-3' }), null);
    assert.equal(acceptPrefillRelay({ relaySequence: 3, undoRunId: 'invalid id' }), null);
    f.doc.dispatchEvent(new f.dom.window.Event('tmo-page-context-changed'));
    assert.equal(second!(), false);
  } finally { f.dom.window.close(); }
});

test('newest relay waits for an older operation to finish and drops superseded work', async () => {
  const f = fixture('jobs.lever.co');
  try {
    const first = acceptPrefillRelay({ relaySequence: 10, undoRunId: 'run-10' })!;
    let busy = true;
    let polls = 0;
    const waiting = waitForPrefillRelayTurn(first, () => busy, async () => { polls++; });
    const latest = acceptPrefillRelay({ relaySequence: 11, undoRunId: 'run-11' })!;
    busy = false;
    assert.equal(await waiting, false, 'a superseded relay never starts');
    busy = true;
    assert.equal(await waitForPrefillRelayTurn(latest, () => busy, async () => { busy = false; }), true);
    assert.ok(polls > 0);
  } finally { f.dom.window.close(); }
});
