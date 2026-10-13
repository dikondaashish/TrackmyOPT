/** Sole USCIS HTTP entry point: enrollment, shared pacing/quota, timeouts and safe errors. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertReceiptEnrolledByUser } from '@/lib/uscis/enrollment-guard';
import { UnauthorizedReceiptLookupError } from '@/lib/uscis/errors';
import type { USCISResult, USCISStatus } from '@/lib/immigration/uscis-checker';
import {
  acquireUSCISRequest,
  deferUSCISRequests,
  providerRetryAfter,
  USCISRateLimitError,
  uscisEnvironment,
} from './request-governor';

export type FetchCaseStatusInput = {
  receiptNumber: string;
  userId: string;
  callSite: string;
  supabase?: SupabaseClient;
};
let cachedToken: { token: string; expiresAt: number } | null = null;
class ProviderError extends Error {
  constructor(
    readonly code: number,
    readonly retryAfter?: number
  ) {
    super(`USCIS upstream HTTP ${code}`);
  }
}
function approvedEndpoint(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    !['api.uscis.gov', 'api-int.uscis.gov'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('Invalid USCIS endpoint configuration');
  return url.toString().replace(/\/$/, '');
}
async function upstreamFetch(
  db: SupabaseClient,
  environment: string,
  url: string,
  init: RequestInit
) {
  await acquireUSCISRequest(db, environment);
  const response = await fetch(url, {
    ...init,
    redirect: 'error',
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) {
    if (response.status === 401) cachedToken = null;
    const seconds = providerRetryAfter(
      response,
      response.status === 401 || response.status === 403 ? 300 : 60
    );
    if (
      response.status === 429 ||
      response.status >= 500 ||
      [401, 403].includes(response.status)
    )
      await deferUSCISRequests(db, environment, seconds);
    throw new ProviderError(response.status, seconds);
  }
  return response;
}
async function accessToken(
  db: SupabaseClient,
  environment: string,
  tokenUrl: string
) {
  if (cachedToken && cachedToken.expiresAt > Date.now())
    return cachedToken.token;
  const clientId = process.env.USCIS_CLIENT_ID;
  const clientSecret = process.env.USCIS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('USCIS credentials missing');
  const response = await upstreamFetch(db, environment, tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });
  const data = await response.json();
  if (
    typeof data.access_token !== 'string' ||
    !data.access_token ||
    !Number.isFinite(Number(data.expires_in)) ||
    Number(data.expires_in) <= 0
  )
    throw new Error('Invalid USCIS OAuth response');
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(1, Number(data.expires_in) - 60) * 1000,
  };
  return cachedToken.token;
}
/** Legacy and IOE responses share case_status; IOE may omit submittedDate/history. */
export function parseUSCISResponse(
  raw: unknown,
  expectedReceipt: string
): USCISStatus {
  const value = (raw as { case_status?: Record<string, unknown> } | null)
    ?.case_status;
  if (
    !value ||
    value.receiptNumber !== expectedReceipt ||
    typeof value.current_case_status_text_en !== 'string' ||
    !value.current_case_status_text_en.trim()
  )
    throw new Error('Invalid USCIS case status response');
  const history = value.hist_case_status;
  if (history != null && !Array.isArray(history))
    throw new Error('Invalid USCIS history response');
  const histCaseStatus = (
    (history as Array<Record<string, unknown>> | undefined) ?? []
  ).map((item) => {
    if (
      !item ||
      typeof item.date !== 'string' ||
      typeof item.completed_text_en !== 'string'
    )
      throw new Error('Invalid USCIS history response');
    return { date: item.date, completedText: item.completed_text_en };
  });
  const submitted =
    typeof value.submittedDate === 'string' ? value.submittedDate : '';
  // USCIS documents this as changing on public AND internal/administrative events.
  // Kept as an exact string to study later; it is not treated as a status change.
  const modified =
    typeof value.modifiedDate === 'string' &&
    /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(value.modifiedDate.trim())
      ? value.modifiedDate.trim()
      : null;
  const date = submitted ? new Date(submitted.split(' ')[0]) : null;
  return {
    receiptNumber: expectedReceipt,
    status: value.current_case_status_text_en,
    caseType: typeof value.formType === 'string' ? value.formType : '',
    receivedDate:
      date && Number.isFinite(date.getTime())
        ? date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })
        : null,
    description:
      typeof value.current_case_status_desc_en === 'string'
        ? value.current_case_status_desc_en
        : '',
    histCaseStatus,
    modifiedDate: modified,
  };
}
export async function fetchCaseStatus(
  input: FetchCaseStatusInput
): Promise<USCISResult> {
  const db =
    input.supabase ??
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  // Authorization failure propagates to callers; credentials remain untouched.
  const receipt = await assertReceiptEnrolledByUser(db, {
    userId: input.userId,
    receiptNumber: input.receiptNumber,
    callSite: input.callSite,
  });
  try {
    const baseUrl = approvedEndpoint(
      process.env.USCIS_API_BASE_URL || 'https://api.uscis.gov/case-status'
    );
    const tokenUrl = approvedEndpoint(
      process.env.USCIS_TOKEN_URL || 'https://api.uscis.gov/oauth/accesstoken'
    );
    if (new URL(baseUrl).hostname !== new URL(tokenUrl).hostname)
      throw new Error('USCIS endpoint environments differ');
    const environment = uscisEnvironment(baseUrl);
    const token = await accessToken(db, environment, tokenUrl);
    const response = await upstreamFetch(
      db,
      environment,
      `${baseUrl}/${receipt}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return {
      success: true,
      data: parseUSCISResponse(await response.json(), receipt),
    };
  } catch (error) {
    if (error instanceof UnauthorizedReceiptLookupError) throw error;
    const code =
      error instanceof USCISRateLimitError
        ? 429
        : error instanceof ProviderError
          ? error.code
          : 500;
    const retryAfter =
      error instanceof USCISRateLimitError || error instanceof ProviderError
        ? error.retryAfter
        : undefined;
    if (![404, 422, 429].includes(code))
      console.error(`[USCIS] Case status request failed (${code})`);
    return {
      success: false,
      error: {
        code,
        retryAfter,
        message: `USCIS request failed (${code})`,
        userMessage:
          code === 404
            ? 'USCIS could not return this case. Check the receipt number; some protected cases are unavailable through the API.'
            : code === 422
              ? 'USCIS did not accept this receipt number.'
              : code === 429
                ? 'USCIS requests are temporarily paused. Please try again later.'
                : 'Unable to connect to USCIS. Please try again later.',
      },
    };
  }
}
