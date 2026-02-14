/**
 * Rate Limit Status API
 * 
 * GET /api/documents/rate-limit
 * 
 * Returns current rate limit status for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRateLimitStatus, getTimeUntilReset } from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await getRateLimitStatus(user.id);

    return NextResponse.json({
      limit: 20,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
      timeUntilReset: getTimeUntilReset(rateLimit.resetAt),
      allowed: rateLimit.allowed,
    }, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    );
  }
}

