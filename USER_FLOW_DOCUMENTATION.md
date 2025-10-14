# TrackMyOPT - User Flow Documentation

## 📋 Overview

This document describes the complete user journey from downloading the Chrome extension to accessing the TrackMyOPT tools.

**Current Status:** ✅ Development Complete  
**Deployment:** Chrome Extension (Manual Load) + Next.js Web App (localhost:3000)  
**Future:** Chrome Web Store Publishing (Pending)

---

## 🔄 Complete User Flow

### **Phase 1: Extension Installation**

#### 1.1 Download Extension
- User downloads TrackMyOPT extension from Google Drive
- Extension package: `TrackMyOPT.zip`
- Contains: Manifest V3 Chrome Extension files

#### 1.2 Load Extension in Chrome
1. Open Chrome → Navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `TrackMyOPT/extension/dist` folder
5. Extension appears in Chrome toolbar 🎉

---

### **Phase 2: First Launch (Locked State)**

When user clicks the extension icon for the first time:

```
┌─────────────────────────────────────────┐
│           🔷 TrackMyOPT                 │
│                                         │
│  Sign in to unlock all features         │
│                                         │
│              🔐                         │
│       Sign in required                  │
│                                         │
│  Calculate filing windows, track        │
│  unemployment days, and get reminders.  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Sign in or create account    →   │ │
│  └───────────────────────────────────┘ │
│                                         │
│     Privacy · Terms                     │
└─────────────────────────────────────────┘
```

**What Happens:**
- Extension shows locked state (no tools accessible)
- User sees call-to-action to sign in
- Click **"Sign in or create account"** button

---

### **Phase 3: Authentication (Web App)**

#### 3.1 Redirect to Web App

Extension opens new browser tab:

**URL Format:**
```
http://localhost:3000/auth/extension?redirect_uri=https%3A%2F%2Fdfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org%2Foauth2&state=7fd9b217d2ddea480531bf30663cb5b7
```

**Parameters:**
- `redirect_uri`: Chrome extension's OAuth redirect URI
- `state`: Random CSRF protection token

---

#### 3.2 Sign-In Page (Default View)

```
┌─────────────────────────────────────────┐
│  [Left: Auto-scrolling image carousel] │
│  • Track Your OPT Timeline              │
│  • Calculate Filing Windows             │
│  • Stay Compliant                       │
│                                         │
│  [Right: Sign-in form]                  │
│                                         │
│  TrackMyOPT                             │
│  Calculate filing windows, track        │
│  unemployment days, and get reminders.  │
│                                         │
│  Enter your email address               │
│  ┌───────────────────────────────────┐ │
│  │ your@email.com                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Enter your password                    │
│  ┌───────────────────────────────────┐ │
│  │ ••••••••                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ☐ Remember me    Forgot password?      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        Sign In                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│        or login with                    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  🔵 Google                        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Don't have an account? create account  │
│                                         │
│  Privacy Policy · Terms & Conditions    │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Email + Password fields with browser autofill
- ✅ Remember me checkbox (saves email to localStorage)
- ✅ Forgot password? link (opens modal)
- ✅ Google OAuth button
- ✅ Link to switch to Sign-Up mode
- ✅ Beautiful left-side carousel with OPT features

---

#### 3.3 Forgot Password Flow

Click **"Forgot password?"** → Modal appears:

```
┌─────────────────────────────────────────┐
│  Reset Password                    ×    │
│                                         │
│  Enter your email address and we'll     │
│  send you a link to reset your password.│
│                                         │
│  Email Address                          │
│  ┌───────────────────────────────────┐ │
│  │ your@email.com                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌──────────┐  ┌────────────────────┐ │
│  │  Cancel  │  │ Send Reset Link    │ │
│  └──────────┘  └────────────────────┘ │
└─────────────────────────────────────────┘
```

**Smart Validation:**
- ✅ Checks if email is registered
- ❌ If **NOT registered**: Shows error with "Create Account Now" button
- ✅ If **registered**: Sends password reset email via Supabase SMTP

**Error for Unregistered Email:**
```
⚠️ This email is not registered with TrackMyOPT. 
Please create an account first by clicking 'create account' below.

