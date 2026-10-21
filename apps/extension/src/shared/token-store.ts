/**
 * Central store for the extension bearer JWT.
 *
 * The token lives in chrome.storage.LOCAL, never chrome.storage.sync — sync
 * replicates to Google's servers and across the user's devices, which must
 * never hold credential material. Only non-sensitive prefs (theme, signedIn,
 * extensionLocalSignedOut) stay in sync.
 */

export interface CachedTokenEntry {
  token: string;
  issuedAt: number;
  userId?: string;
}

/** Returns the stored JWT string, or null if none. */
export async function getIdToken(): Promise<string | null> {
  const { idToken } = await chrome.storage.local.get('idToken');
  return typeof idToken === 'string' && idToken.length > 0 ? idToken : null;
}

/**
 * The `userId` claim of a TrackMyOPT JWT, read without verifying it: the
 * token came from our own API and the value only scopes local caches (the
 * server verifies the token on every request).
 */
export function tokenUserId(token: string): string | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const userId = (JSON.parse(json) as { userId?: unknown }).userId;
    return typeof userId === 'string' && userId.length > 0 ? userId : undefined;
  } catch {
    return undefined;
  }
}

/** Full cached entry (token + issuedAt + userId), or null if none. */
export async function readCachedToken(): Promise<CachedTokenEntry | null> {
  const { idToken, idTokenIssuedAt, idTokenUserId } = await chrome.storage.local.get([
    'idToken',
    'idTokenIssuedAt',
    'idTokenUserId',
  ]);
  if (typeof idToken !== 'string' || !idToken) return null;
  return {
    token: idToken,
    issuedAt: typeof idTokenIssuedAt === 'number' ? idTokenIssuedAt : 0,
    // The token's own claim wins: a token stored without a user id (popup
    // sign-in, or a token API that omitted it) left the tailored-resume cache
    // ownerless, so Prefill never received the generated PDF.
    userId: tokenUserId(idToken) ?? (typeof idTokenUserId === 'string' ? idTokenUserId : undefined),
  };
}

/** Store the token (and issuedAt). userId is only overwritten when provided. */
export async function setIdToken(token: string, userId?: string): Promise<void> {
  const patch: Record<string, unknown> = { idToken: token, idTokenIssuedAt: Date.now() };
  if (userId !== undefined) patch.idTokenUserId = userId ?? null;
  await chrome.storage.local.set(patch);
}

/** Remove the token material from local storage. */
export async function clearIdToken(): Promise<void> {
  await chrome.storage.local.remove(['idToken', 'idTokenIssuedAt', 'idTokenUserId']);
}

/**
 * One-time cleanup: purge any legacy token left in chrome.storage.sync by
 * versions that stored it there. Safe to call repeatedly.
 */
export async function purgeLegacySyncToken(): Promise<void> {
  await chrome.storage.sync.remove(['idToken', 'idTokenIssuedAt', 'idTokenUserId']);
}
