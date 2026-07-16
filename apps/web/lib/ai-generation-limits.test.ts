import { beforeEach, describe, expect, it } from 'vitest';
import { consumeAiGeneration, resetAiGenerationLimitsForTesting } from './ai-generation-limits';

describe('shared screening and cover-letter AI generation limits', () => {
  beforeEach(resetAiGenerationLimitsForTesting);

  it('blocks the combined daily request after 25 generations', () => {
    for (let index = 0; index < 25; index += 1) {
      expect(consumeAiGeneration('daily-user', `item-${index}`, false).allowed).toBe(true);
    }
    expect(consumeAiGeneration('daily-user', 'item-26', false)).toMatchObject({
      allowed: false,
      dailyRemaining: 0,
      error: 'ai_daily_limit_reached',
    });
  });

  it('blocks a fourth screening-question regeneration', () => {
    for (let index = 0; index < 3; index += 1) {
      expect(consumeAiGeneration('question-user', 'question-hash', true).allowed).toBe(true);
    }
    expect(consumeAiGeneration('question-user', 'question-hash', true)).toMatchObject({
      allowed: false,
      itemRegenerationsRemaining: 0,
      error: 'ai_item_regeneration_limit_reached',
    });
  });

  it('blocks a fourth cover-letter regeneration for the same job/hash key', () => {
    const jobKey = 'acme|engineer|content-hash';
    for (let index = 0; index < 3; index += 1) {
      consumeAiGeneration('cover-user', jobKey, true);
    }
    expect(consumeAiGeneration('cover-user', jobKey, true).error)
      .toBe('ai_item_regeneration_limit_reached');
  });

  it('uses one daily bucket for screening and cover-letter usage', () => {
    consumeAiGeneration('shared-user', 'question', false);
    expect(consumeAiGeneration('shared-user', 'cover-job', false).dailyRemaining).toBe(23);
  });
});
