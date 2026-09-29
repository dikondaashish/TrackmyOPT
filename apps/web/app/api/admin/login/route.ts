import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { canReadEmailCampaigns } from '@/lib/auth/email-campaign-admin';
import {
  AUTH_RATE_LIMIT,
  checkRateLimitByIP,
  checkRateLimitByAccount,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';

export const dynamic = 'force-dynamic';
const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});
const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: 'Request origin not allowed' },
      { status: 403, headers }
    );
  }
  try {
    const ipLimit = await checkRateLimitByIP(request, {
      ...AUTH_RATE_LIMIT,
      name: 'email-admin-login',
    });
    if (!ipLimit.success) return rateLimitResponse(ipLimit);
    const input = schema.safeParse(await request.json().catch(() => null));
    if (!input.success)
      return NextResponse.json(
        { error: 'Enter a valid email and password' },
        { status: 400, headers }
      );
    const accountLimit = await checkRateLimitByAccount(input.data.email, {
      ...AUTH_RATE_LIMIT,
      name: 'email-admin-login',
    });
    if (!accountLimit.success) return rateLimitResponse(accountLimit);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(input.data);
    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { error: 'Invalid email, password, or admin access' },
        { status: 401, headers }
      );
    }
    if (!canReadEmailCampaigns(data.user)) {
      await supabase.auth.signOut({ scope: 'local' });
      return NextResponse.json(
        { error: 'Invalid email, password, or admin access' },
        { status: 401, headers }
      );
    }
    return NextResponse.json({ success: true }, { headers });
  } catch {
    return NextResponse.json(
      { error: 'Sign-in is temporarily unavailable. Please try again.' },
      { status: 503, headers }
    );
  }
}
