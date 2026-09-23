import assert from 'node:assert/strict';
import test from 'node:test';
import { savedResumeChangeHint } from '../src/saved-job-resume';
import type { GeneratedResumeArtifactV1 } from '../src/resume-autofill-contract';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const req = createRequire(resolve('package.json'));
const artifact = {
  sourceResumeId: 'resume-1',
  job: { jobDescription: 'Responsibilities: Build SQL dashboards.' },
  pdf: { filename: 'Applicant_Resume_Analyst.pdf' },
} as GeneratedResumeArtifactV1;
test('change hints ignore whitespace but detect changed posting and base resume', () => {
  assert.equal(
    savedResumeChangeHint(
      artifact,
      'Responsibilities:   Build SQL dashboards.'
    ),
    null
  );
  assert.match(
    savedResumeChangeHint(
      artifact,
      'Responsibilities: Build Python services.'
    )!,
    /job description has changed/
  );
  assert.match(
    savedResumeChangeHint(artifact, '', { id: 'resume-2' })!,
    /base résumé has changed/
  );
  assert.match(
    savedResumeChangeHint(
      artifact,
      '',
      { id: 'resume-1', updatedAt: '2026-09-22' },
      '2026-09-21'
    )!,
    /base résumé has changed/
  );
});
test('saved resume actions require a click; failed save is not labeled saved', async (t) => {
  const { JSDOM } = req('jsdom');
  const dom = new JSDOM('');
  t.after(() => dom.window.close());
  const code = req('esbuild').buildSync({
    entryPoints: ['src/saved-job-resume-card.ts'],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  }).outputFiles[0].text;
  const module = { exports: {} as any };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    document: dom.window.document,
    window: dom.window,
  });
  let clicks = 0;
  const card = module.exports.savedJobResumeCard({
    artifact,
    savedToAccount: false,
    generatedAt: '2026-09-21',
    onPreview: () => clicks++,
    onDownload: () => clicks++,
    onPrefill: async () => {
      clicks++;
      return true;
    },
  });
  dom.window.document.body.append(card.node);
  assert.equal(clicks, 0);
  assert.match(card.node.textContent, /Not saved to your account/);
  const buttons = [
    ...card.node.querySelectorAll('button'),
  ] as HTMLButtonElement[];
  for (const name of ['Preview', 'Download', 'Prefill this application'])
    assert.ok(buttons.find((b) => b.textContent === name));
  buttons.find((b) => b.textContent === 'Prefill this application')!.click();
  await new Promise((r) => setImmediate(r));
  assert.equal(clicks, 1);
  assert.match(card.node.textContent, /Review the application/);
  const saved = module.exports.savedJobResumeCard({
    artifact, savedToAccount:true, onPreview:()=>{},onDownload:()=>{},
    onPrefill:async()=>true,onRetrySave:async()=>true,
  });
  assert.equal([...saved.node.querySelectorAll('button')].some((b:any)=>b.textContent==='Retry save'),false);
});
