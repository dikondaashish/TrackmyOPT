import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {emptyPrefillCoverage,formatPrefillCoverageSummary} from '../src/prefill-coverage';
const req=createRequire(resolve('package.json'));
const {JSDOM}=req('jsdom');
const bundle=req('esbuild').buildSync({entryPoints:['src/autofill-visual-feedback.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
const engineBundle=req('esbuild').buildSync({entryPoints:['src/easy-apply-engine.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
test('review summary reflects the final scan after private answers fill',()=>{
  const result=emptyPrefillCoverage();result.skipped=3;
  result.applicationScan={requiredFilled:7,requiredTotal:8,requiredPercent:88,unansweredRequired:1,required:[],optional:[],optionalTotal:0};
  assert.match(formatPrefillCoverageSummary(result),/1 need you/);
  assert.doesNotMatch(formatPrefillCoverageSummary(result),/3 need you/);
});
function fixture(reduced=false){
  const dom=new JSDOM('<div class="tmo-prefill-progress-slot"></div><input value="Existing"><input>',{url:'https://example.test/apply'});
  dom.window.matchMedia=()=>({matches:reduced});
  const timers:Array<()=>void>=[];
  dom.window.setTimeout=(fn:()=>void)=>{timers.push(fn);return timers.length;};
  dom.window.clearTimeout=()=>{};
  const module={exports:{} as any};vm.runInNewContext(bundle,{module,exports:module.exports});
  return {dom,doc:dom.window.document,api:module.exports,flush:()=>{const queued=timers.splice(0);queued.forEach(fn=>fn());}};
}
test('field preparation is visual only, never changes values or focus',async()=>{
  const f=fixture();try{
    const field=f.doc.querySelector('input');const visual=f.api.createAutofillVisualFeedback(f.doc);
    const ready=visual.prepareField(field,'contact');
    assert.equal(field.getAttribute('data-tmo-autofill-visual'),'filling');assert.equal(field.value,'Existing');
    assert.notEqual(f.doc.activeElement,field);f.flush();await ready;
  }finally{f.dom.window.close();}
});
test('progress uses the sidebar slot and never invents a completion percentage',()=>{
  const f=fixture();try{
    f.api.createAutofillVisualFeedback(f.doc);
    const host=f.doc.getElementById('tmo-autofill-progress');assert.equal(host.parentElement.className,'tmo-prefill-progress-slot');
    assert.equal(host.shadowRoot.querySelector('[role=progressbar]').hasAttribute('aria-valuenow'),false);
  }finally{f.dom.window.close();}
});
test('a failed run cannot be repainted as filling by queued field feedback',async()=>{
  const f=fixture();try{
    const v=f.api.createAutofillVisualFeedback(f.doc);const fields=f.doc.querySelectorAll('input');
    v.markFieldFilled(fields[0],'contact');v.markFieldFilled(fields[1],'contact');
    const host=f.doc.getElementById('tmo-autofill-progress');v.fail('Prefill stopped');f.flush();await Promise.resolve();
    assert.equal(host.shadowRoot.querySelector('.shell').dataset.state,'error');
    assert.notEqual(fields[1].getAttribute('data-tmo-autofill-visual'),'filled');
  }finally{f.dom.window.close();}
});
test('replaced runs cannot flash fields after a new run starts',()=>{
  const f=fixture();try{
    const first=f.api.createAutofillVisualFeedback(f.doc);const fields=f.doc.querySelectorAll('input');
    first.markFieldFilled(fields[0],'contact');first.markFieldFilled(fields[1],'contact');
    f.api.createAutofillVisualFeedback(f.doc);f.flush();
    assert.notEqual(fields[1].getAttribute('data-tmo-autofill-visual'),'filled');
  }finally{f.dom.window.close();}
});
test('reduced motion skips field pacing and keeps all data unchanged',async()=>{
  const f=fixture(true);try{
    const v=f.api.createAutofillVisualFeedback(f.doc);const field=f.doc.querySelector('input');
    await v.prepareField(field,'contact');assert.equal(field.value,'Existing');
    assert.equal(f.doc.getElementById('tmo-autofill-progress').getAttribute('data-motion'),'reduced');
  }finally{f.dom.window.close();}
});
for(const action of ['edit','cancel','disable'] as const)test(`paced prefill respects ${action} while the field is highlighted`,async()=>{
  const dom=new JSDOM('<form id="application-form"><label for="name">First Name</label><input id="name"><button type="submit">Submit</button></form>',{url:'https://example.test/apply'});
  try{
    const {document}=dom.window;const field=document.querySelector('input');let active=true;let submits=0;
    document.querySelector('form').addEventListener('submit',()=>submits++);
    dom.window.HTMLElement.prototype.getBoundingClientRect=()=>({width:100,height:30,top:0,left:0,right:100,bottom:30});
    const observer=new dom.window.MutationObserver(()=>{
      if(field.getAttribute('data-tmo-autofill-visual')!=='filling')return;
      if(action==='edit')field.value='My own answer';
      if(action==='cancel')active=false;
      if(action==='disable')field.disabled=true;
    });observer.observe(field,{attributes:true,attributeFilter:['data-tmo-autofill-visual']});
    const module={exports:{} as any};
    vm.runInNewContext(engineBundle,{module,exports:module.exports,document,window:dom.window,HTMLElement:dom.window.HTMLElement,HTMLInputElement:dom.window.HTMLInputElement,HTMLTextAreaElement:dom.window.HTMLTextAreaElement,HTMLSelectElement:dom.window.HTMLSelectElement});
    await module.exports.runPrefill({profileFallback:{firstName:'Saved name'},shouldContinue:()=>active});
    assert.equal(field.value,action==='edit'?'My own answer':'');assert.equal(submits,0);observer.disconnect();
  }finally{dom.window.close();}
});
