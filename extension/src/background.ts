import { WEBSITE_URL } from './config';

// Message types
interface Message {
  type: string;
  [key: string]: any;
}

// Generate random state for CSRF protection
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

// Start the OAuth authentication flow
async function startAuthFlow(): Promise<{ token: string } | { error: string }> {
  try {
    // Generate state for CSRF protection
    const state = generateRandomState();

    // Store state temporarily
    await chrome.storage.local.set({ oauth_state: state });

    // Build auth URL
    const redirectUri = chrome.identity.getRedirectURL('oauth2');
    const authUrl = new URL(`${WEBSITE_URL}/auth/extension`);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    console.log('Starting auth flow...');
    console.log('Redirect URI:', redirectUri);
    console.log('Auth URL:', authUrl.toString());

    // Launch web auth flow
    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });

    console.log('Response URL:', responseUrl);

    // Parse the response URL
    if (!responseUrl) {
      throw new Error('No response URL received');
    }

    // Extract token from fragment
    const url = new URL(responseUrl);
    const fragment = url.hash.substring(1); // Remove #
    const params = new URLSearchParams(fragment);

    const idToken = params.get('id_token');
    const returnedState = params.get('state');

    // Verify state
    const { oauth_state } = await chrome.storage.local.get('oauth_state');
    if (returnedState !== oauth_state) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    if (!idToken) {
      throw new Error('No token received');
    }

    // Store token and mark as signed in
    await chrome.storage.sync.set({
      idToken: idToken,
      signedIn: true,
      signedInAt: Date.now(),
    });

    // Clean up temporary state
    await chrome.storage.local.remove('oauth_state');

    console.log('Authentication successful!');

    return { token: idToken };
  } catch (error: any) {
    console.error('Auth flow error:', error);
    return { error: error.message || 'Authentication failed' };
  }
}

// Handle sign out
async function signOut() {
  await chrome.storage.sync.remove(['idToken', 'signedIn', 'signedInAt']);
  console.log('Signed out successfully');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    console.log('Background received message:', message);

    if (message.type === 'BEGIN_AUTH') {
      startAuthFlow()
        .then((result) => {
          sendResponse(result);
        })
        .catch((error) => {
          sendResponse({ error: error.message });
        });
      return true; // Keep message channel open for async response
    }

    if (message.type === 'SIGN_OUT') {
      signOut()
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ error: error.message });
        });
      return true;
    }

    return false;
  }
);

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('OPT Hub extension installed/updated:', details.reason);
});

console.log('OPT Hub background service worker loaded');
