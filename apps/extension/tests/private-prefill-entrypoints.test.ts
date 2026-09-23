import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {createPrivateApprovalBinding,approvalMatchesJob} from '../src/private-approval-session';
import {emptyPrefillCoverage} from '../src/prefill-coverage';
import {normalizeAutofillPreferences,AUTOFILL_PREFERENCES_KEY} from '../src/autofill-preferences';
const req=createRequire(resolve('package.json'));
const {JSDOM}=req('jsdom');
const source=readFileSync('src/content-job-portal.ts','utf8');
const widgetCode=req('esbuild').transformSync(source.slice(source.indexOf('async function executeResolvedPrefill('),source.indexOf('function trackPrefillExecution('))+'\nglobalThis.run=executeResolvedPrefill;',{loader:'ts'}).code;
function harness(){
  const dom=new JSDOM('<form><input aria-label="Email"></form><section class="tmo-sensitive-answer-panel"></section>',{url:'https://jobs.example.test/1'});
  let job={job_url:dom.window.location.href,company_name:'Example',role_title:'Engineer'};
  let requests=0;let saved='yes';const fills:any[]=[];const relays:any[]=[];const visualEvents:string[]=[];
  const ctx:any={window:dom.window,document:dom.window.document,CustomEvent:dom.window.CustomEvent,
    withPrefillUndo:(run:()=>Promise<unknown>)=>run(),isPrefillUndoAllowed:()=>true,
    currentPrefillUndoRunId:()=> 'fixture-run',markPrefillUndoDelegated:()=>{},getPrefillUndoState:()=>({}),
    mountPrefillUndoFallback:()=>{},requestPrefillUndo:()=>{},
    continuousPrefillGeneration:0,currentAutofillPreferences:{mode:'continuous'},currentPlanEntitlements:{continuousMode:true},
    sensitiveAnswerSession:{confirmed:false},privateApprovalBinding:null,
    jobContextFor:(j:any)=>({jobUrl:j.job_url,companyName:j.company_name,roleTitle:j.role_title}),getJobInfo:()=>job,
    createPrivateApprovalBinding,approvalMatchesJob,
    clearPrivateApplicationApproval:()=>{ctx.sensitiveAnswerSession={confirmed:false};ctx.privateApprovalBinding=null;},
    invalidatePrivateApprovalForJob:(j:any)=>{if(ctx.privateApprovalBinding&&!approvalMatchesJob(ctx.privateApprovalBinding,ctx.jobContextFor(j)))ctx.clearPrivateApplicationApproval();},
    loadPrivateAnswersForPrefill:async()=>{requests++;return {status:'ready',answers:{confirmed:true,requiresSponsorship:saved}};},
    prefillSavedPortalLogin:async()=>({status:'skipped',totalFilled:0}),
    runPrefill:async()=>emptyPrefillCoverage(),emptyPrefillCoverage,
    createAutofillVisualFeedback:()=>({finish:()=>visualEvents.push('finish'),fail:()=>visualEvents.push('fail')}),
    fillConfirmedSensitiveAnswers:async(_root:any,answers:any,allowed:()=>boolean)=>{if(allowed())fills.push(answers);visualEvents.push('private');return {filled:0,unresolved:[]};},
    findApplicationForm:()=>dom.window.document.querySelector('form'),scanApplicationFields:()=>({}),
    AUTOFILL_FEATURE_FLAGS:{skills:false},markCurrentArtifactInvalid:()=>{},
    chrome:{runtime:{sendMessage:async(m:any)=>{if(m.type==='PREFILL_CHILD_FRAMES'){relays.push(m);return {}; }return {ok:true,source:'profile_only',reason:'missing',profileFallback:{}};}}},
  };
  vm.runInNewContext(widgetCode,ctx);
  return {dom,ctx,fills,relays,visualEvents,requests:()=>requests,setSaved:(value:string)=>{saved=value;},run:(mode:string)=>ctx.run(job,mode,undefined,mode==='step_by_step'),runAutomatic:()=>ctx.run(job,'step_by_step'),changeJob:()=>{job={...job,role_title:'Different role'};}};
}
test('portal credentials are requested only on explicit sidebar Prefill, never Continuous or resume-ready',async()=>{
  const h=harness();try{
    let calls=0;h.ctx.prefillSavedPortalLogin=async()=>{calls++;return {status:'filled',totalFilled:3};};
    await h.runAutomatic();await h.run('continuous');assert.equal(calls,0);
    await h.run('step_by_step');assert.equal(calls,1);
    assert.equal(JSON.stringify(h.relays).includes('password'),false);
  }finally{h.dom.window.close();}
});
test('manual progress finishes only after the saved private-answer phase',async()=>{
  const h=harness();try{await h.run('step_by_step');assert.deepEqual(h.visualEvents,['private','finish']);}finally{h.dom.window.close();}
});
test('sidebar smart answers run after private fill only on an explicit click',async()=>{
  const h=harness();try{
    let calls=0;h.ctx.AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts=true;
    h.ctx.runSmartAnswers=async(options:any)=>{assert.equal(options.hasResume,false);assert.equal(options.shouldContinue(),true);calls++;h.visualEvents.push('smart');return 0;};
    await h.run('step_by_step');assert.deepEqual(h.visualEvents,['private','smart','finish']);
    await h.run('continuous');await h.runAutomatic();assert.equal(calls,1);
  }finally{h.dom.window.close();}
});
test('resume-ready automatic prefill never loads private answers without a Prefill click',async()=>{
  const h=harness();try{
    await h.runAutomatic();assert.equal(h.requests(),0);assert.equal(h.fills[0].confirmed,false);
  }finally{h.dom.window.close();}
});
test('sidebar manual Prefill fetches saved answers each click and relays them without another approval',async()=>{
  const h=harness();try{
    await h.run('step_by_step');assert.equal(h.requests(),1);assert.equal(h.fills[0].requiresSponsorship,'yes');assert.equal(h.relays[0].prefill.sensitiveAnswers.requiresSponsorship,'yes');
    h.setSaved('no');await h.run('step_by_step');assert.equal(h.requests(),2);assert.equal(h.fills[1].requiresSponsorship,'no');
  }finally{h.dom.window.close();}
});
test('Continuous never fetches private answers on page load and only reuses the clicked application',async()=>{
  const h=harness();try{
    await h.run('continuous');assert.equal(h.requests(),0);assert.equal(h.fills[0].confirmed,false);
    await h.run('step_by_step');await h.run('continuous');assert.equal(h.requests(),1);assert.equal(h.fills[2].requiresSponsorship,'yes');
    h.changeJob();await h.run('continuous');assert.equal(h.fills[3].confirmed,false);assert.equal(h.requests(),1);
  }finally{h.dom.window.close();}
});
test('sidebar navigation during private fetch stops before filling or relaying answers',async()=>{
  const h=harness();try{
    h.ctx.loadPrivateAnswersForPrefill=async()=>{h.dom.window.history.pushState({},'', '/other');return {status:'ready',answers:{confirmed:true,requiresSponsorship:'yes'}};};
    await assert.rejects(h.run('step_by_step'),/Prefill stopped/);assert.equal(h.fills.length,0);assert.equal(h.relays.length,0);
  }finally{h.dom.window.close();}
});
test('same-URL job replacement during private fetch stops before delivery',async()=>{
  const h=harness();try{
    h.ctx.loadPrivateAnswersForPrefill=async()=>{h.changeJob();return {status:'ready',answers:{confirmed:true,requiresSponsorship:'yes'}};};
    await assert.rejects(h.run('step_by_step'),/Prefill stopped/);assert.equal(h.relays.length,0);
  }finally{h.dom.window.close();}
});
test('private-load failure still permits profile prefill and exposes retry guidance',async()=>{
  const h=harness();try{
    let state='';h.dom.window.document.querySelector('section').addEventListener('tmo-private-prefill-status',(e:any)=>{state=e.detail;});
    h.ctx.loadPrivateAnswersForPrefill=async()=>({status:'unavailable',answers:{confirmed:false}});
    await h.run('step_by_step');assert.equal(state,'unavailable');assert.equal(h.fills[0].confirmed,false);
  }finally{h.dom.window.close();}
});
test('popup Prefill uses the same saved-private-answer loader and fills after the profile',async()=>{
  const h=harness();try{
    const popup=readFileSync('src/easy-apply-fill.ts','utf8');
    const code=req('esbuild').transformSync(popup.slice(popup.indexOf('const isTopFrame')),{loader:'ts'}).code;
    h.ctx.AUTOFILL_PREFERENCES_KEY=AUTOFILL_PREFERENCES_KEY;h.ctx.normalizeAutofillPreferences=normalizeAutofillPreferences;
    h.ctx.chrome.storage={sync:{get:async()=>({})}};
    vm.runInNewContext(code,h.ctx);await new Promise(resolve=>setImmediate(resolve));
    assert.equal(h.requests(),1);assert.equal(h.fills[0].requiresSponsorship,'yes');assert.equal(h.relays[0].prefill.sensitiveAnswers.requiresSponsorship,'yes');
  }finally{h.dom.window.close();}
});
