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
          daily_limit: 25,
          daily_remaining: 24,
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
        }
      )
    ).resolves.toEqual({
      allowed: true,
      dailyLimit: AI_DAILY_GENERATION_LIMIT,
      dailyRemaining: 24,
      itemRegenerationLimit: AI_ITEM_REGENERATION_LIMIT,
      itemRegenerationsRemaining: 3,
      resetsAt,
    });

    expect(rpc).toHaveBeenCalledWith('consume_ai_generation_quota', {
      p_user_id: '00000000-0000-4000-8000-000000000001',
      p_item_key_hash: createHash('sha256')
        .update(itemKey, 'utf8')
        .digest('hex'),
      p_requested_regeneration: false,
      p_daily_limit: 25,
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
      dailyLimit: 25,
      dailyRemaining: 12,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 0,
      resetsAt: '2026-07-27T00:00:00.000Z',
      error: 'ai_item_regeneration_limit_reached',
    });
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
        }
      )
    ).resolves.toEqual({
      allowed: false,
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
});
