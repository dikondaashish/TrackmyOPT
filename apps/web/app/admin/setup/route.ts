import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canReadEmailCampaigns } from '@/lib/auth/email-campaign-admin';

export const dynamic = 'force-dynamic';
function redirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token_hash');
  if (!token || token.length > 256)
    return redirect(request, '/admin/login?error=setup');
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'invite',
    });
    if (error || !data.user || !data.session)
      return redirect(request, '/admin/login?error=setup');
    if (!canReadEmailCampaigns(data.user)) {
      await supabase.auth.signOut({ scope: 'local' });
      return redirect(request, '/admin/login?error=setup');
    }
    // The existing password page reads the newly established Supabase session.
    return redirect(request, '/auth/reset-password');
  } catch {
    return redirect(request, '/admin/login?error=setup');
  }
}
