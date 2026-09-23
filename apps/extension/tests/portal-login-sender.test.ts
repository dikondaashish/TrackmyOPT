import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const source = readFileSync('src/background.ts', 'utf8');
const req = createRequire(resolve('package.json'));
const branch = source.slice(source.indexOf("  if (msg.type === 'GET_JOB_PORTAL_LOGIN_FOR_TAB')"), source.indexOf("  if (msg.type === 'RESOLVE_V1_PREFILL_PAYLOAD')"));
const code = req('esbuild').transformSync(`globalThis.run = function(msg, _sender, sendResponse) { ${branch} };`, {loader:'ts'}).code;
for (const [name, sender, expected] of [
  ['top-level HTTPS', {frameId:0,url:'https://jobs.example.test/apply',tab:{url:'https://jobs.example.test/apply'}}, true],
  ['child frame', {frameId:2,url:'https://jobs.example.test/apply',tab:{url:'https://jobs.example.test/apply'}}, false],
  ['HTTP', {frameId:0,url:'http://jobs.example.test/apply',tab:{url:'http://jobs.example.test/apply'}}, false],
  ['stale document', {frameId:0,url:'https://jobs.example.test/old',tab:{url:'https://jobs.example.test/new'}}, false],
  ['extension page', {url:'chrome-extension://test/popup.html'}, false],
] as const) test(`portal credentials boundary: ${name}`,async()=>{
  let requests=0;let response:any;
  const ctx:any={getPrivateApplicationAnswers:async()=>{requests++;return {ok:true,data:{workAuthorization:'yes',defaultJobPortalLogin:{email:'test@example.test',password:'Fake-test-only!'}}};}};
  vm.runInNewContext(code,ctx);
  ctx.run({type:'GET_JOB_PORTAL_LOGIN_FOR_TAB'},sender,(value:any)=>{response=value;});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(requests,expected?1:0);assert.equal(response.ok,expected);
  assert.equal('data' in response,false,'only the credential is returned, not private answers');
});

test('legacy private-answer message cannot deliver credentials to a frame', async () => {
  const legacyBranch = source.slice(source.indexOf("  if (msg.type === 'GET_PRIVATE_APPLICATION_ANSWERS')"), source.indexOf("  if (msg.type === 'GET_PRIVATE_PREFILL_ANSWERS')"));
  const legacyCode = req('esbuild').transformSync(`globalThis.run = function(msg, _sender, sendResponse) { ${legacyBranch} };`, {loader:'ts'}).code;
  let requests = 0;
  let response: any;
  const ctx: any = { getPrivateApplicationAnswers: async () => { requests++; return {ok:true,data:{defaultJobPortalLogin:{email:'test@example.test',password:'Fake-test-only!'}}}; } };
  vm.runInNewContext(legacyCode, ctx);
  ctx.run({type:'GET_PRIVATE_APPLICATION_ANSWERS'}, {frameId:2,url:'https://jobs.example.test/apply',tab:{url:'https://jobs.example.test/apply'}}, (value:any) => { response = value; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests, 0);
  assert.equal(response.ok, false);
});
