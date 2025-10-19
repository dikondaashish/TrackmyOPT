# 🚀 Quick Fix Steps - OAuth Issues

**Last Updated:** October 19, 2025

---

## 🎯 Two Issues to Fix

1. **Web App Google OAuth** - Redirect failing, malformed URL
2. **Extension Account Creation** - Not completing properly

---

## ⚡ Quick Fixes (Do These First)

### Fix 1: Extension Manifest (DONE ✅)

**File Changed:** `extension/manifest.json`

**What was added:**
```json
"host_permissions": [
  "http://localhost:3000/*", 
  "https://*.vercel.app/*",
  "https://www.trackmyopt.com/*",  // ← NEW
  "https://trackmyopt.com/*"        // ← NEW
]
```

**Why:** Extension needs permission to call APIs on production domain.

**Next Steps:**
1. Rebuild the extension: `cd extension && npm run build`
2. Go to `chrome://extensions/`
3. Click **Reload** button on TrackMyOPT extension
4. Test account creation from extension

---

### Fix 2: Verify Production Environment Variable

**Check in Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select your TrackMyOPT project
3. Click **Settings** → **Environment Variables**
4. Look for: `NEXT_PUBLIC_SITE_URL`

**Should be:**
```
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
```

**If missing or wrong:**
1. Add/edit the variable
2. Redeploy the application
3. Wait 2-3 minutes for deployment

---

### Fix 3: Verify Supabase Redirect URLs

**Go to Supabase Dashboard:**

1. Visit: https://supabase.com/dashboard
2. Select your TrackMyOPT project
3. Click **Authentication** → **URL Configuration**

**Site URL should be:**
```
https://www.trackmyopt.com
```

**Redirect URLs should include ALL of these:**
```
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback/client
https://www.trackmyopt.com/auth/extension/callback/server
https://www.trackmyopt.com/dashboard
```

**Missing any?** Click "Add URL" for each missing one, then click **Save**.

---

### Fix 4: Verify Google OAuth Configuration

**Go to Google Cloud Console:**

1. Visit: https://console.cloud.google.com/
2. Go to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID

**Authorized JavaScript origins:**
```
https://www.trackmyopt.com
```

**Authorized redirect URIs (must include ALL):**
```
https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback/client
```

**If any are missing:**
1. Add them
2. Click **Save**
3. ⏰ **WAIT 5-10 MINUTES** for changes to propagate!

---

## 🧪 Testing Protocol

### Test 1: Web Google OAuth

**Clear cookies first:**
1. Open DevTools (F12)
2. Application → Cookies → Delete all for trackmyopt.com

**Test:**
1. Go to: https://www.trackmyopt.com/auth/extension?redirect=/dashboard
2. Click "Continue with Google"
3. Select Google account
4. Grant permissions

**Expected:**
- Briefly see: `https://www.trackmyopt.com/auth/callback?code=...`
- Then redirected to: `https://www.trackmyopt.com/dashboard`
- You should be logged in

**If it fails:**
- Open Network tab and take screenshot
- Check Console for errors
- Note the exact URL you're redirected to

---

### Test 2: Extension Account Creation

**Test:**
1. Open extension (click icon in browser)
2. Click "Sign in or create account"
3. Browser opens authentication page
4. Click "create account"
5. Fill in all fields
6. Click "Create Account"
7. Check email for OTP
8. Enter OTP code
9. Click "Verify"

**Expected:**
- Brief redirect with token in URL
- Tab closes automatically
- Extension shows dashboard with tools

**If it fails:**
- Open browser console (F12) and take screenshot
- Check extension background console for errors
- Note any error messages

---

## 🔍 Quick Debug Commands

### Check if OAuth callback route exists:
```bash
curl -I https://www.trackmyopt.com/auth/callback
# Should return: HTTP/2 307 (redirect), NOT 404
```

### Check extension callback route:
```bash
curl -I https://www.trackmyopt.com/auth/extension/callback/client
# Should return: HTTP/2 200, NOT 404
```

### Verify environment in browser:
1. Go to: https://www.trackmyopt.com
2. Open Console (F12)
3. Type: `window.location.origin`
4. Should show: `https://www.trackmyopt.com`

---

## 📋 Completion Checklist

**Configuration:**
- [ ] Extension manifest updated with production host permissions
- [ ] Extension rebuilt and reloaded in Chrome
- [ ] `NEXT_PUBLIC_SITE_URL` verified in Vercel (should be `https://www.trackmyopt.com`)
- [ ] Supabase redirect URLs include `/auth/callback`
- [ ] Google OAuth redirect URIs include `/auth/callback`
- [ ] Waited 5-10 minutes after Google Console changes

**Testing:**
- [ ] Web email login works (sanity check)
- [ ] Web Google OAuth works (redirects to dashboard)
- [ ] Extension Google OAuth works (sanity check - should already work)
- [ ] Extension account creation works (completes and logs in)

---

## 🎯 Success Indicators

### Web Google OAuth is Fixed When:
- ✅ After Google sign-in, you see `/auth/callback?code=...` in URL bar
- ✅ You're redirected to dashboard within 2 seconds
- ✅ Dashboard loads and shows your data
- ✅ Refreshing page keeps you logged in
- ✅ No infinite redirect loops

### Extension Account Creation is Fixed When:
- ✅ After OTP verification, browser tab shows token briefly
- ✅ Tab closes automatically or redirects to extension
- ✅ Extension popup shows "TrackMyOPT Your complete toolkit..."
- ✅ All 4 tools are visible in extension
- ✅ No "Sign in required" message

---

## 🆘 If Still Broken

### For Web OAuth Issues:

**Collect this information:**
1. Screenshot of Network tab during Google sign-in
2. Screenshot of Console errors
3. The exact URL you're redirected to (if not dashboard)
4. Screenshot of Supabase Redirect URLs config
5. Screenshot of Google OAuth redirect URIs config

### For Extension Account Creation Issues:

**Collect this information:**
1. Extension ID from `chrome://extensions/`
2. URL that opens when clicking "Sign in or create account"
3. Browser console errors during account creation
4. Extension background console logs (click "Inspect views: service worker")
5. Any error messages shown to user

---

## 💡 Common Issues

### Issue: "Still redirecting to wrong URL after Google sign-in"
**Solution:**
- Clear browser cache and cookies completely
- Try in incognito/private mode
- Wait 10 minutes after changing Google Console settings

### Issue: "Extension can't create account - CORS error"
**Solution:**
- Verify manifest.json has production host permissions
- Rebuild extension: `cd extension && npm run build`
- Reload extension in Chrome
- Check that API endpoint allows extension origin

### Issue: "Environment variable not taking effect"
**Solution:**
- Redeploy the app after adding env variable
- Force rebuild (not just redeploy)
- Check preview/production deployment (not development)

---

**Follow these steps in order and test after each fix.** 🎯

Good luck! Let me know which fix resolves each issue or if you need further debugging.
