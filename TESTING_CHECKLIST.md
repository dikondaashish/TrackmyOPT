# 🧪 Complete Testing Checklist

Use this checklist to verify the entire OPT Hub authentication and data flow works correctly.

## Prerequisites

- [ ] Supabase project configured
- [ ] Google OAuth enabled in Supabase
- [ ] Database tables created (`profiles`, `opt_status`, `employment_spans`)
- [ ] Environment variables set in `web/.env.local`
- [ ] Email confirmations disabled in Supabase (for development)

## Step 1️⃣: Start Web App

```bash
pnpm dev:web
```

**Verify:**
- [ ] Server starts at http://localhost:3000
- [ ] No console errors
- [ ] Home page loads with hero section

## Step 2️⃣: Build Extension

```bash
pnpm dev:ext
```

**Verify:**
- [ ] Build completes successfully
- [ ] Files created in `extension/dist/`:
  - [ ] `manifest.json`
  - [ ] `background.js`
  - [ ] `popup.js`
  - [ ] `popup.html`
  - [ ] `icons/` directory

## Step 3️⃣: Load Extension

1. Open Chrome: `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `extension/dist` directory

**Verify:**
- [ ] Extension loads without errors
- [ ] Extension icon appears in toolbar
- [ ] Copy Extension ID for reference

**Extension ID:** `_______________________________`

## Step 4️⃣: Test Google OAuth Flow

1. Click extension icon
2. Click **"Sign in or create account"**
3. Browser opens to `/auth/extension?redirect_uri=...&state=...`

**Verify:**
- [ ] Page loads correctly
- [ ] No missing parameters error
- [ ] "Sign in or Create account" title visible

4. Click **"Google"** tab
5. Click **"Continue with Google"**
6. Sign in with Google account
7. Authorize the app

**Verify:**
- [ ] Google OAuth screen appears
- [ ] Authorization completes
- [ ] Redirects to `/auth/extension/callback`
- [ ] "Returning to Extension…" page shows briefly
- [ ] Popup refreshes automatically
- [ ] Shows signed-in status

**Expected Popup (First Time):**
```
OPT Hub
✅ Signed in

Program End: -
DSO Rec: -
OPT EAD End: -
OPT Start: -
STEM Start: -
```

## Step 5️⃣: Test Manual Sign Up Flow

1. Click extension icon → **"Sign in or create account"**
2. Click **"Manual"** tab
3. Click **"Create Account"** to expand

**Fill Form:**
```
First Name: Test
Last Name: User
Email: testuser@example.com
Password: SecurePass123!

Program End: 05/15/2024
DSO Recommendation: 04/01/2024
OPT EAD End: 05/15/2025
OPT Start: 06/01/2024
STEM Start: (leave blank or fill)
☑️ I'm STEM-eligible
```

4. Click **"Create Account"**

**Verify:**
- [ ] Form validation works (try invalid dates)
- [ ] Auto-formatting works (type `05152024` → `05/15/2024`)
- [ ] Inline errors show for invalid formats
- [ ] "You can edit these dates later" note visible
- [ ] Submit succeeds
- [ ] Redirects to callback
- [ ] Popup shows saved dates

**Expected Popup (After Signup):**
```
OPT Hub
✅ Signed in

