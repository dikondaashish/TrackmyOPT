# Premium UI Verification Guide

## ✅ CORS Fix Complete

All API endpoints now have proper CORS headers:
- `/api/premium/status`
- `/api/opt/calculator`
- `/api/me`

## 🧪 Chrome Extension Testing Steps

### Step 1: Open Chrome Extension
1. Click the TrackMyOPT extension icon
2. Ensure you're signed in with Google

### Step 2: Navigate to Countdown Page
Choose any of these paths:
- **OPT Apply Dates** → Enter dates → Calculate → View countdown
- **STEM Apply Dates** → Enter dates → Calculate → View countdown  
- **OPT Clock Tracker** → Enter start date → Save & Go → View countdown
- **STEM Clock Tracker** → Enter start date → Save & Go → View countdown

### Step 3: Check Premium Section
Look at the bottom of the countdown page for the premium section.

## 📱 Expected Results

### ✅ PREMIUM USER (Paid $2.99)
Should see:
```
📧 Daily Reminders (9:00 AM ET)
We'll show a Chrome notification every morning. If you enter an email and connect the mailer, we'll also email you.

✅ Email Reminders
✅ Smart Urgency  
✅ All Tools

[Manage Email Preferences]
```

### 🔒 FREE USER (Not Paid)
Should see:
```
🔒 Unlock Daily Email Reminders
Get daily email notifications for just $2.99 (lifetime access)

[Upgrade to Premium - $2.99]
```

## 🐛 Debugging Steps

If you still see the upgrade button when you should be premium:

### 1. Check Browser Console
1. Right-click extension icon → "Inspect popup"
2. Go to Console tab
3. Look for error messages:
   - ❌ "Error checking premium status"
   - ❌ "CORS policy" errors
   - ❌ "Failed to fetch" errors

### 2. Check Database Status
1. Go to Supabase Dashboard
2. Navigate to Table Editor → profiles table
3. Find your user record
4. Check these columns:
   - `premium_status` → Should be `true`
   - `premium_purchased_at` → Should have a date
   - `stripe_customer_id` → Should have a customer ID

### 3. Check JWT Token
1. In extension console, run:
   ```javascript
   chrome.storage.sync.get('idToken', (result) => {
     console.log('JWT Token:', result.idToken ? 'Present' : 'Missing');
   });
   ```

## 🎯 Success Criteria

- ✅ No CORS errors in console
- ✅ Premium users see unlocked features
- ✅ Free users see upgrade button
- ✅ All API calls work without errors

## 📞 Support

If issues persist:
1. Check Supabase database for correct premium status
2. Verify Stripe payment was successful
3. Check webhook logs in Stripe dashboard
4. Contact support with console error messages
