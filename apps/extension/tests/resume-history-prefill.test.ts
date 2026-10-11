import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { selectAtsPrefillAdapter, workdayPrefillAdapter } from '../src/job-portal/ats-prefill-adapters';
import { expandRepeatableRows } from '../src/prefill/repeatable-row-expansion';
import {
  existingRowsMatchSnapshot,
  fillRepeatableRecords,
  planRepeatableDropdownFills,
} from '../src/prefill/repeatable-record-engine';
import { classifyField } from '../src/easy-apply/easy-apply-matchers';
import { mostRecentExperience, resumeOnlyFieldValue } from '../src/prefill/resume-history-fields';
import { readyResumeDetail } from '../src/resume/resume-status-row';
import type { ResumeAutofillSnapshotV1 } from '../src/resume/resume-autofill-contract';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');

function page(html: string, host = 'jobs.example.test') {
  const dom = new JSDOM(`<form id="application-form">${html}</form>`, { url: `https://${host}/jobs/1/apply` });
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document,
    HTMLInputElement: dom.window.HTMLInputElement,
    HTMLButtonElement: dom.window.HTMLButtonElement,
    HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    HTMLSelectElement: dom.window.HTMLSelectElement,
    Event: dom.window.Event,
  });
  const doc = dom.window.document as Document;
  return { dom, doc, form: doc.querySelector('form') as HTMLElement };
}

const snapshot: ResumeAutofillSnapshotV1 = {
  contact: {},
  summary: 'Data engineer building reliable pipelines.',
  skills: [],
  certifications: [],
  experience: [
    {
      company: 'Acme Analytics', title: 'Senior Data Engineer', isCurrent: true,
      startDate: { originalText: 'Mar 2022', year: 2022, month: 3, precision: 'month' },
      bullets: [], descriptionText: 'Built pipelines.',
    },
    {
      company: 'Globex', title: 'Data Engineer', isCurrent: false,
      startDate: { originalText: 'Jan 2019', year: 2019, month: 1, precision: 'month' },
      endDate: { originalText: 'Feb 2022', year: 2022, month: 2, precision: 'month' },
      bullets: [], descriptionText: 'Maintained reports.',
    },
    {
      company: 'Initech', title: 'Analyst', isCurrent: false,
      startDate: { originalText: '2016', year: 2016, precision: 'year' },
      endDate: { originalText: '2018', year: 2018, precision: 'year' },
      bullets: [], descriptionText: '',
    },
  ],
  education: [
    { school: 'Northeastern University', degree: 'Master of Science' },
  ],
};

test('text date inputs follow their format hint and never receive an invented day', () => {
  const cases: Array<[string, string]> = [
    ['placeholder="MM/YYYY"', '03/2022'],
    ['placeholder="YYYY-MM"', '2022-03'],
    ['placeholder="MM-YYYY"', '03-2022'],
    ['placeholder="MM/YY"', '03/22'],
    ['placeholder="Month YYYY"', 'March 2022'],
    ['', '03/2022'],
    ['placeholder="MM/DD/YYYY"', ''],
    ['placeholder="DD/MM/YYYY"', ''],
  ];
  for (const [attrs, expected] of cases) {
    const p = page(`<input id="d" type="text" ${attrs}>`);
    try {
      const input = p.doc.getElementById('d') as HTMLInputElement;
      fillRepeatableRecords('experience', [{ element: input, section: 'experience', recordIndex: 0, field: 'startDate' }], snapshot);
      assert.equal(input.value, expected, attrs || 'no hint');
    } finally { p.dom.window.close(); }
  }
});

test('a year-only control receives a year-precision date; MM/YYYY does not', () => {
  const p = page('<input id="y" type="text" placeholder="YYYY"><input id="m" type="text" placeholder="MM/YYYY">');
  try {
    const year = p.doc.getElementById('y') as HTMLInputElement;
    const monthYear = p.doc.getElementById('m') as HTMLInputElement;
    const yearOnly: ResumeAutofillSnapshotV1 = { ...snapshot, experience: [snapshot.experience[2]] };
    fillRepeatableRecords('experience', [
      { element: year, section: 'experience', recordIndex: 0, field: 'startDate' },
      { element: monthYear, section: 'experience', recordIndex: 0, field: 'endDate' },
    ], yearOnly);
    assert.equal(year.value, '2016');
    assert.equal(monthYear.value, '', 'a year-only resume date never gains a month');
  } finally { p.dom.window.close(); }
});

