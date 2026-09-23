import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const localRequire = createRequire(resolve('package.json'));
const { buildSync } = localRequire('esbuild');
const { JSDOM } = localRequire('jsdom');
const codeCache = new Map<string, string>();

function harness(page: string, extra = '', options: { failSave?: boolean; holdSave?: boolean } = {}) {
  const key = page + extra;
  if (!codeCache.has(key)) codeCache.set(key, buildSync({
    stdin: { contents: readFileSync(`src/pages/${page}.ts`, 'utf8') + '\n' + extra,
      resolveDir: dirname(resolve(`src/pages/${page}.ts`)), loader: 'ts' },
    bundle: true, write: false, platform: 'node', format: 'cjs',
  }).outputFiles[0].text);
  const dom = new JSDOM('<body><div id="root"></div></body>');
  const timers: Array<() => void> = [];
  const posts: any[] = [];
  const storage: Record<string, any> = {};
  const stemDates = { opt_ead_end_date: null, stem_dso_recommendation_date: null };
  const alerts: string[] = [];
  let releaseSave: () => void = () => {};
  const saveGate = new Promise<void>(resolve => { releaseSave = resolve; });
  const module = { exports: {} as any };
  const store = {
    get: async (key: string) => ({ [key]: storage[key] }),
    set: async (values: any) => Object.assign(storage, values),
    remove: async (keys: string[]) => { for (const key of keys) delete storage[key]; },
    clear: async () => {},
  };
  const context = {
    module, exports: module.exports, process: { env: {} }, console,
    document: dom.window.document, window: dom.window,
    chrome: { storage: { local: store, sync: store, session: store }, runtime: { getURL: (s: string) => s } },
    fetch: async (_url: string, options: any = {}) => {
      if (options.method === 'POST') posts.push(JSON.parse(options.body));
      if (options.method === 'POST' && networkOptions.holdSave) await saveGate;
      if (page === 'stem-apply' && _url.endsWith('/api/opt/calculator')) {
        if (options.method === 'GET') return { ok: true, json: async () => ({ ok: true, data: { ...stemDates } }) };
        if (!networkOptions.failSave) Object.assign(stemDates, JSON.parse(options.body));
      }
      return { ok: options.method !== 'GET' && !networkOptions.failSave,
        json: async () => ({ ok: !networkOptions.failSave, data: {} }) };
    },
    alert: (message: string) => alerts.push(message),
    setTimeout: (fn: () => void) => timers.push(fn), clearTimeout: () => {},
    clearInterval: () => {},
  };
  const networkOptions = options;
  dom.window.setInterval = () => 1;
  vm.runInNewContext(codeCache.get(key)!, context);
  const root = dom.window.document.getElementById('root')!;
  return { api: module.exports, dom, root, posts, storage, timers, alerts, releaseSave };
}

async function settle() { for (let i = 0; i < 5; i++) await new Promise(setImmediate); }

test('sign-out removes saved calculator dates including the browser-only STEM recommendation', async () => {
  const h = harness('../signOut');
  h.storage['stem-countdown_data'] = { results: { dsoRecommendationDate: '2026-06-25' } };
  h.storage['opt-countdown_data'] = { results: {} };
  h.storage['clock-tracker_data'] = { startDate: '2026-06-25' };
  h.storage['stem-clock-tracker_data'] = { startDate: '2026-06-25' };
  h.storage.theme = 'dark';
  await h.api.clearExtensionAuthStorage();
  assert.equal(Object.keys(h.storage).filter(key => key.endsWith('_data')).length, 0);
  assert.equal(h.storage.theme, 'dark');
  h.dom.window.close();
});

const pages = [
  ['opt-apply', 'renderOptApply', 'program-end-date', 'program_end_date', 'OPT Apply Dates'],
  ['clock', 'renderClock', 'opt-start-date', 'opt_start_date', 'OPT Clock Tracker'],
  ['stem-apply', 'renderStemApply', 'current-opt-end-date', 'opt_ead_end_date', 'STEM OPT Dates'],
  ['stem-clock', 'renderStemClock', 'stem-ead-start-date', 'stem_start_date', 'STEM OPT Clock Tracker'],
];

