import type { SupabaseClient } from '@supabase/supabase-js';
import type { SchedulerContext } from './scheduler-run-id';
import type {
  SchedulerAttempt,
  SchedulerRunStore,
} from './scheduler-run-ledger';

/** Supabase-backed durable ledger for hourly/manual scheduler dispatch claims. */
export class SupabaseSchedulerRunStore implements SchedulerRunStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async claim(context: SchedulerContext) {
    const { error } = await this.supabase.from('scheduler_runs').insert({
      scheduler_run_id: context.schedulerRunId,
      trigger_origin: context.triggerOrigin,
      bull_job_id: context.schedulerRunId,
      dispatch_status: 'dispatched',
      dispatched_at: new Date().toISOString(),
    });
    if (!error) return true;
    if ('code' in error && error.code === '23505') {
      const { data, error: lookupError } = await this.supabase
        .from('scheduler_runs')
        .select('dispatch_status')
        .eq('scheduler_run_id', context.schedulerRunId)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (data?.dispatch_status === 'failed') {
        const { error: retryError } = await this.supabase
          .from('scheduler_runs')
          .update({
            dispatch_status: 'dispatched',
            error_message: null,
            dispatched_at: new Date().toISOString(),
            queued_at: null,
            bull_job_id: context.schedulerRunId,
          })
          .eq('scheduler_run_id', context.schedulerRunId)
          .eq('dispatch_status', 'failed');
        if (retryError) throw new Error(retryError.message);
        return true;
      }
      if (data?.dispatch_status === 'dispatched') {
        const { data: claimed, error: claimError } = await this.supabase
          .from('scheduler_runs')
          .update({ dispatch_status: 'queued', queued_at: null })
          .eq('scheduler_run_id', context.schedulerRunId)
          .eq('dispatch_status', 'dispatched')
          .select('scheduler_run_id')
          .maybeSingle();
        if (claimError) throw new Error(claimError.message);
        return Boolean(claimed);
      }
      return false;
    }
    throw new Error(error.message);
  }

  async markQueued(schedulerRunId: string, queuedAt: string) {
    const { error } = await this.supabase
      .from('scheduler_runs')
      .update({
        dispatch_status: 'queued',
        error_message: null,
        queued_at: queuedAt,
      })
      .eq('scheduler_run_id', schedulerRunId);
    if (error) throw new Error(error.message);
  }

  async markFailed(schedulerRunId: string, errorMessage: string) {
    const { error } = await this.supabase
      .from('scheduler_runs')
      .update({
        dispatch_status: 'failed',
        error_message: errorMessage.slice(0, 500),
      })
      .eq('scheduler_run_id', schedulerRunId);
    if (error) throw new Error(error.message);
  }

  async markDeferred(schedulerRunId: string, reason: string) {
    const { error } = await this.supabase
      .from('scheduler_runs')
      .update({
        dispatch_status: 'deferred',
        error_message: reason.slice(0, 500),
      })
      .eq('scheduler_run_id', schedulerRunId);
    if (error) throw new Error(error.message);
  }

  async recordAttempt(attempt: SchedulerAttempt) {
    const { error } = await this.supabase.from('scheduler_run_attempts').insert({
      scheduler_run_id: attempt.schedulerRunId,
      trigger_origin: attempt.triggerOrigin,
      bull_job_id: attempt.bullJobId,
      outcome: attempt.outcome,
      queued_at: attempt.queuedAt,
    });
    if (error) throw new Error(error.message);
  }
}
