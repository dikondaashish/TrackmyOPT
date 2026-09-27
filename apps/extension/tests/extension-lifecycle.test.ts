import assert from 'node:assert/strict';
import test from 'node:test';
import { createExtensionLifecycle, type ExtensionReleaseState } from '../src/extension-lifecycle';
import { selectAtsPrefillAdapter } from '../src/ats-prefill-adapters';

test('updates migrate once, preserve previous version and serialize concurrent events', async () => {
  let state: ExtensionReleaseState | undefined;
  let purges = 0; let writes = 0;
  const run = createExtensionLifecycle({ read: async () => state, write: async next => { state = next; writes++; }, purgeLegacyToken: async () => { purges++; }, now: () => '2026-09-27T12:00:00Z' });
  await Promise.all([run('0.2.2','0.2.1'), run('0.2.2')]);
  assert.equal(writes, 1); assert.equal(purges, 1);
  assert.equal(state?.previousVersion, '0.2.1'); assert.equal(state?.noticeDismissed, false);
  await run('0.2.3'); assert.equal(state?.previousVersion, '0.2.2'); assert.equal(purges, 1);
});
test('failed migration is retried before marking schema complete', async () => {
  let state: ExtensionReleaseState | undefined; let attempts = 0;
  const run = createExtensionLifecycle({ read: async () => state, write: async next => { state = next; }, purgeLegacyToken: async () => { if (!attempts++) throw Error('storage unavailable'); }, now: () => 'now' });
  await assert.rejects(run('0.2.2')); assert.equal(state, undefined);
  await run('0.2.2'); assert.equal(state?.noticeDismissed, true);
});
test('an older build never rewrites a future storage schema', async () => {
  let writes = 0;
  const run = createExtensionLifecycle({ read: async () => ({ schemaVersion: 9, version: '9.0.0', updatedAt: '', noticeDismissed: false }), write: async () => { writes++; }, purgeLegacyToken: async () => { throw Error('must not migrate backwards'); }, now: () => 'now' });
  await run('0.2.2'); assert.equal(writes, 0);
});
test('an adapter can be rolled back independently with a packaged switch', () => {
  const doc = { location: { hostname: 'jobs.lever.co' } } as Document;
  assert.equal(selectAtsPrefillAdapter(doc).id, 'lever');
  assert.equal(selectAtsPrefillAdapter(doc, true, new Set(['lever'])).id, 'generic');
});

test('same-schema downgrade preserves history and does not repeat token migration', async()=>{
  let state: ExtensionReleaseState={schemaVersion:1,version:'0.2.3',updatedAt:'earlier',noticeDismissed:true};
  const run=createExtensionLifecycle({read:async()=>state,write:async value=>{state=value;},purgeLegacyToken:async()=>{throw Error('unexpected migration');},now:()=> 'now'});
  await run('0.2.2');assert.equal(state.previousVersion,'0.2.3');assert.equal(state.version,'0.2.2');
});

test('same-version reload does not reopen a dismissed release notice', async()=>{
  let state: ExtensionReleaseState={schemaVersion:1,version:'0.2.2',previousVersion:'0.2.1',updatedAt:'earlier',noticeDismissed:true};
  const run=createExtensionLifecycle({read:async()=>state,write:async value=>{state=value;},purgeLegacyToken:async()=>{},now:()=> 'now'});
  await run('0.2.2','0.2.2');assert.equal(state.previousVersion,'0.2.1');assert.equal(state.noticeDismissed,true);
});