test('Workday Month/Year parts take start or end from the labelled date group', () => {
  const p = page(`<div data-automation-id="workExperienceSection"><h3>Work Experience</h3>
    <div data-automation-id="workExperienceCard">
      <input aria-label="Job Title"><input aria-label="Company">
      <div data-automation-id="formField-startDate"><label>From</label><div data-automation-id="dateInputWrapper">
        <input aria-label="Month" data-automation-id="dateSectionMonth-input"><input aria-label="Year" data-automation-id="dateSectionYear-input"></div></div>
      <div data-automation-id="formField-endDate"><label>To</label><div data-automation-id="dateInputWrapper">
        <input aria-label="Month" data-automation-id="dateSectionMonth-input"><input aria-label="Year" data-automation-id="dateSectionYear-input"></div></div>
    </div></div>`, 'acme.wd5.myworkdayjobs.com');
  try {
    const fields = workdayPrefillAdapter.classifyRepeatableSections(p.form)
      .filter(control => control.section === 'experience')
      .map(control => control.field);
    assert.deepEqual(fields, ['title', 'company', 'startMonth', 'startYear', 'endMonth', 'endYear']);
  } finally { p.dom.window.close(); }
});

test('bare From/To date inputs and listbox dropdowns in history rows are classified', () => {
  const p = page(`<fieldset><legend>Employment history</legend><div data-record-index="0">
      <input aria-label="Employer"><input aria-label="From" placeholder="MM/YYYY"><input aria-label="To" placeholder="MM/YYYY">
    </div></fieldset>
    <fieldset><legend>Education</legend><div data-record-index="0">
      <input aria-label="School"><button type="button" aria-haspopup="listbox" aria-label="Degree">Select one</button>
    </div></fieldset>`);
  try {
    const classified = selectAtsPrefillAdapter(p.doc).classifyRepeatableSections(p.form)
      .map(({ section, field, recordIndex }) => `${section}:${recordIndex}:${field}`);
    assert.deepEqual(classified, [
      'experience:0:company', 'experience:0:startDate', 'experience:0:endDate',
      'education:0:school', 'education:0:degree',
    ]);
  } finally { p.dom.window.close(); }
});

test('history dropdowns are planned with exact month matchers, not filled synchronously', () => {
  const p = page('<div><button id="m" type="button" aria-haspopup="listbox">Select One</button><input id="c"></div>');
  try {
    const month = p.doc.getElementById('m') as HTMLButtonElement;
    const company = p.doc.getElementById('c') as HTMLInputElement;
    const controls = [
      { element: company, section: 'experience' as const, recordIndex: 0, field: 'company' as const },
      { element: month, section: 'experience' as const, recordIndex: 0, field: 'startMonth' as const },
    ];
    const sync = fillRepeatableRecords('experience', controls, snapshot);
    assert.equal(company.value, 'Acme Analytics');
    assert.equal(sync.skippedFields, 0, 'dropdowns are left to the dropdown pass, not counted as skipped');
    const [target] = planRepeatableDropdownFills('experience', controls, snapshot);
    assert.equal(target.control.element, month);
    assert.equal(target.value, 'March');
    assert.ok(target.matcher!('Mar', 'March'));
    assert.ok(target.matcher!('03', 'March'));
    assert.ok(!target.matcher!('May', 'March'));
  } finally { p.dom.window.close(); }
});

test('rows the ATS pre-filled from the attached resume still match despite case and spacing', () => {
  const p = page('<input id="c" value="ACME  analytics"><input id="t">');
  try {
    const company = p.doc.getElementById('c') as HTMLInputElement;
    const title = p.doc.getElementById('t') as HTMLInputElement;
    const controls = [
      { element: company, section: 'experience' as const, recordIndex: 0, field: 'company' as const },
      { element: title, section: 'experience' as const, recordIndex: 0, field: 'title' as const },
    ];
    assert.equal(existingRowsMatchSnapshot('experience', controls, snapshot), true);
    fillRepeatableRecords('experience', controls, snapshot);
    assert.equal(title.value, 'Senior Data Engineer');
    assert.equal(company.value, 'ACME  analytics', 'existing text is never overwritten');
    company.value = 'Someone Else Inc';
    assert.equal(existingRowsMatchSnapshot('experience', controls, snapshot), false);
  } finally { p.dom.window.close(); }
});

function workHistoryPage(initialRow: string) {
  const p = page(`<fieldset data-testid="work-experience"><legend>Work Experience</legend>${initialRow}
    <button type="button">Add another</button></fieldset>`);
  const group = p.doc.querySelector('fieldset')!;
  const button = group.querySelector('button')!;
  button.addEventListener('click', () => {
    const row = p.doc.createElement('div');
    row.setAttribute('data-record-index', String(group.querySelectorAll('[data-record-index]').length));
    row.innerHTML = '<input aria-label="Company"><input aria-label="Job title">';
    group.insertBefore(row, button);
  });
  return { ...p, group };
}

