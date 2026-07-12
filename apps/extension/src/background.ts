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
  if (msg.type === 'SUBMIT_FEEDBACK') {
    // Post the in-popup feedback to the backend. Bearer-linked when signed in;
    // the endpoint also accepts anonymous feedback.
    (async () => {
      try {
        const bearer = await getExtensionBearerToken();
        const res = await fetch(`${WEBSITE_URL}/api/extension/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          },
          body: JSON.stringify(msg.payload || {}),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        sendResponse({ ok: res.ok && data.ok !== false, error: data.error });
      } catch {
        sendResponse({ ok: false, error: 'network' });
      }
    })();
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
  if (msg.type === 'LIST_SAVED_RESUMES') {
    listSavedResumes()
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GENERATE_RESUME') {
    // Orchestrate selected resume -> tailored LaTeX -> compiled PDF. Bearer
    // stays in the background; the page receives only the result and an opaque
    // authenticated editor-handoff URL.
    generateTailoredResume({
      jobDescription: String(msg.jobDescription ?? ''),
      resumeId: String(msg.resumeId ?? ''),
      templateId: String(msg.templateId ?? ''),
      companyName: String(msg.companyName ?? ''),
      roleTitle: String(msg.roleTitle ?? ''),
    })
      .then((res) => sendResponse(res))
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

interface GenerateResumeResult {
  ok: boolean;
  error?: string;
  detail?: string;
  pdfBase64?: string;
  editorUrl?: string;
}

interface SavedResumeOption {
  id: string;
  filename: string;
  updatedAt?: string | null;
}

async function listSavedResumes(): Promise<{
  ok: boolean;
  error?: string;
  resumes?: SavedResumeOption[];
  accountEmail?: string;
}> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/base-resume?mode=list`, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!response.ok) return { ok: false, error: 'load_failed' };
  const data = (await response.json()) as {
    resumes?: SavedResumeOption[];
    id?: string;
    filename?: string;
    content?: string;
  };

  if (Array.isArray(data.resumes)) {
    if (data.resumes.length > 0) return { ok: true, resumes: data.resumes };
    const profile = await getAutofillProfile().catch(() => null);
    return {
      ok: true,
      resumes: [],
      accountEmail: profile?.profile?.email || undefined,
    };
  }

  // Backward compatibility while the production web app still serves the
  // previous single-resume response. Without this, a valid saved resume was
  // incorrectly interpreted as an empty list by the newly built extension.
  if (data.content?.trim()) {
    return {
      ok: true,
      resumes: [{
        id: data.id || '__latest__',
        filename: data.filename || 'Most recently saved resume',
        updatedAt: null,
      }],
    };
  }

  const profile = await getAutofillProfile().catch(() => null);
  return {
    ok: true,
    resumes: [],
    accountEmail: profile?.profile?.email || undefined,
  };
}

/** ArrayBuffer -> base64 (chunked to avoid call-stack limits in the worker). */
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * base resume (resumes table) -> tailored LaTeX (/generate) -> PDF (/compile).
 * All calls use the extension Bearer token; only the finished PDF (base64) is
 * returned to the caller.
 */
async function generateTailoredResume(input: {
  jobDescription: string;
  resumeId: string;
  templateId: string;
  companyName: string;
  roleTitle: string;
}): Promise<GenerateResumeResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const { jobDescription, resumeId, templateId, companyName, roleTitle } = input;
  if (!jobDescription.trim()) return { ok: false, error: 'no_job_description' };
  if (!resumeId.trim()) return { ok: false, error: 'no_base_resume' };
  if (!templateId.trim()) return { ok: false, error: 'no_template' };

  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` };

  // 1. User-selected saved resume
  const baseUrl = new URL(`${WEBSITE_URL}/api/resume-generator/base-resume`);
  if (resumeId !== '__latest__') {
    baseUrl.searchParams.set('resumeId', resumeId);
  }
  const baseRes = await fetch(baseUrl.toString(), {
    method: 'GET',
    headers: auth,
  });
  if (baseRes.status === 404) return { ok: false, error: 'no_base_resume' };
  if (!baseRes.ok) return { ok: false, error: 'base_failed' };
  const base = (await baseRes.json()) as { content?: string; filename?: string };
  if (!base.content) return { ok: false, error: 'no_base_resume' };

  // 2. Tailored LaTeX
  const genRes = await fetch(`${WEBSITE_URL}/api/resume-generator/generate`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      resumeText: base.content,
      jobDescription: jobDescription.slice(0, 15000),
      templateId,
    }),
  });
  if (genRes.status === 403) {
    const j = (await genRes.json().catch(() => ({}))) as { details?: string };
    return { ok: false, error: 'limit', detail: j.details };
  }
  if (!genRes.ok) return { ok: false, error: 'generate_failed' };
  const gen = (await genRes.json()) as { latex?: string };
  if (!gen.latex) return { ok: false, error: 'generate_failed' };

  // 3. Compile to PDF — with one AI repair-and-retry on failure. Some Gemini
  //    LaTeX has syntax errors the compiler rejects; fix-latex repairs them and
  //    we compile again (mirrors the website's editor flow).
  const compile = async (latexCode: string): Promise<{ pdf?: ArrayBuffer; error?: string }> => {
    const r = await fetch(`${WEBSITE_URL}/api/resume-generator/compile`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ latexCode }),
    });
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      return { error: j.error || `HTTP ${r.status}` };
    }
    const buf = await r.arrayBuffer();
    return buf.byteLength ? { pdf: buf } : { error: 'empty pdf' };
  };

  let latex = gen.latex;
  let out = await compile(latex);
  if (!out.pdf) {
    try {
      const fixRes = await fetch(`${WEBSITE_URL}/api/resume-generator/fix-latex`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ latexCode: latex, errorMessage: out.error || 'Compilation failed' }),
      });
      if (fixRes.ok) {
        const fixed = (await fixRes.json()) as { latex?: string };
        if (fixed.latex) {
          latex = fixed.latex;
          out = await compile(latex);
        }
      }
    } catch {
      /* keep the original failure */
    }
  }
  if (!out.pdf) return { ok: false, error: 'compile_failed' };

  // 4. Persist a short-lived, user-scoped handoff so "Edit" opens the actual
  // generated LaTeX in the editor instead of restarting the three-step flow.
  let editorUrl: string | undefined;
  try {
    const handoffRes = await fetch(`${WEBSITE_URL}/api/resume-generator/extension-handoff`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        latex,
        resumeText: base.content,
        resumeFilename: base.filename,
        jobDescription: jobDescription.slice(0, 15000),
        jobTitle: roleTitle
          ? (companyName ? `${roleTitle} at ${companyName}` : roleTitle)
          : companyName,
        templateId,
      }),
    });
    const handoff = (await handoffRes.json().catch(() => ({}))) as { handoffId?: string };
    if (handoffRes.ok && handoff.handoffId) {
      const editor = new URL(`${WEBSITE_URL}/dashboard/career/resume-generator/editor`);
      editor.searchParams.set('handoffId', handoff.handoffId);
      editorUrl = editor.toString();
    }
  } catch {
    // PDF download remains available even if the optional editor handoff fails.
  }

  return { ok: true, pdfBase64: arrayBufferToBase64(out.pdf), editorUrl };
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
