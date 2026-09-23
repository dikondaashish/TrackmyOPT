import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({
  stdin: {
    contents:
      "export * from './ats-prefill-adapters'; export * from './easy-apply-form'; export * from './easy-apply-dom'; export * from './smart-dropdown';",
    resolveDir: resolve('src'),
  },
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
function harness(
  t: { after: (fn: () => void) => void },
  html: string,
  url = 'https://jobs.lever.co/example/job/apply'
) {
  const dom = new JSDOM(html, { url });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 100,
    height: 30,
  });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: w,
    document: w.document,
    HTMLElement: w.HTMLElement,
    HTMLInputElement: w.HTMLInputElement,
    HTMLSelectElement: w.HTMLSelectElement,
    HTMLTextAreaElement: w.HTMLTextAreaElement,
  });
  return { w, d: w.document, api: module.exports };
}

test('Lever is not misidentified as Greenhouse by its shared form ID', (t) => {
  const h = harness(
    t,
    '<form id="application-form"><input name="name"></form>'
  );
  assert.equal(h.api.selectAtsPrefillAdapter(h.d).id, 'lever');
  assert.equal(h.api.greenhousePrefillAdapter.matches(h.d), false);
});
test('ATS hosts use suffix boundaries and Workday also recognizes myworkdaysite', (t) => {
  for (const [host, expected] of [
    ['jobs.lever.co', 'lever'],
    ['lever.co.evil.example', 'generic'],
    ['acme.myworkdaysite.com', 'workday'],
    ['myworkdaysite.com.evil.example', 'generic'],
  ] as const) {
    const h = harness(t, '', `https://${host}/apply`);
    assert.equal(h.api.selectAtsPrefillAdapter(h.d).id, expected);
  }
});
test('known form discovery skips inactive application steps', (t) => {
  const h = harness(
    t,
    '<form hidden id="application-form"><input aria-label="Email"></form><form id="live"><input aria-label="Full name"><input aria-label="Email"></form>'
  );
  assert.equal(h.api.findApplicationForm()?.id, 'live');
});
test('Workday root discovery passes a hidden earlier form and finds the active step', (t) => {
  const h = harness(
    t,
    '<form hidden id="application-form"><input aria-label="Email"></form><div data-automation-id="jobApplicationPage" id="step"><label>Resume<input type="file" hidden></label></div>'
  );
  assert.equal(
    h.api.workdayPrefillAdapter.findApplicationRoot(h.d)?.id,
    'step'
  );
});
test('Workday upload-only and history-only steps have a discoverable application root', (t) => {
  for (const body of [
    '<label>Resume<input type="file" hidden></label>',
    '<section data-automation-id="workExperienceCard"><input aria-label="Company"></section>',
  ]) {
    const h = harness(
      t,
      `<div data-automation-id="jobApplicationPage" id="step">${body}</div>`,
      'https://acme.myworkdaysite.com/apply'
    );
    assert.equal(h.api.findApplicationForm()?.id, 'step');
  }
});
test('Workday groups fields per record, not per formField, and recognizes month dates', (t) => {
  const h = harness(
    t,
    `<main><section aria-label="Work experience">
    ${[0, 1].map((i) => `<div data-automation-id="workExperienceCard"><div data-automation-id="formField"><input id="company${i}" aria-label="Company"></div><div data-automation-id="formField"><input id="start${i}" aria-label="Start date" type="month"></div></div>`).join('')}
    </section></main>`,
    'https://acme.myworkdayjobs.com/apply'
  );
  const results = h.api.workdayPrefillAdapter.classifyRepeatableSections(
    h.d.querySelector('main')
  );
  assert.deepEqual(
    Array.from(results, (c: any) => [c.element.id, c.recordIndex, c.field]),
    [
      ['company0', 0, 'company'],
      ['start0', 0, 'startDate'],
      ['company1', 1, 'company'],
      ['start1', 1, 'startDate'],
    ]
  );
});

const leverLocation =
  '<form id="application-form"><label for="location-input">Current location</label><div class="application-field"><input id="location-input" class="location-input" name="location" data-qa="location-input"><input id="selected-location" type="hidden" name="selectedLocation"><div class="dropdown-container"><div class="dropdown-results"></div></div></div></form>';
