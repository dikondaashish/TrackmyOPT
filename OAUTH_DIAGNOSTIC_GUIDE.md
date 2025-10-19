# 🔐 OAuth/Authentication Flow Diagnostic Guide

**Date:** October 19, 2025  
**Status:** Comprehensive Analysis & Testing Plan

---

## 📊 Problem Summary

### Working Flows ✅
1. **Web App - Email/Password Login**: Fully functional
2. **Browser Extension - Google OAuth**: Fully functional

### Broken Flows ❌
1. **Web App - Google OAuth**: Redirect fails, malformed URL, no authorization code received
2. **Browser Extension - Email Account Creation**: Does not complete

---

## 🔍 Root Cause Analysis

Based on code review and your detailed behavioral breakdown:

### 1. Web App Google OAuth Issue

**Symptoms:**
- OAuth flow initiates correctly
- Google account picker appears and user authenticates
- **FAILURE**: Redirect URL malformed or missing authorization code
- User lands on error page instead of dashboard

**Likely Root Causes:**

#### A. Supabase Redirect URL Configuration
The web app uses a different OAuth callback path than the extension:
- **Extension**: `/auth/extension/callback/client` → `/auth/extension/callback/server`
- **Web**: `/auth/callback` (direct callback)

**Code Reference** (`web/app/auth/extension/page.tsx` lines 134-149):
```typescript
// Web flow: redirect to callback route which will then redirect to dashboard
const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirect)}`;

const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: callbackUrl,
  },
});
```

**Required Configuration:**
The Supabase redirect URL **MUST** include:
- `https://www.trackmyopt.com/auth/callback`
- This EXACT URL must be registered in **both** Supabase AND Google Cloud Console

#### B. Google Cloud Console Configuration
Your Google OAuth Client ID needs **ALL** these redirect URIs:

```
✅ https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback (Supabase - PRIMARY)
✅ https://www.trackmyopt.com/auth/callback (Web App - CRITICAL)
✅ https://www.trackmyopt.com/auth/extension/callback/client (Extension)
✅ https://<extension-id>.chromiumapp.org/oauth2 (Extension Chrome Identity)
```

**Missing**: The web app callback URL might not be registered in Google Console

#### C. Environment Variable Issue
The callback URL generation depends on `NEXT_PUBLIC_SITE_URL`:

```typescript
const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`;
```

**Potential Issues:**
- `NEXT_PUBLIC_SITE_URL` not set or incorrect in production
- Defaults to wrong URL (localhost, missing www, http instead of https)

---

### 2. Extension Account Creation Issue

**Symptoms:**
- User opens extension and attempts to create account
- Account creation does not complete

**Likely Root Causes:**

#### A. Extension Flow Detection Logic
The code now has proper detection (`web/app/auth/extension/page.tsx` lines 18-23):

```typescript
const isExtensionFlow = !!(
  redirectUri && 
  state && 
  (redirectUri.includes('chromiumapp.org') || redirectUri.includes('chrome-extension://'))
);
```

**This is correct** - it only treats it as extension flow if redirect_uri contains chrome extension URL.

#### B. Account Creation After OTP Verification
After OTP verification, the code tries to establish a session (`web/app/auth/extension/page.tsx` lines 308-330):

```typescript
// Web flow: establish server-side session for the new account
const sessionRes = await fetch('/api/auth/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include',
});
```

**Potential Issue:**
- If extension opens web page for account creation, `isExtensionFlow` might be false
- Session establishment might fail silently
- CORS might block the API call from extension context

#### C. Extension Manifest Permissions
The extension `manifest.json` has:
```json
"host_permissions": ["http://localhost:3000/*", "https://*.vercel.app/*"]
```

**MISSING**: `https://www.trackmyopt.com/*` or `https://trackmyopt.com/*`

This could prevent the extension from making API calls to the production site!

---

## 🛠️ Action Plan

### Priority 1: Fix Web App Google OAuth (CRITICAL)

#### Step 1: Verify Environment Variable
Check your production environment (Vercel/deployment platform):

```bash
# This should output: https://www.trackmyopt.com
echo $NEXT_PUBLIC_SITE_URL
```

**How to check in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `NEXT_PUBLIC_SITE_URL`
3. It should be exactly: `https://www.trackmyopt.com` (with www)

**If missing or incorrect:**
```
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
```

