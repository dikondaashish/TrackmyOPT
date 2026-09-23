// Actual production widget with synthetic job data and no remote service calls.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const { outputFiles } = await build({
  stdin: { loader:'ts', resolveDir:fileURLToPath(new URL('../src', import.meta.url)), contents:`
    import { createJobTrackerWidget, setJobTrackerWidgetHost } from './job-portal-tracker-widget';
    import { paintResumeStatusRow } from './resume-status-row';
    const params = new URLSearchParams(location.search);
    window.chrome = {
      runtime: {getURL: path => '/'+path, sendMessage:(message, callback) => {
        const result = message.type==='CHECK_JOB_SAVED' ? {ok:true,saved:params.has('saved'),status:params.get('saved')} : message.type==='GET_OPT_CLOCK_NUDGE' ? {ok:true,nudge:{active:true,phase:'initial',remaining:69,used:21,max:90}} : {ok:false};
        if(callback) queueMicrotask(()=>callback(result));
        return Promise.resolve(result);
      }},
      storage: {local:{get:async()=>({}),set:async()=>{}},onChanged:{addListener:()=>{},removeListener:()=>{}}}
    };
    const noop = ()=>{};
    setJobTrackerWidgetHost({
      trackWidgetAnalytics:noop,trackWidgetAnalyticsOnce:noop,
      getArtifactStaleReason:()=>null,generatedResumeFor:()=>params.get('resume')==='ready'?{}:undefined,
      rememberTrackerApplicationId:noop,
      reconcileArtifactAvailabilityOnWidgetMount:async()=>queueMicrotask(()=>paintResumeStatusRow(document.querySelector('.tmo-resume-status-row'),params.get('resume')||'none')),
      paintGuidedStateUi:noop,clearPrivateApplicationApproval:noop,
    });
    const root = createJobTrackerWidget({
      role_title:params.has('long')?'Senior Software Engineer, Application Infrastructure, Developer Experience and International Platform Operations':'Client Billing Specialist',
      company_name:'Example Corp',location:'New York, NY, United States',salary_text:'$92,000 - $102,000 USD / year',
      job_url:'https://example.com/jobs/preview',
    },'expanded');
    root.dataset.tmoTheme=params.get('theme') || 'light';
    document.body.append(root);
    document.querySelector('#theme').onclick=()=>{
      const dark=root.dataset.tmoTheme!=='dark';root.dataset.tmoTheme=dark?'dark':'light';
      document.body.classList.toggle('dark',dark);
    };
    document.querySelector('#long').onclick=()=>{
      const body=root.querySelector('.tmo-job-widget-scroll-body');
      for(let i=0;i<8;i++){
        const p=document.createElement('p');p.textContent='Layout-only test content '+(i+1)+' — the header and footer remain accessible while this area scrolls.';
        p.style.cssText='margin:16px;font:13px/1.5 system-ui';body.append(p);
      }
    };
  `}, bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env':'{}'},
});
const logo=await readFile(new URL('../public/icons/logo.gif',import.meta.url));
const server=createServer((req,res)=>{
  if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(outputFiles[0].text);return;}
  if(req.url==='/icons/logo.gif'){res.setHeader('Content-Type','image/gif');res.end(logo);return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy',"default-src 'self';style-src 'self' 'unsafe-inline';connect-src 'none';img-src 'self'");
  res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>TrackMyOPT sidebar preview</title><style>
  body{margin:0;background:#f6f8fb;color:#0f172a;font:16px/1.6 system-ui}main{max-width:640px;margin:60px 420px 60px 60px}h1{font-size:32px;line-height:1.2}button{font:inherit}main button{padding:8px 12px;margin:4px;border:1px solid #cbd5e1;border-radius:8px;background:white}main section{padding:24px;margin:20px 0;background:white;border:1px solid #e7eaf0;border-radius:12px}.dark{background:#0d1016;color:#e6eaf2}.dark section{background:#161b22;border-color:#262d3a}@media(max-width:700px){main{margin:24px}}</style></head>
  <body><main><p>LOCAL UI PREVIEW · NO LIVE ACTIONS</p><h1>Software Engineer</h1><p>Example Company · New York, NY</p><button id="theme">Toggle preview theme</button><button id="long">Add long test content</button><section><h2>Your application</h2><p>The sidebar is a companion to the application, with a clear border and space around every edge.</p><p>Existing TrackMyOPT tools are unchanged. This fixture uses synthetic data and cannot connect to production services.</p></section></main><script src="/bundle.js"></script></body></html>`);
});
server.listen(0,'127.0.0.1',()=>console.log('Sidebar preview: http://127.0.0.1:'+server.address().port));
