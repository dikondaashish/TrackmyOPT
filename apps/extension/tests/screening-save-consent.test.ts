import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createScreeningQuestionReviewUI } from '../src/screening-question-review-ui';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');

test('reviewing or editing a draft never saves without the separate Save action', async t => {
  const dom = new JSDOM('<textarea id="answer"></textarea>', { url: 'https://jobs.lever.co/example/apply' });
  t.after(() => dom.window.close());
  Object.assign(globalThis, { document: dom.window.document, window: dom.window,
    Event: dom.window.Event, HTMLElement: dom.window.HTMLElement });
  const field = dom.window.document.querySelector('#answer') as HTMLTextAreaElement;
  const saved: string[] = [];
  const root = createScreeningQuestionReviewUI({
    question: { label: 'Describe a project', normalizedQuestionText: 'Describe a project',
      questionHash: 'test-hash', element: field },
    limits: { dailyRemaining: 1, itemRegenerationsRemaining: 1, itemRegenerationLimit: 1 },
    generateDraft: async () => ({ draft: 'Draft answer', limits: { dailyRemaining: 1,
      itemRegenerationsRemaining: 1, itemRegenerationLimit: 1 } }),
    onReviewed: async answer => { saved.push(answer); return true; },
  });
  dom.window.document.body.append(root);
  const click = (name: string) => {
    const button = [...root.querySelectorAll('button')].find(item => item.textContent === name);
    assert.ok(button, name);
    button.click();
  };
  click('Generate draft');
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  click('Insert draft');
  assert.deepEqual(saved, []);
  click('Confirm reviewed');
  assert.deepEqual(saved, [], 'confirmation is not consent to save for future jobs');
  click('Save this answer for future applications');
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert.deepEqual(saved, ['Draft answer']);
});

test('an answer changed after review is not saved under stale consent', async t => {
  const dom = new JSDOM('<textarea id="answer"></textarea>', { url: 'https://jobs.lever.co/example/apply' });
  t.after(() => dom.window.close());
  Object.assign(globalThis, { document: dom.window.document, window: dom.window,
    Event: dom.window.Event, HTMLElement: dom.window.HTMLElement });
  const field = dom.window.document.querySelector('#answer') as HTMLTextAreaElement;
  let saves = 0;
  const root = createScreeningQuestionReviewUI({
    question: { label: 'Describe a project', normalizedQuestionText: 'Describe a project',
      questionHash: 'test-hash', element: field },
    limits: { dailyRemaining: 1, itemRegenerationsRemaining: 1, itemRegenerationLimit: 1 },
    generateDraft: async () => ({ draft: 'Draft answer', limits: { dailyRemaining: 1,
      itemRegenerationsRemaining: 1, itemRegenerationLimit: 1 } }),
    onReviewed: () => { saves++; return true; },
  });
  dom.window.document.body.append(root);
  const button = (name: string) => [...root.querySelectorAll('button')].find(item => item.textContent === name)!;
  button('Generate draft').click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  button('Insert draft').click();
  button('Confirm reviewed').click();
  field.value = 'A different answer';
  button('Save this answer for future applications').click();
  assert.equal(saves, 0);
  assert.equal(button('Confirm reviewed').hidden, false);
});
