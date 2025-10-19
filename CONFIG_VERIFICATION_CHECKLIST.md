# ✅ OAuth Configuration Verification Checklist

**Purpose:** Verify all OAuth configurations are correct across Supabase, Google Cloud Console, Vercel, and Extension

---

## 1️⃣ Vercel Environment Variables

### How to Check:
1. Go to: https://vercel.com/dashboard
2. Select your TrackMyOPT project
3. Settings → Environment Variables

### Required Variables:

| Variable | Expected Value | Status |
|----------|---------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.trackmyopt.com` | ☐ |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://deknauqkqqzwuvopqott.supabase.co` | ☐ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ☐ |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ☐ |
| `JWT_SIGNING_SECRET` | Random secret string | ☐ |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client ID | ☐ |

**CRITICAL:** `NEXT_PUBLIC_SITE_URL` must be:
- Exact: `https://www.trackmyopt.com`
- Include `https://` prefix
- Include `www.` subdomain
- NO trailing slash

**After Changes:**
- ☐ Redeploy the application
- ☐ Wait 2-3 minutes for deployment to complete

---

## 2️⃣ Supabase Authentication Configuration

### How to Check:
1. Go to: https://supabase.com/dashboard
2. Select your TrackMyOPT project
3. Authentication → URL Configuration

### Site URL:
```
https://www.trackmyopt.com
```
- ☐ Verified correct
- ☐ NO trailing slash
- ☐ Includes https://
- ☐ Includes www.

### Redirect URLs (Add ALL of these):

```
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback/client
https://www.trackmyopt.com/auth/extension/callback/server
https://www.trackmyopt.com/dashboard
```

**Checklist:**
- ☐ `https://www.trackmyopt.com/auth/callback` (WEB OAUTH - CRITICAL)
- ☐ `https://www.trackmyopt.com/auth/extension/callback/client` (EXTENSION)
- ☐ `https://www.trackmyopt.com/auth/extension/callback/server` (EXTENSION)
- ☐ `https://www.trackmyopt.com/dashboard` (FINAL DESTINATION)

**Optional (for local development):**
- ☐ `http://localhost:3000/auth/callback`
- ☐ `http://localhost:3000/auth/extension/callback/client`
- ☐ `http://localhost:3000/dashboard`

**After Changes:**
- ☐ Click **Save** button
- ☐ Changes take effect immediately

---

### Supabase OAuth Provider Configuration:

1. Authentication → Providers → Google

**Required Settings:**
- ☐ Google OAuth **Enabled**
- ☐ Client ID configured
- ☐ Client Secret configured
- ☐ Authorized Client IDs (optional) configured if using extension

**Note:** The primary OAuth flow goes through Supabase's callback URL first:
```
https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback
```

This is automatic and handled by Supabase.

---

## 3️⃣ Google Cloud Console OAuth Configuration

### How to Check:
1. Go to: https://console.cloud.google.com/
2. Select your project
3. APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID

### Authorized JavaScript Origins:

**Production:**
- ☐ `https://www.trackmyopt.com`
- ☐ `https://deknauqkqqzwuvopqott.supabase.co` (Supabase)

**Development (optional):**
- ☐ `http://localhost:3000`

### Authorized Redirect URIs:

**CRITICAL - Must include ALL of these:**

**Supabase (PRIMARY - MOST IMPORTANT):**
- ☐ `https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback`

**Web App:**
- ☐ `https://www.trackmyopt.com/auth/callback`
- ☐ `https://www.trackmyopt.com/auth/extension/callback/client`

**Extension:**
- ☐ `https://dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org/oauth2`
  (Replace with your actual extension ID)

**Development (optional):**
- ☐ `http://localhost:3000/auth/callback`
- ☐ `http://localhost:3000/auth/extension/callback/client`

### How to Find Your Extension ID:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Find TrackMyOPT extension
4. Copy the ID (e.g., `dfecepbhicheepchdoffoilldlhaacpn`)
5. Your redirect URI is: `https://<extension-id>.chromiumapp.org/oauth2`

**After Changes:**
- ☐ Click **Save** button
- ⏰ **WAIT 5-10 MINUTES** for changes to propagate globally!

---

## 4️⃣ Extension Configuration

### Manifest.json:

**File:** `extension/manifest.json`

**Permissions:**
- ☐ `"identity"` - Required for OAuth
- ☐ `"storage"` - Required to store tokens
- ☐ `"tabs"` - Required to open/close auth tabs

**Host Permissions (CRITICAL):**
```json
"host_permissions": [
  "http://localhost:3000/*",
  "https://*.vercel.app/*",
  "https://www.trackmyopt.com/*",
  "https://trackmyopt.com/*"
]
```

**Checklist:**
- ☐ Includes `https://www.trackmyopt.com/*` (with www)
- ☐ Includes `https://trackmyopt.com/*` (without www)
- ☐ Both development and production URLs included

