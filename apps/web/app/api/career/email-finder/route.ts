import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiFail, apiOk, apiUnauthorized } from '@/lib/api/response';
import { checkRateLimitByUser } from '@/lib/auth/api-rate-limit';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const PROVIDER_URL = 'https://api.applybolt.app/public/findEmailByLinkedIn';
const LOOKUP_LIMIT = { limit: 10, windowSeconds: 3_600, name: 'work-email-finder' } as const;
const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store, private, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};
const RequestSchema = z.object({ linkedinUrl: z.string().trim().min(1).max(500) }).strict();

type FinderResult =
  | { found: false }
  | {
      found: true;
      email: string;
      fullName: string | null;
      company: string | null;
      jobTitle: string | null;
      verified: boolean;
    };

function normalizeLinkedInUrl(input: string): string | null {
  try {
    const raw = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(raw);
    if (!['linkedin.com', 'www.linkedin.com', 'm.linkedin.com'].includes(url.hostname.toLowerCase())) return null;
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;

    const slug = url.pathname.match(/^\/in\/([a-zA-Z0-9._-]{2,100})\/?$/i)?.[1];
    return slug ? `https://www.linkedin.com/in/${slug}` : null;
  } catch {
    return null;
  }
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 200) : null;
}

function parseProviderResult(value: unknown): FinderResult | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = value as Record<string, unknown>;
  if (result.found === false) return { found: false };
  if (result.found !== true) return null;

  const email = z.string().email().max(320).safeParse(result.email);
  if (!email.success) return null;

  return {
    found: true,
    email: email.data,
    fullName: optionalText(result.fullName),
    company: optionalText(result.company),
    jobTitle: optionalText(result.jobTitle),
    verified: result.validation === 'valid',
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized('Sign in to find a work email', { headers: PRIVATE_HEADERS });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail('Enter a LinkedIn profile URL', { headers: PRIVATE_HEADERS });
  }

  const parsed = RequestSchema.safeParse(body);
  const linkedinUrl = parsed.success ? normalizeLinkedInUrl(parsed.data.linkedinUrl) : null;
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
        headers: { ...PRIVATE_HEADERS, 'Retry-After': String(limit.retryAfter ?? 60) },
      },
    );
  }

  try {
    const response = await fetch(PROVIDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinUrl }),
      signal: AbortSignal.timeout(75_000),
      cache: 'no-store',
      redirect: 'error',
    });

    if (!response.ok) {
      console.warn('[work-email-finder] ApplyBolt returned status', response.status);
      return apiFail('Email lookup is unavailable right now. Please try again.', {
        status: 502,
        code: 'provider_unavailable',
        headers: PRIVATE_HEADERS,
      });
    }

    const result = parseProviderResult(await response.json());
    if (!result) {
      console.warn('[work-email-finder] ApplyBolt returned an unexpected result');
      return apiFail('Email lookup returned an unexpected result. Please try again.', {
        status: 502,
        code: 'provider_invalid_result',
        headers: PRIVATE_HEADERS,
      });
    }

    return apiOk(result, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    console.warn('[work-email-finder] ApplyBolt request failed', timedOut ? 'timeout' : 'connection error');
    return apiFail(
      timedOut ? 'This lookup took too long. Please try again.' : 'Email lookup is unavailable right now. Please try again.',
      {
        status: timedOut ? 504 : 502,
        code: timedOut ? 'provider_timeout' : 'provider_unavailable',
        headers: PRIVATE_HEADERS,
      },
    );
  }
}
