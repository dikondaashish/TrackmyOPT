# 🔗 Stripe Webhook Setup Guide

## ⚠️ Current Issue

**What Happened:**
- ✅ Payment succeeded in Stripe
- ✅ User redirected to success page
- ❌ User not upgraded to premium in database
- ❌ Extension still shows "Upgrade to Premium"

**Why:**
The Stripe webhook isn't set up yet. Webhooks tell your app when payments succeed.

---

## 🚀 Quick Fix (Do This Now)

### Step 1: Manually Upgrade User

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the SQL from `MANUAL_PREMIUM_UPGRADE.sql`
3. Click **Run**
4. Should show: `premium_status = TRUE`

### Step 2: Refresh Extension

1. Close the Chrome extension
2. Reopen it
3. Premium features should now show! ✅

---

## 🔧 Proper Webhook Setup (For Future Payments)

### For Local Development (Testing)

#### Option 1: Stripe CLI (Recommended)

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   cd /Users/ashishdikonda/Desktop/untitled\ folder\ 2/TrackMyOPT/web
   stripe listen --forward-to localhost:3000/api/premium/webhook
   ```

4. **Copy the webhook secret:**
   ```
   You'll see: whsec_xxxxxxxxxxxxx
   ```

5. **Add to .env.local:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

6. **Restart dev server:**
   ```bash
   npm run dev
   ```

7. **Test a payment:**
   - Webhooks will now fire locally
   - User will be upgraded automatically
   - Check terminal for webhook logs

---

### For Production (Vercel/Live Site)

#### Step 1: Deploy Your App

Make sure your app is deployed to production (Vercel, etc.)

#### Step 2: Add Webhook Endpoint in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL:**
   ```
   https://trackmyopt.com/api/premium/webhook
   ```
   (Replace with your actual domain)

4. **Select events to listen to:**
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

5. **Click "Add endpoint"**

6. **Copy the Signing Secret:**
   ```
   whsec_xxxxxxxxxxxxx
   ```

7. **Add to Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxxxxxxxxxx`

8. **Redeploy your app:**
   ```bash
   git push origin main
   ```
   (Vercel will auto-deploy)

#### Step 3: Test Production Webhook

1. Make a test payment on production
2. Go to Stripe Dashboard → Webhooks → Your endpoint
3. Check "Events" tab - should show events being sent
4. Check your app - user should be upgraded to premium

---

## 🧪 Testing Webhooks

### Test Locally with Stripe CLI

```bash
# In one terminal, run:
stripe listen --forward-to localhost:3000/api/premium/webhook

# In another terminal, trigger test events:
stripe trigger checkout.session.completed
```

### Check Webhook Logs

**Terminal:**
```
✅ User {user_id} upgraded to premium
✅ Transaction recorded for payment: {payment_intent}
```

**Stripe Dashboard:**
- Go to: Developers → Webhooks → Your endpoint
- Check "Events" tab for delivery status

---

## 📊 Webhook Flow

```
1. User clicks "Upgrade to Premium"
   ↓
2. Stripe Checkout opens
   ↓
3. User completes payment
   ↓
4. Stripe sends webhook to your app
   ↓
5. Your app receives webhook at /api/premium/webhook
   ↓
6. Webhook handler:
   - Verifies signature
   - Updates user.premium_status = TRUE
   - Records transaction
   ↓
7. User redirected to success page
   ↓
8. Extension refreshes and shows premium features ✅
```

---

## ⚠️ Troubleshooting

### Webhook Not Firing

**Check:**
1. ✅ Webhook URL is correct
2. ✅ Webhook secret is in .env.local
3. ✅ Server is running
4. ✅ Events are selected in Stripe Dashboard

**Test:**
```bash
curl -X POST http://localhost:3000/api/premium/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

Should return: `{"received": true}`

### User Still Not Premium After Payment

1. **Check Stripe Dashboard:**
   - Webhooks → Your endpoint → Events
   - Is webhook being delivered?
   - Any errors?

2. **Check Terminal Logs:**
   - Look for: "✅ User upgraded to premium"
   - Or errors

3. **Check Database:**
   ```sql
   SELECT premium_status, premium_purchased_at 
   FROM profiles 
   WHERE email = 'your@email.com';
   ```

4. **Manual Fix:**
   - Run MANUAL_PREMIUM_UPGRADE.sql
   - Or use helper function:
     ```sql
     SELECT upgrade_user_to_premium(
       'user-id-here',
       'pi_xxx',
       'cus_xxx'
     );
     ```

### Webhook Signature Verification Fails

**Error:** "Invalid signature"

**Fix:**
1. Make sure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Restart dev server after changing .env.local
3. For local testing, use Stripe CLI's webhook secret

---

## 🔐 Security Notes

1. **Always verify webhook signatures:**
   - Already implemented in `/api/premium/webhook`
   - Never skip signature verification

2. **Use HTTPS in production:**
   - Webhooks only work over HTTPS
   - Vercel provides HTTPS automatically

3. **Protect webhook endpoint:**
   - Don't expose webhook secret
   - Log all webhook attempts
   - Monitor for suspicious activity

---

## 📝 Quick Reference

**Local Development:**
```bash
# Terminal 1
cd web && npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/premium/webhook

# Update .env.local with webhook secret from Terminal 2
# Restart Terminal 1
```

**Production:**
```
1. Add webhook endpoint in Stripe Dashboard
2. Add STRIPE_WEBHOOK_SECRET to Vercel env vars
3. Redeploy app
4. Test with real payment
```

**Manual Upgrade:**
```sql
UPDATE profiles 
SET premium_status = TRUE 
WHERE email = 'user@email.com';
```

---

## ✅ Current Status

For now:
- ✅ Payment system works
- ✅ Stripe checkout working
- ⏸️ Webhooks need setup (manual upgrade works)
- ✅ All code is in place

Next:
1. Run MANUAL_PREMIUM_UPGRADE.sql to upgrade yourself
2. Set up webhooks for future payments (optional for now)
3. Test premium features in extension

---

**Questions? Check Stripe webhook docs:**
https://stripe.com/docs/webhooks

