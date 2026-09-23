// Isolated real-UI fixture. Account APIs mocked; only public Brandfetch searches use the network.
// Run from apps/web: node scripts/preview-opt-dates-audit.mjs
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
const root = process.cwd();
const require = createRequire(import.meta.url);
const esbuild = createRequire(resolve(root, '../extension/package.json'))('esbuild');
const config = require('tailwindcss/loadConfig')(resolve(root, 'tailwind.config.ts'));
const css = (await require('postcss')([require('tailwindcss')(config)]).process(await readFile(resolve(root, 'app/globals.css'), 'utf8'), { from: resolve(root, 'app/globals.css') })).css;
const result = await esbuild.build({
  absWorkingDir: root, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic',
  tsconfig: resolve(root, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"development"', 'process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID': JSON.stringify(process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || '') },
  stdin: { loader: 'tsx', resolveDir: root, contents: `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {OptDatesSection} from './components/dashboard/opt/OptDatesSection';
    const NativeDate = Date;
    window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : ['2026-09-22T16:00:00Z'])); } static now() { return new NativeDate('2026-09-22T16:00:00Z').getTime(); } };
    const mode = new URLSearchParams(location.search).get('case') || 'stem';
    let data = {program_end_date:'05/19/2025',dso_recommendation_date:'05/01/2025',opt_start_date:'07/15/2025',opt_ead_end_date:'07/14/2026',stem_start_date:'07/15/2026',stem_dso_recommendation_date:''};
    let spans = [{id:'job-1',employer_name:'Example One',start_date:'2025-09-01',end_date:'2026-05-10',is_current:false},{id:'job-2',employer_name:'Example Two',start_date:'2026-05-12',end_date:null,is_current:true}];
    if(mode==='future') { data={...data,program_end_date:'05/19/2026',dso_recommendation_date:'05/01/2026',opt_start_date:'07/15/2026',opt_ead_end_date:'07/14/2027',stem_start_date:'07/15/2027'}; spans=[{...spans[1],start_date:'2026-07-15'}]; }
    if(mode==='filing') { data={...data,program_end_date:'10/01/2026',dso_recommendation_date:'09/15/2026',opt_start_date:'',opt_ead_end_date:'',stem_start_date:''};spans=[]; }
    if(mode==='overlap') {data={...data,opt_start_date:'09/01/2026',opt_ead_end_date:'08/31/2027',stem_start_date:''};spans=[{...spans[0],start_date:'2026-09-01',end_date:'2026-09-20'},{...spans[0],id:'job-3',start_date:'2026-09-05',end_date:'2026-09-15'}];}
    let failHistory = mode==='failure';
    const publicFetch = window.fetch.bind(window);
    window.fetch = async (url, options={}) => {
      if (String(url).startsWith('https://api.brandfetch.io/v2/search/')) return publicFetch(url, options);
      if(url==='/api/opt/calculator') {
        if(options.method==='POST') { const {_lastModifiedField,...patch}=JSON.parse(options.body); data={...data,...patch}; }
        return {ok:true,json:async()=>({ok:true,data:{...data}})};
      }
      if(url==='/api/employment-spans') {
        if(failHistory) {failHistory=false;return {ok:false,json:async()=>({ok:false})};}
        if(options.method==='POST') {const [item]=JSON.parse(options.body).spans;const iso=s=>{if(!s)return null;const [m,d,y]=s.split('/');return y+'-'+m+'-'+d;};const saved={...item,id:item.id||'new-job',start_date:iso(item.start_date),end_date:iso(item.end_date),is_current:!item.end_date};spans=item.id?spans.map(s=>s.id===item.id?saved:s):[...spans,saved];}
        return {ok:true,json:async()=>({ok:true,spans:[...spans]})};
      }
      if(url==='/api/premium/status') return {ok:true,json:async()=>({isPremium:true})};
      if(url==='/api/user/tool-email') return {ok:true,json:async()=>({emails:{}})};
      throw Error('Network disabled: '+url);
    };
    createRoot(document.getElementById('root')).render(<OptDatesSection/>);
  ` },
  plugins: [{ name: 'synthetic-only', setup(build) {
    const mocks = {
      'next/dynamic': 'export default ()=>()=>null;',
      'next/link': "import React from 'react';export default props=><a {...props}/>;",
      'next/navigation': 'export const useRouter=()=>({push(){}});',
      '@/hooks/useToast': 'export const useToast=()=>({toast(){}});',
      '@/hooks/useEmploymentSetupAck': 'export const useEmploymentSetupAck=()=>({ack:null,setAck(){}});',
      './EmploymentSetupModal': 'export const EmploymentSetupModal=()=>null;',
    };
    build.onResolve({filter:/.*/}, args=>args.path in mocks?{path:args.path,namespace:'fixture'}:undefined);
    build.onLoad({filter:/.*/,namespace:'fixture'}, args=>({loader:'tsx',contents:mocks[args.path],resolveDir:root}));
  }}],
});
const server=createServer((req,res)=>{
  res.setHeader('Content-Security-Policy', "default-src 'self';style-src 'self' 'unsafe-inline';connect-src https://api.brandfetch.io;img-src 'self' data:");
  if(req.url==='/ui.js'){res.setHeader('Content-Type','text/javascript');res.end(result.outputFiles[0].text);return;}
  if(req.url==='/style.css'){res.setHeader('Content-Type','text/css');res.end(css);return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div style="padding:12px">Synthetic OPT Dates audit — no real account data</div><div id="root"></div><script src="/ui.js"></script></body></html>');
});
server.listen(0,'127.0.0.1',()=>console.log('OPT dates fixture: http://127.0.0.1:'+server.address().port+'/?case=stem'));
