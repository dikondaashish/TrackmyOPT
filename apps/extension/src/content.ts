/**
 * Content script for TrackMyOPT extension
 * Runs on trackmyopt.com to mark extension as connected
 */

let extensionContextActive = true;

/** Stop this stale content-script instance after an extension reload/update. */
function deactivateStaleContentScript(): void {
  if (!extensionContextActive) return;
  extensionContextActive = false;
  window.removeEventListener('message', handlePageMessage);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.removeEventListener('DOMContentLoaded', signalExtensionPresentToPage);
}

// Helper to safely get extension version. Context invalidation is an expected
// lifecycle event after reloading an unpacked extension, not an extension error.
function getExtensionVersion(): string | null {
  if (!extensionContextActive) return null;
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    deactivateStaleContentScript();
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
  } catch {
    // Storage can be unavailable in restricted browsing contexts. Detection is
    // best-effort and should never surface as a Chrome extension error.
  }
}

// Run immediately when content script loads
markExtensionConnected();

/** Signals for the dashboard (useExtensionDetector / sidebar) that the extension is present. */
function signalExtensionPresentToPage() {
  try {
    const version = getExtensionVersion();
    if (!version) return;
    if (!document.getElementById('trackmyopt-extension-installed')) {
      const marker = document.createElement('div');
      marker.id = 'trackmyopt-extension-installed';
      marker.setAttribute('data-version', version);
      marker.setAttribute('aria-hidden', 'true');
      marker.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;clip:rect(0,0,0,0);';
      (document.documentElement || document.body).appendChild(marker);
    }
    document.documentElement.setAttribute('data-trackmyopt-extension', version);
    window.dispatchEvent(new CustomEvent('trackmyopt-extension-loaded', { detail: { version } }));
  } catch {
    // ignore
  }
}

if (document.documentElement) {
  signalExtensionPresentToPage();
} else {
  document.addEventListener('DOMContentLoaded', signalExtensionPresentToPage, { once: true });
}

// Also listen for messages from the page
function handlePageMessage(event: MessageEvent) {
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
      signalExtensionPresentToPage();
    } catch {
      deactivateStaleContentScript();
    }
  }
}
window.addEventListener('message', handlePageMessage);

// Re-mark on visibility change (when user comes back to tab)
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    markExtensionConnected();
    signalExtensionPresentToPage();
  }
}
document.addEventListener('visibilitychange', handleVisibilityChange);
