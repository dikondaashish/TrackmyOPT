import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiFail, apiOk, apiUnauthorized } from '@/lib/api/response';
import { checkRateLimitByUser } from '@/lib/auth/api-rate-limit';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const LOOKUP_LIMIT = {
  limit: 10,
  windowSeconds: 3_600,
  name: 'work-email-finder-browser',
} as const;
const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store, private, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};
const RequestSchema = z
  .object({ linkedinUrl: z.string().trim().min(1).max(500) })
  .strict();

function normalizeLinkedInUrl(input: string): string | null {
  try {
    const raw = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(raw);
    if (
      !['linkedin.com', 'www.linkedin.com', 'm.linkedin.com'].includes(
        url.hostname.toLowerCase()
      )
    )
      return null;
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;

    const slug = url.pathname.match(/^\/in\/([a-zA-Z0-9._-]{2,100})\/?$/i)?.[1];
    return slug ? `https://www.linkedin.com/in/${slug}` : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return apiUnauthorized('Sign in to find a work email', {
      headers: PRIVATE_HEADERS,
    });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail('Enter a LinkedIn profile URL', {
      headers: PRIVATE_HEADERS,
    });
  }

  const parsed = RequestSchema.safeParse(body);
  const linkedinUrl = parsed.success
    ? normalizeLinkedInUrl(parsed.data.linkedinUrl)
    : null;
  if (!linkedinUrl) {
    return apiFail('Enter a valid linkedin.com/in/ profile URL', {
      code: 'invalid_linkedin_url',
      headers: PRIVATE_HEADERS,
    });
  }

  const limit = await checkRateLimitByUser(user.id, LOOKUP_LIMIT);
  if (!limit.success) {
    return apiFail(
      limit.unavailable
        ? 'Email lookup is temporarily unavailable. Please try again shortly.'
        : 'You have reached the hourly lookup limit. Please try again later.',
      {
        status: limit.unavailable ? 503 : 429,
        code: limit.unavailable ? 'rate_limit_unavailable' : 'rate_limited',
        headers: {
          ...PRIVATE_HEADERS,
          'Retry-After': String(limit.retryAfter ?? 60),
        },
      }
    );
  }

  return apiOk({ linkedinUrl }, { headers: PRIVATE_HEADERS });
}
