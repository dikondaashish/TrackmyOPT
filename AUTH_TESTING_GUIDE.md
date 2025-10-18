# 🧪 Authentication Testing Guide

## Complete Testing Procedures for All Auth Fixes

---

## ✅ **ISSUE #1: Sign-Out Testing**

### **Setup**
1. Open web app: `http://localhost:3000/dashboard`
2. Make sure you're logged in

### **Test Cases**

#### **Test 1.1: Basic Sign-Out**
1. Click "Sign Out" button in sidebar
2. **Expected:** 
   - Button shows "Signing out..." with spinning icon
   - Redirects to homepage `/`
   - No HTTP 405 error
3. **Verify:**
   - Open DevTools → Network tab
   - Look for POST request to `/auth/signout`
   - Should return 3xx redirect, not 405

#### **Test 1.2: Session Cleared**
1. After sign-out, try to access `/dashboard` directly
2. **Expected:** Redirects to `/auth/extension?redirect=/dashboard`
3. **Verify:** User is not authenticated

#### **Test 1.3: Storage Cleared**
1. Before sign-out, open DevTools → Application tab
2. Check localStorage/sessionStorage (should have data)
3. Click "Sign Out"
4. **Expected:** All localStorage and sessionStorage cleared
5. **Verify:** Refresh Application tab - should be empty

#### **Test 1.4: Double-Click Prevention**
1. Click "Sign Out" rapidly multiple times
2. **Expected:** Button disabled after first click
3. **Verify:** No multiple requests sent

---

## ✅ **ISSUE #2: Manual Login (Web) Testing**

### **Setup**
1. Make sure you're signed out
2. Open: `http://localhost:3000/auth/extension?redirect=/dashboard`
3. Prepare valid login credentials

### **Test Cases**

#### **Test 2.1: Successful Login**
1. Enter valid email and password
2. Click "Sign in"
3. **Expected:**
   - Loading spinner appears
   - Redirects to `/dashboard` (NO LOOP!)
   - Dashboard loads successfully
4. **Verify in DevTools:**
   - Network tab: POST to `/api/auth/session` → 200 OK
   - Application → Cookies: Should have Supabase session cookies
   - No redirect loops (watch Network tab for multiple redirects)

#### **Test 2.2: Session Persistence**
1. After logging in, refresh the page
2. **Expected:** Still logged in, dashboard loads
3. Open new tab to `/dashboard`
4. **Expected:** Dashboard loads (no login required)

####  **Test 2.3: Invalid Credentials**
1. Enter incorrect password
2. Click "Sign in"
3. **Expected:**
   - Error message appears
   - Stays on login page
   - No redirect

#### **Test 2.4: Remember Me**
1. Check "Remember me" checkbox
2. Sign in successfully
3. Sign out
4. Go back to login page
5. **Expected:** Email field pre-filled

---

## ✅ **ISSUE #3: Account Creation Testing**

### **Test Group A: Web Flow (Without Extension)**

#### **Setup**
1. Open in regular browser (no extension installed)
2. Go to: `http://localhost:3000/auth/extension?redirect=/dashboard`
3. Click "Create account" tab

#### **Test 3.1: OTP Flow**
1. Fill in all fields:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test123!@#
   - Confirm Password: Test123!@#
2. Click "Create account"
3. **Expected:**
   - OTP modal appears
   - Email sent confirmation
