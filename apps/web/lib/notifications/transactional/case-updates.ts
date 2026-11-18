/**
 * Emails that bring an account back to its saved USCIS case:
 *
 * - free_case_update: a scheduled check recorded a status change on a Free
 *   account. The email says only that something changed. The status itself
 *   stays behind sign-in, which is what Free already gets on the case page.
 * - trial_progress: three days into the paid Pro introduction, a count of
 *   what monitoring has done so far.
 *
 * Neither email contains a receipt number or a status description.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextList,
  emailTextMuted,
  emailTextP,
  EMAIL,
} from '../email-layout';
import { caseEmailOptOutLink } from '../case-email-optout';
import { getCampaignSigningSecret } from '../campaign-tracking';
import { resolveActivePlanTier } from '@/lib/premium/user-plan-tier';
import { escapeHtml } from './formatting';
import {
  getAppBaseUrl,
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from './queue';

export const FREE_CASE_UPDATE_EMAIL_TYPE = 'free_case_update';
export const TRIAL_PROGRESS_EMAIL_TYPE = 'trial_progress';

/** One notice per account per window, however many saved cases changed. */
const FREE_CASE_UPDATE_WINDOW_HOURS = 20;

/** Set FREE_CASE_UPDATE_EMAILS=false in the web environment to pause sends. */
export function freeCaseUpdateEmailsEnabled(): boolean {
  return process.env.FREE_CASE_UPDATE_EMAILS !== 'false';
}

function greeting(firstName: string | null): string {
  return firstName?.trim() ? `Hi ${escapeHtml(firstName.trim())},` : 'Hi,';
}

