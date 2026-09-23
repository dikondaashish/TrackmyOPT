import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal = createRequire(resolve('package.json'));
const code = requireLocal('esbuild').buildSync({ entryPoints: ['src/prefill-mode-guard.ts'], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
function harness(mode: string) {
  const listeners = new Set<(changes: any, area: string) => void>();
  const window = { location: { href: 'https://ats.example.test/apply' }, addEventListener() {}, removeEventListener() {} };
  const module = { exports: {} as any };
  vm.runInNewContext(code, { module, exports: module.exports, window, chrome: { storage: {
    sync: { get: async () => ({ autofillPreferencesV1: { mode } }) },
    onChanged: { addListener: (fn: any) => listeners.add(fn), removeListener: (fn: any) => listeners.delete(fn) },
  } } });
  return { run: module.exports.withPrefillModeGuard, listeners, window };
}
test('a late Continuous frame message is ignored after Step-by-step was saved', async () => {
  const h = harness('step_by_step'); let calls = 0;
  await h.run(true, async () => { calls++; });
  assert.equal(calls, 0); assert.equal(h.listeners.size, 0);
});
test('Continuous frame guard stops in-progress work on a preference change', async () => {
  const h = harness('continuous');
  await h.run(true, async (allowed: () => boolean) => {
    assert.equal(allowed(), true);
    h.listeners.forEach(fn => fn({ autofillPreferencesV1: { newValue: { mode: 'step_by_step' } } }, 'sync'));
    assert.equal(allowed(), false);
  });
  assert.equal(h.listeners.size, 0);
});
test('manual frame fill works in Step-by-step but stops on page navigation', async () => {
  const h = harness('step_by_step');
  await h.run(false, async (allowed: () => boolean) => {
    assert.equal(allowed(), true); h.window.location.href += '/next'; assert.equal(allowed(), false);
  });
});
