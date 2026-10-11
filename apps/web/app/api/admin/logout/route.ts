import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
async function handlePOST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: 'Request origin not allowed' },
      { status: 403, headers }
    );
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers });
  } catch {
    return NextResponse.json(
      { error: 'Unable to sign out. Please try again.' },
      { status: 503, headers }
    );
  }
}

export const POST = withSentryApiErrors(handlePOST, '/api/admin/logout', 'POST');
