import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  formatScreeningGenerationUsage,
  hashNormalizedScreeningQuestion,
  normalizeSavedScreeningAnswer,
} from '../src/screening-question-review';

async function main(): Promise<void> {
  assert.equal(
    await hashNormalizedScreeningQuestion('  Why  this role?\n'),
    await hashNormalizedScreeningQuestion('Why this role?'),
  );
  assert.notEqual(
    await hashNormalizedScreeningQuestion('Why do you want to work here?'),
    await hashNormalizedScreeningQuestion('Why are you interested in this role?'),
  );

  const usage = formatScreeningGenerationUsage({
    allowed: true,
    dailyLimit: 25,
    dailyRemaining: 5,
    itemRegenerationLimit: 3,
    itemRegenerationsRemaining: 1,
  });
  assert.equal(usage.dailyCopy, 'You have 5 AI generations left today.');
  assert.equal(usage.itemCopy, '2 of 3 regenerations used for this question.');
  assert.equal(usage.canRegenerate, true);

  const capped = formatScreeningGenerationUsage({
    allowed: false,
    dailyLimit: 25,
    dailyRemaining: 5,
    itemRegenerationLimit: 3,
    itemRegenerationsRemaining: 0,
    error: 'ai_item_regeneration_limit_reached',
  });
  assert.equal(capped.itemCopy, '3 of 3 regenerations used for this question.');
  assert.equal(capped.canRegenerate, false);
  assert.match(capped.blockedCopy, /regeneration limit/i);

  assert.deepEqual(normalizeSavedScreeningAnswer({
    questionHash: 'a'.repeat(64),
    normalizedQuestionText: 'Why this role?',
    editedAnswer: 'My saved, reviewed answer.',
    source: 'user_edited_ai_draft',
    createdAt: '2026-07-16T12:00:00.000Z',
    updatedAt: '2026-07-16T13:00:00.000Z',
  })?.editedAnswer, 'My saved, reviewed answer.');
  assert.equal(normalizeSavedScreeningAnswer({
    questionHash: 'bad',
    normalizedQuestionText: 'Why?',
    editedAnswer: 'Answer',
    source: 'user_written',
    createdAt: 'bad',
    updatedAt: 'bad',
  }), null);

  const widgetSource = readFileSync('src/screening-question-widget.ts', 'utf8');
  const portalSource = readFileSync('src/content-job-portal.ts', 'utf8');
  const screeningPortalBlock = portalSource.slice(
    portalSource.indexOf('function surfaceScreeningQuestionActions'),
    portalSource.indexOf('function rememberJobFitScore'),
  );
  assert.match(widgetSource, /Use your previously edited answer/);
  assert.match(widgetSource, /Regenerate fresh/);
  assert.match(widgetSource, /Matches identical questions only/);
  assert.match(widgetSource, /Delete saved answer/);
  assert.doesNotMatch(widgetSource, /TRACK_WIDGET_EVENT|trackWidgetAnalytics|console\./);
  assert.doesNotMatch(
    screeningPortalBlock,
    /TRACK_WIDGET_EVENT|trackWidgetAnalytics|console\./,
    'question and answer content never enters analytics or console output',
  );

  console.log('screening-answer-reuse: exact matching, cap visibility, and analytics privacy passed');
}

void main();
