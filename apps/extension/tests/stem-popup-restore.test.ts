import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const localRequire = createRequire(resolve('package.json'));
const { JSDOM } = localRequire('jsdom');
const code = localRequire('esbuild').buildSync({
  stdin: { contents: readFileSync('src/popup.ts', 'utf8') + '\nexport { navigateToPage };', resolveDir: resolve('src'), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs',
}).outputFiles[0].text;
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(setImmediate); };

function harness(dso: string | null, failLoad = false) {
  const dom = new JSDOM('<div id="root"></div>');
  const root = dom.window.document.getElementById('root')!;
  // Exercise the real restore navigation without starting the separate sign-in workflow.
  const addListener = dom.window.document.addEventListener.bind(dom.window.document);
  dom.window.document.addEventListener = (type: string, ...args: any[]) => {
    if (type !== 'DOMContentLoaded') addListener(type, ...args);
  };
  dom.window.setInterval = () => 1;
  const storage: Record<string, any> = { idToken: 'extension-user' };
  const calls: any[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const data = { opt_ead_end_date: '12/31/2026' as string | null, stem_dso_recommendation_date: dso };
  const store = { get: async (key: string) => ({ [key]: storage[key] }), set: async (values: any) => Object.assign(storage, values) };
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module, exports: module.exports, document: dom.window.document, window: dom.window,
    process: { env: {} }, console, clearInterval: () => {}, setTimeout: () => {},
    chrome: { storage: { local: store, sync: store, onChanged: { addListener: () => {} } }, runtime: { getURL: (s: string) => s } },
    fetch: async (url: string, init: any) => {
      calls.push({ url, ...init });
      if (url.endsWith('/api/opt/calculator')) {
        await gate;
        return { ok: !failLoad, json: async () => ({ ok: !failLoad, data }) };
      }
      return { ok: true, json: async () => ({ isPremium: false, email: null }) };
    },
  });
  const cached = { results: {
    currentOptEndDate: '2025-12-31T12:00:00Z', earliestStart: '2025-10-02T12:00:00Z', latestEnd: '2025-12-31T12:00:00Z',
    dsoRecommendationDate: '2025-10-01T12:00:00Z', uscisDeadline: '2025-11-30T12:00:00Z', filingDeadline: '2025-11-30T12:00:00Z',
  } };
  return { dom, root, storage, calls, release, data, restore: () => module.exports.navigateToPage('stem-countdown', cached) };
}

for (const dso of ['10/15/2026', null]) {
  test(`popup STEM restore recomputes server ${dso ? 'edit' : 'clear'} without saving stale cached dates`, async t => {
    const h = harness(dso); t.after(() => h.dom.window.close());
    await h.restore(); await settle();
    assert.equal(h.root.querySelector('#countdown-container'), null);
    h.release(); await settle();
    assert.ok(h.root.querySelector('#countdown-container'));
    const results = h.storage['stem-countdown_data'].results;
    assert.equal(new Date(results.currentOptEndDate).getFullYear(), 2026);
    assert.equal(results.dsoRecommendationDate === null, dso === null);
    const deadline = new Date(results.filingDeadline);
    assert.equal(deadline.getMonth(), 11); assert.equal(deadline.getDate(), dso ? 14 : 31);
    assert.equal(h.calls.filter(c => c.method === 'POST').length, 0);
    for (const call of h.calls) assert.equal(call.headers.Authorization, 'Bearer extension-user');
  });
}

test('popup STEM restore failure shows load error and no cached countdown', async t => {
  const h = harness(null, true); t.after(() => h.dom.window.close());
  await h.restore(); h.release(); await settle();
  assert.equal(h.root.querySelector('#countdown-container'), null);
  assert.match(h.root.textContent!, /could not load/i);
  assert.ok(h.root.querySelector('#stem-dso-recommendation-date'));
  assert.equal(h.calls.filter(c => c.method === 'POST').length, 0);
});

test('popup STEM restore with cleared EAD date stays on the form', async t => {
  const h = harness(null); t.after(() => h.dom.window.close()); h.data.opt_ead_end_date = null;
  await h.restore(); h.release(); await settle();
  assert.ok(h.root.querySelector('#current-opt-end-date'));
  assert.equal(h.root.querySelector('#countdown-container'), null);
});

test('popup STEM restore cannot navigate after leaving or overwrite edits made while loading', async t => {
  const h = harness('10/15/2026'); t.after(() => h.dom.window.close());
  await h.restore(); h.root.innerHTML = 'Home'; h.release(); await settle();
  assert.equal(h.root.textContent, 'Home');
  const e = harness('10/15/2026'); t.after(() => e.dom.window.close()); await e.restore();
  const input = e.root.querySelector('#stem-dso-recommendation-date') as HTMLInputElement;
  assert.ok(input); input.value = '10/16/2026'; input.dispatchEvent(new e.dom.window.Event('input'));
  e.release(); await settle();
  assert.equal(input.value, '10/16/2026'); assert.ok(e.root.contains(input));
  assert.equal(e.root.querySelector('#countdown-container'), null);
});
