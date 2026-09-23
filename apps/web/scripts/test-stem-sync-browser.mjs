// Run from apps/web: node scripts/test-stem-sync-browser.mjs
// With installed Chrome: STEM_TEST_BROWSER_CHANNEL=chrome node scripts/test-stem-sync-browser.mjs
// Real Chromium + production UI, with synthetic browser-local API storage only.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const esbuild = createRequire(resolve(webRoot, '../extension/package.json'))('esbuild');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const config = require('tailwindcss/loadConfig')(resolve(webRoot, 'tailwind.config.ts'));
const css = (await postcss([tailwind(config)]).process(await readFile(resolve(webRoot, 'app/globals.css'), 'utf8'), {
  from: resolve(webRoot, 'app/globals.css'),
})).css;
const ui = await esbuild.build({
  absWorkingDir: webRoot,
  stdin: { resolveDir: webRoot, loader: 'tsx', contents: `
    import React, {useState} from 'react';
    import {createRoot} from 'react-dom/client';
    import {StemApplyTool} from './components/dashboard/opt-tools/tools/StemApplyTool';
    import {OptDatesSection} from './components/dashboard/opt/OptDatesSection';
    import {DateSelector} from './components/dashboard/opt/DateSelector';
    const initial = {
      program_end_date:'05/15/2026', dso_recommendation_date:'04/20/2026',
      opt_start_date:'06/01/2026', opt_ead_end_date:'05/31/2027',
      stem_start_date:null, stem_dso_recommendation_date:'03/01/2027',
    };
    window.__posts = [];
    window.__toasts = [];
    window.fetch = async (url, options={}) => {
      if (url === '/api/opt/calculator') {
        let data = JSON.parse(localStorage.getItem('fixture-dates') || JSON.stringify(initial));
        if (options.method === 'POST') {
          const payload = JSON.parse(options.body);
          window.__posts.push(payload);
          if(window.__failSave) return {ok:false,json:async()=>({ok:false,error:'Synthetic failure'})};
          const {_lastModifiedField,...patch} = payload;
          data = {...data,...patch,last_updated_field:_lastModifiedField || 'stem_dso_recommendation_date'};
          localStorage.setItem('fixture-dates',JSON.stringify(data));
        }
        return {ok:true,json:async()=>({ok:true,data})};
      }
      const fixtures = {
        '/api/premium/status':{isPremium:false},
        '/api/employment-spans':{ok:true,spans:[]},
        '/api/user/tool-email':{emails:{}},
      };
      if (!(url in fixtures)) throw Error('Network disabled: ' + url);
      return {ok:true,json:async()=>fixtures[url]};
    };
    if (new URLSearchParams(location.search).has('dark')) document.documentElement.classList.add('dark');
    function App() {
      const [view,setView] = useState('stem');
      return <><nav className="flex gap-4 p-4">
        <button onClick={()=>setView('stem')}>STEM tool fixture</button>
        <button onClick={()=>setView('dates')}>Dashboard dates fixture</button>
        <button onClick={()=>setView('selector')}>Date selector fixture</button>
      </nav>{view==='stem'?<StemApplyTool/>:view==='dates'?<OptDatesSection/>:<DateSelector/>}</>;
    }
    createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
  ` },
  plugins: [{ name: 'isolated-ui', setup(build) {
    const mocks = {
      'next/navigation': 'export const useRouter=()=>({push(){}});',
      'next/dynamic': 'export default ()=>()=>null;',
      'next/link': "import React from 'react'; export default props=><a {...props}/>;",
      '@/hooks/useToast': 'export const useToast=()=>({toast:value=>window.__toasts.push(value)});',
      '@/hooks/useEmploymentSetupAck': 'export const useEmploymentSetupAck=()=>({ack:null,setAck(){}});',
      '@/components/pricing/PricingModal': 'export const PricingModal=()=>null;',
      './EmploymentHistoryLog': 'export const EmploymentHistoryLog=()=>null;',
      './EmploymentSetupModal': 'export const EmploymentSetupModal=()=>null;',
      './OptEmailRemindersPanel': 'export const OptEmailRemindersPanel=()=>null;',
      '../EmailReminder': 'export const EmailReminder=()=>null;',
      '../LiveStatsWidget': 'export const LiveStatsWidget=()=>null;',
    };
    build.onResolve({ filter: /.*/ }, args => args.path in mocks ? { path: args.path, namespace: 'fixture' } : undefined);
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'tsx', contents: mocks[args.path], resolveDir: webRoot }));
  } }],
  bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic',
  tsconfig: resolve(webRoot, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"development"' },
});

