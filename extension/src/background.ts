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

  const url = new URL('http://localhost:3000/auth/extension');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  const responseUrl = await chrome.identity.launchWebAuthFlow({ url: url.toString(), interactive: true });
  const hash = new URL(responseUrl).hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get('id_token');
  const gotState = params.get('state');
  const { oauth_state } = await chrome.storage.session.get('oauth_state');
  if (!token || gotState !== oauth_state) throw new Error('Auth failed');

  await chrome.storage.sync.set({ idToken: token, signedIn: true, signedInAt: Date.now() });
}
