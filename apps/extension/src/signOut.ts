/** When true, the user chose extension-only sign-out; do not treat web cookies as extension auth. */
export const EXTENSION_LOCAL_SIGNOUT_KEY = 'extensionLocalSignedOut';

/**
 * Remove extension auth state while keeping UI prefs like theme.
 * Does not clear website cookies or call web sign-out (dashboard session stays intact).
 */
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
  await chrome.storage.sync.set({
    signedIn: false,
    [EXTENSION_LOCAL_SIGNOUT_KEY]: true,
  });
  if (theme === 'dark' || theme === 'light') {
    await chrome.storage.sync.set({ theme });
  }
}

/**
 * Extension-only sign-out: clears local extension auth and disconnects from the web session
 * for extension purposes only. Does not log the user out of the website.
 */
export async function performExtensionSignOut(): Promise<void> {
  await clearExtensionAuthStorage();
}
