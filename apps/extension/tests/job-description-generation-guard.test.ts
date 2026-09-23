import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { looksLikeRealJobPostingText } from '../src/job-description';
const req=createRequire(resolve('package.json'));
test('invalid JD is rejected in the worker before resume reads, scoring or generation requests', async()=>{
  const source=readFileSync('src/background-tailored-resume.ts','utf8');
  const start=source.indexOf('export async function generateTailoredResume');
  const code=req('esbuild').transformSync(source.slice(start).replace('export async','async')+'\nglobalThis.run=generateTailoredResume;', {loader:'ts'}).code;
  let requests=0;
  const context:any={URL,looksLikeRealJobPostingText,getExtensionBearerToken:async()=> 'test-token',fetch:async()=>{requests++;throw Error('must not request');},WEBSITE_URL:'https://example.test'};
  vm.runInNewContext(code,context);
  const result=await context.run({jobDescription:'body { overflow: hidden; display: flex; } '.repeat(70),resumeId:'__latest__',templateId:'professional'});
  assert.equal(result.error,'no_job_description'); assert.equal(requests,0);
});