export function buildFreeCaseUpdateEmailBodies(args: {
  firstName: string | null;
  optOutUrl: string;
}): { subject: string; html: string; text: string } {
  const caseUrl = `${getAppBaseUrl()}/dashboard/case-status?src=case_update_email`;
  const subject = 'Your USCIS case has an update';
  const html = buildTransactionalEmail({
    headerTitle: 'Your case has an update',
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting(args.firstName))}
${emailTextLead('We found a new USCIS status on your saved case.')}
${emailTextP('Sign in and refresh to see it.')}
${emailPrimaryButton(caseUrl, 'See the update')}
${emailTextMuted('On Pro, the new status is in the email itself.')}
${emailTextMuted('Not affiliated with USCIS. Your official USCIS notice controls.')}
${emailTextMuted(
  `You saved a USCIS case on TrackMyOPT. <a href="${escapeHtml(args.optOutUrl)}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Stop case emails</a>`
)}
${emailBodySectionClose()}`,
  });
  const text = [
    args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : 'Hi,',
    '',
    'We found a new USCIS status on your saved case.',
    'Sign in and refresh to see it.',
    '',
    caseUrl,
    '',
    'On Pro, the new status is in the email itself.',
    'Not affiliated with USCIS. Your official USCIS notice controls.',
    '',
    `You saved a USCIS case on TrackMyOPT. Stop case emails: ${args.optOutUrl}`,
  ].join('\n');
  return { subject, html, text };
}

export type FreeCaseUpdateResult =
  | QueueTransactionalResult
  | {
      ok: true;
      skipped: 'disabled' | 'not_free' | 'opted_out' | 'no_address';
    };

/**
 * Tell a Free account that a scheduled check recorded a change. Re-reads the
 * plan, the case and the email preferences at send time, so a case removed or
 * an upgrade made since the check does not produce a stale notice.
 */
export async function sendFreeCaseUpdateEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  caseId: string;
}): Promise<FreeCaseUpdateResult> {
  const { supabase, userId, caseId } = args;
  if (!freeCaseUpdateEmailsEnabled()) return { ok: true, skipped: 'disabled' };
  const secret = getCampaignSigningSecret();
  if (!secret) return { ok: false, error: 'signing_secret_missing' };

  const [profile, prefs, caseRow] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'email, notification_email, first_name, premium_status, subscription_expires_at, plan_tier'
      )
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('email_preferences')
      .select('email_enabled')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('case_status')
      .select('notifications_enabled')
      .eq('id', caseId)
      .eq('user_id', userId)
      .maybeSingle(),
  ]);
  if (profile.error || prefs.error || caseRow.error)
    return { ok: false, error: 'lookup_failed' };
  if (!profile.data || resolveActivePlanTier(profile.data) !== 'free')
    return { ok: true, skipped: 'not_free' };
  if (
    !caseRow.data?.notifications_enabled ||
    prefs.data?.email_enabled === false
  )
    return { ok: true, skipped: 'opted_out' };
  const address =
    profile.data.notification_email?.trim() || profile.data.email?.trim();
  if (!address) return { ok: true, skipped: 'no_address' };

  const { subject, html, text } = buildFreeCaseUpdateEmailBodies({
    firstName: profile.data.first_name ?? null,
    optOutUrl: caseEmailOptOutLink(getAppBaseUrl(), userId, secret),
  });
  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: address,
    emailType: FREE_CASE_UPDATE_EMAIL_TYPE,
    subject,
    html,
    text,
    emailData: { case_id: caseId },
    dedupe: {
      kind: 'recent_same_type',
      withinHours: FREE_CASE_UPDATE_WINDOW_HOURS,
    },
  });
}

/** Turn off case emails for every case the account saved, plus the weekly summary. */
export async function stopCaseEmails(
  supabase: SupabaseClient,
  userId: string
): Promise<'ok' | 'unavailable'> {
  const [cases, digest] = await Promise.all([
    supabase
      .from('case_status')
      .update({ notifications_enabled: false })
      .eq('user_id', userId),
    supabase
      .from('case_digest_preferences')
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId),
  ]);
  return cases.error || digest.error ? 'unavailable' : 'ok';
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

export function buildTrialProgressEmailBodies(args: {
  firstName: string | null;
  /** Scheduled checks that completed since the introduction started. */
  checks: number;
  /** Cases saved on the account. */
  cases: number;
  /** Status changes recorded since the introduction started. */
  changes: number;
  /** Already formatted for display, or null when unknown. */
  introEndDate: string | null;
}): { subject: string; html: string; text: string } {
  const base = getAppBaseUrl();
  const caseUrl = `${base}/dashboard/case-status`;
  const settingsUrl = `${base}/dashboard/settings`;
  const subject = 'Your first days on Pro: what we checked';
  const noCase = args.cases === 0;
  const summary = noCase
    ? 'No receipt added yet, so daily checks have not started.'
    : args.checks === 0
      ? 'Your case is saved and queued for its daily check.'
      : `We checked USCIS for you ${plural(args.checks, 'time')} across ${plural(args.cases, 'saved case')}.`;
  const outcome = noCase
    ? 'Add your receipt and we will check it every day.'
    : args.changes > 0
      ? `We recorded ${plural(args.changes, 'status change')}. See your case page.`
      : 'No status change so far. That is normal. We keep checking.';
  const steps = noCase
    ? [
        'Add your receipt on the case page.',
        'Confirm your alert email address.',
      ]
    : [
        'Confirm your alert email address.',
        'Add your other receipts. Pro tracks up to 8.',
        'Turn on daily OPT reminders.',
      ];
  const ending = args.introEndDate
    ? `Your introduction runs through ${args.introEndDate}. Then Pro renews on the plan you chose unless you cancel in Settings → Subscription.`
    : 'After the introduction, Pro renews on the plan you chose unless you cancel in Settings → Subscription.';

  const html = buildTransactionalEmail({
    headerTitle: 'What Pro has checked so far',
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(greeting(args.firstName))}
${emailTextLead(escapeHtml(summary))}
${emailTextP(escapeHtml(outcome))}
${emailPrimaryButton(caseUrl, noCase ? 'Add my receipt' : 'Open my case')}
${emailTextP('<strong>Worth doing now</strong>')}
${emailTextList(steps.map(escapeHtml))}
${emailTextMuted(
  `${escapeHtml(ending)} <a href="${settingsUrl}" class="tmo-force-link" style="color:${EMAIL.link} !important;">Open Settings</a>`
)}
${emailTextMuted('Checks are scheduled, not real-time, and do not affect USCIS processing.')}
${emailBodySectionClose()}`,
  });
  const text = [
    args.firstName?.trim() ? `Hi ${args.firstName.trim()},` : 'Hi,',
    '',
    summary,
    outcome,
    '',
    caseUrl,
    '',
    'Worth doing now:',
    ...steps.map((step) => `- ${step}`),
    '',
    `${ending} ${settingsUrl}`,
    'Checks are scheduled, not real-time, and do not affect USCIS processing.',
  ].join('\n');
  return { subject, html, text };
}

export async function sendTrialProgressEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  checks: number;
  cases: number;
  changes: number;
  introEndDate: string | null;
  /** email_queue id of the trial_started email this follows. */
  trialStartedId: string;
}): Promise<QueueTransactionalResult> {
  const { subject, html, text } = buildTrialProgressEmailBodies(args);
  return queueTransactionalEmailSend({
    supabase: args.supabase,
    userId: args.userId,
    emailAddress: args.toEmail,
    emailType: TRIAL_PROGRESS_EMAIL_TYPE,
    subject,
    html,
    text,
    emailData: { checks: args.checks, cases: args.cases, changes: args.changes },
    dedupe: {
      kind: 'email_data_key',
      key: 'trial_started_id',
      value: args.trialStartedId,
    },
  });
}
