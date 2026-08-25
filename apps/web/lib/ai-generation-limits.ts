import { createHash } from 'node:crypto';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { PLAN_LIMITS } from '@/lib/pricing/plan-config';

export const AI_DAILY_GENERATION_LIMIT = 25;
export const AI_ITEM_REGENERATION_LIMIT = 3;
export const FREE_SCREENING_DRAFTS_MONTHLY_LIMIT =
  PLAN_LIMITS.free.screeningDraftsPerMonth;
export const FREE_COVER_LETTERS_MONTHLY_LIMIT =
  PLAN_LIMITS.free.coverLettersPerMonth;
export const PAID_AI_WRITING_MONTHLY_LIMIT =
  PLAN_LIMITS.pro.aiWritingActionsPerMonth;

type AiGenerationFeature = 'screening_answer' | 'cover_letter';
type AiGenerationPlanTier = 'free' | 'pro' | 'dedicated';
type AiGenerationQuotaPeriod = 'day' | 'month';

type AiGenerationLimitError =
  | 'ai_daily_limit_reached'
  | 'ai_monthly_limit_reached'
  | 'ai_item_regeneration_limit_reached'
  | 'ai_rate_limited';

export interface AiGenerationLimitState {
  allowed: boolean;
  quotaPeriod: AiGenerationQuotaPeriod;
  quotaLimit: number;
  quotaRemaining: number;
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

interface AiGenerationLimitDependencies {
  client?: AiGenerationQuotaRpcClient;
  now?: Date;
  feature: AiGenerationFeature;
  planTier: AiGenerationPlanTier;
}

type QuotaRpcRow = {
  allowed?: unknown;
  quota_period?: unknown;
  quota_limit?: unknown;
  quota_remaining?: unknown;
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

function nextMonthlyAiGenerationResetAt(
  now: Date = new Date(),
): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString();
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
    value === 'ai_monthly_limit_reached' ||
    value === 'ai_item_regeneration_limit_reached'
  ) {
    return value;
  }
  return 'ai_rate_limited';
}

function failClosed(
  resetAt: string,
  quotaPeriod: AiGenerationQuotaPeriod = 'day',
  quotaLimit = AI_DAILY_GENERATION_LIMIT,
): AiGenerationLimitState {
  return {
    allowed: false,
    quotaPeriod,
    quotaLimit,
    quotaRemaining: 0,
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
  fallbackResetAt: string,
  fallbackQuotaPeriod: AiGenerationQuotaPeriod = 'day',
  fallbackQuotaLimit = AI_DAILY_GENERATION_LIMIT,
): AiGenerationLimitState {
  const candidate = Array.isArray(data) ? data[0] : data;
  if (!candidate || typeof candidate !== 'object') {
    return failClosed(
      fallbackResetAt,
      fallbackQuotaPeriod,
      fallbackQuotaLimit,
    );
  }
  const row = candidate as QuotaRpcRow;
  if (typeof row.allowed !== 'boolean') {
    return failClosed(
      fallbackResetAt,
      fallbackQuotaPeriod,
      fallbackQuotaLimit,
    );
  }

  const allowed = row.allowed;
  const quotaPeriod: AiGenerationQuotaPeriod =
    row.quota_period === 'month'
      ? 'month'
      : row.quota_period === 'day'
        ? 'day'
        : fallbackQuotaPeriod;
  const quotaLimit = boundedInteger(
    row.quota_limit,
    fallbackQuotaLimit,
    10_000,
  );
  const state: AiGenerationLimitState = {
    allowed,
    quotaPeriod,
    quotaLimit,
    quotaRemaining: boundedInteger(
      row.quota_remaining,
      0,
      quotaLimit,
    ),
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
  dependencies: AiGenerationLimitDependencies,
): Promise<AiGenerationLimitState> {
  const isPremium = dependencies.planTier !== 'free';
  const freeMonthlyLimit =
    dependencies.feature === 'cover_letter'
      ? FREE_COVER_LETTERS_MONTHLY_LIMIT
      : FREE_SCREENING_DRAFTS_MONTHLY_LIMIT;
  const quotaPeriod: AiGenerationQuotaPeriod = 'month';
  const quotaLimit = isPremium
    ? PAID_AI_WRITING_MONTHLY_LIMIT
    : freeMonthlyLimit;
  const resetAt = nextMonthlyAiGenerationResetAt(dependencies.now);
  const itemKeyHash = createHash('sha256')
    .update(itemKey, 'utf8')
    .digest('hex');

  try {
    const client =
      dependencies.client ??
      (getSupabaseAdminClient() as unknown as AiGenerationQuotaRpcClient);
    const { data, error } = await client.rpc(
      'consume_plan_ai_generation_quota_v2',
      {
        p_user_id: userId,
        p_item_key_hash: itemKeyHash,
        p_requested_regeneration: isRegeneration,
        p_feature_key: dependencies.feature,
        p_plan_tier: dependencies.planTier,
        p_daily_limit: AI_DAILY_GENERATION_LIMIT,
        p_paid_monthly_limit: PAID_AI_WRITING_MONTHLY_LIMIT,
        p_free_monthly_limit: freeMonthlyLimit,
        p_item_regeneration_limit: AI_ITEM_REGENERATION_LIMIT,
      },
    );
    if (error) {
      console.error(
        'AI generation quota RPC failed:',
        error.message || 'unknown datastore error'
      );
      return failClosed(resetAt, quotaPeriod, quotaLimit);
    }
    return normalizeAiGenerationQuotaResult(
      data,
      resetAt,
      quotaPeriod,
      quotaLimit,
    );
  } catch (error) {
    console.error(
      'AI generation quota RPC failed:',
      error instanceof Error ? error.message : 'unknown datastore error'
    );
    return failClosed(resetAt, quotaPeriod, quotaLimit);
  }
}
