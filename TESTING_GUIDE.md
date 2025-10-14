# 🧪 Testing Guide - Extension to Dashboard Flow

## ✅ What Should Happen Now

When a user signs in from the extension:
1. Extension opens: `http://localhost:3000/auth/extension?redirect_uri=...&state=...`
2. User enters credentials and clicks "Sign in" (or uses Google/Create account)
3. Page redirects to `/auth/completing` with token
4. Page navigates to `chromiumapp.org#id_token=...` (very brief flash)
5. Extension background script:
   - Captures the token from URL
   - Stores it in `chrome.storage.sync`
   - **Navigates tab to `/dashboard`**
6. ✅ User sees dashboard, extension is logged in!

## 📋 Testing Steps

### Step 1: Reload Extension
1. Open Chrome and go to `chrome://extensions/`
2. Find "TrackMyOPT" extension
3. Click the **reload icon** (circular arrow) to load the new background script
4. ✅ Extension reloaded with dashboard navigation code

### Step 2: Test Manual Login Flow
1. Click the extension icon
2. Click "Sign in or create account"
3. Browser opens auth page
4. Enter email and password
5. Click "Sign In"
6. ✅ Should see "Success!" briefly, then navigate to dashboard
7. ✅ Extension should show logged-in state

### Step 3: Test Google OAuth Flow
1. Sign out from dashboard (if signed in)
2. Click extension icon → "Sign in or create account"
3. Click "Google" button
4. Complete Google sign-in
5. ✅ Should navigate to dashboard
6. ✅ Extension should show logged-in state

### Step 4: Test Signup Flow
1. Sign out from dashboard
2. Click extension icon → "Sign in or create account"
3. Click "create account"
4. Fill in details and click "Create Account"
5. Enter OTP code from email
6. ✅ Should navigate to dashboard
7. ✅ Extension should show logged-in state

## 🔍 What to Check

### In Browser Console (while on auth page):
```
🔄 Completing authentication...
Token: present
State: present
Redirect URI: https://...chromiumapp.org/oauth2
Web Redirect: /dashboard
📱 Extension flow detected
🔗 Extension URL: https://...chromiumapp.org/oauth2#id_token=...
🌐 Extension will navigate to dashboard after capturing token
```

### In Extension Console (background page):
```
✅ Detected redirect URI!
📄 Full URL: https://...chromiumapp.org/oauth2#id_token=...
🎫 Token received: eyJhbGciOiJIUzI1NiIsInR5cCI6...
🔐 State match: true
💾 Token stored successfully!
✅ Authentication complete!
🌐 Navigating tab to dashboard: http://localhost:3000/dashboard
```

### On Dashboard:
- ✅ User email displayed
- ✅ "Sign out" button visible
- ✅ Dashboard content loads
- ✅ No redirect loop

### In Extension Popup:
- ✅ Shows logged-in UI (not "Sign in required")
- ✅ Shows OPT tools/tiles
- ✅ Shows user info

## 🐛 Troubleshooting

### Issue: Tab doesn't navigate to dashboard
**Cause**: Extension not reloaded  
**Fix**: Go to `chrome://extensions/` and click reload icon

### Issue: Extension doesn't capture token
**Cause**: `redirect_uri` mismatch  
**Fix**: Check extension ID matches in `config.ts` and Supabase OAuth settings

### Issue: "State mismatch" error
**Cause**: CSRF token mismatch  
**Fix**: Sign out, clear `chrome.storage`, try again

### Issue: Dashboard shows "redirecting to login"
**Cause**: Session not established for web-only flow  
**Fix**: This is correct for extension flow - extension manages auth

### Issue: See chromiumapp.org URL flash
**Behavior**: This is expected! It's very brief (< 100ms)  
**Result**: Extension captures token, then navigates to dashboard

## ✅ Success Criteria

All of these should work:
- ✅ Extension manual login → Dashboard
- ✅ Extension Google OAuth → Dashboard
- ✅ Extension signup with OTP → Dashboard
- ✅ Web manual login → Dashboard
- ✅ Web Google OAuth → Dashboard
- ✅ Web signup with OTP → Dashboard
- ✅ No login loops
- ✅ Tab stays open
- ✅ Extension shows logged-in state
- ✅ Dashboard displays user data

## 🚀 Ready for Production

Once all tests pass:
1. Extension captures tokens correctly
2. Dashboard navigation works
3. Both extension and web flows work
4. No security issues (CSRF protection works)
5. User experience is smooth

**Status**: ✅ READY TO TEST!

---

**Note**: Make sure to reload the extension in `chrome://extensions/` before testing!

