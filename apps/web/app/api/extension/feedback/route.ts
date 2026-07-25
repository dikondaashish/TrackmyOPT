/**
 * POST /api/extension/feedback
 * In-popup "Feedback" form from the Chrome extension. Stores an NPS-style
 * rating (0–10), the aspect checkboxes, and a free-text comment. If a valid
 * extension bearer token is present, the feedback is linked to the user;
 * otherwise it's stored anonymously. Written via the service-role key.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import rateLimit from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

const feedbackLimiter = rateLimit({ interval: 3_600_000, name: 'extension-feedback' });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const getAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const { isRateLimited, unavailable } = await feedbackLimiter.check(req, 10, `extension-feedback:${ip}`);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: unavailable ? 503 : 429, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400, headers: corsHeaders });
    }

    const { rating, aspects, comment, version } = body as {
      rating?: unknown;
      aspects?: unknown;
      comment?: unknown;
      version?: unknown;
    };

    // Require at least a rating OR some aspect/comment so we don't store empties.
    const ratingNum =
      typeof rating === 'number' && Number.isInteger(rating) && rating >= 0 && rating <= 10
        ? rating
        : null;
    const aspectsArr = Array.isArray(aspects)
      ? aspects.filter((a): a is string => typeof a === 'string').slice(0, 20)
      : [];
    const commentStr = typeof comment === 'string' ? comment.slice(0, 4000) : '';

    if (ratingNum === null && aspectsArr.length === 0 && commentStr.trim() === '') {
      return NextResponse.json(
        { error: 'Please add a rating, an option, or a comment.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Optional: link to the user if a valid extension token is supplied.
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const decoded = await verifyToken(authHeader.substring(7));
      if (decoded) userId = decoded.userId || decoded.sub;
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('extension_feedback').insert({
      user_id: userId,
      rating: ratingNum,
      aspects: aspectsArr,
      comment: commentStr,
      version: typeof version === 'string' ? version.slice(0, 40) : null,
      ip_address: ip,
      user_agent: req.headers.get('user-agent') || 'Unknown',
    });

    if (error) {
      console.error('Extension feedback insert error:', error.message);
      return NextResponse.json(
        { error: 'Could not save feedback' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true, message: 'Feedback received' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Extension feedback error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
