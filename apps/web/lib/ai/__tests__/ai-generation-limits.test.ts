import { describe, expect, it, vi } from 'vitest';

import {
  readAiGenerationLimitState,
  reserveAiGenerationLimit,
  type AiGenerationLimitReadRepository,
  type AiGenerationLimitRepository,
} from '../ai-generation-limits';

describe('shared AI generation limits', () => {
  it('uses one shared reservation contract for screening and cover-letter kinds', async () => {
    const reserve = vi.fn().mockResolvedValue({
      allowed: true,
      daily_limit: 25,
      daily_remaining: 23,
      item_regeneration_limit: 3,
      item_regenerations_remaining: 2,
      resets_at: '2026-07-17T00:00:00.000Z',
      error: null,
    });
    const repository: AiGenerationLimitRepository = { reserve };

    const result = await reserveAiGenerationLimit({
      userId: '00000000-0000-4000-8000-000000000001',
      kind: 'screening_answer',
      itemHash: 'a'.repeat(64),
    }, repository);

    expect(reserve).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'screening_answer',
      dailyLimit: 25,
      itemRegenerationLimit: 3,
    }));
    expect(result).toEqual({
      allowed: true,
      dailyLimit: 25,
      dailyRemaining: 23,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 2,
      resetsAt: '2026-07-17T00:00:00.000Z',
    });
  });

  it('fails closed when the atomic repository is unavailable', async () => {
    const repository: AiGenerationLimitRepository = {
      reserve: vi.fn().mockRejectedValue(new Error('db unavailable')),
    };
    await expect(reserveAiGenerationLimit({
      userId: '00000000-0000-4000-8000-000000000001',
      kind: 'screening_answer',
      itemHash: 'b'.repeat(64),
    }, repository)).resolves.toMatchObject({
      allowed: false,
      error: 'ai_rate_limited',
    });
  });

  it('reports a reached per-question regeneration cap with zero remaining', async () => {
    const read: AiGenerationLimitReadRepository = {
      read: vi.fn().mockResolvedValue({
        allowed: false,
        daily_limit: 25,
        daily_remaining: 5,
        item_regeneration_limit: 3,
        item_regenerations_remaining: 0,
        resets_at: '2026-07-17T00:00:00.000Z',
        error: 'ai_item_regeneration_limit_reached',
      }),
    };
    await expect(readAiGenerationLimitState({
      userId: '00000000-0000-4000-8000-000000000001',
      kind: 'screening_answer',
      itemHash: 'c'.repeat(64),
    }, read)).resolves.toEqual({
      allowed: false,
      dailyLimit: 25,
      dailyRemaining: 5,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 0,
      resetsAt: '2026-07-17T00:00:00.000Z',
      error: 'ai_item_regeneration_limit_reached',
    });
  });
});
