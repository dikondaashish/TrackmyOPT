import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret, isCampaignDestinationAllowed, isKnownAutomatedEmailRequest, verifyCampaignToken } from '@/lib/notifications/campaign-tracking';

export const dynamic = 'force-dynamic';
const fallback = 'https://www.trackmyopt.com/';
function redirect(url: string) {
  const response = NextResponse.redirect(url, 302);
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export async function GET(request: NextRequest) {
  const token = verifyCampaignToken(request.nextUrl.searchParams.get('token'), getCampaignSigningSecret());
  if (token?.kind !== 'click') return redirect(fallback);
  let destination = fallback;
  try {
    const supabase = getSupabaseAdminClient();
    const message = await supabase.from('email_queue').select('email_data,status')
      .eq('id', token.messageId).eq('email_type', 'service_announcement').maybeSingle();
    const id = message.data?.email_data?.campaign_id;
    if (message.error || typeof id !== 'string' || !['sent', 'campaign_sending', 'campaign_unknown'].includes(message.data?.status)) return redirect(fallback);
    const campaign = await supabase.from('email_campaigns').select('tracked_links').eq('id', id).maybeSingle();
    const url = campaign.data?.tracked_links?.[token.linkKey];
    if (campaign.error || typeof url !== 'string' || !isCampaignDestinationAllowed(url)) return redirect(fallback);
    destination = url;
    const { error } = await supabase.rpc('record_email_campaign_event', {
      p_message_id: token.messageId, p_event_type: 'click', p_link_key: token.linkKey,
      p_known_automated: isKnownAutomatedEmailRequest(request.headers),
    });
    if (error) console.error('Campaign click recording failed');
  } catch { console.error('Campaign click recording unavailable'); }
  return redirect(destination); // An analytics failure should not block a valid CTA.
}

export async function HEAD() {
  return new NextResponse(null, { headers: { 'Cache-Control': 'no-store' } });
}
