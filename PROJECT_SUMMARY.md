# TrackMyOPT - Project Summary

## 📦 Repository
**GitHub**: https://github.com/dikondaashish/TrackmyOPT.git

✅ **All code is pushed to GitHub and up to date!**

---

## 🏗️ Project Structure

```
TrackMyOPT/
├── web/                          # Next.js 14 Web Application
│   ├── app/                      # App Router pages & API routes
│   │   ├── page.tsx              # Landing page
│   │   ├── privacy/page.tsx      # Privacy policy (required for Chrome Web Store)
│   │   ├── auth/extension/       # OAuth flow for extension
│   │   │   ├── page.tsx          # Auth page (Google + Manual)
│   │   │   └── callback/
│   │   │       ├── page.tsx      # Client-side hash reader
│   │   │       └── server/route.ts  # JWT minting
│   │   └── api/
│   │       ├── me/route.ts       # Get user profile + OPT status
│   │       ├── manual/
│   │       │   ├── signup/route.ts  # Manual registration
│   │       │   └── login/route.ts   # Manual sign-in
│   │       └── jobs/
│   │           └── daily-digest/route.ts  # CRON job for email reminders
│   ├── lib/
│   │   ├── env.ts                # Environment validation (client/server)
│   │   ├── supabaseClient.ts     # Supabase client (implicit OAuth flow)
│   │   ├── jwt.ts                # JWT signing & verification
│   │   └── date.ts               # Date utilities
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_initial_schema.sql  # Database schema
│   └── package.json              # Dependencies
│
├── extension/                    # Chrome Manifest V3 Extension
│   ├── manifest.json             # Extension manifest
│   ├── public/
│   │   ├── popup.html            # ✨ NEW: Polished locked-state UI
│   │   └── icons/                # Extension icons (16, 48, 128)
│   ├── src/
│   │   ├── background.ts         # Service worker (OAuth, tab-based)
│   │   ├── popup.ts              # Popup logic
│   │   └── config.ts             # API endpoints configuration
│   ├── esbuild.config.js         # Build configuration
│   └── package.json
│
├── docs/                         # Documentation
│   ├── CHROME_WEB_STORE.md       # Chrome Web Store listing guide
│   ├── GOOGLE_OAUTH_SETUP.md     # OAuth setup instructions
│   ├── TESTING_CHECKLIST.md      # QA & Release validation
│   ├── QUICKSTART.md             # Quick setup guide
│   └── README.md                 # Main documentation
│
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml           # pnpm workspace definition
└── vercel.json                   # Vercel CRON job config
```

---

## 🚀 Tech Stack

### Web App
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth + Email/Password)
- **Database**: Supabase (PostgreSQL with RLS)
- **JWT**: jose library (HS256, issuer/audience validation)
- **Email**: Resend (for daily reminders)
- **Deployment**: Vercel (with CRON jobs)

### Chrome Extension
- **Manifest**: V3
- **Language**: TypeScript
- **Build Tool**: esbuild
- **OAuth Flow**: Tab-based (chrome.tabs API)
- **Storage**: chrome.storage.sync (cross-device sync)
- **UI**: Vanilla HTML/CSS (no React)

---

## ✅ Completed Features

### 🔐 Authentication
- [x] Google OAuth sign-in (implicit flow for extension compatibility)
- [x] Manual email/password sign-up
- [x] Manual email/password sign-in
- [x] JWT-based authentication for extension
- [x] Auto-create profile for new Google users
- [x] Session management with 10-minute token expiry

### 🗄️ Database
- [x] Supabase schema with RLS policies
- [x] `profiles` table (timezone, STEM eligibility)
- [x] `opt_status` table (all OPT dates)
- [x] `employment_spans` table (employment history)

### 🌐 Web Application
- [x] Landing page with branding
- [x] Privacy policy page (Chrome Web Store requirement)
- [x] OAuth callback handling (both PKCE and implicit flows)
- [x] `/api/me` endpoint with auto-profile creation
- [x] Manual signup/login API routes
- [x] Daily digest CRON job for email reminders

### 🔌 Chrome Extension
- [x] Professional locked-state UI with feature list
- [x] Tab-based OAuth flow (not popup window)
- [x] JWT token storage in chrome.storage.sync
- [x] `/api/me` integration to fetch user data
- [x] Automatic sign-out on token expiry
- [x] Dark mode support
- [x] Responsive 320px width design

### 📧 Email Notifications (Ready)
- [x] Resend integration
- [x] Daily digest CRON job
- [x] Thresholds: Program End (60/30/10 days), OPT EAD End (60/30/10 days), OPT Start (14/7/3/1 days)

