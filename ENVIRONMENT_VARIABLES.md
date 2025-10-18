# Environment Variables Setup for Premium Email System

## 📋 Add These to `web/.env.local`

```bash
# =====================================================
# STRIPE CONFIGURATION
# =====================================================

# Test Mode Keys (for development)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Webhook Secret (get after creating webhook)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Product Price ID (create product first)
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PRICE_ID_HERE

# =====================================================
# EMAIL SERVICE (RESEND)
# =====================================================

# Resend API Key
RESEND_API_KEY=re_YOUR_KEY_HERE

# Sender Email (must be verified domain)
EMAIL_FROM=reminders@trackmyopt.com
EMAIL_FROM_NAME=TrackMyOPT Reminders

# =====================================================
# CRON JOB SECURITY
# =====================================================

# Generate with: openssl rand -base64 32
CRON_SECRET=YOUR_SECURE_RANDOM_STRING_HERE
```

---

## 🚀 Setup Instructions

### 1. Stripe Setup

1. **Create Stripe Account:**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign in or create account

2. **Get API Keys:**
   - Go to: **Developers** → **API keys**
   - Copy **Publishable key** → Add to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy **Secret key** → Add to `STRIPE_SECRET_KEY`
   - ⚠️ Start with **test mode** keys

3. **Create Premium Product:**
   - Go to: **Products** → **Add product**
   - Fill in:
     ```
     Name: TrackMyOPT Premium - Lifetime
     Description: Daily email reminders for your OPT deadlines
     Pricing model: One time
     Price: $2.99 USD
     ```
   - Click **Save product**
   - Copy the **Price ID** (starts with `price_...`)
   - Add to `STRIPE_PREMIUM_PRICE_ID`

4. **Set Up Webhook** (after deploying to production):
   - Go to: **Developers** → **Webhooks** → **Add endpoint**
   - Endpoint URL: `https://trackmyopt.com/api/premium/webhook`
   - Listen to events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Click **Add endpoint**
   - Copy **Signing secret** → Add to `STRIPE_WEBHOOK_SECRET`

### 2. Resend Email Service Setup

