import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const localRequire = createRequire(resolve('package.json'));
const { JSDOM } = localRequire('jsdom');
const code = localRequire('esbuild').buildSync({
  entryPoints: ['src/pages/stem-apply.ts'], bundle: true, write: false,
  platform: 'node', format: 'cjs',
}).outputFiles[0].text;
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(setImmediate); };
function gate() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

function harness(options: { token?: string | null; loadGate?: ReturnType<typeof gate>; saveGate?: ReturnType<typeof gate>; premiumGate?: ReturnType<typeof gate> } = {}) {
  const dom = new JSDOM('<div id="root"></div>');
  const root = dom.window.document.getElementById('root')!;
  const state = {
    dates: { opt_ead_end_date: '12/31/2026', stem_dso_recommendation_date: '10/01/2026', dso_recommendation_date: '01/01/2025' } as Record<string, string | null>,
    failLoad: false, failSave: false, malformedLoad: false, throwLoad: false, throwSave: false,
    failReminder: false, email: 'student@example.com',
  };
  const calls: Array<{ url: string; method: string; credentials?: string; headers: any; body?: any }> = [];
  const alerts: string[] = [];
  const notifications: any[] = [];
  const storage: Record<string, any> = {
    idToken: options.token === undefined ? 'extension-user' : options.token,
    'stem-countdown_data': { results: { dsoRecommendationDate: '2025-01-01T00:00:00.000Z' } },
  };
  const store = { get: async (key: string) => ({ [key]: storage[key] }), set: async (data: any) => Object.assign(storage, data) };
  const module = { exports: {} as any };
  dom.window.setInterval = () => 1;
  vm.runInNewContext(code, {
    module, exports: module.exports, document: dom.window.document, window: dom.window,
    process: { env: {} }, console, clearInterval: () => {}, setTimeout: () => {},
    alert: (message: string) => alerts.push(message), confirm: () => true,
    chrome: { storage: { local: store, sync: store }, runtime: { getURL: (s: string) => s },
      notifications: { create: (value: any) => notifications.push(value) } },
    fetch: async (url: string, init: any = {}) => {
      const call = { url, ...init, body: init.body ? JSON.parse(init.body) : undefined };
      calls.push(call);
      if (url.endsWith('/api/opt/calculator')) {
        if (init.method === 'GET') {
          await options.loadGate?.promise;
          if (state.throwLoad) throw new Error('offline');
          return { ok: !state.failLoad, json: async () => state.malformedLoad ? { ok: false } : { ok: true, data: { ...state.dates } } };
        }
        await options.saveGate?.promise;
        if (state.throwSave) throw new Error('offline');
        if (!state.failSave) Object.assign(state.dates, call.body);
        return { ok: !state.failSave, json: async () => ({ ok: true }) };
      }
      if (url.endsWith('/api/premium/status')) {
        await options.premiumGate?.promise;
        return { ok: true, json: async () => ({ isPremium: true }) };
      }
      return { ok: !state.failReminder, json: async () => ({ email: state.email, ok: !state.failReminder }) };
    },
  });
  const render = () => module.exports.renderStemApply(root, () => { root.innerHTML = 'Home'; });
  const input = (field: 'ead' | 'dso') => root.querySelector(field === 'ead' ? '#current-opt-end-date' : '#stem-dso-recommendation-date') as HTMLInputElement;
  const edit = (field: 'ead' | 'dso', value: string) => {
    input(field).value = value;
    input(field).dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  };
  const calculate = () => (root.querySelector('.tool-button-primary') as HTMLButtonElement).click();
  const posts = () => calls.filter(c => c.url.endsWith('/api/opt/calculator') && c.method === 'POST');
  render();
  return { dom, root, state, calls, alerts, notifications, storage, render, input, edit, calculate, posts };
}

test('STEM loads server dates over stale local countdown and initial OPT recommendation', async t => {
  const h = harness(); t.after(() => h.dom.window.close()); await settle();
  assert.equal(h.input('dso').value, '10/01/2026');
  assert.equal(h.input('ead').value, '12/31/2026');
  assert.doesNotMatch(h.root.textContent!, /Saved in this browser only|reminders do not use this date/);
  h.state.dates.stem_dso_recommendation_date = null;
  h.render(); await settle();
  assert.equal(h.input('dso').value, '');
});

