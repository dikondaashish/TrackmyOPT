# Step-by-Step Testing Guide

## CRITICAL: You MUST start from the extension, not the website!

The background listener only starts when you click "Sign in" from the EXTENSION popup.

## ✅ CORRECT Flow (Do This):

### Step 1: Start Fresh
```
1. Go to chrome://extensions/
2. Find "TrackMyOPT"  
3. Click 🔄 "Reload" button
4. Wait 2 seconds
```

### Step 2: Open Service Worker Console (For Debugging)
```
1. Still on chrome://extensions/
2. Under "TrackMyOPT", click "service worker" (blue link)
3. Console opens - KEEP IT VISIBLE
4. You should see a blank console
```

### Step 3: Start Auth FROM THE EXTENSION (IMPORTANT!)
```
1. Click the TrackMyOPT extension ICON (NOT a website tab!)
2. You should see "Sign in required" screen
3. Click "Sign in or create account" button
4. A NEW TAB opens
```

### Step 4: Watch the Console
```
In the service worker console, you should immediately see:
🔐 Starting OAuth flow
📍 Redirect URI: https://...chromiumapp.org/oauth2
🔑 State: abc123...
📂 Opened auth tab: 123
👂 Listener attached, waiting for redirect...
```

**If you DON'T see these logs:**
- You didn't start from the extension popup
- Service worker isn't running
- Go back to Step 1

### Step 5: Complete Signup
```
On the auth page that opened:
1. Select "Manual" tab
2. Click "Create account" to expand
3. Fill in the form
4. Click "Create Account"
5. Wait for success message: "Account Created! Signing you in..."
```

### Step 6: Watch What Happens
```
After the success message, watch the service worker console.

EXPECTED LOGS:
🔄 Tab updated: 123 Status: loading URL: https://...chromiumapp.org/oauth2#id_token=...
✅ Detected redirect URI!
📄 Full URL: https://...
🔍 Hash params: id_token=eyJ...&state=abc123
🎫 Token received: eyJhbGci...
🔐 State from URL: abc123
🔐 State from storage: abc123
✅ State match: true
💾 Token stored successfully!
✅ Authentication complete!
```

**Tab should close automatically after 500ms.**

### Step 7: Verify Login
```
1. Click the TrackMyOPT extension icon
2. You should see the HOME screen with tiles
3. NOT the "Sign in required" screen
```

---

## ❌ WRONG Flow (Don't Do This):

### What NOT to do:
```
❌ Opening http://localhost:3000/auth/extension directly
❌ Starting from a bookmark
❌ Refreshing the auth page
❌ Using "Sign in" after already creating account with same email
```

These won't work because the background listener isn't attached!

---

## Troubleshooting

### Problem: No Logs in Service Worker Console

**Cause:** You didn't start from the extension popup

**Solution:**
1. Close all tabs
2. Go to chrome://extensions/
3. Reload the extension
4. Open service worker console
5. Start again from Step 3 (click extension ICON, not a tab)

### Problem: "Listener attached" but nothing after that

**Cause:** The tab redirect isn't being detected

**Solution:** Check what URL the tab actually shows
1. After clicking "Create Account"
2. After you see "Account Created!" message
3. Look at the browser address bar
4. Copy the full URL and paste it here

### Problem: "State mismatch" error

**Cause:** You're reusing an old redirect or the state doesn't match

**Solution:**
```javascript
// In service worker console:
chrome.storage.sync.clear();
chrome.storage.session.clear();
console.log('Storage cleared, try again');
```

### Problem: Tab doesn't close

**Cause:** The listener captured the token but couldn't close the tab

**Check if token was stored:**
```javascript
// In service worker console:
chrome.storage.sync.get(['idToken', 'signedIn'], (data) => {
  console.log('Token exists:', !!data.idToken);
  console.log('Signed in:', data.signedIn);
});
```

If token exists:
- Manually close the tab
- Click extension icon
- You should be signed in!

---

## What to Report

After following these steps EXACTLY, tell me:

1. ✅ Did you reload the extension?
2. ✅ Did you open service worker console BEFORE clicking "Sign in"?
3. ✅ Did you start from the EXTENSION ICON (not a website)?
4. ✅ What logs appear in service worker console? (copy all of them)
5. ✅ What URL shows in the address bar after "Account Created!" message?
6. ✅ Did the tab close?
7. ✅ Are you signed in when you click the extension icon?

This will help me understand exactly what's happening!

