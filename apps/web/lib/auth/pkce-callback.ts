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

export const MISSING_VERIFIER_LOGIN_ERROR =
  'Please open the sign-in link in the same browser you used to request it, or sign in again.';