┌───────────────────────────────────┐
│   Create Account Now    →         │
└───────────────────────────────────┘
```

---

#### 3.4 Sign-Up Page (Create Account)

Click **"create account"** → Shows sign-up form:

```
┌─────────────────────────────────────────┐
│  TrackMyOPT                             │
│  Calculate filing windows, track        │
│  unemployment days, and get reminders.  │
│                                         │
│  First Name          Last Name          │
│  ┌─────────────┐    ┌─────────────┐    │
│  │ John        │    │ Doe         │    │
│  └─────────────┘    └─────────────┘    │
│                                         │
│  Email                                  │
│  ┌───────────────────────────────────┐ │
│  │ your@email.com                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Password                               │
│  ┌───────────────────────────────────┐ │
│  │ ••••••••                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Password must contain:                 │
│  ✓ At least 8 characters                │
│  ✓ One uppercase letter (A-Z)           │
│  ✓ One lowercase letter (a-z)           │
│  ✓ One number (0-9)                     │
│  ✓ One special character (!@#$%^&*...)  │
│                                         │
│  Confirm Password                       │
│  ┌───────────────────────────────────┐ │
│  │ ••••••••                          │ │
│  └───────────────────────────────────┘ │
│  ✓ Passwords match                      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      Create Account               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Already have an account? sign in       │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ First Name + Last Name fields
- ✅ Email field
- ✅ Password with real-time validation criteria
- ✅ Confirm Password with match validation
- ✅ Visual checkmarks (✓) as criteria are met
- ✅ Browser password manager integration

**Password Requirements (Live Validation):**
- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character

---

#### 3.5 Email Verification (OTP)

After clicking **"Create Account"** → OTP Modal appears:

```
┌─────────────────────────────────────────┐
│              📧                          │
│                                         │
│      Verify Your Email                  │
│                                         │
│  We've sent a 6-digit verification      │
│  code to your@email.com. Please check   │
│  your inbox and enter the code below.   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        1 2 3 4 5 6                │ │
│  │     (Enter 6-digit code)          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Code expires in 10 minutes             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Verify & Create Account          │ │
│  └───────────────────────────────────┘ │
│                                         │
│    Cancel            Resend Code        │
└─────────────────────────────────────────┘
```

**Email Sent via:**
- ✅ Supabase built-in OTP
- ✅ Hostinger SMTP (1000 emails/day)
- ✅ Beautiful HTML email template (customizable in Supabase)

**Email Content (Sample):**
```
┌─────────────────────────────────────────┐
│  TrackMyOPT                             │
│  Your OPT Timeline Companion            │
│─────────────────────────────────────────│
│                                         │
│  Email Verification                     │
│                                         │
│  Thank you for signing up! To complete  │
│  your registration, please enter the    │
│  verification code below:               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Your Verification Code          │ │
│  │                                   │ │
│  │        1 2 3 4 5 6                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⏱️ Expires in 10 minutes               │
│  🔒 Do not share this code              │
└─────────────────────────────────────────┘
```

---

#### 3.6 Authentication Success

After OTP verification or successful sign-in:

```
┌─────────────────────────────────────────┐
│                                         │
│              ✅                          │
│                                         │
│          Success!                       │
│                                         │
│     Completing sign-in...               │
│                                         │
│              ⟲                          │
│        (Loading spinner)                │
│                                         │
│  This window will close automatically   │
│                                         │
└─────────────────────────────────────────┘
```

**What Happens Behind the Scenes:**
1. User completes authentication
2. Backend generates JWT token (10-minute expiry)
3. Redirects to `/auth/completing` page (beautiful success screen)
4. After 100ms → Redirects to extension's redirect_uri with token
5. Extension background script detects redirect
6. Token saved to `chrome.storage.sync`
7. Browser tab closes automatically (500ms delay)
8. Extension popup refreshes to signed-in state ✅

**User Never Sees:**
- ❌ Chrome extension redirect URL (`dfecepbhicheepchdoffoilldlhaacpn.chromiumapp.org`)
- ❌ DNS errors or "site can't be reached" messages
- ✅ Only sees: Success page → Tab closes → Extension signed in

---

### **Phase 4: Extension Home (Signed In)**

After successful authentication, extension shows:

```
┌─────────────────────────────────────────┐
│  🌙 🚪                   TrackMyOPT      │
│  (theme) (logout)                       │
│                                         │
│  Your complete toolkit for managing     │
│  OPT requirements                       │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Select a tool below to get started ││
│  │      with your OPT journey         ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │     📝       │  │     🎒       │   │
│  │              │  │              │   │
│  │ OPT Apply    │  │ STEM OPT     │   │
│  │ Start Dates  │  │ Apply Dates  │   │
│  │              │  │              │   │
│  │ Calculate    │  │ Calculate    │   │
│  │ when you can │  │ STEM OPT     │   │
│  │ start        │  │ extension    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │     ⏱️       │  │     📅       │   │
│  │              │  │              │   │
│  │ OPT Clock    │  │ More Tools   │   │
│  │ Tracker      │  │ Coming       │   │
│  │              │  │              │   │
│  │ Track your   │  │ Stay tuned   │   │
│  │ unemployment │  │ for          │   │
│  │ days         │  │ additional   │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ 🛡️ Stay Compliant                 ││
│  │                                    ││
│  │ All tools are designed to help you ││
│  │ track and manage your OPT          ││
│  │ requirements. Always consult with  ││
│  │ your DSO for official guidance.    ││
│  └────────────────────────────────────┘│
│                                         │
│     Privacy · Terms                     │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Header with theme toggle (🌙/☀️) and logout (🚪)
- ✅ Banner with welcome message
- ✅ 2×2 grid of tool tiles (clickable)
- ✅ Notice card with compliance reminder
- ✅ Footer with Privacy and Terms links

**Tool Tiles:**
1. **📝 OPT Apply Start Dates** - Calculate when to apply for OPT
2. **🎒 STEM OPT Apply Start Dates** - Calculate STEM extension dates
3. **⏱️ OPT Clock Tracker** - Track unemployment days in real-time
4. **📅 More Tools Coming** - Placeholder for future features

**Clicking a Tile:**
- Opens tool page **within the popup** (not new tab)
- Each tool has its own page with back button
- Seamless in-popup navigation

---

## 🔐 Authentication Methods

### **1. Manual Sign-In (Email + Password)**

**Flow:**
1. User enters email and password
2. System validates credentials via Supabase
3. If valid → Generates JWT → Redirects to extension
4. If invalid → Shows error: "Incorrect Email or Password"
5. Browser prompts to save password (autofill integration)

**Features:**
- ✅ Remember me (saves email to localStorage)
- ✅ Browser password manager integration
- ✅ "Forgot password?" link with smart validation

---

### **2. Manual Sign-Up (Email + Password + OTP)**

**Flow:**
1. User fills: First Name, Last Name, Email, Password, Confirm Password
2. Real-time password validation (must meet 5 criteria)
3. Click "Create Account"
4. Backend sends OTP email via Supabase SMTP (Hostinger)
5. User enters 6-digit code from email
6. Backend verifies OTP
7. Account created → JWT generated → Redirects to extension

**Email OTP:**
- ✅ 6-digit code
- ✅ 60-minute expiration
- ✅ Resend option
- ✅ Beautiful HTML email template

---

### **3. Google OAuth**

**Flow:**
1. User clicks "Google" button
2. Opens Google OAuth consent screen
3. User selects Google account
4. Google redirects to `/auth/extension/callback`
5. Backend exchanges code for session
6. Creates/updates user in Supabase
7. Generates JWT → Redirects to extension

**Features:**
- ✅ One-click sign-in
- ✅ Auto-creates profile if new user
- ✅ Uses Supabase Auth for Google OAuth
- ✅ Secure PKCE flow

---

## 🎨 Design Features

### **Theme Support**
- ✅ Light mode (default)
- ✅ Dark mode
- ✅ Toggle icon changes: 🌙 (light) / ☀️ (dark)
- ✅ Persistent across sessions

### **Responsive Design**
- ✅ Two-column layout for auth page (desktop)
- ✅ Single column for mobile
- ✅ Auto-scrolling image carousel (left side)
- ✅ Clean, modern UI with Tailwind CSS

### **Branding**
- ✅ TrackMyOPT logo and name
- ✅ Apple glassmorphism design language
- ✅ Blue (#667eea) and Purple (#764ba2) gradient
- ✅ SF Pro font family
- ✅ Consistent across web and extension

---

## 🔒 Security Features

### **CSRF Protection**
- ✅ Random `state` parameter in OAuth flow
- ✅ Validated on callback

### **JWT Tokens**
- ✅ Short-lived (10-minute expiry)
- ✅ HS256 algorithm
- ✅ Includes `issuer` and `audience` claims
- ✅ Stored in `chrome.storage.sync` (syncs across devices)

### **Password Security**
- ✅ Minimum 8 characters
- ✅ Complexity requirements (uppercase, lowercase, number, special)
- ✅ Hashed by Supabase (never stored in plaintext)
- ✅ Browser password manager integration

### **Email Verification**
- ✅ OTP required for new signups
- ✅ Prevents fake email accounts
- ✅ 60-minute expiration

### **RLS (Row Level Security)**
- ✅ Supabase RLS policies
- ✅ Users can only access their own data
- ✅ Service role key for admin operations

---

## 📧 Email Templates

### **OTP Verification Email**
- Subject: `Your TrackMyOPT Verification Code`
- Contains: 6-digit code with expiration warning
- Template: Customizable in Supabase Dashboard → Auth → Email Templates → Reauthentication

### **Password Reset Email**
- Subject: `Reset Your TrackMyOPT Password`
- Contains: Reset link with 1-hour expiration
- Template: Customizable in Supabase Dashboard → Auth → Email Templates → Reset Password

**SMTP Provider:**
- ✅ Hostinger SMTP (custom domain)
- ✅ 1000 emails/day limit
- ✅ Configured in Supabase → Settings → Auth → SMTP

---

## 📦 Tech Stack

### **Chrome Extension**
- **Manifest:** V3
- **Languages:** TypeScript, HTML, CSS
- **Build Tool:** esbuild
- **Storage:** chrome.storage.sync
- **Permissions:** identity, storage, tabs
- **Design:** Vanilla CSS with Apple glassmorphism

### **Web App (Next.js)**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Email:** Supabase SMTP (Hostinger)
- **Deployment:** Vercel (future)

### **APIs & Services**
- **Supabase:** Auth, Database, Storage
- **Hostinger:** SMTP email delivery
- **Google OAuth:** Third-party sign-in
- **JWT:** Token-based authentication (jose library)

---

## 🚀 Deployment Status

### **Current (Development)**
- ✅ Extension: Manual load via Chrome DevTools
- ✅ Web App: Running on `localhost:3000`
- ✅ Database: Supabase (hosted)
- ✅ SMTP: Hostinger (configured)

### **Future (Production)**
- 🔜 Extension: Chrome Web Store
- 🔜 Web App: Vercel deployment
- 🔜 Custom domain: `trackmyopt.com` or similar
- 🔜 Analytics: User tracking and insights

---

## 📊 User Data Flow

### **What Gets Stored:**

**1. Supabase `auth.users` Table:**
- Email
- Password (hashed)
- User metadata (firstName, lastName)
- Email verified status
- Created/updated timestamps

**2. Supabase `profiles` Table:**
- user_id (references auth.users)
- timezone (default: America/New_York)
- is_stem_eligible (default: false)

**3. Supabase `opt_status` Table (Future):**
- user_id
- program_end_date
- dso_recommendation_date
- opt_ead_end_date
- opt_start_date
- stem_start_date

**4. Chrome Extension Storage:**
- `idToken`: JWT token (10-min expiry)
- `signedIn`: Boolean
- `signedInAt`: Timestamp
- `theme`: 'light' | 'dark'

**5. Browser localStorage (Web):**
- `trackmyopt_remember_email`: Saved email (if "Remember me" checked)

---

## 🔄 Session Management

### **Token Expiry:**
- JWT tokens expire after 10 minutes
- User must re-authenticate after expiry
- Extension shows locked state again

### **Cross-Device Sync:**
- ✅ `chrome.storage.sync` syncs across user's Chrome browsers
- ✅ Sign in once, access from all Chrome devices
- ✅ Logout on one device → logs out everywhere (storage cleared)

### **Logout:**
- Click 🚪 button in extension header
- Clears `chrome.storage.sync`
- Extension returns to locked state
- User must sign in again

---

## 🎯 Key Features Summary

### **Completed ✅**
1. ✅ Chrome Extension (Manifest V3)
2. ✅ Next.js Web App (App Router, TypeScript, Tailwind)
3. ✅ Manual Sign-In (Email + Password)
4. ✅ Manual Sign-Up with OTP Email Verification
5. ✅ Google OAuth Sign-In
6. ✅ Forgot Password with Smart Validation
7. ✅ Password Reset Flow
8. ✅ Browser Password Manager Integration
9. ✅ Remember Me Functionality
10. ✅ Email OTP via Supabase SMTP (Hostinger)
11. ✅ JWT Token Authentication
12. ✅ Extension Auto-Login after Web Auth
13. ✅ Seamless Redirect (No URL Flash)
14. ✅ Theme Toggle (Light/Dark Mode)
15. ✅ Responsive Design
16. ✅ Professional Email Templates
17. ✅ CSRF Protection
18. ✅ RLS Security Policies
19. ✅ Cross-Device Sync

### **Pending 🔜**
- 🔜 OPT Apply Start Dates Calculator
- 🔜 STEM OPT Apply Start Dates Calculator
- 🔜 OPT Clock Tracker (Unemployment Days)
- 🔜 User Dashboard (Web App)
- 🔜 Email Reminders (CRON Jobs)
- 🔜 Profile Settings Page
- 🔜 OPT Data Entry Flow
- 🔜 Chrome Web Store Publishing

---

## 📝 Notes for Production

### **Before Chrome Web Store Submission:**
1. Update manifest.json with final extension ID
2. Replace `localhost:3000` with production URL
3. Update OAuth redirect URIs in Supabase
4. Configure custom domain for web app
5. Update email templates with production branding
6. Add analytics tracking (optional)
7. Create privacy policy page
8. Create terms & conditions page
9. Prepare screenshots and marketing materials
10. Test on multiple Chrome versions

### **Environment Variables Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SIGNING_SECRET=xxx (32+ characters)
NEXT_PUBLIC_SITE_URL=https://trackmyopt.com
NEXT_PUBLIC_APP_NAME=TrackMyOPT
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx (if using Google OAuth)
```

---

## 🎉 Conclusion

The TrackMyOPT authentication and extension infrastructure is **fully functional** and ready for user testing. The flow from extension download to signed-in state is seamless, secure, and provides an excellent user experience.

**Total Development Time:** Multiple iterations with continuous improvements  
**Current Status:** ✅ Authentication Flow Complete  
**Next Steps:** Build OPT calculation tools and dashboards

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0 (Development)  
**Documentation:** Complete User Flow

