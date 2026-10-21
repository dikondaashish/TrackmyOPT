/** Personal Verified Jobs note from Karthik, without open pixels or link rewriting. Dry run unless --send or --test-to. */
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import nodemailer from 'nodemailer';
import { getCampaignSmtpOptions } from '../lib/notifications/campaign-smtp';
import { getCampaignSigningSecret } from '../lib/notifications/campaign-tracking';
import { createUnsubscribeToken } from '../lib/notifications/campaign-unsubscribe';
import { outreachFields, parseOutreachSource, renderOutreach, type OutreachFields } from '../lib/notifications/verified-jobs-outreach';

const CAMPAIGN_ID = 'verified_jobs_outreach_2026_10';
const REPLY_TO = 'karthik@trackmyopt.com';
const POSTAL_ADDRESS = '28 Geary St Ste 650 #1892, San Francisco, CA 94108';
const directory = resolve(process.cwd(), '../../docs/marketing/updates/2026-10-20-verified-jobs');
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function readAll<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>, what: string) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await read(offset, offset + 999);
    if (page.error) throw new Error(`Unable to read ${what}`);
    rows.push(...(page.data || []));
    if ((page.data?.length || 0) < 1000) return rows;
  }
}

async function loadRecipients(supabase: SupabaseClient) {
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) throw new Error('Unable to read verified Auth users');
    users.push(...result.data.users);
    if (result.data.users.length < 1000) break;
  }
  const [profiles, dates, optOuts, blocked] = await Promise.all([
    readAll<{ user_id: string; first_name: string | null; major_name: string | null }>((from, to) =>
      supabase.from('profiles').select('user_id,first_name,major_name').order('user_id').range(from, to), 'profiles'),
    readAll<{ user_id: string; opt_ead_end_date: string | null; stem_ead_end_date: string | null }>((from, to) =>
      supabase.from('opt_status').select('user_id,opt_ead_end_date,stem_ead_end_date').order('user_id').range(from, to), 'OPT dates'),
    readAll<{ user_id: string }>((from, to) =>
      supabase.from('email_preferences').select('user_id').eq('marketing_emails', false).order('user_id').range(from, to), 'opt-outs'),
    readAll<{ email: string }>((from, to) =>
      supabase.from('blocked_emails').select('email').is('deleted_at', null).order('email').range(from, to), 'blocked addresses'),
  ]);
  const profileById = new Map(profiles.map(row => [row.user_id, row]));
  const datesById = new Map(dates.map(row => [row.user_id, row]));
  const optedOut = new Set(optOuts.map(row => row.user_id));
  const blockedEmails = new Set(blocked.map(row => row.email.trim().toLowerCase()));
  const seen = new Set<string>();
  const recipients: Array<{ userId: string; email: string; fields: OutreachFields }> = [];
  for (const user of users) {
    const email = user.email?.trim().toLowerCase();
    if (!email || !user.email_confirmed_at || user.is_anonymous || optedOut.has(user.id) ||
      blockedEmails.has(email) || seen.has(email)) continue;
    seen.add(email);
    const profile = profileById.get(user.id);
    const date = datesById.get(user.id);
    recipients.push({ userId: user.id, email, fields: outreachFields({
      profileFirstName: profile?.first_name, metadata: user.user_metadata, majorName: profile?.major_name,
      optEadEndDate: date?.opt_ead_end_date, stemEadEndDate: date?.stem_ead_end_date, lastSignInAt: user.last_sign_in_at,
    }) });
  }
  return recipients.sort((a, b) => a.userId.localeCompare(b.userId));
}

