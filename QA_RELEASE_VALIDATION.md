# QA & Release Validation Test Plan

## Overview

This document provides a comprehensive test plan for validating OPT Hub before releasing to production. All tests should pass on both **local development** and **production** environments.

---

## ✅ Local + Prod E2E Testing

### Test 1: Extension Installation & Auth Flow

**Prerequisites:**
- [ ] Web app running (local: `localhost:3000`, prod: your domain)
- [ ] Extension built and loaded in Chrome
- [ ] Extension ID noted

**Steps:**
1. Click extension icon
2. Click "Sign in or create account"
3. Browser opens to `/auth/extension?redirect_uri=...&state=...`

**Expected:**
- [ ] Page loads without errors
- [ ] Both `redirect_uri` and `state` parameters present in URL
- [ ] Page shows "Sign in or Create account" title
- [ ] Two tabs visible: "Google" and "Manual"

---

### Test 2: Google Sign-In Path

**Steps:**
1. On auth page, click "Google" tab
2. Click "Continue with Google" button
3. Complete Google OAuth flow
4. Authorize the app

**Expected:**
- [ ] Google OAuth screen appears
- [ ] After authorization, redirects to `/auth/extension/callback`
- [ ] "Returning to Extension…" page shows briefly (< 2 seconds)
- [ ] Page auto-closes/redirects
- [ ] Extension popup updates automatically
- [ ] Shows "✅ Signed in" status
- [ ] Displays OPT dates (may show `-` if no data yet)

**First-time user:**
- [ ] Dates show as `-` (no OPT data saved)
- [ ] User record created in Supabase `auth.users`
- [ ] Profile row created in `profiles` table with default timezone

---

### Test 3: Manual Sign-Up Path

**Steps:**
1. On auth page, click "Manual" tab
2. Click "Create Account" to expand form
3. Fill in the form:
   ```
   First Name: Test
   Last Name: User
   Email: testuser+qa@example.com
   Password: SecurePass123!
   
   Program End: 05/15/2024
   DSO Recommendation: 04/01/2024
   OPT EAD End: 05/15/2025
   OPT Start: 06/01/2024
   STEM Start: (leave blank)
   ☑️ I'm STEM-eligible
   ```
4. Click "Create Account"

**Expected:**
- [ ] Date auto-formatting works (type `05152024` → `05/15/2024`)
- [ ] Inline validation shows errors for invalid dates
- [ ] Required field validation works (try submitting without Program End)
- [ ] "You can edit these dates later" note visible
- [ ] After submit, redirects to callback
- [ ] "Returning to Extension…" page shows
- [ ] Extension popup updates with saved dates:
  ```
  Program End: 2024-05-15
  DSO Rec: 2024-04-01
  OPT EAD End: 2025-05-15
  OPT Start: 2024-06-01
  STEM Start: -
  ```

**Database verification:**
- [ ] User exists in `auth.users`
- [ ] Row in `profiles` with `user_id`, `timezone: America/New_York`, `is_stem_eligible: true`
- [ ] Row in `opt_status` with all dates in `YYYY-MM-DD` format
- [ ] Dates match what was entered (MM/DD/YYYY → YYYY-MM-DD)

---

### Test 4: Manual Sign-In Path

**Prerequisites:**
- [ ] Existing user account (from Test 3)

**Steps:**
1. Sign out from extension (click 🚪 button)
2. Click extension icon → "Sign in or create account"
3. Click "Manual" tab
4. Click "Sign In" to expand
5. Enter credentials:
   ```
   Email: testuser+qa@example.com
   Password: SecurePass123!
   ```
6. Click "Sign In"

**Expected:**
- [ ] Sign in succeeds
- [ ] Redirects to callback
- [ ] Extension popup shows saved dates
- [ ] Data matches previous session

---

### Test 5: STEM-Eligible Toggle

**Steps:**
1. Create new account with STEM checkbox **unchecked**
2. Verify popup and database
3. Sign out
4. Create another account with STEM checkbox **checked**
5. Verify again

**Expected:**
- [ ] Unchecked: `profiles.is_stem_eligible = false`
- [ ] Checked: `profiles.is_stem_eligible = true`
- [ ] STEM Start Date field visible regardless of checkbox
- [ ] Data saves correctly in both cases

---

### Test 6: Session Expiry Handling

