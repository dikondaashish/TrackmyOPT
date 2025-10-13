import { WEBSITE_URL } from './config';

// Generate random string for CSRF protection
function randomString(len: number = 32): string {
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

// Start the OAuth authentication flow
async function beginAuth(): Promise<void> {
  const redirectUri = chrome.identity.getRedirectURL('oauth2');
  const state = randomString(16);
  
  // Store state in session storage for CSRF verification
  await chrome.storage.session.set({ oauth_state: state });

  // Build auth URL
  const url = new URL(`${WEBSITE_URL}/auth/extension`);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  console.log('Starting auth flow...');
  console.log('Redirect URI:', redirectUri);
  console.log('Auth URL:', url.toString());

  // Launch web auth flow
  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: url.toString(),
    interactive: true,
  });

  console.log('Response URL:', responseUrl);

  // Parse the response URL fragment
  const hash = new URL(responseUrl).hash.substring(1);
  const params = new URLSearchParams(hash);
  
  const idToken = params.get('id_token');
  const gotState = params.get('state');
  
  // Verify state matches
  const { oauth_state } = await chrome.storage.session.get('oauth_state');

  if (!idToken || gotState !== oauth_state) {
    throw new Error('Auth failed: token missing or state mismatch');
  }

  // Store token and mark as signed in
  await chrome.storage.sync.set({
    idToken,
    signedIn: true,
    signedInAt: Date.now(),
  });

  console.log('Authentication successful!');
}

// Handle sign out
async function signOut(): Promise<void> {
  await chrome.storage.sync.remove(['idToken', 'signedIn', 'signedInAt']);
  console.log('Signed out successfully');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log('Background received message:', msg);

  if (msg.type === 'BEGIN_AUTH') {
    beginAuth()
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, err: String(e) }));
    return true; // Keep message channel open for async response
  }

  if (msg.type === 'SIGN_OUT') {
    signOut()
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, err: String(e) }));
    return true;
  }

  return false;
});

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('OPT Hub extension installed/updated:', details.reason);
});

console.log('OPT Hub background service worker loaded');
