/**
 * The ten real-world scenarios from the universal-autofill brief, each run
 * through the actual runPrefill engine against a form that behaves like the
 * portal pattern it models (async dependent lists, listbox buttons, remote
 * typeaheads, masks, rejected values). Values are fictitious test data.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const bundle = local('esbuild').buildSync({
  stdin: { contents: "export { runPrefill } from './easy-apply/easy-apply-engine';", resolveDir: resolve('src') },
  bundle: true, write: false, format: 'cjs', platform: 'node',
}).outputFiles[0].text;

const date = (month: number, year: number) => ({ originalText: `${month}/${year}`, month, year, precision: 'month' as const });
const job = (company: string, title: string, start: [number, number], end?: [number, number]) => ({
  company, title, isCurrent: !end, bullets: [], descriptionText: `${title} at ${company}.`,
  startDate: date(...start), ...(end ? { endDate: date(...end) } : {}),
});

const snapshot = {
  contact: {}, skills: [], certifications: [],
  experience: [
    job('Acme Analytics', 'Senior Data Engineer', [3, 2022]),
    job('Globex', 'Data Engineer', [1, 2019], [2, 2022]),
    job('Initech', 'Analyst', [6, 2017], [12, 2018]),
    job('Hooli', 'Intern', [5, 2016], [8, 2016]),
  ],
  education: [
    { school: 'Northeastern University', degree: 'Master of Science', fieldOfStudy: 'Data Science' },
    { school: 'Example State University', degree: 'Bachelor of Science', fieldOfStudy: 'Mathematics' },
  ],
};

const profile = {
  firstName: 'Test', lastName: 'Applicant', email: 'test.applicant@example.test',
  phone: '+1 (555) 123-4567', country: 'United States', state: 'TX', city: 'Dallas',
};

function page(t: { after: (fn: () => void) => void }, body: string, host = 'careers.example.test') {
  const dom = new JSDOM(`<form id="application-form">${body}</form>`, { url: `https://${host}/jobs/42/apply` });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 120, height: 30, x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 30 });
  const module = { exports: {} as any };
  vm.runInNewContext(bundle, {
    module, exports: module.exports, window: w, document: w.document,
    HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, HTMLSelectElement: w.HTMLSelectElement,
    HTMLTextAreaElement: w.HTMLTextAreaElement, HTMLButtonElement: w.HTMLButtonElement,
    Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, MutationObserver: w.MutationObserver,
  });
  const $ = <T extends Element = HTMLInputElement>(selector: string) => w.document.querySelector(selector) as unknown as T;
  const prefill = (options: Record<string, unknown> = {}) => module.exports.runPrefill({
    profileFallback: profile, quietResultToast: true, allowRowCreation: true, ...options,
  });
  return { w, doc: w.document as Document, $, prefill };
}

/** An accessible listbox dropdown: a button or input that opens role=option items. */
function listbox(doc: Document, control: HTMLElement, options: () => string[], onPick: (text: string) => void) {
  const id = `list-${Math.random().toString(36).slice(2)}`;
  control.setAttribute('aria-controls', id);
  const open = () => {
    doc.getElementById(id)?.remove();
    const list = doc.createElement('ul');
    list.id = id;
    list.setAttribute('role', 'listbox');
    for (const text of options()) {
      const option = doc.createElement('li');
      option.setAttribute('role', 'option');
      option.textContent = text;
      option.addEventListener('click', () => { onPick(text); list.remove(); control.setAttribute('aria-expanded', 'false'); });
      list.append(option);
    }
    control.setAttribute('aria-expanded', 'true');
    (control.closest('div') ?? doc.body).append(list);
  };
  control.addEventListener('mousedown', open);
  return open;
}

test('1. separate country-code select: code selected once, number has no duplicate code', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <fieldset><legend>Phone</legend>
      <label for="cc">Country</label><select id="cc" name="phone_country"><option value="">Select</option>
        <option value="US">United States (+1)</option><option value="IN">India (+91)</option></select>
      <label for="ph">Number</label><input id="ph" type="tel" name="phone_number"></fieldset>`);
  const result = await p.prefill();
  assert.equal(p.$<HTMLSelectElement>('#cc').value, 'US');
  assert.equal(p.$('#ph').value, '(555) 123-4567');
  assert.ok(result.dropdownsSelected >= 1);
});

test('1b. a page-default "+1" is corrected for an applicant whose number is +91', async t => {
  const p = page(t, `<div class="phone"><label for="cc">Phone country code</label><select id="cc">
      <option value="+1" selected>+1</option><option value="+91">+91</option><option value="+44">+44</option></select>
    <label for="ph">Phone number</label><input id="ph" type="tel"></div>`);
  await p.prefill({ profileFallback: { ...profile, phone: '+91 98765 43210', country: 'India' } });
  assert.equal(p.$<HTMLSelectElement>('#cc').value, '+91');
  assert.equal(p.$('#ph').value, '98765 43210');
});

test('2. single field asking for the international format receives E.164', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <label for="ph">Mobile number</label><input id="ph" type="tel" placeholder="+1 555 555 5555">`);
  await p.prefill({ profileFallback: { ...profile, phone: '(555) 123-4567' } });
  assert.equal(p.$('#ph').value, '+15551234567');
});

