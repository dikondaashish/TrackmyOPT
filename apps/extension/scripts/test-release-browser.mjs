import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdtemp, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const profile = await mkdtemp(join(tmpdir(), 'tmo-release-browser-'));
const artifact = await mkdtemp(join(tmpdir(), 'tmo-release-evidence-'));
const extension = await mkdtemp(join(tmpdir(), 'tmo-upgrade-package-'));
const previousZip=process.env.EXTENSION_PREVIOUS_ZIP || resolve('releases/trackmyopt-v0.2.1-chrome-web-store.zip');
const testReplacement=existsSync(previousZip);
if(testReplacement) execFileSync('unzip',['-q',previousZip,'-d',extension]);
else await cp(resolve('dist'),extension,{recursive:true});
const options = { channel:'chromium',headless:true,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`] };
let context;
const deadline=setTimeout(()=>{ console.error('Release browser test exceeded 90 seconds'); void context?.close(); },90000);
deadline.unref();
const html = `<!doctype html><html><head><title>Engineer at Example | Careers</title><style>body{font:16px system-ui;margin:40px}button{font-size:80px!important;background:red!important}input{display:block;padding:10px;margin:12px}</style><script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Engineer","hiringOrganization":{"@type":"Organization","name":"Example"},"description":"Build useful software. Review requirements and work with engineering teams."}</script></head><body><main><h1>Engineer</h1><h2>Example</h2><p>Build useful software. Review requirements and work with engineering teams.</p><form id="application-form"><label>First name<input name="first_name"></label><label>Last name<input name="last_name"></label><label>Email<input name="email" type="email"></label><div class="application-field"><label>Resume<input name="resume" type="file" accept=".pdf"></label><span class="resume-upload-success"></span><span class="resume-upload-failure"></span></div></form></main></body></html>`;
const launch = async () => {
  context = await chromium.launchPersistentContext(profile, options);
  await context.route('https://**/*', route => {
    if (route.request().url().startsWith('https://www.indeed.com/privacy')) return route.fulfill({contentType:'text/html',body:'<html><body>Privacy information</body></html>'});
    if (route.request().url().startsWith('https://jobs.lever.co/example/')) return route.fulfill({ contentType:'text/html',body:html });
    return route.fulfill({status:401,contentType:'application/json',body:'{"error":"not_signed_in"}'});
  });
  return context.serviceWorkers()[0] ?? context.waitForEvent('serviceworker');
};
try {
  let worker = await launch();
  if(testReplacement) assert.equal(await worker.evaluate(() => chrome.runtime.getManifest().version),'0.2.1');
  await worker.evaluate(()=>chrome.storage.local.set({releaseTestSentinel:'keep'}));
  await context.close(); context=undefined;
  await cp(resolve('dist'),extension,{recursive:true});
  worker=await launch();
  assert.equal(await worker.evaluate(async()=>(await chrome.storage.local.get('releaseTestSentinel')).releaseTestSentinel),'keep');
  assert.equal(await worker.evaluate(() => chrome.runtime.getManifest().version),'0.2.2');
  console.log('PASS package replacement');
  const id = new URL(worker.url()).host;
  // Unpacked replacement does not reliably emit Store update events in headless Chrome.
  // Event/migration behavior has separate worker tests; this exercises the notice UI.
  await worker.evaluate(()=>chrome.storage.local.set({extensionReleaseV1:{schemaVersion:1,version:'0.2.2',previousVersion:'0.2.1',updatedAt:new Date().toISOString(),noticeDismissed:false}}));
  const popup=await context.newPage();
  popup.on('pageerror', error=>{throw error;});
  await popup.goto(`chrome-extension://${id}/popup.html`);
  await popup.locator('#tmo-release-notice').waitFor();
  assert.match(await popup.locator('#tmo-release-notice').textContent(),/0.2.2/);
  await popup.locator('#tmo-release-notice').getByRole('button',{name:'Dismiss'}).click();
  await popup.reload();
  assert.equal(await popup.locator('#tmo-release-notice').count(),0);
  await popup.close();
  console.log('PASS release notice');
  const informational=await context.newPage();
  const debuggerSession=await context.newCDPSession(informational);
  const parsed=[];
  debuggerSession.on('Debugger.scriptParsed',event=>parsed.push(event.url));
  await debuggerSession.send('Debugger.enable');
  await informational.goto('https://www.indeed.com/privacy');
  await informational.waitForTimeout(1200);
  assert.equal(await informational.locator('body > #tmo-job-tracker-widget').count(),0);
  assert.equal(parsed.some(url=>url.endsWith('/content-job-portal-runtime.js')),false);
  // Background explicit activation still gets a context reply on a deferred page.
  console.log('PASS deferred parsing');
  const explicit=await worker.evaluate(async()=>{
    const [tab]=await chrome.tabs.query({url:'https://www.indeed.com/privacy'});
    return chrome.tabs.sendMessage(tab.id,{type:'TMO_GET_JOB_CONTEXT'});
  });
  assert.ok(explicit && 'pageUrl' in explicit);
  assert.equal(parsed.filter(url=>url.endsWith('/content-job-portal-runtime.js')).length,1);
  await debuggerSession.detach();
  await informational.close();
  console.log('PASS explicit activation');
  const page = await context.newPage();
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto('https://jobs.lever.co/example/demo');
  const host=page.locator('body > #tmo-job-tracker-widget');
  await host.waitFor({timeout:15000});
  assert.equal(await host.evaluate(el=>!!el.shadowRoot),true);
  assert.equal(await host.evaluate(el=>el.querySelector('button')),null);
  const expand=host.getByRole('button',{name:'Open or vertically move TrackMyOPT job assistant'});
  if(await expand.isVisible()) await expand.click();
  const settings=host.getByRole('button',{name:'Settings',exact:true});
  await settings.waitFor();
  assert.ok(await settings.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)<80));
  await settings.click();
  await host.getByRole('button',{name:'Back',exact:true}).waitFor();
  await page.keyboard.press('Escape');
  await settings.waitFor();
  await page.screenshot({path:join(artifact,'isolated-widget.png')});
  // The real runtime relay must answer even after lazy loading.
  const response = await worker.evaluate(async () => {
    const [tab]=await chrome.tabs.query({url:'https://jobs.lever.co/example/*'});
    return chrome.tabs.sendMessage(tab.id,{type:'TMO_GET_JOB_CONTEXT'});
  });
  assert.equal(response.companyName,'Example');
  console.log('PASS widget and relay');
  await page.reload(); await host.waitFor();
  // Exercise the production fill engine with fictional data on the fixture only.
  const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`import {runPrefill} from './src/easy-apply-engine'; window.fixtureRun=runPrefill;`},bundle:true,write:false,format:'iife',platform:'browser'});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  const result=await page.evaluate(async()=>{
    const form=document.querySelector('form');const input=form.querySelector('input[type=file]');
    input.addEventListener('change',()=>{
      form.setAttribute('aria-busy','true');
      setTimeout(()=>{
        form.querySelector('[name=first_name]').value='Applicant-entered name';
        form.querySelector('.resume-upload-success').textContent=input.files[0].name;
        form.removeAttribute('aria-busy');
      },300);
    },{once:true});
    return window.fixtureRun({profileFallback:{firstName:'Ada',lastName:'Lovelace',email:'ada@example.test'},resume:{pdfBase64:btoa('%PDF-1.4\nSynthetic fixture only'),filename:'demo.pdf'},animateFields:false,quietResultToast:true});
  });
  assert.equal(result.uploadVerification.resume,'verified');
  assert.equal(await page.locator('[name=first_name]').inputValue(),'Applicant-entered name');
  assert.equal(await page.locator('[name=last_name]').inputValue(),'Lovelace');
  // On retry an existing file is rechecked; a rejection blocks all later field writes.
  await page.locator('[name=last_name]').fill('');
  await page.locator('.resume-upload-failure').evaluate(el=>{el.textContent='Upload rejected: invalid PDF';});
  const rejected=await page.evaluate(()=>window.fixtureRun({profileFallback:{firstName:'Ada',lastName:'Lovelace',email:'ada@example.test'},resume:{pdfBase64:btoa('%PDF-1.4\nfixture'),filename:'demo.pdf'},animateFields:false,quietResultToast:true}));
  assert.equal(rejected.paused,true);assert.equal(rejected.uploadVerification.resume,'rejected');
  assert.equal(await page.locator('[name=last_name]').inputValue(),'');
  console.log('PASS upload states');
  // A supported child frame loads no widget and activates its runtime on demand.
  await page.evaluate(()=>{const frame=document.createElement('iframe');frame.src='https://jobs.lever.co/example/embedded';document.body.append(frame);});
  await page.locator('iframe').waitFor();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('iframe')).some(f=>f.contentDocument?.readyState==='complete'));
  const frame=page.frames().find(f=>f.url().includes('/embedded'));
  assert.ok(frame,'Embedded frame must load');
  await frame.waitForLoadState();
  assert.equal(await frame.locator('body > #tmo-job-tracker-widget').count(),0);
  await worker.evaluate(async()=>{
    const [tab]=await chrome.tabs.query({url:'https://jobs.lever.co/example/demo'});
    return chrome.tabs.sendMessage(tab.id,{type:'RUN_PREFILL_IN_CHILD_FRAME',prefill:{profileFallback:{firstName:'Frame',lastName:'Applicant',email:'frame@example.test'}}});
  });
  assert.equal(await frame.locator('[name=first_name]').inputValue(),'Frame');
  assert.deepEqual(errors,[]);
  // Installation/update metadata does not erase existing settings on restart.
  await worker.evaluate(()=>chrome.storage.local.set({releaseTestSentinel:'keep'}));
  await context.close();context=undefined;
  worker=await launch();
  assert.equal(await worker.evaluate(async()=>(await chrome.storage.local.get('releaseTestSentinel')).releaseTestSentinel),'keep');
  console.log(JSON.stringify({passed:[...(testReplacement?['0.2.1 to 0.2.2 unpacked replacement preserves storage']:[]),'release notice and dismissal','deferred informational page and explicit activation','embedded-frame activation','MV3 installation','lazy runtime import','message relay','Shadow DOM style isolation','settings and Escape','page refresh','upload acceptance and parser settlement','retry rejection pauses writes','Chrome restart and storage'],pageErrors:errors,evidence:artifact,extensionId:id},null,2));
} finally { clearTimeout(deadline); await context?.close(); }
