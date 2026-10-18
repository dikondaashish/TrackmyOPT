import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const code = requireLocal('esbuild').buildSync({entryPoints:['src/prefill/sensitive-autofill.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;

const CONFIRMED_AT = new Date(Date.now() - 24 * 3600_000).toISOString();
const wording = (text: string) => text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
/** Applicant-confirmed answers; only these may answer authorization questions. */
function verified(entries: Record<string, { answer: string; wordings?: string[] }>) {
  return { meaningVersion: 1, ...Object.fromEntries(Object.entries(entries).map(([meaning, entry]) => [meaning,
    { answer: entry.answer, confirmedAt: CONFIRMED_AT, scope: 'united_states', confirmedWordings: (entry.wordings ?? []).map(wording) }])) };
}
/** The module runs in a vm realm; compare plain copies of its values. */
const plain = (value: unknown) => JSON.parse(JSON.stringify(value));
const sponsorship = (answer: string, question: string) => ({ confirmed: true, verifiedAuthorization: verified({ currentSponsorship: { answer, wordings: [question] } }) });

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
    assert.equal((await h.fill(h.document,sponsorship(answer,'Do you require sponsorship?'))).filled,1);
    assert.equal(input.getAttribute('aria-valuetext')?.toLowerCase(),answer);
  } finally {h.dom.window.close();}
});

for (const answer of ['yes','no']) test(`Ashby radio question uses saved ${answer} and emits a click`,async()=>{
 const h=harness('<fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title">Will you require sponsorship?</label><input type="radio" name="q" id="r0"><label for="r0">Yes</label><input type="radio" name="q" id="r1"><label for="r1">No</label><input type="radio" name="q" id="r2"><label for="r2">Not yet, but in future</label></fieldset>');
 try {let clicks=0;h.document.querySelectorAll('input').forEach((e:any)=>e.addEventListener('click',()=>clicks++));await h.fill(h.document,sponsorship(answer,'Will you require sponsorship?'));assert.equal(h.document.querySelector(':checked')?.id,answer==='yes'?'r0':'r1');assert.equal(clicks,1);
 await h.fill(h.document,sponsorship(answer==='yes'?'no':'yes','Will you require sponsorship?'));assert.equal(clicks,1);
 }finally{h.dom.window.close();}
});
test('Ashby unanswered and ambiguous private choices are never guessed',async()=>{
 const h=harness('<fieldset class="ashby-application-form-input-radio-group"><label class="ashby-application-form-question-title">Do you require sponsorship?</label><input type="radio" name="q" id="a"><label for="a">Yes, now</label><input type="radio" name="q" id="b"><label for="b">Yes, in future</label></fieldset>');
 try {assert.equal((await h.fill(h.document,{confirmed:true})).filled,0);assert.equal((await h.fill(h.document,sponsorship('yes','Do you require sponsorship?'))).filled,0);assert.equal(h.document.querySelector(':checked'),null);}finally{h.dom.window.close();}
});
test('LinkedIn radio choices use their visible Yes/No text and click the saved answers',async()=>{
 const question = (name:string,label:string) => `<div><p>${label}*</p><fieldset role="radiogroup"><div><div><input type="radio" name="${name}" aria-label="${label}"><label></label></div><div><p>Yes</p></div></div><div><div><input type="radio" name="${name}" aria-label="${label}"><label></label></div><div><p>No</p></div></div></fieldset></div>`;
 const h=harness(question('auth','Are you legally authorized to work in the United States?')+question('sponsor','Will you now, or in the future, require sponsorship for employment visa status?'));
 try {
  let clicks=0;h.document.querySelectorAll('input').forEach((input:any)=>input.addEventListener('click',()=>clicks++));
  // Legacy single answers are only proposals for these distinct questions.
  const legacy=await h.fill(h.document,{confirmed:true,workAuthorization:'yes',requiresSponsorship:'no'});
  assert.equal(legacy.filled,0);
  assert.deepEqual(plain(legacy.outcomes.map((o:any)=>[o.status,o.proposedAnswer?.split(' ')[0]])),[['needs_confirmation','Yes'],['needs_confirmation','No']]);
  assert.equal(clicks,0);
  // Both questions use bundled equivalent wordings of confirmed answers.
  const answers={confirmed:true,verifiedAuthorization:verified({currentWorkAuthorization:{answer:'yes'},currentSponsorship:{answer:'no'},futureSponsorship:{answer:'no'}})};
  assert.equal((await h.fill(h.document,answers)).filled,2);
  assert.equal(h.document.querySelector('input[name="auth"]:checked')?.parentElement?.parentElement?.textContent?.trim(),'Yes');
  assert.equal(h.document.querySelector('input[name="sponsor"]:checked')?.parentElement?.parentElement?.textContent?.trim(),'No');
  assert.equal(clicks,2);
  assert.equal((await h.fill(h.document,answers)).filled,0);
  assert.equal(clicks,2);
 }finally{h.dom.window.close();}
});
test('native private select labels outrank backend numeric values',async()=>{
  const h=harness('<label for="s">Do you require sponsorship?</label><select id="s"><option value="">Select</option><option value="1">No</option><option value="2">Yes</option></select>');
  try {await h.fill(h.document,sponsorship('yes','Do you require sponsorship?'));assert.equal(h.document.querySelector('select').value,'2');}finally{h.dom.window.close();}
});

