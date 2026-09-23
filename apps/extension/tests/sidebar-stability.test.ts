import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { shouldRefreshWidget, widgetJobSnapshot } from '../src/job-portal-job-helpers';
import { isWidgetInteractionInFlight } from '../src/job-portal-interaction-guard';
import { hardenInteractiveElements } from '../src/design/a11y';
import { createResumeStatusRow, paintResumeStatusRow } from '../src/resume-status-row';
import { paintPrefillButton } from '../src/job-portal-widget-ui';
import * as helpers from '../src/job-portal-job-helpers';
import { createJobTrackerWidget, setJobTrackerWidgetHost, disconnectWidgetViewportObserver, openAiAnalysisWithDescription, openResumeChooserWithDescription, openResumePanel } from '../src/job-portal-tracker-widget';
const { JSDOM } = createRequire(resolve('package.json'))('jsdom');
const job = {company_name:'Example',role_title:'Engineer',job_url:'https://jobs.lever.co/example/abc'};
const flush = () => new Promise(resolve=>setImmediate(resolve));
async function withDom(run: (w:any,messages:any[])=>void|Promise<void>) {
  const dom=new JSDOM('<body></body>',{url:job.job_url,pretendToBeVisual:true});
  const w=dom.window; const messages:any[]=[];
  const noop=()=>{};
  const overrides={window:w,document:w.document,location:w.location,sessionStorage:w.sessionStorage,HTMLElement:w.HTMLElement,Element:w.Element,fetch:async()=>({ok:false}),
    getComputedStyle:w.getComputedStyle.bind(w),requestAnimationFrame:noop,ResizeObserver:class{observe(){}disconnect(){}},
    chrome:{runtime:{getURL:(p:string)=>'/'+p,sendMessage:(message:any,callback:any)=>{messages.push({message,callback});return Promise.resolve({ok:false});}},storage:{local:{get:async()=>({}),set:async()=>{}},onChanged:{addListener:noop}}}};
  const old=Object.fromEntries(Object.keys(overrides).map(k=>[k,(globalThis as any)[k]]));Object.assign(globalThis,overrides);
  setJobTrackerWidgetHost({trackWidgetAnalytics:noop,trackWidgetAnalyticsOnce:noop,getArtifactStaleReason:()=>null,generatedResumeFor:()=>undefined,
    reconcileArtifactAvailabilityOnWidgetMount:async()=>{},paintGuidedStateUi:noop,trackerApplicationIdFor:()=>undefined,rememberTrackerApplicationId:noop,
    executeResolvedPrefill:async()=>{throw new Error('synthetic failure');},trackPrefillRuntimeFailure:noop} as any);
  try{await run(w,messages);}finally{disconnectWidgetViewportObserver();w.close();Object.assign(globalThis,old);}
}
test('late location and salary never require replacing a mounted sidebar',()=>withDom(w=>{
  const root=w.document.createElement('div');root.dataset.tmoJobSnapshot=JSON.stringify(widgetJobSnapshot(job));
  assert.equal(shouldRefreshWidget(root,{...job,location:'New York',salary_text:'$100,000'}),false);
}));
test('posting to apply URL and casing changes preserve the sidebar on Lever',()=>withDom(w=>{
  const root=w.document.createElement('div');root.dataset.tmoJobSnapshot=JSON.stringify(widgetJobSnapshot(job));
  assert.equal(shouldRefreshWidget(root,{...job,job_url:job.job_url+'/apply',company_name:'EXAMPLE',role_title:' Engineer '}),false);
  assert.equal(shouldRefreshWidget(root,{...job,job_url:'https://jobs.lever.co/example/other'}),true);
}));
test('Prefill and pending action states protect the sidebar during page mutations',()=>withDom(w=>{
  const root=createJobTrackerWidget(job,'expanded');w.document.body.append(root);
  root.querySelector('.tmo-prefill-button')!.setAttribute('aria-busy','true');
  assert.equal(isWidgetInteractionInFlight(),true);
}));
test('accessibility sweep does not create buttons inside buttons or on headings',()=>withDom(w=>{
  w.document.body.innerHTML='<button><span style="cursor:pointer">Prefill</span></button><div role="heading" style="cursor:pointer">Engineer</div><div style="cursor:pointer">Legacy action</div>';
  hardenInteractiveElements(w.document.body);
  assert.equal(w.document.querySelector('button [role="button"]'),null);
  assert.equal(w.document.querySelector('[role="heading"]').hasAttribute('tabindex'),false);
  assert.equal(w.document.querySelector('body > div:last-child').getAttribute('role'),'button');
}));
test('unchanged resume status causes no DOM replacement or announcements',()=>withDom(w=>{
  const row=createResumeStatusRow();paintResumeStatusRow(row,'none');
  const icon=row.querySelector('svg');const label=row.querySelector('.tmo-resume-status-label')!.firstChild;
  paintResumeStatusRow(row,'none');
  assert.equal(row.querySelector('svg'),icon);assert.equal(row.querySelector('.tmo-resume-status-label')!.firstChild,label);
}));
test('failed Prefill has visible recovery copy and releases its busy state',()=>withDom(async w=>{
  const root=createJobTrackerWidget(job,'expanded');w.document.body.append(root);
  const button=root.querySelector<HTMLButtonElement>('.tmo-prefill-button')!;button.click();await flush();
  assert.equal(button.disabled,false);assert.match(root.querySelector('.tmo-prefill-result-line')!.textContent!,/try again/i);
}));
test('analysis and resume chooser use the top layer above the sidebar',()=>withDom((w)=>{
  const root=createJobTrackerWidget(job,'expanded');w.document.body.append(root);const card=root.querySelector<HTMLElement>('.tmo-job-widget-card')!;
  w.HTMLElement.prototype.showPopover=function(){this.dataset.shown='true';};
  openAiAnalysisWithDescription(card,job,'');assert.equal(w.document.querySelector('#tmo-ai-analysis').getAttribute('popover'),'manual');
  w.document.querySelector('[aria-label="Close analysis"]').click();
  openResumeChooserWithDescription(card,job,[],'');assert.equal(w.document.querySelector('#tmo-resume-chooser').getAttribute('popover'),'manual');
}));
test('closed analysis ignores its late provider response',()=>withDom((w,messages)=>{
  const root=createJobTrackerWidget(job,'expanded');w.document.body.append(root);
  openAiAnalysisWithDescription(root.querySelector('.tmo-job-widget-card')!,job,'Responsibilities and qualifications for engineering. '.repeat(15));
  const overlay=w.document.querySelector('#tmo-ai-analysis');const before=overlay.textContent;
  w.document.querySelector('[aria-label="Close analysis"]').click();
  messages.find(m=>m.message.type==='ANALYZE_JOB_FIT').callback({ok:false,error:'not_signed_in'});
  assert.equal(overlay.textContent,before);
}));
test('metadata enrichment preserves tool DOM, expanded private answers and scroll',()=>withDom(w=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  const prefill=root.querySelector('.tmo-prefill-button');
  const privateToggle=root.querySelector<HTMLButtonElement>('[aria-controls="tmo-private-answers-body"]')!;privateToggle.click();
  const scroll=root.querySelector<HTMLElement>('.tmo-job-widget-scroll-body')!;scroll.scrollTop=120;
  root.dispatchEvent(new w.CustomEvent('tmo-job-enriched',{detail:{...job,location:'New York',salary_text:'$100,000'}}));
  assert.match(root.querySelector('.tmo-sidebar-job')!.textContent!,/New York/);
  assert.equal(root.querySelector('.tmo-prefill-button'),prefill);assert.equal(scroll.scrollTop,120);
  assert.equal(privateToggle.getAttribute('aria-expanded'),'true');
}));
test('private panel explicitly owns its background instead of inheriting portal section styles',()=>withDom(w=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  assert.equal(root.querySelector<HTMLElement>('.tmo-sensitive-answer-panel')!.style.background,'var(--tmo-widget-surface)');
  assert.equal(root.querySelector<HTMLElement>('.tmo-sidebar-job')!.style.background,'var(--tmo-widget-surface)');
}));
test('stale analysis response cannot show results on another job',()=>withDom((w,messages)=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  openAiAnalysisWithDescription(root.querySelector('.tmo-job-widget-card')!,job,'Responsibilities and qualifications for engineering. '.repeat(15));
  const overlay=w.document.querySelector('#tmo-ai-analysis');const before=overlay.textContent;
  w.history.pushState({},'','/example/another');
  messages.find(m=>m.message.type==='ANALYZE_JOB_FIT').callback({ok:false,error:'not_signed_in'});
  assert.equal(overlay.textContent,before);
}));
test('portal observer ignores extension-only updates but notices external page changes',()=>withDom(w=>{
  const fn=(helpers as any).hasPortalPageMutation;
  assert.equal(typeof fn,'function');
  const owned=w.document.createElement('div');owned.id='tmo-job-tracker-widget';const label=w.document.createElement('span');owned.append(label);w.document.body.append(owned);
  assert.equal(fn([{target:label,addedNodes:[w.document.createTextNode('Ready')],removedNodes:[]}]),false);
  assert.equal(fn([{target:w.document.body,addedNodes:[owned],removedNodes:[]}]),false);
  assert.equal(fn([{target:w.document.body,addedNodes:[w.document.createElement('form')],removedNodes:[]}]),true);
  owned.remove();
  assert.equal(fn([{target:w.document.body,addedNodes:[],removedNodes:[owned]}]),true,'a portal removing our root needs recovery');
}));
test('repeated Analyze clicks start only one request and late modal opening is blocked',()=>withDom(async(w,messages)=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  const analysis=Array.from(root.querySelectorAll('button')).find(b=>b.textContent?.includes('Analyze with AI'))!;
  analysis.click();analysis.click();
  assert.equal(analysis.getAttribute('aria-busy'),'true');
  w.history.pushState({},'','/example/another');await flush();
  assert.equal(w.document.querySelector('#tmo-ai-analysis'),null);
  assert.equal(analysis.disabled,false);
}));
test('late sidepanel failure must not open the old job resume chooser after navigation',()=>withDom(async(w,messages)=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  const generate=Array.from(root.querySelectorAll('button')).find(b=>b.textContent?.includes('Generate custom resume'))!;
  generate.click();generate.click();
  assert.equal(messages.filter(m=>m.message.type==='OPEN_SIDE_PANEL').length,1);
  w.history.pushState({},'','/example/another');messages.find(m=>m.message.type==='OPEN_SIDE_PANEL').callback({ok:false});await flush();
  assert.equal(w.document.querySelector('#tmo-resume-chooser'),null);
}));
test('a background resume check cannot replace the busy Prefill label',()=>withDom(w=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  const prefill=root.querySelector<HTMLButtonElement>('.tmo-prefill-button')!;
  prefill.setAttribute('aria-busy','true');prefill.querySelector('.tmo-action-label')!.textContent='Prefilling…';
  paintPrefillButton(prefill,true);assert.equal(prefill.querySelector('.tmo-action-label')!.textContent,'Prefilling…');
}));
test('analysis dialog closes on page-context change and releases its interaction guard',()=>withDom((w,messages)=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  messages.find(m=>m.message.type==='CHECK_JOB_SAVED')?.callback({ok:true,saved:false});
  openAiAnalysisWithDescription(root.querySelector('.tmo-job-widget-card')!,job,'');
  w.document.dispatchEvent(new w.Event('tmo-page-context-changed'));
  assert.equal(w.document.querySelector('#tmo-ai-analysis'),null);assert.equal(isWidgetInteractionInFlight(),false);
}));
test('analysis timeout replaces the spinner and ignores a later reply',()=>withDom((w,messages)=>{
  const timers=new Map();let id=0;w.setTimeout=(fn:any,ms:number)=>{timers.set(++id,{fn,ms});return id;};w.clearTimeout=(n:number)=>timers.delete(n);
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  openAiAnalysisWithDescription(root.querySelector('.tmo-job-widget-card')!,job,'Responsibilities and qualifications for engineering. '.repeat(15));
  [...timers.values()].find(t=>t.ms===45000).fn();
  const overlay=w.document.querySelector('#tmo-ai-analysis');const text=overlay.textContent;
  assert.doesNotMatch(text,/Scoring your resume/);
  messages.find(m=>m.message.type==='ANALYZE_JOB_FIT').callback({ok:true,matchScore:99});assert.equal(overlay.textContent,text);
}));
test('detached resume panel ignores a late generation result',()=>withDom((w,messages)=>{
  const root=createJobTrackerWidget({...job},'expanded');w.document.body.append(root);
  openResumePanel(root.querySelector('.tmo-job-widget-card')!,job,'resume','tech','Synthetic description');
  const panel=root.querySelector('.tmo-resume-panel')!;const before=panel.textContent;root.remove();
  messages.find(m=>m.message.type==='GENERATE_RESUME').callback({ok:false,error:'no_base_resume'});
  assert.equal(panel.textContent,before);
}));
for(const [portal,posting,apply] of [
 ['Greenhouse','https://boards.greenhouse.io/acme/jobs/4012345','https://job-boards.greenhouse.io/acme/jobs/4012345#app'],
 ['Ashby','https://jobs.ashbyhq.com/acme/8a7b6c5d-aaaa-bbbb-cccc-ddddeeeeffff','https://jobs.ashbyhq.com/acme/8a7b6c5d-aaaa-bbbb-cccc-ddddeeeeffff/application'],
 ['Workday','https://acme.wd5.myworkdayjobs.com/en-US/External/job/Boston/Engineer_R123','https://acme.wd5.myworkdayjobs.com/en-US/External/job/Boston/Engineer_R123/apply'],
 ['SmartRecruiters','https://jobs.smartrecruiters.com/Acme/744000012345678-engineer','https://jobs.smartrecruiters.com/Acme/744000012345678-engineer/apply'],
 ['iCIMS','https://careers-acme.icims.com/jobs/123/engineer/job','https://careers-acme.icims.com/jobs/123/engineer/job?mode=apply'],
 ['Workable','https://apply.workable.com/acme/j/AB12CD34EF/','https://apply.workable.com/acme/j/AB12CD34EF/apply/'],
])test(portal+' posting/apply transition keeps the sidebar',()=>withDom(w=>{
 const root=w.document.createElement('div');root.dataset.tmoJobSnapshot=JSON.stringify({...job,job_url:posting});
 assert.equal(shouldRefreshWidget(root,{...job,job_url:apply}),false);
}));
