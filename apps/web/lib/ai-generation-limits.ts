import { createHash } from 'node:crypto';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const AI_DAILY_GENERATION_LIMIT = 25;
export const AI_ITEM_REGENERATION_LIMIT = 3;

export type AiGenerationLimitError =
  | 'ai_daily_limit_reached'
  | 'ai_item_regeneration_limit_reached'
  | 'ai_rate_limited';

export interface AiGenerationLimitState {
  allowed: boolean;
  dailyLimit: number;
  dailyRemaining: number;
  itemRegenerationLimit: number;
  itemRegenerationsRemaining: number;
  resetsAt: string;
  error?: AiGenerationLimitError;
}

interface QuotaRpcResult {
  data: unknown;
  error: { message?: string } | null;
}

export interface AiGenerationQuotaRpcClient {
  rpc(
    name: string,
    parameters: Record<string, unknown>
  ): PromiseLike<QuotaRpcResult>;
}

export interface AiGenerationLimitDependencies {
  client?: AiGenerationQuotaRpcClient;
  now?: Date;
}

type QuotaRpcRow = {
  allowed?: unknown;
  daily_limit?: unknown;
  daily_remaining?: unknown;
  item_regeneration_limit?: unknown;
  item_regenerations_remaining?: unknown;
  resets_at?: unknown;
  error_code?: unknown;
};

export function nextAiGenerationResetAt(now: Date = new Date()): string {
  const reset = new Date(now);
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
}

function boundedInteger(
  value: unknown,
  fallback: number,
  maximum: number
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(maximum, Math.trunc(value)));
}

function normalizedResetAt(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
}

function normalizedError(value: unknown): AiGenerationLimitError {
  if (
    value === 'ai_daily_limit_reached' ||
    value === 'ai_item_regeneration_limit_reached'
  ) {
    return value;
  }
  return 'ai_rate_limited';
}

function failClosed(resetAt: string): AiGenerationLimitState {
  return {
    allowed: false,
    dailyLimit: AI_DAILY_GENERATION_LIMIT,
    dailyRemaining: 0,
    itemRegenerationLimit: AI_ITEM_REGENERATION_LIMIT,
    itemRegenerationsRemaining: 0,
    resetsAt: resetAt,
    error: 'ai_rate_limited',
  };
}

export function normalizeAiGenerationQuotaResult(
  data: unknown,
  fallbackResetAt: string
): AiGenerationLimitState {
  const candidate = Array.isArray(data) ? data[0] : data;
  if (!candidate || typeof candidate !== 'object') {
    return failClosed(fallbackResetAt);
  }
  const row = candidate as QuotaRpcRow;
  if (typeof row.allowed !== 'boolean') {
    return failClosed(fallbackResetAt);
  }

  const allowed = row.allowed;
  const state: AiGenerationLimitState = {
    allowed,
    dailyLimit: boundedInteger(
      row.daily_limit,
      AI_DAILY_GENERATION_LIMIT,
      AI_DAILY_GENERATION_LIMIT
    ),
    dailyRemaining: boundedInteger(
      row.daily_remaining,
      0,
      AI_DAILY_GENERATION_LIMIT
    ),
    itemRegenerationLimit: boundedInteger(
      row.item_regeneration_limit,
      AI_ITEM_REGENERATION_LIMIT,
      AI_ITEM_REGENERATION_LIMIT
    ),
    itemRegenerationsRemaining: boundedInteger(
      row.item_regenerations_remaining,
      0,
      AI_ITEM_REGENERATION_LIMIT
    ),
    resetsAt: normalizedResetAt(row.resets_at, fallbackResetAt),
  };
  if (!allowed) state.error = normalizedError(row.error_code);
  return state;
}

/**
 * Atomically consumes quota through Supabase. The raw item key may contain a
 * question or job identity, so only its SHA-256 digest crosses the RPC boundary.
 * Any datastore/configuration failure blocks generation instead of failing open.
 */
export async function consumeAiGeneration(
  userId: string,
  itemKey: string,
  isRegeneration: boolean,
  dependencies: AiGenerationLimitDependencies = {}
): Promise<AiGenerationLimitState> {
  const resetAt = nextAiGenerationResetAt(dependencies.now);
  const itemKeyHash = createHash('sha256')
    .update(itemKey, 'utf8')
    .digest('hex');

  try {
    const client =
      dependencies.client ??
      (getSupabaseAdminClient() as unknown as AiGenerationQuotaRpcClient);
    const { data, error } = await client.rpc('consume_ai_generation_quota', {
      p_user_id: userId,
      p_item_key_hash: itemKeyHash,
      p_requested_regeneration: isRegeneration,
      p_daily_limit: AI_DAILY_GENERATION_LIMIT,
      p_item_regeneration_limit: AI_ITEM_REGENERATION_LIMIT,
    });
    if (error) {
      console.error(
        'AI generation quota RPC failed:',
        error.message || 'unknown datastore error'
      );
      return failClosed(resetAt);
    }
    return normalizeAiGenerationQuotaResult(data, resetAt);
  } catch (error) {
    console.error(
      'AI generation quota RPC failed:',
      error instanceof Error ? error.message : 'unknown datastore error'
    );
    return failClosed(resetAt);
  }
}
