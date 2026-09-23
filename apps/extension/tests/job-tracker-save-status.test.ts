import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const localRequire = createRequire(resolve('package.json'));
const { buildSync } = localRequire('esbuild');
// Replacing only the credential provider keeps every request/response branch real.
const code = buildSync({
  stdin: { contents: localRequire('node:fs').readFileSync('src/background-job-tracker.ts', 'utf8').replace("import { getExtensionBearerToken } from './background-auth';", "async function getExtensionBearerToken() { return 'mock-token'; }"), resolveDir: resolve('src'), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs',
}).outputFiles[0].text;
function harness(responses: unknown[]) {
  const module = { exports: {} as any };
  const notifications: any[] = [];
  vm.runInNewContext(code, { module, exports: module.exports, URL, process: { env: {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => responses.shift() }),
    chrome: { runtime: { getURL: (v: string) => v }, notifications: { create: (v: unknown) => notifications.push(v) } },
  });
  return { save: module.exports.handleAddJobToTracker, notifications };
}
const job = { company_name: 'Acme', role_title: 'Engineer', job_url: 'https://example.test/jobs/1' };
test('save returns persisted status rather than the requested status', async () => {
  const h = harness([{ ok: true, already_saved: true, id: 'job', status: 'Interviewing' }]);
  assert.equal((await h.save(job, false, 'Wishlist')).status, 'Interviewing');
  assert.match(h.notifications[0].message, /Interviewing/);
});
test('legacy duplicate response rechecks real Wishlist status', async () => {
  const h = harness([{ ok: true, already_saved: true }, { saved: true, status: 'Wishlist' }]);
  assert.equal((await h.save(job, true)).status, 'Wishlist');
  assert.doesNotMatch(h.notifications[0].message, /auto-added/);
});
test('unconfirmed legacy duplicate is not reported as a successful application', async () => {
  const h = harness([{ ok: true, already_saved: true }, { saved: false }]);
  await assert.rejects(h.save(job, true), /confirm its status/);
  assert.equal(h.notifications.length, 0);
});
