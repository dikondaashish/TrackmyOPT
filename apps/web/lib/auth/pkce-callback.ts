/**
 * Supabase email links (sign-up confirmation, magic link) use PKCE: the code
 * verifier is a cookie in the browser that requested the link. Opening the
 * link in another browser or app, or after cookies were cleared, leaves the
 * verifier empty and the exchange fails (TRACKMYOPT-2V). That is an expected
 * user outcome, not a TrackMyOPT failure, so callers log it at warn level and
 * explain what to do instead of reporting it as an error.
 */
const MISSING_VERIFIER = /code verifier should be non-empty/i;

export function isMissingPkceVerifier(error: unknown): boolean {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : '';
  return MISSING_VERIFIER.test(message);
}

/**
 * Supabase deletes a link's flow state once it is used or expires, so opening
 * the same sign-in link twice, or long after it was sent, fails with "invalid
 * flow state" (TRACKMYOPT-2V regression). Also an expected user outcome.
 */
const STALE_FLOW_STATE = /invalid flow state|no valid flow state found/i;

export function isStaleAuthLink(error: unknown): boolean {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : '';
  return STALE_FLOW_STATE.test(message);
}

export const STALE_LINK_LOGIN_ERROR =
  'This sign-in link was already used or has expired. Please sign in again.';

export const MISSING_VERIFIER_LOGIN_ERROR =
  'Please open the sign-in link in the same browser you used to request it, or sign in again.';
