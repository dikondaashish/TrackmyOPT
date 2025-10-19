# 🐛 Debug Authentication Issues - Step by Step

**Date:** October 19, 2025  
**Status:** Debug Mode Enabled - Full Console Logging Active

---

## 🎯 What I Changed

I've added **extensive console logging** to every authentication flow so we can see EXACTLY what's happening and where it's failing.

### Files Modified with Debug Logging:

1. ✅ `web/app/auth/extension/page.tsx` - Main auth page
2. ✅ `web/app/auth/completing/page.tsx` - Intermediate redirect page
3. ✅ `web/app/auth/callback/route.ts` - OAuth callback handler

---

## 🚀 Deploy & Test Now

### Step 1: Deploy Changes (REQUIRED!)

```bash
cd /Users/ashishdikonda/Desktop/untitled\ folder\ 2/TrackMyOPT

# Commit changes
git add web/app/auth/extension/page.tsx
git add web/app/auth/completing/page.tsx
git add web/app/auth/callback/route.ts
git add extension/src/background.ts

git commit -m "debug: Add comprehensive logging to all auth flows"
git push origin main
```

**WAIT** for Vercel deployment to complete (~2-3 minutes).

Check: https://vercel.com/dashboard - wait for "Ready" status.

---

### Step 2: Rebuild Extension (REQUIRED!)

```bash
cd extension
npm run build
```

Then:
1. Open `chrome://extensions/`
2. Find "TrackMyOPT"
3. Click **🔄 Reload**

---

## 🧪 Testing Protocol with Console Logs

### Test #1: Extension Manual Login

**Steps:**
1. Open Chrome DevTools (F12) in browser
2. Go to Console tab
3. Open Chrome extension
4. Click "Sign in or create account"
5. Browser opens auth page - **WATCH CONSOLE**
6. Enter email and password
7. Click "Sign In" - **WATCH CONSOLE**

**Expected Console Logs (IN ORDER):**

```
🚀 AUTH PAGE LOADED
Full URL: https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...&state=xxx
📋 URL Parameters:
  - redirect_uri: chrome-extension://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2
  - state: abc123...
  - redirect: /dashboard
  - error: none
Flow Detection:
  - isExtensionFlow: true
  - isWebFlow: false

[User clicks Sign In]

🔐 Manual Sign In Started
Is Extension Flow: true
Is Web Flow: false
Redirect URI: chrome-extension://...
State: abc123...
Redirect: /dashboard
📱 Processing EXTENSION manual login flow
✅ Extension login successful, redirecting to completing page
Completing URL: https://www.trackmyopt.com/auth/completing?token=...&state=...&redirect_uri=...

[Page redirects to completing page]

🚀 COMPLETING PAGE LOADED
Full URL: https://www.trackmyopt.com/auth/completing?token=...
📋 URL Parameters:
  - Token: eyJhbGciOiJIUzI1NiIs...
  - State: abc123...
  - Redirect URI: chrome-extension://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2
  - Web Redirect: /dashboard
✅ All extension parameters present
📱 Extension flow detected
🔗 Extension URL: chrome-extension://...#id_token=...&state=...
🌐 Extension will navigate to dashboard after capturing token
⏳ Redirecting in 100ms...
🎯 NOW REDIRECTING TO EXTENSION URL

[Opens extension background console - chrome://extensions/ → Inspect views: service worker]

🔄 Tab updated: [tab-id] Status: complete
✅ Detected redirect URI!
🎫 Token received: eyJhbGciOiJIUzI1NiIs...
🔐 State match: true
💾 Token stored successfully!
✅ Authentication complete!
🌐 Navigating tab to dashboard: https://www.trackmyopt.com/dashboard

[Browser tab navigates to dashboard]
```

**✅ SUCCESS CRITERIA:**
- isExtensionFlow = true
- Redirects to completing page
- Completing page redirects to extension URL
- Extension captures token
- Browser navigates to dashboard

**❌ IF IT FAILS, look for:**
- isExtensionFlow = false (wrong flow detected)
- Missing redirect_uri or state parameters
- Token not received
- Extension not detecting redirect URI
- Dashboard URL wrong

---

### Test #2: Extension Account Creation

**Steps:**
1. Open Chrome DevTools (F12) in browser
2. Go to Console tab
3. Open Chrome extension
4. Click "Sign in or create account"
5. Click "create account"
6. Fill in all fields
7. Click "Create Account"
8. Enter OTP from email
9. Click "Verify & Create Account" - **WATCH CONSOLE**

**Expected Console Logs (IN ORDER):**

