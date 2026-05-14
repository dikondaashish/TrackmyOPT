import { API_ENDPOINTS, WEBSITE_URL } from './config';

// ISS-039: cap the cached token TTL at 5 minutes and refresh on tab focus.
// The web side issues 10-minute JWTs, so this gives us a quick check window
// without re-hitting the token endpoint on every API call.
const TOKEN_TTL_MS = 5 * 60 * 1000;

interface CachedTokenEntry {
  token: string;
  issuedAt: number;
  userId?: string;
}

async function readCachedToken(): Promise<CachedTokenEntry | null> {
  const { idToken, idTokenIssuedAt, idTokenUserId } = await chrome.storage.sync.get([
    'idToken',
    'idTokenIssuedAt',
    'idTokenUserId',
  ]);
  if (typeof idToken !== 'string' || !idToken) return null;
  return {
    token: idToken,
    issuedAt: typeof idTokenIssuedAt === 'number' ? idTokenIssuedAt : 0,
    userId: typeof idTokenUserId === 'string' ? idTokenUserId : undefined,
  };
}

async function writeCachedToken(token: string, userId?: string) {
  await chrome.storage.sync.set({
    idToken: token,
    idTokenIssuedAt: Date.now(),
    idTokenUserId: userId || null,
  });
}

async function getExtensionBearerToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh) {
    const cached = await readCachedToken();
    if (cached && Date.now() - cached.issuedAt < TOKEN_TTL_MS) {
      return cached.token;
    }
  } else {
    await chrome.storage.sync.remove(['idToken', 'idTokenIssuedAt', 'idTokenUserId']);
  }
  try {
    const res = await fetch(API_ENDPOINTS.EXTENSION_TOKEN, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string; userId?: string };
    if (!data.token) return null;
    await writeCachedToken(data.token, data.userId);
    return data.token;
  } catch {
    return null;
  }
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
});

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
              await chrome.storage.sync.set({ signedIn: true });
              
              // Register extension session with server
              const token = await chrome.storage.local.get('authToken');
              if (token.authToken) {
                fetch(`${API_ENDPOINTS.ME.replace('/api/me', '/api/extension/ping')}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.authToken}`,
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
                  await chrome.storage.sync.set({ signedIn: true });
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
