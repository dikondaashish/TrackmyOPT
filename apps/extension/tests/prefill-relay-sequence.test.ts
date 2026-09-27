import assert from 'node:assert/strict';
import test from 'node:test';
import { currentPrefillRelayContext, PrefillRelaySequencer } from '../src/prefill-relay-sequence';

test('relay sequences increase per tab even when the clock does not', () => {
  const order = new PrefillRelaySequencer();
  const first = order.next(11, 100);
  assert.equal(order.next(11, 100), first + 1);
  assert.equal(order.next(12, 100), first);
  assert.equal(order.next(11, 90), first + 2);
});

test('background relay requires a top-frame run bound to the current tab URL', () => {
  const valid = { frameId: 0, runId: 'run-123', requestedUrl: 'https://jobs.lever.co/acme/1',
    currentTabUrl: 'https://jobs.lever.co/acme/1' };
  assert.equal(currentPrefillRelayContext(valid), true);
  assert.equal(currentPrefillRelayContext({ ...valid, frameId: 2 }), false);
  assert.equal(currentPrefillRelayContext({ ...valid, runId: 'bad run' }), false);
  assert.equal(currentPrefillRelayContext({ ...valid, currentTabUrl: 'https://jobs.lever.co/acme/2' }), false);
  assert.equal(currentPrefillRelayContext({ ...valid, requestedUrl: 'javascript:alert(1)' }), false);
  assert.equal(currentPrefillRelayContext({ ...valid, requestedUrl: undefined }), false);
});
