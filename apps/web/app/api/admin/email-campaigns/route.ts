import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/api/secure-compare';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { campaignIdSchema } from '@/lib/notifications/campaign-tracking';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !safeEqual(request.headers.get('authorization') || '', `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const id = campaignIdSchema.safeParse(request.nextUrl.searchParams.get('id'));
  if (!id.success) return NextResponse.json({ error: 'Provide a valid campaign id' }, { status: 400 });
  try {
    const { data, error } = await getSupabaseAdminClient().rpc('get_email_campaign_metrics', { p_campaign_id: id.data });
    if (error) return NextResponse.json({ error: 'Campaign report unavailable; check the tracking migration' }, { status: 503 });
    if (!data) return NextResponse.json({ error: 'No tracked campaign with this ID yet' }, { status: 404 });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Campaign report unavailable' }, { status: 503 });
  }
}
