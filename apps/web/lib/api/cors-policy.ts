import type { NextRequest } from 'next/server';

const STATIC_SITE_ORIGINS = [
  'https://www.trackmyopt.com',
  'https://trackmyopt.com',
] as const;

function normalizeOriginUrl(origin: string): string | null {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

/**
 * CORS for routes called from the TrackMyOPT web app and the Chrome extension
 * (extension sends `Origin: chrome-extension://…`). Does not use `*`.
 * Same-origin browser calls work without `Access-Control-Allow-Origin`.
 */
export function corsHeadersWebAndExtension(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');
  const base: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (!origin) {
    return base;
  }

  if (origin.startsWith('chrome-extension://')) {
    return {
      ...base,
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    };
  }

  const allowed = new Set<string>();
  for (const u of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    ...STATIC_SITE_ORIGINS,
  ]) {
    if (!u) continue;
    try {
      allowed.add(new URL(u).origin);
    } catch {
      /* skip invalid */
    }
  }

  const reqOrigin = normalizeOriginUrl(origin);
  if (reqOrigin && allowed.has(reqOrigin)) {
    return {
      ...base,
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    };
  }

  if (
    process.env.NODE_ENV === "development" &&
    (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))
  ) {
    return {
      ...base,
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    };
  }

  return base;
}

/**
 * Fixed `Access-Control-Allow-Origin` for same-site dashboard APIs (cookie session).
 * Matches other resume-generator routes that already used `NEXT_PUBLIC_SITE_URL`.
 */
export function corsHeadersConfiguredWebApp(): Record<string, string> {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://www.trackmyopt.com';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
