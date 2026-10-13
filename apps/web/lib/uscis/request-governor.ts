import type { SupabaseClient } from '@supabase/supabase-js';

export class USCISRateLimitError extends Error {
  constructor(readonly retryAfter: number) {
    super('USCIS request allowance unavailable');
  }
}
export function uscisEnvironment(baseUrl: string): 'production' | 'sandbox' {
  return new URL(baseUrl).hostname === 'api-int.uscis.gov'
    ? 'sandbox'
    : 'production';
}
export async function acquireUSCISRequest(
  db: SupabaseClient,
  environment: string
) {
  const deadline = Date.now() + 20_000;
  for (;;) {
    const { data, error } = await db.rpc('acquire_uscis_request', {
      p_environment: environment,
    });
    if (error || !data || typeof data.allowed !== 'boolean')
      throw new Error('USCIS request governor unavailable'); // fail closed
    if (data.allowed) return;
    const wait = Number(data.retry_after_ms);
    if (!Number.isFinite(wait) || wait <= 0)
      throw new Error('Invalid USCIS request allowance');
    if (Date.now() + wait > deadline)
      throw new USCISRateLimitError(Math.ceil(wait / 1000));
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}
export async function deferUSCISRequests(
  db: SupabaseClient,
  environment: string,
  seconds: number
) {
  const { error } = await db.rpc('defer_uscis_requests', {
    p_environment: environment,
    p_seconds: Math.ceil(seconds),
  });
  if (error) throw new Error('USCIS provider cooldown persistence failed');
}
export function providerRetryAfter(response: Response, fallback = 60) {
  const value = response.headers.get('retry-after');
  const seconds = Number(value);
  if (value && Number.isFinite(seconds) && seconds > 0)
    return Math.min(86400, Math.ceil(seconds));
  const date = value ? Date.parse(value) : NaN;
  return Number.isFinite(date)
    ? Math.min(86400, Math.max(1, Math.ceil((date - Date.now()) / 1000)))
    : fallback;
}
