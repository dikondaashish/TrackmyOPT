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
    import {AnalyticsPanels} from './components/dashboard/case-status/panels/AnalyticsPanels';
    import {CaseNoticeOrganizer} from './components/dashboard/case-status/panels/CaseNoticeOrganizer';
    import {WeeklyDigestSettings} from './components/dashboard/case-status/panels/WeeklyDigestSettings';
    import {OptJourneySection} from './components/dashboard/case-status/panels/OptJourneySection';
    import {deriveJourneyPhase} from './lib/community-opt/stages';
    import {CaseHeroCard} from './components/dashboard/case-status/panels/CaseHeroCard';
    import {CaseActionCenter} from './components/dashboard/case-status/panels/CaseActionCenter';
    import {deriveCaseState} from './components/dashboard/case-status/panels/StickyCaseSwitcher';
    const params=new URLSearchParams(location.search);
    if(params.has('dark')) document.documentElement.classList.add('dark');
    const width=Number(params.get('width'))||1000;
    let notices=[];
    let digestEnabled=false;
    window.fetch=async(url,options)=>{
      if(url==='/api/case-status/biometrics') return {ok:true,json:async()=>({ok:true})};
      if(String(url).startsWith('/api/case-status/monitor-schedule')) return {ok:true,json:async()=>({next:{scheduled_for:'2026-09-24T14:00:00Z',state:'queued'},attempt:{attempted_at:'2026-09-23T14:00:00Z',state:'succeeded'}})};
      if(url==='/api/case-status/digest-preferences') { if(options?.method==='PATCH')digestEnabled=JSON.parse(options.body).enabled; return {ok:true,json:async()=>({enabled:digestEnabled})}; }
      if(String(url).startsWith('/api/case-status/notices')) {
        if(options?.method==='POST') { const body=JSON.parse(options.body); notices.push({...body,id:'11111111-1111-4111-8111-111111111111',completed_at:null,reminder_state:body.email_reminder?'pending':'off'}); }
        if(options?.method==='PATCH') { const body=JSON.parse(options.body); notices=notices.map(n=>n.id!==body.id?n:body.complete?{...n,completed_at:new Date().toISOString(),reminder_state:'cancelled'}:{...n,...body}); }
        const id=options?.body?JSON.parse(options.body).id:null;
        return {ok:true,json:async()=>({ok:true,notices,notice:id?notices.find(n=>n.id===id):notices.at(-1)})};
      }
      if(url==='/api/documents') return {ok:true,json:async()=>({documents:[]})};
      if(url==='/api/employment-spans') return {ok:true,json:async()=>({ok:true,spans:[{employer_name:'Example employer',start_date:'2026-08-01',end_date:null}]})};
      if(url==='/api/opt/community-stats') return {ok:false,json:async()=>({ok:false,error:'Synthetic unavailable-data state'})};
      if(url!='/api/opt/calculator') throw Error('Network disabled');
      return {ok:true,json:async()=>({ok:true,data:params.has('empty')?null:{program_end_date:'2025-05-15',dso_recommendation_date:'2025-04-20',opt_start_date:'2025-06-01',opt_ead_end_date:'2026-05-31',stem_start_date:'2026-06-01',stem_ead_end_date:'2028-05-31'}})};
    };
    const stopped=params.has('stopped');
    const status=stopped?'Request for Additional Evidence Was Sent':params.has('approved')?'Case Was Approved':params.has('pp')?'Premium Processing Clock Was Started':params.has('appointment')?'We scheduled you for a biometrics appointment':params.has('biometrics')?'Case Was Updated To Show Fingerprints Were Taken':'Case Was Received';
    const prediction={cohortSize:20,medianDays:60,p25Days:45,p75Days:75,fastestDays:10,estimatedDecisionRange:['2026-07-01','2026-08-01'],distribution:[],cohortPosition:{behind:2,ahead:18,percentile:90},approvalsLast24h:0,matchLevel:'pp',caseKind:'initial_opt',serviceCenter:null,premiumProcessing:false,sourceNote:'Synthetic fixture'};
    createRoot(document.getElementById('root')).render(<main style={{width,maxWidth:'100%',margin:'auto',padding:16}} className='space-y-5'>
      <h1 className='text-xl font-bold'>Case status · synthetic preview</h1>
      <CaseHeroCard caseStatus={{id:'synthetic',receipt_number:'IOE0000000000',filing_category:'initial_opt',current_status:status,received_date:'2026-06-15',last_status_change_at:'2026-06-16',status_history:[]}} caseState={deriveCaseState(status)} updateCount={2}/>
      <CaseActionCenter statusText={status} daysSinceFiled={100}/>
      <MonitorHealthStrip caseId='11111111-1111-4111-8111-111111111111' monitorActive={!params.has('free')} lastCheckedAt='2026-09-23T14:00:00Z' lastCheckFailedAt={params.has('failed')?'2026-09-24T14:00:00Z':null} lastCheckErrorCode='USCIS_UNAVAILABLE' emailAlertsEnabled={params.has('email')} emailAddress='synthetic.notification.address@example.com' onEditEmail={()=>{}}/>
      <WeeklyDigestSettings isPro={!params.has('free')}/>
      {(params.has('pp')||stopped) && <PremiumProcessingCountdown caseId='synthetic' ppStartDate='2026-05-12' currentStatus={status} statusHistory={[{status:'Premium Processing Clock Was Started',date:'2026-05-12'}]} onSaved={()=>{}}/>}
      <section className='rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm'><AnalyticsPanels phase={deriveJourneyPhase(status)} currentStatus={status} receiptNumber='IOE0000000000' filingCategory='initial_opt' isPremium={!params.has('free')} onUpgrade={()=>{}} daysSinceFiled={100} prediction={params.has('empty')?undefined:prediction} summary={params.has('empty')?null:{medianDays:60,cohortSize:20,caseKind:'initial_opt',premiumProcessing:false}} estimateLoading={params.has('loading')} estimatesAvailable={!params.has('nonopt')} heatmap={[{month:'2026-06',buckets:[2,5,7,4,1,1]}]} evidence={{totalReports:100,includedReports:90,excludedStale:10,excludedUnknownFreshness:0,duplicateIdsRemoved:0,possibleCrossSourceDuplicates:2,freshnessDays:30,filingRange:['2026-01-01','2026-06-01'],sources:[{name:'OPT Tracker',reports:100,lastRefreshedAt:'2026-09-23'}]}} premiumUpgrade={params.has('pp')?{sampleSize:40,medianDays:12,p25Days:8,p75Days:20}:null}/></section>
      <OptJourneySection caseId='11111111-1111-4111-8111-111111111111' isPro={!params.has('free')} optFiledDate='2025-06-15'/>
      <CaseNoticeOrganizer caseId='11111111-1111-4111-8111-111111111111' isPro={!params.has('free')}/>
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
