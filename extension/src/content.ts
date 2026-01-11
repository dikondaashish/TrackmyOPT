/**
 * Content script for TrackMyOPT extension
 * Runs on trackmyopt.com to mark extension as connected
 */

// Helper to safely get extension version
function getExtensionVersion(): string | null {
  try {
    return chrome.runtime.getManifest().version;
  } catch (error) {
    // Extension context invalidated - extension was reloaded
    console.warn('[TrackMyOPT] Extension context invalidated, please refresh the page');
    return null;
  }
}

// Mark extension as connected in localStorage
function markExtensionConnected() {
  try {
    const version = getExtensionVersion();
    if (!version) return; // Extension context invalidated

    localStorage.setItem('tmo_extension_connected', 'true');
    localStorage.setItem('tmo_extension_version', version);
    localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
  } catch (error) {
    console.warn('[TrackMyOPT] Failed to mark extension connected:', error);
  }
}

// Run immediately when content script loads
markExtensionConnected();

// Also listen for messages from the page
window.addEventListener('message', (event) => {
  // Only accept messages from the same origin
  if (event.origin !== window.location.origin) return;

  if (event.data?.type === 'TMO_CHECK_EXTENSION') {
    try {
      const version = getExtensionVersion();
      if (!version) return; // Extension context invalidated

      // Respond that extension is installed
      window.postMessage({
        type: 'TMO_EXTENSION_PRESENT',
        version,
      }, '*');

      // Also update localStorage
      markExtensionConnected();
    } catch (error) {
      console.warn('[TrackMyOPT] Failed to respond to extension check:', error);
    }
  }
});

// Re-mark on visibility change (when user comes back to tab)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    markExtensionConnected();
  }
});

console.log('[TrackMyOPT Extension] Content script loaded');
