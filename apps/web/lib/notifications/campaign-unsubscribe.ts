import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

function signature(messageId: string, secret: string) {
  return createHmac('sha256', secret).update(`campaign-unsubscribe-v1:${messageId}`).digest('base64url');
}

/** No email address in the token. Unsubscribe links remain usable after tracking expires. */
export function createUnsubscribeToken(messageId: string, secret: string): string {
  if (!secret || !z.string().uuid().safeParse(messageId).success) throw new Error('Invalid unsubscribe configuration');
  return `${messageId}.${signature(messageId, secret)}`;
}

export function verifyUnsubscribeToken(token: string | null, secret: string | undefined): string | null {
  if (!token || !secret || token.length > 128) return null;
  const [id, signed, extra] = token.split('.');
  if (extra || !signed || !z.string().uuid().safeParse(id).success) return null;
  const expected = Buffer.from(signature(id, secret));
  const actual = Buffer.from(signed);
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? id : null;
}

export async function unsubscribeCampaignRecipient(supabase: SupabaseClient, messageId: string): Promise<'ok' | 'missing' | 'unavailable'> {
  const message = await supabase.from('email_queue').select('user_id,email_address,email_data,status')
    .eq('id', messageId).eq('email_type', 'service_announcement').maybeSingle();
  if (message.error) return 'unavailable';
  const row = message.data;
  if (!row?.user_id || !row.email_address || !row.email_data?.campaign_id ||
    !['sent', 'campaign_sending', 'campaign_unknown'].includes(row.status)) return 'missing';

  // Updating only this field preserves the user's reminder address and OPT/STEM preferences.
  const update = () => supabase.from('email_preferences').update({ marketing_emails: false })
    .eq('user_id', row.user_id).select('user_id');
  const existing = await update();
  if (existing.error) return 'unavailable';
  if (existing.data?.length) return 'ok';
  const inserted = await supabase.from('email_preferences').insert({
    user_id: row.user_id, email_address: row.email_address, marketing_emails: false,
  });
  if (!inserted.error) return 'ok';
  if (inserted.error.code !== '23505') return 'unavailable';
  // Another request may have created preferences between update and insert.
  const raced = await update();
  return !raced.error && raced.data?.length ? 'ok' : 'unavailable';
}