Program End: 2024-05-15
DSO Rec: 2024-04-01
OPT EAD End: 2025-05-15
OPT Start: 2024-06-01
STEM Start: -
```

## Step 6️⃣: Test Manual Sign In Flow

1. Click extension icon → **"Sign in or create account"**
2. Click **"Manual"** tab
3. Click **"Sign In"** to expand

**Fill Form:**
```
Email: testuser@example.com
Password: SecurePass123!
```

4. Click **"Sign In"**

**Verify:**
- [ ] Form validation works
- [ ] Sign in succeeds
- [ ] Redirects to callback
- [ ] Popup shows saved dates

## Step 7️⃣: Verify Data in Supabase

Open Supabase Dashboard → **Table Editor**

### Check `profiles` table:
- [ ] Row exists for your user
- [ ] `user_id` matches your auth user ID
- [ ] `timezone` = `America/New_York`
- [ ] `is_stem_eligible` matches your selection

### Check `opt_status` table:
- [ ] Row exists for your user
- [ ] `user_id` matches
- [ ] All dates in `YYYY-MM-DD` format
- [ ] Required fields populated:
  - [ ] `program_end_date`
  - [ ] `opt_ead_end_date`
  - [ ] `opt_start_date`

**If dates show as `-` in popup:**
1. Check if row exists in `opt_status`
2. Verify `user_id` matches
3. Check date format is correct
4. Try signing in again

## Step 8️⃣: Test `/api/me` Endpoint

### Get JWT Token from Extension Storage

1. Right-click extension icon → **Inspect**
2. Go to **Console** tab
3. Run:
```javascript
chrome.storage.sync.get(['idToken'], (result) => {
  console.log('Token:', result.idToken);
});
```
4. Copy the token

### Test API Endpoint

```bash
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "profile": {
    "timezone": "America/New_York",
    "is_stem_eligible": true
  },
  "status": {
    "program_end_date": "2024-05-15",
    "dso_recommendation_date": "2024-04-01",
    "opt_ead_end_date": "2025-05-15",
    "opt_start_date": "2024-06-01",
    "stem_start_date": null
  }
}
```

**Verify:**
- [ ] API returns 200 status
- [ ] JSON payload contains `profile` and `status`
- [ ] Dates match what you entered
- [ ] No authentication errors

**If API fails:**
- [ ] Check token isn't expired (10 min lifetime)
- [ ] Verify `JWT_SIGNING_SECRET` in `.env.local`
- [ ] Check browser console for errors
- [ ] Try signing in again to get fresh token

## Step 9️⃣: Test Refresh Button

1. Click extension icon
2. Click **🔄 Refresh** button

**Verify:**
- [ ] Loading state shows briefly
- [ ] Data refreshes
- [ ] No errors
- [ ] Dates remain correct

## Step 🔟: Test Error States

### Test Expired Token

1. Wait 11 minutes (token expires after 10 min)
2. Click extension icon
3. Click **Refresh**

**Verify:**
- [ ] Error message shows
- [ ] "Refresh" button available
- [ ] Can sign in again

### Test Network Error

1. Stop the web server (`Ctrl+C` on `pnpm dev:web`)
2. Click extension icon
3. Try to refresh

**Verify:**
- [ ] Error message shows
- [ ] Helpful error text
- [ ] Can retry when server restarts

## Step 1️⃣1️⃣: Test Callback Auto-Close

1. Sign out from extension
2. Sign in again
3. Watch the `/auth/extension/callback` page

**Verify:**
- [ ] Page shows "Returning to Extension…"
- [ ] Page closes automatically (within 1 second)
- [ ] Popup updates with data
- [ ] No manual intervention needed

## Step 1️⃣2️⃣: Cross-Device Sync (Optional)

If you have Chrome sync enabled:

1. Sign in on Computer A
2. Open Chrome on Computer B (same account)
3. Install extension on Computer B
4. Click extension icon

**Verify:**
- [ ] Extension syncs automatically via `chrome.storage.sync`
- [ ] Already signed in on Computer B
- [ ] Data appears without re-authentication

## ✅ Final Verification

- [ ] All authentication methods work (Google, Manual Sign Up, Manual Sign In)
- [ ] Dates save correctly to Supabase
- [ ] Dates display correctly in popup
- [ ] API endpoint returns correct data
- [ ] Callback page auto-closes
- [ ] Refresh button works
- [ ] Error states handle gracefully
- [ ] Input validation works (date formats, required fields)
- [ ] No console errors in browser or terminal
- [ ] Extension loads without warnings

## 🐛 Common Issues & Solutions

### Issue: Dates show as `-` in popup
**Solution:**
- Check Supabase `opt_status` table
- Verify dates are in `YYYY-MM-DD` format
- Ensure `user_id` matches auth user
- Try creating account again

### Issue: "Invalid token" error
**Solution:**
- Token expires after 10 minutes
- Sign in again to get fresh token
- Check `JWT_SIGNING_SECRET` is set correctly

### Issue: Google OAuth fails
**Solution:**
- Verify Google provider enabled in Supabase
- Check redirect URL is whitelisted: `http://localhost:3000/auth/extension/callback`
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly

### Issue: Extension won't load
**Solution:**
- Check all files exist in `dist/`
- Verify `manifest.json` is valid
- Look for errors in `chrome://extensions`
- Rebuild with `pnpm build:ext`

### Issue: Callback page doesn't redirect
**Solution:**
- Check browser console for JavaScript errors
- Verify `redirect_uri` and `state` params in URL
- Check extension ID matches in storage

## 📝 Notes

- **Development Mode:** Email confirmations are disabled for faster testing
- **Production:** Re-enable email confirmations in Supabase
- **Token Lifetime:** JWTs expire after 10 minutes for security
- **Storage:** Uses `chrome.storage.sync` for cross-device sync
- **CSRF Protection:** State parameter verified on callback

---

**Testing Completed:** `_____ / _____ / _____`  
**Tester:** `_______________________________`  
**Issues Found:** `_______________________________`

