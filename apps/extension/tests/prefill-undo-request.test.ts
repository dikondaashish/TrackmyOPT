import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const local = createRequire(resolve('package.json'));
const code = local('esbuild').buildSync({
  entryPoints: ['src/prefill-undo-request.ts'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
test('undo pauses automation before messaging and transmits no field values', async () => {
  const calls: any[] = [];
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    chrome: {
      storage: {
        sync: {
          get: async (key: string) => ({
            [key]: {
              mode: 'continuous',
              guidedAutopilot: true,
              autofillSkills: true,
            },
          }),
          set: async (value: any) => calls.push(value),
        },
      },
      runtime: {
        sendMessage: async (message: any) => {
          calls.push(message);
          return {
            ok: true,
            result: { restored: 2, skipped: 1, unsupported: 0 },
          };
        },
      },
    },
  });
  assert.equal(
    (await module.exports.requestPrefillUndo('opaque-run')).restored,
    2
  );
  const preference = Object.values(calls[0])[0] as any;
  assert.equal(preference.mode, 'step_by_step');
  assert.equal(preference.guidedAutopilot, false);
  assert.equal(preference.autofillSkills, true);
  assert.equal(
    JSON.stringify(calls[1]),
    '{"type":"UNDO_LAST_PREFILL","runId":"opaque-run"}'
  );
});

test('undo uses the current content-script journal when Chrome denies script injection', async () => {
  const calls: string[] = [];
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    chrome: {
      storage: { sync: {
        get: async () => ({}),
        set: async () => { calls.push('paused'); },
      } },
      runtime: { sendMessage: async () => ({ ok: false }) },
    },
  });
  const restored = await module.exports.requestPrefillUndo('run-1', () => {
    calls.push('local undo');
    return { restored: 1, skipped: 0, unsupported: 0 };
  });
  assert.equal(restored.restored, 1);
  assert.equal(JSON.stringify(calls), '["paused","local undo"]');
});
