# Supabase OTP Setup Guide

## ✅ You're All Set!

Your OTP email verification is now using **Supabase's built-in OTP functionality** with your **Hostinger SMTP** (1000 emails/day limit).

## 📧 How It Works

1. User fills in the signup form
2. User clicks "Create Account"
3. **Supabase sends OTP code via your Hostinger SMTP**
4. User receives email with 6-digit code
5. User enters code in the modal
6. Account is created after successful verification

## 🎨 Customize the OTP Email Template (Optional)

You can customize the email template in your Supabase dashboard:

### Steps to Customize:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Email Templates**
3. Find **"Reauthentication"** template (this is used for OTP codes)
4. Click to edit
5. You'll see this default template:

```html
<h2>Confirm reauthentication</h2>
<p>Enter the code: {{ .Token }}</p>
```

### Recommended Custom Template:

Replace with this beautiful template:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">TrackMyOPT</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your OPT Timeline Companion</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Email Verification</h2>
        
        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for signing up! To complete your registration, please enter the verification code below:
        </p>
        
        <!-- OTP Code -->
        <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="color: #666; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
          <p style="color: #667eea; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            {{ .Token }}
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 20px 0 0 0; line-height: 1.5;">
          ⏱️ This code will expire in <strong>60 minutes</strong>.<br>
          🔒 For security reasons, do not share this code with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 13px; margin: 0; line-height: 1.5;">
          If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
          © 2025 TrackMyOPT. All rights reserved.<br>
          <a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">trackmyopt.vercel.app</a>
        </p>
      </div>
    </div>
  </body>
</html>
```

### Email Subject:

Change the subject to:
```
Your TrackMyOPT Verification Code
```

### Save the Template

Click **Save** and your OTP emails will look beautiful! 🎨

## 📊 Email Limits

With your Hostinger SMTP setup:
- ✅ **1000 emails per day**
- ✅ Custom email domain
- ✅ Better deliverability than default Supabase
- ✅ Professional branding

## 🔧 Testing

To test the OTP flow:

1. Fill in the signup form
2. Click "Create Account"
3. **Check your email inbox** (the email you entered)
4. Copy the 6-digit code from the email
5. Enter it in the modal
6. Click "Verify & Create Account"
7. Success! 🎉

## 🐛 Troubleshooting

### Email Not Received?

1. **Check spam folder** - First time emails might go to spam
2. **Verify SMTP settings** in Supabase Dashboard → Settings → Auth → SMTP
3. **Check Hostinger email logs** for delivery status
4. **Test with different email** (Gmail, Outlook, etc.)

### "Invalid verification code" Error?

1. Make sure you copied the code correctly (6 digits)
2. Code might be expired (60 minutes expiry)
3. Click "Resend Code" to get a new one
4. Check that you're using the most recent code

### SMTP Rate Limit Reached?

- Supabase has a built-in rate limit of 30 emails per hour per project (free tier)
- If you hit this, wait an hour or upgrade your Supabase plan
- Your Hostinger limit is 1000/day, so Supabase rate limit will trigger first

## 📝 Next Steps

1. ✅ OTP verification is working
2. ✅ Using Hostinger SMTP (1000 emails/day)
3. ✅ No external dependencies (Resend removed)
4. 🎨 **Optional**: Customize email template (see above)
5. 🚀 Deploy and test in production!

---

**Need help?** Check Supabase logs in Dashboard → Logs → Auth for debugging.

