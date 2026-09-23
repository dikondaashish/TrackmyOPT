// Real private-answer panel and fill engine, synthetic answers, no outbound calls.
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const {outputFiles}=await build({
  stdin:{loader:'ts',resolveDir:fileURLToPath(new URL('../src',import.meta.url)),contents:`
    import {createSensitiveAnswerPanel} from './job-portal-sensitive-answer-panel';
    import {fillConfirmedSensitiveAnswers} from './sensitive-autofill';
    import {loadPrivateAnswersForPrefill} from './private-prefill-request';
    let requests=0;
    window.chrome={runtime:{sendMessage:async(message)=>{
      if(message.type!=='GET_PRIVATE_PREFILL_ANSWERS')throw new Error('Unexpected request');
      requests++;
      return {ok:true,data:{requiresSponsorship:'yes',workAuthorization:'no',sexGender:'prefer_not_to_answer'}};
    }}};
    const panel=createSensitiveAnswerPanel();
    document.querySelector('#panel').append(panel);
    const input=document.querySelector('#sponsor');
    input.onkeyup=event=>{
      if(event.code==='Escape'){document.getElementById('options')?.remove();input.setAttribute('aria-expanded','false');return;}
      if(event.code!=='ArrowDown'||document.getElementById('options'))return;
      input.setAttribute('aria-expanded','true');
      const list=document.createElement('div');list.id='options';list.setAttribute('role','listbox');
      ['Yes','No'].forEach((text,index)=>{const option=document.createElement('div');option.setAttribute('role','option');option.id='react-select-sponsorship-option-'+index;option.textContent=text;
        option.onclick=()=>{const selected=document.createElement('div');selected.className='select__single-value';selected.textContent=text;input.parentElement.prepend(selected);input.setAttribute('aria-expanded','false');list.remove();};list.append(option);
      });input.parentElement.append(list);
    };
    document.querySelector('#prefill').onclick=async()=>{
      const loaded=await loadPrivateAnswersForPrefill(()=>true);
      const result=await fillConfirmedSensitiveAnswers(document.querySelector('form'),loaded.answers);
      document.querySelector('#result').textContent=result.filled+' private fields filled · '+requests+' fetches';
      panel.dispatchEvent(new CustomEvent('tmo-private-prefill-status',{detail:loaded.status}));
    };
  `},
  plugins:[{name:'synthetic-job',setup(b){b.onLoad({filter:/job-posting-scrape\.ts$/},()=>({loader:'ts',contents:'export const getJobInfo=()=>({job_url:location.href,company_name:"Test Company",role_title:"Test role"});'}));}}],
  bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env':'{}'},
});
const server=createServer((req,res)=>{
  res.setHeader('Content-Security-Policy',"default-src 'self';style-src 'unsafe-inline';connect-src 'none'");
  res.setHeader('Content-Type',req.url==='/bundle.js'?'text/javascript':'text/html; charset=utf-8');
  res.end(req.url==='/bundle.js'?outputFiles[0].text:`<!doctype html><html><head><meta charset="utf-8"><title>Private prefill test</title><style>body{font:15px/1.5 system-ui;max-width:960px;margin:40px auto;color:#172b4d;background:#f5f8fc;--tmo-widget-border:#ccd5e0;--tmo-widget-surface:white;--tmo-widget-ink:#172b4d;--tmo-widget-muted:#475569;--tmo-widget-success-ink:#075d32;--tmo-widget-accent:#1460df;--tmo-color-on-accent:white}main{display:grid;grid-template-columns:1fr 360px;gap:32px}label{display:block;margin:14px 0 4px}input,select{font:inherit;padding:8px;border:1px solid #bcc9d8;border-radius:6px}button{padding:10px 16px;margin:8px 0}#panel{padding:16px;background:white;border:1px solid #ccd5e0;border-radius:12px}svg{width:16px;height:16px}output{display:block;margin:16px 0}.select__single-value{padding:8px;background:#e0f4e7}[role=option]{padding:8px;background:white;cursor:pointer}</style></head><body><h1>Private prefill regression test</h1><p>Synthetic answers only · no employer connection · no submission</p><main><section><form><label for="sponsor">Do you require sponsorship?</label><div class="select__value-container"><input id="sponsor" role="combobox" aria-controls="options" aria-expanded="false"></div><label for="auth">Are you authorized to work?</label><select id="auth"><option value="">Select</option><option value="1">No</option><option value="2">Yes</option></select><label for="gender">Gender</label><select id="gender"><option value="">Select</option><option value="3">Male</option><option value="4">Female</option><option value="5">Prefer not to answer</option></select></form><button id="prefill">Prefill test application</button><output id="result" role="status">Ready</output></section><aside id="panel"></aside></main><script src="/bundle.js"></script></body></html>`);
});
server.listen(0,'127.0.0.1',()=>console.log('Private prefill preview: http://127.0.0.1:'+server.address().port));
