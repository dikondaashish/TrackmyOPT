import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  createScreeningQuestionReviewController,
  screeningQuestionModePolicy,
  type ScreeningQuestionDraftResponse,
} from '../src/screening-question-review';

async function main(): Promise<void> {
const successfulDraft: ScreeningQuestionDraftResponse = {
  ok: true,
  questionHash: 'a'.repeat(64),
  draft: 'I am interested in the role because its platform mission matches my documented TypeScript experience.',
  sourceContentHash: 'b'.repeat(64),
};

for (const mode of ['step_by_step', 'continuous'] as const) {
  const policy = screeningQuestionModePolicy(mode);
  assert.equal(policy.surfaceActions, true);
  assert.equal(policy.autoGenerate, false);
  assert.equal(policy.autoInsert, false);
}

let generationCalls = 0;
const insertedValues: string[] = [];
const states: string[] = [];
const controller = createScreeningQuestionReviewController({
  generate: async () => {
    generationCalls += 1;
    return successfulDraft;
  },
  insert: (draft) => {
    insertedValues.push(draft);
    return true;
  },
  onStateChange: (state) => states.push(state.status),
});

controller.surface('continuous');
assert.equal(generationCalls, 0, 'Continuous surfacing never generates a draft');
assert.deepEqual(insertedValues, [], 'Continuous surfacing never inserts AI text');

assert.equal(await controller.requestDraft('automation'), false);
assert.equal(generationCalls, 0, 'automation cannot request a draft');
assert.equal(await controller.requestDraft('user'), true);
assert.equal(generationCalls, 1);
assert.equal(controller.getState().status, 'draft_ready');

assert.equal(controller.insertDraft('automation'), false);
assert.deepEqual(insertedValues, [], 'AI text is never inserted without an explicit user action');
assert.equal(controller.insertDraft('user'), true);
assert.deepEqual(insertedValues, [successfulDraft.draft]);
assert.equal(controller.getState().status, 'needs_review');

controller.recordControlInput(false);
assert.equal(controller.getState().status, 'needs_review', 'synthetic input cannot complete review');
controller.recordControlInput(true);
assert.equal(controller.getState().status, 'reviewed', 'trusted user editing completes review');

const confirmed = createScreeningQuestionReviewController({
  generate: async () => successfulDraft,
  insert: () => true,
});
await confirmed.requestDraft('user');
confirmed.insertDraft('user');
assert.equal(confirmed.confirmReview('automation'), false);
assert.equal(confirmed.getState().status, 'needs_review');
assert.equal(confirmed.confirmReview('user'), true);
assert.equal(confirmed.getState().status, 'reviewed');

const occupied = createScreeningQuestionReviewController({
  generate: async () => successfulDraft,
  insert: () => false,
});
await occupied.requestDraft('user');
assert.equal(occupied.insertDraft('user'), false);
assert.equal(occupied.getState().status, 'draft_ready');

assert.ok(states.includes('draft_ready'));
assert.ok(states.includes('needs_review'));
assert.ok(states.includes('reviewed'));

const reviewSource = readFileSync('src/screening-question-review.ts', 'utf8');
assert.doesNotMatch(
  reviewSource,
  /\.(?:click|submit)\s*\(/,
  'screening review code never invokes host-page actions',
);
assert.doesNotMatch(reviewSource, /chrome\.storage\.sync|console\./);

console.log('screening-question-review: explicit generation, insertion, and trusted review passed');
}

void main();
