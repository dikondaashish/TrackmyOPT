import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { classifyField } from '../src/easy-apply-matchers';
import { chooseSmartDropdownOption, selectSmartDropdown, customDropdownHasValue } from '../src/smart-dropdown';

const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const engineCode = requireLocal('esbuild').buildSync({ entryPoints: ['src/easy-apply-engine.ts'], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
const context = { countryName: 'United States', stateName: 'MA' };
const cityOptions = ['Worcester, Massachusetts, United States', 'Worcester, England, United Kingdom'];

function fixture({ selected = '', delay = 5, options = cityOptions } = {}) {
  const dom = new JSDOM(`<form id="application-form"><fieldset><legend>Phone</legend><label id="country-label" for="country">Country</label><div class="select__control"><div class="select__value-container"><div class="select__input-container"><input id="country" role="combobox" aria-labelledby="country-label" aria-controls="countries" aria-expanded="false"></div></div></div></fieldset><label for="city">Location (City)</label><div class="select__control"><div class="select__value-container"><div class="select__input-container"><input id="city" role="combobox" aria-autocomplete="list" aria-controls="cities" aria-expanded="false"></div></div></div><button type="submit">Submit</button></form>`, { url: 'https://example.test/apply' });
  const { document } = dom.window;
  dom.window.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 120, height: 30, top: 0, left: 0, right: 120, bottom: 30, x: 0, y: 0 });
  const country = document.querySelector('#country');
  const city = document.querySelector('#city');
  let clicks = 0;
  function render(control: any, labels: string[], id: string) {
    document.getElementById(id)?.remove();
    const list = document.createElement('div'); list.id = id; list.setAttribute('role', 'listbox');
    for (const label of labels) {
      const option = document.createElement('div'); option.setAttribute('role', 'option'); option.textContent = label;
      option.addEventListener('click', () => {
        clicks++;
        const value = document.createElement('div'); value.className = 'select__single-value'; value.textContent = label;
        control.closest('.select__value-container').prepend(value); control.value = ''; control.setAttribute('aria-expanded', 'false'); list.remove();
      });
      list.append(option);
    }
    document.body.append(list);
  }
  country.addEventListener('mousedown', () => { country.setAttribute('aria-expanded', 'true'); render(country, ['Canada +1', 'United States +1', 'India +91'], 'countries'); });
  city.addEventListener('mousedown', () => city.setAttribute('aria-expanded', 'true'));
  city.addEventListener('input', () => {
    document.getElementById('cities')?.remove();
    if (city.value === 'Worcester') dom.window.setTimeout(() => render(city, options, 'cities'), delay);
  });
  if (selected) { const value = document.createElement('div'); value.className = 'select__single-value'; value.textContent = selected; city.closest('.select__value-container').prepend(value); }
  return { dom, document, country, city, clicks: () => clicks };
}

test('Greenhouse Country inside the Phone fieldset is a dial-code control', () => {
  assert.equal(classifyField('Country Country Phone'), 'phoneCountryCode');
  assert.equal(classifyField('Country of residence'), 'country');
  assert.equal(classifyField('Phone number'), 'phone');
});

test('unparenthesized country labels resolve shared dial codes without guessing', () => {
  const options = ['Canada +1', 'United States +1', 'India +91'].map(text => ({ text, value: '' }));
  assert.equal(chooseSmartDropdownOption(options, '1', 'phoneCountryCode', context)?.text, 'United States +1');
  assert.equal(chooseSmartDropdownOption(options, '1', 'phoneCountryCode'), null);
  assert.equal(chooseSmartDropdownOption(options, '91', 'phoneCountryCode', context)?.text, 'India +91');
});

test('dial-code labels with the number first still disambiguate United States from Canada', () => {
  const options = ['+1 Canada', '+1 United States', '+91 India'].map(text => ({ text, value: '' }));
  assert.equal(chooseSmartDropdownOption(options, '1', 'phoneCountryCode', context)?.text, '+1 United States');
});

test('city matching uses state/country context and rejects a contradictory location', () => {
  const options = cityOptions.map(text => ({ text, value: '' }));
  assert.equal(chooseSmartDropdownOption(options, 'Worcester', 'location', context)?.text, cityOptions[0]);
  assert.equal(chooseSmartDropdownOption(options.slice(1), 'Worcester', 'location', context), null);
  assert.equal(chooseSmartDropdownOption(options, 'Worcester', 'location'), null);
});

test('existing React Select selections with an empty search input are preserved', async () => {
  const f = fixture({ selected: 'Boston, MA, United States' });
  try {
    assert.equal(customDropdownHasValue(f.city), true);
    assert.equal((await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 40, context)).outcome, 'already_filled');
    assert.equal(f.clicks(), 0);
  } finally { f.dom.window.close(); }
});

test('async city search selects an actual option, not just search text', async () => {
  const f = fixture();
  try {
    const result = await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 80, context);
    assert.equal(result.outcome, 'selected');
    assert.equal(f.city.closest('.select__value-container').textContent, cityOptions[0]);
    assert.equal(f.city.value, '');
  } finally { f.dom.window.close(); }
});

test('unmatched async cities clear only the extension search and leave answers blank', async () => {
  const f = fixture({ options: ['Worcester, England, United Kingdom'] });
  try {
    assert.equal((await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 40, context)).outcome, 'no_match');
    assert.equal(f.city.value, ''); assert.equal(f.clicks(), 0);
  } finally { f.dom.window.close(); }
});

