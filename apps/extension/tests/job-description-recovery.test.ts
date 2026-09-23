import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { chooseJobDescriptionCandidate, looksLikeRealJobPostingText, jobDescriptionCacheKey } from '../src/job-description';

const local = createRequire(resolve('package.json'));
const { JSDOM } = local('jsdom');
const code = local('esbuild').buildSync({entryPoints:['src/job-description-scrape.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
const posting = 'Senior Data Analyst. Responsibilities: Build SQL dashboards and analyze product performance with the team. Qualifications: Three years of analytics experience and strong communication skills. Benefits include health insurance and paid time off. '.repeat(3).trim();
const css = 'body { overflow: hidden; } .center { align-items: center; display: flex; height: 100vh; } @keyframes spin { from { opacity: 0; } to { opacity: 1; } } '.repeat(12);
const url = 'https://jobs.ashbyhq.com/acme/11111111-1111-1111-1111-111111111111/application?jr_id=tracking';
function setup(t:any, html:string, options:{url?:string; store?:Record<string,unknown>; fetch?:typeof fetch}={}) {
  const dom = new JSDOM(html,{url:options.url || url}); t.after(()=>dom.window.close());
  const module={exports:{} as any}; const store=options.store || {};
  vm.runInNewContext(code,{module,exports:module.exports,window:dom.window,document:dom.window.document,DOMParser:dom.window.DOMParser,sessionStorage:dom.window.sessionStorage,URL,Date,AbortSignal,fetch:options.fetch || (async()=>({ok:false})),chrome:{storage:{local:{get:async(key:string)=>key?{[key]:store[key]}:{...store},set:async(v:object)=>Object.assign(store,v),remove:async(keys:string|string[])=>{for(const key of [keys].flat()) delete store[key];}}}}});
  return {api:module.exports,store,w:dom.window};
}
function metadata(id='11111111-1111-1111-1111-111111111111') {
  return `<script type="application/ld+json">${JSON.stringify({'@type':'JobPosting',identifier:{value:id},title:'Senior Data Analyst',description:`<p>${posting}</p>`,hiringOrganization:{name:'Acme'}})}</script>`;
}
test('CSS and long application/loading content never qualify as a job description',()=>{
  assert.equal(looksLikeRealJobPostingText(css),false);
  assert.equal(chooseJobDescriptionCandidate([{source:'listing',text:css}]),'');
  assert.equal(chooseJobDescriptionCandidate([{source:'outer',text:'Loading please wait '.repeat(120)}]),'');
});
test('validated real posting beats higher-priority CSS',()=>{
  assert.equal(chooseJobDescriptionCandidate([{source:'listing',text:css},{source:'specific',text:posting}]),posting);
});
test('tracking parameters and application routes share a key, different jobs do not',()=>{
  assert.equal(jobDescriptionCacheKey(url),jobDescriptionCacheKey(url.replace('/application?jr_id=tracking','?utm_source=email')));
  assert.notEqual(jobDescriptionCacheKey(url),jobDescriptionCacheKey(url.replace('11111111-1111','22222222-2222')));
});
test('Cherry application recovers exact matching JSON-LD without making a request',async t=>{
  let requests=0; const h=setup(t,metadata()+'<form>Upload resume First name Last name</form>',{fetch:async()=>{requests++;throw Error('unnecessary request');}});
  assert.match(await h.api.resolveJobDescription(),/Build SQL dashboards/); assert.equal(requests,0);
});
test('wrong job structured metadata is rejected',async t=>{
  const h=setup(t,metadata('22222222-2222-2222-2222-222222222222'));
  assert.equal(await h.api.resolveJobDescription(),'');
});
test('fetched listing HTML strips nested CSS and reads structured description',async t=>{
  const h=setup(t,'<form>First name Last name Upload resume Submit application</form>',{fetch:async()=>({ok:true,url:url.replace('/application?jr_id=tracking',''),text:async()=>`<div><style>${css}</style></div>${metadata()}`}) as any});
  assert.match(await h.api.resolveJobDescription(),/Build SQL dashboards/);
});
test('missing description fails closed instead of returning form text or cached CSS',async t=>{
  const h=setup(t,`<main>First name Last name Upload resume Submit application ${'Personal information '.repeat(100)}</main>`);
  h.w.sessionStorage.setItem('tmo_jd_listing_cache_v1',JSON.stringify({[jobDescriptionCacheKey(url)]:css}));
  assert.equal(await h.api.resolveJobDescription(),'');
});
test('validated cache survives a new tab/module instance, never leaks into another job',async t=>{
  const h=setup(t,metadata()); await h.api.resolveJobDescription();
  const next=setup(t,'<form>Upload resume</form>',{store:h.store});
  assert.match(await next.api.resolveJobDescription(),/Build SQL dashboards/);
  const other=setup(t,'',{store:h.store,url:url.replace('11111111-1111','22222222-2222')});
  assert.equal(await other.api.resolveJobDescription(),'');
});
test('expired and contaminated extension caches are discarded',async t=>{
  for (const entry of [{text:posting,savedAt:Date.now()-25*3600000},{text:css,savedAt:Date.now()}]) {
    const key=jobDescriptionCacheKey(url); const store={['tmo_verified_jd_v2:'+key]:{...entry,sourceUrl:key}};
    const h=setup(t,'',{store}); assert.equal(await h.api.resolveJobDescription(),'');
    assert.equal(Object.keys(store).length,0);
  }
});
test('generic listing redirects do not contaminate current job',async t=>{
  const h=setup(t,'',{fetch:async()=>({ok:true,url:'https://jobs.ashbyhq.com/acme',text:async()=>metadata()}) as any});
  assert.equal(await h.api.resolveJobDescription(),'');
});
test('description text never includes entered form values or extension tool text',async t=>{
  const h=setup(t,`<main><article>${posting}</article><form><textarea>private-answer-secret</textarea></form><div id="jobright-helper-root">${posting} other-extension-secret</div><style>${css}</style></main>`);
  const text=await h.api.resolveJobDescription(); assert.match(text,/Build SQL/);assert.doesNotMatch(text,/secret|overflow/);
});
test('slow previous-job fetch cannot return into the next job',async t=>{
  let release:any; const h=setup(t,'',{fetch:()=>new Promise(resolve=>release=resolve)});
  const result=h.api.resolveJobDescription(); await new Promise(r=>setImmediate(r));
  h.w.history.pushState({},'','/acme/22222222-2222-2222-2222-222222222222/application');
  release({ok:true,url:url.replace('/application?jr_id=tracking',''),text:async()=>metadata()});
  assert.equal(await result,'');
});
test('JSON-LD graph supports the original posting without rendering its overview',async t=>{
  const json=JSON.parse(metadata().replace(/^.*?>/,'').replace(/<\/script>$/,''));
  const h=setup(t,`<script type="application/ld+json">${JSON.stringify({'@graph':[{'@type':'Organization',name:'Acme'},json]})}</script>`);
  assert.match(await h.api.resolveJobDescription(),/Build SQL/);
});
