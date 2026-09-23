import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({
  stdin: {
    contents: `export * from './src/prefill-undo';export * from './src/prefill-undo-ui';`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
test('Undo control is accessible, disabled while filling, preserves edited values and reports skipped fields', async () => {
  const dom = new JSDOM('<main></main><input>', {
    url: 'https://jobs.example.test/apply',
  });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: dom.window,
    document: dom.window.document,
  });
  const api = module.exports;
  try {
    const ui = api.createPrefillUndoControl(async () => api.undoLastPrefill());
    dom.window.document.querySelector('main')!.append(ui);
    const button = ui.querySelector('button');
    assert.equal(button.textContent, 'Undo last Prefill');
    assert.equal(button.disabled, true);
    let finish: any;
    const input = dom.window.document.querySelector('input');
    const run = api.withPrefillUndo(async () => {
      api.trackPrefillChange(input, () => (input.value = 'Filled'));
      await new Promise((r) => (finish = r));
    });
    assert.equal(button.disabled, true);
    finish();
    await run;
    assert.equal(button.disabled, false);
    input.value = 'Mine';
    button.click();
    await new Promise((r) => setImmediate(r));
    assert.equal(input.value, 'Mine');
    assert.match(ui.textContent, /1.*kept/i);
    assert.equal(button.disabled, true);
  } finally {
    dom.window.close();
  }
});
test('Undo failure remains retryable and unsupported controls are disclosed', async () => {
  const dom = new JSDOM('<main></main><input type="file">', {
    url: 'https://jobs.example.test/apply',
  });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: dom.window,
    document: dom.window.document,
  });
  const api = module.exports;
  try {
    let fail = true;
    const ui = api.createPrefillUndoControl(async () => {
      if (fail) throw Error('offline');
      return api.undoLastPrefill();
    });
    dom.window.document.querySelector('main')!.append(ui);
    await api.withPrefillUndo(async () =>
      api.markPrefillUndoUnsupported(dom.window.document.querySelector('input'))
    );
    const button = ui.querySelector('button');
    button.click();
    await new Promise((r) => setImmediate(r));
    assert.equal(button.disabled, false);
    assert.match(ui.textContent, /try again/i);
    fail = false;
    button.click();
    await new Promise((r) => setImmediate(r));
    assert.match(ui.textContent, /manual review/i);
  } finally {
    dom.window.close();
  }
});

test('popup fallback appears only without a sidebar and a remount replaces it', async () => {
  const dom = new JSDOM('<input>', { url: 'https://jobs.example.test/apply' });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: dom.window,
    document: dom.window.document,
  });
  const api = module.exports;
  try {
    api.mountPrefillUndoFallback(async () => api.undoLastPrefill());
    assert.equal(dom.window.document.querySelector('.tmo-prefill-undo'), null);
    await api.withPrefillUndo(async () =>
      api.trackPrefillChange(
        dom.window.document.querySelector('input'),
        () => (dom.window.document.querySelector('input').value = 'Fill')
      )
    );
    api.mountPrefillUndoFallback(async () => api.undoLastPrefill());
    api.mountPrefillUndoFallback(async () => api.undoLastPrefill());
    assert.equal(
      dom.window.document.querySelectorAll('.tmo-prefill-undo').length,
      1
    );
    dom.window.document.body.append(
      api.createPrefillUndoControl(async () => api.undoLastPrefill())
    );
    assert.equal(
      dom.window.document.querySelectorAll('.tmo-prefill-undo').length,
      1
    );
    assert.equal(
      dom.window.document.getElementById('tmo-prefill-undo-fallback'),
      null
    );
  } finally {
    dom.window.close();
  }
});
