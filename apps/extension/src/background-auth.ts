import { API_ENDPOINTS } from './config';
import { EXTENSION_LOCAL_SIGNOUT_KEY } from './signOut';
import { readCachedToken, setIdToken, clearIdToken } from './token-store';
import {
  FREE_AUTOFILL_PLAN_ENTITLEMENTS,
  resolveAutofillPlanEntitlements,
  resolveAutofillPlanTier,
} from './autofill-plan-entitlements';

// ISS-039: cap the cached token TTL at 5 minutes and refresh on tab focus.
// The web side now issues 5-minute JWTs (mintToken), matching this window so
// the cached token never outlives the issued token.
export const TOKEN_TTL_MS = 5 * 60 * 1000;

export function isJwtNotExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1])) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

export async function getExtensionBearerToken(forceRefresh = false): Promise<string | null> {
  const sync = await chrome.storage.sync.get(['signedIn', EXTENSION_LOCAL_SIGNOUT_KEY]);
  // Only extension-initiated disconnect blocks minting; `signedIn` alone may be stale after web re-login.
  if (sync[EXTENSION_LOCAL_SIGNOUT_KEY] === true) {
    await clearIdToken();
    return null;
  }

  const cached = await readCachedToken();
  const cacheFresh = !!(cached && Date.now() - cached.issuedAt < TOKEN_TTL_MS);

  if (!forceRefresh && cacheFresh) {
    await chrome.storage.sync.set({ signedIn: true });
    return cached!.token;
  }

  if (!forceRefresh && cached && isJwtNotExpired(cached.token)) {
    await chrome.storage.sync.set({ signedIn: true });
    return cached.token;
  }

  try {
    const res = await fetch(API_ENDPOINTS.EXTENSION_TOKEN, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as { token?: string; userId?: string };
      if (!data.token) return null;
      await setIdToken(data.token, data.userId);
      await chrome.storage.sync.set({ signedIn: true });
      return data.token;
    }
  } catch {
    /* ignore */
  }

  if (cached && isJwtNotExpired(cached.token)) {
    await chrome.storage.sync.set({ signedIn: true });
    return cached.token;
  }

  await clearIdToken();
  return null;
}

export async function getAutofillPlanEntitlements() {
  const bearer = await getExtensionBearerToken();
  if (!bearer) {
    return {
      ok: false as const,
      planTier: 'free' as const,
      entitlements: FREE_AUTOFILL_PLAN_ENTITLEMENTS,
    };
  }
  try {
    const response = await fetch(API_ENDPOINTS.STATUS, {
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
    });
    if (!response.ok) throw new Error('status_unavailable');
    const status = (await response.json()) as {
      isPremium?: boolean;
      planName?: string;
    };
    const planTier = resolveAutofillPlanTier(status);
    return {
      ok: true as const,
      planTier,
      entitlements: resolveAutofillPlanEntitlements(planTier),
    };
  } catch {
    return {
      ok: false as const,
      planTier: 'free' as const,
      entitlements: FREE_AUTOFILL_PLAN_ENTITLEMENTS,
    };
  }
}

export async function beginAuth(){
  const tab = await chrome.tabs.create({ url: API_ENDPOINTS.AUTH });
  
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Auth timeout'));
    }, 5 * 60 * 1000); // 5 minute timeout
    
    const listener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, currentTab: chrome.tabs.Tab) => {
      if (tabId !== tab.id) return;
      
      const responseUrl = changeInfo.url || currentTab.url;
      if (!responseUrl) return;
      
      // Check if user reached dashboard (successful login)
      if (responseUrl.includes('/dashboard')) {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Wait a moment for cookies to settle, then check session
        setTimeout(async () => {
          try {
            const response = await fetch(API_ENDPOINTS.ME, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (response.ok) {
              await chrome.storage.sync.set({
                signedIn: true,
                [EXTENSION_LOCAL_SIGNOUT_KEY]: false,
              });
              
              // Register extension session with server. Use the real bearer
              // token (minted into storage.local); the old 'authToken' key was
              // never written, so this call previously never fired.
              const bearer = await getExtensionBearerToken();
              if (bearer) {
                fetch(`${API_ENDPOINTS.ME.replace('/api/me', '/api/extension/ping')}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`,
                  },
                  body: JSON.stringify({ version: chrome.runtime.getManifest().version }),
                }).catch(() => {}); // Silently fail
              }
              
              // Set localStorage on the dashboard tab to mark extension as connected
              if (tab.id) {
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: (version: string) => {
                    localStorage.setItem('tmo_extension_connected', 'true');
                    localStorage.setItem('tmo_extension_version', version);
                    localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
                  },
                  args: [chrome.runtime.getManifest().version]
                }).catch(() => {});
              }
              
              resolve();
            } else {
              // Retry after cookies sync
              setTimeout(async () => {
                const retry = await fetch(API_ENDPOINTS.ME, { 
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                });
                if (retry.ok) {
                  await chrome.storage.sync.set({
                    signedIn: true,
                    [EXTENSION_LOCAL_SIGNOUT_KEY]: false,
                  });
                  resolve();
                } else {
                  reject(new Error('Could not verify session'));
                }
              }, 1500);
            }
          } catch (err) {
            reject(err);
          }
        }, 1000);
        return;
      }
      
      // If user closes the tab before logging in
      if (changeInfo.status === 'complete' && responseUrl === 'about:blank') {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('Auth cancelled'));
        return;
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
  });
}
