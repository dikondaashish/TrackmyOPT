// Real panel UI with synthetic data and a simulated generation pipeline.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const bundle=await build({stdin:{loader:'ts',resolveDir:fileURLToPath(new URL('../src',import.meta.url)),contents:`
import {initialSteps} from './agent/run-protocol';
const posting='Responsibilities: Build SQL dashboards and analyze service and repair performance with the team. Qualifications: Three years of analytics experience and strong communication skills. Benefits include health insurance and paid time off. '.repeat(6);
const context={roleTitle:'Data Analyst, Service &amp; Repair',companyName:'Example Medical',pageUrl:'https://example.test/jobs/1/application',jobUrl:'https://example.test/jobs/1',jobDescription:posting,jobDescriptionSource:'current_page'};
const fixtureArtifact={sourceResumeId:'sample',job:{jobDescription:posting},pdf:{filename:'Sample_Applicant_Resume_Data_Analyst_Service_Repair.pdf',base64:btoa('%PDF synthetic preview')}};
window.chrome={tabs:{query:(_,cb)=>cb([{id:1}]),sendMessage:(_,msg,cb)=>cb ? cb(context) : Promise.resolve({ok:true}),create:async()=>{},onActivated:{addListener:()=>{}},onUpdated:{addListener:()=>{}}},storage:{onChanged:{addListener:()=>{}},local:{get:async()=>({}),set:async()=>{}}},runtime:{getURL:p=>'/'+p,sendMessage:(msg,cb)=>{
 if(msg.type==='GET_SAVED_JOB_RESUME') return Promise.resolve(location.search.includes('error') ? {ok:false,error:'unavailable'} : {ok:true,artifact:fixtureArtifact,generatedAt:'2026-09-21T12:00:00Z'});
 cb({ok:true,resumes:[{id:'sample',filename:'Sample_Applicant_Long_Resume_Filename_Data_Analyst_Service_Repair.pdf'}]});
},connect:()=>{
 let notify=()=>{};let runId='';let steps=initialSteps();let timers=[];
 return {onMessage:{addListener:fn=>notify=fn},onDisconnect:{addListener:()=>{}},disconnect:()=>timers.forEach(clearTimeout),postMessage:m=>{
 if(m.type==='cancel'){timers.forEach(clearTimeout);steps=steps.map(s=>s.status==='active'?{...s,status:'pending'}:s);notify({type:'state',runId,state:'cancelled',steps});return;}
 if(m.type!=='start')return;runId=m.runId;
 steps=steps.map(s=>({...s,status:s.id==='load_resume'||s.id==='baseline_score'?'done':s.id==='tailor'?'active':'pending',detail:s.id==='load_resume'?'Sample_Applicant_Long_Resume_Filename_Data_Analyst_Service_Repair.pdf':s.id==='baseline_score'?'72/100':undefined}));
 notify({type:'state',runId,state:'running',steps});
 }};
}}};
await import('./sidepanel');
`},bundle:true,write:false,format:'esm',platform:'browser',define:{'process.env':'{}'}});
const css=await readFile(new URL('../public/sidepanel.css',import.meta.url),'utf8');
const server=createServer((req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'none'");
 if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end('<!doctype html><html><head><title>Resume panel UI preview</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'body{max-width:380px!important;margin:24px auto!important}body:before{content:"LOCAL UI PREVIEW · Synthetic data";display:block;font:11px system-ui;margin-bottom:16px;color:#60718b}</style></head><body><main id="root"></main><script type="module" src="/bundle.js"></script></body></html>');
});
server.listen(0,'127.0.0.1',()=>console.log('Resume panel UI preview: http://127.0.0.1:'+server.address().port));