test('Lever search text is not a completed city selection or a plain text target', (t) => {
  const h = harness(t, leverLocation);
  const input = h.d.querySelector('#location-input');
  assert.equal(h.api.isCustomDropdownControl(input), true);
  assert.equal(h.api.isFillable(input), false);
  input.value = 'New York';
  assert.equal(h.api.customDropdownHasValue(input), false);
  h.d.querySelector('#selected-location').value = 'selected-place';
  assert.equal(h.api.customDropdownHasValue(input), true);
});
test('Lever missing suggestions do not leave misleading text or select unrelated options', async (t) => {
  const h = harness(t, leverLocation + '<div role="option">New York</div>');
  const input = h.d.querySelector('#location-input');
  let clicks = 0;
  h.d
    .querySelector('[role="option"]')
    .addEventListener('click', () => clicks++);
  const result = await h.api.selectSmartDropdown(
    input,
    'New York',
    'location',
    undefined,
    30
  );
  assert.equal(result.outcome, 'no_match');
  assert.equal(input.value, '');
  assert.equal(clicks, 0);
});
test('Lever commits a scoped suggestion only when the portal updates its selected location', async (t) => {
  const h = harness(t, leverLocation);
  const input = h.d.querySelector('#location-input');
  input.addEventListener('input', () => {
    if (!input.value) return;
    const option = h.d.createElement('div');
    option.textContent = 'New York, NY, United States';
    option.addEventListener('click', () => {
      input.value = option.textContent;
      h.d.querySelector('#selected-location').value = 'selected-place';
    });
    h.d.querySelector('.dropdown-results').replaceChildren(option);
  });
  assert.equal(
    (
      await h.api.selectSmartDropdown(
        input,
        'New York',
        'location',
        undefined,
        40,
        { countryName: 'United States', stateName: 'NY' }
      )
    ).outcome,
    'selected'
  );
  assert.equal(h.d.querySelector('#selected-location').value, 'selected-place');
});
test('Lever existing uncommitted text belongs to the user and is preserved', async (t) => {
  const h = harness(t, leverLocation);
  const input = h.d.querySelector('#location-input');
  input.value = 'My city';
  assert.equal(
    (
      await h.api.selectSmartDropdown(
        input,
        'New York',
        'location',
        undefined,
        30
      )
    ).outcome,
    'already_filled'
  );
  assert.equal(input.value, 'My city');
  assert.equal(h.api.customDropdownHasValue(input), false);
});

test('SmartRecruiters application root includes fields inside nested open components', (t) => {
  const h = harness(
    t,
    '<oc-oneclick-form id="application"><spl-input></spl-input></oc-oneclick-form>',
    'https://jobs.smartrecruiters.com/oneclick-ui/company/example'
  );
  h.d.querySelector('spl-input').attachShadow({ mode: 'open' }).innerHTML =
    '<input autocomplete="given-name">';
  assert.equal(h.api.selectAtsPrefillAdapter(h.d).id, 'smartrecruiters');
  assert.equal(h.api.findApplicationForm()?.id, 'application');
});
test('ARIA labels resolve in the control shadow scope, not duplicate outer IDs', (t) => {
  const h = harness(
    t,
    '<span id="caption">Unrelated</span><div id="host"></div>'
  );
  const root = h.d.querySelector('#host').attachShadow({ mode: 'open' });
  root.innerHTML =
    '<span id="caption">City</span><input aria-labelledby="caption">';
  assert.equal(h.api.getLabelText(root.querySelector('input')), 'City');
});
test('SmartRecruiters inner input inherits only its own component label', (t) => {
  const h = harness(t, '<spl-input label="City"></spl-input>');
  const root = h.d.querySelector('spl-input').attachShadow({ mode: 'open' });
  root.innerHTML = '<input type="text">';
  assert.equal(h.api.getLabelText(root.querySelector('input')), 'City');
});
test('SmartRecruiters async menu in an enclosing shadow resolves without clicking foreign options', async (t) => {
  const h = harness(
    t,
    '<div id="menu"><div role="option">New York</div></div><spl-autocomplete></spl-autocomplete>'
  );
  const outer = h.d
    .querySelector('spl-autocomplete')
    .attachShadow({ mode: 'open' });
  outer.innerHTML =
    '<spl-input label="City"></spl-input><div id="menu" role="listbox"></div>';
  const inner = outer.querySelector('spl-input').attachShadow({ mode: 'open' });
  inner.innerHTML =
    '<input role="combobox" aria-autocomplete="list" aria-controls="menu" aria-expanded="false">';
  const input = inner.querySelector('input');
  let foreignClicks = 0;
  h.d
    .querySelector('[role="option"]')
    .addEventListener('click', () => foreignClicks++);
  input.addEventListener('input', () => {
    if (!input.value) return;
    h.w.setTimeout(() => {
      const option = h.d.createElement('spl-select-option');
      option.setAttribute('value', 'US_NY_CITY_new_york_city');
      option.textContent = 'New York, NY, US';
      option.addEventListener('click', () => {
        input.value = option.textContent;
        input.setAttribute('aria-expanded', 'false');
      });
      outer.querySelector('#menu').replaceChildren(option);
    }, 5);
  });
  assert.equal(
    (
      await h.api.selectSmartDropdown(
        input,
        'New York',
        'location',
        undefined,
        80,
        { countryName: 'United States', stateName: 'NY' }
      )
    ).outcome,
    'selected'
  );
  assert.equal(foreignClicks, 0);
});

