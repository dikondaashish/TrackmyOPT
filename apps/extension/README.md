# TrackMyOPT Chrome Extension

Track your OPT timeline directly from your browser with real-time countdown and status updates.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd extension
pnpm install
```

### 2. Build the Extension

```bash
# Development build with watch mode
pnpm dev

# Or production build (one-time)
pnpm build
```

### 3. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right corner)
3. Click **Load unpacked**
4. Select the `extension/dist` directory
5. The TrackMyOPT extension should now appear in your extensions list

### 4. Note Your Extension ID

⚠️ **IMPORTANT**: After loading the extension, you'll see an **Extension ID** like:
```
abcdefghijklmnopqrstuvwxyz123456
```

**Copy this ID!** You'll need to:
1. Update `extension/src/config.ts` with your production website URL
2. Ensure your website allows the redirect URL: `https://<EXTENSION_ID>.chromiumapp.org/*`

## 📁 Project Structure

```
extension/
├── src/
│   ├── background.ts    # OAuth flow & message handling
│   ├── popup.ts         # Popup logic
│   ├── popup.html       # Popup UI
│   └── config.ts        # Configuration (website URL)
├── public/
│   └── icons/           # Extension icons (16, 48, 128)
├── dist/                # Built extension (load this in Chrome)
├── manifest.json        # Extension manifest (MV3)
├── esbuild.config.js    # Build configuration
├── package.json         # Dependencies & scripts
└── README.md            # This file
```

## 🔧 Development

### Watch Mode

Automatically rebuilds when you change files:

```bash
pnpm dev
```

After making changes:
1. Go to `chrome://extensions/`
2. Click the **refresh icon** on your extension
3. Reopen the popup to see changes

### Production Build

Build once for production:

```bash
pnpm build
```

## 🎯 Features

- **OAuth Authentication**: Secure sign-in flow with your web app
- **Real-time Countdown**: See days remaining in your OPT period
- **OPT Status Display**: View all your important dates at a glance
- **Dashboard Link**: Quick access to your web dashboard
- **Sync Across Devices**: Uses `chrome.storage.sync` for cross-device sync
- **Job Tracker Capture**: Add jobs from supported job portals into TrackMyOPT

## 🌍 Supported Job Portals (Capture)

- LinkedIn Jobs
- Indeed
- Greenhouse-hosted careers
- Lever-hosted careers
- Ashby-hosted careers
- Workday-hosted careers (`*.myworkdayjobs.com`)
- SmartRecruiters

## 🔐 Authentication Flow

1. User clicks "Sign In or Create Account"
2. Extension opens web auth flow via `chrome.identity.launchWebAuthFlow`
3. User authenticates on your website
4. Website redirects back with JWT token in URL fragment
5. Extension stores token securely in `chrome.storage.sync`
6. Extension uses token to call `/api/me` endpoint

## 🌐 Configuration

### Update Website URL

Edit `src/config.ts`:

```typescript
export const WEBSITE_URL = 'https://your-production-site.com';
```

### Update Manifest Permissions

Edit `manifest.json` to add your production domain:

```json
{
  "host_permissions": [
    "http://localhost:3000/*",
    "https://your-domain.com/*"
  ]
}
```

## 📝 Extension ID & Redirect URI

After loading the extension, Chrome assigns it a unique ID. This ID is used in the OAuth redirect URI:

**Format**: `https://<EXTENSION_ID>.chromiumapp.org/oauth2`

**Example**: `https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/oauth2`

### Finding Your Extension ID

1. Go to `chrome://extensions/`
2. Find "TrackMyOPT" in the list
3. Look for **ID:** under the extension name
4. Copy the long alphanumeric string

### Testing Locally

The extension works with `localhost:3000` by default. To test:

1. Start your web app: `pnpm dev:web`
2. Load the extension in Chrome
3. Click the extension icon
4. Click "Sign In or Create Account"
5. Complete authentication flow

## 🐛 Debugging

### View Extension Console

**Background Script:**
1. Go to `chrome://extensions/`
2. Find TrackMyOPT
3. Click "service worker" (blue link)
4. Console opens with background script logs

**Popup Script:**
1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup

### Common Issues

**"Failed to load extension"**
- Make sure you built the extension: `pnpm build`
- Check that `dist/` folder exists
- Verify all required files are in `dist/`

**"OAuth error" or "No response"**
- Check that web app is running
- Verify `WEBSITE_URL` in `config.ts` is correct
- Check `host_permissions` in `manifest.json`

**"Token expired"**
- Tokens expire after 10 minutes
- Sign in again to get a new token
- Consider implementing token refresh

