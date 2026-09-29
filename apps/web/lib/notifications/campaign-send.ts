import { createHash, randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SendMailOptions, SentMessageInfo } from 'nodemailer';
import { instrumentCampaignEmail, type CampaignTracking } from './campaign-tracking';
import { createUnsubscribeToken } from './campaign-unsubscribe';

export async function registerEmailCampaign(supabase: SupabaseClient, campaign: CampaignTracking, content: {
  subject: string; html: string; text: string;
}): Promise<void> {
  const hash = createHash('sha256').update(JSON.stringify([
    content.subject, content.html, content.text,
    Object.entries(campaign.links).sort(([a], [b]) => a.localeCompare(b)),
  ])).digest('hex');
  const { error } = await supabase.from('email_campaigns').upsert({
    id: campaign.id, subject: content.subject, tracked_links: campaign.links, content_hash: hash,
  }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw new Error('Campaign registration failed; check the tracking migration');
  const result = await supabase.from('email_campaigns').select('content_hash').eq('id', campaign.id).single();
  if (result.error || result.data?.content_hash !== hash) {
    throw new Error('Campaign ID already has different content; use a new campaign ID');
  }
}

export async function sendTrackedCampaignEmail(args: {
  supabase: SupabaseClient; campaign: CampaignTracking; secret: string; baseUrl: string;
  userId: string; email: string; subject: string; html: string; text: string; from: string;
  replyTo?: string;
  sendMail: (options: SendMailOptions) => Promise<SentMessageInfo>;
}): Promise<'sent' | 'duplicate' | 'failed' | 'needs_review'> {
  const id = randomUUID();
  const unsubscribe = new URL('/api/notifications/campaign/unsubscribe', args.baseUrl);
  unsubscribe.searchParams.set('token', createUnsubscribeToken(id, args.secret));
  const bodies = instrumentCampaignEmail({ ...args, messageId: id,
    html: args.html.replaceAll('{{UNSUBSCRIBE_URL}}', unsubscribe.toString()),
    text: args.text.replaceAll('{{UNSUBSCRIBE_URL}}', unsubscribe.toString()),
  });
  if (/\{\{[^{}]+\}\}/.test(bodies.html + bodies.text)) throw new Error('Resolve all template fields before sending');
  const reserved = await args.supabase.from('email_queue').insert({
    id, user_id: args.userId, email_address: args.email.trim().toLowerCase(),
    email_type: 'service_announcement', email_subject: args.subject,
    email_data: { campaign_id: args.campaign.id }, status: 'campaign_sending',
  });
  if (reserved.error?.code === '23505') return 'duplicate';
  if (reserved.error) return 'failed'; // No send without a durable per-recipient reservation.

  try {
    // A single SMTP attempt. Retrying an ambiguous result can deliver duplicates.
    const info = await args.sendMail({ from: args.from, to: args.email, subject: args.subject, replyTo: args.replyTo,
      headers: { 'List-Unsubscribe': `<${unsubscribe}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }, ...bodies });
    if (!info.accepted?.length) throw new Error('SMTP did not accept the recipient');
    const saved = await args.supabase.from('email_queue').update({
      status: 'sent', sent_at: new Date().toISOString(), provider_message_id: info.messageId,
    }).eq('id', id);
    return saved.error ? 'needs_review' : 'sent';
  } catch {
    await args.supabase.from('email_queue').update({
      status: 'campaign_unknown', error_message: 'SMTP outcome needs review; do not automatically resend this campaign message',
    }).eq('id', id);
    return 'needs_review';
  }
}
