# ⚠️ CRITICAL: Add Stripe Keys to .env.local

## ❌ Current Issue:
`STRIPE_SECRET_KEY` is not loaded. The API cannot initialize Stripe.

## ✅ Solution:

### Step 1: Open the correct .env.local file

```bash
# Make sure you edit THIS file:
/Users/ashishdikonda/Desktop/untitled folder 2/TrackMyOPT/web/.env.local
```

### Step 2: Add these lines to web/.env.local

```bash
# Add to the END of the file:

# ==========================================
# STRIPE CONFIGURATION (Premium Payments)
# ==========================================
# Get your keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PRICE_ID

# NOTE: Replace YOUR_KEY_HERE with actual keys from Stripe Dashboard
# The keys start with sk_test_ and pk_test_ for test mode

# ==========================================
# EMAIL SERVICE (Resend)
# ==========================================
RESEND_API_KEY=re_placeholder
EMAIL_FROM=reminders@trackmyopt.com
EMAIL_FROM_NAME=TrackMyOPT Reminders

# ==========================================
# CRON JOB SECURITY
# ==========================================
CRON_SECRET=your_secure_random_string_here
```

### Step 3: Restart the dev server

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
cd web
npm run dev
```

### Step 4: Test again

Visit: http://localhost:3000/premium/checkout

---

## 🔒 SECURITY NOTE:

**NEVER commit .env.local to git!**

The file is already in .gitignore, but double-check:
```bash
cat .gitignore | grep .env
```

Should show: `.env*.local`

---

## ✅ Quick Verification

After restarting, test this URL in your browser:
```
http://localhost:3000/api/premium/status
```

Should return:
```json
{
  "isPremium": false,
  "error": "Not authenticated"
}
```

NOT an error page with HTML.

---

## 📝 What You Need:

**Required NOW (for testing):**
- ✅ STRIPE_SECRET_KEY: Get from Stripe Dashboard → Developers → API keys
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Same place as above

**Can Use Placeholders (for now):**
- ⏸️ STRIPE_WEBHOOK_SECRET: Only needed when deploying to production
- ⏸️ STRIPE_PREMIUM_PRICE_ID: Only needed when actually processing payments
- ⏸️ RESEND_API_KEY: Only needed for email functionality
- ⏸️ CRON_SECRET: Only needed for scheduled emails

For local testing, the checkout page just needs the SECRET_KEY and PUBLISHABLE_KEY.

---

## 🚀 After Adding:

1. Save web/.env.local
2. Stop dev server (Ctrl+C)
3. Restart: `cd web && npm run dev`
4. Wait for "Ready" message
5. Try http://localhost:3000/premium/checkout again

The error should be gone!