```
🚀 AUTH PAGE LOADED
Full URL: https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...&state=xxx
📋 URL Parameters:
  - redirect_uri: chrome-extension://...
  - state: abc123...
  - redirect: /dashboard
Flow Detection:
  - isExtensionFlow: true
  - isWebFlow: false

[User enters OTP and clicks Verify]

🔐 OTP Verification Started
Is Extension Flow: true
Is Web Flow: false
Email: user@example.com
✅ OTP verified successfully, token received
📱 Processing EXTENSION account creation flow
✅ Account created successfully, redirecting to completing page
Completing URL: https://www.trackmyopt.com/auth/completing?token=...&state=...&redirect_uri=...

[Same completing page flow as Test #1]

🚀 COMPLETING PAGE LOADED
✅ All extension parameters present
📱 Extension flow detected
🎯 NOW REDIRECTING TO EXTENSION URL

[Extension captures token and navigates to dashboard]
```

**✅ SUCCESS CRITERIA:**
- OTP verification succeeds
- Redirects to completing page
- Extension receives token
- Navigates to dashboard

---

### Test #3: Web Manual Login

**Steps:**
1. Open browser (NOT from extension)
2. Go to: `https://www.trackmyopt.com/`
3. Click "Get Started"
4. Open DevTools Console (F12)
5. Enter email and password
6. Click "Sign In" - **WATCH CONSOLE**

**Expected Console Logs:**

```
🚀 AUTH PAGE LOADED
Full URL: https://www.trackmyopt.com/auth/extension?redirect=/dashboard
📋 URL Parameters:
  - redirect_uri: MISSING
  - state: MISSING
  - redirect: /dashboard
  - error: none
Flow Detection:
  - isExtensionFlow: false  ← NOT extension flow
  - isWebFlow: true         ← Web flow

[User clicks Sign In]

🔐 Manual Sign In Started
Is Extension Flow: false
Is Web Flow: true
Redirect: /dashboard
🌐 Processing WEB manual login flow
✅ Web login session established successfully
User ID: abc-123-...
🎯 REDIRECTING TO: /dashboard
Using window.location.replace()

[Browser navigates to /dashboard]
```

**✅ SUCCESS CRITERIA:**
- isWebFlow = true
- Session established successfully
- window.location.replace() called
- Browser navigates to /dashboard

**❌ IF IT FAILS:**
- Check if isExtensionFlow is wrongly true
- Check if session API returns error
- Check if redirect variable is correct

---

### Test #4: Web Account Creation

**Steps:**
1. Open browser (NOT from extension)
2. Go to: `https://www.trackmyopt.com/`
3. Click "Get Started"
4. Click "create account"
5. Fill in all fields
6. Click "Create Account"
7. Enter OTP
8. Click "Verify & Create Account" - **WATCH CONSOLE**

**Expected Console Logs:**

```
🚀 AUTH PAGE LOADED
Flow Detection:
  - isExtensionFlow: false
  - isWebFlow: true

[After OTP verification]

🔐 OTP Verification Started
Is Extension Flow: false
Is Web Flow: true
✅ OTP verified successfully, token received
🌐 Processing WEB account creation flow
✅ Web account creation session established successfully
User ID: abc-123-...
🎯 REDIRECTING TO: /dashboard
Using window.location.replace()

[Browser navigates to /dashboard]
```

---

### Test #5: Web Google OAuth

**Steps:**
1. Open browser
2. Go to: `https://www.trackmyopt.com/`
3. Click "Get Started"
4. Click "Sign in with Google"
5. Select Google account
6. **WATCH Vercel logs** (or browser console for redirect)

**Expected Logs (Server-side in Vercel):**

```
🚀 OAUTH CALLBACK ROUTE HIT
Full URL: https://www.trackmyopt.com/auth/callback?code=...&next=/dashboard
📋 Callback Parameters:
  - code: 4/0AQlEd8y1YxZ...
  - next: /dashboard
  - error: none
🔐 Exchanging OAuth code for session...
✅ OAuth session established for user: abc-123-...
📧 User email: user@example.com
↗️ Redirecting to: https://www.trackmyopt.com/dashboard
```

**✅ SUCCESS CRITERIA:**
- OAuth callback receives code
- Code exchange succeeds
- Redirects to /dashboard
- NO `no_code` error

---

## 🔍 What to Look For

### If Extension Flows Fail:

**Check 1: Flow Detection**
```
Look for: isExtensionFlow: true
If false: redirect_uri or state parameters are missing/wrong
```

**Check 2: Token Reception**
```
Look for: "✅ Extension login successful"
If missing: API call failed, check network tab
```

**Check 3: Completing Page**
```
Look for: "🚀 COMPLETING PAGE LOADED"
If missing: Redirect to completing page failed
```

**Check 4: Extension Capture**
```
Look in extension background console for:
"✅ Detected redirect URI!"
If missing: Extension not detecting the redirect
```

