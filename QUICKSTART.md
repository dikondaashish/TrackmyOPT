# 🚀 QuickStart Guide - TrackMyOPT

Get your OPT tracking system up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Chrome browser
- Supabase account

## Step 1: Clone & Install (2 min)

```bash
cd TrackMyOPT
pnpm install
```

## Step 2: Set Up Environment Variables (1 min)

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SIGNING_SECRET=your-generated-secret
```

✅ **Already configured** if you followed the setup earlier!

## Step 3: Set Up Database (2 min)

1. Go to Supabase SQL Editor
2. Copy contents from `web/supabase/migrations/001_initial_schema.sql`
3. Paste and run in SQL Editor
4. Verify tables created: `profiles`, `opt_status`, `employment_spans`

## Step 4: Start Web App (30 sec)

```bash
pnpm dev:web
```

Open http://localhost:3000 - you should see the landing page!

## Step 5: Build & Load Extension (1 min)

```bash
# Build extension
pnpm build:ext

# Or use watch mode for development
pnpm dev:ext
```

### Load in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `extension/dist` folder
5. 🎉 Extension loaded!

### Get Extension ID:

After loading, you'll see something like:
```
ID: abcdefghijklmnopqrstuvwxyz123456
```

**Copy this ID!** You'll need it for the OAuth redirect URI.

## Step 6: Test Authentication (1 min)

1. Click the OPT Hub extension icon in Chrome
2. Click "Sign In or Create Account"
3. Choose "Sign in with Google" or "Manual"
4. Complete authentication
5. You should see your OPT data!

## 🎯 What You Just Built

### Web App (Next.js 14)
- ✅ Landing page with features
- ✅ Google OAuth authentication
- ✅ Manual signup with OPT fields
- ✅ `/api/me` endpoint for user data
- ✅ JWT token generation
- ✅ Supabase integration

### Chrome Extension
- ✅ OAuth authentication flow
- ✅ Beautiful popup UI
- ✅ Real-time countdown
- ✅ OPT status display
- ✅ Dashboard link
- ✅ Secure token storage

## 📁 Key Files

### Web App
```
web/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/extension/
│   │   ├── page.tsx               # Auth with OPT signup
│   │   └── callback/route.ts      # JWT minting
│   └── api/me/route.ts            # User data API
├── lib/
│   ├── env.ts                     # Environment validation
│   ├── supabaseClient.ts          # Supabase client
│   └── jwt.ts                     # JWT utilities
└── .env.local                     # Your credentials
```

### Extension
```
extension/
├── src/
│   ├── background.ts              # OAuth flow
│   ├── popup.ts                   # Popup logic
│   ├── popup.html                 # UI
│   └── config.ts                  # Website URL
├── manifest.json                  # Extension config
└── dist/                          # Built files (load this)
```

## 🧪 Testing Checklist

- [ ] Web app loads at http://localhost:3000
- [ ] Can create account with OPT dates
- [ ] Can sign in with existing account
- [ ] Google OAuth works
- [ ] Extension loads without errors
- [ ] Extension authentication works
- [ ] Extension displays OPT data
- [ ] Countdown shows correct days
- [ ] Dashboard button opens web app
- [ ] Sign out works

## 🐛 Common Issues

### Web app won't start
```bash
# Check if dependencies installed
pnpm install

# Check .env.local exists
ls web/.env.local

# Restart dev server
pnpm dev:web
```

### Extension won't load
```bash
# Rebuild extension
pnpm build:ext

# Check dist folder exists
ls extension/dist

# Reload extension in Chrome
```

### "Invalid environment variables" error
- Make sure JWT_SIGNING_SECRET is set in `.env.local`
- Must be at least 32 characters
- Generate with: `openssl rand -base64 32`

### Extension auth fails
- Check web app is running on localhost:3000
- Check manifest.json has localhost permission
- Check config.ts has correct WEBSITE_URL
- View extension console for errors

### "Token expired" in extension
- Tokens expire after 10 minutes
- Sign in again to get new token
- Normal behavior for security

## 🚀 Next Steps

### 1. Customize UI
- Edit `web/app/page.tsx` for landing page
- Edit `extension/src/popup.html` for extension UI
- Update colors, fonts, branding

### 2. Add Features
- Add dashboard page in web app
- Add OPT date editing
- Add employment tracking
- Add notifications

### 3. Deploy to Production
- Deploy web app to Vercel
- Update `extension/src/config.ts` with production URL
- Update `manifest.json` host_permissions
- Test end-to-end
- Publish extension to Chrome Web Store

## 📚 Documentation

- **Setup**: `SETUP.md`
- **API**: `web/API.md`
- **Extension OAuth**: `web/EXTENSION_OAUTH.md`
- **Google OAuth**: `web/GOOGLE_OAUTH.md`
- **Database**: `web/supabase/README.md`
- **Extension**: `extension/README.md`

## 🆘 Need Help?

1. Check the debugging sections in README files
2. Review console logs (web & extension)
3. Verify Supabase setup
4. Check all environment variables
5. Ensure database migration ran successfully

## 🎉 Success!

If you've completed all steps, you now have:
- ✅ A working Next.js web app
- ✅ Supabase authentication
- ✅ A functional Chrome extension
- ✅ OAuth flow between web and extension
- ✅ API endpoint for user data
- ✅ Real-time OPT countdown

**You're ready to start developing!** 🚀

---

**Made with 💙 for international students**