**After Changes:**
- ☐ Rebuild extension: `cd extension && npm run build`
- ☐ Go to `chrome://extensions/`
- ☐ Click **Reload** button on TrackMyOPT
- ☐ Verify "Permissions" section shows the production domain

---

### Extension Config File:

**File:** `extension/src/config.ts`

**Should contain:**
```typescript
export const WEBSITE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.trackmyopt.com'
  : 'https://www.trackmyopt.com';
```

**Checklist:**
- ☐ Production URL is `https://www.trackmyopt.com` (with www)
- ☐ Includes https:// prefix
- ☐ No trailing slash

---

## 5️⃣ Application Route Files

### OAuth Callback Route for Web:

**File:** `web/app/auth/callback/route.ts`

**Checklist:**
- ☐ File exists
- ☐ Has `export async function GET` handler
- ☐ Calls `supabase.auth.exchangeCodeForSession(code)`
- ☐ Redirects to dashboard on success

**Test:**
```bash
curl -I https://www.trackmyopt.com/auth/callback
# Should return: HTTP/2 307 or 308 (redirect), NOT 404
```

---

### Extension OAuth Callback Routes:

**File:** `web/app/auth/extension/callback/client/page.tsx`
- ☐ File exists
- ☐ Captures hash tokens from URL
- ☐ Forwards to server route

**File:** `web/app/auth/extension/callback/server/route.ts`
- ☐ File exists
- ☐ Has `export async function GET` handler
- ☐ Generates JWT token
- ☐ Redirects to extension with token

**Test:**
```bash
curl -I https://www.trackmyopt.com/auth/extension/callback/client
# Should return: HTTP/2 200, NOT 404

curl -I https://www.trackmyopt.com/auth/extension/callback/server
# Should return: HTTP/2 400 (missing params), NOT 404
```

---

## 6️⃣ OAuth Flow Verification

### Web App Google OAuth Flow:

**Expected Sequence:**
1. User clicks "Sign in with Google" on `/auth/extension?redirect=/dashboard`
2. Code generates callback URL: `https://www.trackmyopt.com/auth/callback?next=/dashboard`
3. User redirected to Google: `accounts.google.com/o/oauth2/v2/auth?...`
4. User authenticates and grants permissions
5. Google redirects to Supabase: `https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback?code=xxx`
6. Supabase redirects to app: `https://www.trackmyopt.com/auth/callback?code=xxx&next=/dashboard`
7. App exchanges code for session
8. App redirects to: `https://www.trackmyopt.com/dashboard`
9. ✅ User logged in

**Checkpoints:**
- ☐ Step 2: Callback URL uses correct domain from `NEXT_PUBLIC_SITE_URL`
- ☐ Step 6: Supabase redirects to `/auth/callback` (not homepage)
- ☐ Step 7: Code exchange succeeds, session created
- ☐ Step 8: Redirects to dashboard (no loop)

---

### Extension Google OAuth Flow:

**Expected Sequence:**
1. User clicks "Sign in or create account" in extension
2. Extension opens: `https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...&state=xxx`
3. User clicks "Sign in with Google"
4. Code generates callback URL: `https://www.trackmyopt.com/auth/extension/callback/client?redirect_uri=...&state=xxx`
5. User redirected to Google OAuth
6. User authenticates and grants permissions
7. Google redirects to Supabase with code
8. Supabase redirects to app: `https://www.trackmyopt.com/auth/extension/callback/client#access_token=xxx`
9. Client page extracts tokens, forwards to server route
10. Server route generates JWT
11. Server redirects to: `chrome-extension://<id>/oauth2#id_token=xxx`
12. Extension captures token, stores it
13. ✅ Extension shows dashboard

**Checkpoints:**
- ☐ Step 2: URL contains valid `redirect_uri` with `.chromiumapp.org`
- ☐ Step 4: Callback URL includes extension redirect parameters
- ☐ Step 8: Supabase redirects to extension callback route (not homepage)
- ☐ Step 11: Redirects to chrome-extension URL with token
- ☐ Step 13: Extension successfully stores token and shows tools

---

## 7️⃣ Debug Logging Verification

### Web App Logs:

Open browser DevTools Console on `https://www.trackmyopt.com/auth/extension` and look for:

**During Google OAuth:**
```
🌐 Web OAuth flow - Callback URL: https://www.trackmyopt.com/auth/callback?next=/dashboard
```
- ☐ Callback URL uses correct domain
- ☐ No undefined or null values

**On Callback Page:**
```
🔄 OAuth callback for web flow
Code present: true
Next destination: /dashboard
🔐 Exchanging OAuth code for session...
✅ OAuth session established for user: [user-id]
↗️ Redirecting to: https://www.trackmyopt.com/dashboard
```
- ☐ Code is present
- ☐ Code exchange succeeds
- ☐ User ID is logged
- ☐ Redirect URL is correct

