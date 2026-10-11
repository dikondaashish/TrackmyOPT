import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SendMailOptions, SentMessageInfo } from 'nodemailer';
import Stripe from 'stripe';
import { z } from 'zod';
import { PLAN_PRICES, PRO_PAID_INTRO } from '@/lib/pricing/plan-config';
import { getCampaignSigningSecret } from './campaign-tracking';
import { createUnsubscribeToken } from './campaign-unsubscribe';
import { getCampaignFromHeader, getCampaignSmtpOptions } from './campaign-smtp';
import {
  buildTransactionalEmail,
  emailPrimaryButton,
  emailTextP,
  emailTextMuted,
} from './email-layout';
import { escapeHtml } from './transactional/formatting';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/require-live-key-in-production';

export const CASE_PROMOTION_TYPES = [
  'pending_case_first',
  'pending_case_followup',
  'checkout_recovery',
] as const;
export type CasePromotionKind = (typeof CASE_PROMOTION_TYPES)[number];
export const MONITORING_ORIGIN = 'https://www.trackmyopt.com';
export function pendingCaseEmailsEnabled() {
  return process.env.PENDING_CASE_EMAILS_ENABLED === 'true';
}

/** Provider approval is explicit; the owner authorized the existing Zoho exception. */
export function requireCasePromotionProvider(
  env: Record<string, string | undefined> = process.env
) {
  if (env.CAMPAIGN_MARKETING_PROVIDER_APPROVED !== 'true') {
    throw new Error(
      'Pending case emails require documented marketing-provider approval'
    );
  }
  getCampaignFromHeader(env);
  return getCampaignSmtpOptions(env);
}

export { isVerifiedPendingCase } from '@/lib/case-status/pending-case-promotion';
import { isVerifiedPendingCase } from '@/lib/case-status/pending-case-promotion';

function sign(value: string, secret: string) {
  return createHmac('sha256', secret)
    .update('pending-case-offer-v1:' + value)
    .digest('base64url');
}
export function createMonitoringToken(
  id: string,
  secret: string,
  now = Date.now()
) {
  if (!z.string().uuid().safeParse(id).success || !secret)
    throw new Error('Invalid monitoring link configuration');
  const value = Buffer.from(
    JSON.stringify({ id, expires: now + 14 * 24 * 3600_000 })
  ).toString('base64url');
  return value + '.' + sign(value, secret);
}
export function verifyMonitoringToken(
  token: string | null,
  secret = getCampaignSigningSecret(),
  now = Date.now()
): string | null {
  if (!token || !secret || token.length > 512) return null;
  const [value, signed, extra] = token.split('.');
  if (!value || !signed || extra) return null;
  const expected = Buffer.from(sign(value, secret));
  const actual = Buffer.from(signed);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    return null;
  try {
    const parsed = z
      .object({ id: z.string().uuid(), expires: z.number().int() })
      .safeParse(JSON.parse(Buffer.from(value, 'base64url').toString()));
    return parsed.success && parsed.data.expires > now ? parsed.data.id : null;
  } catch {
    return null;
  }
}

export async function recordPendingCaseEmailSequence(
  supabase: SupabaseClient,
  userId: string,
  caseId: string
) {
  if (!pendingCaseEmailsEnabled()) return;
  try {
    const result = await supabase.rpc('record_pending_case_email_sequence', {
      p_user_id: userId,
      p_case_id: caseId,
    });
    if (result.error) console.error('Pending case email enrollment failed');
  } catch {
    console.error('Pending case email enrollment failed');
  }
}

