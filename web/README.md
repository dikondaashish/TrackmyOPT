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

## 📄 License

MIT

