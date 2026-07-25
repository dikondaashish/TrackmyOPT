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
│   └── config.ts        # Configuration (website URL)
├── public/
│   ├── popup.html       # Popup shell (copied to dist/)
│   ├── popup.css
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
- **Account-backed data**: Loads TrackMyOPT account data after sign-in
- **Safe job application prefill**: Fills eligible empty fields and can attach
  the active job-scoped generated resume without navigating or submitting
- **Job Tracker Capture**: Add jobs from supported job portals into TrackMyOPT

## 🌍 Job Capture Compatibility

Job capture works on common job boards and many company career pages. Avoid listing long keyword-style inventories in public-facing metadata (Chrome Web Store description) to stay compliant with Chrome Web Store policies.

## 🔐 Authentication Flow

1. User clicks "Sign In or Create Account"
2. Extension opens web auth flow via `chrome.identity.launchWebAuthFlow`
3. User authenticates on your website
4. Website redirects back with JWT token in URL fragment
5. Extension stores short-lived token material in device-local storage, never
   browser sync storage
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

## Job-scoped autofill release scope (`0.1.14`)

Step-by-step and Continuous prefill use the active generated resume artifact
plus the dedicated job-portal profile from Settings → Extension. Supported
empty fields include name, job-application email, phone, country, street
address, city, state, ZIP/postal code, county/district, LinkedIn, GitHub,
website, contact, experience, education, and optional skills fields. The
extension may attach a generated resume and reviewed cover letter only to
eligible empty PDF inputs. The artifact expires after 30 minutes and is
invalidated when the normalized job URL, company, or role changes.
Review-required AI screening drafts are limited to non-sensitive questions.

Safe-default feature flags live in `src/autofill-feature-flags.ts`:

| Flag | Default | Release behavior |
| --- | --- | --- |
| `artifactPrefill` | on | Active artifact and profile prefill |
| `historyFields` | on | Experience and education fields |
| `atsAdapters` | on | Conservative Workday/Greenhouse adapters |
| `skills` | on | User may opt in to dedicated skills fields |
| `continuousMode` | on | User may opt in to fill newly loaded steps |
| `aiScreeningDrafts` | on | Explicit, review-required grounded drafts |
| `coverLetter` | on | Explicit AI draft plus real PDF compilation |
| `guidedAutopilot` | on | User may opt in to allowlisted navigation |

Every mode keeps the same hard boundaries:

- never use a historical or merely latest resume as fallback;
- never overwrite a non-empty field, existing tag, or existing file;
- never guess visa, sponsorship, work-authorization, work preferences, EEO,
  compensation, DOB, citizenship, veteran, disability, clearance, or SSN
  answers; optional saved private answers are encrypted, loaded only into the
  review panel, and become usable only after explicit confirmation for the
  current application;
- never click Add another, Review, Submit, Apply, Finish, or another final
  action; Guided Autopilot alone may click exact allowlisted non-submit
  Next/Continue/Done controls;
- never place resume, question, answer, employer, school, title, URL, hash, or
  PDF content in analytics or `chrome.storage.sync`.

## Chrome Web Store release checklist

### Code and packaging

- [x] Package and manifest versions match at `0.1.14`.
- [x] Production is the default target in `src/config.ts`; localhost requires
  the explicit `EXT_TARGET=local` build.
- [x] Run the complete web, extension, and API test suites.
- [x] Run web, extension, and API `tsc --noEmit`.
- [x] Run `pnpm --dir apps/extension build` and inspect `dist/manifest.json`.
- [x] Confirm no generated resume, PDF, snapshot, question, answer, cover
  letter, or token is written to `chrome.storage.sync`.
- [ ] Load the production build into a fresh Chrome profile; test sign-in,
  refresh, sign-out, extension restart, and browser restart.
- [ ] Verify icons, popup, job widget, dashboard links, and console output.

### Manual Workday and Greenhouse matrix

Use sanitized internal accounts and fixtures. Do not use a real application or
click Submit.

| Platform | Scenario | Expected result | Complete |
| --- | --- | --- | --- |
| Workday | Explicit prefill with a fresh matching artifact | Empty contact/history fields fill; empty Resume/CV accepts the matching PDF | [ ] |
| Workday | Existing field values and resume upload | All existing values/files remain unchanged | [ ] |
| Workday | Multi-record history | Visible records keep company/title/date boundaries; no Add another click | [ ] |
| Workday | Manager/referral-company and sensitive questions | Manager/referral traps stay blank; only exact reviewed private answers fill eligible empty sensitive controls | [ ] |
| Workday | 30-minute expiry or URL/company/role change | Artifact is rejected; profile-only/regenerate guidance appears | [ ] |
| Greenhouse | Explicit prefill with a fresh matching artifact | Empty native contact/history fields fill; empty Resume/CV accepts the PDF | [ ] |
| Greenhouse | Custom dropdown, tag editor, existing file/value | Unsupported or populated controls stay unchanged | [ ] |
| Greenhouse | Sensitive screening and EEO fields | AI never receives them; only exact answers approved for this application may fill | [ ] |
| Both | Continuous mode default | Available but off in user preferences until explicitly selected | [ ] |
| Both | Guided navigation | Non-submit Next/Continue/Done may advance; Review/Submit/Apply/Finish and submit-typed navigation are blocked | [ ] |

### Privacy and support verification

- [ ] Owner/legal reviews the autofill disclosure in
  `apps/web/lib/legal/legal-config.ts`; policy version/effective date is changed
  only with explicit approval.
- [x] `/privacy` describes the 30-minute artifact, empty-only behavior,
  sensitive-field exclusions, storage boundary, and content-free telemetry.
- [x] `/dashboard/help` describes Continuous, Guided Autopilot, skills, AI
  drafts/answer reuse, cover letters, review-required private answers, and the
  never-submit boundary.
- [x] Support can map the content-free error codes `extraction_failed`,
  `unsupported_control`, `draft_review_pending`, and `attachment_failed`.
- [x] PostHog receives only allowlisted enums, booleans, and bounded counts.

### Frame access review justification

The job-portal content script uses `all_frames: true` and
`match_about_blank: true` because Workday, Greenhouse, and employer-hosted
application forms can render upload or application controls in child or
`about:blank` frames. This adds no Chrome permission. A child frame receives an
already-resolved, bounded payload only during an explicit Step-by-step run (or
a separately enabled Continuous run); inaccessible cross-origin DOM is not
read directly. The engine still refuses host-page button clicks, sensitive
fields, non-empty fields, and existing files.

- [ ] Put this exact purpose in the Web Store permission/use justification.
- [ ] Confirm the submitted manifest contains no permission added solely for
  frame traversal.
- [x] Verify child-frame relay size/schema validation and no persistent payload
  storage.

### Rollout and rollback

1. Release to internal testers first with the default flag matrix above.
2. Validate the manual Workday/Greenhouse matrix and content-free event schema.
3. Expand only after error and skip counts are understood.
4. If deterministic prefill causes regressions, publish an emergency build with
   `artifactPrefill`, `historyFields`, or `atsAdapters` disabled independently;
   profile-only prefill remains available.
5. Disable `aiScreeningDrafts`, `coverLetter`, or `guidedAutopilot`
   independently if production validation reveals a regression.

Chrome Web Store packaging, upload, listing changes, and staged-channel
submission remain owner actions and are intentionally not performed by Codex.

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