**Steps:**
1. Sign in to extension
2. Open Chrome DevTools on extension popup
3. Run in console:
   ```javascript
   chrome.storage.sync.clear()
   ```
4. Close and reopen popup

**Expected:**
- [ ] Popup shows "Session expired" message
- [ ] "Please sign in again" text visible
- [ ] "Sign in or create account" button appears
- [ ] No crash or infinite loading
- [ ] Can sign in again successfully

---

### Test 7: Token Expiration (10 minutes)

**Steps:**
1. Sign in to extension
2. Note the current time
3. Wait 11 minutes
4. Click "Refresh" button in popup

**Expected:**
- [ ] API call fails with 401/403
- [ ] Popup shows "Session expired" message
- [ ] Storage cleared automatically
- [ ] Sign-in button appears
- [ ] Can authenticate again

---

### Test 8: Multiple Users / Account Switching

**Steps:**
1. Sign in as User A
2. Verify User A's data shows in popup
3. Click logout (🚪 button)
4. Confirm logout
5. Sign in as User B
6. Verify User B's data shows

**Expected:**
- [ ] User A's data displays correctly
- [ ] Logout clears storage
- [ ] User B's data displays correctly (different from User A)
- [ ] No data leakage between users
- [ ] Each user sees only their own OPT dates

---

### Test 9: Bad Redirect URI (Error Handling)

**Steps:**
1. Manually navigate to:
   ```
   http://localhost:3000/auth/extension?redirect_uri=INVALID&state=test123
   ```
2. Try various invalid scenarios:
   - Missing `redirect_uri`
   - Missing `state`
   - Both missing

**Expected:**
- [ ] Page shows "Invalid Login Link" error
- [ ] No crash or blank screen
- [ ] Error message: "This authentication page must be accessed from the OPT Hub extension"
- [ ] Helpful text: "Missing required parameters: redirect_uri or state"
- [ ] No console errors

---

### Test 10: Timezone Handling

**Steps:**
1. In Supabase, manually update a user's profile:
   ```sql
   UPDATE profiles 
   SET timezone = 'America/Los_Angeles' 
   WHERE user_id = 'your-user-id';
   ```
2. Sign in with that user
3. Check dates in popup

**Expected:**
- [ ] Dates remain correct (no timezone conversion issues)
- [ ] Dates stored as `DATE` type in DB (not `TIMESTAMP`)
- [ ] Display format consistent: `YYYY-MM-DD`
- [ ] No time component in dates

---

### Test 11: Refresh Button Functionality

**Steps:**
1. Sign in to extension
2. Manually update dates in Supabase
3. Click 🔄 Refresh button in popup

**Expected:**
- [ ] Shows "Loading..." briefly
- [ ] Fetches fresh data from `/api/me`
- [ ] Updated dates appear in popup
- [ ] No errors

---

### Test 12: Logout Button Functionality

**Steps:**
1. Sign in to extension
2. Click 🚪 logout button
3. Confirm the dialog

**Expected:**
- [ ] Confirmation dialog appears: "Are you sure you want to sign out?"
- [ ] If confirmed: storage cleared, sign-in view appears
- [ ] If cancelled: remains signed in
- [ ] No residual data after logout

---

## 🔒 Data Integrity Checks

### Test 13: Date Format Validation

**Input → Storage → Display:**

| Input Format | Stored Format | Display Format |
|--------------|---------------|----------------|
| `05/15/2024` | `2024-05-15` | `2024-05-15` |
| `12/31/2025` | `2025-12-31` | `2025-12-31` |
| `01/01/2024` | `2024-01-01` | `2024-01-01` |

**Test:**
- [ ] Enter dates in `MM/DD/YYYY` format in web form
- [ ] Verify stored as `YYYY-MM-DD` in Supabase
- [ ] Verify displayed as `YYYY-MM-DD` in popup
- [ ] No date shifts due to timezone issues

**Invalid dates:**
- [ ] `13/01/2024` → Shows error
- [ ] `12/32/2024` → Shows error  
- [ ] `2024-05-15` → Shows error (wrong format)
- [ ] `5/15/2024` → Auto-formats to `05/15/2024`

---

### Test 14: Supabase Tables & RLS

**Check table structure:**
```sql
-- profiles table
SELECT user_id, timezone, is_stem_eligible, created_at 
FROM profiles 
LIMIT 5;

-- opt_status table
SELECT user_id, program_end_date, opt_ead_end_date, 
       opt_start_date, stem_start_date, created_at 
FROM opt_status 
LIMIT 5;

-- employment_spans table (optional, not used yet)
SELECT * FROM employment_spans LIMIT 5;
```