1. **Create Resend Account:**
   - Go to [https://resend.com](https://resend.com)
   - Sign up (free tier: 100 emails/day)

2. **Verify Your Domain:**
   - Go to: **Domains** → **Add Domain**
   - Enter your domain: `trackmyopt.com`
   - Add these DNS records to your domain registrar:
   
   ```
   Type: TXT
   Name: _resend
   Value: [copy from Resend dashboard]
   
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.com ~all
   
   Type: TXT  
   Name: _dmarc
   Value: v=DMARC1; p=none;
   ```
   
   - Wait for verification (5-30 minutes)

3. **Create API Key:**
   - Go to: **API Keys** → **Create API Key**
   - Name: `TrackMyOPT Production`
   - Permission: **Full access**
   - Copy the key → Add to `RESEND_API_KEY`

4. **Set Sender Email:**
   - Use your verified domain
   - Example: `reminders@trackmyopt.com`
   - Add to `EMAIL_FROM`

### 3. Cron Secret Generation

Generate a secure random string:

```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

Copy the output and add to `CRON_SECRET`

---

## ✅ Verification Checklist

After adding all variables, verify:

### Local Development
- [ ] `npm run dev` starts without errors
- [ ] No "missing environment variable" warnings

### Stripe Test
```bash
# Test checkout flow
open http://localhost:3000/premium/checkout

# Use Stripe test card:
# Card Number: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits
# ZIP: Any 5 digits
```

Expected result: Payment succeeds, user upgraded to premium

### Email Test
Create test file: `web/app/api/test/send-email/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { sendDailyReminder } from '@/lib/email-service';

export async function GET() {
  const testData = {
    userId: 'test-123',
    userEmail: 'YOUR_EMAIL@gmail.com', // Use your email
    firstName: 'Test',
    tools: [{
      name: 'OPT Filing Window',
      daysLeft: 45,
      endDate: 'December 31, 2025',
      urgency: 'moderate' as const,
      message: 'Test message',
    }],
  };
  
  const result = await sendDailyReminder(testData);
  return NextResponse.json(result);
}
```

Then visit: `http://localhost:3000/api/test/send-email`

Expected result: Email received in your inbox

### Cron Job Test
```bash
curl -X GET \
  http://localhost:3000/api/cron/send-daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected result: JSON response with email sending stats

---

## 🔐 Security Best Practices

1. **Never Commit .env.local to Git:**
   ```bash
   # Already in .gitignore, but double-check:
   cat .gitignore | grep .env.local
   ```

2. **Use Different Keys for Each Environment:**
   - Development: Test mode keys
   - Staging: Test mode keys
   - Production: Live mode keys

3. **Rotate Keys Regularly:**
   - Every 90 days minimum
   - Immediately if compromised

4. **Restrict API Key Permissions:**
   - Stripe: Use restricted keys when possible
   - Resend: Use "Sending access" only for production

5. **Monitor for Suspicious Activity:**
   - Check Stripe Dashboard daily
   - Monitor Resend delivery rates
   - Set up alerts for failed payments

---

## 🚀 Production Deployment

### Vercel Deployment

1. **Add Environment Variables:**
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from above
   - Select environment: **Production**

2. **Update URLs:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://trackmyopt.com
   ```

3. **Switch to Live Keys:**
   - Replace `sk_test_...` with `sk_live_...`
   - Replace `pk_test_...` with `pk_live_...`
   - Create live mode product in Stripe
   - Set up production webhook

4. **Deploy:**
   ```bash
   git push origin main
   # Vercel will auto-deploy
   ```

### Post-Deployment Verification

1. **Test Payment Flow:**
   - Use real credit card
   - Try small test payment ($2.99)
   - Verify payment in Stripe Dashboard
   - Verify user upgraded in Supabase

2. **Test Email Delivery:**
   - Sign up as premium user
   - Add email address
   - Wait for daily reminder (9 AM EST)
   - Check inbox and spam folder

3. **Monitor Cron Job:**
   - Check Vercel Logs at 9 AM EST
   - Verify emails sent successfully
   - Check for any errors

---

## 📊 Monitoring Dashboard Links

After setup, bookmark these:

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Resend Dashboard:** https://resend.com/emails
- **Vercel Logs:** https://vercel.com/your-project/logs
- **Supabase Database:** https://app.supabase.com/project/YOUR_PROJECT

---

## 🆘 Troubleshooting

### "Missing STRIPE_SECRET_KEY"
- Check .env.local exists in `web/` directory
- Verify variable name is exactly `STRIPE_SECRET_KEY`
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Invalid API Key (Resend)"
- Verify key copied correctly (starts with `re_`)
- Check key hasn't expired
- Regenerate key in Resend dashboard if needed

### "Webhook signature verification failed"
- Development: Use Stripe CLI for local testing
  ```bash
  stripe listen --forward-to localhost:3000/api/premium/webhook
  ```
- Production: Verify webhook secret matches Stripe Dashboard

### "Email not sending"
- Check domain verification status in Resend
- Verify DNS records are correct
- Check email queue in database for errors
- Review Resend logs for bounces

### "Cron job not running"
- Verify `CRON_SECRET` is set correctly
- Check Vercel cron logs
- Verify `vercel.json` is deployed
- Test endpoint manually with curl

---

## 💡 Tips

1. **Test Mode is Your Friend:**
   - Always test in test mode first
   - Use Stripe test cards
   - Resend test mode doesn't send actual emails

2. **Check Logs Frequently:**
   - Vercel logs show all API calls
   - Stripe dashboard shows webhook delivery
   - Resend dashboard shows email delivery

3. **Start Small:**
   - Test with one user first
   - Monitor for a week
   - Gradually enable for all users

4. **Have Backups:**
   - Export Stripe data regularly
   - Keep database backups
   - Document your setup

---

## 📞 Support

Need help?
- Stripe Support: https://support.stripe.com
- Resend Support: https://resend.com/support
- TrackMyOPT: support@trackmyopt.com

---

**Last Updated:** October 2025

