# TrackMyOPT

A monorepo containing the TrackMyOPT web application and Chrome extension for tracking OPT timelines with precision.

## 📁 Project Structure

```
TrackMyOPT/
├── web/                    # Next.js 14 web application
│   ├── app/               # App Router pages and layouts
│   ├── public/            # Static assets
│   └── package.json
├── extension/             # Chrome Manifest V3 extension
│   ├── src/               # TypeScript source files
│   ├── public/            # Extension assets (icons, etc.)
│   ├── manifest.json      # Extension manifest
│   └── package.json
├── package.json           # Root workspace configuration
└── pnpm-workspace.yaml    # pnpm workspace definition
```

## 🚀 Complete Setup Guide

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- Chrome browser
- [Supabase account](https://supabase.com) (free tier works)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Navigate to **Authentication → Providers**
3. Enable **Google** provider (optional but recommended)
4. Go to **Project Settings → API**
5. Copy the following credentials:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys → service_role** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 2: Set Up Environment Variables

#### For Local Development

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only (not exposed to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Signing Secret (generate with: openssl rand -base64 32)
JWT_SIGNING_SECRET=your-randomly-generated-secret-here

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### For Vercel Deployment

Set the same environment variables in **Vercel Dashboard → Project Settings → Environment Variables**

### Step 3: Run Database Schema

1. Open Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy contents from `web/supabase/migrations/001_initial_schema.sql`
4. Paste and **Run** the query
5. Verify tables created in **Table Editor**:
   - ✅ `profiles`
   - ✅ `opt_status`
   - ✅ `employment_spans`

### Step 4: Install Dependencies

```bash
# From project root
pnpm install
```

### Step 5: Start Web App

```bash
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000) - you should see the landing page!

### Step 6: Build & Load Extension

In a **new terminal** window:

```bash
pnpm dev:ext
# Or for one-time build: pnpm build:ext
```

#### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right corner)
3. Click **Load unpacked**
4. Select the `extension/dist` directory
5. ✅ Extension loaded!

#### Copy Extension ID

After loading, you'll see something like:
```
ID: abcdefghijklmnopqrstuvwxyz123456
```

**Important:** Copy this Extension ID! You'll need it for:
- OAuth redirect URI whitelisting
- Production configuration

The redirect URI format is:
```
https://<EXTENSION_ID>.chromiumapp.org/oauth2
```

### Step 7: Test the Flow

1. Click the **OPT Hub** extension icon in Chrome
2. Click "Sign in or create account"
3. Choose **Google** or **Manual** authentication
4. Complete the flow
5. ✅ You should see your OPT data in the extension popup!

## 🚀 Quick Start (After Initial Setup)

```bash
# Terminal 1: Web app
pnpm dev:web

# Terminal 2: Extension (if making changes)
pnpm dev:ext
```

Then open:
- Web app: http://localhost:3000
- Extension: Click icon in Chrome toolbar

## 📦 Available Commands

### Web Application

```bash
# Start Next.js development server (http://localhost:3000)
pnpm dev:web

# Build Next.js for production
pnpm build:web
```

### Chrome Extension

```bash
# Watch mode - rebuilds extension on file changes
pnpm dev:ext

# Build extension for production
pnpm build:ext
```

### Other Commands

```bash
# Format all files with Prettier
pnpm format

# Check formatting without modifying files
pnpm format:check
```

## 📖 Key Features

### Web App
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for authentication & database
- **Google OAuth** and manual sign-up
- **JWT token generation** for extension auth
- **Row Level Security** on all database tables

### Pages
- `/` - Marketing landing page with features
- `/auth/extension` - Authentication for extension (Google + Manual)
- `/auth/extension/callback` - OAuth callback with JWT minting
- `/api/me` - Get user profile and OPT status
- `/api/manual/signup` - Manual user registration
- `/api/manual/login` - Manual user login

### Chrome Extension
- **OAuth authentication** flow with web app
- **Real-time countdown** of OPT days remaining
- **OPT status display** with all dates
- **Secure token storage** with `chrome.storage.sync`
- **Beautiful popup UI** with gradient design

## 🛠️ Tech Stack

### Web App (`web/`)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth)
- **JWT:** jose (HS256)
- **Validation:** Zod
- **Linting:** ESLint

### Extension (`extension/`)
- **Manifest:** Chrome Manifest V3
- **Language:** TypeScript
- **Build Tool:** esbuild
- **Runtime:** Chrome Extension APIs

## 📝 Development Notes

### Working with the Monorepo

This project uses pnpm workspaces to manage multiple packages. Each package (`web/` and `extension/`) has its own `package.json` and can be worked on independently.

### Adding Dependencies

```bash
# Add to web app
pnpm --filter web add <package-name>

# Add to extension
pnpm --filter extension add <package-name>

# Add to root (for tools like prettier)
pnpm add -w <package-name>
```

### Extension Icons

Place your extension icons in `extension/public/icons/`:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `pnpm format` to format code
4. Test both web and extension
5. Submit a pull request

## 📄 License

MIT

