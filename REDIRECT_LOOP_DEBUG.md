# 🔄 Redirect Loop - Debugging Guide

## Problem:
Login succeeds → Tries to redirect to dashboard → Dashboard can't find session → Redirects back to login → LOOP!

## What I Just Fixed:

1. ✅ **Added 500ms delay** after login to let session cookies set
2. ✅ **Added detailed logging** to dashboard to see what's happening
3. ✅ **Added cookie logging** to see if cookies are being read

---

## 🧪 Test Again (After Vercel Deploys)

### Step 1: Open TWO Console Windows

**Browser Console (Client-side):**
1. Press `F12`
2. Go to Console tab
3. Clear console
4. Keep open

**Vercel Logs (Server-side):**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. Click latest deployment
5. Click "Functions" → "Logs"
6. Keep open

### Step 2: Try Login

1. Go to `/login`
2. Enter email/password
3. Click "Sign in"

### Step 3: Check BOTH Consoles

**Browser Console Should Show:**
```
🔐 Sign in attempt started
📧 Signing in with email: your@email.com
✅ Sign in successful!
⏳ Waiting for session to sync...
↗️ Redirecting to dashboard...
```

**Vercel Logs Should Show:**
```
🔍 Dashboard: Checking authentication...
🍪 Cookie get: sb-access-token = exists (or missing)
🍪 Cookie get: sb-refresh-token = exists (or missing)
👤 Dashboard: User check result: { hasUser: true/false, ... }
```

---

## 🔍 What to Look For:

### **If cookies are MISSING:**
```
🍪 Cookie get: sb-access-token = missing
👤 Dashboard: User check result: { hasUser: false }
❌ Dashboard: No user found, redirecting to login
```
**Problem:** Cookies not being set/sent

### **If cookies EXIST but user is false:**
```
🍪 Cookie get: sb-access-token = exists
👤 Dashboard: User check result: { hasUser: false, error: "..." }
```
**Problem:** Session validation failing

### **If everything works:**
```
🍪 Cookie get: sb-access-token = exists
🍪 Cookie get: sb-refresh-token = exists
👤 Dashboard: User check result: { hasUser: true, email: "..." }
✅ Dashboard: User authenticated, rendering dashboard
```
**Success!** ✅

---

## 📸 Send Me Both Logs

After testing, send me:
1. **Browser console** - screenshot or copy/paste
2. **Vercel logs** - screenshot or copy/paste

This will show me exactly where it's failing!

---

## 🔧 Possible Fixes (Based on Logs):

### If cookies are missing:
- Supabase URL configuration issue
- CORS issue
- Cookie domain mismatch

### If cookies exist but session invalid:
- Supabase project mismatch
- Session expired immediately
- Token format issue

---

**Test after Vercel deploys and send me BOTH console logs!**
