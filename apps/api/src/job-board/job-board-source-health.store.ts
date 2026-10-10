import type { SupabaseClient } from '@supabase/supabase-js';
import {
  classifySourceError,
  planSourceFailure,
  planSourceSuccess,
  toSourceHealthDatabaseUpdate,
} from './source-health';
import type { SourceBoardHealth } from './job-board.types';

/** Supabase persistence for per-board circuit-breaker health. */
export class SourceBoardHealthStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async get(sourceId: string) {
    const { data, error } = await this.supabase
      .from('ats_boards')
      .select('id, consecutive_failures, circuit_state, next_retry_at')
      .eq('legacy_source_id', sourceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as SourceBoardHealth | null;
  }

  async recordSuccess(boardId?: string) {
    if (!boardId) return;
    const now = new Date().toISOString();
    const health = planSourceSuccess();
    const { error } = await this.supabase
      .from('ats_boards')
      .update({
        ...toSourceHealthDatabaseUpdate(health),
        last_fetch_at: now,
        last_success_at: now,
      })
      .eq('id', boardId);
    if (error) throw new Error(error.message);
  }

  async recordFailure(board: SourceBoardHealth | null, message: string) {
    if (!board) return;
    const now = new Date();
    const plan = planSourceFailure({
      consecutiveFailures: board.consecutive_failures,
      now,
    });
    const classification = classifySourceError(message);
    const nowIso = now.toISOString();
    const update = await this.supabase
      .from('ats_boards')
      .update({
        ...toSourceHealthDatabaseUpdate(plan),
        last_fetch_at: nowIso,
        last_failure_at: nowIso,
      })
      .eq('id', board.id);
    if (update.error) throw new Error(update.error.message);
    const errorLog = await this.supabase.from('source_errors').insert({
      ats_board_id: board.id,
      error_type: classification.errorType,
      message,
      retryable: classification.retryable,
      metadata: {
        consecutive_failures: plan.consecutiveFailures,
        circuit_state: plan.circuitState,
      },
    });
    if (errorLog.error) throw new Error(errorLog.error.message);
  }
}
