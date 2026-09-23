// Actual smart-answer controller, synthetic responses, no external requests.
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const { outputFiles } = await build({
  stdin: {
    loader: 'ts',
    resolveDir: fileURLToPath(new URL('../src', import.meta.url)),
    contents: `
import {runSmartAnswers} from './smart-answers';
const form=document.querySelector('form')!;const initial=form.innerHTML;
const saved=new Map();let aiCalls=0;let active=false;let stopped=false;
window.chrome={runtime:{sendMessage:async message=>{
 if(message.type==='LOAD_SCREENING_ANSWER')return {ok:true,answer:saved.get(message.questionHash)??null};
 if(message.type==='SAVE_SCREENING_ANSWER'){saved.set(message.answer.questionHash,message.answer);return {ok:true};}
 if(message.type==='GENERATE_SCREENING_DRAFT'){
   aiCalls++;document.querySelector('#count')!.textContent='Sample AI requests: '+aiCalls;
   await new Promise(resolve=>setTimeout(resolve,700));
   const scenario=(document.querySelector('#scenario') as HTMLSelectElement).value;
   if(scenario==='quota')return {ok:false,error:'ai_monthly_limit_reached'};
   if(scenario==='offline')throw new Error('Offline test');
   return {ok:true,draft:message.questionText.includes('dbt')?'I use dbt with Snowflake to transform raw sales data into tested, documented reporting models.':'Data modeling organizes data into structures for analysis. In my sales reporting project, I built fact and dimension tables using SQL to support dashboards.'};
 }throw new Error('Unexpected request');
}}};
document.querySelector('#reset')!.addEventListener('click',()=>{if(!active){form.innerHTML=initial;document.querySelector('#result')!.textContent='New sample form ready';}});
document.querySelector('#stop')!.addEventListener('click',()=>{stopped=true;});
document.querySelector('#prefill')!.addEventListener('click',async()=>{
 if(active)return;active=true;stopped=false;
 const button=document.querySelector<HTMLButtonElement>('#prefill')!;button.disabled=true;
 const scenario=(document.querySelector('#scenario') as HTMLSelectElement).value;
 const count=await runSmartAnswers({root:form,job:{jobUrl:location.href,companyName:'Example',roleTitle:'Data Analyst',jobDescription:'Build analytics models and sales dashboards'},hasResume:scenario!=='no-resume',snapshot:{skills:['SQL','dbt','Snowflake'],experience:[{descriptionText:'Built sales reporting models in dbt on Snowflake and fact and dimension tables using SQL.'}]},shouldContinue:()=>!stopped});
 document.querySelector('#result')!.textContent=count+' answers filled. No application submitted.';
 active=false;button.disabled=false;
});
form.addEventListener('submit',e=>e.preventDefault());
`,
  },
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  define: { 'process.env': '{}' },
});
const html = `<!doctype html><html><head><meta charset="utf-8"><title>TrackMyOPT Smart Answers QA</title><style>body{font:14px/1.6 system-ui;background:#f6f8fb;color:#0f172a;max-width:900px;margin:36px auto;padding:0 24px}h1{font-size:26px}p{color:#64748b}.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:20px 0}button,select{font:inherit;padding:9px 14px;border:1px solid #cbd5e1;border-radius:8px;background:white}#prefill{background:#2563eb;color:white;border:0}#prefill:disabled{opacity:.65}form{padding:24px;background:white;border:1px solid #e7eaf0;border-radius:14px}label{display:block;margin:16px 0 6px;font-weight:600}textarea,input{display:block;width:100%;box-sizing:border-box;font:inherit;border:1px solid #cbd5e1;border-radius:8px;padding:12px}textarea{min-height:90px}output{display:block;margin-top:20px}.tmo-smart-answer-note[data-review-state=needs-review]{color:#1e40af!important}</style></head><body><h1>Smart application answers</h1><p>Production controller · sample AI responses · no employer connection · no real AI usage</p><div class="bar"><button id="prefill">Prefill this application</button><button id="reset">New sample form</button><button id="stop">Stop test</button><label for="scenario">Scenario</label><select id="scenario"><option value="ready">Resume ready</option><option value="no-resume">No resume</option><option value="quota">AI limit reached</option><option value="offline">AI unavailable</option></select></div><form id="application-form"><label for="dbt">What do you use dbt with?</label><textarea id="dbt" maxlength="400"></textarea><label for="modeling">What is data modeling and where do you use it?</label><textarea id="modeling" maxlength="600"></textarea><label for="salary">What salary do you expect?</label><input id="salary"><label for="existing">Describe a project you built</label><textarea id="existing">This existing answer must remain unchanged.</textarea></form><output id="result" role="status">Ready</output><p id="count">Sample AI requests: 0</p><script src="/bundle.js"></script></body></html>`;
const server = createServer((req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self';style-src 'unsafe-inline';connect-src 'none'"
  );
  res.setHeader(
    'Content-Type',
    req.url === '/bundle.js' ? 'text/javascript' : 'text/html; charset=utf-8'
  );
  res.end(req.url === '/bundle.js' ? outputFiles[0].text : html);
});
server.listen(0, '127.0.0.1', () =>
  console.log('Smart answers QA: http://127.0.0.1:' + server.address().port)
);
