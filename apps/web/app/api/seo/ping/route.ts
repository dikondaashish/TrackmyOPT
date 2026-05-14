import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SITE_HOST = 'www.trackmyopt.com';

/** Public IndexNow key; prefer `INDEXNOW_KEY` env (see `.env.example`). */
const INDEXNOW_KEY_FALLBACK = 'trackmyopt2026indexnow';

function getIndexNowKey(): string {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  if (fromEnv) return fromEnv;
  return INDEXNOW_KEY_FALLBACK;
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.SEO_PING_SECRET;
  if (!configuredSecret) {
    console.error('SEO_PING_SECRET env var is not set — rejecting request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const secret = req.headers.get('x-seo-secret');
  if (secret !== configuredSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const urls: string[] = Array.isArray(body.urls) ? body.urls : [];

  if (urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
  }

  const results: Record<string, string> = {};
  const indexNowKey = getIndexNowKey();

  const indexNowPayload = {
    host: SITE_HOST,
    key: indexNowKey,
    keyLocation: `https://${SITE_HOST}/indexnow-key.txt`,
    urlList: urls.map((u) => (u.startsWith('http') ? u : `https://${SITE_HOST}${u}`)),
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(indexNowPayload),
    });
    results.indexnow = `${res.status} ${res.statusText}`;
  } catch (e: unknown) {
    results.indexnow = `error: ${e instanceof Error ? e.message : 'unknown'}`;
  }

  results.google_note =
    'Google deprecated sitemap ping (2023). Use GSC URL Inspection for manual indexing.';

  return NextResponse.json({ ok: true, results });
}
