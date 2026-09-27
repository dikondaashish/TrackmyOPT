import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { selectSmartDropdown } from '../src/smart-dropdown';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');

function fixture() {
  const dom = new JSDOM('<form><div class="form-field"><input id="city" name="city" role="combobox" aria-label="City" aria-autocomplete="list" aria-controls="cities" aria-expanded="false"></div><div id="cities" role="listbox"></div></form>',
    { url: 'https://boards.greenhouse.io/acme/jobs/1' });
  Object.assign(globalThis, {
    HTMLInputElement: dom.window.HTMLInputElement,
    HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
  });
  const doc = dom.window.document;
  const input = doc.querySelector('#city') as HTMLInputElement;
  const list = doc.querySelector('#cities')!;
  function option(label: string) {
    const node = doc.createElement('div');
    node.setAttribute('role', 'option');
    node.textContent = label;
    list.append(node);
    return node;
  }
  return { dom, doc, input, list, option };
}

test('wrong committed option is rejected even after an exact candidate click', async () => {
  const f = fixture();
  try {
    f.input.addEventListener('input', () => {
      if (f.input.value !== 'Boston') return;
      const choice = f.option('Boston, MA, United States');
      choice.addEventListener('click', () => f.input.setAttribute('aria-valuetext', 'Boston, England, United Kingdom'));
    });
    const result = await selectSmartDropdown(f.input, 'Boston', 'location', undefined, 100,
      { stateName: 'MA', countryName: 'United States' });
    assert.equal(result.outcome, 'no_match');
  } finally { f.dom.window.close(); }
});

test('search text without a committed selection is not a success', async () => {
  const f = fixture();
  try {
    f.input.addEventListener('input', () => {
      if (f.input.value !== 'Boston') return;
      const choice = f.option('Boston');
      choice.addEventListener('click', () => { f.input.value = 'Boston'; });
    });
    assert.equal((await selectSmartDropdown(f.input, 'Boston', 'location', undefined, 80)).outcome, 'no_match');
  } finally { f.dom.window.close(); }
});

test('async search can recover a uniquely replaced control and verify its selected token', async () => {
  const f = fixture();
  try {
    f.input.addEventListener('input', () => {
      if (f.input.value !== 'Boston') return;
      f.dom.window.setTimeout(() => {
        const replacement = f.input.cloneNode(true) as HTMLInputElement;
        replacement.value = 'Boston';
        f.input.replaceWith(replacement);
        const choice = f.option('Boston, MA, United States');
        choice.setAttribute('data-value', 'city-123');
        choice.addEventListener('click', () => {
          replacement.value = '';
          replacement.setAttribute('data-value', 'city-123');
        });
      }, 10);
    });
    const result = await selectSmartDropdown(f.input, 'Boston', 'location', undefined, 150,
      { stateName: 'MA', countryName: 'United States' });
    assert.equal(result.outcome, 'selected');
    assert.equal((f.doc.querySelector('#city') as HTMLInputElement).getAttribute('data-value'), 'city-123');
  } finally { f.dom.window.close(); }
});

test('navigation cancellation stops an async search before option click', async () => {
  const f = fixture();
  try {
    let current = true;
    let clicks = 0;
    f.input.addEventListener('input', () => {
      current = false;
      f.dom.window.setTimeout(() => {
        const choice = f.option('Boston');
        choice.addEventListener('click', () => { clicks++; });
      }, 10);
    });
    assert.notEqual((await selectSmartDropdown(f.input, 'Boston', 'location', undefined, 100,
      { shouldContinue: () => current })).outcome, 'selected');
    assert.equal(clicks, 0);
  } finally { f.dom.window.close(); }
});
