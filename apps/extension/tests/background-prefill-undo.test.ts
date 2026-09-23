import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const local = createRequire(resolve('package.json'));
const code = local('esbuild').buildSync({
  entryPoints: ['src/background-prefill-undo.ts'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
function harness() {
  const calls: any[] = [];
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    chrome: {
      scripting: {
        executeScript: async (args: any) => {
          calls.push(args);
          return [
            { result: { restored: 2, skipped: 1, unsupported: 0 } },
            { result: { restored: 1, skipped: 0, unsupported: 1 } },
          ];
        },
      },
    },
  });
  return { calls, undo: module.exports.undoPrefillInTab };
}
test('undo is sender-tab bound, isolated and aggregates all frames without field data', async () => {
  const h = harness();
  const r = await h.undo({ tab: { id: 42 }, frameId: 0 }, 'run-1');
  assert.equal(r.result.restored, 3);
  assert.equal(r.result.skipped, 1);
  assert.equal(r.result.unsupported, 1);
  assert.equal(h.calls[0].target.tabId, 42);
  assert.equal(h.calls[0].target.allFrames, true);
  assert.equal(h.calls[0].world, 'ISOLATED');
  assert.equal(JSON.stringify(h.calls[0].args), '["run-1"]');
});
test('children, absent tabs and malformed run IDs cannot request undo', async () => {
  const h = harness();
  for (const [sender, id] of [
    [{ tab: { id: 42 }, frameId: 1 }, 'run'],
    [{}, 'run'],
    [{ tab: { id: 42 }, frameId: 0 }, {}],
    [{ tab: { id: 42 }, frameId: 0 }, '<script>'],
  ]) {
    assert.equal((await h.undo(sender, id)).ok, false);
  }
  assert.equal(h.calls.length, 0);
});
