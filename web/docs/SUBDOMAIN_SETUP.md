# TrackMyOPT Subdomain Setup Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     trackmyopt.com                              │
│                   (Marketing/Landing)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  login.trackmyopt.com                           │
│              (Authentication - Login/Signup)                    │
│                                                                 │
│  • Google OAuth                                                 │
│  • Email/Password Login                                         │
│  • Signup with OTP verification                                 │
│  • Password Reset                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    (Sets cookies on .trackmyopt.com)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               dashboard.trackmyopt.com                          │
│                (Protected Application)                          │
│                                                                 │
│  • Dashboard                                                    │
│  • OPT Tools                                                    │
│  • Document Vault                                               │
│  • Case Status Tracking                                         │
│  • Settings                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Cloudflare DNS Configuration

### Add DNS Records

In your Cloudflare dashboard for `trackmyopt.com`:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | @ | cname.vercel-dns.com | Proxied (Orange) |
| CNAME | www | cname.vercel-dns.com | Proxied (Orange) |
| CNAME | login | cname.vercel-dns.com | Proxied (Orange) |
| CNAME | dashboard | cname.vercel-dns.com | Proxied (Orange) |

### SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**

---

## Step 2: Vercel Domain Configuration

### Add Domains to Your Project

1. Go to your Vercel project → **Settings** → **Domains**
2. Add these domains:
   - `trackmyopt.com` (production)
   - `www.trackmyopt.com` (redirect to apex)
   - `login.trackmyopt.com`
   - `dashboard.trackmyopt.com`

### Domain Configuration

For each domain in Vercel:
- **trackmyopt.com**: Primary domain
- **www.trackmyopt.com**: Redirect to `trackmyopt.com`
- **login.trackmyopt.com**: Same deployment
- **dashboard.trackmyopt.com**: Same deployment

---

## Step 3: Environment Variables

### Add to Vercel Environment Variables

Go to **Settings** → **Environment Variables** and add:

```bash
# Subdomain Configuration
NEXT_PUBLIC_ROOT_DOMAIN=trackmyopt.com
NEXT_PUBLIC_MARKETING_URL=https://trackmyopt.com
NEXT_PUBLIC_LOGIN_URL=https://login.trackmyopt.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.trackmyopt.com
COOKIE_DOMAIN=.trackmyopt.com

# Existing variables (ensure these are set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ... other existing env vars
```

---

## Step 4: Supabase Configuration

### Update OAuth Redirect URIs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://login.trackmyopt.com/auth/callback
   https://dashboard.trackmyopt.com/auth/callback
   http://localhost:3000/auth/callback
   ```

### Update Site URL

Set **Site URL** to:
```
https://login.trackmyopt.com
```

---

## Step 5: Google OAuth Configuration

### Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```
   (This remains the same - Supabase handles the OAuth flow)

---

## Step 6: Testing

### Local Development

Local development still works on `localhost:3000` - the code detects localhost and uses local redirects.

```bash
cd web
npm run dev
```

### Production Testing

1. Deploy to Vercel
2. Test login flow:
   - Visit `https://trackmyopt.com`
   - Click "Sign In" → should go to `https://login.trackmyopt.com/login`
   - Complete login → should redirect to `https://dashboard.trackmyopt.com/dashboard`
3. Test protected routes:
   - Visit `https://dashboard.trackmyopt.com/dashboard` without login
   - Should redirect to `https://login.trackmyopt.com/login`

---

## Troubleshooting

### Cookies Not Shared Across Subdomains

**Symptom**: User gets logged out when switching between subdomains

**Fix**: 
1. Verify `COOKIE_DOMAIN` is set to `.trackmyopt.com` (with leading dot)
2. Check browser dev tools → Application → Cookies
3. Session cookies should have domain `.trackmyopt.com`

### OAuth Callback Fails

**Symptom**: "Callback URL mismatch" error

**Fix**:
1. Verify Supabase redirect URLs include `https://login.trackmyopt.com/auth/callback`
2. Clear browser cache and cookies
3. Try incognito mode

### CORS Errors on API Calls

**Symptom**: API calls from dashboard fail with CORS errors

**Fix**:
1. Check `vercel.json` has correct CORS headers
2. Verify API routes have proper CORS headers

---

## Files Modified

| File | Purpose |
|------|---------|
| `/lib/subdomain-config.ts` | Subdomain URL configuration |
| `/lib/supabase/server.ts` | Root domain cookie handling |
| `/lib/supabaseClient.ts` | Browser client comments |
| `/app/auth/callback/route.ts` | OAuth redirect to dashboard subdomain |
| `/middleware.ts` | Subdomain routing logic |
| `/app/login/page.tsx` | Login redirects |
| `/vercel.json` | CORS headers and rewrites |
| `/.env.local.example` | New environment variables |
| Various email templates | Updated URLs to dashboard subdomain |

---

## Rollback

If you need to rollback to single-domain:

1. Remove subdomain env vars from Vercel
2. Git revert the changes
3. Remove subdomains from Vercel and Cloudflare

```bash
git revert HEAD~1  # or specific commit hash
git push origin main
```
