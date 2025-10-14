# Google OAuth Setup Guide

## Error: "Unsupported provider: missing OAuth secret"

This error means Google OAuth is not fully configured in Supabase. Follow these steps to fix it.

---

## ✅ Complete Setup Steps

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**

### Step 2: Configure OAuth Consent Screen (First Time Only)

If prompted, configure the OAuth consent screen:

1. Choose **External** (unless you have Google Workspace)
2. Fill in required fields:
   - **App name**: OPT Hub
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
3. Click **Save and Continue**
4. **Scopes**: Skip this step (click Save and Continue)
5. **Test users**: Add your email for testing
6. Click **Save and Continue**

### Step 3: Create OAuth Client ID

1. Back in **Credentials**, click **Create Credentials → OAuth 2.0 Client ID**
2. **Application type**: Select **Web application**
3. **Name**: OPT Hub Web
4. **Authorized JavaScript origins**:
   - Add: `https://deknauqkqqzwuvopqott.supabase.co`
   
5. **Authorized redirect URIs**:
   - Add: `https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback`
   
6. Click **Create**

7. **Save the credentials** (you'll see a popup):
   ```
   Client ID: 561201157955-xxxxxxxxxxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **Important**: Copy both! You'll need them in the next step.

### Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `deknauqkqqzwuvopqott`
3. Navigate to **Authentication → Providers**
4. Find **Google** in the list
5. Toggle it **ON** if not already enabled
6. Fill in the credentials from Step 3:
   ```
   Client ID: 561201157955-xxxxxxxxxxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxx
   ```
7. **Authorized redirect URLs** should show:
   ```
   https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback
   ```
8. Click **Save**

---

## 🔧 Additional Configuration for Extension

### Step 5: Add Extension Redirect URI to Google

1. Go back to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR_EXTENSION_ID.chromiumapp.org/oauth2
   ```
   Replace `YOUR_EXTENSION_ID` with your actual extension ID from `chrome://extensions`
   
4. Click **Save**

### Step 6: Verify Supabase Configuration

Go to **Supabase Dashboard → Authentication → URL Configuration**:

1. **Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

2. **Redirect URLs** (additional allowed redirects):
   Add your production URLs here if needed

---

## ✅ Testing the Setup

### Test 1: Web App OAuth Flow

1. Start your web app: `pnpm dev:web`
2. Navigate to: `http://localhost:3000/auth/extension?redirect_uri=test&state=test`
3. Click "Google" tab
4. Click "Continue with Google"
5. You should see Google's OAuth screen (not an error)

**Expected**: Google sign-in page appears  
**If you see error**: Check Steps 1-4 again

### Test 2: Extension OAuth Flow

1. Load extension in Chrome
2. Click extension icon
3. Click "Sign in or create account"
4. It should redirect to your auth page
5. Click "Google" → "Continue with Google"
6. Complete Google auth

**Expected**: Redirects back to extension with token  
**If you see error**: Check Step 5 (extension redirect URI)

---

## 🐛 Troubleshooting

### Error: "Unsupported provider: missing OAuth secret"

**Cause**: Google Client Secret not configured in Supabase  
**Fix**: Follow Step 4 above

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI used doesn't match Google's allowed list  
**Fix**: 
1. Check the error message for the actual redirect URI being used
2. Add that exact URI to Google Cloud Console → Credentials → Authorized redirect URIs

Common URIs you need:
```
✅ https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback
✅ https://YOUR_EXTENSION_ID.chromiumapp.org/oauth2
✅ http://localhost:3000/auth/extension/callback (dev only)
```

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured  
**Fix**: Follow Step 2 above

### Error: "The app is currently being tested"

**Cause**: OAuth consent screen is in testing mode  
**Fix**: 
1. Go to [Google Cloud Console → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Add test users, OR
3. Publish the app (if ready for production)

---

## 📝 Environment Variables

After setup, your `.env.local` should have:

```env
# Google OAuth - Public (can be client-side)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=561201157955-xxxxxxxxxxxxx.apps.googleusercontent.com
```

**Note**: The Client Secret is stored in **Supabase only**, not in your `.env` file.

---

## 🔐 Security Checklist

- [ ] Client Secret stored only in Supabase (never committed to Git)
- [ ] Authorized redirect URIs limited to your domains
- [ ] Extension ID added to allowed redirect URIs
- [ ] OAuth consent screen configured
- [ ] Test users added (for testing phase)

---

## 📚 Reference Links

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## ✅ Quick Checklist

Before testing, verify:

1. **Google Cloud Console**:
   - [ ] OAuth 2.0 Client ID created
   - [ ] Client ID and Secret copied
   - [ ] Supabase callback URL added to redirect URIs
   - [ ] Extension redirect URI added (for extension auth)

2. **Supabase Dashboard**:
   - [ ] Google provider enabled
   - [ ] Client ID configured
   - [ ] Client Secret configured
   - [ ] Settings saved

3. **Testing**:
   - [ ] Web OAuth flow works
   - [ ] Extension OAuth flow works
   - [ ] No "missing OAuth secret" error

---

**Last Updated**: October 2025  
**Support**: Check [Supabase Docs](https://supabase.com/docs/guides/auth/social-login/auth-google) for latest info

