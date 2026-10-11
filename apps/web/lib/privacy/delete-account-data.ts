import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteManyFromS3 } from '../aws/s3';

// Profiles stay until last so a failed attempt retains the billing pointer.
const USER_DATA_TABLES = [
  'case_status', 'email_queue', 'opt_status', 'employment_spans',
  'document_reminders', 'documents', 'ocr_jobs', 'document_passcodes',
  'email_preferences', 'notification_settings', 'payment_transactions',
  'job_applications', 'job_stages', 'resume_generations', 'resumes',
  'user_sessions', 'export_otps', 'passcode_otps',
  'insurance_eligibility_checks', 'application_profile',
  'private_application_answers', 'policy_consents', 'profiles',
] as const;

/** Retry-safe cleanup: keep document pointers until storage confirms deletion.
 * USCIS receipt cleanup runs atomically in the case/auth deletion triggers.
 * This is ordinary account deletion, not a legal-hold administration tool.
 */
export async function deleteAccountData(
  admin: SupabaseClient,
  userId: string,
  email?: string,
): Promise<void> {
  // Range paging avoids Supabase's default 1,000-row response limit.
  const keys: string[] = [];
  for (const [table, prefix] of [['documents', 'documents'], ['ocr_jobs', 'ocr-documents']] as const) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await admin.from(table)
        .select(table === 'documents' ? 's3_key,s3_bucket' : 's3_key')
        .eq('user_id', userId).order('id', { ascending: true })
        .range(offset, offset + 999)
        .overrideTypes<Array<{ s3_key: unknown; s3_bucket?: unknown }>, { merge: false }>();
      if (error) throw new Error('Account deletion: document lookup failed');
      for (const row of data ?? []) {
        if (table === 'ocr_jobs' && row.s3_key == null) continue;
        if (table === 'documents' && row.s3_bucket &&
            row.s3_bucket !== process.env.AWS_S3_BUCKET?.trim()) {
          throw new Error('Account deletion: unexpected storage bucket');
        }
        if (typeof row.s3_key !== 'string' || !row.s3_key.startsWith(`${prefix}/${userId}/`)) {
          throw new Error('Account deletion: invalid document ownership');
        }
        keys.push(row.s3_key);
      }
      if ((data?.length ?? 0) < 1000) break;
    }
  }
  if (keys.length) {
    try { await deleteManyFromS3(keys); }
    catch { throw new Error('Account deletion: storage cleanup failed'); }
  }
  for (const table of USER_DATA_TABLES) {
    const { error } = await admin.from(table).delete().eq('user_id', userId);
    if (error) throw new Error(`Account deletion: ${table} cleanup failed`);
  }
  // Ordinary deletion is not a reason to keep an email address indefinitely.
  if (email) {
    const { error } = await admin.from('blocked_emails').delete()
      .eq('email', email.toLowerCase()).eq('reason', 'account_deleted');
    if (error) throw new Error('Account deletion: email cleanup failed');
    const { error: noticeError } = await admin.from('policy_notice_email_events')
      .delete().eq('email', email.toLowerCase());
    if (noticeError) throw new Error('Account deletion: policy notice cleanup failed');
  }
}
