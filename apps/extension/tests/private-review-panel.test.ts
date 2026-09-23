import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const requireLocal=createRequire(resolve('package.json'));
const {JSDOM}=requireLocal('jsdom');
const code=requireLocal('esbuild').buildSync({entryPoints:['src/job-portal-sensitive-answer-panel.ts'],bundle:true,write:false,format:'cjs',platform:'node',define:{'process.env':'{}'}}).outputFiles[0].text;
test('private answer panel explains one-click prefill without an approval gate or decrypted values',()=>{
  const dom=new JSDOM('<body></body>',{url:'https://example.test/jobs/1'});
  let requests=0;
  const module={exports:{} as any};
  vm.runInNewContext(code,{module,exports:module.exports,document:dom.window.document,window:dom.window,chrome:{runtime:{sendMessage:()=>requests++}}});
  try {
    const panel=module.exports.createSensitiveAnswerPanel({job_url:dom.window.location.href},{});
    dom.window.document.body.append(panel);
    assert.doesNotMatch(panel.textContent,/Review required|Review and use|approve/i);
    assert.match(panel.textContent,/Prefill this application/);
    assert.equal(panel.querySelectorAll('input,select,textarea').length,0);
    panel.querySelector('button').click();
    assert.equal(requests,0,'opening the explanation never fetches private values');
  } finally {dom.window.close();}
});