for (const [page, render, inputId, ownedField, heading] of pages) {
  for (const scenario of ['failed', 'leave-during-save']) {
    test(`${page}: ${scenario} never opens a misleading/stale results page`, async () => {
      const h = harness(page, '', { failSave: scenario === 'failed', holdSave: scenario !== 'failed' });
      h.api[render](h.root, () => {});
      await settle();
      (h.root.querySelector(`#${inputId}`) as HTMLInputElement).value = '09/21/2026';
      const submit = [...h.root.querySelectorAll('button')].find((b: any) => /Calculate|Save & Go/.test(b.textContent)) as HTMLButtonElement;
      submit.click();
      if (scenario === 'leave-during-save') {
        h.root.innerHTML = 'Home';
        h.releaseSave();
      }
      await settle();
      if (scenario === 'failed') {
        assert.equal(submit.disabled, false);
        assert.ok(h.root.querySelector(`#${inputId}`));
      } else assert.equal(h.root.textContent, 'Home');
      h.dom.window.close();
    });
  }
  test(`${page}: typing dates one character at a time preserves digits and caret`, async () => {
    const h = harness(page);
    h.api[render](h.root, () => {});
    await settle();
    const input = h.root.querySelector(`#${inputId}`) as HTMLInputElement;
    assert.ok(input, inputId);
    for (const character of '02292024') {
      const position = input.selectionStart!;
      input.setRangeText(character, position, input.selectionEnd!, 'end');
      input.dispatchEvent(new h.dom.window.Event('input'));
    }
    assert.equal(input.value, '02/29/2024');
    assert.equal(input.selectionStart, 10);
    h.dom.window.close();
  });

  test(`${page}: save ${page === 'stem-apply' ? 'after loading server dates' : 'after failed GET'} posts only tool-owned dates; Modify edits the same tool`, async () => {
    const h = harness(page);
    let homeVisits = 0;
    h.api[render](h.root, () => { homeVisits++; h.root.innerHTML = 'Home'; });
    await settle();
    const input = h.root.querySelector(`#${inputId}`) as HTMLInputElement;
    assert.ok(input, inputId);
    input.value = '09/21/2026';
    const calculate = [...h.root.querySelectorAll('button')].find((b: any) => /Calculate|Save & Go/.test(b.textContent)) as HTMLButtonElement;
    assert.ok(calculate);
    calculate.click();
    await settle();
    assert.ok(h.posts.length > 0);
    const allowed = [ownedField, '_lastModifiedField', ...(page === 'opt-apply' ? ['dso_recommendation_date'] : []), ...(page === 'stem-apply' ? ['stem_dso_recommendation_date'] : [])];
    assert.deepEqual(Object.keys(h.posts.at(-1)).filter(k => !allowed.includes(k)), []);
    const modify = [...h.root.querySelectorAll('button')].find((b: any) => /Modify/.test(b.textContent)) as HTMLButtonElement;
    assert.ok(modify);
    modify.click();
    await settle();
    assert.equal(homeVisits, 0);
    assert.match(h.root.textContent!, new RegExp(heading));
    h.dom.window.close();
  });
}

test('OPT delayed autosave is harmless after leaving the page and rejects partial DSO dates', async () => {
  const h = harness('opt-apply');
  h.api.renderOptApply(h.root, () => {});
  await settle();
  const input = h.root.querySelector('#program-end-date') as HTMLInputElement;
  input.value = '05/15/2026';
  (h.root.querySelector('#dso-recommendation-date') as HTMLInputElement).value = '04/';
  input.dispatchEvent(new h.dom.window.Event('blur'));
  for (const timer of h.timers.splice(0)) timer();
  await settle();
  assert.equal(h.posts.length, 0);
  input.dispatchEvent(new h.dom.window.Event('blur'));
  h.root.innerHTML = 'Home';
  assert.doesNotThrow(() => { for (const timer of h.timers) timer(); });
  h.dom.window.close();
});

