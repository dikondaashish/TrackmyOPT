# ✅ Stripe Webhook Configured

## Local Development ✅
- Webhook secret added to `web/.env.local`
- Endpoint: `https://www.trackmyopt.com/api/premium/webhook`
- API Version: `2025-09-30.clover`
- Listening to: 3 events

## 🚀 Add to Vercel (Production)

### **Step 1: Go to Vercel Dashboard**
1. Visit: https://vercel.com/dashboard
2. Select your **TrackMyOPT** project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add Webhook Secret**
```
Name: STRIPE_WEBHOOK_SECRET
Value: [Your webhook secret - check .env.local]
Environments: Production, Preview, Development (select all)
```

### **Step 3: Redeploy**
```bash
git commit --allow-empty -m "Trigger redeploy for webhook secret"
git push origin main
```

Or click "Redeploy" in Vercel dashboard.

---

## 🧪 Test Webhook

### **Local Testing (with Stripe CLI)**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/premium/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### **Production Testing**
1. Make a test payment at: https://www.trackmyopt.com/premium/checkout
2. Use Stripe test card: `4242 4242 4242 4242`
3. Check Stripe Dashboard → Webhooks → Your endpoint
4. Verify webhook delivered successfully
5. Check your database - user should be upgraded to premium

---

## 📊 Webhook Events

Your endpoint is listening to:
- ✅ `checkout.session.completed` - Upgrade user to premium
- ✅ `payment_intent.succeeded` - Log successful payment
- ✅ `payment_intent.payment_failed` - Log failed payment

---

## 🔐 Security Notes

✅ Webhook secret is stored securely in .env.local
✅ NOT committed to git (.env.local is in .gitignore)
✅ Signature verification enabled in webhook handler
✅ All webhook requests are verified before processing

---

## ✅ Status

- [x] Webhook endpoint created in Stripe
- [x] Webhook secret added to local .env.local
- [ ] Webhook secret added to Vercel (DO THIS NOW)
- [ ] Test payment completed
- [ ] Webhook delivery verified

---

## 📝 Next Steps

1. **Add to Vercel environment variables** (see Step 2 above)
2. **Redeploy** to apply changes
3. **Test** with a payment
4. **Verify** webhook delivery in Stripe Dashboard

---

**After completing these steps, your premium payment system will be fully operational!** 🎉

