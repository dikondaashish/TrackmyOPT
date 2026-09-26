import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePlan } from './preflight.mjs';
const shot = {
  id: 'prefill',
  recording: 'recordings/prefill.mp4',
  reviewed: true,
  durationSeconds: 8,
  trimStartSeconds: 2,
  playbackRate: 1,
};
const plan = (s) => ({ fps: 30, scenes: [s] });
test('accepts a reviewed clip covering the trim', async () =>
  assert.deepEqual(
    await validatePlan(plan(shot), async () => ({ durationInSeconds: 12 })),
    []
  ));
test('rejects missing, unreviewed footage', async () => {
  const errors = await validatePlan(
    plan({ ...shot, reviewed: false }),
    async () => null
  );
  assert.equal(errors.length, 2);
  assert.ok(errors.some((e) => e.includes('missing')));
});
test('accounts for playback speed when checking media length', async () => {
  const errors = await validatePlan(
    plan({ ...shot, playbackRate: 2 }),
    async () => ({ durationInSeconds: 12 })
  );
  assert.ok(errors.some((e) => e.includes('too short')));
});
test('rejects external paths and invalid timing', async () => {
  assert.ok(
    (
      await validatePlan(
        plan({ ...shot, recording: '../private.mp4' }),
        async () => null
      )
    ).some((e) => e.includes('local MP4'))
  );
  assert.ok(
    (
      await validatePlan(
        plan({ ...shot, trimStartSeconds: -1 }),
        async () => null
      )
    ).some((e) => e.includes('invalid timing'))
  );
});
