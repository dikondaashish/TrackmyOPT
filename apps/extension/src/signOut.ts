import { WEBSITE_URL } from './config';

/**
 * Base URLs used with chrome.cookies (must include path).
 * Covers www + apex so Supabase / app cookies are removed regardless of host.
 */
function cookieSweepUrls(): string[] {
  const base = WEBSITE_URL.replace(/\/$/, '');
  const urls = new Set<string>([`${base}/`]);
  if (base.includes('://www.')) {
    urls.add(base.replace('://www.', '://') + '/');
  } else {
    const u = new URL(base);
    if (!u.hostname.startsWith('www.')) {
      u.hostname = 'www.' + u.hostname;
      urls.add(u.toString().endsWith('/') ? u.toString() : `${u.toString()}/`);
    }
  }
  return [...urls];
}

/**
 * Remove all cookies the extension can see for TrackMyOPT (session + chunks).
 */
export async function clearTrackMyOptCookies(): Promise<void> {
  if (!chrome.cookies?.getAll || !chrome.cookies?.remove) return;

  for (const url of cookieSweepUrls()) {
    let list: chrome.cookies.Cookie[];
    try {
      list = await chrome.cookies.getAll({ url });
    } catch {
      continue;
    }
    for (const c of list) {
      const details: Parameters<typeof chrome.cookies.remove>[0] = {
        name: c.name,
        url,
      };
      if (c.storeId) details.storeId = c.storeId;
      const pk = (c as { partitionKey?: chrome.cookies.CookiePartitionKey }).partitionKey;
      if (pk != null) {
        (details as { partitionKey?: chrome.cookies.CookiePartitionKey }).partitionKey = pk;
      }
      try {
        await chrome.cookies.remove(details);
      } catch {
        // ignore per-cookie failures
      }
    }
  }
}

/** Remove extension auth state while keeping UI prefs like theme. */
export async function clearExtensionAuthStorage(): Promise<void> {
  const { theme } = await chrome.storage.sync.get('theme');
  await chrome.storage.sync.remove([
    'idToken',
    'idTokenIssuedAt',
    'idTokenUserId',
    'signedIn',
  ]);
  await chrome.storage.local.remove(['authToken', 'lastPage']);
  await chrome.storage.session.clear();
  if (theme === 'dark' || theme === 'light') {
    await chrome.storage.sync.set({ theme });
  }
}

/**
 * Full extension sign-out: server sign-out (best-effort), cookie sweep, local auth keys.
 */
export async function performExtensionSignOut(): Promise<void> {
  try {
    await fetch(`${WEBSITE_URL}/auth/signout`, {
      method: 'POST',
      credentials: 'include',
      redirect: 'manual',
      mode: 'cors',
    });
  } catch {
    // Popup origin may not read redirect/CORS body; cookie sweep still signs out locally.
  }
  await clearTrackMyOptCookies();
  await clearExtensionAuthStorage();
}
