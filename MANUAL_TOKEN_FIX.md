# Manual Token Storage - Quick Fix

Since your account exists in Supabase but the extension isn't signed in, let's manually store the token.

## Quick Fix (2 minutes)

### Step 1: Sign In to Get a New Token

1. **IMPORTANT**: Start from the extension popup
   - Click the **TrackMyOPT** extension icon
   - Click **"Sign in or create account"** button
   - This starts the listener in the background

2. On the auth page:
   - Select **"Manual"** tab
   - Expand **"Sign in"** panel (not "Create account" - account already exists!)
   - Enter your credentials:
     - Email: `dikondaashish@gmail.com`
     - Password: (your password)
   - Click **"Sign in"**

3. You'll be redirected to:
   ```
   https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2#id_token=...&state=...
   ```

4. **QUICKLY** copy the ENTIRE URL from the address bar before any error appears

### Step 2: Extract the Token

From the URL you copied, find the `id_token=` part.

Example URL:
```
https://...chromiumapp.org/oauth2#id_token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOi...&state=abc123
```

Copy everything between `id_token=` and `&state=`:
```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxYjQ4OGJmYi04YzgzLTQ4NDYtOTY0Yi1iNWE3MjY2OTY0ZGUiLCJlbWFpbCI6ImRpa29uZGFhc2hpc2hAZ21haWwuY29tIiwic3ViIjoiMWI0ODhiZmItOGM4My00ODQ2LTk2NGItYjVhNzI2Njk2NGRlIiwiaWF0IjoxNzYwNDUyMTI4LCJpc3MiOiJ0cmFja215b3B0LXdlYiIsImF1ZCI6InRyYWNrbXlvcHQtZXh0ZW5zaW9uIiwiZXhwIjoxNzYwNDUyNzI4fQ.2h6LLG8XMvbWh4hFCKW2w_LP-JOWmac6qQgXd-nIMQw
```

### Step 3: Manually Store Token

1. Go to `chrome://extensions/`
2. Find **TrackMyOPT**
3. Click **"service worker"** (blue link)
4. In the console that opens, paste this code:

```javascript
// Replace YOUR_TOKEN_HERE with the token you copied
const token = "YOUR_TOKEN_HERE";

chrome.storage.sync.set({
  idToken: token,
  signedIn: true,
  signedInAt: Date.now()
}, () => {
  console.log('✅ Token manually stored!');
  console.log('🎫 Token:', token.substring(0, 30) + '...');
  console.log('⏰ Signed in at:', new Date().toLocaleString());
  console.log('');
  console.log('👉 Now close this console and click the extension icon!');
});
```

5. Press **Enter** to run it
6. You should see:
   ```
   ✅ Token manually stored!
   🎫 Token: eyJhbGciOiJIUzI1NiJ9.eyJ1c2...
   ⏰ Signed in at: 10/14/2025, 1:23:45 PM
   
   👉 Now close this console and click the extension icon!
   ```

### Step 4: Verify It Worked

1. Close the service worker console
2. Click the **TrackMyOPT** extension icon
3. ✅ You should now see the **home screen** with tiles!

---

## Alternative: Use Your Existing Token

If you still have the URL from your previous attempt, you can use that token:

Your previous URL was:
```
https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2#id_token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxYjQ4OGJmYi04YzgzLTQ4NDYtOTY0Yi1iNWE3MjY2OTY0ZGUiLCJlbWFpbCI6ImRpa29uZGFhc2hpc2hAZ21haWwuY29tIiwic3ViIjoiMWI0ODhiZmItOGM4My00ODQ2LTk2NGItYjVhNzI2Njk2NGRlIiwiaWF0IjoxNzYwNDUyMTI4LCJpc3MiOiJ0cmFja215b3B0LXdlYiIsImF1ZCI6InRyYWNrbXlvcHQtZXh0ZW5zaW9uIiwiZXhwIjoxNzYwNDUyNzI4fQ.2h6LLG8XMvbWh4hFCKW2w_LP-JOWmac6qQgXd-nIMQw&state=2b9abb16f8f0fe3668dd6d67b51c2912
```

Token from that URL:
```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxYjQ4OGJmYi04YzgzLTQ4NDYtOTY0Yi1iNWE3MjY2OTY0ZGUiLCJlbWFpbCI6ImRpa29uZGFhc2hpc2hAZ21haWwuY29tIiwic3ViIjoiMWI0ODhiZmItOGM4My00ODQ2LTk2NGItYjVhNzI2Njk2NGRlIiwiaWF0IjoxNzYwNDUyMTI4LCJpc3MiOiJ0cmFja215b3B0LXdlYiIsImF1ZCI6InRyYWNrbXlvcHQtZXh0ZW5zaW9uIiwiZXhwIjoxNzYwNDUyNzI4fQ.2h6LLG8XMvbWh4hFCKW2w_LP-JOWmac6qQgXd-nIMQw
```

**⚠️ WARNING**: This token expires after 10 minutes! 

Check if it's expired:
```javascript
const token = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxYjQ4OGJmYi04YzgzLTQ4NDYtOTY0Yi1iNWE3MjY2OTY0ZGUiLCJlbWFpbCI6ImRpa29uZGFhc2hpc2hAZ21haWwuY29tIiwic3ViIjoiMWI0ODhiZmItOGM4My00ODQ2LTk2NGItYjVhNzI2Njk2NGRlIiwiaWF0IjoxNzYwNDUyMTI4LCJpc3MiOiJ0cmFja215b3B0LXdlYiIsImF1ZCI6InRyYWNrbXlvcHQtZXh0ZW5zaW9uIiwiZXhwIjoxNzYwNDUyNzI4fQ.2h6LLG8XMvbWh4hFCKW2w_LP-JOWmac6qQgXd-nIMQw";

// Decode the token (middle part between the two dots)
const payload = JSON.parse(atob(token.split('.')[1]));
const expiresAt = new Date(payload.exp * 1000);
const now = new Date();

console.log('🕐 Token issued at:', new Date(payload.iat * 1000).toLocaleString());
console.log('⏰ Token expires at:', expiresAt.toLocaleString());
console.log('🕐 Current time:', now.toLocaleString());
console.log('');
if (now < expiresAt) {
  console.log('✅ Token is still valid! You can use it.');
  console.log('⏱️ Time remaining:', Math.round((expiresAt - now) / 1000 / 60), 'minutes');
} else {
  console.log('❌ Token expired', Math.round((now - expiresAt) / 1000 / 60), 'minutes ago');
  console.log('👉 You need to sign in again to get a fresh token');
}
```

If expired, go back to Step 1 to get a fresh token.

---

## Why This Happens

The issue is that the background script's tab listener isn't capturing the redirect. This could be because:

1. **Listener not attached**: Service worker wasn't running when you started auth
2. **Tab not detected**: The `chrome.tabs.onUpdated` event didn't fire
3. **Wrong entry point**: You might have navigated directly to the auth page instead of starting from the extension

The proper flow is:
```
Extension Popup Click → Starts Listener → Opens Auth Tab → Listener Captures Redirect → Stores Token
```

If you skip the first step, no listener is attached, so the redirect is never captured.

---

## After Manual Storage Works

Once you've verified it works with manual storage, we can fix the automatic flow. The extension should handle this automatically, but we need to debug why the listener isn't working.

