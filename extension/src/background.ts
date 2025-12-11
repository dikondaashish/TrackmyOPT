import { API_ENDPOINTS, DASHBOARD_URL } from './config';

// Internal message listener (from popup)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'BEGIN_AUTH') {
    beginAuth().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false, err:String(e)}));
    return true;
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

async function beginAuth(){
  const tab = await chrome.tabs.create({ url: API_ENDPOINTS.AUTH });
  
  if (!tab.id) {
    throw new Error('Could not create tab');
  }
  
  const tabId = tab.id;
  
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Auth timeout'));
    }, 5 * 60 * 1000); // 5 minute timeout
    
    // Helper to check if URL indicates successful login
    const isDashboardUrl = (url: string) => {
      return url.includes('dashboard.trackmyopt.com');
    };
    
    // Helper to handle successful login detection
    const handleLoginSuccess = async () => {
      clearTimeout(timeout);
      chrome.tabs.onUpdated.removeListener(listener);
      
      console.log('[TrackMyOPT] Login detected, setting signedIn: true');
      
      // Set signed in immediately - don't rely on API call (cookies don't work in extensions)
      await chrome.storage.sync.set({ signedIn: true });
      
      // Try to mark extension as connected on the dashboard page
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: (version: string) => {
            localStorage.setItem('tmo_extension_connected', 'true');
            localStorage.setItem('tmo_extension_version', version);
            localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
          },
          args: [chrome.runtime.getManifest().version]
        });
      } catch (e) {
        // Scripting might fail, that's ok
      }
      
      resolve();
    };
    
    // Check if tab is already at dashboard (fast redirect for already logged-in users)
    const checkCurrentUrl = async () => {
      try {
        const currentTab = await chrome.tabs.get(tabId);
        if (currentTab.url && isDashboardUrl(currentTab.url)) {
          await handleLoginSuccess();
          return true;
        }
      } catch {
        // Tab might not exist yet
      }
      return false;
    };
    
    // Check immediately and also after a short delay (for fast redirects)
    setTimeout(async () => {
      await checkCurrentUrl();
    }, 500);
    
    setTimeout(async () => {
      await checkCurrentUrl();
    }, 1500);
    
    // Also listen for URL changes
    const listener = async (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo, currentTab: chrome.tabs.Tab) => {
      if (updatedTabId !== tabId) return;
      
      const url = changeInfo.url || currentTab.url || '';
      
      // Check if user reached dashboard (successful login)
      if (url && isDashboardUrl(url)) {
        await handleLoginSuccess();
        return;
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
    
    // Also listen for tab close (user cancelled)
    chrome.tabs.onRemoved.addListener(function onRemoved(removedTabId) {
      if (removedTabId === tabId) {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.onRemoved.removeListener(onRemoved);
        reject(new Error('Auth cancelled'));
      }
    });
  });
}