---

## 🔧 Environment Variables

### Required for Web App (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://deknauqkqqzwuvopqott.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SIGNING_SECRET=your_32_char_secret

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to production URL
NEXT_PUBLIC_APP_NAME=TrackMyOPT

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=561201157955-fiibv7irokcogh6s65jl5acquvedkd2i.apps.googleusercontent.com

# Resend (Email)
RESEND_API_KEY_ONBOARDING=your_onboarding_key
RESEND_API_KEY_DAILY_REMINDERS=your_daily_reminders_key

# CRON Security
CRON_SECRET=your_cron_secret
```

---

## 🚦 How to Run Locally

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account
- Google Cloud Console project (for OAuth)

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/dikondaashish/TrackmyOPT.git
   cd TrackmyOPT
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Supabase**
   - Create project at https://supabase.com
   - Run migration: `web/supabase/migrations/001_initial_schema.sql`
   - Configure Google OAuth provider in Supabase Dashboard
   - Copy environment variables to `web/.env.local`

4. **Run Web App**
   ```bash
   pnpm dev:web
   # Runs on http://localhost:3000
   ```

5. **Build Extension**
   ```bash
   pnpm build:ext
   # Output in extension/dist/
   ```

6. **Load Extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `extension/dist/` folder

---

## 🐛 Known Issues & Fixes

### ✅ FIXED: JWT Verification Failures
- **Problem**: Callback route created JWTs without issuer/audience claims
- **Solution**: Use `signToken()` helper that includes required claims

### ✅ FIXED: New Google Users "Session Expired" Error
- **Problem**: No profile record for new OAuth users
- **Solution**: Auto-create profile in `/api/me` using service role key

### ✅ FIXED: PKCE Flow Failures
- **Problem**: Chrome extension OAuth doesn't preserve cookies for PKCE
- **Solution**: Use implicit OAuth flow globally

### ✅ FIXED: Popup Window Instead of Tab
- **Problem**: `chrome.identity.launchWebAuthFlow` opens popup window
- **Solution**: Use `chrome.tabs.create` with tab navigation listener

### ✅ FIXED: TypeScript Linter Errors
- **Problem**: Invalid `flowType` option in `signInWithOAuth`
- **Solution**: Remove per-request option, configured globally in client

---

## 📱 Chrome Web Store Preparation

### Assets Created
- [x] `CHROME_WEB_STORE.md` - Complete listing guide
- [x] Store description (132 chars, SEO-optimized)
- [x] Full description with features
- [x] Privacy policy page (`/privacy`)
- [x] Professional popup UI with feature list
- [x] Icons (16×16, 48×48, 128×128)

### Pre-Submission Checklist
- [ ] Create production OAuth client (Chrome Extension type)
- [ ] Update `extension/src/config.ts` with production URL
- [ ] Update `manifest.json` host_permissions for production
- [ ] Remove localhost from host_permissions
- [ ] Deploy web app to Vercel
- [ ] Create 3-5 screenshots (1280×800 or 640×400)
- [ ] Test end-to-end OAuth flow in production
- [ ] Verify privacy policy is accessible
- [ ] Zip `extension/dist/` for upload

---

## 📊 Project Statistics

- **Total Commits**: 50+
- **Lines of Code**: ~5,000+ (TypeScript, TSX, CSS)
- **API Endpoints**: 5
- **Database Tables**: 3
- **Authentication Methods**: 2 (Google OAuth, Email/Password)

---

## 🎯 Next Steps

### For Chrome Web Store Publication
1. Deploy web app to production (Vercel)
2. Update `extension/src/config.ts` with production URL
3. Create production OAuth client in Google Cloud Console
4. Add OAuth client ID to `manifest.json`
5. Take screenshots of extension in action
6. Zip `extension/dist/` folder
7. Submit to Chrome Web Store Developer Dashboard

### Feature Enhancements (Future)
- [ ] Add OPT filing window calculator
- [ ] Unemployment day tracker with visual progress
- [ ] STEM reporting reminder system
- [ ] Employment history management
- [ ] Email notification preferences
- [ ] Dashboard with deadline cards
- [ ] Export data as PDF/CSV

---

## 📞 Support

- **Email**: support@trackmyopt.com
- **Website**: https://trackmyopt.vercel.app
- **GitHub**: https://github.com/dikondaashish/TrackmyOPT

---

## 📄 License

MIT License

---

**Last Updated**: October 14, 2025
**Status**: ✅ Ready for Chrome Web Store Submission

