/** One manual retry for campaign messages proven absent from the SMTP provider log. */
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { getCampaignFromHeader, getCampaignSmtpOptions } from '../lib/notifications/campaign-smtp';
import { registerEmailCampaign } from '../lib/notifications/campaign-send';
import { renderCampaignSource } from '../lib/notifications/campaign-template';
import { campaignTrackingSchema, getCampaignSigningSecret, instrumentCampaignEmail } from '../lib/notifications/campaign-tracking';
import { createUnsubscribeToken } from '../lib/notifications/campaign-unsubscribe';

const directory = resolve(process.cwd(), '../../docs/marketing/updates/2026-09-28');
const reviewedSchema = z.array(z.object({ id: z.string().uuid(), email_address: z.string().email() }))
  .min(1).max(20).refine(rows => new Set(rows.map(row => row.id)).size === rows.length, 'Repeated message ID');
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

async function main() {
  const { values } = parseArgs({ strict: true, options: {
    'env-file': { type: 'string' }, 'postal-address-file': { type: 'string' },
    'reviewed-file': { type: 'string' }, send: { type: 'boolean' },
  } });
  if (!values['env-file'] || !values['postal-address-file'] || !values['reviewed-file'] ||
    ![values['env-file'], values['postal-address-file'], values['reviewed-file']].every(isAbsolute)) {
    throw new Error('Provide absolute private --env-file, --postal-address-file and --reviewed-file paths');
  }
  if (loadEnv({ path: values['env-file'], quiet: true }).error) throw new Error('Unable to load server environment');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Server Supabase configuration is required');
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const reviewed = reviewedSchema.parse(JSON.parse(await readFile(values['reviewed-file'], 'utf8')));
  const { subject, html, text } = renderCampaignSource(
    await readFile(resolve(directory, 'email.html'), 'utf8'),
    await readFile(resolve(directory, 'email.txt'), 'utf8'),
    await readFile(values['postal-address-file'], 'utf8'));
  const campaign = campaignTrackingSchema.parse(JSON.parse(await readFile(resolve(directory, 'tracking.json'), 'utf8')));
  const ready: Array<{ id: string; userId: string; email: string; firstName: string | null;
    emailData: Record<string, unknown> }> = [];
  for (const item of reviewed) {
    const result = await supabase.from('email_queue').select('id,user_id,email_address,status,email_data')
      .eq('id', item.id).single();
    if (result.error || !result.data || result.data.status !== 'campaign_unknown' ||
      result.data.email_address?.trim().toLowerCase() !== item.email_address.trim().toLowerCase() ||
      result.data.email_data?.campaign_id !== campaign.id || result.data.email_data?.manual_retry_attempted_at) {
      throw new Error('Reviewed message no longer matches a first-attempt unknown reservation');
    }
    const userId = result.data.user_id;
    const account = await supabase.auth.admin.getUserById(userId);
    if (account.error || !account.data.user?.email_confirmed_at || account.data.user.deleted_at ||
      account.data.user.email?.trim().toLowerCase() !== item.email_address.trim().toLowerCase()) {
      throw new Error('Reviewed account is unverified, deleted, or changed email');
    }
    const [profile, preferences, blocked, payments] = await Promise.all([
      supabase.from('profiles').select('email,first_name,premium_status').eq('user_id', userId).maybeSingle(),
      supabase.from('email_preferences').select('marketing_emails').eq('user_id', userId).maybeSingle(),
      supabase.from('blocked_emails').select('email'),
      supabase.from('payment_transactions').select('id').eq('user_id', userId).limit(1),
    ]);
    if (profile.error || preferences.error || blocked.error || payments.error) throw new Error('Audience recheck failed');
    const email = item.email_address.trim().toLowerCase();
    if ((profile.data ? profile.data.premium_status !== false : !!payments.data?.length) ||
      (profile.data?.email && profile.data.email.trim().toLowerCase() !== email) ||
      preferences.data?.marketing_emails === false ||
      (blocked.data || []).some(row => row.email.trim().toLowerCase() === email)) {
      throw new Error('Reviewed account is now paid, opted out, or suppressed');
    }
    ready.push({ id: item.id, userId, email, firstName: profile.data?.first_name ?? null,
      emailData: result.data.email_data as Record<string, unknown> });
  }
  console.log(JSON.stringify({ campaignId: campaign.id, reviewed: ready.length, dryRun: !values.send }));
  if (!values.send) return;
  const secret = getCampaignSigningSecret();
  if (!secret) throw new Error('A production campaign signing secret is required');
  const transporter = nodemailer.createTransport(getCampaignSmtpOptions());
  const counts = { sent: 0, needsReview: 0 };
  try {
    await transporter.verify();
    await registerEmailCampaign(supabase, campaign, { subject, html, text });
    for (const recipient of ready) {
      const unsubscribe = new URL('/api/notifications/campaign/unsubscribe', 'https://www.trackmyopt.com');
      unsubscribe.searchParams.set('token', createUnsubscribeToken(recipient.id, secret));
      const bodies = instrumentCampaignEmail({
        html: html.replaceAll('{{firstName}}', () => escapeHtml(recipient.firstName || 'there'))
          .replaceAll('{{UNSUBSCRIBE_URL}}', unsubscribe.toString()),
        text: text.replaceAll('{{firstName}}', () => recipient.firstName || 'there')
          .replaceAll('{{UNSUBSCRIBE_URL}}', unsubscribe.toString()),
        messageId: recipient.id, campaign, secret, baseUrl: 'https://www.trackmyopt.com',
      });
      if (/\{\{[^{}]+\}\}/.test(bodies.html + bodies.text)) throw new Error('Unresolved campaign template field');
      const reserved = await supabase.from('email_queue')
        .update({ status: 'campaign_sending', email_data: {
          ...recipient.emailData, manual_retry_attempted_at: new Date().toISOString(),
          manual_retry_reason: 'no_provider_log_after_review',
        } }).eq('id', recipient.id).eq('status', 'campaign_unknown').select('id');
      if (reserved.error || reserved.data?.length !== 1) throw new Error('Manual retry reservation changed');
      try {
        const info = await transporter.sendMail({
          from: getCampaignFromHeader(), to: recipient.email, replyTo: 'support@trackmyopt.com',
          subject, headers: { 'List-Unsubscribe': `<${unsubscribe}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }, ...bodies,
        });
        if (!info.accepted?.length) throw new Error('SMTP did not accept the recipient');
        const saved = await supabase.from('email_queue').update({ status: 'sent',
          sent_at: new Date().toISOString(), provider_message_id: info.messageId,
          error_message: null }).eq('id', recipient.id).eq('status', 'campaign_sending').select('id');
        if (saved.error || saved.data?.length !== 1) throw new Error('Accepted by SMTP but database update failed');
        counts.sent++;
      } catch {
        await supabase.from('email_queue').update({ status: 'campaign_unknown',
          error_message: 'Reviewed manual retry outcome needs provider confirmation; do not automatically retry',
        }).eq('id', recipient.id).eq('status', 'campaign_sending');
        counts.needsReview++;
      }
    }
  } finally {
    transporter.close();
    console.log(JSON.stringify(counts));
  }
  if (counts.needsReview) process.exitCode = 1;
}

main().catch(error => { console.error(error instanceof Error ? error.message : 'Manual retry stopped'); process.exitCode = 1; });
