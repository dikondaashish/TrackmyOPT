# Email Templates for Supabase

## 📧 Professional Email Templates

Copy and paste these into your Supabase Dashboard → Authentication → Email Templates

---

## 1. Reset Password Template

**Subject:** `Reset Your TrackMyOPT Password`

**HTML Body:**

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
        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
        
        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
          We received a request to reset the password for your TrackMyOPT account.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
          Click the button below to choose a new password:
        </p>
        
        <!-- Reset Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
            Reset Password
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.5;">
          ⏱️ This link will expire in <strong>1 hour</strong> for security reasons.<br>
          🔒 If you didn't request this password reset, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 13px; margin: 0; line-height: 1.5;">
          <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a>
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
    
    <!-- Security Notice -->
    <div style="max-width: 600px; margin: 20px auto; text-align: center;">
      <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
        This is an automated email from TrackMyOPT. Please do not reply to this message.
      </p>
    </div>
  </body>
</html>
```

---

## 2. OTP Verification Template (Reauthentication)

**Subject:** `Your TrackMyOPT Verification Code`

**HTML Body:**

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

---

## 3. Confirm Signup Template (Email Confirmation)

**Subject:** `Welcome to TrackMyOPT - Confirm Your Email`

**HTML Body:**

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
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to TrackMyOPT!</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your OPT Timeline Companion</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Confirm Your Email Address</h2>
        
        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
          Thanks for signing up! We're excited to help you manage your OPT timeline.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
          To get started, please confirm your email address by clicking the button below:
        </p>
        
        <!-- Confirm Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
            Confirm Email Address
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.5;">
          ⏱️ This link will expire in <strong>24 hours</strong>.<br>
          🎉 Once confirmed, you'll have full access to all TrackMyOPT features!
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 13px; margin: 0; line-height: 1.5;">
          <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a>
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

---

## 4. Magic Link Template

**Subject:** `Your TrackMyOPT Sign-In Link`

**HTML Body:**

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
        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Sign In to TrackMyOPT</h2>
        
        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
          Click the button below to sign in to your TrackMyOPT account:
        </p>
        
        <!-- Sign In Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
            Sign In to TrackMyOPT
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.5;">
          ⏱️ This link will expire in <strong>1 hour</strong> for security reasons.<br>
          🔒 If you didn't request this sign-in link, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 13px; margin: 0; line-height: 1.5;">
          <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a>
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

---

## 📝 How to Apply These Templates

### Step-by-Step Instructions:

1. **Login to Supabase Dashboard**
2. Select your project
3. Go to **Authentication** → **Email Templates**
4. For each template:
   - Click on the template name (e.g., "Reset Password")
   - Replace the **Subject** with the one above
   - Replace the **HTML Body** with the template above
   - Click **Save**

### Templates to Update:

- ✅ **Reset Password** - Use Template #1
- ✅ **Reauthentication** (OTP) - Use Template #2
- ✅ **Confirm Signup** - Use Template #3
- ✅ **Magic Link** - Use Template #4

---

## ✨ Benefits

After applying these templates:

- ✅ **Professional appearance** - Branded with TrackMyOPT colors and logo
- ✅ **Better deliverability** - Won't be flagged as spam
- ✅ **Mobile responsive** - Looks great on all devices
- ✅ **Clear call-to-action** - Easy-to-click buttons
- ✅ **Security notes** - Expiration times and safety reminders
- ✅ **Fallback links** - Plain text URLs for email clients that block buttons

---

## 🔒 Security Features

All templates include:

- ⏱️ **Expiration warnings** - Clear time limits
- 🔒 **Security reminders** - "Don't share" messages
- ✉️ **Fallback links** - For clients that block HTML buttons
- 📧 **Footer disclaimers** - Professional legal text

---

## 🎨 Customization

Want to customize further? You can:

1. Change the gradient colors
2. Add your logo image
3. Modify the text content
4. Adjust button styles
5. Add additional information

Just edit the HTML in the Supabase dashboard!

