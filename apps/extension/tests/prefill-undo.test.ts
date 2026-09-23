import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({
  entryPoints: ['src/prefill-undo.ts'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
function harness(
  html = '<form><input id="a"><textarea id="b"></textarea></form>'
) {
  const dom = new JSDOM(html, { url: 'https://jobs.example.test/apply' });
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: dom.window,
    document: dom.window.document,
  });
  return {
    dom,
    api: module.exports,
    el: (id: string) => dom.window.document.getElementById(id) as any,
  };
}
test('undo reverses only recorded writes and is single use', async () => {
  const h = harness();
  try {
    await h.api.withPrefillUndo(async () => {
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'Filled'));
      h.el('b').value = 'Unrelated';
    });
    assert.equal(h.api.undoLastPrefill().restored, 1);
    assert.equal(h.el('a').value, '');
    assert.equal(h.el('b').value, 'Unrelated');
    assert.equal(h.api.undoLastPrefill().restored, 0);
  } finally {
    h.dom.window.close();
  }
});
test('later edits survive even if changed back to extension value', async () => {
  const h = harness();
  try {
    await h.api.withPrefillUndo(async () =>
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'Filled'))
    );
    h.el('a').value = 'Edited';
    h.el('a').dispatchEvent(new h.dom.window.Event('input', { bubbles: true }));
    h.el('a').value = 'Filled';
    assert.equal(h.api.undoLastPrefill().skipped, 1);
    assert.equal(h.el('a').value, 'Filled');
  } finally {
    h.dom.window.close();
  }
});
test('changed values without events, removed/replaced controls, and changed URL are protected', async () => {
  for (const kind of ['value', 'replace', 'url', 'name']) {
    const h = harness();
    try {
      await h.api.withPrefillUndo(async () =>
        h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'Filled'))
      );
      if (kind === 'value') h.el('a').value = 'New';
      if (kind === 'replace')
        h.el('a').outerHTML = '<input id="a" value="New">';
      if (kind === 'url') h.dom.window.history.pushState({}, '', '/other');
      if (kind === 'name') h.el('a').name = 'different-question';
      assert.equal(h.api.undoLastPrefill().restored, 0, kind);
    } finally {
      h.dom.window.close();
    }
  }
});
test('native select and checkbox restore with framework events', async () => {
  const h = harness(
    '<form><select id="a"><option value="">Choose</option><option value="us">US</option></select><input id="b" type="checkbox"></form>'
  );
  try {
    let events = 0;
    h.el('a').addEventListener('change', () => events++);
    await h.api.withPrefillUndo(async () => {
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'us'));
      h.api.trackPrefillChange(h.el('b'), () => (h.el('b').checked = true));
    });
    assert.equal(h.api.undoLastPrefill().restored, 2);
    assert.equal(h.el('a').value, '');
    assert.equal(h.el('b').checked, false);
    assert.equal(events, 1);
  } finally {
    h.dom.window.close();
  }
});
test('radio group is atomic and preserves later selection', async () => {
  for (const edited of [false, true]) {
    const h = harness(
      '<form><input id="a" type="radio" name="answer" checked><input id="b" type="radio" name="answer"><input id="c" type="radio" name="answer"></form>'
    );
    try {
      await h.api.withPrefillUndo(async () =>
        h.api.trackPrefillChange(h.el('b'), () => (h.el('b').checked = true))
      );
      if (edited) {
        h.el('c').checked = true;
        h.el('c').dispatchEvent(
          new h.dom.window.Event('change', { bubbles: true })
        );
      }
      const result = h.api.undoLastPrefill();
      assert.equal(result.restored, edited ? 0 : 1);
      assert.equal(h.el(edited ? 'c' : 'a').checked, true);
    } finally {
      h.dom.window.close();
    }
  }
});
test('custom controls and uploads are counted but never generically cleared', async () => {
  const h = harness('<input id="a" role="combobox"><input id="b" type="file">');
  try {
    await h.api.withPrefillUndo(async () => {
      h.api.trackPrefillChange(
        h.el('a'),
        () => (h.el('a').value = 'United States')
      );
      h.api.markPrefillUndoUnsupported(h.el('b'));
    });
    const r = h.api.undoLastPrefill();
    assert.equal(r.unsupported, 2);
    assert.equal(h.el('a').value, 'United States');
  } finally {
    h.dom.window.close();
  }
});
test('busy runs reject overlap and undo; exceptions still retain completed writes', async () => {
  const h = harness();
  try {
    let finish: any;
    const run = h.api.withPrefillUndo(async () => {
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'Filled'));
      await new Promise((r) => (finish = r));
      throw Error('partial');
    });
    assert.equal(h.api.getPrefillUndoState().busy, true);
    assert.equal(h.api.undoLastPrefill().restored, 0);
    await assert.rejects(h.api.withPrefillUndo(async () => {}));
    finish();
    await assert.rejects(run);
    assert.equal(h.api.undoLastPrefill().restored, 1);
  } finally {
    h.dom.window.close();
  }
});
test('latest nonempty run only, empty runs preserve last undo', async () => {
  const h = harness();
  try {
    await h.api.withPrefillUndo(async () =>
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'First'))
    );
    await h.api.withPrefillUndo(async () =>
      h.api.trackPrefillChange(h.el('b'), () => (h.el('b').value = 'Second'))
    );
    await h.api.withPrefillUndo(async () => {});
    assert.equal(h.api.undoLastPrefill().restored, 1);
    assert.equal(h.el('a').value, 'First');
    assert.equal(h.el('b').value, '');
  } finally {
    h.dom.window.close();
  }
});
test('run IDs reject stale undo and cancelled late frame runs', async () => {
  const h = harness();
  try {
    await h.api.withPrefillUndo(
      async () =>
        h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'Filled')),
      'new-run'
    );
    assert.equal(h.api.undoLastPrefill('old-run').restored, 0);
    assert.equal(h.api.undoLastPrefill('new-run').restored, 1);
    await assert.rejects(h.api.withPrefillUndo(async () => {}, 'new-run'));
  } finally {
    h.dom.window.close();
  }
});