test('3. Country → State → City dependent dropdowns fill in order after each list loads', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <label for="country">Country</label><select id="country"><option value="">Select</option>
      <option value="CA">Canada</option><option value="US">United States of America</option></select>
    <label for="state">State</label><select id="state" disabled><option value="">Select</option></select>
    <label for="city">City</label><select id="city" disabled><option value="">Select</option></select>`);
  const fillList = (select: HTMLSelectElement, values: string[]) => p.w.setTimeout(() => {
    for (const text of values) select.add(new p.w.Option(text, text));
    select.disabled = false;
  }, 60);
  p.$<HTMLSelectElement>('#country').addEventListener('change', () =>
    fillList(p.$<HTMLSelectElement>('#state'), ['Texas', 'Tennessee', 'Utah']));
  p.$<HTMLSelectElement>('#state').addEventListener('change', () =>
    fillList(p.$<HTMLSelectElement>('#city'), ['Austin', 'Dallas', 'Houston']));
  const result = await p.prefill();
  assert.equal(p.$<HTMLSelectElement>('#country').value, 'US');
  assert.equal(p.$<HTMLSelectElement>('#state').value, 'Texas');
  assert.equal(p.$<HTMLSelectElement>('#city').value, 'Dallas');
  assert.equal(result.dropdownsSelected, 3);
});

test('4. Workday-style custom month/year listbox buttons in a work-history row', async t => {
  const p = page(t, `<div data-automation-id="workExperienceSection"><h3>Work Experience</h3>
    <div data-record-index="0"><label>Job Title<input aria-label="Job Title"></label><label>Company<input aria-label="Company"></label>
      <div data-automation-id="formField-startDate"><label>From</label><div>
        <button type="button" id="sm" aria-haspopup="listbox" aria-label="Month">Select One</button>
        <button type="button" id="sy" aria-haspopup="listbox" aria-label="Year">Select One</button></div></div>
    </div></div>`, 'acme.wd5.myworkdayjobs.com');
  const months = ['January', 'February', 'March', 'April'];
  const years = ['2021', '2022', '2023'];
  for (const [id, values] of [['#sm', months], ['#sy', years]] as const) {
    const button = p.$<HTMLButtonElement>(id);
    listbox(p.doc, button, () => [...values], text => { button.textContent = text; });
  }
  const result = await p.prefill({ snapshot: { ...snapshot, experience: [snapshot.experience[0]] } });
  assert.equal(p.$('[aria-label="Company"]').value, 'Acme Analytics');
  assert.equal(p.$<HTMLButtonElement>('#sm').textContent, 'March');
  assert.equal(p.$<HTMLButtonElement>('#sy').textContent, '2022');
  assert.equal(result.recordsFilled.experience, 1);
});

test('5. searchable university and degree typeaheads load options from the typed search', async t => {
  const p = page(t, `<fieldset><legend>Education</legend><div data-record-index="0">
      <div><label for="school">School</label><input id="school" role="combobox" aria-autocomplete="list"></div>
      <div><label for="degree">Degree</label><input id="degree" role="combobox" aria-autocomplete="list"></div>
    </div></fieldset>`);
  const schools = ['Northeastern Illinois University', 'Northeastern University', 'Northern Arizona University'];
  const degrees = ["Associate's Degree", "Bachelor's Degree", "Master's Degree", 'Doctorate'];
  for (const [id, all] of [['#school', schools], ['#degree', degrees]] as const) {
    const input = p.$(id);
    const open = listbox(p.doc, input, () => all.filter(text => input.value && text.toLowerCase().includes(input.value.toLowerCase())),
      text => input.setAttribute('aria-valuetext', text));
    // Remote search: options arrive a moment after typing.
    input.addEventListener('input', () => p.w.setTimeout(open, 40));
  }
  const result = await p.prefill({ snapshot: { ...snapshot, experience: [], education: [snapshot.education[0]] } });
  assert.equal(p.$('#school').getAttribute('aria-valuetext'), 'Northeastern University');
  assert.equal(p.$('#degree').getAttribute('aria-valuetext'), "Master's Degree");
  assert.equal(result.recordsFilled.education, 1);
});

test('6. four work experiences and two education records create the rows they need', async t => {
  const row = (section: string) => section === 'exp'
    ? '<input aria-label="Company"><input aria-label="Job title"><input aria-label="Start date" placeholder="MM/YYYY"><input aria-label="End date" placeholder="MM/YYYY">'
    : '<input aria-label="School"><input aria-label="Field of study">';
  const p = page(t, `<label for="first">First name</label><input id="first">
    <fieldset id="exp"><legend>Work Experience</legend><div data-record-index="0">${row('exp')}</div><button type="button">Add another</button></fieldset>
    <fieldset id="edu"><legend>Education</legend><div data-record-index="0">${row('edu')}</div><button type="button">+ Add</button></fieldset>`);
  for (const id of ['exp', 'edu']) {
    const group = p.$<HTMLFieldSetElement>(`#${id}`);
    const add = group.querySelector('button')!;
    add.addEventListener('click', () => {
      const next = p.doc.createElement('div');
      next.setAttribute('data-record-index', String(group.querySelectorAll('[data-record-index]').length));
      next.innerHTML = row(id);
      group.insertBefore(next, add);
    });
  }
  const result = await p.prefill({ snapshot });
  const values = (id: string) => Array.from(p.$<HTMLElement>(`#${id}`).querySelectorAll('[data-record-index]'))
    .map(r => Array.from(r.querySelectorAll('input')).map(i => (i as HTMLInputElement).value));
  assert.deepEqual(values('exp'), [
    ['Acme Analytics', 'Senior Data Engineer', '03/2022', ''],
    ['Globex', 'Data Engineer', '01/2019', '02/2022'],
    ['Initech', 'Analyst', '06/2017', '12/2018'],
    ['Hooli', 'Intern', '05/2016', '08/2016'],
  ]);
  assert.deepEqual(values('edu'), [['Northeastern University', 'Data Science'], ['Example State University', 'Mathematics']]);
  assert.deepEqual({ ...result.recordsFilled }, { experience: 4, education: 2 });
});

