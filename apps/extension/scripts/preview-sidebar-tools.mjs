// Production sidebar + fill engine, synthetic data and simulated service replies.
// No production requests, resume uploads, credits, or application submission.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const {outputFiles}=await build({stdin:{loader:'ts',resolveDir:fileURLToPath(new URL('../src',import.meta.url)),contents:`
import {createJobTrackerWidget,setJobTrackerWidgetHost} from './job-portal-tracker-widget';
import {paintResumeStatusRow} from './resume-status-row';
import {hardenInteractiveElements} from './design/a11y';
import {runPrefill} from './easy-apply-engine';
import {fillConfirmedSensitiveAnswers} from './sensitive-autofill';
const noop=()=>{};let calls=0;
window.chrome={runtime:{getURL:p=>'/'+p,sendMessage:(m,callback)=>{
 let value={ok:false};
 if(m.type==='CHECK_JOB_SAVED')value={ok:true,saved:false};
 if(m.type==='LIST_SAVED_RESUMES')value={ok:true,resumes:[{id:'synthetic',filename:'Sample resume — test data'}]};
 if(m.type==='ANALYZE_JOB_FIT')value={ok:true,matchScore:82,matchedKeywords:['SQL'],missingKeywords:['dbt'],gapSummary:'Synthetic test result, not a real evaluation.',resumeName:'Sample resume'};
 if(m.type==='GENERATE_RESUME')value={ok:false,error:'compile_failed'};
 if(['ANALYZE_JOB_FIT','GENERATE_RESUME'].includes(m.type)){calls++;document.querySelector('#calls').textContent='Simulated AI requests: '+calls;}
 if(callback)setTimeout(()=>callback(value),m.type==='ANALYZE_JOB_FIT'?700:100);
 return Promise.resolve(value);
}},storage:{local:{get:async()=>({}),set:async()=>{}},onChanged:{addListener:noop}}};
const job={company_name:'Example Corp',role_title:'Data Analyst',job_url:location.href};
setJobTrackerWidgetHost({trackWidgetAnalytics:noop,trackWidgetAnalyticsOnce:noop,getArtifactStaleReason:()=>null,generatedResumeFor:()=>undefined,
 rememberTrackerApplicationId:noop,trackerApplicationIdFor:()=>undefined,reconcileArtifactAvailabilityOnWidgetMount:async()=>queueMicrotask(()=>paintResumeStatusRow(document.querySelector('.tmo-resume-status-row'),'none')),
 paintGuidedStateUi:noop,trackPrefillExecution:noop,trackPrefillRuntimeFailure:noop,scheduleInject:noop,
 executeResolvedPrefill:async()=>{
  const result=await runPrefill({profileFallback:{firstName:'Sample',lastName:'Applicant',email:'sample@example.test'},animateFields:true,quietResultToast:true});
  await fillConfirmedSensitiveAnswers(document.querySelector('form'),{confirmed:true,workAuthorization:'yes',requiresSponsorship:'no'});
  return {result,hasResume:false,hasCoverLetter:false,sourceType:'profile'};
 }
});
const root=createJobTrackerWidget({...job},'expanded');root.setAttribute('popover','manual');document.body.append(root);root.showPopover();
hardenInteractiveElements(root);
new MutationObserver(()=>hardenInteractiveElements(root)).observe(root,{childList:true,subtree:true});
document.querySelector('#churn').onclick=()=>{
 const field=root.querySelector('.tmo-prefill-button');let count=0;
 const timer=setInterval(()=>{count++;root.dispatchEvent(new CustomEvent('tmo-job-enriched',{detail:{...job,location:'New York, NY',salary_text:'$92,000–$102,000'}}));
  document.querySelector('#churn-state').textContent=count+' updates · same Prefill button: '+(field===root.querySelector('.tmo-prefill-button'));
  if(count===100)clearInterval(timer);
 },15);
};
document.querySelector('#next-job').onclick=()=>{history.pushState({},'','/next-job');document.dispatchEvent(new Event('tmo-page-context-changed'));};
document.querySelector('#dark').onclick=()=>{root.dataset.tmoTheme=root.dataset.tmoTheme==='dark'?'light':'dark';};
`},bundle:true,write:false,format:'iife',platform:'browser',define:{'process.env':'{}'}});
const logo=await readFile(new URL('../public/icons/logo.gif',import.meta.url));
const server=createServer((req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'self';script-src 'self';style-src 'unsafe-inline';img-src 'self';connect-src 'none'");
 if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(outputFiles[0].text);return;}
 if(req.url==='/icons/logo.gif'){res.setHeader('Content-Type','image/gif');res.end(logo);return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sidebar tools stability QA</title><style>body{margin:40px 410px 40px 35px;font:15px/1.5 system-ui;color:#172b4d;background:#f6f8fc}label{display:block;margin-top:16px}input,select{padding:9px;font:inherit}main>button{padding:8px;margin:8px}output{display:block}section{background:white;padding:20px;border-radius:12px}</style></head><body><main><h1>Sidebar tools QA</h1><p>Synthetic data only. AI replies are simulated. No application can be submitted.</p><button id="churn">Run 100 page updates</button><button id="next-job">Simulate navigation</button><button id="dark">Toggle sidebar theme</button><output id="churn-state">Ready</output><output id="calls">Simulated AI requests: 0</output><section class="job-description"><h2>Data Analyst — Example Corp</h2><p>Responsibilities: build dashboards, analyze data, explain business results, and develop SQL queries. Qualifications: experience with SQL and data modeling, communication, analytics and reporting. Our team works together to improve reliable data products for customers. The role includes documenting requirements, reviewing data quality and presenting analysis to stakeholders.</p></section><form id="application-form"><label for="first">First name</label><input id="first" required><label for="last">Last name</label><input id="last" required><label for="email">Email</label><input id="email" type="email" required><label for="auth">Are you authorized to work?</label><select id="auth"><option value="">Choose</option><option>Yes</option><option>No</option></select><label for="existing">Website</label><input id="existing" value="https://example.test/my-existing-answer"></form></main><script src="/bundle.js"></script></body></html>');
});
server.listen(0,'127.0.0.1',()=>console.log('Sidebar tools QA: http://127.0.0.1:'+server.address().port));