test('cancelled city search never selects a late result', async () => {
  const f = fixture(); let active = true;
  try {
    f.city.addEventListener('input', () => { active = false; });
    await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 40, { ...context, shouldContinue: () => active });
    assert.equal(f.clicks(), 0); assert.equal(f.city.value, '');
  } finally { f.dom.window.close(); }
});

test('linked dropdowns cannot click options from another open listbox', async () => {
  const f = fixture({ options: [] });
  try {
    const other = f.document.createElement('div'); other.innerHTML = '<div role="option">Worcester</div>'; f.document.body.append(other);
    let wrong = false; other.addEventListener('click', () => { wrong = true; });
    assert.equal((await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 40, context)).outcome, 'no_match');
    assert.equal(wrong, false);
  } finally { f.dom.window.close(); }
});

for (const replacement of ['My own city', '']) test(`city search preserves a concurrent user edit: ${replacement || 'cleared'}`, async () => {
  const f = fixture();
  try {
    f.city.addEventListener('input', () => { if (f.city.value === 'Worcester') f.city.value = replacement; });
    assert.equal((await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 40, context)).outcome, 'already_filled');
    assert.equal(f.city.value, replacement); assert.equal(f.clicks(), 0);
  } finally { f.dom.window.close(); }
});

for (const attribute of ['disabled', 'readonly']) test(`city search respects ${attribute}`, async () => {
  const f = fixture();
  try {
    f.city.setAttribute(attribute, '');
    assert.equal((await selectSmartDropdown(f.city, 'Worcester', 'location', undefined, 40, context)).outcome, 'unsupported');
    assert.equal(f.city.value, ''); assert.equal(f.clicks(), 0);
  } finally { f.dom.window.close(); }
});

test('real prefill engine fills both Greenhouse contact dropdowns from the saved profile', async () => {
  const f = fixture(); const module = { exports: {} as any };
  try {
    vm.runInNewContext(engineCode, { module, exports: module.exports, document: f.document, window: f.dom.window, HTMLElement: f.dom.window.HTMLElement, HTMLInputElement: f.dom.window.HTMLInputElement, HTMLTextAreaElement: f.dom.window.HTMLTextAreaElement, HTMLSelectElement: f.dom.window.HTMLSelectElement });
    await module.exports.runPrefill({ profileFallback: { firstName: 'Test', country: 'United States', city: 'Worcester', state: 'MA', phone: '' }, quietResultToast: true, featureFlags: { historyFields: false } });
    assert.equal(f.country.closest('.select__value-container').textContent, 'United States +1');
    assert.equal(f.city.closest('.select__value-container').textContent, cityOptions[0]);
    assert.equal(f.clicks(), 2);
  } finally { f.dom.window.close(); }
});

test('React dropdown opening waits for the render instead of toggling it closed', async () => {
  const f = fixture();
  try {
    const country = f.country.cloneNode(true);
    f.country.replaceWith(country);
    // Greenhouse controls menuIsOpen from keyup, not react-select's keydown.
    country.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') f.dom.window.setTimeout(() => {
        country.setAttribute('aria-expanded', 'true');
        const list = f.document.createElement('div'); list.id = 'countries';
        list.innerHTML = '<div role="option">United States +1</div>';
        list.firstChild.addEventListener('click', () => {
          country.setAttribute('aria-valuetext', 'United States +1'); list.remove();
        });
        f.document.body.append(list);
      }, 5);
    });
    assert.equal((await selectSmartDropdown(country, '1', 'phoneCountryCode', undefined, 80, context)).outcome, 'selected');
    assert.equal(country.getAttribute('aria-valuetext'), 'United States +1');
  } finally { f.dom.window.close(); }
});

test('search results hidden until ArrowDown are opened and selected', async () => {
  const f = fixture();
  try {
    const city = f.city.cloneNode(true); f.city.replaceWith(city);
    city.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' || city.value !== 'Worcester') return;
      city.setAttribute('aria-expanded', 'true');
      const list = f.document.createElement('div'); list.id = 'cities';
      list.innerHTML = '<div role="option">Worcester, Massachusetts, United States</div>';
      list.firstChild.addEventListener('click', () => { city.value = ''; city.setAttribute('aria-valuetext', cityOptions[0]); list.remove(); });
      f.document.body.append(list);
    });
    assert.equal((await selectSmartDropdown(city, 'Worcester', 'location', undefined, 80, context)).outcome, 'selected');
    assert.equal(city.getAttribute('aria-valuetext'), cityOptions[0]);
  } finally { f.dom.window.close(); }
});

test('an ignored option click is not reported as a successful selection', async () => {
  const f = fixture();
  try {
    f.country.addEventListener('mousedown', () => {
      const option = f.document.querySelector('#countries').children[1];
      option.replaceWith(option.cloneNode(true));
    });
    assert.notEqual((await selectSmartDropdown(f.country, '1', 'phoneCountryCode', undefined, 40, context)).outcome, 'selected');
    assert.equal(customDropdownHasValue(f.country), false);
  } finally { f.dom.window.close(); }
});

test('async location-detail lookup must finish before reporting selection', async () => {
  const f = fixture();
  try {
    f.country.addEventListener('mousedown', () => {
      const old = f.document.querySelector('#countries').children[1];
      const option = old.cloneNode(true); old.replaceWith(option);
      option.addEventListener('click', () => f.dom.window.setTimeout(() => {
        f.country.setAttribute('aria-valuetext', 'United States +1');
      }, 600));
    });
    assert.equal((await selectSmartDropdown(f.country, '1', 'phoneCountryCode', undefined, 900, context)).outcome, 'selected');
  } finally { f.dom.window.close(); }
});
