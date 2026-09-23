// Local Chromium only: synthetic form/profile, no real applications or networking.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const bundle = await build({
  stdin: {
    resolveDir: process.cwd(),
    loader: 'ts',
    contents: `
  import {runPrefill} from './src/easy-apply-engine';
  import {fillConfirmedSensitiveAnswers} from './src/sensitive-autofill';
  import * as undo from './src/prefill-undo';
  import {createPrefillUndoControl} from './src/prefill-undo-ui';
  import {SIDEBAR_SHELL_CSS} from './src/job-portal-sidebar-shell';
  import {WIDGET_ROOT_ID} from './src/widget-dom-ids';
  const sidebar=document.querySelector('aside');sidebar.id=WIDGET_ROOT_ID;
  const style=document.createElement('style');style.textContent=SIDEBAR_SHELL_CSS;document.head.append(style);
  const control=createPrefillUndoControl(async()=>undo.undoLastPrefill());sidebar.append(control);
  window.api=undo;
  document.querySelector('#fill').onclick=async()=>{
    await undo.withPrefillUndo(async()=>{
      await runPrefill({profileFallback:{firstName:'Ada',lastName:'Lovelace',email:'ada@example.test',country:'United States'},quietResultToast:true,animateFields:false});
      await fillConfirmedSensitiveAnswers(document.querySelector('form'),{confirmed:true,requiresSponsorship:'yes'});
    });
    document.querySelector('#fill').dataset.done='true';
  };
`,
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
});
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{font:14px system-ui;background:#f5f7fb;color:#182230;margin:0;padding:24px;display:flex;gap:24px}form{flex:1}label{display:block;margin:16px 0 6px}input,select{padding:10px;border:1px solid #cbd5e1;border-radius:8px;width:100%;box-sizing:border-box}aside{width:300px;padding:20px;border:1px solid #cbd5e1;border-radius:14px;background:white;--tmo-widget-muted:#475569;--tmo-widget-ink:#182230;--tmo-widget-surface:white;--tmo-widget-border:#cbd5e1;--tmo-widget-surface-2:#f1f5f9;--tmo-widget-accent-strong:#2563eb}#fill{display:block;margin-bottom:12px;padding:12px;border:0;border-radius:8px;background:#2563eb;color:white;font:inherit}@media(max-width:600px){body{flex-direction:column;padding:16px}aside{width:auto}}
</style></head><body><form id="application-form"><h1>Application preview</h1><label for="first">First name</label><input id="first" name="first_name"><label for="last">Last name</label><input id="last" name="last_name"><label for="email">Email</label><input id="email" type="email"><label for="country">Country</label><select id="country"><option value="">Select country</option><option value="US">United States</option></select><label for="sponsor">Do you require sponsorship?</label><select id="sponsor"><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select></form><aside><h2>Application tools</h2><button id="fill" type="button">Prefill this application</button></aside><script src="/fixture.js"></script></body></html>`;
const server = createServer((req, res) => {
  res.setHeader(
    'Content-Type',
    req.url === '/fixture.js' ? 'text/javascript' : 'text/html'
  );
  res.end(req.url === '/fixture.js' ? bundle.outputFiles[0].text : html);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const output = await mkdtemp(join(tmpdir(), 'tmo-prefill-undo-'));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    channel: process.env.UNDO_TEST_BROWSER || 'chrome',
  });
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    await context.route('**/*', (r) =>
      r.request().url().startsWith(origin) ? r.continue() : r.abort()
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await expect(
      page.getByRole('button', { name: 'Undo last Prefill' })
    ).toBeDisabled();
    await expect(page.locator('#tmo-autofill-progress')).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Prefill this application' })
      .click();
    await expect(page.locator('#fill')).toHaveAttribute('data-done', 'true');
    await expect(page.locator('#first')).toHaveValue('Ada');
    await expect(page.locator('#country')).toHaveValue('US');
    await expect(page.locator('#sponsor')).toHaveValue('yes');
    // With no later edits, native dropdowns and all text fields are reversible.
    await page.getByRole('button', { name: 'Undo last Prefill' }).click();
    for (const id of ['first', 'last', 'email', 'country', 'sponsor']) {
      await expect(page.locator(`#${id}`)).toHaveValue('');
    }
    await expect(page.locator('.tmo-prefill-undo [role="status"]')).toContainText('5 fields undone.');
    await page.reload();
    await page.getByRole('button', { name: 'Prefill this application' }).click();
    await expect(page.locator('#fill')).toHaveAttribute('data-done', 'true');
    // Trusted user edit + change back must remain protected, not just value equality.
    await page.locator('#first').fill('My edit');
    await page.locator('#first').fill('Ada');
    await page.locator('#email').fill('my-email@example.test');
    await page.getByRole('button', { name: 'Undo last Prefill' }).click();
    await expect(page.locator('#first')).toHaveValue('Ada');
    await expect(page.locator('#email')).toHaveValue('my-email@example.test');
    await expect(page.locator('#last')).toHaveValue('');
    await expect(page.locator('#country')).toHaveValue('US');
    await expect(page.locator('#sponsor')).toHaveValue('yes');
    await expect(
      page.locator('.tmo-prefill-undo [role="status"]')
    ).toContainText('1 field undone. 4 kept');
    await expect(
      page.getByRole('button', { name: 'Undo last Prefill' })
    ).toBeDisabled();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      ),
      true
    );
    await page.screenshot({
      path: join(output, `${width}-undo.png`),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `PASS ${width}px: real profile/private fill → trusted edits → undo`
    );
  }
  console.log('Screenshots:', output);
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
