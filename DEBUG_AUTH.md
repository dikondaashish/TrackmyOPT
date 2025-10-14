# Debug Manual Authentication - Step by Step

## Step 1: Reload Extension (REQUIRED!)

1. Go to `chrome://extensions/`
2. Find **TrackMyOPT**
3. Click the **🔄 Reload** button
4. ✅ Confirm you see "Reload" change briefly

## Step 2: Open Service Worker Console

1. Still on `chrome://extensions/`
2. Find **TrackMyOPT**
3. Look for **"service worker"** (blue link)
4. Click on **"service worker"**
5. A DevTools console window opens
6. ✅ Keep this window open and visible

## Step 3: Try Authentication Again

1. Click the **TrackMyOPT** extension icon
2. Click **"Sign in or create account"**
3. Select **"Manual"** tab
4. Click **"Sign in"** panel to expand it
5. Enter credentials:
   - Email: `dikondaashish@gmail.com`
   - Password: (your password)
6. Click **"Sign in"**

## Step 4: Watch the Console (IMPORTANT!)

As soon as you click "Sign in", watch the service worker console.

### Expected Console Output:

```
🔐 Starting OAuth flow
📍 Redirect URI: https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2
🔑 State: abc123...
📂 Opened auth tab: 123
👂 Listener attached, waiting for redirect...
🔄 Tab updated: 123 Status: loading URL: http://localhost:3000/auth/extension?redirect_uri=...
🔄 Tab updated: 123 Status: complete URL: http://localhost:3000/auth/extension?redirect_uri=...
❌ Not redirect URI, ignoring: http://localhost:3000/auth/extension
🔄 Tab updated: 123 Status: loading URL: https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2#id_token=...
✅ Detected redirect URI!
📄 Full URL: https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2#id_token=...&state=...
🔍 Hash params: id_token=eyJ...&state=abc123
🎫 Token received: eyJhbGciOiJIUzI1NiJ9.eyJ1c2...
🔐 State from URL: abc123...
🔐 State from storage: abc123...
✅ State match: true
💾 Token stored successfully!
✅ Authentication complete!
```

### If Something Goes Wrong:

**No logs at all:**
- Extension isn't loaded properly
- Go back to Step 1 and reload
- Make sure service worker console is open BEFORE clicking "Sign in"

**Logs stop after "Listener attached":**
- Tab listener isn't firing
- This means Chrome isn't detecting tab updates
- Try: Close all browser tabs except extensions page
- Try again

**"Not redirect URI" only:**
- Means it's not detecting the `.chromiumapp.org` URL
- Check: Is the URL actually redirecting?
- Check: Does the URL contain `.chromiumapp.org/oauth2`?

**"No token found in URL":**
- The redirect happened but no token in hash
- This means the API didn't return a token
- Check: Did the login succeed?
- Check: Look for errors in the Network tab

**"State mismatch":**
- CSRF protection triggered
- Clear storage and try again:
  ```javascript
  chrome.storage.sync.clear();
  chrome.storage.session.clear();
  ```

## Step 5: Check If It Worked

After you see "✅ Authentication complete!" in the console:

1. Close the service worker console
2. Click the **TrackMyOPT** extension icon
3. You should see the **home screen** (not "Sign in required")

## If Tab Still Doesn't Close

The tab should close automatically after 500ms. If it doesn't:

1. Check console for errors
2. Manually close the tab
3. Then click extension icon - you should still be signed in

## Verify Token Storage

Run this in service worker console:

```javascript
chrome.storage.sync.get(['idToken', 'signedIn', 'signedInAt'], (data) => {
  console.log('📦 Storage:', data);
  console.log('🎫 Has token:', !!data.idToken);
  console.log('✅ Signed in:', data.signedIn);
  if (data.signedInAt) {
    const signedInDate = new Date(data.signedInAt);
    console.log('⏰ Signed in at:', signedInDate.toLocaleString());
  }
});
```

Expected output:
```
📦 Storage: {idToken: "eyJ...", signedIn: true, signedInAt: 1760452128000}
🎫 Has token: true
✅ Signed in: true
⏰ Signed in at: 10/14/2025, 12:35:28 PM
```

## What to Report

After following all steps, tell me:

1. ✅ Did you reload the extension?
2. ✅ Did you open service worker console BEFORE signing in?
3. ✅ What console logs did you see? (copy/paste them)
4. ✅ Did the tab close automatically?
5. ✅ When you click the extension icon, do you see home or locked screen?
6. ✅ What does the storage check show?

This will help me understand exactly what's happening!