test('STEM saves, edits, clears with null, and reloads the API value', async t => {
  const h = harness(); t.after(() => h.dom.window.close()); await settle();
  for (const value of ['10/02/2026', '10/03/2026', '']) {
    h.edit('dso', value); h.calculate(); await settle();
    assert.deepEqual(h.posts().at(-1)!.body, {
      opt_ead_end_date: '12/31/2026', stem_dso_recommendation_date: value || null,
    });
    assert.equal(h.state.dates.dso_recommendation_date, '01/01/2025');
    assert.equal(h.storage['stem-countdown_data'].results.dsoRecommendationDate === null, !value);
    assert.doesNotMatch(h.root.textContent!, /Saved in this browser only|reminders do not use this date/);
    (h.root.querySelector('#modify-dates-btn') as HTMLButtonElement).click(); await settle();
    assert.equal(h.input('dso').value, value);
  }
});

test('STEM edits and explicit clears during load are never overwritten', async t => {
  const loadGate = gate(); const h = harness({ loadGate }); t.after(() => h.dom.window.close());
  h.edit('ead', '11/30/2026'); h.edit('dso', '10/20/2026'); h.edit('dso', '');
  h.calculate(); await settle(); assert.equal(h.posts().length, 0);
  loadGate.release(); await settle();
  assert.equal(h.input('ead').value, '11/30/2026'); assert.equal(h.input('dso').value, '');
  h.calculate(); await settle(); assert.equal(h.posts()[0].body.stem_dso_recommendation_date, null);
});

test('STEM calendar selection made during load is preserved', async t => {
  const loadGate = gate(); const h = harness({ loadGate }); t.after(() => h.dom.window.close());
  (h.root.querySelector('#stem-dso-date-picker-btn') as HTMLButtonElement).click();
  const today = h.root.querySelector('[aria-label="Use today\'s date"]') as HTMLButtonElement;
  today.click();
  const selected = h.input('dso').value;
  assert.match(selected, /^\d{2}\/\d{2}\/\d{4}$/);
  loadGate.release(); await settle(); assert.equal(h.input('dso').value, selected);
});

test('STEM calendar clear during load is an explicit edit and persists null', async t => {
  const loadGate = gate(); const h = harness({ loadGate }); t.after(() => h.dom.window.close());
  (h.root.querySelector('#stem-dso-date-picker-btn') as HTMLButtonElement).click();
  (h.root.querySelector('[aria-label="Next month"]') as HTMLButtonElement).click();
  (h.root.querySelector('[aria-label="Clear date"]') as HTMLButtonElement).click();
  loadGate.release(); await settle();
  assert.equal(h.input('dso').value, '');
  h.calculate(); await settle(); assert.equal(h.posts()[0].body.stem_dso_recommendation_date, null);
});

for (const failure of ['failLoad', 'malformedLoad', 'throwLoad'] as const) {
  test(`STEM ${failure} preserves saved dates and drafts until a successful retry`, async t => {
    const loadGate = gate(); const h = harness({ loadGate }); t.after(() => h.dom.window.close());
    h.state[failure] = true; h.edit('ead', '11/30/2026'); loadGate.release(); await settle();
    h.calculate(); await settle();
    assert.equal(h.posts().length, 0); assert.equal(h.state.dates.stem_dso_recommendation_date, '10/01/2026');
    assert.match(h.root.textContent!, /could not load/i);
    h.state[failure] = false;
    const retry = [...h.root.querySelectorAll('button')].find(b => /retry/i.test(b.textContent!));
    assert.ok(retry); (retry as HTMLButtonElement).click(); await settle();
    assert.equal(h.input('ead').value, '11/30/2026'); assert.equal(h.input('dso').value, '10/01/2026');
    h.calculate(); await settle(); assert.equal(h.posts().length, 1);
  });
}

for (const failure of ['failSave', 'throwSave'] as const) {
  test(`STEM ${failure} retains edits, stays on form, and supports retry`, async t => {
    const h = harness(); t.after(() => h.dom.window.close()); await settle();
    h.state[failure] = true; h.edit('dso', '10/04/2026'); h.calculate(); await settle();
    assert.equal(h.input('dso').value, '10/04/2026');
    assert.equal(h.root.querySelector('#modify-dates-btn'), null);
    assert.equal(h.posts().length, 1);
    h.state[failure] = false; h.calculate(); await settle();
    assert.ok(h.root.querySelector('#modify-dates-btn'));
  });
}

