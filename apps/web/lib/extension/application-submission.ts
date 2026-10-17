import { createClient } from '@supabase/supabase-js';
import {
  isAttemptId,
  normalizeSubmissionEvidence,
  normalizeSubmissionJob,
  type SubmissionEvidence,
  type SubmissionJobSnapshot,
} from '../../../extension/src/submission/submission-protocol';

/**
 * Records an extension-confirmed application submission in the caller's
 * tracker. Idempotent on (user, attempt_id): retries after a lost response
 * never create a second record or a second status update.
 *
 * Ownership: the user comes only from the verified session/bearer token. A
 * client-supplied application id is used only after confirming it belongs to
 * that user, and otherwise the job is matched by exact URL. Applications are
 * never merged because a company or role title happens to match.
 */

export interface ValidSubmissionUpdate {
  attemptId: string;
  confirmation: 'automatic' | 'manual';
  confirmedAt: string;
  evidence: SubmissionEvidence;
  job: SubmissionJobSnapshot;
  applicationId?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CONFIRMATION_AGE_MS = 15 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export function parseSubmissionUpdate(value: unknown, now: number): ValidSubmissionUpdate | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = ['attempt_id', 'confirmation', 'confirmed_at', 'evidence', 'job', 'application_id'];
  if (Object.keys(input).some((key) => !allowed.includes(key))) return null;
  if (!isAttemptId(input.attempt_id)) return null;
  if (input.confirmation !== 'automatic' && input.confirmation !== 'manual') return null;
  const evidence = normalizeSubmissionEvidence(input.evidence);
  if (!evidence) return null;
  // Automatic confirmations need automatic evidence, and manual ones manual evidence.
  if ((input.confirmation === 'manual') !== (evidence.kind === 'manual')) return null;
  // Only success evidence can mark an application as submitted.
  if (evidence.kind === 'network' && evidence.verdict !== 'success') return null;
  const job = normalizeSubmissionJob(input.job);
  if (!job) return null;
  const confirmedAt = typeof input.confirmed_at === 'string' ? Date.parse(input.confirmed_at) : NaN;
  if (!Number.isFinite(confirmedAt) || confirmedAt > now + MAX_CLOCK_SKEW_MS || now - confirmedAt > MAX_CONFIRMATION_AGE_MS) return null;
  if (input.application_id !== undefined && (typeof input.application_id !== 'string' || !UUID_RE.test(input.application_id))) return null;
  return {
    attemptId: input.attempt_id,
    confirmation: input.confirmation,
    confirmedAt: new Date(confirmedAt).toISOString(),
    evidence,
    job,
    ...(input.application_id ? { applicationId: input.application_id as string } : {}),
  };
}

export interface ApplicationRow { id: string; status: string }

export interface SubmissionStore {
  findSubmission(userId: string, attemptId: string): Promise<{ applicationId: string } | null | 'unavailable'>;
  findApplicationById(userId: string, id: string): Promise<ApplicationRow | null>;
  findApplicationByUrl(userId: string, jobUrl: string): Promise<ApplicationRow | null>;
  insertApplication(userId: string, job: SubmissionJobSnapshot, appliedOn: string): Promise<ApplicationRow | 'conflict'>;
  promoteWishlist(userId: string, id: string, appliedOn: string): Promise<ApplicationRow | null>;
  insertSubmission(userId: string, applicationId: string, update: ValidSubmissionUpdate): Promise<'inserted' | 'duplicate' | 'unavailable'>;
}

export type RecordSubmissionResult =
  | { ok: true; applicationId: string; status: string; alreadyRecorded: boolean; evidenceRecorded: boolean; created: boolean }
  | { ok: false; error: 'application_not_found' };