test('private fields labelled only by aria-labelledby are recognized',async()=>{
  const h=harness('<span id="question">Do you require sponsorship?</span><select aria-labelledby="question"><option value="">Select</option><option value="no">No</option><option value="yes">Yes</option></select>');
  try {assert.equal((await h.fill(h.document,sponsorship('no','Do you require sponsorship?'))).filled,1);}finally{h.dom.window.close();}
});

test('saved but unapproved private answers never fill',async()=>{
  const h=harness('<label for="s">Do you require sponsorship?</label><select id="s"><option value="">Select</option><option value="yes">Yes</option></select>');
  try {assert.equal((await h.fill(h.document,{confirmed:false,requiresSponsorship:'yes'})).filled,0);assert.equal(h.document.querySelector('select').value,'');}finally{h.dom.window.close();}
});

test('already-filled private answers are preserved and not flagged unresolved',async()=>{
  const h=harness('<label for="s">Do you require sponsorship?</label><select id="s" required><option value="">Select</option><option value="yes" selected>Yes</option><option value="no">No</option></select>');
  try {const r=await h.fill(h.document,sponsorship('no','Do you require sponsorship?'));assert.equal(r.filled,0);assert.equal(r.unresolved.length,0);assert.equal(h.document.querySelector('select').value,'yes');}finally{h.dom.window.close();}
});

test('reworded questions show the actual question and wait for confirmation',async()=>{
  const h=harness('<label for="s">Do you need a visa sponsor to start this job?</label><select id="s" required><option value="">Select</option><option value="no">No</option><option value="yes">Yes</option></select>');
  try {
    const answers:any=sponsorship('no','Do you require sponsorship?');
    const saved:any[]=[];
    const r=await h.fill(h.document,answers,()=>true,undefined,{saveVerified:async(change:any)=>{saved.push(change);
      return verified({currentSponsorship:{answer:'no',wordings:['Do you require sponsorship?',change.question]}});}});
    assert.equal(r.filled,0);
    assert.equal(h.document.querySelector('select').value,'');
    const outcome=r.outcomes[0];
    assert.equal(outcome.status,'needs_confirmation');
    assert.equal(outcome.reason,'meaning_changed');
    assert.equal(outcome.question,'Do you need a visa sponsor to start this job?');
    assert.equal(await outcome.answerWith('no'),true);
    assert.deepEqual(plain(saved),[{action:'confirm',meaning:'currentSponsorship',answer:'no',question:'Do you need a visa sponsor to start this job?'}]);
    assert.equal(h.document.querySelector('select').value,'no');
  } finally {h.dom.window.close();}
});

test('compound questions, declarations, and paused capabilities are left to the applicant',async()=>{
  const h=harness('<label for="a">Are you legally authorized to work in the US without sponsorship?</label><select id="a" required><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select>'+
    '<label><input type="checkbox" id="c" required> I certify that I am authorized to work in the United States and require no sponsorship. Yes</label>');
  try {
    const answers={confirmed:true,verifiedAuthorization:verified({currentWorkAuthorization:{answer:'yes'},currentSponsorship:{answer:'no'}})};
    const r=await h.fill(h.document,answers);
    assert.equal(r.filled,0);
    assert.deepEqual(plain(r.outcomes.map((o:any)=>[o.status,o.reason])),[['user_only','compound_question'],['user_only','attestation']]);
    assert.equal((h.document.querySelector('#c') as HTMLInputElement).checked,false);
    const paused=await h.fill(h.document,answers,()=>true,undefined,{blockedCapabilities:new Set(['verifiedAuthorization'])});
    assert.equal(paused.outcomes[0].reason,'feature_paused');
    const allPaused=await h.fill(h.document,answers,()=>true,undefined,{blockedCapabilities:new Set(['privateAnswers'])});
    assert.deepEqual(plain(allPaused),{filled:0,unresolved:[],outcomes:[]});
  } finally {h.dom.window.close();}
});

test('answers past their review date are not reused until reconfirmed',async()=>{
  const h=harness('<label for="s">Are you legally authorized to work in the United States?</label><select id="s"><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select>');
  try {
    const answers:any={confirmed:true,verifiedAuthorization:verified({currentWorkAuthorization:{answer:'yes'}})};
    answers.verifiedAuthorization.currentWorkAuthorization.reviewBy='2020-01-01';
    const r=await h.fill(h.document,answers);
    assert.equal(r.filled,0);
    assert.equal(r.outcomes[0].reason,'answer_due_for_review');
  } finally {h.dom.window.close();}
});
