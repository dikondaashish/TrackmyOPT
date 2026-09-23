import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const code = requireLocal('esbuild').buildSync({entryPoints:['src/sensitive-autofill.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;

function harness(html: string) {
  const dom = new JSDOM(html, {url:'https://example.test/apply'});
  const win = dom.window;
  const module = {exports:{} as any};
  vm.runInNewContext(code, {module,exports:module.exports,document:win.document,window:win,HTMLElement:win.HTMLElement,HTMLInputElement:win.HTMLInputElement,HTMLTextAreaElement:win.HTMLTextAreaElement,HTMLSelectElement:win.HTMLSelectElement,Event:win.Event,setTimeout:win.setTimeout.bind(win)});
  return {dom,win,document:win.document,fill:module.exports.fillConfirmedSensitiveAnswers};
}

for (const order of [['Yes','No'],['No','Yes']]) for (const answer of ['yes','no']) test(`approved sponsorship selects visible ${answer}, ignoring numeric option IDs: ${order}`, async () => {
  const h = harness('<label for="sponsor">Do you require sponsorship?</label><div class="select__control"><div class="select__value-container"><input id="sponsor" role="combobox" aria-controls="answers" aria-required="true"></div></div>');
  const input = h.document.querySelector('input');
  input.addEventListener('keyup', (event: KeyboardEvent) => {
    if(event.key !== 'ArrowDown') return;
    input.setAttribute('aria-expanded','true');
    const list = h.document.createElement('div'); list.id='answers';
    order.forEach((label,index)=>{
      const option=h.document.createElement('div');option.id=`react-select-question_59196739-option-${index}`;option.setAttribute('role','option');option.textContent=label;
      option.onclick=()=>{input.setAttribute('aria-valuetext',label);list.remove();input.setAttribute('aria-expanded','false');};list.append(option);
    });h.document.body.append(list);
  });
  try {
    assert.equal((await h.fill(h.document,{confirmed:true,requiresSponsorship:answer})).filled,1);
    assert.equal(input.getAttribute('aria-valuetext')?.toLowerCase(),answer);
  } finally {h.dom.window.close();}
});

for (const answer of ['yes','no']) test(`Ashby radio question uses saved ${answer} and emits a click`,async()=>{
 const h=harness('<fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title">Will you require sponsorship?</label><input type="radio" name="q" id="r0"><label for="r0">Yes</label><input type="radio" name="q" id="r1"><label for="r1">No</label><input type="radio" name="q" id="r2"><label for="r2">Not yet, but in future</label></fieldset>');
 try {let clicks=0;h.document.querySelectorAll('input').forEach((e:any)=>e.addEventListener('click',()=>clicks++));await h.fill(h.document,{confirmed:true,requiresSponsorship:answer});assert.equal(h.document.querySelector(':checked')?.id,answer==='yes'?'r0':'r1');assert.equal(clicks,1);
 await h.fill(h.document,{confirmed:true,requiresSponsorship:answer==='yes'?'no':'yes'});assert.equal(clicks,1);
 }finally{h.dom.window.close();}
});
test('Ashby unanswered and ambiguous private choices are never guessed',async()=>{
 const h=harness('<fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title">Do you require sponsorship?</label><input type="radio" name="q" id="a"><label for="a">Yes, now</label><input type="radio" name="q" id="b"><label for="b">Yes, in future</label></fieldset>');
 try {assert.equal((await h.fill(h.document,{confirmed:true})).filled,0);assert.equal((await h.fill(h.document,{confirmed:true,requiresSponsorship:'yes'})).filled,0);assert.equal(h.document.querySelector(':checked'),null);}finally{h.dom.window.close();}
});
test('native private select labels outrank backend numeric values',async()=>{
  const h=harness('<label for="s">Do you require sponsorship?</label><select id="s"><option value="">Select</option><option value="1">No</option><option value="2">Yes</option></select>');
  try {await h.fill(h.document,{confirmed:true,requiresSponsorship:'yes'});assert.equal(h.document.querySelector('select').value,'2');}finally{h.dom.window.close();}
});

test('private fields labelled only by aria-labelledby are recognized',async()=>{
  const h=harness('<span id="question">Do you require sponsorship?</span><select aria-labelledby="question"><option value="">Select</option><option value="no">No</option><option value="yes">Yes</option></select>');
  try {assert.equal((await h.fill(h.document,{confirmed:true,requiresSponsorship:'no'})).filled,1);}finally{h.dom.window.close();}
});

test('saved but unapproved private answers never fill',async()=>{
  const h=harness('<label for="s">Do you require sponsorship?</label><select id="s"><option value="">Select</option><option value="yes">Yes</option></select>');
  try {assert.equal((await h.fill(h.document,{confirmed:false,requiresSponsorship:'yes'})).filled,0);assert.equal(h.document.querySelector('select').value,'');}finally{h.dom.window.close();}
});

test('already-filled private answers are preserved and not flagged unresolved',async()=>{
  const h=harness('<label for="s">Do you require sponsorship?</label><select id="s" required><option value="">Select</option><option value="yes" selected>Yes</option><option value="no">No</option></select>');
  try {const r=await h.fill(h.document,{confirmed:true,requiresSponsorship:'no'});assert.equal(r.filled,0);assert.equal(r.unresolved.length,0);assert.equal(h.document.querySelector('select').value,'yes');}finally{h.dom.window.close();}
});
