import { API_ENDPOINTS } from './config';

function randomString(len=32){
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'BEGIN_AUTH') {
    beginAuth().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false, err:String(e)}));
    return true;
  }
});

async function beginAuth(){
  const state = randomString(16);
  await chrome.storage.session.set({ oauth_state: state });

  // Use the website's auth page instead of Chrome identity
  const authUrl = `${API_ENDPOINTS.AUTH}?redirect=/dashboard`;
  
  console.log('🔐 Starting OAuth flow');
  console.log('📍 Auth URL:', authUrl);
  console.log('🔑 State:', state);
  
  // Open in a new tab
  const tab = await chrome.tabs.create({ url: authUrl });
  console.log('📂 Opened auth tab:', tab.id);
  
  // Listen for the tab to navigate to dashboard (success) or back to auth (failure)
  return new Promise((resolve, reject) => {
    const listener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, currentTab: chrome.tabs.Tab) => {
      if (tabId !== tab.id) return;
      
      const responseUrl = changeInfo.url || currentTab.url;
      if (!responseUrl) return;
      
      console.log('🔄 Tab URL changed:', responseUrl);
      
      // Check if user successfully reached dashboard
      if (responseUrl.includes('/dashboard')) {
        console.log('✅ Successfully reached dashboard!');
        
        // Remove the listener
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Set signed in status - the website has the session, extension just needs to know user is logged in
        await chrome.storage.sync.set({ 
          signedIn: true, 
          signedInAt: Date.now() 
        });
        console.log('💾 Signed in status stored!');
        console.log('✅ Authentication complete!');
        
        // Close the auth tab after a short delay
        setTimeout(() => {
          chrome.tabs.remove(tab.id!).catch(console.error);
        }, 1000);
        
        resolve(undefined);
        return;
      }
      
      // Check if user is back at auth page with error
      if (responseUrl.includes('/auth/extension') && responseUrl.includes('error=')) {
        console.log('⚠️ Back at auth page with error');
        
        // Check if there's an error in the URL
        const urlObj = new URL(responseUrl);
        const error = urlObj.searchParams.get('error');
        
        if (error) {
          console.error('❌ Auth error detected:', error);
          
          // Remove the listener
          chrome.tabs.onUpdated.removeListener(listener);
          
          reject(new Error(`Authentication failed: ${error}`));
          return;
        }
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
    console.log('👂 Listener attached, waiting for dashboard redirect...');
  });
}