test('unlinked dropdowns never borrow options from another field', async (t) => {
  const h = harness(
    t,
    '<div class="form-field"><button role="combobox">Select</button></div><div class="form-field"><div role="listbox"><div role="option">United States</div></div></div>'
  );
  const input = h.d.querySelector('button');
  let clicks = 0;
  h.d.querySelector('[role="option"]').addEventListener('click', () => {
    clicks++;
    input.setAttribute('aria-valuetext', 'United States');
  });
  assert.equal(
    (
      await h.api.selectSmartDropdown(
        input,
        'United States',
        'country',
        undefined,
        30
      )
    ).outcome,
    'no_match'
  );
  assert.equal(clicks, 0);
});
test('unlinked dropdowns can select an unambiguous option inside their own field', async (t) => {
  const h = harness(
    t,
    '<div class="form-field"><button role="combobox">Select</button><div role="listbox"><div role="option">United States</div></div></div>'
  );
  const input = h.d.querySelector('button');
  h.d
    .querySelector('[role="option"]')
    .addEventListener('click', () =>
      input.setAttribute('aria-valuetext', 'United States')
    );
  assert.equal(
    (
      await h.api.selectSmartDropdown(
        input,
        'United States',
        'country',
        undefined,
        30
      )
    ).outcome,
    'selected'
  );
});
test('virtualized city menus may reuse a node with new option text', async (t) => {
  const h = harness(
    t,
    '<input role="combobox" aria-autocomplete="list" aria-controls="cities"><div id="cities"><div role="option">Boston, MA, US</div></div>'
  );
  const input = h.d.querySelector('input'),
    option = h.d.querySelector('[role="option"]');
  input.addEventListener('input', () =>
    h.w.setTimeout(() => {
      option.textContent = 'New York, NY, US';
    }, 5)
  );
  option.addEventListener('click', () =>
    input.setAttribute('aria-valuetext', option.textContent)
  );
  assert.equal(
    (
      await h.api.selectSmartDropdown(
        input,
        'New York',
        'location',
        undefined,
        50,
        { countryName: 'United States', stateName: 'NY' }
      )
    ).outcome,
    'selected'
  );
});
test('custom dropdowns in hidden or inert shadow hosts remain untouched', async (t) => {
  for (const attribute of ['hidden', 'inert', 'style="display:none"']) {
    const h = harness(t, `<div id="host" ${attribute}></div>`);
    const shadow = h.d.querySelector('#host').attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<button role="combobox" aria-controls="items">Select</button><div id="items"><div role="option">United States</div></div>';
    assert.equal(
      (
        await h.api.selectSmartDropdown(
          shadow.querySelector('button'),
          'United States',
          'country',
          undefined,
          30
        )
      ).outcome,
      'unsupported'
    );
  }
});
