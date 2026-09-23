// Isolated UI fixture: synthetic data only; no account writes or external requests.
// Run from apps/web: node scripts/preview-case-status.mjs
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
  define: { 'process.env.NODE_ENV': '"development"' },
  stdin: {
    loader: 'tsx',
    resolveDir: root,
    contents: `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {PremiumProcessingCountdown} from './components/dashboard/case-status/PremiumProcessingCountdown';
    import {MonitorHealthStrip} from './components/dashboard/case-status/panels/MonitorHealthStrip';
    import {PredictionPanel} from './components/dashboard/case-status/panels/PredictionPanel';
    import {SavedOptDates} from './components/dashboard/case-status/panels/OptJourneySection/SavedOptDates';
    const params=new URLSearchParams(location.search);
    if(params.has('dark')) document.documentElement.classList.add('dark');
    const width=Number(params.get('width'))||1000;
    window.fetch=async(url)=>{
      if(url!='/api/opt/calculator') throw Error('Network disabled');
      return {ok:true,json:async()=>({ok:true,data:params.has('empty')?null:{program_end_date:'2026-05-15',dso_recommendation_date:'2026-04-20',opt_start_date:'2026-06-01',opt_ead_end_date:'2027-05-31',stem_start_date:null}})};
    };
    const stopped=params.has('stopped');
    const status=stopped?'Request for Additional Evidence Was Sent':params.has('approved')?'Case Was Approved':'Premium Processing Clock Was Started';
    const prediction={cohortSize:20,medianDays:60,p25Days:45,p75Days:75,fastestDays:10,estimatedDecisionRange:['2026-07-01','2026-08-01'],distribution:[],cohortPosition:{behind:2,ahead:18,percentile:90},approvalsLast24h:0,matchLevel:'pp',caseKind:'initial_opt',serviceCenter:null,premiumProcessing:false,sourceNote:'Synthetic fixture'};
    createRoot(document.getElementById('root')).render(<main style={{width,maxWidth:'100%',margin:'auto',padding:16}} className='space-y-5'>
      <h1 className='text-xl font-bold'>Case status · synthetic preview</h1>
      <MonitorHealthStrip monitorActive lastCheckedAt='2026-06-16T12:00:00Z' emailAlertsEnabled={false}/>
      <PremiumProcessingCountdown caseId='synthetic' ppStartDate='2026-05-12' currentStatus={status} statusHistory={[{status:'Premium Processing Clock Was Started',date:'2026-05-12'}]} onSaved={()=>{}}/>
      <section className='rounded-xl border p-4'><PredictionPanel daysSinceFiled={100} prediction={prediction}/></section>
      <SavedOptDates/>
    </main>);
  `,
  },
  plugins: [
    {
      name: 'fixture-links',
      setup(build) {
        build.onResolve({ filter: /^next\/link$/ }, (args) => ({
          path: args.path,
          namespace: 'fixture',
        }));
        build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
          loader: 'tsx',
          contents:
            "import React from 'react'; export default props => <a {...props}/>;",
          resolveDir: root,
        }));
      },
    },
  ],
});
createServer((req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:"
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
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Case status QA</title><link rel="stylesheet" href="/style.css"></head><body class="bg-background text-foreground"><div id="root"></div><script src="/ui.js"></script></body></html>'
  );
}).listen(4318, '127.0.0.1', () =>
  console.log('Synthetic case preview: http://127.0.0.1:4318/')
);