**Check 5: Dashboard Navigation**
```
Look for: "🌐 Navigating tab to dashboard:"
URL should be: https://www.trackmyopt.com/dashboard (with www)
```

---

### If Web Flows Fail:

**Check 1: Flow Detection**
```
Look for: isWebFlow: true
If false: redirect parameter might be missing
```

**Check 2: Session Establishment**
```
Look for: "✅ Web login session established successfully"
If missing: Session API call failed
```

**Check 3: Redirect Execution**
```
Look for: "🎯 REDIRECTING TO: /dashboard"
Then: "Using window.location.replace()"
If logs appear but redirect doesn't happen: Browser issue or error after redirect
```

---

### If OAuth Fails:

**Check 1: Callback Route Hit**
```
Look in Vercel logs for: "🚀 OAUTH CALLBACK ROUTE HIT"
If missing: Google is not redirecting to /auth/callback
Check Google Console redirect URI configuration
```

**Check 2: Code Present**
```
Look for: "code: 4/0AQlEd8y..."
If "code: MISSING": Google OAuth flow failed
Check error and error_description parameters
```

**Check 3: Code Exchange**
```
Look for: "✅ OAuth session established for user:"
If missing: Code exchange failed
Check Supabase configuration
```

---

## 📊 Diagnostic Flowchart

### Extension Login Stuck on Auth Page?

```
1. Check console logs on auth page
   ↓
2. Is isExtensionFlow = true?
   NO → redirect_uri/state missing → Extension not passing params correctly
   YES → Continue
   ↓
3. Do you see "✅ Extension login successful"?
   NO → API call failed → Check Network tab, check credentials
   YES → Continue
   ↓
4. Do you see "🚀 COMPLETING PAGE LOADED"?
   NO → Redirect failed → JavaScript error? Check console errors
   YES → Continue
   ↓
5. Do you see extension parameters in completing page logs?
   NO → Parameters lost → Check URL in address bar
   YES → Continue
   ↓
6. Do you see "🎯 NOW REDIRECTING TO EXTENSION URL"?
   NO → Redirect logic not executing → Check for JavaScript errors
   YES → Continue
   ↓
7. Check extension background console - token captured?
   NO → Extension not detecting redirect → Check redirect URI format
   YES → Continue
   ↓
8. Does extension navigate to dashboard?
   NO → Check dashboard URL in logs (should have www)
   YES → ✅ WORKING!
```

---

### Web Login Stuck on Auth Page?

```
1. Check console logs on auth page
   ↓
2. Is isWebFlow = true?
   NO → redirect parameter missing → Check URL
   YES → Continue
   ↓
3. Do you see "🌐 Processing WEB manual login flow"?
   NO → Flow not detected → Check isWebFlow calculation
   YES → Continue
   ↓
4. Do you see "✅ Web login session established successfully"?
   NO → Session API failed → Check Network tab /api/auth/session
   YES → Continue
   ↓
5. Do you see "🎯 REDIRECTING TO: /dashboard"?
   NO → Code not reaching redirect → JavaScript error?
   YES → Continue
   ↓
6. Does browser actually redirect?
   NO → window.location.replace() blocked? → Check browser console for errors
   YES → ✅ WORKING!
```

---

## 🎯 Next Steps

### Step 1: Deploy and Test (NOW)

Run the deployment commands above, then test **ONE** flow at a time with console open.

### Step 2: Report Results

For EACH failing test, provide:
1. **Screenshot of browser console** showing all logs
2. **Screenshot of extension background console** (for extension tests)
3. **The exact step where it fails** (based on expected logs above)
4. **Any error messages** shown to user or in console

### Step 3: I'll Fix Based on Logs

With the detailed logs, I can see:
- Exactly which flow is being triggered
- Where the code is failing
- What parameters are present/missing
- If redirects are executing or being blocked

---

## 💡 Common Issues to Check

### Issue: isExtensionFlow is false when it should be true

**Cause:** Extension not passing redirect_uri or state parameters

**Fix:** Check how extension opens the auth page in `extension/src/background.ts`

---

### Issue: Completing page logs show parameters but doesn't redirect

**Cause:** JavaScript error preventing redirect

**Fix:** Check browser console for errors during redirect

---

### Issue: Extension doesn't detect redirect URI

**Cause:** URL format mismatch

**Fix:** Check extension background logs for exact URL being checked

---

### Issue: Dashboard URL is wrong (no www)

**Already Fixed:** Extension now uses `https://www.trackmyopt.com/dashboard`

---

## ✅ Success Indicators

When everything works:
- ✅ Logs flow from auth page → completing page → extension → dashboard
- ✅ No errors in console
- ✅ All expected log messages appear
- ✅ Browser/extension navigates to dashboard automatically

---

**Deploy now and test with console logs open. Share the exact console output where it fails!** 🐛🔍