test('STEM blur and repeated clicks issue one save and countdown waits for success', async t => {
  const saveGate = gate(); const h = harness({ saveGate }); t.after(() => h.dom.window.close()); await settle();
  h.edit('dso', '10/05/2026');
  h.input('ead').dispatchEvent(new h.dom.window.Event('blur'));
  h.input('dso').dispatchEvent(new h.dom.window.Event('blur'));
  h.calculate(); h.calculate(); await settle();
  assert.equal(h.posts().length, 1); assert.equal(h.root.querySelector('#modify-dates-btn'), null);
  saveGate.release(); await settle(); assert.ok(h.root.querySelector('#modify-dates-btn'));
});

test('STEM edits during save stay editable and require saving the new revision', async t => {
  const saveGate = gate(); const h = harness({ saveGate }); t.after(() => h.dom.window.close()); await settle();
  h.calculate(); await settle(); h.edit('dso', '10/06/2026'); saveGate.release(); await settle();
  assert.equal(h.input('dso').value, '10/06/2026'); assert.equal(h.root.querySelector('#modify-dates-btn'), null);
  h.calculate(); await settle(); assert.equal(h.state.dates.stem_dso_recommendation_date, '10/06/2026');
});

test('STEM rejects invalid dates without saving', async t => {
  const h = harness(); t.after(() => h.dom.window.close()); await settle();
  h.edit('dso', '02/30/2026'); h.calculate(); await settle();
  assert.equal(h.posts().length, 0); assert.ok(h.alerts.length);
});

test('STEM late load and save never resurrect a page after leaving', async t => {
  const loadGate = gate(); const h = harness({ loadGate }); t.after(() => h.dom.window.close());
  h.root.innerHTML = 'Home'; loadGate.release(); await settle(); assert.equal(h.root.textContent, 'Home');
  const saveGate = gate(); const s = harness({ saveGate }); t.after(() => s.dom.window.close()); await settle();
  s.calculate(); await settle(); s.root.innerHTML = 'Home'; saveGate.release(); await settle();
  assert.equal(s.root.textContent, 'Home');
});

test('STEM countdown back works during pending premium load and late rendering cannot replace the form', async t => {
  const premiumGate = gate(); const h = harness({ premiumGate }); t.after(() => h.dom.window.close()); await settle();
  h.calculate(); await settle();
  assert.match(h.root.textContent!, /STEM OPT Filing Window/);
  (h.root.querySelector('#back-btn') as HTMLButtonElement).click(); await settle();
  assert.ok(h.input('dso'));
  premiumGate.release(); await settle();
  assert.ok(h.input('dso')); assert.equal(h.root.querySelector('#countdown-container'), null);
});

for (const token of ['extension-user', null]) {
  test(`STEM calculator and reminders use only ${token ? 'bearer' : 'cookie'} identity`, async t => {
    const h = harness({ token }); t.after(() => h.dom.window.close()); await settle();
    h.calculate(); await settle();
    (h.root.querySelector('#save-email-btn') as HTMLButtonElement).click(); await settle();
    assert.ok(h.calls.some(c => c.url.endsWith('/api/user/tool-email') && c.method === 'POST'));
    for (const call of h.calls) {
      assert.equal(call.headers.Authorization, token ? `Bearer ${token}` : undefined);
      assert.equal(call.credentials, token ? 'omit' : 'include');
    }
  });
}

test('STEM failed bearer GET never falls back to website cookies', async t => {
  const loadGate = gate(); const h = harness({ loadGate }); t.after(() => h.dom.window.close());
  h.state.failLoad = true; loadGate.release(); await settle();
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].headers.Authorization, 'Bearer extension-user');
});

test('STEM failed reminder stop is reported without claiming reminders stopped', async t => {
  const h = harness(); t.after(() => h.dom.window.close()); await settle(); h.calculate(); await settle();
  h.state.failReminder = true;
  (h.root.querySelector('#stop-reminders-btn') as HTMLButtonElement).click(); await settle();
  assert.equal(h.calls.filter(c => c.url.endsWith('/api/user/tool-email') && c.method === 'POST').length, 1);
  assert.equal(h.notifications.at(-1)?.title, 'Error');
});