test('choice rollback cannot clear a later user edit through a dependent field handler', async () => {
  const h = harness(
    '<form><select id="a"><option value="">Choose</option><option value="us">US</option></select><input id="b" aria-label="City"></form>'
  );
  try {
    await h.api.withPrefillUndo(async () =>
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'us'))
    );
    h.el('b').value = 'My city';
    h.el('a').addEventListener('change', () => (h.el('b').value = ''));
    assert.equal(h.api.undoLastPrefill().skipped, 1);
    assert.equal(h.el('b').value, 'My city');
  } finally {
    h.dom.window.close();
  }
});

test('cancelled in-flight frame stops writes and then restores completed changes', async () => {
  const h = harness();
  try {
    let finish: any;
    const run = h.api.withPrefillUndo(async () => {
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'First'));
      await new Promise((r) => (finish = r));
      assert.equal(h.api.isPrefillUndoAllowed(), false);
      h.api.trackPrefillChange(h.el('b'), () => (h.el('b').value = 'Late'));
    }, 'frame-run');
    const undo = (h.dom.window as any).__tmoPrefillUndoV1.cancelAndUndo(
      'frame-run'
    );
    finish();
    await run;
    assert.equal((await undo).restored, 1);
    assert.equal(h.el('a').value, '');
    assert.equal(h.el('b').value, '');
  } finally {
    h.dom.window.close();
  }
});

test('select options changed by the portal and relabelled questions are never restored', async () => {
  const h = harness(
    '<form><label for="a">Country</label><select id="a"><option value="">Choose</option><option value="us">US</option></select></form>'
  );
  try {
    await h.api.withPrefillUndo(async () =>
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'us'))
    );
    h.el('a').options[0].value = 'ca';
    assert.equal(h.api.undoLastPrefill().restored, 0);
    assert.equal(h.el('a').value, 'us');
  } finally {
    h.dom.window.close();
  }
});

test('SPA navigation discards undo even when returning to the same URL', async () => {
  const h = harness();
  try {
    await h.api.withPrefillUndo(async () =>
      h.api.trackPrefillChange(h.el('a'), () => (h.el('a').value = 'Filled'))
    );
    h.dom.window.document.dispatchEvent(
      new h.dom.window.Event('tmo-page-context-changed')
    );
    assert.equal(h.api.getPrefillUndoState().available, false);
    assert.equal(h.api.undoLastPrefill().restored, 0);
  } finally {
    h.dom.window.close();
  }
});
