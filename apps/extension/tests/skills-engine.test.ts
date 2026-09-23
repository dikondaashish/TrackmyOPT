import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const code = requireLocal('esbuild').buildSync({entryPoints:['src/easy-apply-engine.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
for(const [name,enabled,snapshot] of [['off',false,true],['enabled',true,true],['no job snapshot',true,false]] as const) test(`real skills engine: ${name}`,async()=>{
  const dom = new JSDOM('<form id="application-form"><input aria-label="Skills"><textarea aria-label="Technical skills"></textarea><input aria-label="Skills" value="My own answer"><textarea aria-label="Describe your skills"></textarea><input role="combobox" aria-label="Skills"><input aria-label="Are you eligible to use Python skills?"></form>',{url:'https://example.test/apply'});
  dom.window.HTMLElement.prototype.getBoundingClientRect=()=>({width:120,height:30,top:0,left:0,right:120,bottom:30,x:0,y:0,toJSON(){return {};}});
  const module={exports:{} as any};
  try {
    vm.runInNewContext(code,{module,exports:module.exports,document:dom.window.document,window:dom.window,HTMLElement:dom.window.HTMLElement,HTMLInputElement:dom.window.HTMLInputElement,HTMLTextAreaElement:dom.window.HTMLTextAreaElement,HTMLSelectElement:dom.window.HTMLSelectElement});
    await module.exports.runPrefill({autofillSkills:enabled,profileFallback:{firstName:'Test'},snapshot:snapshot?{contact:{},skills:['TypeScript',' React ','typescript']}:undefined,quietResultToast:true,featureFlags:{historyFields:false}});
    const fields=[...dom.window.document.querySelectorAll('input,textarea')]; const expected=enabled&&snapshot?'TypeScript, React':'';
    assert.deepEqual(fields.map((e:any)=>e.value),[expected,expected,'My own answer','','','']);
  }finally{dom.window.close();}
});