---

### Extension Logs:

Open extension background console:
1. Go to `chrome://extensions/`
2. Find TrackMyOPT
3. Click "Inspect views: service worker" or "background page"

**During OAuth:**
```
🔐 Starting OAuth flow
📍 Redirect URI: https://[extension-id].chromiumapp.org/oauth2
🔑 State: [random-string]
📂 Opened auth tab: [tab-id]
```

**When receiving token:**
```
🔄 Tab updated: [tab-id] Status: complete
✅ Detected redirect URI!
🎫 Token received: [token-preview]...
🔐 State match: true
💾 Token stored successfully!
✅ Authentication complete!
🌐 Navigating tab to dashboard: https://www.trackmyopt.com/dashboard
```

- ☐ OAuth flow starts correctly
- ☐ Token is received
- ☐ State matches (CSRF protection)
- ☐ Token is stored
- ☐ Dashboard navigation works

---

## 8️⃣ Network Tab Verification

### Web Google OAuth - Network Tab:

Open DevTools → Network tab, then initiate Google sign-in.

**Look for this request chain:**

1. `GET /auth/extension` → 200 (auth page loads)
2. `GET accounts.google.com/o/oauth2/v2/auth` → 302 (OAuth request)
3. `GET accounts.google.com/...` → 200 (Google consent page)
4. `POST accounts.google.com/...` → 302 (User grants permission)
5. `GET deknauqkqqzwuvopqott.supabase.co/auth/v1/callback?code=xxx` → 302 (Supabase)
6. **`GET www.trackmyopt.com/auth/callback?code=xxx&next=/dashboard` → 307** ← CRITICAL!
7. `GET www.trackmyopt.com/dashboard` → 200 (Dashboard loads)

**Checklist:**
- ☐ Step 6 exists (not skipped)
- ☐ Step 6 URL is `/auth/callback` (not homepage or other)
- ☐ Step 6 includes `code` parameter
- ☐ Step 7 redirects to dashboard successfully

**If Step 6 is wrong:**
- Check Supabase Redirect URLs configuration
- Verify `NEXT_PUBLIC_SITE_URL` in Vercel
- Clear cookies and try again

---

## 9️⃣ Common Configuration Mistakes

### ❌ Mistake 1: Missing www in URLs
**Wrong:**
```
NEXT_PUBLIC_SITE_URL=https://trackmyopt.com
```
**Correct:**
```
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
```

---

### ❌ Mistake 2: Trailing Slash
**Wrong:**
```
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com/
Redirect URL: https://www.trackmyopt.com/auth/callback/
```
**Correct:**
```
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
Redirect URL: https://www.trackmyopt.com/auth/callback
```

---

### ❌ Mistake 3: Wrong Protocol
**Wrong:**
```
NEXT_PUBLIC_SITE_URL=http://www.trackmyopt.com
```
**Correct:**
```
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
```

---

### ❌ Mistake 4: Missing Redirect URL in Supabase
**Symptom:** OAuth redirects to homepage instead of callback

**Fix:** Add `https://www.trackmyopt.com/auth/callback` to Supabase Redirect URLs

---

### ❌ Mistake 5: Missing Redirect URI in Google Console
**Symptom:** Google shows error "redirect_uri_mismatch"

**Fix:** Add all required redirect URIs to Google Cloud Console and wait 5-10 minutes

---

### ❌ Mistake 6: Extension Missing Host Permissions
**Symptom:** Extension account creation fails with CORS error

**Fix:** Add `https://www.trackmyopt.com/*` to manifest.json host_permissions

---

## 🎯 Final Verification

### All Systems Check:

- ☐ Vercel env variables verified
- ☐ Supabase redirect URLs verified (including `/auth/callback`)
- ☐ Google OAuth redirect URIs verified (including `/auth/callback`)
- ☐ Extension manifest has production host permissions
- ☐ Extension rebuilt and reloaded
- ☐ Waited 5-10 minutes after Google Console changes
- ☐ Cleared browser cookies for trackmyopt.com
- ☐ Web Google OAuth tested - redirects to dashboard ✅
- ☐ Extension account creation tested - completes successfully ✅

---

## 📞 Support Information

If all configurations are verified correct but issues persist:

1. **Capture evidence:**
   - Screenshots of all configurations
   - Network tab during failed OAuth
   - Console logs with errors
   - Exact error messages

2. **Check deployment:**
   - Verify latest code is deployed
   - Check Vercel deployment logs
   - Verify routes exist in production

3. **Test in isolation:**
   - Try different Google accounts
   - Try incognito/private mode
   - Try different browsers
   - Test on different networks

---

**Configuration verification complete when all checkboxes are marked ✅**
