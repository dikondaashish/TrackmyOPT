import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createOnboarding,
  TOUR_KEY,
  normalizeTourState,
} from '../src/onboarding';

function fixture(initial: unknown = undefined) {
  let state = initial;
  let opens = 0;
  let failOpen = false;
  const flow = createOnboarding({
    read: async () => state,
    write: async (value) => {
      state = value;
    },
    open: async () => {
      if (failOpen) throw new Error('tab blocked');
      opens++;
    },
  });
  return {
    flow,
    get state() {
      return state;
    },
    get opens() {
      return opens;
    },
    fail() {
      failOpen = true;
    },
  };
}

test('installation waits for sign-in; refreshes open only one tour', async () => {
  const f = fixture();
  await f.flow.install('install');
  assert.equal(f.opens, 0);
  await Promise.all([f.flow.signedIn(), f.flow.signedIn(), f.flow.signedIn()]);
  assert.equal(f.opens, 1);
  await f.flow.signedIn();
  assert.equal(f.opens, 1);
});
test('updates and existing installations never force a first-run tour', async () => {
  const f = fixture();
  await f.flow.install('update');
  await f.flow.signedIn();
  assert.equal(f.opens, 0);
});
test('skip survives sign-in and update; replay is explicit', async () => {
  const f = fixture();
  await f.flow.install('install');
  await f.flow.save(2, 'skipped');
  await f.flow.install('update');
  await f.flow.signedIn();
  assert.equal(f.opens, 0);
  await f.flow.replay();
  assert.equal(f.opens, 1);
  assert.equal(normalizeTourState(f.state)?.step, 0);
});
test('failed automatic open remains retryable', async () => {
  const f = fixture();
  await f.flow.install('install');
  f.fail();
  await assert.rejects(f.flow.signedIn());
  assert.equal(normalizeTourState(f.state)?.status, 'pending');
});
test('completed progress persists without storing account or demo data', async () => {
  const f = fixture();
  await f.flow.save(6, 'completed');
  await f.flow.signedIn();
  assert.equal(f.opens, 0);
  assert.deepEqual(f.state, { version: 1, step: 6, status: 'completed' });
  assert.equal(TOUR_KEY, 'productTourV1');
});
test('malformed progress is rejected, never interpreted as a fresh install', () => {
  for (const state of [
    null,
    {},
    { version: 1, step: 99, status: 'active' },
    { version: 1, step: 1.5, status: 'active' },
    { version: 1, step: 0, status: 'bogus' },
  ])
    assert.equal(normalizeTourState(state), null);
});

test('opening a replay reads reset progress, not the previous chapter', async () => {
  let state: unknown = { version: 1, step: 5, status: 'completed' };
  let seen: unknown;
  const flow = createOnboarding({
    read: async () => state,
    write: async (value) => {
      state = value;
    },
    open: async () => {
      seen = state;
    },
  });
  await flow.replay();
  assert.deepEqual(seen, { version: 1, step: 0, status: 'active' });
});
