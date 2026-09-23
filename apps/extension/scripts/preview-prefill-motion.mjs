// Production fill/feedback modules with synthetic data only; no outbound calls.
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const {outputFiles}=await build({stdin:{loader:'ts',resolveDir:fileURLToPath(new URL('../src',import.meta.url)),contents:`
import {runPrefill} from './easy-apply-engine';
import {createAutofillVisualFeedback} from './autofill-visual-feedback';
import {fillConfirmedSensitiveAnswers} from './sensitive-autofill';
import {scanApplicationFields} from './application-field-scan';
import {paintPrefillCoverage} from './job-portal-prefill-coverage-ui';
import {COLORS} from './design/tokens';
const button=document.querySelector<HTMLButtonElement>('#prefill')!;
const form=document.querySelector('form')!;
let active=false;
document.querySelector('#stop')!.addEventListener('click',()=>{active=false;});
document.querySelector('#reset')!.addEventListener('click',()=>{if(!active){form.reset();document.querySelector('#coverage')!.replaceChildren();document.querySelector('#result')!.textContent='Ready';}});
document.querySelector('#dark')!.addEventListener('change',e=>{
const dark=(e.target as HTMLInputElement).checked;const colors=dark?COLORS.dark:COLORS.light;
document.documentElement.style.colorScheme=dark?'dark':'light';
for(const [key,value] of Object.entries({'--tmo-widget-ink':colors.ink,'--tmo-widget-text':colors.ink,'--tmo-widget-muted':colors.inkMuted,'--tmo-widget-surface':colors.surface,'--tmo-widget-border':colors.border,'--page':colors.bg,'--tmo-color-success-ink':colors.successInk,'--tmo-color-warning-ink':colors.warningInk}))document.documentElement.style.setProperty(key,value);
});
button.addEventListener('click',async()=>{
  if(active)return;active=true;button.disabled=true;button.textContent='Prefilling…';
  const motion=!(document.querySelector('#reduced') as HTMLInputElement).checked;
  const visual=createAutofillVisualFeedback(document,{animateFields:motion});
  try{
    const result=await runPrefill({profileFallback:{firstName:'Taylor',lastName:'Sample',email:'taylor@example.test',phone:'2025550100',city:'Boston',state:'MA',country:'United States',postalCode:'02110',linkedinUrl:'https://example.test/taylor',websiteUrl:'https://example.test'},visualFeedback:visual,shouldContinue:()=>active});
    if(!active){visual.fail('Prefill stopped');return;}
    const privateResult=await fillConfirmedSensitiveAnswers(form,{confirmed:true,workAuthorization:'yes',requiresSponsorship:'yes',sexGender:'prefer_not_to_answer'},()=>active,visual);
    if(!active){visual.fail('Prefill stopped');return;}
    result.applicationScan=scanApplicationFields(form);
    visual.finish({filled:result.filled+privateResult.filled,skipped:result.applicationScan.unansweredRequired});
    paintPrefillCoverage(document.querySelector('#coverage')!,result);
    document.querySelector('#result')!.textContent=(result.filled+privateResult.filled)+' fields filled. Existing answers preserved. Nothing submitted.';
  }catch{visual.fail('Prefill paused');}finally{active=false;button.disabled=false;button.textContent='Prefill this application';}
});
form.addEventListener('submit',event=>event.preventDefault());
`},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env':'{}'}});
const html=`<!doctype html><html><head><meta charset="utf-8"><title>TrackMyOPT · Prefill motion test</title><style>
:root{--page:#f6f8fb;--tmo-widget-ink:#0f172a;--tmo-widget-text:#0f172a;--tmo-widget-muted:#64748b;--tmo-widget-surface:white;--tmo-widget-border:#e7eaf0;--tmo-color-success-ink:#166534;--tmo-color-warning-ink:#9a3412}*{box-sizing:border-box}body{margin:0;padding:32px;font:14px/1.5 system-ui;background:var(--page);color:var(--tmo-widget-ink)}main{display:grid;grid-template-columns:minmax(320px,620px) 360px;gap:40px;max-width:1040px;margin:auto}h1{font-size:26px;margin:0 0 8px}h2{font-size:16px}p{color:var(--tmo-widget-muted)}form{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:var(--tmo-widget-surface);border:1px solid var(--tmo-widget-border);padding:24px;border-radius:14px}label{display:block;font-size:12px;font-weight:600}input,select,textarea{display:block;margin-top:6px;width:100%;height:42px;padding:10px;border:1px solid #cbd5e1;border-radius:8px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit}.wide{grid-column:1/-1}aside{align-self:start;position:sticky;top:16px;border:1px solid var(--tmo-widget-border);border-radius:14px;background:var(--tmo-widget-surface);overflow:hidden}.header{background:#0f172a;color:white;padding:14px 18px;font-weight:700}.job{padding:18px}button{font:600 13px system-ui;cursor:pointer;padding:12px;border-radius:10px;border:1px solid var(--tmo-widget-border)}#prefill{display:block;width:calc(100% - 24px);margin:0 12px;background:#2563eb;color:white;border:0;min-height:46px;transition:transform 120ms cubic-bezier(.23,1,.32,1)}#prefill:active{transform:scale(.98)}#prefill:disabled{opacity:.75;cursor:wait}#coverage{padding:12px}#result{display:block;padding:12px;font-size:12px;color:var(--tmo-widget-muted)}.tests{padding:12px;border-top:1px solid var(--tmo-widget-border)}.tests label{display:flex;gap:8px;align-items:center;margin:8px 0}.tests input{width:16px;height:16px;margin:0}footer{padding:12px;text-align:center;border-top:1px solid var(--tmo-widget-border);font-size:12px;color:var(--tmo-widget-muted)}@media(max-width:800px){main{grid-template-columns:1fr}aside{position:static}}@media(prefers-reduced-motion:reduce){button{transition:none!important}}
</style></head><body><main><section><h1>Application prefill</h1><p>Local QA · synthetic answers only · no employer connection</p><form id="application-form">
<label>First Name<input name="firstName" required></label><label>Last Name<input name="lastName" required></label>
<label>Email<input name="email" type="email" required></label><label>Phone<input name="phone" type="tel" required></label>
<label>City<input name="city" required></label><label>State<select name="state"><option value="">Select</option><option value="MA">Massachusetts</option><option value="NY">New York</option></select></label>
<label>Country<select name="country"><option value="">Select</option><option value="US">United States</option><option value="CA">Canada</option></select></label><label>Postal Code<input name="postalCode"></label>
<label class="wide">LinkedIn Profile<input name="linkedin"></label><label class="wide">Website<input name="website" value="https://existing.example.test"></label>
<label class="wide">Are you authorized to work in the United States?<select name="auth" required><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select></label>
<label class="wide">Do you require sponsorship?<select name="sponsor" required><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select></label>
<label class="wide">Gender<select name="gender"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="decline">Prefer not to answer</option></select></label>
<label class="wide">Why this company?<textarea required></textarea></label></form></section><aside><header class="header">TrackMyOPT</header><div class="job"><h2>Data Analyst</h2><p>Example Company · Boston, MA</p></div><button id="prefill">Prefill this application</button><div class="tmo-prefill-progress-slot"></div><div id="coverage"></div><output id="result">Ready</output><div class="tests"><label><input id="reduced" type="checkbox">Reduced motion preview</label><label><input id="dark" type="checkbox">Dark theme preview</label><button id="reset">Reset test</button><button id="stop">Stop test</button></div><footer>Never submits · Review before sending</footer></aside></main><script src="/bundle.js"></script></body></html>`;
const server=createServer((req,res)=>{res.setHeader('Content-Security-Policy',"default-src 'self';style-src 'unsafe-inline';connect-src 'none'");res.setHeader('Content-Type',req.url==='/bundle.js'?'text/javascript':'text/html; charset=utf-8');res.end(req.url==='/bundle.js'?outputFiles[0].text:html);});
server.listen(0,'127.0.0.1',()=>console.log('Prefill motion preview: http://127.0.0.1:'+server.address().port));