export async function recordApplicationSubmission(
  store: SubmissionStore,
  userId: string,
  update: ValidSubmissionUpdate,
  today: string,
): Promise<RecordSubmissionResult> {
  const prior = await store.findSubmission(userId, update.attemptId);
  if (prior && prior !== 'unavailable') {
    const current = await store.findApplicationById(userId, prior.applicationId);
    if (current) return { ok: true, applicationId: current.id, status: current.status, alreadyRecorded: true, evidenceRecorded: true, created: false };
  }

  let application: ApplicationRow | null = null;
  let created = false;
  if (update.applicationId) {
    application = await store.findApplicationById(userId, update.applicationId);
    if (!application) return { ok: false, error: 'application_not_found' };
  } else {
    application = await store.findApplicationByUrl(userId, update.job.job_url);
    if (!application) {
      const inserted = await store.insertApplication(userId, update.job, today);
      if (inserted === 'conflict') {
        // A concurrent save for the same URL won the unique index.
        application = await store.findApplicationByUrl(userId, update.job.job_url);
        if (!application) throw new Error('Saved application could not be re-read after a conflict');
      } else {
        application = inserted;
        created = true;
      }
    }
  }

  // Advance only Wishlist; Applied or any later stage is left untouched.
  if (application.status === 'Wishlist') {
    const promoted = await store.promoteWishlist(userId, application.id, today);
    application = promoted ?? (await store.findApplicationById(userId, application.id)) ?? application;
  }

  const evidence = await store.insertSubmission(userId, application.id, update);
  return {
    ok: true,
    applicationId: application.id,
    status: application.status,
    alreadyRecorded: evidence === 'duplicate',
    evidenceRecorded: evidence !== 'unavailable',
    created,
  };
}

/** Before the migration is applied the evidence table does not exist yet. */
function missingTable(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

export function createSupabaseSubmissionStore(): SubmissionStore {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return {
    async findSubmission(userId, attemptId) {
      const { data, error } = await supabase.from('job_application_submissions')
        .select('application_id').eq('user_id', userId).eq('attempt_id', attemptId).maybeSingle();
      if (missingTable(error)) return 'unavailable';
      if (error) throw error;
      return data ? { applicationId: data.application_id as string } : null;
    },
    async findApplicationById(userId, id) {
      const { data, error } = await supabase.from('job_applications')
        .select('id, status').eq('id', id).eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data as ApplicationRow | null;
    },
    async findApplicationByUrl(userId, jobUrl) {
      const { data, error } = await supabase.from('job_applications')
        .select('id, status').eq('user_id', userId).eq('job_url', jobUrl)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data as ApplicationRow | null;
    },
    async insertApplication(userId, job, appliedOn) {
      const { data, error } = await supabase.from('job_applications').insert({
        user_id: userId,
        company_name: job.company_name,
        role_title: job.role_title,
        job_url: job.job_url,
        location: job.location ?? null,
        status: 'Applied',
        applied_at: appliedOn,
      }).select('id, status').single();
      if (error?.code === '23505') return 'conflict';
      if (error) throw error;
      return data as ApplicationRow;
    },
    async promoteWishlist(userId, id, appliedOn) {
      const { data, error } = await supabase.from('job_applications')
        .update({ status: 'Applied', applied_at: appliedOn })
        .eq('id', id).eq('user_id', userId).eq('status', 'Wishlist')
        .select('id, status').maybeSingle();
      if (error) throw error;
      return data as ApplicationRow | null;
    },
    async insertSubmission(userId, applicationId, update) {
      const { error } = await supabase.from('job_application_submissions').insert({
        user_id: userId,
        application_id: applicationId,
        attempt_id: update.attemptId,
        confirmation_source: update.confirmation,
        evidence_kind: update.evidence.kind,
        platform: update.evidence.platform,
        detector: update.evidence.detector,
        network_verdict: update.evidence.verdict ?? null,
        http_status: update.evidence.status ?? null,
        rule_version: update.evidence.ruleVersion,
        confirmed_at: update.confirmedAt,
      });
      if (missingTable(error)) return 'unavailable';
      if (error?.code === '23505') return 'duplicate';
      if (error) throw error;
      return 'inserted';
    },
  };
}
