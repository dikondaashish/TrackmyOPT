import type { NetworkVerdict } from './submission-protocol';

/**
 * Workday submission request and response criteria.
 *
 * EVIDENCE STATUS: unverified. The finalize endpoint and success shape below
 * come from static analysis of a third-party extension's shipped code, not
 * from TrackMyOPT runtime observation or an authorized Workday submission.
 * The repository itself only evidences Workday's /wday/cxs/{tenant}/{site}/job
 * read API. That is why the bundled baseline runs this detector in shadow mode
 * (remote-config-baseline.ts). Keep these criteria narrow; widen them only with
 * sanitized fixtures from an authorized test tenant.
 *
 * Criteria:
 *  - request: same-origin HTTPS POST on a Workday host to
 *    /wday/cxs/{tenant}/jobapplication/{applicationId}/finalize with no query,
 *    or only type=completeAgencySubmission;
 *  - success: HTTP 200, not redirected, JSON object with a non-empty string
 *    `id` and neither an `error` nor an `errors` property;
 *  - failure: HTTP >= 400, or HTTP 200 whose JSON reports `error`/`errors`;
 *  - anything else is inconclusive and never counts as success.
 */

const WORKDAY_HOST_RE = /(?:^|\.)(?:myworkdayjobs(?:-impl)?\.com|myworkdaysite\.com|myworkday\.com)$/;
const FINALIZE_PATH_RE = /^\/wday\/cxs\/[A-Za-z0-9_-]{1,100}\/jobapplication\/[A-Za-z0-9_-]{1,100}\/finalize$/;

export function isWorkdayHost(hostname: string): boolean {
  return WORKDAY_HOST_RE.test(hostname.toLowerCase());
}

/** Returns the canonical request path when this is a finalize request. */
export function matchWorkdayFinalizeRequest(requestUrl: string, method: string, pageUrl: string): string | null {
  if (typeof method !== 'string' || method.toUpperCase() !== 'POST') return null;
  try {
    const page = new URL(pageUrl);
    const request = new URL(requestUrl, page);
    if (page.protocol !== 'https:' || !isWorkdayHost(page.hostname) || page.username || page.password) return null;
    if (request.origin !== page.origin || request.username || request.password || request.hash) return null;
    if (!FINALIZE_PATH_RE.test(request.pathname)) return null;
    const params = Array.from(request.searchParams.entries());
    if (params.length > 1 || (params.length === 1 &&
        (params[0][0] !== 'type' || params[0][1] !== 'completeAgencySubmission'))) return null;
    return request.pathname + request.search;
  } catch {
    return null;
  }
}

export interface ObservedResponse {
  status: number;
  redirected: boolean;
  /** Parsed JSON body; undefined when unread or unreadable. */
  body?: unknown;
  readFailure?: 'unreadable' | 'oversize' | 'timeout' | 'malformed';
}

export function classifyWorkdayFinalizeResponse(response: ObservedResponse): NetworkVerdict {
  if (response.redirected) return 'redirected';
  if (response.status >= 400) return 'http_error';
  if (response.status !== 200) return 'unexpected_status';
  if (response.readFailure) return response.readFailure;
  const body = response.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'malformed';
  const record = body as Record<string, unknown>;
  if ('error' in record || 'errors' in record) return 'application_error';
  if (typeof record.id === 'string' && record.id.trim().length > 0) return 'success';
  return 'malformed';
}

/** Workday's final-step submit controls (footer variants). */
export const WORKDAY_SUBMIT_SELECTOR =
  'button[data-automation-id="pageFooterNextButton"], button[data-automation-id="bottom-navigation-next-button"]';
export const SUBMIT_LABEL_RE = /^submit(?: (?:my |your )?application)?$/i;
