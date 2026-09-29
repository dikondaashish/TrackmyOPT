import { NextRequest, NextResponse } from 'next/server';
import { getEmailCampaignAdmin } from '@/lib/auth/email-campaign-admin';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { campaignIdSchema } from '@/lib/notifications/campaign-tracking';
import { getEmailCampaignReport, listEmailCampaigns } from '@/lib/notifications/campaign-reports';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const admin = await getEmailCampaignAdmin();
  const headers = { 'Cache-Control': 'private, no-store' };
  if (admin.status !== 'admin') {
    const status =
      admin.status === 'unavailable'
        ? 503
        : admin.status === 'forbidden'
          ? 403
          : 401;
    return NextResponse.json(
      {
        error:
          status === 503
            ? 'Authentication unavailable'
            : 'Admin sign-in required',
      },
      { status, headers }
    );
  }
  if (!request.nextUrl.searchParams.has('id')) {
    try {
      const campaigns = await listEmailCampaigns(getSupabaseAdminClient());
      return NextResponse.json({ campaigns }, { headers });
    } catch {
      return NextResponse.json(
        { error: 'Campaign list unavailable' },
        { status: 503, headers }
      );
    }
  }
  const id = campaignIdSchema.safeParse(request.nextUrl.searchParams.get('id'));
  if (!id.success)
    return NextResponse.json(
      { error: 'Provide a valid campaign id' },
      { status: 400, headers }
    );
  try {
    const data = await getEmailCampaignReport(getSupabaseAdminClient(), id.data);
    if (!data)
      return NextResponse.json(
        { error: 'No tracked campaign with this ID yet' },
        { status: 404, headers }
      );
    return NextResponse.json(data, { headers });
  } catch {
    return NextResponse.json(
      { error: 'Campaign report unavailable' },
      { status: 503, headers }
    );
  }
}
