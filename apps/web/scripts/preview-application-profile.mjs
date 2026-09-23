// Local, synthetic UI QA. No real API calls, credentials, or employer requests.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const esbuild = createRequire(resolve('../extension/package.json'))('esbuild');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const loadConfig = require('tailwindcss/loadConfig');
const config = loadConfig(resolve('tailwind.config.ts'));
const css = (await postcss([tailwind(config)]).process(await readFile('app/globals.css','utf8'), {from:resolve('app/globals.css')})).css;
const ui = await esbuild.build({
  stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
    import React from 'react'; import {createRoot} from 'react-dom/client';
    import Page from './app/dashboard/extension/page';
    let contact = {first_name:'Alex',last_name:'Example',country:'United States',city:'Boston'};
    let privateData = {workAuthorization:'yes',requiresSponsorship:'no',defaultJobPortalLogin:{email:'candidate@example.test',password:'Synthetic-only!9A'}};
    window.fetch=async(url,options={})=>{
      if(!['/api/application-profile','/api/private-application-answers'].includes(String(url))) throw Error('External requests disabled in preview');
      const isPrivate=String(url).includes('private-');
      if(options.method==='PUT') { const data=JSON.parse(options.body); if(isPrivate)privateData=data;else contact=data; }
      if(options.method==='DELETE')privateData={};
      return {ok:true,json:async()=>({ok:true,data:isPrivate?privateData:contact})};
    };
    const mobile=new URLSearchParams(location.search).has('mobile');
    if(new URLSearchParams(location.search).has('dark'))document.documentElement.classList.add('dark');
    if(mobile)document.getElementById('root').style.cssText='width:390px;max-width:100%;margin:auto;border:1px solid hsl(var(--border))';
    createRoot(document.getElementById('root')).render(<Page/>);
  `},
  plugins:[{name:'preview-link',setup(build){
    build.onResolve({filter:/^next\/link$/},()=>({path:'next-link',namespace:'preview'}));
    build.onLoad({filter:/.*/,namespace:'preview'},()=>({loader:'tsx',contents:"import React from 'react';export default function Link(props){return <a {...props}/>;}" ,resolveDir:process.cwd()}));
  }}],
  bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',tsconfig:'tsconfig.json',define:{'process.env.NODE_ENV':'"development"'},
});
const portal = await esbuild.build({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`
  import {fillJobPortalLogin} from '../extension/src/job-portal-login';
  import {runGuidedNavigation} from '../extension/src/guided-autopilot';
  const form=document.querySelector('form');let submits=0;
  form.addEventListener('submit',e=>{e.preventDefault();submits++;});
  document.querySelector('#prefill').addEventListener('click',()=>{
    const result=fillJobPortalLogin(document,{email:'candidate@example.test',password:'Synthetic-only!9A'},'example.wd5.myworkdayjobs.com');
    const guided=runGuidedNavigation(form);
    document.querySelector('#result').textContent=result.totalFilled+' fields filled. Guided: '+guided.outcome+'. Submissions: '+submits+'.';
  });
`},bundle:true,write:false,platform:'browser',format:'iife'});
const server=createServer((req,res)=>{
  res.setHeader('Content-Security-Policy',"default-src 'self';style-src 'self' 'unsafe-inline';connect-src 'none';img-src 'self' data:");
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/style.css'){res.setHeader('Content-Type','text/css');res.end(css);return;}
  if(url.pathname.endsWith('.js')){res.setHeader('Content-Type','text/javascript');res.end(url.pathname==='/portal.js'?portal.outputFiles[0].text:ui.outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  const portalPage=url.pathname==='/portal';
  res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TrackMyOPT synthetic ${portalPage?'portal':'profile'} preview</title><link rel="stylesheet" href="/style.css"></head><body style="font-family:system-ui"><div style="padding:12px;background:#e0f2fe;color:#164e63;font-size:13px">Synthetic local preview. No real account, employer, or saved-data changes.</div>${portalPage?`<main style="max-width:600px;margin:40px auto;padding:20px"><h1 class="text-2xl font-semibold">Create candidate account (fixture)</h1><p class="my-4 text-sm">Tests the real field filler, not the HTTPS/request gate.</p><form class="space-y-5"><label class="block">Email Address<input id="e" type="email" class="block border p-3 w-full"></label><label class="block">Password<input id="p" type="password" autocomplete="new-password" class="block border p-3 w-full"></label><label class="block">Verify New Password<input id="p2" type="password" autocomplete="new-password" class="block border p-3 w-full"></label><button type="button" class="border p-3">Next</button><button type="submit" class="border p-3">Create Account</button></form><button id="prefill" class="my-5 rounded-lg bg-blue-700 text-white p-3">Prefill test application</button><p id="result" role="status">Ready</p></main>`:'<div id="root"></div>'}<script src="/${portalPage?'portal':'ui'}.js"></script></body></html>`);
});
server.listen(0,'127.0.0.1',()=>console.log('Synthetic preview: http://127.0.0.1:'+server.address().port));