export async function loadCasePromotionRecipient(
  supabase: SupabaseClient,
  userId: string,
  requireCase = true
) {
  const [profile, preference, account, sequence, payments] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'premium_status,plan_tier,pro_free_trial_consumed,stripe_customer_id'
      )
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('email_preferences')
      .select('marketing_emails')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.auth.admin.getUserById(userId),
    supabase
      .from('pending_case_email_sequences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('payment_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'succeeded')
      .limit(1),
  ]);
  if (
    profile.error ||
    preference.error ||
    sequence.error ||
    payments.error ||
    (account.error && account.error.status !== 404)
  )
    throw new Error('Case promotion eligibility unavailable');
  const user = account.data?.user;
  const p = profile.data;
  const s = sequence.data;
  if (
    !user?.email_confirmed_at ||
    !user.email ||
    user.is_anonymous ||
    !p ||
    p.premium_status !== false ||
    ![null, 'free'].includes(p.plan_tier ?? null) ||
    p.pro_free_trial_consumed === true ||
    preference.data?.marketing_emails !== true ||
    payments.data?.length
  )
    return null;
  const email = user.email.trim().toLowerCase();
  const block = await supabase
    .from('blocked_emails')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (block.error) throw new Error('Case promotion suppression unavailable');
  if (block.data) return null;
  if (requireCase || s) {
    if (!s?.case_id) return null;
    const c = await supabase
      .from('case_status')
      .select('current_status,last_checked_at,last_check_failed_at')
      .eq('id', s.case_id)
      .eq('user_id', userId)
      .maybeSingle();
    if (c.error)
      throw new Error('Case promotion case verification unavailable');
    if (!c.data || !isVerifiedPendingCase(c.data)) return null;
  }
  // A delayed webhook must not cause a paid customer to receive this offer.
  if (p.stripe_customer_id) {
    if (!process.env.STRIPE_SECRET_KEY)
      throw new Error('Case promotion billing verification unavailable');
    requireLiveStripeKeyInProduction();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-08-26.dahlia',
    });
    const subscriptions = await stripe.subscriptions.list({
      customer: p.stripe_customer_id,
      status: 'all',
      limit: 1,
    });
    if (subscriptions.data.length) return null;
  }
  return { email, sequence: s };
}

export function buildPendingCaseEmail(
  kind: 'pending_case_first' | 'pending_case_followup',
  url: string,
  unsubscribe: string
) {
  const first = kind === 'pending_case_first';
  const subject = first
    ? 'Let Pro handle your daily USCIS checks'
    : 'A quick note about daily case alerts';
  const lines = first
    ? [
        'Your case is saved. With Pro, we check USCIS daily and email you when we detect a status change.',
        'For supported OPT/STEM cases, see an estimated decision window based on comparable community timelines when enough data is available.',
      ]
    : [
        'Manual tracking stays free. Pro adds daily checks and status-change emails. It cannot speed up a USCIS decision.',
        'Questions about the offer or cancellation? Reply—we’ll help.',
      ];
  const price = `Eligible accounts: $${PRO_PAID_INTRO.price.toFixed(2)} for ${PRO_PAID_INTRO.durationDays} days, then $${PLAN_PRICES.pro.month.toFixed(2)}/month. Choose annual billing for renewal at $${PLAN_PRICES.pro.year.toFixed(2)}/year instead. Cancel before renewal in Settings → Subscription.`;
  const footer =
    'TrackMyOPT product offer · Zyene, Inc. · 28 Geary St Ste 650 #1892, San Francisco, CA 94108';
  return {
    subject,
    html: buildTransactionalEmail({
      headerTitle: 'Daily case monitoring',
      bodyHtml:
        lines.map((l) => emailTextP(escapeHtml(l))).join('') +
        emailPrimaryButton(url, 'See my monitoring options') +
        emailTextP(escapeHtml(price)) +
        emailTextMuted(
          'Estimates are not a USCIS promise. Keep checking official notices.'
        ) +
        emailTextMuted(footer) +
        emailTextMuted(
          `<a href="${escapeHtml(unsubscribe)}">Unsubscribe from product offers</a>`
        ),
    }),
    text:
      lines.join('\n\n') +
      '\n\nSee my monitoring options: ' +
      url +
      '\n\n' +
      price +
      '\n\n' +
      footer +
      '\nUnsubscribe: ' +
      unsubscribe,
  };
}

