// Synthetic, isolated preview: no account data or external requests.
// From apps/web: node scripts/preview-opt-tools.mjs
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
const root = process.cwd();
const require = createRequire(import.meta.url);
const esbuild = createRequire(resolve(root, '../extension/package.json'))(
  'esbuild'
);
const config = require('tailwindcss/loadConfig')(
  resolve(root, 'tailwind.config.ts')
);
const css = (
  await require('postcss')([require('tailwindcss')(config)]).process(
    await readFile(resolve(root, 'app/globals.css'), 'utf8'),
    { from: resolve(root, 'app/globals.css') }
  )
).css;
const result = await esbuild.build({
  absWorkingDir: root,
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  tsconfig: resolve(root, 'tsconfig.json'),
  define: {
    'process.env.NODE_ENV': '"development"',
    'process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID': '""',
  },
  stdin: {
    loader: 'tsx',
    resolveDir: root,
    contents: `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {FilingTool} from './components/dashboard/opt-tools/FilingTool';
    import {ClockTool} from './components/dashboard/opt-tools/ClockTool';
    const params = new URLSearchParams(location.search);
    if(params.has('dark')) document.documentElement.classList.add('dark');
    const tool = params.get('tool') || 'opt-apply';
    const width = Number(params.get('width'));
    if(width) { document.getElementById('root').style.width=width+'px'; document.getElementById('root').style.maxWidth='100%'; }
    let dates={program_end_date:'05/15/2026',dso_recommendation_date:'04/01/2026',opt_start_date:'07/15/2025',opt_ead_end_date:'07/14/2026',stem_start_date:'07/15/2026',stem_dso_recommendation_date:'05/01/2026'};
    let spans=[{id:'synthetic-job',employer_name:'Example employer',start_date:'2025-08-01',end_date:null,is_current:true}];
    let emails={};
    window.fetch=async(url,options={})=>{
      const response=(body,status=200)=>({ok:status<400,status,json:async()=>body});
      if(params.has('guest') && (url==='/api/opt/calculator'||url==='/api/employment-spans')) return response({},401);
      if(url==='/api/opt/calculator') {if(options.method==='POST') dates={...dates,...JSON.parse(options.body)};return response({ok:true,data:dates});}
      if(url==='/api/employment-spans') return response({ok:true,spans});
      if(url==='/api/premium/status') return response({isPremium:true});
      if(url==='/api/user/tool-email') {if(options.method==='POST'){const data=JSON.parse(options.body);emails[data.tool]=data.email;}return response({ok:true,emails});}
      if(url==='/api/opt/community-stats') {const block={mainStat:{value:null},sampleSize:0,dataSource:'insufficient'};return response({'opt-apply':block,'stem-apply':block});}
      throw Error('Network disabled: '+url);
    };
    createRoot(document.getElementById('root')).render(tool.endsWith('apply')?<FilingTool kind={tool.startsWith('stem')?'stem':'opt'}/>:<ClockTool kind={tool.startsWith('stem')?'stem':'opt'}/>);
  `,
  },
  plugins: [
    {
      name: 'synthetic-only',
      setup(build) {
        const mocks = {
          'next/link':
            "import React from 'react';export default ({href,...props})=><a {...props} href={'/?tool='+href.split('/').at(-1)}/>;",
          'next/navigation':
            "export const usePathname=()=>'/tools';export const useRouter=()=>({push(){}});",
          '@/components/pricing/PricingModal':
            'export const PricingModal=()=>null;',
          '@/hooks/useEmploymentSetupAck':
            'export const useEmploymentSetupAck=()=>({ack:null,setAck(){}});',
          '@/hooks/useToast': 'export const useToast=()=>({toast(){}});',
        };
        build.onResolve({ filter: /.*/ }, (args) =>
          args.path in mocks
            ? { path: args.path, namespace: 'fixture' }
            : undefined
        );
        build.onLoad({ filter: /.*/, namespace: 'fixture' }, (args) => ({
          loader: 'tsx',
          contents: mocks[args.path],
          resolveDir: root,
        }));
      },
    },
  ],
});
createServer((req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self';style-src 'self' 'unsafe-inline';connect-src 'none';img-src 'self' data:"
  );
  if (req.url === '/ui.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(result.outputFiles[0].text);
    return;
  }
  if (req.url === '/style.css') {
    res.setHeader('Content-Type', 'text/css');
    res.end(css);
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div style="padding:8px">Synthetic tool preview — no account writes</div><div id="root" style="margin:auto"></div><script src="/ui.js"></script></body></html>'
  );
}).listen(4317, '127.0.0.1', () =>
  console.log('Preview: http://127.0.0.1:4317/?tool=opt-apply')
);