4. Check email for OTP code
5. Enter OTP code
6. Click "Verify"
7. **Expected:**
   - Success message
   - Redirects to `/dashboard` (NOT chrome-extension://...)
   - Dashboard loads
   - User is logged in
8. **Verify:**
   - URL should be `http://localhost:3000/dashboard`
   - NO chrome-extension URL
   - Check DevTools → Network for redirect flow

#### **Test 3.2: Invalid OTP**
1. Start OTP flow
2. Enter wrong OTP code
3. **Expected:** Error message, can retry

#### **Test 3.3: Resend OTP**
1. Start OTP flow
2. Click "Resend code"
3. **Expected:** New code sent, success message

### **Test Group B: Extension Flow**

#### **Setup**
1. Install Chrome extension
2. Open extension popup
3. Click "Sign in or create account"

#### **Test 3.4: Extension Signup**
1. Fill in all signup fields
2. Complete OTP verification
3. **Expected:**
   - Redirects to extension dashboard
   - Extension URL: `chrome-extension://[id]/oauth2#id_token=...`
   - Extension captures token and redirects to dashboard
4. **Verify:** Extension dashboard loads successfully

---

## 🔄 **Google OAuth Testing**

### **Web Flow**

#### **Test 4.1: Google Sign-In (Web)**
1. Go to `/auth/extension?redirect=/dashboard`
2. Click "Continue with Google"
3. Complete Google authentication
4. **Expected:**
   - Redirects to `/dashboard`
   - User logged in
   - No loops

### **Extension Flow**

#### **Test 4.2: Google Sign-In (Extension)**
1. Open extension popup
2. Click "Sign in or create account"
3. Click "Continue with Google"
4. Complete Google authentication
5. **Expected:**
   - Extension dashboard loads
   - User logged in

---

## 📊 **Comprehensive Flow Tests**

### **End-to-End: Web User Journey**
```
1. Open website → / (homepage)
2. Click "Login" → /auth/extension?redirect=/dashboard
3. Create account (OTP flow)
4. Verify OTP
5. Redirect to /dashboard ✅
6. Use dashboard features
7. Sign out → / (homepage) ✅
8. Sign in again (manual login) ✅
9. Dashboard loads (no loop) ✅
```

### **End-to-End: Extension User Journey**
```
1. Install extension
2. Open extension popup
3. Click "Sign in"
4. Manual login
5. Extension dashboard ✅
6. Close and reopen
7. Still logged in ✅
```

---

## 🐛 **Debug Checklist**

### **If Sign-Out Fails:**
- [ ] Check DevTools → Network for 405 error
- [ ] Check if fetch() call completes
- [ ] Verify redirect happens
- [ ] Check browser console for errors

### **If Login Loops:**
- [ ] Open DevTools → Network tab
- [ ] Watch for repeated calls to `/auth/extension`
- [ ] Check if cookies are set (Application → Cookies)
- [ ] Verify `credentials: 'include'` in fetch
- [ ] Check if 300ms delay is present

### **If Wrong Redirect After Signup:**
- [ ] Check console logs for `isExtensionFlow` value
- [ ] Verify URL doesn't contain chrome-extension
- [ ] Check redirect_uri parameter value
- [ ] Ensure isExtensionFlow detection is working

---

## 📝 **Test Result Template**

```markdown
### Test Date: [DATE]
### Tester: [NAME]

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Basic Sign-Out | ✅/❌ | |
| 1.2 Session Cleared | ✅/❌ | |
| 1.3 Storage Cleared | ✅/❌ | |
| 1.4 Double-Click Prevention | ✅/❌ | |
| 2.1 Successful Login | ✅/❌ | |
| 2.2 Session Persistence | ✅/❌ | |
| 2.3 Invalid Credentials | ✅/❌ | |
| 2.4 Remember Me | ✅/❌ | |
| 3.1 OTP Flow (Web) | ✅/❌ | |
| 3.2 Invalid OTP | ✅/❌ | |
| 3.3 Resend OTP | ✅/❌ | |
| 3.4 Extension Signup | ✅/❌ | |
| 4.1 Google OAuth (Web) | ✅/❌ | |
| 4.2 Google OAuth (Extension) | ✅/❌ | |

### Issues Found:
[List any issues]

### Recommendations:
[Any suggestions]
```

---

## 🚀 **Production Testing**

### **After Deployment**
1. Test on production URL: `https://www.trackmyopt.com`
2. Test with production extension ID
3. Verify all flows work
4. Check analytics for any errors
5. Monitor user feedback

### **Rollback Plan**
If issues found in production:
1. Identify affected users
2. Revert to previous commit
3. Deploy hotfix
4. Notify users if necessary

---

## 💡 **Tips for Testing**

1. **Use Incognito Mode**: Avoid cached data affecting tests
2. **Clear Cookies**: Between tests for clean state
3. **Check Console**: Always keep DevTools open
4. **Test Multiple Browsers**: Chrome, Firefox, Safari, Edge
5. **Test Mobile**: Responsive behavior
6. **Use Different Accounts**: Test various user states
7. **Test Network Conditions**: Slow 3G, offline, etc.

---

**All tests passing = Ready for production! 🎉**

*Last updated: October 18, 2025*

