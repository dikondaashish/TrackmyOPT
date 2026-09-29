import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret } from '@/lib/notifications/campaign-tracking';
import { unsubscribeCampaignRecipient, verifyUnsubscribeToken } from '@/lib/notifications/campaign-unsubscribe';

export const dynamic = 'force-dynamic';
const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

function page(title: string, message: string, status = 200, form = '') {
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · TrackMyOPT</title></head><body style="margin:0;background:#f6f8fb;color:#17243a;font:16px/1.6 system-ui,sans-serif"><main style="max-width:480px;margin:64px auto;padding:24px"><p>TrackMyOPT</p><h1 style="font-size:28px">${title}</h1><p>${message}</p>${form}<p>Need help? <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a></p></main></body></html>`, { status, headers });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!verifyUnsubscribeToken(token, getCampaignSigningSecret())) {
    return page('Link unavailable', 'Open the unsubscribe link in your TrackMyOPT product email, or contact support.', 400);
  }
  // GET/HEAD never mutate preferences: mail scanners routinely visit links.
  return page('Unsubscribe from product emails?', 'Stop TrackMyOPT product updates and offers. Your case alerts and deadline reminders will keep their current settings.', 200,
    `<form method="post" action="/api/notifications/campaign/unsubscribe?token=${encodeURIComponent(token!)}"><button type="submit" style="border:0;border-radius:8px;background:#155eef;color:white;padding:14px 22px;font:inherit;cursor:pointer">Unsubscribe</button></form>`);
}

export async function POST(request: NextRequest) {
  const messageId = verifyUnsubscribeToken(request.nextUrl.searchParams.get('token'), getCampaignSigningSecret());
  if (!messageId) return page('Link unavailable', 'Open the unsubscribe link in your product email, or contact support.', 400);
  // Accepts the confirmation form and RFC 8058 one-click POSTs without requiring login/cookies.
  try {
    const result = await unsubscribeCampaignRecipient(getSupabaseAdminClient(), messageId);
    if (result === 'ok') return page('You’re unsubscribed', 'You will no longer receive TrackMyOPT product updates and offers. Your case alerts and deadline reminders keep their current settings.');
    if (result === 'missing') return page('Link unavailable', 'We could not find this product email. Contact support to unsubscribe.', 404);
  } catch { /* Do not expose recipient records or database details. */ }
  return page('Please try again', 'We could not save your preference. Please try again shortly, or contact support to unsubscribe.', 503);
}

export async function HEAD() {
  return new NextResponse(null, { headers });
}
