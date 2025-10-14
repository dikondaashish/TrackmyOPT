# How to Verify Manual Authentication Worked

## What You Saw (This is NORMAL!)

After clicking "Create Account", you briefly saw:
```
This site can't be reached
dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org
DNS_PROBE_FINISHED_NXDOMAIN
```

**This is expected!** The extension's redirect URI is a special Chrome extension URL that can't be loaded in a normal browser tab. The extension should automatically:
1. Detect this URL
2. Extract the token from the URL
3. Close the tab
4. Sign you in

## Steps to Verify It Worked

### Step 1: Check if Tab Closed Automatically
- Did the error page close by itself after 1-2 seconds?
- ✅ **If YES**: Authentication likely worked!
- ❌ **If NO**: Continue to Step 2

### Step 2: Open Extension Popup
1. Click the **TrackMyOPT** extension icon in Chrome toolbar
2. What do you see?

**Expected Result:**
- You should see the home screen with tiles (OPT Apply, STEM Apply, Clock Tracker)
- NOT the locked "Sign in required" screen

**If you still see the locked screen:**
- Continue to Step 3 to check extension logs

### Step 3: Check Extension Console Logs

1. Go to `chrome://extensions/`
2. Find "TrackMyOPT"
3. Click on **"service worker"** (blue link under the extension)
4. Look for console logs

**Expected logs:**
```
Starting OAuth flow, redirect_uri: https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2
OAuth response URL: https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2#id_token=...
Token received: eyJhbGciOiJIUzI1NiJ9...
State match: true
Token stored successfully
```

**If you see these logs:**
- ✅ Authentication worked!
- The token is stored
- Reload the popup and you should be signed in

**If you DON'T see these logs:**
- Continue to troubleshooting below

## Troubleshooting

### Issue: Tab Doesn't Close Automatically

**Possible causes:**
1. Extension isn't detecting the redirect URL
2. `chrome.tabs.onUpdated` listener isn't firing
3. State mismatch

**Solution: Reload Extension**
1. Go to `chrome://extensions/`
2. Find "TrackMyOPT"
3. Click the **🔄 Reload** button
4. Try signing in again

### Issue: No Logs in Service Worker Console

**This means the listener isn't running.**

**Solution:**
```bash
# Rebuild extension
cd extension
pnpm build

# Then reload in Chrome
# chrome://extensions/ → Click reload
```

### Issue: State Mismatch Error

If you see:
```
State match: false
Auth failed
```

**This means:**
- The state parameter doesn't match
- This is a security measure to prevent CSRF attacks

**Solution:**
1. Clear extension storage:
   ```javascript
   // In service worker console:
   chrome.storage.sync.clear();
   chrome.storage.session.clear();
   console.log('Storage cleared');
   ```
2. Try signing in again

## Alternative: Check Storage Directly

1. Open service worker console (`chrome://extensions/` → "service worker")
2. Run this command:
   ```javascript
   chrome.storage.sync.get(['idToken', 'signedIn', 'signedInAt'], (data) => {
     console.log('Storage data:', data);
   });
   ```

**Expected output:**
```javascript
Storage data: {
  idToken: "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI...",
  signedIn: true,
  signedInAt: 1760452128000
}
```

**If you see this:**
- ✅ Token is stored!
- Open the popup - you should be signed in
- If popup still shows locked screen, refresh it

## Still Not Working?

### Quick Fix: Manual Token Storage

If the automatic flow isn't working, you can manually store the token:

1. Open service worker console
2. Extract the token from the URL you received:
   ```
   eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxYjQ4OGJmYi04YzgzLTQ4NDYtOTY0Yi1iNWE3MjY2OTY0ZGUiLCJlbWFpbCI6ImRpa29uZGFhc2hpc2hAZ21haWwuY29tIiwic3ViIjoiMWI0ODhiZmItOGM4My00ODQ2LTk2NGItYjVhNzI2Njk2NGRlIiwiaWF0IjoxNzYwNDUyMTI4LCJpc3MiOiJ0cmFja215b3B0LXdlYiIsImF1ZCI6InRyYWNrbXlvcHQtZXh0ZW5zaW9uIiwiZXhwIjoxNzYwNDUyNzI4fQ.2h6LLG8XMvbWh4hFCKW2w_LP-JOWmac6qQgXd-nIMQw
   ```
3. Run this in service worker console:
   ```javascript
   const token = "YOUR_TOKEN_HERE"; // Paste the full token
   chrome.storage.sync.set({
     idToken: token,
     signedIn: true,
     signedInAt: Date.now()
   }, () => {
     console.log('Token manually stored!');
   });
   ```
4. Reload the extension popup

## Better UX: Show Success Page First

If the error page is confusing, we can improve the flow by:
1. After signup/login, redirect to a success page FIRST
2. That page shows "Success! Redirecting to extension..."
3. Then after 1 second, redirect to the extension URI
4. This way users see a success message instead of an error

Would you like me to implement this improvement?

## What's Your Status?

**After following these steps, tell me:**
1. ✅ Did the tab close automatically?
2. ✅ Do you see the home screen when you open the popup?
3. ✅ What logs do you see in the service worker console?
4. ✅ What does `chrome.storage.sync.get()` show?

This will help me determine if it worked or if we need to fix something.