**Expected:**
- [ ] All dates are `DATE` type, not `TIMESTAMP`
- [ ] `user_id` references `auth.users(id)`
- [ ] Created timestamps present
- [ ] RLS enabled on all tables

**RLS verification:**
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'opt_status', 'employment_spans');
```

**Expected:**
- [ ] `rowsecurity = true` for all three tables

---

### Test 15: No PII in Logs

**Steps:**
1. Sign in/up with test account
2. Check browser console logs
3. Check server logs (Vercel function logs)
4. Check Supabase logs

**Expected:**
- [ ] No passwords in logs
- [ ] No JWT tokens in logs
- [ ] Email/user_id may appear (acceptable for debugging)
- [ ] No sensitive personal information
- [ ] Error messages don't expose PII

**Bad log examples:**
```
❌ "User password: SecurePass123"
❌ "JWT token: eyJhbGci..."
❌ "Full auth response: {...}"
```

**Good log examples:**
```
✅ "User authenticated: user_id=abc123"
✅ "Email sent to: user@example.com"
✅ "Token expired for user: user_id=abc123"
```

---

## 🔐 Security Validation

### Test 16: State Parameter Validation

**Steps:**
1. Capture auth URL with state parameter
2. Manually change state value in callback URL
3. Try to complete auth flow

**Expected:**
- [ ] Callback rejects mismatched state
- [ ] Error message shows
- [ ] No token issued
- [ ] No security bypass

**Test scenarios:**
```
# Original
https://...callback?redirect_uri=...&state=abc123#id_token=...&state=abc123
✅ Valid

# Tampered
https://...callback?redirect_uri=...&state=abc123#id_token=...&state=xyz789
❌ Should fail
```

---

### Test 17: JWT Time-to-Live (TTL)

**Steps:**
1. Sign in and capture JWT from storage
2. Decode JWT (use jwt.io)
3. Check `exp` claim
4. Wait for expiration
5. Try to use expired token

**Expected:**
- [ ] JWT `exp` claim shows 10 minutes from issue time
- [ ] API rejects expired tokens (401/403)
- [ ] Extension handles expiration gracefully
- [ ] User can re-authenticate

**JWT structure:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "userId": "user_id",
  "iat": 1234567890,
  "exp": 1234568490,  // iat + 600 seconds (10 min)
  "iss": "trackmyopt-web",
  "aud": "trackmyopt-extension"
}
```

---

### Test 18: Redirect URI Whitelist

**Steps:**
1. Try to use unauthorized redirect URI
2. Check if auth flow accepts it

**Expected:**
- [ ] Only accepts `https://<EXTENSION_ID>.chromiumapp.org/*`
- [ ] Rejects other domains
- [ ] Rejects http:// (must be https://)

**Test cases:**
```
✅ https://abcdefghijklmnop.chromiumapp.org/oauth2
❌ https://evil.com
❌ http://localhost:3000
❌ https://example.com
```

---

### Test 19: CORS & Host Permissions

**Check manifest.json:**
```json
{
  "host_permissions": [
    "http://localhost:3000/*",
    "https://your-domain.com/*"
  ]
}
```

**Expected:**
- [ ] Production manifest only has production domain
- [ ] No `*://*/*` wildcard
- [ ] No unnecessary domains
- [ ] Localhost only in development

**Test:**
- [ ] Extension can call your API
- [ ] Extension cannot call other domains (blocked by browser)

---

### Test 20: Row Level Security (RLS) Bypass Attempt

**Steps:**
1. Sign in as User A, get their JWT token
2. Sign in as User B, note their `user_id`
3. Use User A's token to try to fetch User B's data:
   ```bash
   curl http://localhost:3000/api/me \
     -H "Authorization: Bearer USER_A_TOKEN"
   ```
4. Check response

**Expected:**
- [ ] Returns only User A's data
- [ ] User B's data not accessible
- [ ] RLS policies enforced
- [ ] No data leakage

**Direct DB test:**
```sql
-- Set session to User A
SET request.jwt.claim.sub = 'user-a-id';

-- Try to select User B's data
SELECT * FROM opt_status WHERE user_id = 'user-b-id';
```

**Expected:**
- [ ] Query returns 0 rows (RLS blocks access)

