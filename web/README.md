# TrackMyOPT Web App

Next.js 14 web application for TrackMyOPT - manage your OPT timeline from the web.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your actual values

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
web/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles
│   └── auth/
│       ├── extension/     # Extension auth flow
│       └── callback/      # OAuth callback handler
├── lib/                   # Shared utilities
│   ├── env.ts            # Environment validation (Zod)
│   ├── supabaseClient.ts # Supabase client
│   └── jwt.ts            # JWT minting/verification (jose)
└── public/               # Static assets
```

## 🔐 Environment Variables

Required environment variables (see `.env.local.example`):

### Public Variables (exposed to browser)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Server-Only Variables
- `JWT_SIGNING_SECRET` - Secret for signing JWTs (min 32 characters)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (optional)

Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **JWT**: jose library
- **Validation**: Zod

## 📚 Key Features

### Authentication Flow
1. **Landing Page** (`/`) - Marketing page with CTA
2. **Auth Page** (`/auth/extension`) - Unified sign in/sign up with tabs
3. **Callback Handler** (`/auth/callback`) - Handles email verification

### Extension Integration
The auth page supports extension OAuth flow via query parameters:
- `?redirect_uri=chrome-extension://...` - Extension callback URL
- `&state=random_state` - CSRF protection token

### Utilities

#### Environment Validation (`lib/env.ts`)
Validates all required environment variables at startup using Zod:
```typescript
import { env } from '@/lib/env';
console.log(env.NEXT_PUBLIC_SUPABASE_URL);
```

#### Supabase Client (`lib/supabaseClient.ts`)
Pre-configured Supabase client for client-side usage:
```typescript
import { supabase } from '@/lib/supabaseClient';
await supabase.auth.signIn({ email, password });
```

#### JWT Utilities (`lib/jwt.ts`)
Mint and verify short-lived JWTs for extension auth:
```typescript
import { mintToken, verifyToken } from '@/lib/jwt';

// Mint a token (5 min expiry)
const token = await mintToken({ userId, email });

// Verify a token
const payload = await verifyToken(token);
```

## 🎨 Design System

The app uses a clean, neutral color palette with Tailwind:

- **Primary**: Blue (`blue-600`)
- **Secondary**: Purple (`purple-600`)
- **Neutrals**: Slate shades
- **Spacing**: Consistent 8px grid
- **Typography**: System font stack (SF Pro on macOS)
- **Dark Mode**: Full support via Tailwind dark mode

## 🔒 Security

- Environment variables validated at startup
- Client/server env separation enforced
- JWT tokens are short-lived (5 min default)
- Supabase RLS policies recommended
- HTTPS required in production

## 📝 Development Notes

### Adding New Pages
1. Create `app/your-page/page.tsx`
2. Export default React component
3. Add to navigation if needed

### Adding API Routes
1. Create `app/api/your-route/route.ts`
2. Export GET, POST, etc. handler functions

### Styling Guidelines
- Use Tailwind utility classes
- Follow mobile-first approach
- Use `dark:` prefix for dark mode
- Maintain consistent spacing (4, 6, 8, 12, 16, 24...)

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables in Production
Make sure to set all required env vars in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Docker: Pass via `-e` flag or `.env` file

## 🧪 Local End-to-End Testing

Follow these steps to test the complete authentication flow locally:

### 1. Configure Environment Variables

Make sure `web/.env.local` has all required variables:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=OPT Hub

# Supabase Configuration (from your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Signing Secret (generate with: openssl rand -hex 64)
JWT_SIGNING_SECRET=your-generated-secret-here

# Google OAuth (from Supabase dashboard)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Generate a strong JWT secret:**
```bash
openssl rand -hex 64
```

### 2. Configure Supabase Authentication

#### Enable Google Provider

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Find **Google** and click to configure
3. Enable the provider
4. Add **Authorized redirect URLs**:
   ```
   http://localhost:3000/auth/extension/callback
   ```