const server = createServer((req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self';style-src 'self' 'unsafe-inline';connect-src 'none';img-src 'self' data:");
  if (req.url === '/style.css') { res.setHeader('Content-Type', 'text/css'); res.end(css); return; }
  if (req.url === '/ui.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(ui.outputFiles[0].text); return; }
  res.setHeader('Content-Type', 'text/html');
  res.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body style="font-family:system-ui"><div id="root"></div><script src="/ui.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const outputDir = await mkdtemp(resolve(tmpdir(), 'stem-sync-browser-'));
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.STEM_TEST_BROWSER_CHANNEL ? { channel: process.env.STEM_TEST_BROWSER_CHANNEL } : {}) });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    for (const dark of [false, true]) {
      const context = await browser.newContext({ viewport, colorScheme: dark ? 'dark' : 'light', timezoneId: 'Europe/London' });
      await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('dialog', dialog => dialog.dismiss());
      const mode = `${viewport.width}-${dark ? 'dark' : 'light'}`;
      await page.goto(origin + (dark ? '/?dark' : '/'));
      const field = page.getByLabel('STEM DSO Recommendation Date', { exact: false });
      await expect(field).toHaveValue('03/01/2027');
      if (dark) {
        await expect(page.locator('label[for="stem-apply-dso-recommendation-date"]')).toHaveCSS('color', 'rgb(243, 244, 246)');
      }
      await expect(page.getByText('Limited by STEM DSO recommendation')).toBeVisible();
      await field.fill('03/05/2027');
      await expect(page.getByText(/Unsaved preview/)).toBeVisible();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Saved!' })).toBeVisible();
      await expect(page.getByText(/Unsaved preview/)).toHaveCount(0);
      await page.screenshot({ path: resolve(outputDir, `${mode}-stem.png`), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'STEM tool must fit viewport');

      await page.getByRole('button', { name: 'Dashboard dates fixture' }).click();
      await expect(field).toHaveValue('03/05/2027');
      await field.fill('03/10/2027');
      await page.getByRole('button', { name: 'Discard changes' }).click();
      await expect(field).toHaveValue('03/05/2027');
      await field.fill('03/10/2027');
      await page.getByRole('button', { name: 'Save Dates' }).click();
      await expect(page.getByRole('button', { name: 'Discard changes' })).toHaveCount(0);
      assert.deepEqual(await page.evaluate(() => window.__posts.at(-1)), {
        stem_dso_recommendation_date: '03/10/2027', _lastModifiedField: 'stem_dso_recommendation_date',
      });
      await page.screenshot({ path: resolve(outputDir, `${mode}-dashboard.png`), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'dashboard must fit viewport');

      await page.getByRole('button', { name: 'Date selector fixture' }).click();
      await expect(page.getByRole('button', { name: /STEM DSO Recommendation Date/ })).toBeVisible();
      await expect(page.getByText('03/10/2027', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'STEM tool fixture' }).click();
      await expect(field).toHaveValue('03/10/2027');
      await field.fill('');
      await page.evaluate(() => { window.__failSave = true; });
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText(/Unsaved preview/)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Saved!' })).toHaveCount(0);
      await page.evaluate(() => { window.__failSave = false; });
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Saved!' })).toBeVisible();
      assert.equal(await page.evaluate(() => window.__posts.at(-1).stem_dso_recommendation_date), null);
      await page.reload();
      await expect(field).toHaveValue('');
      await expect(page.getByLabel('Current OPT EAD End Date')).toHaveValue('05/31/2027');
      await page.getByRole('button', { name: 'Dashboard dates fixture' }).click();
      await expect(field).toHaveValue('');
      await expect(page.getByLabel('Program End Date')).toHaveValue('05/15/2026');
      await expect(page.locator('#dso_recommendation_date')).toHaveValue('04/20/2026');
      assert.deepEqual(errors, [], 'no browser runtime errors');
      console.log(`PASS ${mode}: load/edit/discard/save/clear/reload, failure, selector, preserved dates`);
      await context.close();
    }
  }
  console.log(`Screenshots: ${outputDir}`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
