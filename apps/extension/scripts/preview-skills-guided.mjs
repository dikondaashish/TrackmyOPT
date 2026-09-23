// Local-only verification: real skills engine and navigation guard, mock profile.
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const { outputFiles } = await build({ stdin: { loader:'ts', resolveDir:fileURLToPath(new URL('../src',import.meta.url)),contents:`
  import { runPrefill } from './easy-apply-engine';
  import { runGuidedNavigation } from './guided-autopilot';
  let clicks=0; let clicked=new WeakSet();
  function reset(){
    clicks=0;clicked=new WeakSet();document.querySelector('#clicks').textContent='Navigation clicks: 0';document.querySelector('#result').textContent='Ready';
    const scenario=document.querySelector('#scenario').value;
    document.querySelector('#application-form').innerHTML=
      '<label>Skills<input aria-label="Skills"></label><label>Technical skills<textarea aria-label="Technical skills"></textarea></label><label>Skills you already entered<input aria-label="Skills" value="My existing skills"></label><label>Describe your skills<textarea aria-label="Describe your skills"></textarea></label>'+
      (scenario==='invalid'?'<label>Email<input aria-label="Email" type="email" required value="invalid"></label>':'')+
      (scenario==='review'?'<h2>Review application</h2>':'')+
      '<button type="'+(scenario==='typed-submit'?'submit':'button')+'">Next</button>'+
      (scenario==='final'?'<button type="button">Submit</button>':'');
    document.querySelector('form').onsubmit=e=>e.preventDefault();
    document.querySelectorAll('form button').forEach(button=>button.onclick=()=>{document.querySelector('#clicks').textContent='Navigation clicks: '+(++clicks);});
  }
  document.querySelector('#scenario').onchange=reset;
  document.querySelector('#reset').onclick=reset;
  document.querySelector('#prefill').onclick=async()=>{
    await runPrefill({quietResultToast:true,autofillSkills:document.querySelector('#skills').checked,profileFallback:{firstName:'Test'},snapshot:document.querySelector('#resume').checked?{contact:{},skills:['TypeScript','React','typescript']}:undefined,featureFlags:{historyFields:false}});
    document.querySelector('#result').textContent='Prefill complete';
  };
  document.querySelector('#guided').onclick=()=>{const result=runGuidedNavigation(document.querySelector('form'),clicked);document.querySelector('#result').textContent=result.outcome;};reset();
`},bundle:true,write:false,platform:'browser',format:'iife'});
const server=createServer((req,res)=>{
  if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy',"default-src 'self';style-src 'self' 'unsafe-inline';connect-src 'none'");
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Skills and Guided safety test</title><style>body{font:16px system-ui;max-width:800px;margin:30px auto}label{display:block;margin:12px 0}input,textarea,button,select{padding:10px;margin:6px}input,textarea{border:1px solid #bbb}#result{font-weight:700}</style><h1>Skills and Guided safety test</h1><p>Local fixture. Synthetic skills only. No real submissions.</p><label><input id="skills" type="checkbox">Fill dedicated skills fields</label><label><input id="resume" type="checkbox" checked>Current-job generated resume available</label><label>Navigation scenario<select id="scenario"><option value="safe">Safe Next</option><option value="final">Next before Submit</option><option value="review">Review step</option><option value="invalid">Invalid email</option><option value="typed-submit">Submit-typed Next</option></select></label><button id="prefill">Run Prefill</button><button id="guided">Run Guided safety check</button><button id="reset">Reset test</button><p id="result" role="status"></p><p id="clicks"></p><form id="application-form"></form><script src="/bundle.js"></script>`);
});
server.listen(0,'127.0.0.1',()=>console.log('Skills / Guided fixture: http://127.0.0.1:'+server.address().port));
