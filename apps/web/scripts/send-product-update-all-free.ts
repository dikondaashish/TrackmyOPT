/** One reviewed product update to every verified Free account. Dry run unless --send is explicit. */
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import nodemailer from 'nodemailer';
import { selectFreeCampaignRecipients, type FreeCampaignProfile } from '../lib/notifications/campaign-audience';
import { getCampaignFromHeader, getCampaignSmtpOptions } from '../lib/notifications/campaign-smtp';
import { registerEmailCampaign, sendTrackedCampaignEmail } from '../lib/notifications/campaign-send';
import { renderCampaignSource } from '../lib/notifications/campaign-template';
import { campaignTrackingSchema, getCampaignSigningSecret, instrumentCampaignEmail } from '../lib/notifications/campaign-tracking';

const directory = resolve(process.cwd(), '../../docs/marketing/updates/2026-09-28');
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

async function main() {
  const { values } = parseArgs({ strict: true, options: {
    'env-file': { type: 'string' }, 'postal-address-file': { type: 'string' },
    send: { type: 'boolean' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('send-product-update-all-free --env-file /private/production.env --postal-address-file /private/address.txt [--send]');
    console.log('Without --send: read-only audience and content preflight. --send: register the campaign and send once to verified Free accounts, excluding opt-outs and blocked addresses.');
    return;
  }
  if (!values['postal-address-file'] || !isAbsolute(values['postal-address-file']) ||
    (values['env-file'] && !isAbsolute(values['env-file']))) throw new Error('Use absolute private environment and postal-address paths');
  if (values['env-file'] && loadEnv({ path: values['env-file'], quiet: true }).error) throw new Error('Unable to load server environment');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is required');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { subject, html, text } = renderCampaignSource(
    await readFile(resolve(directory, 'email.html'), 'utf8'),
    await readFile(resolve(directory, 'email.txt'), 'utf8'),
    await readFile(values['postal-address-file'], 'utf8'),
  );
  const campaign = campaignTrackingSchema.parse(JSON.parse(await readFile(resolve(directory, 'tracking.json'), 'utf8')));
  instrumentCampaignEmail({ html: html.replaceAll('{{UNSUBSCRIBE_URL}}', 'https://www.trackmyopt.com/privacy'),
    text: text.replaceAll('{{UNSUBSCRIBE_URL}}', 'https://www.trackmyopt.com/privacy'),
    messageId: '00000000-0000-4000-8000-000000000000', campaign,
    secret: getCampaignSigningSecret() || 'dry-run-only', baseUrl: 'https://www.trackmyopt.com' });

  const profiles: FreeCampaignProfile[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await supabase.from('profiles')
      .select('user_id,email,first_name,premium_status,pro_free_trial_consumed')
      .order('user_id').range(offset, offset + 999);
    if (page.error) throw new Error('Unable to read current profiles');
    profiles.push(...(page.data || []));
    if ((page.data?.length || 0) < 1000) break;
  }
  const accounts = [];
  for (let page = 1; ; page++) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) throw new Error('Unable to read verified Auth users');
    accounts.push(...result.data.users);
    if (result.data.users.length < 1000) break;
  }
  const optedOutIds = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const page = await supabase.from('email_preferences').select('user_id')
      .eq('marketing_emails', false).order('user_id').range(offset, offset + 999);
    if (page.error) throw new Error('Unable to read product-email opt-outs');
    for (const row of page.data || []) optedOutIds.add(row.user_id);
    if ((page.data?.length || 0) < 1000) break;
  }
  const blockedEmails = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const page = await supabase.from('blocked_emails').select('email')
      .order('email').range(offset, offset + 999);
    if (page.error) throw new Error('Unable to read bounced and blocked addresses');
    for (const row of page.data || []) blockedEmails.add(row.email.trim().toLowerCase());
    if ((page.data?.length || 0) < 1000) break;
  }
  // A verified Auth account can lack a profile. Exclude it if there is any payment history.
  const paymentUserIds = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const page = await supabase.from('payment_transactions').select('user_id')
      .order('id').range(offset, offset + 999);
    if (page.error) throw new Error('Unable to read payment history');
    for (const row of page.data || []) paymentUserIds.add(row.user_id);
    if ((page.data?.length || 0) < 1000) break;
  }
  const recipients = selectFreeCampaignRecipients(profiles, accounts, optedOutIds, blockedEmails, paymentUserIds);
  const audience = { freeProfiles: profiles.filter(profile => profile.premium_status === false).length,
    noProfile: recipients.filter(recipient => !recipient.hasProfile).length, selected: recipients.length,
    introAvailable: recipients.filter(recipient => !recipient.introUsed).length,
    introUsed: recipients.filter(recipient => recipient.introUsed).length,
    excluded: accounts.length - recipients.length };
  console.log(JSON.stringify({ campaignId: campaign.id, subject, audience, dryRun: !values.send }));
  if (!recipients.length) throw new Error('No verified, unsuppressed Free recipients');
  if (!values.send) {
    console.log('Read-only dry run complete. No campaign registration or SMTP attempt.');
    return;
  }
  const secret = getCampaignSigningSecret();
  if (!secret) throw new Error('A production campaign signing secret is required');
  const from = getCampaignFromHeader();
  const transporter = nodemailer.createTransport(getCampaignSmtpOptions());
  let stopped = false;
  process.once('SIGINT', () => { stopped = true; console.error('Stopping after the current send group'); });
  const counts = { sent: 0, duplicate: 0, failed: 0, needsReview: 0, skippedChanged: 0 };
  try {
    await transporter.verify();
    await registerEmailCampaign(supabase, campaign, { subject, html, text });
    for (let offset = 0; offset < recipients.length && !stopped; offset += 25) {
      const batch = recipients.slice(offset, offset + 25);
      const ids = batch.map(recipient => recipient.userId);
      const [current, payments, preferences, blocked] = await Promise.all([
        supabase.from('profiles').select('user_id,premium_status').in('user_id', ids),
        supabase.from('payment_transactions').select('user_id').in('user_id', ids),
        supabase.from('email_preferences').select('user_id').in('user_id', ids).eq('marketing_emails', false),
        supabase.from('blocked_emails').select('email'),
      ]);
      if (current.error || payments.error || preferences.error || blocked.error) throw new Error('Audience changed or suppression recheck failed; sending stopped');
      const currentProfileById = new Map((current.data || []).map(row => [row.user_id, row]));
      const paidIds = new Set((payments.data || []).map(row => row.user_id));
      const newlyOptedOut = new Set((preferences.data || []).map(row => row.user_id));
      const newlyBlocked = new Set((blocked.data || []).map(row => row.email.trim().toLowerCase()));
      const ready = batch.filter(recipient => {
        const currentProfile = currentProfileById.get(recipient.userId);
        const freeNow = currentProfile ? currentProfile.premium_status === false : !paidIds.has(recipient.userId);
        const allowed = freeNow && !newlyOptedOut.has(recipient.userId) && !newlyBlocked.has(recipient.email);
        if (!allowed) counts.skippedChanged++;
        return allowed;
      });
      for (let inner = 0; inner < ready.length; inner += 5) {
        const group = ready.slice(inner, inner + 5);
        const outcomes = await Promise.all(group.map(recipient => sendTrackedCampaignEmail({
          supabase, campaign, secret, baseUrl: 'https://www.trackmyopt.com',
          userId: recipient.userId, email: recipient.email, subject,
          html: html.replaceAll('{{firstName}}', () => escapeHtml(recipient.firstName || 'there')),
          text: text.replaceAll('{{firstName}}', () => recipient.firstName || 'there'),
          from, replyTo: 'support@trackmyopt.com', sendMail: options => transporter.sendMail(options),
        })));
        for (const outcome of outcomes) {
          if (outcome === 'sent') counts.sent++;
          else if (outcome === 'duplicate') counts.duplicate++;
          else if (outcome === 'needs_review') counts.needsReview++;
          else counts.failed++;
        }
        if (counts.needsReview + counts.failed >= 10) throw new Error('Ten ambiguous or failed outcomes; stopped to protect the sender. Review admin report before retrying');
        if (stopped) break;
        await pause(300);
      }
      console.log(`Progress ${Math.min(offset + 25, recipients.length)}/${recipients.length}: ${JSON.stringify(counts)}`);
    }
  } finally {
    transporter.close();
    console.log(`Final campaign outcomes: ${JSON.stringify(counts)}`);
  }
  if (stopped || counts.needsReview || counts.failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Campaign stopped');
  process.exitCode = 1;
});
