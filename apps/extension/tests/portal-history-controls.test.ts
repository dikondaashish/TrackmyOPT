import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import type { ClassifiedControl } from '../src/ats-prefill-adapters';
import type { ResumeDateValue } from '../src/resume-autofill-contract';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({
  stdin: {
    contents:
      "export * from './src/repeatable-record-engine'; export * from './src/prefill-undo';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
const march: ResumeDateValue = {
  originalText: 'March 2022',
  precision: 'month',
  month: 3,
  year: 2022,
};

function harness(t: { after: (fn: () => void) => void }, html: string) {
  const dom = new JSDOM(`<form>${html}</form>`, {
    url: 'https://jobs.example.test/apply',
  });
  t.after(() => dom.window.close());
  const module = { exports: {} as any };
  const w = dom.window;
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: w,
    document: w.document,
    HTMLInputElement: w.HTMLInputElement,
    HTMLTextAreaElement: w.HTMLTextAreaElement,
    HTMLSelectElement: w.HTMLSelectElement,
    Event: w.Event,
  });
  const el = (id = 'a') => w.document.getElementById(id) as any;
  const fill = (
    field: ClassifiedControl['field'],
    date = march,
    id = 'a',
    section: 'experience' | 'education' = 'experience',
    onFilled?: () => void
  ) => {
    const record = {
      company: 'Acme',
      school: 'Example University',
      degree: 'Bachelor',
      title: 'Engineer',
      descriptionText: 'Built tools',
      bullets: [],
      isCurrent: true,
      startDate: date,
      endDate: date,
    };
    return module.exports.fillRepeatableRecords(
      section,
      [{ element: el(id), section, recordIndex: 0, field }],
      {
        contact: {},
        skills: [],
        certifications: [],
        experience: [record],
        education: [record],
      },
      onFilled
    );
  };
  return { api: module.exports, w, el, fill };
}

for (const section of ['experience', 'education'] as const) {
  for (const field of ['startDate', 'endDate'] as const) {
    test(`${section} ${field}: native month accepts known month precision`, (t) => {
      const h = harness(t, '<input id="a" type="month">');
      assert.equal(h.fill(field, march, 'a', section).filledFields, 1);
      assert.equal(h.el().value, '2022-03');
    });
  }
}

test('full dates and other day/time controls never receive an invented day', (t) => {
  for (const type of ['date', 'datetime-local', 'week', 'time']) {
    const h = harness(t, `<input id="a" type="${type}">`);
    for (const field of ['startDate', 'startYear', 'startMonth'] as const) {
      assert.equal(h.fill(field).filledFields, 0, `${type}/${field}`);
      assert.equal(h.el().value, '');
    }
  }
});

test('month controls reject year/text precision, partial dates, and invalid numeric dates', (t) => {
  const h = harness(
    t,
    '<input id="a" type="month"><input id="b"><input id="c">'
  );
  const dates = [
    { ...march, precision: 'year' },
    { ...march, precision: 'text' },
    { ...march, precision: 'day' },
    { ...march, year: undefined },
    ...[0, 13, -1, 1.5, NaN, Infinity, '3'].map((month) => ({
      ...march,
      month,
    })),
    ...[0, -1, 10000, 2022.5, NaN, Infinity, '2022'].map((year) => ({
      ...march,
      year,
    })),
  ];
  for (const date of dates) {
    assert.equal(
      h.fill('startDate', date as ResumeDateValue).filledFields,
      0,
      JSON.stringify(date)
    );
    assert.equal(h.el().value, '');
  }
  for (const date of dates.filter((d) => d.precision !== 'year')) {
    assert.equal(
      h.fill('startMonth', date as ResumeDateValue, 'b').filledFields,
      0,
      JSON.stringify(date)
    );
    assert.equal(
      h.fill('startYear', date as ResumeDateValue, 'c').filledFields,
      0,
      JSON.stringify(date)
    );
  }
});

test('year precision fills only a year, and valid numeric bounds remain accepted', (t) => {
  const h = harness(t, '<input id="a" type="number"><input id="b">');
  assert.equal(
    h.fill('startYear', { ...march, precision: 'year' }).filledFields,
    1
  );
  assert.equal(h.el().value, '2022');
  assert.equal(
    h.fill('startMonth', { ...march, precision: 'year' }, 'b').filledFields,
    0
  );
  for (const [year, month] of [
    [1, 1],
    [9999, 12],
  ]) {
    const edge = harness(t, '<input id="a" type="month">');
    assert.equal(
      edge.fill('startDate', { ...march, year, month }).filledFields,
      1
    );
    assert.equal(
      edge.el().value,
      `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`
    );
  }
});

test('numeric and month controls respect native min, max, and step without writes or events', (t) => {
  for (const [field, attrs] of [
    ['startYear', 'type="number" min="2023"'],
    ['startYear', 'type="number" max="2021"'],
    ['startYear', 'type="number" min="2021" step="2"'],
    ['startMonth', 'type="number" max="2"'],
    ['startDate', 'type="month" min="2023-01"'],
    ['startDate', 'type="month" max="2022-02"'],
    ['startDate', 'type="month" min="2022-02" step="2"'],
  ] as const) {
    const h = harness(t, `<input id="a" ${attrs}>`);
    let events = 0;
    h.el().addEventListener('input', () => events++);
    assert.equal(h.fill(field).filledFields, 0, attrs);
    assert.equal(h.el().value, '', attrs);
    assert.equal(events, 0, attrs);
  }
});

test('month selects use calendar labels ahead of zero-based storage values', (t) => {
  const h = harness(
    t,
    `<select id="a"><option value="">Choose</option>
    <option value="1">February</option><option value="2">March</option><option value="3">April</option></select>`
  );
  assert.equal(h.fill('startMonth').filledFields, 1);
  assert.equal(h.el().value, '2');
});

test('month selects never substitute another month when the desired label is disabled or missing', (t) => {
  for (const target of [
    '',
    '<option value="2" disabled>March</option>',
    '<optgroup disabled><option value="2">March</option></optgroup>',
  ]) {
    const h = harness(
      t,
      `<select id="a"><option value="">Choose</option>${target}<option value="3">April</option></select>`
    );
    assert.equal(h.fill('startMonth').filledFields, 0);
    assert.equal(h.el().value, '');
  }
});

test('native selects match unique enabled labels or values for date and non-date fields', (t) => {
  for (const [field, options, expected] of [
    ['startMonth', '<option value="03">03</option>', '03'],
    [
      'startMonth',
      '<option value="m3" label="March">third month</option>',
      'm3',
    ],
    ['startYear', '<option value="year-id">2022</option>', 'year-id'],
    [
      'company',
      '<option disabled value="old">Acme</option><option value="company-id"> ACME </option>',
      'company-id',
    ],
    ['degree', '<option value="degree-id">Bachelor</option>', 'degree-id'],
  ] as const) {
    const h = harness(
      t,
      `<select id="a"><option value="">Choose</option>${options}</select>`
    );
    assert.equal(
      h.fill(field, march, 'a', field === 'degree' ? 'education' : 'experience')
        .filledFields,
      1
    );
    assert.equal(h.el().value, expected);
  }
});

test('ambiguous, disabled, missing, multiple, and duplicate-value select matches stay untouched', (t) => {
  for (const [attrs, options] of [
    ['', '<option value="x">Acme</option><option value="y">Acme</option>'],
    ['', '<option disabled value="Acme">Acme</option>'],
    ['', '<optgroup disabled><option value="Acme">Acme</option></optgroup>'],
    ['', '<option value="other">Other</option>'],
    ['multiple', '<option value="Acme">Acme</option>'],
    ['', '<option value="x">Other</option><option value="x">Acme</option>'],
  ]) {
    const h = harness(
      t,
      `<select id="a" ${attrs}><option value="" selected>Choose</option>${options}</select>`
    );
    let events = 0;
    h.el().addEventListener('change', () => events++);
    assert.equal(h.fill('company').filledFields, 0, options);
    assert.equal(h.el().value, '');
    assert.equal(events, 0);
  }
});

test('readonly, disabled, computed CSS hidden, and existing controls are preserved', (t) => {
  for (const html of [
    '<input id="a" readonly>',
    '<textarea id="a" readonly></textarea>',
    '<input id="a" disabled>',
    '<fieldset disabled><input id="a"></fieldset>',
    '<input id="a" value="User value">',
    '<input id="a" value=" ">',
    '<select id="a"><option value="0">January</option></select>',
    '<style>.off {display:none}</style><div class="off"><input id="a"></div>',
    '<style>.off {visibility:hidden}</style><input id="a" class="off">',
    '<style>.off {visibility:collapse}</style><div class="off"><input id="a"></div>',
    '<div hidden><input id="a"></div>',
    '<div aria-hidden="true"><input id="a"></div>',
    '<input id="a" role="combobox">',
    '<div data-custom-datepicker><input id="a"></div>',
  ]) {
    const h = harness(t, html);
    const before = h.el().value;
    assert.equal(h.fill('company').filledFields, 0, html);
    assert.equal(h.el().value, before, html);
  }
});

test('native prototype setters bypass React trackers and emit bubbling input/change without clicks', (t) => {
  for (const [html, field, property, expected] of [
    ['<input id="a">', 'company', 'value', 'Acme'],
    ['<textarea id="a"></textarea>', 'description', 'value', 'Built tools'],
    [
      '<select id="a"><option value="">Choose</option><option value="Acme">Acme</option></select>',
      'company',
      'value',
      'Acme',
    ],
    ['<input id="a" type="checkbox">', 'isCurrent', 'checked', true],
  ] as const) {
    const h = harness(t, html);
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(h.el()),
      property
    )!;
    let trackerWrites = 0;
    Object.defineProperty(h.el(), property, {
      configurable: true,
      get() {
        return descriptor.get!.call(this);
      },
      set(value) {
        trackerWrites++;
        descriptor.set!.call(this, value);
      },
    });
    const events: string[] = [];
    for (const event of ['input', 'change', 'click'])
      h.w.document.addEventListener(event, () => events.push(event));
    assert.equal(h.fill(field).filledFields, 1);
    assert.equal(h.el()[property], expected);
    assert.equal(trackerWrites, 0);
    assert.deepEqual(events, ['input', 'change']);
  }
});

test('host rejection is not reported as a successful fill', (t) => {
  const h = harness(t, '<input id="a">');
  h.el().addEventListener('change', () => {
    h.el().value = '';
  });
  let filledCallbacks = 0;
  assert.equal(
    h.fill('company', march, 'a', 'experience', () => filledCallbacks++)
      .filledFields,
    0
  );
  assert.equal(filledCallbacks, 0);
});

test('history fills remain undoable and do not add rows', async (t) => {
  const h = harness(
    t,
    '<fieldset><input id="a" type="month"></fieldset><button type="button">Add row</button>'
  );
  await h.api.withPrefillUndo(async () => {
    assert.equal(h.fill('startDate').filledFields, 1);
  });
  assert.equal(h.api.undoLastPrefill().restored, 1);
  assert.equal(h.el().value, '');
  assert.equal(h.w.document.querySelectorAll('fieldset').length, 1);
});
