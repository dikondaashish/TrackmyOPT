import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimitByIP,
  checkRateLimitByAccount,
  rateLimitResponse,
  AUTH_RATE_LIMIT,
} from '@/lib/auth/api-rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rateLimitResult = await checkRateLimitByIP(request, AUTH_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, 'Too many requests. Please try again later.');
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const accountRateLimit = await checkRateLimitByAccount(
      normalized,
      AUTH_RATE_LIMIT
    );
    if (!accountRateLimit.success) {
      return rateLimitResponse(
        accountRateLimit,
        'Too many requests. Please try again later.'
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('blocked_emails')
      .select('email')
      .eq('email', normalized)
      .maybeSingle();

    if (error) {
      console.error('Error checking blocked email:', error);
      return NextResponse.json({ blocked: false });
    }

    if (data) {
      return NextResponse.json({
        blocked: true,
        message:
          'This email has been permanently blocked. Previously deleted accounts cannot be recreated.',
      });
    }

    return NextResponse.json({ blocked: false });
  } catch (error) {
    console.error('Check blocked email error:', error);
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    );
  }
}
