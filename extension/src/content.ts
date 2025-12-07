/**
 * Content script for TrackMyOPT extension
 * Runs on trackmyopt.com to mark extension as connected
 */

// Mark extension as connected in localStorage
function markExtensionConnected() {
  const version = chrome.runtime.getManifest().version;
  localStorage.setItem('tmo_extension_connected', 'true');
  localStorage.setItem('tmo_extension_version', version);
  localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
}

// Run immediately when content script loads
markExtensionConnected();

// Also listen for messages from the page
window.addEventListener('message', (event) => {
  // Only accept messages from the same origin
  if (event.origin !== window.location.origin) return;
  
  if (event.data?.type === 'TMO_CHECK_EXTENSION') {
    // Respond that extension is installed
    window.postMessage({
      type: 'TMO_EXTENSION_PRESENT',
      version: chrome.runtime.getManifest().version,
    }, '*');
    
    // Also update localStorage
    markExtensionConnected();
  }
});

// Re-mark on visibility change (when user comes back to tab)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    markExtensionConnected();
  }
});

console.log('[TrackMyOPT Extension] Content script loaded');
