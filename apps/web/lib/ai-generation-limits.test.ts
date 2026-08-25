import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  AI_DAILY_GENERATION_LIMIT,
  AI_ITEM_REGENERATION_LIMIT,
  FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
  PAID_AI_WRITING_MONTHLY_LIMIT,
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
          quota_limit: FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
          quota_remaining: FREE_SCREENING_DRAFTS_MONTHLY_LIMIT - 1,
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
      quotaLimit: FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
      quotaRemaining: FREE_SCREENING_DRAFTS_MONTHLY_LIMIT - 1,
      dailyLimit: AI_DAILY_GENERATION_LIMIT,
      dailyRemaining: 25,
      itemRegenerationLimit: AI_ITEM_REGENERATION_LIMIT,
      itemRegenerationsRemaining: 3,
      resetsAt,
    });

    expect(rpc).toHaveBeenCalledWith('consume_plan_ai_generation_quota_v2', {
      p_user_id: '00000000-0000-4000-8000-000000000001',
      p_item_key_hash: createHash('sha256')
        .update(itemKey, 'utf8')
        .digest('hex'),
      p_requested_regeneration: false,
      p_feature_key: 'screening_answer',
      p_plan_tier: 'free',
      p_daily_limit: 25,
      p_paid_monthly_limit: PAID_AI_WRITING_MONTHLY_LIMIT,
      p_free_monthly_limit: FREE_SCREENING_DRAFTS_MONTHLY_LIMIT,
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

  it('uses the shared monthly writing allowance for Pro with a daily safety cap', async () => {
    const { client, rpc } = rpcClient({
      data: [
        {
          allowed: true,
          quota_period: 'month',
          quota_limit: PAID_AI_WRITING_MONTHLY_LIMIT,
          quota_remaining: PAID_AI_WRITING_MONTHLY_LIMIT - 1,
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
      quotaPeriod: 'month',
      quotaLimit: PAID_AI_WRITING_MONTHLY_LIMIT,
      quotaRemaining: PAID_AI_WRITING_MONTHLY_LIMIT - 1,
    });
    expect(rpc).toHaveBeenCalledWith(
      'consume_plan_ai_generation_quota_v2',
      expect.objectContaining({
        p_plan_tier: 'pro',
        p_feature_key: 'cover_letter',
        p_paid_monthly_limit: PAID_AI_WRITING_MONTHLY_LIMIT,
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
      quotaPeriod: 'month',
      quotaLimit: PAID_AI_WRITING_MONTHLY_LIMIT,
      quotaRemaining: 0,
      dailyLimit: 25,
      dailyRemaining: 0,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 0,
      resetsAt: '2026-08-01T00:00:00.000Z',
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

  it('adds a shared monthly allowance for paid AI writing actions', () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        '../../supabase/migrations/20260824000000_repackage_ai_writing_quotas.sql',
      ),
      'utf8',
    );

    expect(migration).toMatch(/paid_combined/i);
    expect(migration).toMatch(/consume_plan_ai_generation_quota_v2/i);
    expect(migration).toMatch(/p_paid_monthly_limit/i);
    expect(migration).toMatch(/p_plan_tier/i);
    expect(migration).toMatch(/pg_advisory_xact_lock/i);
    expect(migration).toMatch(/SET search_path = ''/i);
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.consume_plan_ai_generation_quota_v2[\s\S]+FROM PUBLIC, anon, authenticated/i,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.consume_plan_ai_generation_quota_v2[\s\S]+TO service_role/i,
    );
  });
});
