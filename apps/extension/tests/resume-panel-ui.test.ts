import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import vm from 'node:vm';
const req=createRequire(resolve('package.json'));
const {JSDOM}=req('jsdom');
const code=req('esbuild').buildSync({entryPoints:['src/agent/run-console.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
function setup(t:any){
 const dom=new JSDOM(''); t.after(()=>dom.window.close());const module={exports:{} as any};
 vm.runInNewContext(code,{module,exports:module.exports,document:dom.window.document,window:dom.window,setTimeout,clearTimeout});
 const console=module.exports.runConsole();dom.window.document.body.append(console.node);return console;
}
test('long run detail is below the step label instead of squeezing it sideways',t=>{
 const c=setup(t);c.setState('running',[{id:'load_resume',label:'Loading your résumé',status:'done',detail:'resume_'+'LongName_'.repeat(40)+'.pdf'}]);
 const row=c.node.querySelector('[data-step="load_resume"]');
 assert.equal(row.style.display,'grid');assert.equal(row.querySelector('[data-step-detail]').style.overflowWrap,'anywhere');
});
test('successful run does not leave optional formatting looking unfinished',t=>{
 const c=setup(t);c.setState('succeeded',[{id:'repair',label:'Fixing formatting',status:'pending'},{id:'package',label:'Packaging result',status:'done'}]);
 assert.equal(c.node.querySelector('[data-step="repair"]'),null);
 assert.match(c.node.textContent,/Done/);
});
test('skipped extraction explicitly says manual review is needed',t=>{
 const c=setup(t);c.setState('succeeded',[{id:'extract',label:'Reading fields for autofill',status:'skipped',detail:'not available'}]);
 assert.match(c.node.textContent,/Review form fields manually/);
});