---

### Test 21: Production .env Validation

**Check Vercel environment variables:**

**Expected:**
- [ ] No development keys present
- [ ] No `test` or `dev` in API keys
- [ ] `JWT_SIGNING_SECRET` is strong (32+ chars)
- [ ] `CRON_SECRET` is strong (32+ chars)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is production key
- [ ] `RESEND_API_KEY` is production key
- [ ] `NEXT_PUBLIC_SITE_URL` is production domain (no localhost)

**Bad examples:**
```
❌ JWT_SIGNING_SECRET=test123
❌ NEXT_PUBLIC_SITE_URL=http://localhost:3000
❌ RESEND_API_KEY=re_test_xxxxx
```

**Good examples:**
```
✅ JWT_SIGNING_SECRET=d4e4b723797bc32030d8a1e9fd2beb7ad70ca272...
✅ NEXT_PUBLIC_SITE_URL=https://trackmyopt.com
✅ RESEND_API_KEY=re_iYxDmDxh_NxZDWcV5YE4EzN248gjwz7Vg
```

---

### Test 22: 404/500 Chaos Testing

**Steps:**
1. **Temporarily** modify `/api/me` to throw error:
   ```typescript
   // Add at top of route handler
   throw new Error('Chaos test');
   ```
2. Sign in to extension
3. Observe popup behavior
4. Revert change

**Expected:**
- [ ] Popup shows error message
- [ ] No infinite loading
- [ ] No blank screen
- [ ] "Refresh" button available
- [ ] User can retry after fix

**Test other scenarios:**
- [ ] Network offline: Shows appropriate error
- [ ] API returns 404: Handled gracefully
- [ ] API returns malformed JSON: Handled gracefully

---

## 📊 Performance & Reliability

### Test 23: Extension Load Time

**Steps:**
1. Click extension icon (when signed out)
2. Measure time to show UI
3. Click extension icon (when signed in)
4. Measure time to show data

**Expected:**
- [ ] Signed out: < 200ms (instant)
- [ ] Signed in: < 1000ms (1 second max)
- [ ] No noticeable lag
- [ ] Smooth loading animation

---

### Test 24: API Response Times

**Steps:**
```bash
# Test /api/me
time curl http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test /api/manual/login
time curl http://localhost:3000/api/manual/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Expected:**
- [ ] `/api/me`: < 500ms
- [ ] `/api/manual/login`: < 1000ms
- [ ] `/api/manual/signup`: < 2000ms
- [ ] All under reasonable limits

---

## ✅ Final Pre-Release Checklist

### Code Quality
- [ ] No `console.log` in production code
- [ ] No commented-out code blocks
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied

### Documentation
- [ ] README.md up to date
- [ ] API.md documents all endpoints
- [ ] TESTING_CHECKLIST.md complete
- [ ] CRON_JOBS.md accurate
- [ ] Environment variables documented

### Security
- [ ] All secrets in `.env.local` (not committed)
- [ ] `.gitignore` includes `.env*`
- [ ] Production keys separate from dev keys
- [ ] RLS enabled and tested
- [ ] CORS configured correctly

### Functionality
- [ ] All E2E tests pass (Tests 1-12)
- [ ] All data integrity tests pass (Tests 13-15)
- [ ] All security tests pass (Tests 16-22)
- [ ] Error handling tested (Test 22)
- [ ] Performance acceptable (Tests 23-24)

### Deployment
- [ ] Vercel project configured
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] CRON job visible in Vercel dashboard
- [ ] Database migrations run
- [ ] Resend domain verified

---

## 🐛 Known Issues & Workarounds

### Issue 1: Token Expiry During Form Fill
**Symptom:** User fills long form, token expires before submit  
**Workaround:** Increase JWT TTL to 15-20 minutes  
**Status:** Open

### Issue 2: Chrome Extension Storage Sync Delay
**Symptom:** Data doesn't sync immediately across devices  
**Workaround:** Click refresh button after device switch  
**Status:** Expected behavior (Chrome limitation)

---

## 📝 Test Results Log

| Date | Environment | Tester | Tests Passed | Tests Failed | Notes |
|------|-------------|--------|--------------|--------------|-------|
| 2025-10-14 | Local | - | - | - | Initial template |
| | Production | - | - | - | |

---

**Test Plan Version:** 1.0  
**Last Updated:** October 2025  
**Next Review:** Before each major release

