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
  const redirectUri = chrome.identity.getRedirectURL('oauth2');
  const state = randomString(16);
  await chrome.storage.session.set({ oauth_state: state });

  const url = new URL(API_ENDPOINTS.AUTH);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  console.log('🔐 Starting OAuth flow');
  console.log('📍 Redirect URI:', redirectUri);
  console.log('🔑 State:', state);
  
  // Open in a new tab instead of popup window
  const tab = await chrome.tabs.create({ url: url.toString() });
  console.log('📂 Opened auth tab:', tab.id);
  
  // Listen for the tab to navigate to our redirect URI
  return new Promise((resolve, reject) => {
    const listener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, currentTab: chrome.tabs.Tab) => {
      console.log('🔄 Tab updated:', tabId, 'Status:', changeInfo.status, 'URL:', changeInfo.url);
      
      if (tabId !== tab.id) return;
      
      const responseUrl = changeInfo.url || currentTab.url;
      if (!responseUrl) return;
      
      // Check if this is our redirect URI (check both with and without hash)
      const isRedirectUri = responseUrl.startsWith(redirectUri) || 
                           responseUrl.includes('.chromiumapp.org/oauth2');
      
      if (!isRedirectUri) {
        console.log('❌ Not redirect URI, ignoring:', responseUrl.substring(0, 50));
        return;
      }
      
      console.log('✅ Detected redirect URI!');
      console.log('📄 Full URL:', responseUrl);
      
      // Remove the listener
      chrome.tabs.onUpdated.removeListener(listener);
      
      try {
        // Parse hash from URL
        const urlObj = new URL(responseUrl);
        const hash = urlObj.hash.substring(1);
        console.log('🔍 Hash params:', hash);
        
        const params = new URLSearchParams(hash);
        const token = params.get('id_token');
        const gotState = params.get('state');
        const { oauth_state } = await chrome.storage.session.get('oauth_state');
        
        console.log('🎫 Token received:', token ? `${token.substring(0, 30)}...` : 'null');
        console.log('🔐 State from URL:', gotState);
        console.log('🔐 State from storage:', oauth_state);
        console.log('✅ State match:', gotState === oauth_state);
        
        if (!token) {
          console.error('❌ No token found in URL');
          reject(new Error('No token in response'));
          return;
        }
        
        if (gotState !== oauth_state) {
          console.error('❌ State mismatch - CSRF protection triggered');
          reject(new Error('State mismatch'));
          return;
        }

        // Store the token and sign-in status
        await chrome.storage.sync.set({ 
          idToken: token, 
          signedIn: true, 
          signedInAt: Date.now() 
        });
        console.log('💾 Token stored successfully!');
        console.log('✅ Authentication complete!');
        
        // Navigate the tab to dashboard after capturing token
        const dashboardUrl = process.env.NODE_ENV === 'production' 
          ? 'https://trackmyopt.com/dashboard'
          : 'http://localhost:3000/dashboard';
        
        console.log('🌐 Navigating tab to dashboard:', dashboardUrl);
        await chrome.tabs.update(tab.id, { url: dashboardUrl });
        
        resolve(undefined);
      } catch (error) {
        console.error('❌ Error processing auth response:', error);
        reject(error);
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
    console.log('👂 Listener attached, waiting for redirect...');
  });
}
