import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Click-tracking redirect.
 *
 * ISS-034: prevents weaponization of TrackMyOPT email links by:
 *  1) Restricting destination to an allowlist of first-party hostnames.
 *  2) Verifying an HMAC signature (`sig`) computed over the URL when
 *     EMAIL_LINK_SIGNING_SECRET is set. Unsigned legacy links still work
 *     for the allowlist (same-domain only).
 */

const ALLOWED_HOSTS = new Set<string>([
  'www.trackmyopt.com',
  'trackmyopt.com',
  // Allow www variants of staging if needed via NEXT_PUBLIC_SITE_URL host
]);

try {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (siteUrl) ALLOWED_HOSTS.add(new URL(siteUrl).hostname);
} catch { /* ignore parse errors */ }

function isAllowedUrl(url: string): { ok: boolean; parsed: URL | null } {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, parsed: null };
    return { ok: ALLOWED_HOSTS.has(u.hostname), parsed: u };
  } catch {
    return { ok: false, parsed: null };
  }
}

function hmacSign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const url = searchParams.get('url');
  const sig = searchParams.get('sig');

  if (!id || !url) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 1) Allowlist (first defense — works even without signed links)
  const allow = isAllowedUrl(url);
  if (!allow.ok) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2) Optional HMAC signature check
  const signingSecret = process.env.EMAIL_LINK_SIGNING_SECRET;
  if (signingSecret) {
    if (!sig) {
      // Reject unsigned link when signing is configured
      return NextResponse.redirect(new URL('/', request.url));
    }
    const expected = hmacSign(`${id}|${url}`, signingSecret);
    // Constant-time compare
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { error } = await supabase
      .from('email_queue')
      .update({ clicked_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating click tracking:', error);
    }

    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.redirect(url);
  }
}
