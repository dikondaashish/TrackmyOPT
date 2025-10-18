# 🔧 Environment Variables Setup

## ⚠️ Critical: NEXT_PUBLIC_SITE_URL

This variable MUST be set correctly for OAuth to work!

### Local Development (.env.local)

Already updated ✅:
```bash
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
```

### Production (Vercel)

**⚠️ YOU MUST ADD THIS TO VERCEL NOW:**

1. Go to: https://vercel.com/dashboard
2. Select your **TrackMyOPT** project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://www.trackmyopt.com
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
5. **Click "Save"**
6. **Redeploy** your app

---

## 📋 All Required Environment Variables

### For Vercel Production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://deknauqkqqzwuvopqott.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]

# Site URL (CRITICAL FOR OAUTH!)
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com

# JWT Secret
JWT_SECRET=[your jwt secret]

# Stripe
STRIPE_SECRET_KEY=[your stripe secret key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your stripe publishable key]
STRIPE_PREMIUM_PRICE_ID=[your product price id]
STRIPE_WEBHOOK_SECRET=[your webhook secret]

# Email (Resend)
RESEND_API_KEY=[your resend api key]
RESEND_FROM_EMAIL=hello@trackmyopt.com

# Cron Secret
CRON_SECRET=[your cron secret]
```

---

## 🎯 Why NEXT_PUBLIC_SITE_URL is Critical

### The Problem:

When you sign in with Google, the code does:
```typescript
const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/extension/callback/client`;
```

If `NEXT_PUBLIC_SITE_URL` is wrong:
- ❌ Redirects to: `http://localhost:3000/auth/extension/callback/client`
- ❌ Doesn't match Supabase redirect URLs
- ❌ Google sends you to homepage instead
- ❌ Login fails

If `NEXT_PUBLIC_SITE_URL` is correct:
- ✅ Redirects to: `https://www.trackmyopt.com/auth/extension/callback/client`
- ✅ Matches Supabase redirect URLs
- ✅ OAuth flow completes properly
- ✅ Login succeeds

---

## 🚀 After Adding to Vercel:

### 1. Redeploy

Trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

Or click "Redeploy" in Vercel dashboard.

### 2. Test OAuth Flow

1. **Extension:** Click "Sign in or create account" → Google → Should work ✅
2. **Website:** Go to `/auth/extension` → Google → Should work ✅

---

## ✅ Checklist

- [x] Local `.env.local` has correct `NEXT_PUBLIC_SITE_URL`
- [ ] **Vercel has `NEXT_PUBLIC_SITE_URL` set** ⭐ DO THIS NOW
- [x] Supabase redirect URLs configured
- [ ] Test OAuth after Vercel redeploy

---

## 🆘 Still Not Working?

1. **Check Vercel env vars:**
   - Go to Vercel Settings → Environment Variables
   - Verify `NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com`

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for the `redirectTo` value in network requests
   - Should show `https://www.trackmyopt.com/auth/extension/callback/client`

3. **Check Supabase logs:**
   - Supabase Dashboard → Authentication → Logs
   - Look for redirect URL mismatches

---

**Add NEXT_PUBLIC_SITE_URL to Vercel NOW, then redeploy!** 🚀