test('7. rows the portal already parsed from the PDF are kept and completed, not duplicated', async t => {
  const row = '<input aria-label="Company"><input aria-label="Job title">';
  const p = page(t, `<fieldset id="exp"><legend>Work Experience</legend>
    <div data-record-index="0"><input aria-label="Company" value="ACME ANALYTICS"><input aria-label="Job title" value="Senior Data Engineer"></div>
    <div data-record-index="1"><input aria-label="Company" value="Globex"><input aria-label="Job title"></div>
    <button type="button">Add another</button></fieldset>`);
  const group = p.$<HTMLFieldSetElement>('#exp');
  const add = group.querySelector('button')!;
  add.addEventListener('click', () => {
    const next = p.doc.createElement('div');
    next.setAttribute('data-record-index', String(group.querySelectorAll('[data-record-index]').length));
    next.innerHTML = row;
    group.insertBefore(next, add);
  });
  await p.prefill({ snapshot: { ...snapshot, education: [] } });
  const rows = Array.from(group.querySelectorAll('[data-record-index]'))
    .map(r => Array.from(r.querySelectorAll('input')).map(i => (i as HTMLInputElement).value));
  assert.deepEqual(rows, [
    ['ACME ANALYTICS', 'Senior Data Engineer'],
    ['Globex', 'Data Engineer'],
    ['Initech', 'Analyst'],
    ['Hooli', 'Intern'],
  ]);
});

test('8. a field revealed by an earlier choice is filled in a follow-up pass', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <label for="country">Country</label><select id="country"><option value="">Select</option><option>United States</option><option>India</option></select>
    <div id="state-row" hidden><label for="state">State / Province</label><select id="state"><option value="">Select</option><option>Texas</option><option>Utah</option></select></div>`);
  p.$<HTMLSelectElement>('#country').addEventListener('change', () => {
    p.w.setTimeout(() => { p.$<HTMLElement>('#state-row').hidden = false; }, 50);
  });
  await p.prefill();
  assert.equal(p.$<HTMLSelectElement>('#state').value, 'Texas');
});

test('9. similar-looking options are never confused', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <label for="country">Country</label><select id="country"><option value="">Select</option>
      <option>Dominica</option><option>United States Minor Outlying Islands</option><option>United States</option></select>
    <label for="state">State</label><select id="state"><option value="">Select</option><option>West Virginia</option><option>Virginia</option></select>
    <label for="ms">Degree level</label>`);
  await p.prefill({ profileFallback: { ...profile, country: 'USA', state: 'VA' } });
  assert.equal(p.$<HTMLSelectElement>('#country').value, 'United States');
  assert.equal(p.$<HTMLSelectElement>('#state').value, 'Virginia');
});

test('9b. no confident option means blank, never the first option', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <label for="country">Country</label><select id="country"><option value="">Select</option><option>Canada</option><option>Mexico</option></select>`);
  await p.prefill();
  assert.equal(p.$<HTMLSelectElement>('#country').value, '');
});

test('10. a mask that reformats is accepted; a field that rejects the value is reported', async t => {
  const p = page(t, `<label for="first">First name</label><input id="first">
    <label for="ph">Phone</label><input id="ph" type="tel">
    <label for="city">City</label><input id="city" required>`);
  const phone = p.$('#ph');
  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(-10);
    if (d.length === 10) phone.value = `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  });
  const city = p.$('#city');
  city.addEventListener('input', () => p.w.setTimeout(() => { city.value = ''; }, 5));
  const result = await p.prefill({ profileFallback: { ...profile, phone: '5551234567' } });
  assert.equal(phone.value, '(555) 123-4567');
  assert.ok(result.fieldSources.some((entry: { control: Element }) => entry.control === phone), 'masked phone counted as filled');
  assert.equal(city.value, '');
  assert.ok(result.retryOperations.some((op: { originalControl: Element }) => op.originalControl === city), 'rejected city offered for retry');
});
