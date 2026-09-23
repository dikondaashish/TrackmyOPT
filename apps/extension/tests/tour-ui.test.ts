import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { TOUR_CHAPTERS } from '../src/tour-content';

const req = createRequire(resolve('package.json'));
const { JSDOM } = req('jsdom');
const script = req('esbuild').buildSync({
  entryPoints: ['src/tour.ts'],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  define: { 'process.env.EXT_TARGET': '""' },
}).outputFiles[0].text;
function fixture(packaged = false, stored?: unknown) {
  const dom = new JSDOM('<div id="tour-root"></div>', {
    url: packaged
      ? 'chrome-extension://test/tour.html'
      : 'http://localhost/tour.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.matchMedia = () => ({ matches: true });
  w.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 100,
    height: 30,
    top: 0,
    left: 0,
    right: 100,
    bottom: 30,
  });
  let requests = 0;
  const messages: any[] = [];
  w.fetch = () => {
    requests++;
    throw new Error('No network allowed');
  };
  w.chrome = {
    storage: {
      local: { get: async () => ({ productTourV1: stored }) },
      sync: { get: async () => ({ theme: 'dark' }) },
    },
    runtime: {
      sendMessage: async (message: any) => {
        messages.push(message);
        return { ok: true };
      },
    },
  };
  w.eval(script);
  return {
    dom,
    w,
    doc: w.document,
    messages,
    get requests() {
      return requests;
    },
    click: (selector: string) => w.document.querySelector(selector).click(),
  };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('tour uses real contact fill including country, preserves edits, and never fetches', async () => {
  const f = fixture();
  try {
    f.click('[data-step="1"]');
    f.click('#demo-action');
    await tick();
    assert.equal(f.doc.querySelector('[name="first_name"]').value, 'Alex');
    assert.equal(f.doc.querySelector('[name="country"]').value, 'US');
    assert.equal(f.doc.querySelector('[name="city"]').value, 'Boston');
    f.doc.querySelector('[name="first_name"]').value = 'My edit';
    f.click('#demo-action');
    await tick();
    assert.equal(f.doc.querySelector('[name="first_name"]').value, 'My edit');
    assert.equal(f.requests, 0);
    assert.equal(f.messages.length, 0);
    assert.equal(f.doc.querySelector('[type="submit"]'), null);
    f.click('#demo-reset');
    assert.equal(f.doc.querySelector('[name="first_name"]').value, '');
  } finally {
    f.dom.window.close();
  }
});
test('all seven sections have focusable headings and working sample actions', async () => {
  const f = fixture();
  try {
    assert.equal(TOUR_CHAPTERS.length, 7);
    for (let i = 1; i < 7; i++) {
      f.click(`[data-step="${i}"]`);
      assert.equal(f.doc.activeElement.id, 'guide-title');
      assert.equal(
        f.doc.querySelector('[aria-current="step"]').dataset.step,
        String(i)
      );
      if (i < 6) {
        f.click('#demo-action');
        await tick();
        assert.ok(f.doc.querySelector('#demo-status').textContent);
      }
    }
    assert.ok(
      f.doc.querySelector(
        'a[href="https://www.trackmyopt.com/dashboard/extension"]'
      )
    );
    f.click('#next');
    await tick();
    assert.match(f.doc.querySelector('h1').textContent, /next application/);
    f.click('#restart');
    assert.equal(f.doc.querySelector('#back').disabled, true);
    f.click('#skip');
    await tick();
    assert.match(f.doc.querySelector('h1').textContent, /Ready when you are/);
    assert.equal(f.requests, 0);
  } finally {
    f.dom.window.close();
  }
});

test('Next alone walks the complete spotlight tour without requiring demo actions', async () => {
  const f = fixture();
  try {
    for (let step = 0; step < 7; step++) {
      assert.ok(
        f.doc.querySelector('[data-tour-highlight]'),
        'one feature is highlighted'
      );
      assert.equal(f.doc.querySelectorAll('[data-tour-highlight]').length, 1);
      assert.ok(f.doc.querySelector('#tour-coach #next'));
      assert.ok(f.doc.querySelector('#guide-copy').textContent);
      assert.equal(
        f.doc.querySelector('#next').textContent,
        step === 6 ? 'Finish tour' : 'Next →'
      );
      f.click('#next');
      await tick();
    }
    assert.match(f.doc.querySelector('h1').textContent, /next application/);
    assert.equal(f.doc.querySelector('#tour-spotlight'), null);
    assert.equal(f.requests, 0);
  } finally {
    f.dom.window.close();
  }
});

test('coach Back and Skip remain usable and clean up highlights', async () => {
  const f = fixture();
  try {
    f.click('#next');
    f.click('#next');
    f.click('#back');
    assert.equal(
      f.doc.querySelector('[data-tour-highlight]').id,
      'demo-action'
    );
    f.click('#coach-skip');
    await tick();
    assert.equal(f.doc.querySelector('#tour-coach'), null);
    assert.equal(f.doc.querySelector('#tour-spotlight'), null);
    assert.match(f.doc.querySelector('h1').textContent, /Ready when you are/);
  } finally {
    f.dom.window.close();
  }
});

test('spotlight follows scroll and resize without duplicating coach marks', async () => {
  const f = fixture();
  try {
    f.click('#next');
    const target = f.doc.querySelector('[data-tour-highlight]');
    assert.equal(target.getAttribute('aria-describedby'), 'guide-copy');
    target.getBoundingClientRect = () => ({
      left: 400,
      top: 100,
      right: 600,
      bottom: 144,
      width: 200,
      height: 44,
    });
    f.w.dispatchEvent(new f.w.Event('scroll'));
    f.w.dispatchEvent(new f.w.Event('resize'));
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(f.doc.querySelector('#tour-spotlight').style.left, '394px');
    assert.equal(f.doc.querySelector('#tour-spotlight').style.top, '94px');
    f.click('#next');
    assert.equal(target.hasAttribute('data-tour-highlight'), false);
    assert.equal(target.hasAttribute('aria-describedby'), false);
    assert.equal(f.doc.querySelectorAll('#tour-coach').length, 1);
    assert.equal(f.doc.querySelectorAll('#tour-spotlight').length, 1);
    f.click('#coach-skip');
    await tick();
    f.w.dispatchEvent(new f.w.Event('resize'));
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(f.doc.querySelector('#tour-spotlight'), null);
    assert.equal(f.doc.body.classList.contains('has-tour-guide'), false);
  } finally {
    f.dom.window.close();
  }
});
test('packaged tour resumes locally and saves only bounded progress messages', async () => {
  const f = fixture(true, { version: 1, step: 4, status: 'active' });
  try {
    await tick();
    assert.equal(
      f.doc.querySelector('[aria-current="step"]').dataset.step,
      '4'
    );
    assert.equal(f.doc.documentElement.dataset.tmoTheme, 'dark');
    f.click('#next');
    await tick();
    assert.deepEqual(JSON.parse(JSON.stringify(f.messages[0])), {
      type: 'SAVE_TOUR_PROGRESS',
      step: 5,
      status: 'active',
    });
    f.click('#skip');
    await tick();
    assert.equal(f.messages[1].status, 'skipped');
    assert.equal(f.requests, 0);
  } finally {
    f.dom.window.close();
  }
});
test('navigation cancels an in-flight fill without writing into the next section', async () => {
  const f = fixture();
  try {
    f.w.matchMedia = () => ({ matches: false });
    f.click('[data-step="1"]');
    f.click('#demo-action');
    f.click('[data-step="2"]');
    await new Promise((resolve) => setTimeout(resolve, 120));
    assert.equal(f.doc.querySelector('#demo-status').textContent, '');
    assert.match(f.doc.querySelector('h1').textContent, /resume/);
  } finally {
    f.dom.window.close();
  }
});
test('tour page blocks networking and form submission; bundle contains no remote script tags', () => {
  const html = readFileSync('public/tour.html', 'utf8');
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
});

test('failed completion storage leaves a visible retry path', async () => {
  const f = fixture(true, { version: 1, step: 6, status: 'active' });
  try {
    await tick();
    f.w.chrome.runtime.sendMessage = async () => ({ ok: false });
    f.click('#next');
    await tick();
    assert.match(
      f.doc.querySelector('#save-note').textContent,
      /could not be saved/
    );
    assert.ok(f.doc.querySelector('#next'));
    f.w.chrome.runtime.sendMessage = async () => ({ ok: true });
    f.click('#next');
    await tick();
    assert.match(f.doc.querySelector('h1').textContent, /next application/);
  } finally {
    f.dom.window.close();
  }
});

test('Escape cancels animated filling and allows another attempt', async () => {
  const f = fixture();
  try {
    f.w.matchMedia = () => ({ matches: false });
    f.click('[data-step="1"]');
    f.click('#demo-action');
    f.doc.dispatchEvent(new f.w.KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise((resolve) => setTimeout(resolve, 120));
    assert.match(f.doc.querySelector('#demo-status').textContent, /stopped/);
    assert.equal(f.doc.querySelector('#demo-action').disabled, false);
    f.w.matchMedia = () => ({ matches: true });
    f.click('#demo-action');
    await tick();
    assert.equal(f.doc.querySelector('[name="city"]').value, 'Boston');
  } finally {
    f.dom.window.close();
  }
});

test('a slow Skip response cannot replace a newly selected section', async () => {
  const f = fixture(true, { version: 1, step: 1, status: 'active' });
  try {
    await tick();
    let resolveSkip: (value: unknown) => void = () => {};
    f.w.chrome.runtime.sendMessage = (msg: any) =>
      msg.status === 'skipped'
        ? new Promise((resolve) => {
            resolveSkip = resolve;
          })
        : Promise.resolve({ ok: true });
    f.click('#skip');
    f.click('[data-step="2"]');
    resolveSkip({ ok: true });
    await tick();
    assert.match(f.doc.querySelector('h1').textContent, /resume/);
  } finally {
    f.dom.window.close();
  }
});
