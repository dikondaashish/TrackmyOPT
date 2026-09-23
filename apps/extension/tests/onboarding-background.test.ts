import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const req = createRequire(resolve('package.json'));
const bundle = req('esbuild').buildSync({
  entryPoints: ['src/background.ts'],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  define: { 'process.env.EXT_TARGET': '""' },
}).outputFiles[0].text;
const tick = () => new Promise((resolve) => setImmediate(resolve));

function worker() {
  const listeners: Record<string, any> = {};
  const local: Record<string, unknown> = {};
  const sync: Record<string, unknown> = {};
  const opened: any[] = [];
  const event = (name: string) => ({
    addListener: (fn: any) => {
      listeners[name] = fn;
    },
    removeListener: () => {},
  });
  const area = (values: Record<string, unknown>, name: string) => ({
    get: async (keys: string | string[]) =>
      Object.fromEntries(
        (Array.isArray(keys) ? keys : [keys]).map((k) => [k, values[k]])
      ),
    set: async (patch: Record<string, unknown>) => {
      Object.assign(values, patch);
      listeners.storage?.(
        Object.fromEntries(
          Object.entries(patch).map(([k, v]) => [k, { newValue: v }])
        ),
        name
      );
    },
    remove: async () => {},
    clear: async () => {},
  });
  const chrome = {
    runtime: {
      onInstalled: event('install'),
      onMessage: event('message'),
      onMessageExternal: event('external'),
      onConnect: event('connect'),
      getURL: (s: string) => `chrome-extension://test/${s}`,
      setUninstallURL: () => {},
      getManifest: () => ({ version: '0.2.0' }),
    },
    storage: {
      local: area(local, 'local'),
      sync: area(sync, 'sync'),
      session: area({}, 'session'),
      onChanged: event('storage'),
    },
    windows: { WINDOW_ID_NONE: -1, onFocusChanged: event('focus') },
    tabs: {
      query: async () => [],
      create: async (value: any) => {
        opened.push(value);
        return { id: 7 };
      },
    },
  };
  vm.runInNewContext(bundle, {
    chrome,
    console,
    URL,
    setTimeout,
    clearTimeout,
    AbortController,
    fetch: async () => {
      throw new Error('Network must not be used in install/demo flow');
    },
  });
  const message = async (msg: any, url: string) => {
    let response: any;
    listeners.message(msg, { url, frameId: 0 }, (r: any) => {
      response = r;
    });
    await tick();
    await tick();
    return response;
  };
  return { listeners, local, opened, chrome, message };
}

test('real worker waits for token storage, then launches only once across refreshes', async () => {
  const w = worker();
  w.listeners.install({ reason: 'install' });
  await tick();
  assert.equal(w.opened.length, 0);
  await w.chrome.storage.local.set({ idToken: 'synthetic-token' });
  await tick();
  await tick();
  assert.equal(w.opened.length, 1);
  assert.equal(w.opened[0].url, 'chrome-extension://test/tour.html');
  await w.chrome.storage.local.set({ idToken: 'refreshed-token' });
  await tick();
  assert.equal(w.opened.length, 1);
});
test('web pages and content scripts cannot open tours or alter completion', async () => {
  const w = worker();
  for (const type of [
    'OPEN_PRODUCT_TOUR',
    'SAVE_TOUR_PROGRESS',
    'TOUR_SIGNED_IN',
  ]) {
    const response = await w.message(
      { type, step: 6, status: 'completed' },
      'https://jobs.example.test/apply'
    );
    assert.equal(response.ok, false);
  }
  assert.equal(w.local.productTourV1, undefined);
  assert.equal(w.opened.length, 0);
});
test('packaged tour saves progress, popup replays, update remains non-intrusive', async () => {
  const w = worker();
  w.listeners.install({ reason: 'update' });
  await tick();
  await w.chrome.storage.local.set({ idToken: 'synthetic-token' });
  await tick();
  assert.equal(w.opened.length, 0);
  assert.equal(
    (
      await w.message(
        { type: 'SAVE_TOUR_PROGRESS', step: 6, status: 'completed' },
        'chrome-extension://test/tour.html'
      )
    ).ok,
    true
  );
  assert.equal((w.local.productTourV1 as any).status, 'completed');
  assert.equal(
    (
      await w.message(
        { type: 'OPEN_PRODUCT_TOUR' },
        'chrome-extension://test/popup.html'
      )
    ).ok,
    true
  );
  assert.equal(w.opened.length, 1);
});
