import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  AI_DAILY_GENERATION_LIMIT,
  AI_ITEM_REGENERATION_LIMIT,
  consumeAiGeneration,
  nextAiGenerationResetAt,
  normalizeAiGenerationQuotaResult,
  type AiGenerationQuotaRpcClient,
} from './ai-generation-limits';

function rpcClient(result: {
  data: unknown;
  error: { message?: string } | null;
}): {
  client: AiGenerationQuotaRpcClient;
  rpc: ReturnType<typeof vi.fn>;
} {
  const rpc = vi.fn().mockResolvedValue(result);
  return {
    client: { rpc } as AiGenerationQuotaRpcClient,
    rpc,
  };
}

describe('durable AI generation limits', () => {
  it('uses the next UTC day boundary for resets', () => {
    expect(nextAiGenerationResetAt(new Date('2026-07-25T23:59:59.000Z'))).toBe(
      '2026-07-26T00:00:00.000Z'
    );
  });

  it('hashes the item key and consumes quota through the atomic RPC', async () => {
    const resetsAt = '2026-07-26T00:00:00.000Z';
    const { client, rpc } = rpcClient({
      data: [
        {
          allowed: true,
          quota_period: 'month',
          quota_limit: 5,
          quota_remaining: 4,
          daily_limit: 25,
          daily_remaining: 25,
          item_regeneration_limit: 3,
          item_regenerations_remaining: 3,
          resets_at: resetsAt,
          error_code: null,
        },
      ],
      error: null,
    });

    const itemKey = 'Acme|Engineer|private-content-hash';
    await expect(
      consumeAiGeneration(
        '00000000-0000-4000-8000-000000000001',
        itemKey,
        false,
        {
          client,
          feature: 'screening_answer',
          planTier: 'free',
        }
      )
    ).resolves.toEqual({
      allowed: true,
      quotaPeriod: 'month',
      quotaLimit: 5,
      quotaRemaining: 4,
      dailyLimit: AI_DAILY_GENERATION_LIMIT,
      dailyRemaining: 25,
      itemRegenerationLimit: AI_ITEM_REGENERATION_LIMIT,
      itemRegenerationsRemaining: 3,
      resetsAt,
    });

    expect(rpc).toHaveBeenCalledWith('consume_plan_ai_generation_quota', {
      p_user_id: '00000000-0000-4000-8000-000000000001',
      p_item_key_hash: createHash('sha256')
        .update(itemKey, 'utf8')
        .digest('hex'),
      p_requested_regeneration: false,
      p_feature_key: 'screening_answer',
      p_is_premium: false,
      p_daily_limit: 25,
      p_free_monthly_limit: 5,
      p_item_regeneration_limit: 3,
    });
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(itemKey);
  });

  it('normalizes durable daily and item limit responses with resetsAt', () => {
    const fallback = '2026-07-26T00:00:00.000Z';
    expect(
      normalizeAiGenerationQuotaResult(
        [
          {
            allowed: false,
            quota_period: 'day',
            quota_limit: 25,
            quota_remaining: 12,
            daily_limit: 25,
            daily_remaining: 12,
            item_regeneration_limit: 3,
            item_regenerations_remaining: 0,
            resets_at: '2026-07-27T00:00:00Z',
            error_code: 'ai_item_regeneration_limit_reached',
          },
        ],
        fallback
      )
    ).toEqual({
      allowed: false,
      quotaPeriod: 'day',
      quotaLimit: 25,
      quotaRemaining: 12,
      dailyLimit: 25,
      dailyRemaining: 12,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 0,
      resetsAt: '2026-07-27T00:00:00.000Z',
      error: 'ai_item_regeneration_limit_reached',
    });
  });

  it('uses the shared daily allowance for Pro without a monthly cap', async () => {
    const { client, rpc } = rpcClient({
      data: [
        {
          allowed: true,
          quota_period: 'day',
          quota_limit: 25,
          quota_remaining: 24,
          daily_limit: 25,
          daily_remaining: 24,
          item_regeneration_limit: 3,
          item_regenerations_remaining: 3,
          resets_at: '2026-07-26T00:00:00.000Z',
          error_code: null,
        },
      ],
      error: null,
    });

    const result = await consumeAiGeneration('user-pro', 'cover-letter', false, {
      client,
      feature: 'cover_letter',
      planTier: 'pro',
    });

    expect(result).toMatchObject({
      allowed: true,
      quotaPeriod: 'day',
      quotaLimit: 25,
      quotaRemaining: 24,
    });
    expect(rpc).toHaveBeenCalledWith(
      'consume_plan_ai_generation_quota',
      expect.objectContaining({
        p_is_premium: true,
        p_feature_key: 'cover_letter',
        p_free_monthly_limit: 1,
      }),
    );
  });

  it('fails closed with a reset time when Supabase is unavailable', async () => {
    const now = new Date('2026-07-25T17:00:00.000Z');
    const { client } = rpcClient({
      data: null,
      error: { message: 'database unavailable' },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      consumeAiGeneration(
        '00000000-0000-4000-8000-000000000001',
        'item',
        false,
        {
          client,
          now,
          feature: 'cover_letter',
          planTier: 'pro',
        }
      )
    ).resolves.toEqual({
      allowed: false,
      quotaPeriod: 'day',
      quotaLimit: 25,
      quotaRemaining: 0,
      dailyLimit: 25,
      dailyRemaining: 0,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 0,
      resetsAt: '2026-07-26T00:00:00.000Z',
      error: 'ai_rate_limited',
    });

    errorSpy.mockRestore();
  });

  it('migration serializes callers and derives regeneration from item history', () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        '../../supabase/migrations/20260725170000_ai_generation_quotas.sql'
      ),
      'utf8'
    );

    expect(migration).toMatch(/pg_advisory_xact_lock/i);
    expect(migration.match(/FOR UPDATE/gi)).toHaveLength(2);
    expect(migration).toMatch(
      /v_effective_regeneration := v_item_total_used > 0/
    );
    expect(migration).toMatch(
      /ON CONFLICT \(user_id, usage_date, item_key_hash\) DO NOTHING/
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.consume_ai_generation_quota[\s\S]+TO service_role/i
    );
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.consume_ai_generation_quota[\s\S]+FROM PUBLIC, anon, authenticated/i
    );
  });

  it('adds an atomic monthly Free allowance without weakening the daily Pro cap', () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        '../../supabase/migrations/20260725234500_add_plan_aware_ai_quotas.sql',
      ),
      'utf8',
    );

    expect(migration).toMatch(/ai_generation_monthly_usage/i);
    expect(migration).toMatch(/consume_plan_ai_generation_quota/i);
    expect(migration).toMatch(/p_free_monthly_limit/i);
    expect(migration).toMatch(/p_is_premium/i);
    expect(migration).toMatch(/pg_advisory_xact_lock/i);
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.consume_plan_ai_generation_quota[\s\S]+FROM PUBLIC, anon, authenticated/i,
    );
  });
});
