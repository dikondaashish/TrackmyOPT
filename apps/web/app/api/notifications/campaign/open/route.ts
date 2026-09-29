import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret, isKnownAutomatedEmailRequest, verifyCampaignToken } from '@/lib/notifications/campaign-tracking';

export const dynamic = 'force-dynamic';
const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const headers = { 'Content-Type': 'image/gif', 'Cache-Control': 'private, no-store, max-age=0', 'Referrer-Policy': 'no-referrer' };

export async function GET(request: NextRequest) {
  const token = verifyCampaignToken(request.nextUrl.searchParams.get('token'), getCampaignSigningSecret());
  if (token?.kind === 'open') {
    try {
      const { error } = await getSupabaseAdminClient().rpc('record_email_campaign_event', {
        p_message_id: token.messageId, p_event_type: 'open', p_link_key: '',
        p_known_automated: isKnownAutomatedEmailRequest(request.headers),
      });
      if (error) console.error('Campaign open recording failed');
    } catch { console.error('Campaign open recording unavailable'); }
  }
  // Return the same image even for expired/invalid tokens; no recipient oracle.
  return new NextResponse(pixel, { headers });
}

export async function HEAD() {
  return new NextResponse(null, { headers }); // A preview HEAD request is not an open.
}