5. For production, also add:
   ```
   https://your-production-domain.com/auth/extension/callback
   ```
6. Save changes

#### Configure URL Settings

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to:
   ```
   http://localhost:3000
   ```
3. For production, change to your production domain

#### Disable Email Confirmations (Development Only)

For faster development, disable email confirmations:

1. Go to **Supabase Dashboard → Authentication → Email Auth**
2. Find **Enable email confirmations**
3. **Toggle OFF** (for development only)
4. This allows manual signup to work immediately without email verification

⚠️ **Important:** Re-enable email confirmations in production!

### 3. Run Database Migration

1. Open **Supabase Dashboard → SQL Editor**
2. Click **New Query**
3. Copy contents from `web/supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Verify tables in **Table Editor**:
   - ✅ `profiles`
   - ✅ `opt_status`
   - ✅ `employment_spans`

### 4. Start Development Servers

```bash
# Terminal 1: Web app
pnpm dev:web

# Terminal 2: Extension
pnpm dev:ext
```

### 5. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `extension/dist` directory
5. Copy the **Extension ID** (e.g., `abcdefghij...`)

### 6. Test Google OAuth Flow

1. Click the **OPT Hub** extension icon
2. Click **"Sign in or create account"**
3. Browser opens to `http://localhost:3000/auth/extension?redirect_uri=...&state=...`
4. Click **"Continue with Google"** tab
5. Sign in with your Google account
6. Authorize the app
7. You'll be redirected back to `/auth/extension/callback`
8. Callback mints JWT and redirects to extension
9. Extension stores token and fetches `/api/me`
10. ✅ Extension popup shows "Sign in or create account" button (first time)

### 7. Test Manual Sign Up Flow

1. Click extension icon
2. Click **"Sign in or create account"**
3. Switch to **"Manual"** tab
4. Click **"Create Account"** sub-tab
5. Fill in the form:
   - First Name, Last Name
   - Email, Password
   - Program End Date (e.g., `05/15/2024`)
   - OPT EAD End Date (e.g., `05/15/2025`)
   - OPT Start Date (e.g., `06/01/2024`)
   - Optional: DSO Recommendation Date, STEM Start Date
   - Check "I'm STEM-eligible" if applicable
6. Click **"Create Account"**
7. Callback mints JWT and redirects to extension
8. ✅ Extension shows your OPT data!

### 8. Test Manual Sign In Flow

1. Click extension icon (if already signed in, sign out first)
2. Click **"Sign in or create account"**
3. Switch to **"Manual"** tab
4. Stay on **"Sign In"** sub-tab
5. Enter your email and password
6. Click **"Sign In"**
7. ✅ Extension shows your OPT data!

### 9. Verify Data in Supabase

Check that data was saved correctly:

1. Go to **Supabase Dashboard → Table Editor**
2. View `profiles` table - should see your user
3. View `opt_status` table - should see your OPT dates
4. All dates should be in `YYYY-MM-DD` format

### 10. Test API Endpoint

Test the `/api/me` endpoint directly:

```bash
# Get your JWT token from extension (inspect popup console)
# Or use the callback URL to capture it

curl http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "profile": {
    "timezone": "America/New_York",
    "is_stem_eligible": true
  },
  "status": {
    "program_end_date": "2024-05-15",
    "dso_recommendation_date": null,
    "opt_ead_end_date": "2025-05-15",
    "opt_start_date": "2024-06-01",
    "stem_start_date": null
  }
}
```

## 🎯 Troubleshooting

### Extension won't auth
- Check `redirect_uri` is whitelisted in Supabase
- Verify `NEXT_PUBLIC_SITE_URL` matches your dev server
- Check browser console for errors

### "Invalid token" error
- Token expires after 10 minutes
- Sign in again to get a new token

### Database insert fails
- Verify tables exist (run migration)
- Check RLS policies are enabled
- View Supabase logs for details

### Email confirmation required
- Disable in Supabase → Authentication → Email Auth
- Or check your email for confirmation link

## 📄 License

MIT

