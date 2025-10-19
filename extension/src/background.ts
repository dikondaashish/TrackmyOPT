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
  console.log('🔐 Starting simple auth flow');
  console.log('📍 Opening login page');
  
  // Simple flow: Just open the login page
  const tab = await chrome.tabs.create({ url: API_ENDPOINTS.AUTH });
  console.log('📂 Opened auth tab:', tab.id);
  
  // Listen for successful login (tab navigates to dashboard)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Auth timeout'));
    }, 5 * 60 * 1000); // 5 minute timeout
    
    const listener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, currentTab: chrome.tabs.Tab) => {
      if (tabId !== tab.id) return;
      
      const responseUrl = changeInfo.url || currentTab.url;
      if (!responseUrl) return;
      
      console.log('🔄 Tab updated:', changeInfo.status, 'URL:', responseUrl.substring(0, 80));
      
      // Check if user reached dashboard (successful login)
      if (responseUrl.includes('/dashboard')) {
        console.log('✅ User reached dashboard - login successful!');
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Wait a moment for cookies to settle, then check session
        setTimeout(async () => {
          try {
            console.log('🔍 Extension: Verifying session via /api/me...');
            const response = await fetch(API_ENDPOINTS.ME, {
              credentials: 'include', // Important: include cookies
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log('✅ Extension: Session verified!', userData.user?.email);
              console.log('👤 Extension: User data:', userData);
              
              // Mark as signed in
              await chrome.storage.sync.set({ signedIn: true });
              console.log('💾 Extension: Marked as signed in');
              
              resolve();
            } else {
              console.log('⚠️ Extension: Dashboard reached but no session yet, waiting...');
              // Give it another moment for cookies to sync
              setTimeout(async () => {
                const retry = await fetch(API_ENDPOINTS.ME, { 
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                if (retry.ok) {
                  const userData = await retry.json();
                  console.log('✅ Extension: Session verified on retry!', userData.user?.email);
                  
                  // Mark as signed in
                  await chrome.storage.sync.set({ signedIn: true });
                  console.log('💾 Extension: Marked as signed in');
                  
                  resolve();
                } else {
                  const errorText = await retry.text();
                  console.error('❌ Extension: Session verification failed:', errorText);
                  reject(new Error('Could not verify session'));
                }
              }, 1500);
            }
          } catch (err) {
            console.error('❌ Extension: Error verifying session:', err);
            reject(err);
          }
        }, 1000);
        return;
      }
      
      // If user closes the tab before logging in
      if (changeInfo.status === 'complete' && responseUrl === 'about:blank') {
        console.log('❌ Auth tab closed');
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('Auth cancelled'));
        return;
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
    console.log('👂 Listener attached, waiting for redirect...');
  });
}