**"Failed to fetch user data"**
- Check web app `/api/me` endpoint is working
- Verify token is being sent in Authorization header
- Check browser console for CORS errors

## 📦 Publishing

### Before Publishing to Chrome Web Store

1. Update version in `manifest.json`
2. Build for production: `pnpm build`
3. Test thoroughly in multiple scenarios
4. Update `WEBSITE_URL` to production domain
5. Add high-quality icons (128x128 required)
6. Prepare promotional images and description
7. Create a zip of the `dist/` folder
8. Submit to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

### Industry-Ready Notes

- Use least-privilege host permissions (only your domain + supported job portals).
- Avoid broad patterns such as `https://*/*` unless absolutely required.
- Keep permission descriptions in Web Store listing aligned with actual extension behavior.

### Production Checklist

- [ ] Update `src/config.ts` with production URL
- [ ] Update `manifest.json` host_permissions
- [ ] Test OAuth flow end-to-end
- [ ] Test on fresh Chrome profile
- [ ] Verify all icons display correctly
- [ ] Test sign in, data fetch, and sign out
- [ ] Check for console errors
- [ ] Verify data persists after browser restart

## 📚 Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [chrome.identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Publishing Extensions](https://developer.chrome.com/docs/webstore/publish/)

## 🧪 Complete Testing Flow

Follow these steps to test the entire authentication flow end-to-end:

### Step 1: Start the Web App

```bash
# From project root
pnpm dev:web
```

✅ Web app running at http://localhost:3000

### Step 2: Build the Extension

```bash
# From project root (in a new terminal)
pnpm dev:ext
```

✅ Extension built to `extension/dist` (watch mode)

### Step 3: Load Extension in Chrome

1. Open Chrome: `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select `extension/dist` directory
5. ✅ Extension loaded!

### Step 4: Start Authentication

1. Click the **TrackMyOPT** extension icon in Chrome toolbar
2. Click **"Sign in or create account"**
3. Browser opens to `http://localhost:3000/auth/extension?redirect_uri=...&state=...`

### Step 5: Choose Auth Method

#### Option A: Google OAuth

1. Click **"Google"** tab
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. Authorize the app
5. You'll see "Returning to Extension…" page (quick redirect)
6. ✅ Popup shows your OPT dates (if already saved)

#### Option B: Manual Sign Up

1. Click **"Manual"** tab
2. Click **"Create Account"** sub-tab
3. Fill in the form:
   - First Name, Last Name
   - Email, Password
   - **Program End Date**: `05/15/2024` (mm/dd/yyyy)
   - **OPT EAD End Date**: `05/15/2025` (mm/dd/yyyy)
   - **OPT Start Date**: `06/01/2024` (mm/dd/yyyy)
   - Optional: DSO Recommendation Date, STEM Start Date
   - Check "I'm STEM-eligible" if applicable
4. Click **"Create Account"**
5. You'll see "Returning to Extension…" page
6. ✅ Popup shows your saved OPT dates!

#### Option C: Manual Sign In

1. Click **"Manual"** tab
2. Stay on **"Sign In"** sub-tab
3. Enter your email and password
4. Click **"Sign In"**
5. ✅ Popup shows your OPT dates!

### Step 6: Verify Data

If popup shows "-" for dates:

1. Go to **Supabase Dashboard → Table Editor**
2. Check `opt_status` table
3. Verify your row exists with correct `user_id`
4. Check date format is `YYYY-MM-DD`
5. Fix any validation errors in the web form and retry

### Step 7: Copy Extension ID

⚠️ **IMPORTANT for Production:**

1. Go to `chrome://extensions/`
2. Find **TrackMyOPT**
3. Copy the **Extension ID** (e.g., `abcdefghij...`)
4. Save this for production deployment:
   - Redirect URI: `https://<EXTENSION_ID>.chromiumapp.org/*`
   - Add to Supabase → Authentication → Authorized Redirect URLs
   - Update `extension/src/config.ts` for production URL

### Expected Results

**When Signed In:**
```
TrackMyOPT
Signed in.

Program End: 2024-05-15
DSO Rec: -
OPT EAD End: 2025-05-15
OPT Start: 2024-06-01
STEM Start: -
```

**When Not Signed In:**
```
[Sign in or create account]
```

## 🆘 Support

For issues or questions:
1. Check the debugging section above
2. Review console logs (background & popup)
3. Verify website `/api/me` endpoint works
4. Check authentication flow in web app
5. Ensure dates are in MM/DD/YYYY format
6. Verify JWT token hasn't expired (10 min lifetime)

---

**Made with 💙 for international students tracking their OPT timeline**

