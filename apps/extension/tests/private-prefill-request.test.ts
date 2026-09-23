import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const req=createRequire(resolve('package.json'));
const code=req('esbuild').buildSync({entryPoints:['src/private-prefill-request.ts'],bundle:true,write:false,format:'cjs',platform:'node'}).outputFiles[0].text;
function harness(response: unknown) {
  let calls=0;let active=true;
  const module={exports:{} as any};
  vm.runInNewContext(code,{module,exports:module.exports,chrome:{runtime:{sendMessage:async(message:any)=>{calls++;assert.equal(message.type,'GET_PRIVATE_PREFILL_ANSWERS');return typeof response==='function'?(response as Function)(()=>{active=false;}):response;}}}});
  return {run:()=>module.exports.loadPrivateAnswersForPrefill(()=>active),calls:()=>calls,stop:()=>{active=false;}};
}
test('one Prefill click loads fresh saved private answers without credentials',async()=>{
  const h=harness({ok:true,data:{requiresSponsorship:'yes',sexGender:'prefer_not_to_answer',defaultJobPortalLogin:{email:'sample@example.test',password:'sample'},unknown:'discard'}});
  assert.equal(h.calls(),0);
  const result=await h.run();
  assert.equal(result.status,'ready');
  assert.deepEqual(JSON.parse(JSON.stringify(result.answers)),{confirmed:true,requiresSponsorship:'yes',sexGender:'prefer_not_to_answer'});
  await h.run();assert.equal(h.calls(),2,'no stale private answer cache');
});
for(const response of [{ok:false},null]) test('failed private loading is explicit, not silently treated as empty: '+JSON.stringify(response),async()=>{
  const result=await harness(response).run();assert.equal(result.status,'unavailable');assert.equal(result.answers.confirmed,false);
});
test('no saved private answers stays empty',async()=>{assert.equal((await harness({ok:true,data:null}).run()).status,'empty');});
test('navigation before or during private load discards the response',async()=>{
  const before=harness({ok:true,data:{requiresSponsorship:'yes'}});before.stop();assert.equal((await before.run()).status,'stopped');assert.equal(before.calls(),0);
  const during=harness((stop:Function)=>{stop();return {ok:true,data:{requiresSponsorship:'yes'}};});assert.equal((await during.run()).status,'stopped');
});