test('a generic form starting with zero rows gets one row per resume job via a plain "Add another"', async () => {
  const p = workHistoryPage('');
  try {
    const adapter = selectAtsPrefillAdapter(p.doc);
    assert.equal(await expandRepeatableRows(adapter, p.form, 'experience', 3, () => true, snapshot), 3);
    assert.equal(p.group.querySelectorAll('[data-record-index]').length, 3);
  } finally { p.dom.window.close(); }
});

test('rows are added after a parser-filled row only when it matches the resume', async () => {
  const matching = workHistoryPage('<div data-record-index="0"><input aria-label="Company" value="Acme Analytics"><input aria-label="Job title"></div>');
  try {
    const adapter = selectAtsPrefillAdapter(matching.doc);
    assert.equal(await expandRepeatableRows(adapter, matching.form, 'experience', 3, () => true, snapshot), 2);
  } finally { matching.dom.window.close(); }
  const other = workHistoryPage('<div data-record-index="0"><input aria-label="Company" value="Unrelated Corp"><input aria-label="Job title"></div>');
  try {
    const adapter = selectAtsPrefillAdapter(other.doc);
    assert.equal(await expandRepeatableRows(adapter, other.form, 'experience', 3, () => true, snapshot), 0);
    assert.equal(await expandRepeatableRows(adapter, other.form, 'experience', 3, () => true), 0,
      'without a resume snapshot, any populated row still blocks row creation');
  } finally { other.dom.window.close(); }
});

test('two Add buttons in one history section are ambiguous and nothing is clicked', async () => {
  const p = workHistoryPage('');
  try {
    const extra = p.doc.createElement('button');
    extra.type = 'button';
    extra.textContent = 'Add';
    p.group.append(extra);
    let clicked = false;
    extra.addEventListener('click', () => { clicked = true; });
    assert.equal(await expandRepeatableRows(selectAtsPrefillAdapter(p.doc), p.form, 'experience', 2, () => true, snapshot), 0);
    assert.equal(clicked, false);
  } finally { p.dom.window.close(); }
});

test('current company, most recent title, and summary labels are resume-only fields', () => {
  assert.equal(classifyField('Current company'), 'currentCompany');
  assert.equal(classifyField('Current Employer *'), 'currentCompany');
  assert.equal(classifyField('Most recent job title'), 'currentTitle');
  assert.equal(classifyField('Current position'), 'currentTitle');
  assert.equal(classifyField('Professional summary'), 'summary');
  assert.equal(classifyField('Summary'), 'summary');
  assert.equal(classifyField('May we contact your current employer?'), null);
  assert.equal(classifyField('Are you currently employed by this company?'), null);
  assert.equal(classifyField('Describe your current role'), null);
  assert.equal(classifyField('Current company website'), null);
  assert.equal(classifyField('Current salary'), null);
  assert.equal(classifyField('Company'), null, 'a bare company field is still not the applicant');
});

test('resume-only values come from the current role, or the latest one when asked for "most recent"', () => {
  assert.equal(resumeOnlyFieldValue('currentCompany', snapshot, 'Current company'), 'Acme Analytics');
  assert.equal(resumeOnlyFieldValue('currentTitle', snapshot, 'Current job title'), 'Senior Data Engineer');
  assert.equal(resumeOnlyFieldValue('summary', snapshot, 'Summary'), 'Data engineer building reliable pipelines.');
  assert.equal(resumeOnlyFieldValue('currentCompany', undefined, 'Current company'), '');
  const noCurrent = { ...snapshot, experience: snapshot.experience.slice(1) };
  assert.equal(resumeOnlyFieldValue('currentCompany', noCurrent, 'Current company'), '',
    'a resume without an ongoing role does not answer "current"');
  assert.equal(resumeOnlyFieldValue('currentCompany', noCurrent, 'Most recent employer'), 'Globex');
  assert.equal(mostRecentExperience(noCurrent)?.company, 'Globex');
});

test('the ready status says how much work history this resume will fill', () => {
  assert.equal(readyResumeDetail(snapshot), 'Attaches + fills 3 jobs, 1 school');
  assert.equal(readyResumeDetail({ ...snapshot, education: [] }), 'Attaches + fills 3 jobs');
  assert.equal(readyResumeDetail({ ...snapshot, experience: [], education: [] }),
    'Attaches on prefill · work history not available');
  assert.equal(readyResumeDetail(undefined), 'Attaches on prefill · work history not available');
});