#### Step 2: Verify Supabase Redirect URLs
Go to: Supabase Dashboard → Authentication → URL Configuration

**Required Redirect URLs:**
```
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback/client
https://www.trackmyopt.com/auth/extension/callback/server
https://www.trackmyopt.com/dashboard
```

#### Step 3: Verify Google Cloud Console
Go to: Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client ID

**Authorized JavaScript origins:**
```
https://www.trackmyopt.com
http://localhost:3000 (for dev)
```

**Authorized redirect URIs:**
```
https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback/client
https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2
```

⚠️ **CRITICAL**: After changing Google Console settings, wait 5-10 minutes for changes to propagate!

#### Step 4: Add Console Logging
Add temporary logging to debug the OAuth flow:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try Google sign-in
4. Look for these log messages:
   - `🌐 Web OAuth flow - Callback URL: ...`
   - `🔄 OAuth callback for web flow`
   - `✅ OAuth session established for user: ...`

#### Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Click "Sign in with Google"
3. Watch the redirect chain:
   ```
   /auth/extension 
   → accounts.google.com/o/oauth2/v2/auth
   → accounts.google.com (consent)
   → /auth/callback?code=xxx... ← Should see this!
   → /dashboard
   ```

**If you DON'T see `/auth/callback?code=...`:**
- The redirect_uri in Supabase or Google Console is wrong
- Check the URL you're being redirected to instead

---

### Priority 2: Fix Extension Account Creation

#### Step 1: Update Extension Manifest
**File:** `extension/manifest.json`

**Current:**
```json
"host_permissions": ["http://localhost:3000/*", "https://*.vercel.app/*"]
```

**Should be:**
```json
"host_permissions": [
  "http://localhost:3000/*", 
  "https://*.vercel.app/*",
  "https://www.trackmyopt.com/*",
  "https://trackmyopt.com/*"
]
```

This allows the extension to make API calls to your production site.

#### Step 2: Test Account Creation Path
From the extension:
1. Click "Sign in or create account"
2. **Watch the URL that opens:**
   - Should be: `https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...&state=xxx`
   - The `redirect_uri` parameter should contain `.chromiumapp.org`

3. Fill out account creation form
4. Open browser console (F12) and watch for errors
5. After OTP verification, check what happens

**Expected Flow:**
```
Extension → Opens web page with redirect_uri param
User creates account → OTP sent
User enters OTP → Account created
Server generates JWT
Redirects to: chrome-extension://<id>/oauth2#id_token=xxx
Extension captures token → Shows dashboard
```

#### Step 3: Add Extension Console Logging
Add logging to see what the extension receives:

Open extension background console:
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker" (or background page)
3. Look for authentication logs

---

## 🧪 Comprehensive Testing Checklist

### Web App Testing

#### Test 1: Email Login (Should Already Work ✅)
- [ ] Navigate to `https://www.trackmyopt.com/auth/extension?redirect=/dashboard`
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] ✅ Should redirect to dashboard
- [ ] ✅ Should stay logged in on refresh

#### Test 2: Google OAuth Login (NEEDS FIX ❌)
- [ ] Navigate to `https://www.trackmyopt.com/auth/extension?redirect=/dashboard`
- [ ] Click "Continue with Google" button
- [ ] Select Google account
- [ ] Grant permissions
- [ ] **Check Network tab for redirect to `/auth/callback?code=...`**
- [ ] ✅ Should redirect to dashboard (NOT error page)
- [ ] ✅ Should be logged in

#### Test 3: Account Creation (Should Work ✅)
- [ ] Navigate to `https://www.trackmyopt.com/auth/extension?redirect=/dashboard`
- [ ] Click "create account"
- [ ] Fill in: First Name, Last Name, Email, Password
- [ ] Click "Create Account"
- [ ] Check email for OTP code
- [ ] Enter OTP code
- [ ] Click "Verify"
- [ ] ✅ Should redirect to dashboard
- [ ] ✅ Should be logged in

---

### Extension Testing

#### Test 4: Extension Google OAuth (Should Already Work ✅)
- [ ] Open extension (click icon)
- [ ] Click "Sign in or create account"
- [ ] Browser opens: `https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...`
- [ ] Click "Continue with Google"
- [ ] Select Google account
- [ ] Grant permissions
- [ ] **Watch for redirect to `.chromiumapp.org/oauth2#id_token=...`**
- [ ] ✅ Extension should close the tab and open dashboard
- [ ] ✅ Extension popup should show tools