test('STEM filing window is capped at DSO recommendation +60 days', () => {
  const h = harness('opt-apply-date-helpers');
  const result = h.api.calculateStemFilingWindow(new Date(2026, 8, 21), new Date(2026, 5, 25));
  assert.equal(h.api.formatDate(result.filingDeadline), '08/24/2026');
});

test('STEM recommendation appears in the form, controls the displayed deadline, and survives Modify', async () => {
  const h = harness('stem-apply');
  h.api.renderStemApply(h.root, () => {});
  await settle();
  (h.root.querySelector('#current-opt-end-date') as HTMLInputElement).value = '09/21/2026';
  const dso = h.root.querySelector('#stem-dso-recommendation-date') as HTMLInputElement;
  assert.ok(dso);
  dso.value = '06/25/2026';
  const submit = [...h.root.querySelectorAll('button')].find((b: any) => /Calculate/.test(b.textContent)) as HTMLButtonElement;
  submit.click();
  await settle();
  const result = h.storage['stem-countdown_data'].results;
  assert.equal(new Date(result.filingDeadline).getDate(), 24);
  assert.equal(new Date(result.filingDeadline).getMonth(), 7);
  assert.equal(Object.hasOwn(h.posts.at(-1), 'dso_recommendation_date'), false);
  (h.root.querySelector('#modify-dates-btn') as HTMLButtonElement).click();
  await settle();
  assert.equal((h.root.querySelector('#stem-dso-recommendation-date') as HTMLInputElement).value, '06/25/2026');
  h.dom.window.close();
});

test('filing boundaries cover missing/late DSO, leap years, opening day, expiry, and non-overlapping windows', () => {
  const h = harness('opt-apply-date-helpers');
  const a = h.api;
  const end = new Date(2024, 2, 1);
  for (const dso of [null, new Date(2024, 1, 15)]) {
    assert.equal(a.formatDate(a.calculateStemFilingWindow(end, dso).filingDeadline), '03/01/2024');
  }
  assert.equal(a.formatDate(a.calculateStemFilingWindow(end, new Date(2023, 11, 31)).filingDeadline), '02/29/2024');
  assert.match(a.filingWindowMessage(new Date(2026, 0, 1), end), /No valid/);
  assert.match(a.filingWindowMessage(end, end, new Date(2024, 1, 29, 12)), /not opened/);
  assert.match(a.filingWindowMessage(end, end, new Date(2024, 2, 1, 12)), /approaching/);
  assert.match(a.filingWindowMessage(end, end, new Date(2024, 2, 2)), /expired/);
  assert.equal(a.calculateTimeRemaining(end, new Date(2024, 2, 1, 12)).total, 43199999);
  assert.equal(a.calculateTimeRemaining(end, new Date(2024, 2, 2)).total, 0);
  h.dom.window.close();
});

for (const kind of ['opt', 'stem']) {
  test(`${kind}: deadline day remains active; expired windows do not urge filing`, async () => {
    const h = harness(`${kind}-countdown`, 'export { calculateTimeRemaining };');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    assert.ok(h.api.calculateTimeRemaining(today).total > 0);
    const results = {
      earliestStart: new Date(2020, 0, 1), latestEnd: new Date(2020, 4, 1),
      filingDeadline: new Date(2020, 4, 1), programEndDate: new Date(2020, 2, 2),
      currentOptEndDate: new Date(2020, 4, 1), uscisDeadline: null, dsoRecommendationDate: null,
    };
    await h.api[kind === 'opt' ? 'renderOptCountdown' : 'renderStemCountdown'](h.root, () => {}, results);
    assert.match(h.root.querySelector('#time-message')!.textContent!, /expired/i);
    assert.doesNotMatch(h.root.textContent!, /Apply immediately/);
    h.dom.window.close();
  });
}
