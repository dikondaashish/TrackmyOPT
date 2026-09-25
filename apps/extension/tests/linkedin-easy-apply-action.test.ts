import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const source = readFileSync('src/content-job-portal.ts', 'utf8');
const syncSource = source.slice(
  source.indexOf('function syncLinkedInEasyApplyAction()'),
  source.indexOf('\nasync function injectOrRefreshButton()'),
);

test('LinkedIn Easy Apply gets one in-dialog prefill action and restores the widget on close', () => {
  const dom = new JSDOM(
    '<body><dialog open><h2>Apply to Example</h2><input><footer><button>Next</button></footer></dialog><div id="widget"><button class="tmo-prefill-button">Prefill</button><span class="tmo-prefill-result-line"></span></div></body>',
    { url: 'https://www.linkedin.com/jobs/view/123' },
  );
  const document = dom.window.document;
  const widget = document.getElementById('widget')!;
  let prefillClicks = 0;
  widget.querySelector('button')!.addEventListener('click', () => prefillClicks++);
  const context: Record<string, unknown> = {
    document,
    MutationObserver: dom.window.MutationObserver,
    WIDGET_ROOT_ID: 'widget',
    crypto: { randomUUID: () => 'widget-uuid' },
    findLinkedInEasyApplyDialog: () => document.querySelector('dialog[open]'),
    el: (tag: string, options: { style?: string; text?: string; attrs?: Record<string, string> }) => {
      const element = document.createElement(tag);
      if (options.style) element.setAttribute('style', options.style);
      if (options.text) element.textContent = options.text;
      for (const [name, value] of Object.entries(options.attrs ?? {})) element.setAttribute(name, value);
      return element;
    },
  };
  const code = requireLocal('esbuild').transformSync(
    'let hiddenForLinkedInDialog = null; let linkedInPrefillObserver = null; ' +
      syncSource + '; globalThis.sync = syncLinkedInEasyApplyAction;',
    { loader: 'ts' },
  ).code;
  vm.runInNewContext(code, context);
  const sync = context.sync as () => void;

  try {
    sync();
    const action = document.querySelector<HTMLButtonElement>('[data-tmo-linkedin-prefill] button');
    assert.equal(action?.textContent, 'Prefill with TrackMyOPT');
    assert.equal(widget.getAttribute('aria-hidden'), 'true');
    action!.click();
    assert.equal(prefillClicks, 1);

    sync();
    assert.equal(document.querySelectorAll('[data-tmo-linkedin-prefill]').length, 1);

    document.querySelector('dialog')!.removeAttribute('open');
    sync();
    assert.equal(document.querySelector('[data-tmo-linkedin-prefill]'), null);
    assert.equal(widget.getAttribute('aria-hidden'), null);
    assert.equal(widget.style.visibility, '');
  } finally {
    dom.window.close();
  }
});
