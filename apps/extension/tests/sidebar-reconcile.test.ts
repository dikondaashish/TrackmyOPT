import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { shouldRefreshWidget, widgetJobSnapshot } from '../src/job-portal-job-helpers';
const requireLocal=createRequire(resolve('package.json'));
const {JSDOM}=requireLocal('jsdom');
const source=readFileSync('src/content-job-portal.ts','utf8');
const inject=source.slice(source.indexOf('async function injectOrRefreshButton()'),source.indexOf('\nfunction scheduleInject()'));
function harness(){
 const dom=new JSDOM('<body></body>',{url:'https://jobs.lever.co/example/one'});let job:any={company_name:'Example',role_title:'Engineer',job_url:dom.window.location.href};
 const waits:Array<(v:boolean)=>void>=[];const created:any[]=[];let now=0;
 const context:any={window:dom.window,document:dom.window.document,location:dom.window.location,CustomEvent:dom.window.CustomEvent,MutationObserver:dom.window.MutationObserver,
  Date:{now:()=>now},wireJobTrackerWidgetHost:()=>{},extAlive:()=>true,teardownWidgetRuntime:()=>{},getJobInfo:()=>job,invalidatePrivateApprovalForJob:()=>{},generatedResumeArtifactForCurrentJob:null,
  isWidgetInteractionInFlight:()=>false,WIDGET_ROOT_ID:'widget',isLinkedInJobSurface:()=>true,isApplicationSuccessPage:()=>false,saveJobContext:()=>{},generatedResumeFor:()=>{},readWidgetDismissedUrl:()=>null,
  isWidgetSuppressed:()=>new Promise(r=>waits.push(r)),getDefaultViewPref:async()=>'expanded',shouldRefreshWidget,
  createJobTrackerWidget:(j:any)=>{created.push(j);const root=dom.window.document.createElement('div');root.id='widget';root.dataset.tmoJobSnapshot=JSON.stringify(widgetJobSnapshot(j));return root;},
  hardenInteractiveElements:()=>{},ensureWidgetAnnouncer:()=>()=>{},scheduleInject:()=>{},disconnectWidgetViewportObserver:()=>{},captureJobDescription:()=>{},syncLinkedInEasyApplyAction:()=>{},
 };
 const code=requireLocal('esbuild').transformSync('let widgetRefreshRevision=0; let widgetMissingSince:number|null=null; let widgetA11yObserver:MutationObserver|null=null; let announceWidgetStatus;'+inject+';globalThis.inject=injectOrRefreshButton;',{loader:'ts'}).code;
 vm.runInNewContext(code,context);
 return {dom,context,waits,created,job:(v:any)=>job=v,time:(v:number)=>now=v,root:()=>dom.window.document.getElementById('widget')};
}
test('late async refresh cannot restore the previous job after SPA navigation',async()=>{
 const h=harness();try{
  const first=h.context.inject();h.dom.window.history.pushState({},'','/example/two');h.job({company_name:'Example',role_title:'Designer',job_url:h.dom.window.location.href});
  const second=h.context.inject();h.waits[1](false);await second;h.waits[0](false);await first;
  assert.equal(h.created.length,1);assert.equal(h.created[0].role_title,'Designer');
 }finally{h.dom.window.close();}
});
test('same-job refresh keeps tools in place and sends enrichment',async()=>{
 const h=harness();try{
  const first=h.context.inject();h.waits.shift()!(false);await first;
  const root=h.root()!;let enriched=false;root.addEventListener('tmo-job-enriched',()=>enriched=true);
  h.job({company_name:'Example',role_title:'Engineer',job_url:h.dom.window.location.href,location:'Boston'});
  const next=h.context.inject();h.waits.shift()!(false);await next;
  assert.equal(h.root(),root);assert.equal(enriched,true);
 }finally{h.dom.window.close();}
});
test('temporary empty scrape keeps panel briefly, persistent empty page removes it',async()=>{
 const h=harness();try{
  const first=h.context.inject();h.waits.shift()!(false);await first;const root=h.root();h.job(null);
  await h.context.inject();assert.equal(h.root(),root);
  h.time(2000);await h.context.inject();assert.equal(h.root(),null);
 }finally{h.dom.window.close();}
});
test('a genuinely different job replaces stale tools even while old work is busy',async()=>{
 const h=harness();try{
  const first=h.context.inject();h.waits.shift()!(false);await first;
  h.context.isWidgetInteractionInFlight=()=>true;h.dom.window.history.pushState({},'','/example/two');
  h.job({company_name:'Example',role_title:'Designer',job_url:h.dom.window.location.href});
  const next=h.context.inject();h.waits.shift()?.(false);await next;
  assert.equal(JSON.parse(h.root()!.dataset.tmoJobSnapshot!).role_title,'Designer');
 }finally{h.dom.window.close();}
});
