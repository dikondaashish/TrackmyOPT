import { API_ENDPOINTS, WEBSITE_URL } from './config';
import { performExtensionSignOut, EXTENSION_LOCAL_SIGNOUT_KEY } from './signOut';
import { readCachedToken, setIdToken, clearIdToken, purgeLegacySyncToken } from './token-store';

// One-time migration: older builds stored the JWT in chrome.storage.sync.
// Purge any leftover so no credential material remains in synced storage.
chrome.runtime.onInstalled.addListener(() => {
  purgeLegacySyncToken().catch(() => {});
});

// ISS-039: cap the cached token TTL at 5 minutes and refresh on tab focus.
// The web side now issues 5-minute JWTs (mintToken), matching this window so
// the cached token never outlives the issued token.
const TOKEN_TTL_MS = 5 * 60 * 1000;

/** True if JWT `exp` is more than 60s in the future (matches popup refresh heuristic). */
function isJwtNotExpired(token: string): boolean {
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

async function getExtensionBearerToken(forceRefresh = false): Promise<string | null> {
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

// ISS-039: refresh token whenever the user focuses the browser/extension —
// this guarantees that after a logout/switch on the web side, the extension
// picks up the new identity within seconds rather than up to 10 minutes.
chrome.windows?.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  await getExtensionBearerToken(true);
});

chrome.runtime.setUninstallURL(`${WEBSITE_URL}/extension/uninstall`);

// Internal message listener (from popup and content scripts)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'BEGIN_AUTH') {
    beginAuth().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false, err:String(e)}));
    return true;
  }
  if (msg.type === 'ADD_JOB_TO_TRACKER') {
    handleAddJobToTracker(msg.job, !!msg.autoAdd).then(sendResponse).catch((e) => {
      sendResponse({ ok: false, error: e instanceof Error ? e.message : 'Failed to add job' });
    });
    return true; // async response
  }
  if (msg.type === 'EXTENSION_SIGN_OUT') {
    performExtensionSignOut()
      .then(() => sendResponse({ ok: true as const }))
      .catch((e) => sendResponse({ ok: false as const, error: e instanceof Error ? e.message : String(e) }));
    return true;
  }
  if (msg.type === 'GET_AUTOFILL_PROFILE') {
    // Resolve the user's name/email for Easy Apply prefill. The bearer token
    // stays here — only these non-sensitive fields are returned to the content
    // script running on linkedin.com.
    getAutofillProfile()
      .then((profile) => sendResponse(profile))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
});

interface AutofillProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  // application_profile fields (non-sensitive). Empty string when unset.
  phone: string;
  city: string;
  state: string;
  yearsExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

interface AutofillProfileResult {
  ok: boolean;
  error?: string;
  profile?: AutofillProfile;
}

async function getAutofillProfile(): Promise<AutofillProfileResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const res = await fetch(API_ENDPOINTS.ME, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) return { ok: false, error: 'fetch_failed' };

  const data = (await res.json()) as {
    user?: { email?: string; user_metadata?: Record<string, unknown> };
    profile?: { first_name?: string; last_name?: string; email?: string };
    applicationProfile?: {
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      years_experience?: number | null;
      linkedin_url?: string | null;
      portfolio_url?: string | null;
    } | null;
  };
  const user = data.user ?? {};
  const profile = data.profile ?? {};
  const ap = data.applicationProfile ?? {};
  const meta = (user.user_metadata ?? {}) as {
    firstName?: string;
    first_name?: string;
    full_name?: string;
  };

  const fullNameMeta = (meta.full_name ?? '').trim();
  const firstName = (profile.first_name || meta.firstName || meta.first_name || fullNameMeta.split(/\s+/)[0] || '').trim();
  const lastName = (profile.last_name || fullNameMeta.split(/\s+/).slice(1).join(' ') || '').trim();
  const fullName = fullNameMeta || [firstName, lastName].filter(Boolean).join(' ');
  const email = (user.email || profile.email || '').trim();

  return {
    ok: true,
    profile: {
      firstName,
      lastName,
      fullName,
      email,
      phone: (ap.phone ?? '').trim(),
      city: (ap.city ?? '').trim(),
      state: (ap.state ?? '').trim(),
      yearsExperience: ap.years_experience != null ? String(ap.years_experience) : '',
      linkedinUrl: (ap.linkedin_url ?? '').trim(),
      portfolioUrl: (ap.portfolio_url ?? '').trim(),
    },
  };
}

// External message listener (from web app)
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  // Respond to ping to confirm extension is installed
  if (msg.type === 'PING') {
    sendResponse({ ok: true, installed: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  
  // Check extension status - called from Settings page
  if (msg.type === 'TMO_CHECK_EXTENSION') {
    // Respond that extension is installed
    sendResponse({ 
      ok: true, 
      installed: true, 
      version: chrome.runtime.getManifest().version,
      type: 'TMO_EXTENSION_PRESENT'
    });
    
    // Also inject localStorage marker into the webpage if possible
    if (sender.tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: (version: string) => {
          localStorage.setItem('tmo_extension_connected', 'true');
          localStorage.setItem('tmo_extension_version', version);
          localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
        },
        args: [chrome.runtime.getManifest().version]
      }).catch(() => {
        // Scripting might fail if permissions aren't granted
      });
    }
    return true;
  }
  
  // Open a specific tool in the extension popup
  if (msg.type === 'OPEN_TOOL') {
    const toolPage = msg.tool;
    
    // Save the requested page so popup opens to it
    chrome.storage.local.set({ lastPage: toolPage }).then(() => {
      if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup().then(() => {
          sendResponse({ ok: true, opened: true });
        }).catch(() => {
          sendResponse({ ok: true, opened: false, message: 'Click the TrackMyOPT extension icon to open the tool' });
        });
      } else {
        sendResponse({ ok: true, opened: false, message: 'Click the TrackMyOPT extension icon to open the tool' });
      }
    });
    return true;
  }
  
  sendResponse({ ok: false, error: 'Unknown message type' });
  return true;
});

async function handleAddJobToTracker(
  job: { company_name: string; role_title: string; job_url?: string; location?: string },
  autoAdd: boolean = false
) {
  let token = await getExtensionBearerToken();
  if (!token) {
    const err = new Error('Sign in to TrackMyOPT in the extension to add jobs.');
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'TrackMyOPT',
        message: err.message,
      });
    }
    throw err;
  }

  const postJob = (bearer: string) =>
    fetch(`${WEBSITE_URL}/api/extension/job-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({
        company_name: job.company_name,
        role_title: job.role_title,
        job_url: job.job_url || null,
        location: job.location || null,
        status: 'Applied',
      }),
    });

  let res = await postJob(token);
  if (res.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      res = await postJob(refreshed);
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error || 'Failed to add job to tracker';
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'TrackMyOPT',
        message: msg,
      });
    }
    throw new Error(msg);
  }
  if (chrome.notifications) {
    const message = autoAdd
      ? `Application auto-added: "${job.role_title}" at ${job.company_name}`
      : `"${job.role_title}" at ${job.company_name} added to Job Tracker!`;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'TrackMyOPT',
      message,
    });
  }
  return { ok: true };
}

async function beginAuth(){
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