async function main() {
  const { values } = parseArgs({ strict: true, options: {
    'env-file': { type: 'string' }, wave: { type: 'string', default: 'engaged' }, 'per-hour': { type: 'string', default: '150' },
    limit: { type: 'string' }, 'test-to': { type: 'string' }, send: { type: 'boolean' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('send-verified-jobs-outreach --env-file /private/production.env [--wave engaged|all] [--per-hour 150] [--limit N] [--test-to you@example.com | --send]');
    console.log('Without --send or --test-to: read-only audience counts. --test-to: one sample email, no reservation. --send: one email per eligible address; reruns skip addresses already sent.');
    return;
  }
  if (values['env-file'] && (!isAbsolute(values['env-file']) || loadEnv({ path: values['env-file'], quiet: true }).error)) {
    throw new Error('Use an absolute, readable private environment file');
  }
  if (!['engaged', 'all'].includes(values.wave!)) throw new Error('--wave must be engaged or all');
  const perHour = Number(values['per-hour']);
  if (!Number.isInteger(perHour) || perHour < 1 || perHour > 600) throw new Error('--per-hour must be 1-600');
  const limit = values.limit ? Number(values.limit) : Infinity;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is required');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const source = { ...parseOutreachSource(await readFile(resolve(directory, 'email.txt'), 'utf8')),
    html: await readFile(resolve(directory, 'email.html'), 'utf8') };

  const sending = values.send || values['test-to'];
  const fromAddress = (process.env.CAMPAIGN_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || '').trim();
  if (sending && (!/^[a-z0-9._%+-]+@trackmyopt\.com$/i.test(fromAddress) || /no-?reply/i.test(fromAddress))) {
    throw new Error('Set CAMPAIGN_FROM_EMAIL to a real TrackMyOPT mailbox (not no-reply) verified in the SMTP provider');
  }
  const from = `Karthik from TrackMyOPT <${fromAddress}>`;

  if (values['test-to']) {
    const fields = outreachFields({ metadata: { first_name: 'Maya' }, majorName: 'Data Science',
      optEadEndDate: new Date(Date.now() + 145 * 86_400_000).toISOString().slice(0, 10) });
    const email = renderOutreach(source, fields, POSTAL_ADDRESS);
    const transporter = nodemailer.createTransport(getCampaignSmtpOptions());
    try {
      await transporter.verify();
      const info = await transporter.sendMail({ from, to: values['test-to'], replyTo: REPLY_TO, ...email });
      console.log(`Test email ${info.accepted?.length ? 'accepted' : 'not accepted'} by SMTP. Check which inbox tab it lands in.`);
    } finally {
      transporter.close();
    }
    return;
  }

  const everyone = await loadRecipients(supabase);
  const recipients = everyone.filter(recipient => values.wave === 'all' || recipient.fields.engaged).slice(0, limit);
  const count = (list: typeof everyone, segment: string) => list.filter(recipient => recipient.fields.segment === segment).length;
  console.log(JSON.stringify({ campaignId: CAMPAIGN_ID, wave: values.wave, dryRun: !values.send,
    eligible: everyone.length, selected: recipients.length,
    segments: { runway: count(recipients, 'runway'), major: count(recipients, 'major'), general: count(recipients, 'general') },
    noName: recipients.filter(recipient => !recipient.fields.named).length,
    hours: Math.ceil(recipients.length / perHour) }));
  for (const recipient of recipients) renderOutreach(source, recipient.fields, POSTAL_ADDRESS);
  if (!values.send) {
    console.log('Read-only dry run complete. Every selected email rendered. No reservation or SMTP attempt.');
    return;
  }

  const secret = getCampaignSigningSecret();
  if (!secret) throw new Error('The production campaign signing secret is required for one-click unsubscribe');
  const transporter = nodemailer.createTransport(getCampaignSmtpOptions());
  let stopped = false;
  process.once('SIGINT', () => { stopped = true; console.error('Stopping after the current email'); });
  const counts = { sent: 0, duplicate: 0, skippedChanged: 0, failed: 0, needsReview: 0 };
  try {
    await transporter.verify();
    for (let offset = 0; offset < recipients.length && !stopped; offset += 25) {
      const batch = recipients.slice(offset, offset + 25);
      const ids = batch.map(recipient => recipient.userId);
      const [preferences, blocked] = await Promise.all([
        supabase.from('email_preferences').select('user_id').in('user_id', ids).eq('marketing_emails', false),
        supabase.from('blocked_emails').select('email').in('email', batch.map(recipient => recipient.email)).is('deleted_at', null),
      ]);
      if (preferences.error || blocked.error) throw new Error('Opt-out recheck failed; sending stopped');
      const optedOut = new Set((preferences.data || []).map(row => row.user_id));
      const blockedEmails = new Set((blocked.data || []).map(row => row.email.trim().toLowerCase()));
      for (const recipient of batch) {
        if (stopped) break;
        if (optedOut.has(recipient.userId) || blockedEmails.has(recipient.email)) { counts.skippedChanged++; continue; }
        const email = renderOutreach(source, recipient.fields, POSTAL_ADDRESS);
        const id = randomUUID();
        const reserved = await supabase.from('email_queue').insert({
          id, user_id: recipient.userId, email_address: recipient.email, email_type: 'service_announcement',
          email_subject: email.subject, email_data: { campaign_id: CAMPAIGN_ID, segment: recipient.fields.segment },
          status: 'campaign_sending',
        });
        if (reserved.error?.code === '23505') { counts.duplicate++; continue; }
        if (reserved.error) { counts.failed++; continue; } // No send without a durable reservation.
        const unsubscribe = `https://www.trackmyopt.com/api/notifications/campaign/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(id, secret))}`;
        try {
          // One SMTP attempt per reservation; retrying an ambiguous result can deliver twice.
          const info = await transporter.sendMail({ from, to: recipient.email, replyTo: REPLY_TO, ...email,
            headers: { 'List-Unsubscribe': `<${unsubscribe}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } });
          if (!info.accepted?.length) throw new Error('SMTP did not accept the recipient');
          const saved = await supabase.from('email_queue').update({
            status: 'sent', sent_at: new Date().toISOString(), provider_message_id: info.messageId,
          }).eq('id', id);
          if (saved.error) counts.needsReview++; else counts.sent++;
        } catch {
          await supabase.from('email_queue').update({ status: 'campaign_unknown',
            error_message: 'SMTP outcome needs review; do not automatically resend this campaign message' }).eq('id', id);
          counts.needsReview++;
        }
        if (counts.failed + counts.needsReview >= 5) throw new Error('Five failed or ambiguous outcomes; stopped to protect the sender');
        await pause(3_600_000 / perHour);
      }
      console.log(`Progress ${Math.min(offset + 25, recipients.length)}/${recipients.length}: ${JSON.stringify(counts)}`);
    }
  } finally {
    transporter.close();
    console.log(`Final outcomes: ${JSON.stringify(counts)}`);
  }
  if (stopped || counts.failed || counts.needsReview) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Outreach stopped');
  process.exitCode = 1;
});
