// Isolated browser fixture: real scheduler + fill engine, synthetic profile only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const portal = await readFile(new URL('../src/content-job-portal.ts', import.meta.url), 'utf8');
const scheduler = portal.slice(portal.indexOf('let _spaObserver:'), portal.indexOf('async function initializeAutofillPreferences'));
const { outputFiles } = await build({ stdin: { loader: 'ts', resolveDir: fileURLToPath(new URL('../src', import.meta.url)), contents: `
  import { runPrefill, getPrefillCandidateSignature } from './easy-apply-engine';
  import { shouldRunContinuousPrefill } from './continuous-prefill';
  import { getLabelText, isFillable } from './easy-apply-dom';
  import { classifyField } from './easy-apply-matchers';
  const AUTOFILL_FEATURE_FLAGS = { continuousMode:true, guidedAutopilot:false };
  const currentPlanEntitlements = { continuousMode:true };
  let currentAutofillPreferences = { mode:'step_by_step', guidedAutopilot:false };
  const WIDGET_ROOT_ID = 'fixture-controls';
  const getJobInfo = () => ({job_url:location.href});
  const paintContinuousStopGuidance = () => {};
  const trackPrefillRuntimeFailure = () => {};
  const trackPrefillExecution = () => {};
  let passes=0;
  async function executeResolvedPrefill(job,mode,shouldContinue=()=>true) {
    passes++; document.querySelector('#passes').textContent='Fill passes: '+passes;
    if(document.querySelector('#delay').checked) await new Promise(resolve=>setTimeout(resolve,2000));
    if(!shouldContinue()) throw new Error('Stopped');
    const result=await runPrefill({shouldContinue,quietResultToast:true,profileFallback:{firstName:'Test',lastName:'Applicant',email:'test@example.test',phone:'+15555550100',country:'Canada'}});
    document.querySelector('#diagnostic').textContent=JSON.stringify([...document.querySelectorAll('form input')].map(el=>({name:el.name,label:getLabelText(el),kind:classifyField(getLabelText(el)),fillable:isFillable(el),value:el.value})));
    return {result};
  }
  ${scheduler}
  const mode = value => { currentAutofillPreferences.mode=value; document.querySelector('#mode').textContent='Mode: '+value; value==='continuous'?startContinuousPrefill():stopContinuousPrefill(); };
  document.querySelector('#step').onclick=()=>mode('step_by_step');
  document.querySelector('#continuous').onclick=()=>mode('continuous');
  document.querySelector('#manual').onclick=()=>executeResolvedPrefill(getJobInfo(),'step_by_step');
  document.querySelector('#next').onclick=()=>{ document.querySelector('#phone-step').hidden=false; };
  document.querySelector('#reset').onclick=()=>{ mode('step_by_step'); document.querySelector('form').reset(); document.querySelector('#phone-step').hidden=true; document.querySelector('#country').removeAttribute('data-value'); document.querySelector('#country').textContent='Select'; document.querySelector('#options').replaceChildren(); };
  document.querySelector('#country').onclick=()=>setTimeout(()=>{const option=document.createElement('div');option.role='option';option.textContent='Canada'; option.onclick=()=>{ document.querySelector('#country').dataset.value='Canada';document.querySelector('#country').textContent='Canada';document.querySelector('#options').replaceChildren(); }; document.querySelector('#options').appendChild(option);},600);
  document.querySelector('form').onsubmit=event=>{event.preventDefault();document.querySelector('#submits').textContent='Submit clicked manually';};
  window.addEventListener('pagehide',stopContinuousPrefill);
` }, bundle:true, write:false, platform:'browser', format:'iife' });
const server=createServer((req,res)=>{
  if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'");
  res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prefill modes test</title>
    <style>body{font:16px system-ui;max-width:760px;margin:40px auto;padding:20px}button,input{padding:10px;margin:6px}label{display:block}#options [role=option]{padding:12px;background:lightblue;cursor:pointer}</style>
    <h1>Prefill modes — local safety test</h1><p>Synthetic profile. No external requests, applications, or saved settings.</p>
    <section id="fixture-controls"><button id="step">Step-by-step</button><button id="continuous">Continuous</button><button id="manual">Prefill now</button><button id="reset">Reset fixture</button><label><input id="delay" type="checkbox">Delay profile response</label><p id="mode">Mode: step_by_step</p><p id="passes">Fill passes: 0</p><output id="diagnostic"></output></section>
    <form id="application-form"><label>First name<input name="first_name" aria-label="First name"></label><label>Email<input type="email" name="email" aria-label="Email"></label>
    <label>Country<button type="button" id="country" role="combobox" aria-label="Country" aria-controls="options">Select</button></label><div id="options"></div>
    <section id="phone-step" hidden><label>Phone<input name="phone" type="tel" aria-label="Phone"></label></section>
    <button id="next" type="button">Reveal next step</button><button type="submit">Submit application</button></form><p id="submits">No submission</p><script src="/bundle.js"></script>`);
});
server.listen(0,'127.0.0.1',()=>console.log('Prefill mode fixture: http://127.0.0.1:'+server.address().port));
