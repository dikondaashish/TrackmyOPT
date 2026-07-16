import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const AI_DAILY_GENERATION_LIMIT = 25;
export const AI_ITEM_REGENERATION_LIMIT = 3;
export const AI_SHORT_WINDOW_LIMIT = 6;

export interface AiGenerationLimitState {
  allowed: boolean;
  dailyLimit: number;
  dailyRemaining: number;
  itemRegenerationLimit: number;
  itemRegenerationsRemaining: number;
  resetsAt?: string;
  error?:
    | 'ai_daily_limit_reached'
    | 'ai_item_regeneration_limit_reached'
    | 'ai_rate_limited';
}

export type AiGenerationKind = 'screening_answer' | 'cover_letter';

export interface AiGenerationReservationInput {
  userId: string;
  kind: AiGenerationKind;
  itemHash: string;
  dailyLimit?: number;
  itemRegenerationLimit?: number;
  shortWindowLimit?: number;
}

interface AtomicReservationRow {
  allowed: boolean;
  daily_limit: number;
  daily_remaining: number;
  item_regeneration_limit: number;
  item_regenerations_remaining: number;
  resets_at: string | null;
  error: AiGenerationLimitState['error'] | null;
}

type NormalizedReservationInput = Required<AiGenerationReservationInput>;

export interface AiGenerationLimitRepository {
  reserve(input: NormalizedReservationInput): Promise<AtomicReservationRow>;
}

const postgresRepository: AiGenerationLimitRepository = {
  async reserve(input) {
    const client = getSupabaseAdminClient();
    const { data, error } = await client.rpc('reserve_ai_generation', {
      p_user_id: input.userId,
      p_generation_kind: input.kind,
      p_item_hash: input.itemHash,
      p_daily_limit: input.dailyLimit,
      p_item_regeneration_limit: input.itemRegenerationLimit,
      p_short_window_limit: input.shortWindowLimit,
    });
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as AtomicReservationRow | null;
    if (!row) throw new Error('Missing AI generation reservation result');
    return row;
  },
};

function unavailableLimitState(input: NormalizedReservationInput): AiGenerationLimitState {
  return {
    allowed: false,
    dailyLimit: input.dailyLimit,
    dailyRemaining: 0,
    itemRegenerationLimit: input.itemRegenerationLimit,
    itemRegenerationsRemaining: 0,
    error: 'ai_rate_limited',
  };
}

export async function reserveAiGenerationLimit(
  input: AiGenerationReservationInput,
  repository: AiGenerationLimitRepository = postgresRepository,
): Promise<AiGenerationLimitState> {
  const normalized: NormalizedReservationInput = {
    ...input,
    dailyLimit: input.dailyLimit ?? AI_DAILY_GENERATION_LIMIT,
    itemRegenerationLimit:
      input.itemRegenerationLimit ?? AI_ITEM_REGENERATION_LIMIT,
    shortWindowLimit: input.shortWindowLimit ?? AI_SHORT_WINDOW_LIMIT,
  };
  try {
    const row = await repository.reserve(normalized);
    return {
      allowed: row.allowed,
      dailyLimit: row.daily_limit,
      dailyRemaining: Math.max(0, row.daily_remaining),
      itemRegenerationLimit: row.item_regeneration_limit,
      itemRegenerationsRemaining: Math.max(0, row.item_regenerations_remaining),
      ...(row.resets_at ? { resetsAt: row.resets_at } : {}),
      ...(row.error ? { error: row.error } : {}),
    };
  } catch {
    // Server-side enforcement fails closed. No request reaches a model.
    return unavailableLimitState(normalized);
  }
}
