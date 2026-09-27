import { chromium } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Repeatable synthetic page on a matched host. These page-target CPU metrics
// are diagnostic, not a browser-wide performance or real-site claim.
const url = 'https://www.indeed.com/privacy';
const html = '<!doctype html><html><head><title>Privacy information</title></head><body><main><h1>Privacy information</h1><p>Learn about privacy settings.</p></main></body></html>';
const extension = resolve('dist');

async function sample(enabled) {
  const profile = await mkdtemp(join(tmpdir(), `tmo-activation-${enabled ? 'on' : 'off'}-`));
  const args = enabled ? [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] : [];
  const context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args });
  try {
    await context.route('https://**/*', route => route.request().url() === url
      ? route.fulfill({ contentType: 'text/html', body: html })
      : route.abort());
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const scripts = [];
    cdp.on('Debugger.scriptParsed', event => scripts.push(event.url));
    await cdp.send('Debugger.enable');
    await cdp.send('Performance.enable');
    const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(item => [item.name, item.value]));
    const before = await metrics();
    await page.goto(url);
    await page.waitForTimeout(8400); // includes the bootstrap's 1s/3s/8s checks
    const after = await metrics();
    return {
      taskSeconds: +(after.TaskDuration - before.TaskDuration).toFixed(4),
      scriptSeconds: +(after.ScriptDuration - before.ScriptDuration).toFixed(4),
      runtimeLoaded: scripts.some(script => script.endsWith('/content-job-portal-runtime.js')),
      bootstrapLoaded: scripts.some(script => script.endsWith('/content-job-portal.js')),
    };
  } finally { await context.close(); }
}

const withoutExtension = await sample(false);
const withExtension = await sample(true);
if (withExtension.runtimeLoaded) throw new Error('Heavy portal runtime activated on an irrelevant page');
console.log(JSON.stringify({ url, withoutExtension, withExtension,
  note: 'Single synthetic-page samples; CPU figures are diagnostics, not a real-site latency claim.' }, null, 2));
