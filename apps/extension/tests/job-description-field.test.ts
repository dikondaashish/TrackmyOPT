import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const req=createRequire(resolve('package.json'));
const {JSDOM}=req('jsdom');
const code=req('esbuild').buildSync({entryPoints:['src/job-description-field.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
const posting='Responsibilities: Build SQL dashboards and analyze data with the team. Qualifications: Three years of experience with data analysis. Benefits include health insurance and paid time off. '.repeat(3);
function setup(t:any,initial:any,onRetry:any=async()=>initial){
  const dom=new JSDOM('');t.after(()=>dom.window.close()); const module={exports:{} as any};let changes=0;
  vm.runInNewContext(code,{module,exports:module.exports,document:dom.window.document,window:dom.window,HTMLElement:dom.window.HTMLElement,URL});
  const field=module.exports.jobDescriptionField({initial,onRetry,onChange:()=>changes++,onOpenOverview:()=>{}});
  dom.window.document.body.append(field.node);return{field,w:dom.window,changes:()=>changes};
}
test('invalid content is hidden and recovery actions explain the blocked state',t=>{
  const h=setup(t,{text:'body { overflow: hidden; display: flex; } '.repeat(80),source:'current_page',sourceUrl:'https://example.test/job/1'});
  assert.equal(h.field.input.value,'');assert.equal(h.field.isValid(),false);
  assert.match(h.field.node.textContent,/Retry/);assert.match(h.field.node.textContent,/Open job overview/);assert.match(h.field.node.textContent,/Paste description/);
});
test('editing description updates validity and labels it as user-provided',t=>{
  const h=setup(t,{text:'',source:'unavailable',sourceUrl:''});
  h.field.input.value=posting;h.field.input.dispatchEvent(new h.w.Event('input'));
  assert.equal(h.field.isValid(),true);assert.match(h.field.node.textContent,/Provided by you/);assert.equal(h.changes(),1);
});
test('valid description starts collapsed, missing description stays open for recovery',t=>{
  const valid=setup(t,{text:posting,source:'current_page',sourceUrl:'https://example.test/job/1'});
  assert.equal(valid.field.node.querySelector('details').open,false);
  const missing=setup(t,{text:'',source:'unavailable',sourceUrl:''});
  assert.equal(missing.field.node.querySelector('details').open,true);
});
test('late retrieval never replaces text the user pasted while waiting',async t=>{
  let resolveRetry:any;const h=setup(t,{text:'',source:'unavailable',sourceUrl:''},()=>new Promise(r=>resolveRetry=r));
  const retry=[...h.field.node.querySelectorAll('button')].find((b:any)=>b.textContent==='Retry') as HTMLButtonElement;retry.click();
  h.field.input.value=posting;h.field.input.dispatchEvent(new h.w.Event('input'));
  resolveRetry({text:posting+' different',source:'original_listing',sourceUrl:'https://example.test/job/1'});
  await new Promise(r=>setImmediate(r)); assert.equal(h.field.input.value,posting);
});