test('end to end: Prefill fills every resume job, dates, current company and summary on a generic form', async t => {
  const vm = await import('node:vm');
  const local = createRequire(resolve('package.json'));
  const code = local('esbuild').buildSync({
    stdin: { contents: "export { runPrefill } from './easy-apply/easy-apply-engine';", resolveDir: resolve('src') },
    bundle: true, write: false, format: 'cjs', platform: 'node',
  }).outputFiles[0].text;
  const dom = new JSDOM(`<form id="application-form">
    <label for="first">First name</label><input id="first" name="first">
    <label for="cc">Current company</label><input id="cc" name="current_company">
    <label for="sum">Professional summary</label><textarea id="sum" name="summary"></textarea>
    <fieldset data-testid="work-experience"><legend>Work Experience</legend>
      <div data-record-index="0"><input aria-label="Company"><input aria-label="Job title">
        <input aria-label="Start date" placeholder="MM/YYYY"><input aria-label="End date" placeholder="MM/YYYY"></div>
      <button type="button">Add another</button>
    </fieldset></form>`, { url: 'https://careers.example.test/jobs/42/apply' });
  t.after(() => dom.window.close());
  dom.window.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 120, height: 30, x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 30 });
  const doc = dom.window.document;
  const group = doc.querySelector('fieldset')!;
  const add = group.querySelector('button')!;
  add.addEventListener('click', () => {
    const row = doc.createElement('div');
    row.setAttribute('data-record-index', String(group.querySelectorAll('[data-record-index]').length));
    row.innerHTML = '<input aria-label="Company"><input aria-label="Job title"><input aria-label="Start date" placeholder="MM/YYYY"><input aria-label="End date" placeholder="MM/YYYY">';
    group.insertBefore(row, add);
  });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module, exports: module.exports, window: dom.window, document: doc,
    HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement,
    HTMLSelectElement: dom.window.HTMLSelectElement, HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    HTMLButtonElement: dom.window.HTMLButtonElement,
  });
  const result = await module.exports.runPrefill({
    snapshot, profileFallback: { firstName: 'Test' }, quietResultToast: true, allowRowCreation: true,
  });
  const rows = Array.from(group.querySelectorAll('[data-record-index]')).map(row =>
    Array.from(row.querySelectorAll('input')).map(input => (input as HTMLInputElement).value));
  assert.deepEqual(rows, [
    ['Acme Analytics', 'Senior Data Engineer', '03/2022', ''],
    ['Globex', 'Data Engineer', '01/2019', '02/2022'],
    // A year-only resume date never gains a month in an MM/YYYY field.
    ['Initech', 'Analyst', '', ''],
  ]);
  assert.equal((doc.getElementById('cc') as HTMLInputElement).value, 'Acme Analytics');
  assert.equal((doc.getElementById('sum') as HTMLTextAreaElement).value, 'Data engineer building reliable pipelines.');
  assert.equal((doc.getElementById('first') as HTMLInputElement).value, 'Test');
  assert.equal(result.groups.experience.filled, 10, '9 history fields + current company');
  assert.equal(result.remainingRecords.experience, 0);
});

test('end to end: without a generated resume, resume-only fields stay blank', async t => {
  const vm = await import('node:vm');
  const local = createRequire(resolve('package.json'));
  const code = local('esbuild').buildSync({
    stdin: { contents: "export { runPrefill } from './easy-apply/easy-apply-engine';", resolveDir: resolve('src') },
    bundle: true, write: false, format: 'cjs', platform: 'node',
  }).outputFiles[0].text;
  const dom = new JSDOM(`<form id="application-form"><label for="first">First name</label><input id="first">
    <label for="cc">Current company</label><input id="cc"><label for="sum">Summary</label><textarea id="sum"></textarea></form>`,
    { url: 'https://careers.example.test/jobs/42/apply' });
  t.after(() => dom.window.close());
  dom.window.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 120, height: 30, x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 30 });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module, exports: module.exports, window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement,
    HTMLSelectElement: dom.window.HTMLSelectElement, HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    HTMLButtonElement: dom.window.HTMLButtonElement,
  });
  await module.exports.runPrefill({ profileFallback: { firstName: 'Test' }, quietResultToast: true });
  assert.equal((dom.window.document.getElementById('first') as HTMLInputElement).value, 'Test');
  assert.equal((dom.window.document.getElementById('cc') as HTMLInputElement).value, '');
  assert.equal((dom.window.document.getElementById('sum') as HTMLTextAreaElement).value, '');
});
