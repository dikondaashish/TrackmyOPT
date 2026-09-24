import { z } from 'zod';

export type FinderResult =
  | { found: false }
  | {
      found: true;
      email: string;
      fullName: string | null;
      company: string | null;
      jobTitle: string | null;
      verified: boolean;
    };
export type Draft = {
  subject: string | null;
  emailBody: string | null;
  linkedinNote: string;
};
type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
const APPLYBOLT_URL = 'https://api.applybolt.app/public/findEmailByLinkedIn';

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, 200)
    : null;
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

export async function requestEmailLookup(linkedinUrl: string): Promise<FinderResult> {
  const response = await fetch('/api/career/email-finder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinUrl: linkedinUrl.trim() }),
  });
  const payload = (await response.json()) as ApiResponse<{
    linkedinUrl: string;
  }>;
  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.ok ? 'Email lookup failed. Please try again.' : payload.error
    );
  }
  let providerResponse: Response;
  try {
    providerResponse = await fetch(APPLYBOLT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinUrl: payload.data.linkedinUrl }),
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      signal: AbortSignal.timeout(75_000),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      throw new Error('This lookup took too long. Please try again.');
    }
    throw new Error('Could not connect to ApplyBolt. Please try again.');
  }
  if (providerResponse.status === 429) {
    throw new Error(
      'ApplyBolt has reached its lookup limit. Please wait a few minutes.'
    );
  }
  if (!providerResponse.ok) {
    throw new Error('Email lookup is unavailable right now. Please try again.');
  }

  let providerData: unknown;
  try {
    providerData = await providerResponse.json();
  } catch {
    throw new Error(
      'Email lookup returned an unexpected result. Please try again.'
    );
  }
  const result = parseProviderResult(providerData);
  if (!result) {
    throw new Error(
      'Email lookup returned an unexpected result. Please try again.'
    );
  }
  return result;
}

export async function requestNetworkingDraft(input: {
  companyName: string | null;
  roleTitle: string | null;
  contactName: string | null;
  contactTitle: string | null;
  messageIntent: string;
  includeEmail: boolean;
}): Promise<Draft> {
  const response = await fetch('/api/career/networking/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as ApiResponse<Draft>;
  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.ok ? 'AI drafting failed. Please try again.' : payload.error
    );
  }
  return payload.data;
}
