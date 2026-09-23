import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const localRequire = createRequire(resolve('package.json'));
const code = localRequire('esbuild').buildSync({
  entryPoints: ['src/pages/stem-apply-api.ts'], bundle: true, write: false,
  platform: 'node', format: 'cjs',
}).outputFiles[0].text;

function harness(response: any, tokenError = false) {
  const calls: any[] = [];
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env: {} },
    chrome: { storage: { local: { get: async () => {
      if (tokenError) throw new Error('storage unavailable');
      return { idToken: 'extension-user' };
    } } } },
    fetch: async (url: string, init: any) => { calls.push({ url, ...init }); return response; },
  });
  return { api: module.exports, calls };
}

for (const data of [undefined, {}, { opt_ead_end_date: null },
  { opt_ead_end_date: '02/30/2026', stem_dso_recommendation_date: null },
  { opt_ead_end_date: null, stem_dso_recommendation_date: 'invalid' }]) {
  test(`STEM API rejects incomplete/invalid data ${JSON.stringify(data)}`, async () => {
    const h = harness({ ok: true, json: async () => ({ ok: true, data }) });
    assert.equal(await h.api.loadStemDates(), null);
  });
}

test('STEM API treats explicit nulls as a successful empty record', async () => {
  const data = { opt_ead_end_date: null, stem_dso_recommendation_date: null };
  const h = harness({ ok: true, json: async () => ({ ok: true, data }) });
  assert.deepEqual(JSON.parse(JSON.stringify(await h.api.loadStemDates())), data);
});

test('STEM API treats ok true data null as a successful empty calculator', async () => {
  const h = harness({ ok: true, json: async () => ({ ok: true, data: null }) });
  assert.deepEqual(JSON.parse(JSON.stringify(await h.api.loadStemDates())), {
    opt_ead_end_date: null, stem_dso_recommendation_date: null,
  });
});

for (const response of [
  { ok: true, json: async () => ({ ok: false }) },
  { ok: false, json: async () => ({ ok: true }) },
  { ok: true, json: async () => { throw new Error('invalid JSON'); } },
]) {
  test('STEM API reports failed saves without retrying as a website user', async () => {
    const h = harness(response);
    assert.equal(await h.api.saveStemDates({ opt_ead_end_date: '12/31/2026', stem_dso_recommendation_date: null }), false);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].credentials, 'omit');
  });
}

test('STEM token lookup failure never issues a cookie request', async () => {
  const h = harness({}, true);
  assert.equal(await h.api.loadStemDates(), null);
  assert.equal(await h.api.saveStemDates({ opt_ead_end_date: null, stem_dso_recommendation_date: null }), false);
  assert.equal(h.calls.length, 0);
});
