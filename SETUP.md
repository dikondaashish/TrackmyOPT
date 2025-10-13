# 🚀 TrackMyOPT Setup Guide

Complete setup instructions for getting TrackMyOPT running locally and in production.

## ✅ What You've Completed

- ✅ Monorepo structure created (web + extension)
- ✅ Next.js 14 web app with Tailwind CSS
- ✅ Chrome Extension with TypeScript + esbuild
- ✅ Supabase integration configured
- ✅ Environment variables set locally
- ✅ Database schema created
- ✅ Code pushed to GitHub

## 📋 Next Steps

### 1. Set Up Supabase Database (5 minutes)

1. **Go to Supabase SQL Editor**
   - Open: https://app.supabase.com/project/deknauqkqqzwuvopqott/sql
   
2. **Run the Migration**
   - Open file: `web/supabase/migrations/001_initial_schema.sql`
   - Copy entire contents
   - Paste in SQL Editor
   - Click **Run** (or press Ctrl/Cmd + Enter)

3. **Verify Tables Created**
   - Go to Table Editor: https://app.supabase.com/project/deknauqkqqzwuvopqott/editor
   - Should see: `profiles`, `opt_status`, `employment_spans`
   - All should have RLS enabled (green shield icon)

### 2. Start the Web App (2 minutes)

```bash
# Install dependencies
pnpm install

# Start Next.js development server
pnpm dev:web
```

Open http://localhost:3000 - you should see the landing page!

### 3. Build the Chrome Extension (2 minutes)

```bash
# Build extension
pnpm build:ext

# Or run in watch mode for development
pnpm dev:ext
```

**Load in Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder

### 4. Test Authentication

1. Go to http://localhost:3000
2. Click "Sign In or Create Account"
3. Create a new account with your email
4. Check email for confirmation link (if required)
5. Sign in successfully

## 📁 Project Structure

```
TrackMyOPT/
├── web/                          # Next.js web app
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   └── auth/extension/      # Auth page with tabs
│   ├── lib/
│   │   ├── env.ts               # Environment validation
│   │   ├── supabaseClient.ts    # Supabase client
│   │   └── jwt.ts               # JWT utilities
│   ├── supabase/
│   │   └── migrations/          # Database schemas
│   └── .env.local               # ✅ Already configured!
├── extension/                    # Chrome extension
│   ├── src/
│   │   ├── background.ts        # Service worker
│   │   ├── popup.ts             # Popup logic
│   │   └── popup.html           # Popup UI
│   └── manifest.json            # Extension manifest
└── README.md                     # Full documentation
```

## 🔐 Security Checklist

- ✅ `.env.local` is gitignored
- ✅ Supabase credentials stored locally only
- ✅ JWT secret generated (32-byte random)
- ✅ RLS enabled on all tables
- ⚠️ **Never commit `.env.local` to git**

## 🛠️ Development Workflow

### Running Both Apps Simultaneously

```bash
# Terminal 1: Web app
pnpm dev:web

# Terminal 2: Extension (if making changes)
pnpm dev:ext
```

### Making Changes

**Web App:**
- Edit files in `web/app/` or `web/lib/`
- Hot reload is automatic
- Check http://localhost:3000

**Extension:**
- Edit files in `extension/src/`
- If using `dev:ext`, rebuild is automatic
- Go to `chrome://extensions/` and click refresh icon

## 📊 Database Access

### View Data in Supabase
- Table Editor: https://app.supabase.com/project/deknauqkqqzwuvopqott/editor
- SQL Editor: https://app.supabase.com/project/deknauqkqqzwuvopqott/sql

### Query Examples

```sql
-- View all profiles
select * from profiles;

-- View OPT status for all users
select * from opt_status;

-- Check days remaining for a user
select 
  (opt_ead_end_date - current_date) as days_remaining,
  opt_start_date,
  opt_ead_end_date
from opt_status;
```

## 🐛 Troubleshooting

### Web app won't start
```bash
# Check if dependencies are installed
pnpm install

# Check if .env.local exists
ls -la web/.env.local

# Check for port conflicts
lsof -i :3000
```

### Extension not loading
- Make sure you built it: `pnpm build:ext`
- Check `extension/dist/` folder exists
- Look for errors in `chrome://extensions/`

### Database errors
- Verify migration ran successfully in Supabase
- Check RLS policies are enabled
- Make sure you're authenticated when testing

### "Environment variable validation failed"
- Check `web/.env.local` has all required vars
- Restart Next.js dev server after changing env

## 📚 Additional Resources

- **Supabase Dashboard**: https://app.supabase.com/project/deknauqkqqzwuvopqott
- **GitHub Repo**: https://github.com/dikondaashish/TrackmyOPT
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

## 🎯 What to Build Next

1. **Dashboard Page** - Display OPT countdown and timeline
2. **Settings Page** - Let users update their OPT dates
3. **Extension Auth Flow** - Connect extension to web auth
4. **Extension Popup** - Show countdown in extension
5. **Notifications** - Remind users of upcoming deadlines

## 🚢 Deployment (Later)

### Web App → Vercel
```bash
vercel deploy
# Set environment variables in Vercel dashboard
```

### Extension → Chrome Web Store
- Package `extension/dist/` as zip
- Submit to Chrome Web Store
- Follow Chrome's review process

---

**Need Help?**
- Check `web/supabase/README.md` for database help
- Check `extension/README.md` for extension help
- Check root `README.md` for general info

