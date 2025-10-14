# OTP Development Guide

## Getting OTP Codes During Development

Since email sending requires a Resend API key and verified domain, during development you can get the OTP code directly from the server console/terminal.

### How It Works

When you click "Create Account" on the signup form:

1. The server generates a 6-digit OTP code
2. The code is **logged to the terminal/console** where your Next.js dev server is running
3. The OTP modal appears on the frontend
4. You can copy the code from the console and paste it into the modal

### Where to Find the OTP Code

Look for this output in your **terminal where you ran `pnpm dev:web`**:

```
============================================================
📧 OTP VERIFICATION CODE (DEVELOPMENT MODE)
============================================================
Email: user@example.com
Code: 123456
Expires: 10/14/2025, 3:30:00 PM
============================================================
```

### Step-by-Step Instructions

1. Fill in the signup form:
   - First Name
   - Last Name
   - Email
   - Password
   - Confirm Password

2. Click **"Create Account"**

3. A modal will appear asking for the verification code

4. **Go to your terminal** where the Next.js server is running

5. Look for the OTP code in the console output (see format above)

6. **Copy the 6-digit code** (e.g., `123456`)

7. **Paste it into the modal** input field

8. Click **"Verify & Create Account"**

9. Your account will be created and you'll be signed in!

### For Production (Email Sending)

To actually send emails via Resend, you need to:

#### Option 1: Use Resend Test Domain (Easiest)

The code is already configured to use `onboarding@resend.dev` which is Resend's test domain. You just need:

1. Sign up for a free Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add it to your `.env.local`:
   ```
   RESEND_API_KEY_ONBOARDING=re_xxxxxxxxxxxxx
   ```

#### Option 2: Use Your Own Domain

1. Sign up for Resend
2. Verify your own domain
3. Update the `from` address in `web/app/api/auth/send-otp/route.ts`:
   ```typescript
   from: 'TrackMyOPT <noreply@yourdomain.com>',
   ```
4. Add your API key to `.env.local`

### Troubleshooting

**Q: I don't see the OTP code in the console**
- Make sure you're looking at the correct terminal (where `pnpm dev:web` is running)
- Check for any errors in the console
- The code appears BEFORE the modal opens

**Q: The code says "expired"**
- OTP codes expire after 10 minutes
- Click "Resend Code" to get a new one
- Check the terminal for the new code

**Q: Email is actually being sent but I'm not receiving it**
- Check your spam folder
- Make sure the email address is correct
- Verify your Resend API key is set correctly
- Check Resend dashboard for delivery logs

**Q: How do I test with actual emails?**
1. Get a Resend API key (free tier: 100 emails/day)
2. Add to `.env.local`: `RESEND_API_KEY_ONBOARDING=re_xxxxx`
3. The system will send real emails to the address provided
4. Resend's test domain (`onboarding@resend.dev`) works without verification

### Rate Limits (Resend Free Tier)

- **100 emails per day**
- **No credit card required**
- Perfect for development and testing

### Supabase Rate Limits

The Supabase rate limits you mentioned are for:
- Auth emails (password reset, magic links): 30/hour
- SMS: Not used in this project
- Token refreshes: 30 per 5 minutes per IP
- Anonymous sign-ins: 30/hour per IP
- Regular sign-ups/sign-ins: 30 per 5 minutes per IP

**Important**: We're using **Resend** for OTP emails, NOT Supabase, so Supabase's email rate limits don't apply to our OTP verification!

### Quick Setup Checklist

- [ ] Terminal with `pnpm dev:web` is running and visible
- [ ] Fill signup form completely
- [ ] Click "Create Account"
- [ ] Check terminal for OTP code
- [ ] Copy 6-digit code
- [ ] Paste into modal
- [ ] Click "Verify & Create Account"
- [ ] Success! 🎉

---

Need help? The OTP code will ALWAYS be logged to the console in development mode, even if email sending fails!

