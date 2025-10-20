# 📧 Professional Email Templates for TrackMyOPT

Copy these templates into your Supabase Email Templates settings.

---

## 1. Confirm Signup (OTP Verification)

**Subject:** Your TrackMyOPT Verification Code

**Body:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
            
            <!-- Header with Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TrackMyOPT</h1>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Your OPT Timeline Companion</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 48px 40px;">
                <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 28px; font-weight: 700;">Verify Your Email</h2>
                
                <p style="color: #4a5568; line-height: 1.7; margin: 0 0 24px 0; font-size: 16px;">
                  Welcome to TrackMyOPT! We're excited to have you. To complete your registration and unlock all features, please verify your email address using the code below.
                </p>
                
                <!-- OTP Code Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 32px; text-align: center;">
                      <p style="color: #718096; margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Your Verification Code</p>
                      <p style="color: #667eea; margin: 0; font-size: 48px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace;">
                        {{ .Token }}
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Important Info -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                  <tr>
                    <td>
                      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                        <strong>⏱️ Time-Sensitive:</strong> This code expires in <strong>10 minutes</strong>.<br>
                        <strong>🔒 Security:</strong> Never share this code with anyone.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <p style="color: #a0aec0; font-size: 14px; margin: 0; line-height: 1.6;">
                  If you didn't create an account with TrackMyOPT, please ignore this email or contact our support team if you have concerns.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fa; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
                  © 2025 TrackMyOPT. All rights reserved.<br>
                  Made with ❤️ for international students
                </p>
                <p style="margin: 16px 0 0 0;">
                  <a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 13px;">Visit TrackMyOPT</a>
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Legal Notice -->
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
            This is an automated message. Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 2. Magic Link (Passwordless Login)

**Subject:** Your TrackMyOPT Sign-In Link

**Body:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TrackMyOPT</h1>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Your OPT Timeline Companion</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 48px 40px;">
                <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 28px; font-weight: 700;">Sign In to Your Account</h2>
                
                <p style="color: #4a5568; line-height: 1.7; margin: 0 0 32px 0; font-size: 16px;">
                  Click the button below to securely sign in to your TrackMyOPT account. This link will expire in 60 minutes for your security.
                </p>
                
                <!-- Magic Link Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                        Sign In to TrackMyOPT →
                      </a>
                    </td>
                  </tr>
                </table>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <p style="color: #718096; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
                  <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                </p>
                <p style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; word-break: break-all; font-size: 13px; color: #667eea; font-family: 'Courier New', monospace;">
                  {{ .ConfirmationURL }}
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px; margin: 24px 0 0 0;">
                  <tr>
                    <td>
                      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                        <strong>🔒 Security Notice:</strong> If you didn't request this sign-in link, please ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fa; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
                  © 2025 TrackMyOPT. All rights reserved.<br>
                  Made with ❤️ for international students
                </p>
                <p style="margin: 16px 0 0 0;">
                  <a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 13px;">Visit TrackMyOPT</a>
                </p>
              </td>
            </tr>
          </table>
          
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
            This is an automated message. Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 3. Reset Password

**Subject:** Reset Your TrackMyOPT Password

**Body:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TrackMyOPT</h1>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Your OPT Timeline Companion</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 48px 40px;">
                <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 28px; font-weight: 700;">Reset Your Password</h2>
                
                <p style="color: #4a5568; line-height: 1.7; margin: 0 0 16px 0; font-size: 16px;">
                  We received a request to reset the password for your TrackMyOPT account.
                </p>
                
                <p style="color: #4a5568; line-height: 1.7; margin: 0 0 32px 0; font-size: 16px;">
                  Click the button below to choose a new password. This link is secure and will expire in 1 hour.
                </p>
                
                <!-- Reset Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);">
                        Reset My Password →
                      </a>
                    </td>
                  </tr>
                </table>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <p style="color: #718096; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
                  <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                </p>
                <p style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; word-break: break-all; font-size: 13px; color: #667eea; font-family: 'Courier New', monospace;">
                  {{ .ConfirmationURL }}
                </p>
                
                <!-- Security Notice -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin: 24px 0 0 0;">
                  <tr>
                    <td>
                      <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.6;">
                        <strong>⚠️ Important:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged. Contact us immediately if you have concerns about your account security.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fa; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
                  © 2025 TrackMyOPT. All rights reserved.<br>
                  Made with ❤️ for international students
                </p>
                <p style="margin: 16px 0 0 0;">
                  <a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 13px;">Visit TrackMyOPT</a>
                </p>
              </td>
            </tr>
          </table>
          
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
            This is an automated message. Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 4. Invite User

**Subject:** You've Been Invited to TrackMyOPT

**Body:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TrackMyOPT</h1>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Your OPT Timeline Companion</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 48px 40px;">
                <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 28px; font-weight: 700;">🎉 You're Invited!</h2>
                
                <p style="color: #4a5568; line-height: 1.7; margin: 0 0 24px 0; font-size: 16px;">
                  Great news! You've been invited to join TrackMyOPT, the smart way to manage your OPT timeline, track unemployment days, and never miss a critical deadline.
                </p>
                
                <!-- Invite Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);">
                        Accept Invitation →
                      </a>
                    </td>
                  </tr>
                </table>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <p style="color: #718096; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
                  <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                </p>
                <p style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; word-break: break-all; font-size: 13px; color: #667eea; font-family: 'Courier New', monospace;">
                  {{ .ConfirmationURL }}
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fa; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
                  © 2025 TrackMyOPT. All rights reserved.<br>
                  Made with ❤️ for international students
                </p>
                <p style="margin: 16px 0 0 0;">
                  <a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 13px;">Visit TrackMyOPT</a>
                </p>
              </td>
            </tr>
          </table>
          
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
            This is an automated message. Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## ✨ Features of These Templates

1. **Professional Design**: Modern, clean layout with gradient headers
2. **Mobile Responsive**: Works perfectly on all devices
3. **High Contrast**: Easy to read with proper color contrast
4. **Security Focused**: Clear warnings and expiration times
5. **Brand Consistent**: TrackMyOPT branding throughout
6. **Accessible**: Proper HTML table structure for email clients
7. **Beautiful Typography**: Modern sans-serif fonts
8. **CTA Buttons**: Large, prominent call-to-action buttons
9. **Alternative Links**: Plain text URLs for accessibility
10. **Professional Footer**: Copyright and branding

---

## 🎯 How to Use

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select each template type
4. Copy the corresponding HTML from above
5. Paste into the Message body field
6. Update the Subject heading if needed
7. Click **Save**

---

**These emails will make a professional first impression!** 🎉
