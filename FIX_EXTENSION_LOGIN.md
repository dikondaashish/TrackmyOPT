# 🔧 Fix Extension Login Issue

## 🚨 Problem

When signing in with Google from the Chrome extension:
- User is redirected to: `https://www.trackmyopt.com/#access_token=...`
- Extension doesn't receive the token
- User not logged in

## 🔍 Root Cause

Supabase redirect URLs are not configured correctly. Google OAuth is redirecting to the homepage instead of the proper callback handler.

---

## ✅ Solution: Update Supabase Configuration

### **Step 1: Go to Supabase Dashboard**

1. Visit: https://supabase.com/dashboard
2. Select your **TrackMyOPT** project
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration** tab

### **Step 2: Update Site URL**

```
Site URL: https://www.trackmyopt.com
```

### **Step 3: Add ALL These Redirect URLs**

Click "Add URL" and add each of these URLs **one by one**:

```
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback
https://www.trackmyopt.com/auth/extension/callback/client
https://www.trackmyopt.com/auth/extension/callback/server
https://www.trackmyopt.com/dashboard
```

**For Local Development (Optional):**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/extension/callback
http://localhost:3000/auth/extension/callback/client
http://localhost:3000/auth/extension/callback/server
http://localhost:3000/dashboard
```

### **Step 4: Click "Save"**

---

## 🧪 Test the Fix

### **1. Reload Extension**
- Go to `chrome://extensions/`
- Find TrackMyOPT
- Click **🔄 Reload** button

### **2. Test Sign In**
- Open the extension
- Click "Sign in or create account"
- Should open: `https://www.trackmyopt.com/auth/extension?redirect_uri=chrome-extension://...`
- Click "Google" sign in button
- Complete Google OAuth

### **3. Expected Result ✅**
- After Google sign in, should redirect to: `/auth/extension/callback/client`
- Callback page processes the tokens
- Redirects back to extension with JWT token
- Extension shows your tools (signed in)

---

## 🔐 Also Update Google OAuth Console

### **Go to Google Cloud Console**

1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID

### **Add Authorized Redirect URIs:**

```
https://www.trackmyopt.com/auth/callback
https://www.trackmyopt.com/auth/extension/callback
https://www.trackmyopt.com/auth/extension/callback/client
```

### **Add Authorized JavaScript origins:**

```
https://www.trackmyopt.com
```

Click **Save**

---

## 📋 Checklist

- [ ] Supabase Site URL set to `https://www.trackmyopt.com`
- [ ] Supabase Redirect URLs added (all 5 URLs)
- [ ] Google OAuth redirect URIs added
- [ ] Extension reloaded in Chrome
- [ ] Test sign in with Google
- [ ] Verify extension receives token and shows tools

---

## 🎯 Why This Happens

**Extension Login Flow:**
```
1. Extension opens: /auth/extension?redirect_uri=chrome-extension://...
2. User clicks Google sign in
3. App redirects to Google OAuth
4. Google OAuth completes
5. Google redirects to: /auth/extension/callback/client ✅
6. Callback page extracts tokens from URL fragment (#access_token=...)
7. Callback sends tokens to server at: /auth/extension/callback/server
8. Server generates JWT for extension
9. Redirects to: chrome-extension://...?token=JWT&state=xxx
10. Extension receives JWT and saves it
11. Extension shows tools (logged in) ✅
```

**Current Problem (Without Proper Redirect URLs):**
```
Step 5 fails: Google redirects to homepage instead of callback ❌
User ends up at: https://www.trackmyopt.com/#access_token=...
Extension never receives the token ❌
```

**After Adding Redirect URLs:**
```
Step 5 works: Google redirects to /auth/extension/callback/client ✅
Flow completes successfully ✅
```

---

## ⚠️ Common Mistakes

1. **Forgetting `/auth/extension/callback/client`**
   - This is the MOST IMPORTANT redirect URL
   - Without it, OAuth redirects to homepage

2. **Not clicking "Save" in Supabase**
   - Changes don't take effect until you click Save

3. **Not reloading the extension**
   - Extension caches old config
   - Must reload after Supabase changes

4. **Typos in URLs**
   - Must be exact: `https://www.trackmyopt.com` (with `www.`)
   - No trailing slashes: `/auth/callback` not `/auth/callback/`

---

## 🆘 If Still Not Working

### **Check Supabase Logs:**
1. Go to Supabase Dashboard → Authentication → Logs
2. Look for failed OAuth attempts
3. Check which redirect URL was used

### **Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors during OAuth redirect

### **Verify Extension ID:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Copy your extension ID
4. Make sure it matches the ID in the redirect_uri parameter

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ After Google sign in, you see the callback page briefly
- ✅ Extension opens automatically
- ✅ Extension shows "TrackMyOPT Your complete toolkit..."
- ✅ All 4 tools are visible
- ✅ No "Sign in required" message

---

**This fix should solve your extension login issue completely!** 🎉

If you still have issues after following these steps, let me know and I'll help debug further.