#### Test 5: Extension Email Login (Should Work ✅)
- [ ] Open extension
- [ ] Click "Sign in or create account"
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] ✅ Should redirect back to extension
- [ ] ✅ Extension should show tools

#### Test 6: Extension Account Creation (NEEDS FIX ❌)
- [ ] Open extension
- [ ] Click "Sign in or create account"
- [ ] **Note the URL - should contain `redirect_uri=chrome-extension://...`**
- [ ] Click "create account"
- [ ] Fill in: First Name, Last Name, Email, Password
- [ ] Click "Create Account"
- [ ] Check email for OTP code
- [ ] Enter OTP code
- [ ] Click "Verify"
- [ ] **Check browser console for errors**
- [ ] ✅ Should redirect to extension with token
- [ ] ✅ Extension should show tools

---

## 🐛 Debugging Commands

### Check Deployed Route Exists
```bash
# Should return 3xx redirect (NOT 404)
curl -I https://www.trackmyopt.com/auth/callback

# Should return 200 OK
curl -I https://www.trackmyopt.com/auth/extension
```

### Check Environment Variable in Production
```bash
# If you have Vercel CLI
vercel env pull

# Check the file
cat .env.local | grep NEXT_PUBLIC_SITE_URL
```

### Test OAuth URL Generation
Open browser console on `https://www.trackmyopt.com/auth/extension` and run:
```javascript
console.log(process.env.NEXT_PUBLIC_SITE_URL);
// Should output: https://www.trackmyopt.com

// Or check in the page source
console.log(window.location.origin);
```

---

## 📸 Evidence to Collect

When testing, please collect these screenshots/logs:

### For Web Google OAuth Issue:
1. **Network tab** showing the redirect chain
2. **Console logs** during Google sign-in attempt
3. **Final error URL** if authentication fails
4. **Supabase Redirect URLs** configuration (screenshot)
5. **Google Cloud Console Authorized redirect URIs** (screenshot)
6. **Vercel Environment Variables** showing `NEXT_PUBLIC_SITE_URL` (screenshot)

### For Extension Account Creation Issue:
1. **Extension manifest.json** showing host_permissions
2. **URL of opened authentication page** (should show redirect_uri parameter)
3. **Browser console errors** during account creation
4. **Extension background console** logs during authentication
5. **Network tab** showing API calls and any CORS errors

---

## 🎯 Expected Outcomes After Fixes

### Web Google OAuth:
```
User clicks "Sign in with Google"
→ Google consent screen
→ User grants permission
→ Redirect to: https://www.trackmyopt.com/auth/callback?code=xxx...
→ Server exchanges code for session
→ Redirect to: https://www.trackmyopt.com/dashboard
→ ✅ User logged in successfully
```

### Extension Account Creation:
```
Extension opens: https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...
→ User fills form and enters OTP
→ Account created, server generates JWT
→ Redirect to: chrome-extension://<id>/oauth2#id_token=xxx
→ Extension captures token
→ Extension navigates to dashboard
→ ✅ User logged in successfully
```

---

## 📋 Quick Fix Checklist

**Immediate Actions:**
- [ ] Verify `NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com` in production env
- [ ] Add `https://www.trackmyopt.com/auth/callback` to Supabase Redirect URLs
- [ ] Add `https://www.trackmyopt.com/auth/callback` to Google OAuth Redirect URIs
- [ ] Wait 5-10 minutes after Google Console changes
- [ ] Add production domain to extension manifest host_permissions
- [ ] Rebuild and reload extension

**Testing Actions:**
- [ ] Clear browser cookies for trackmyopt.com
- [ ] Test web Google OAuth in incognito mode
- [ ] Test extension account creation with console logs open
- [ ] Document any errors or unexpected behavior

---

## 🆘 Still Not Working?

If issues persist after following this guide:

1. **Capture the exact error message** from browser console
2. **Document the URL you're redirected to** when OAuth fails
3. **Check Supabase Auth Logs** in the dashboard
4. **Verify the OAuth request parameters** in Network tab
5. **Test with different Google accounts** (some accounts may have restrictions)

---

**This diagnostic guide should help you identify and resolve both OAuth issues systematically.**

_If you need further assistance, please provide the evidence listed above and I can help with more specific debugging._
