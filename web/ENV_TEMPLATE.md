# 🔐 Environment Variables Setup

## ⚠️ SECURITY WARNING

**NEVER commit your `.env.local` file to git!**
- It should already be in `.gitignore`
- Contains sensitive API keys and secrets
- Exposing these can compromise your entire application

---

## 📋 Required Environment Variables

### 1. Supabase (Database & Auth)
Get from: https://supabase.com/dashboard/project/_/settings/api

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. JWT Signing Secret
Generate with: `openssl rand -base64 32`

```env
JWT_SIGNING_SECRET=your-32-char-minimum-secret-here
```

### 3. Stripe (Payment Processing)
Get from: https://dashboard.stripe.com/apikeys

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Resend (Email Service)
Get from: https://resend.com/api-keys

```env
RESEND_API_KEY=re_...
```

### 5. Cron Job Secret
Generate with: `openssl rand -base64 32`

```env
CRON_SECRET=your-strong-random-string
```

### 6. 🆕 USCIS Case Status API (Official)
Get from: https://developer.uscis.gov/

```env
# Client Credentials (from developer.uscis.gov)
USCIS_CLIENT_ID=VhnVAmgw9UcQHWTPBWod1w9Vt9n8QVzn
USCIS_CLIENT_SECRET=2vqpRtShbRK4cdNA

# Sandbox URLs (for testing)
USCIS_TOKEN_URL=https://api-int.uscis.gov/oauth/accesstoken
USCIS_API_BASE_URL=https://api-int.uscis.gov/case-status

# Production URLs (use after approval)
# USCIS_TOKEN_URL=https://api.uscis.gov/oauth/accesstoken
# USCIS_API_BASE_URL=https://api.uscis.gov/case-status
```

### 7. Site URL

```env
NEXT_PUBLIC_SITE_URL=https://www.trackmyopt.com
```

### 8. Google OAuth (Optional)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 🔧 Setup Instructions

### For Local Development:

1. Create `web/.env.local` file
2. Copy all variables above
3. Fill in your actual values
4. Save the file

### For Vercel Production:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with its production value
5. Select **Production, Preview, Development** for most variables
6. Click **Save**

---

## 🔒 USCIS API Security Notes

### Sandbox vs Production:

**Sandbox (Current):**
- Testing environment
- Use staging receipt numbers only
- 5 TPS (Transactions Per Second)
- 1,000 requests/day limit
- Example staging numbers: `EAC9999103403`, `SRC9999102777`, etc.

**Production (After Approval):**
- Real USCIS data
- 10 TPS limit
- 400,000 requests/day limit
- Requires 5 days of sandbox testing
- Must pass demo with USCIS team

### Security Best Practices:

✅ **DO:**
- Store credentials in environment variables only
- Use server-side API calls only (never expose in frontend)
- Cache OAuth tokens (they're valid for ~1 hour)
- Implement rate limiting in your code
- Log API usage for monitoring

❌ **DON'T:**
- Commit credentials to git
- Expose credentials in frontend/client code
- Share credentials publicly
- Hard-code credentials in source files
- Exceed rate limits (can get blocked)

---

## 🆕 Document Vault (AWS S3 + AI)

### AWS S3 Storage:
```env
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### OpenAI (Document Analysis):
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Megallm.io (OCR):
```env
MEGALLM_API_KEY=sk-mega-...
```

---

## 📊 Testing USCIS API

### Staging Receipt Numbers for Sandbox:

**With History Data:**
- `EAC9999103403` - Approved case
- `SRC9999102777` - Active case
- `LIN9999106498` - Pending case

**Without History Data:**
- `EAC9999103400`
- `SRC9999132694`
- `LIN9999106501`

### Test with curl:

```bash
# 1. Get OAuth token
curl -X POST "https://api-int.uscis.gov/oauth/accesstoken" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"

# Response: {"access_token": "...", "token_type": "Bearer", "expires_in": 3600}

# 2. Check case status
curl -X GET "https://api-int.uscis.gov/case-status/EAC9999103403" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

---

## 🚀 Next Steps After Setup

1. Add environment variables to Vercel
2. Test with staging receipt numbers
3. Monitor API usage in USCIS developer portal
4. After 5 days of testing, request production access
5. Pass demo with USCIS team
6. Switch to production URLs
7. Go live with real receipt numbers!

---

**Created:** 2025-11-22  
**Last Updated:** 2025-11-22