export async function sendCasePromotion(args: {
  supabase: SupabaseClient;
  userId: string;
  kind: CasePromotionKind;
  sendMail: (options: SendMailOptions) => Promise<SentMessageInfo>;
  recoveryBodies?: { subject: string; html: string; text: string };
}): Promise<{ status: 'sent' | 'skipped' | 'needs_review'; queueId?: string }> {
  if (!pendingCaseEmailsEnabled()) return { status: 'skipped' };
  requireCasePromotionProvider();
  const secret = getCampaignSigningSecret();
  if (!secret) throw new Error('Case promotion signing is not configured');
  const recipient = await loadCasePromotionRecipient(
    args.supabase,
    args.userId,
    args.kind !== 'checkout_recovery'
  );
  if (!recipient) return { status: 'skipped' };
  const id = randomUUID();
  const url = new URL('/premium/monitoring', MONITORING_ORIGIN);
  url.searchParams.set('token', createMonitoringToken(id, secret));
  const unsub = new URL(
    '/api/notifications/campaign/unsubscribe',
    MONITORING_ORIGIN
  );
  unsub.searchParams.set('token', createUnsubscribeToken(id, secret));
  const bodies =
    args.kind === 'checkout_recovery'
      ? args.recoveryBodies!
      : buildPendingCaseEmail(args.kind, url.toString(), unsub.toString());
  if (!bodies) throw new Error('Recovery email content is missing');
  const recoveryFooter = emailTextMuted(
    `TrackMyOPT product offer · Zyene, Inc. · 28 Geary St Ste 650 #1892, San Francisco, CA 94108 · <a href="${escapeHtml(unsub.toString())}">Unsubscribe</a>`
  );
  const html =
    args.kind === 'checkout_recovery'
      ? bodies.html.replace('</body>', recoveryFooter + '</body>')
      : bodies.html;
  const text =
    args.kind === 'checkout_recovery'
      ? bodies.text +
        '\nTrackMyOPT product offer · 28 Geary St Ste 650 #1892, San Francisco, CA 94108\nUnsubscribe: ' +
        unsub
      : bodies.text;
  const reserve = await args.supabase.rpc('reserve_case_promotion', {
    p_user_id: args.userId,
    p_kind: args.kind,
    p_message_id: id,
    p_subject: bodies.subject,
    p_email: recipient.email,
  });
  if (reserve.error) throw new Error('Case promotion reservation failed');
  if (!reserve.data) return { status: 'skipped' };
  // Revalidate after reservation, immediately before the external send.
  const live = await loadCasePromotionRecipient(
    args.supabase,
    args.userId,
    args.kind !== 'checkout_recovery'
  );
  if (!live || live.email !== recipient.email) {
    const cancel = await args.supabase
      .from('email_queue')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (cancel.error) throw new Error('Case promotion cancellation failed');
    return { status: 'skipped' };
  }
  try {
    const info = await args.sendMail({
      from: getCampaignFromHeader(),
      replyTo: 'support@trackmyopt.com',
      to: live.email,
      subject: bodies.subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsub}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    if (!info.accepted?.length)
      throw new Error('Case promotion SMTP acceptance unavailable');
    const saved = await args.supabase
      .from('email_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_message_id: info.messageId,
      })
      .eq('id', id);
    if (saved.error) {
      console.error('Case promotion sent result persistence failed');
      return { status: 'needs_review', queueId: id };
    }
    return { status: 'sent', queueId: id };
  } catch {
    console.error('Case promotion SMTP outcome requires review');
    const held = await args.supabase
      .from('email_queue')
      .update({
        status: 'campaign_unknown',
        error_message: 'SMTP outcome requires review; no automatic resend',
      })
      .eq('id', id);
    if (held.error)
      console.error('Case promotion ambiguous result persistence failed');
    return { status: 'needs_review', queueId: id };
  }
}
