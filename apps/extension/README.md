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
plus the dedicated Chrome Job Prefill page at `/dashboard/extension`. The
extension popup and in-page assistant both link directly to this page. Supported
empty fields include name, job-application email, phone, country, street
address, city, state, ZIP/postal code, county/district, LinkedIn, GitHub,
website, contact, experience, education, and optional skills fields. The
extension may attach a generated resume and reviewed cover letter only to
eligible empty PDF inputs.
Review-required AI screening drafts are limited to non-sensitive questions.

### Which resume belongs to which page

A tailored resume is bound to the posting it was generated for. Identity is
resolved by `src/ats-job-identity.ts`, which reduces both the posting URL and
the apply URL to `{platform, tenant, jobId}` so clicking Apply does not look
like a different job. Dedicated rules cover Workday, iCIMS, Greenhouse (both
board hosts plus `gh_jid` embeds), Lever, Ashby, Workable, SmartRecruiters,
Jobvite, Recruitee, Teamtailor, Breezy, Pinpoint, Personio, Eightfold, JazzHR,
BambooHR, Dover, Comeet, Taleo, SuccessFactors, Oracle Cloud, and Avature. An
unrecognised board falls back to same-host comparison with any trailing apply
route removed. Company and role text is never used to match — scraped text
drifts, and a wrong match would attach another employer's resume.

Two stores back the artifact:

| Store | Lifetime | Purpose |
| --- | --- | --- |
| `chrome.storage.session` | 30 minutes, one active artifact | Fast path for the run in progress |
| `generated_resume_artifacts` (Postgres) | 30 days, per job, 50 per user | "Generate now, apply later", and any signed-in device |

The background worker writes to storage after a successful generation and reads
from it only when the session artifact does not cover the current page. A
restored artifact is re-validated against the page before use and is adopted
silently — it never broadcasts `GENERATED_RESUME_ARTIFACT_READY`, because the
page handler responds to that message by running a prefill, and reopening an
old job page must not fill an application on its own.

### Where the assistant is allowed to appear

Three gates, cheapest first:

1. **Manifest match** — the content script loads. The list is broad on purpose
   (`*://*/careers`, `*://*/apply`, `*://*/join-us`, …) because employer career
   pages use every one of those paths.
2. **`shouldUseFullJobAssistMode()`** — decides observer strategy only.
3. **`getJobInfo()` evidence gate** — decides whether a widget may mount.

The third gate exists because the first two are URL-shaped, and a URL cannot
tell a job posting from a university admissions page, a credit-card
application, or a loan application — `/apply` and `/application` match all of
them. The weakest parsers accept almost anything (`getDomFallbackJob` takes any
`<h1>` plus the domain name), so on an unknown host with no `JobPosting`
structured data the page must corroborate itself through
`hasJobPostingEvidence()`: at least one employment-specific signal
(responsibilities, full-time, salary range, equal-opportunity employer) plus a
second independent category. "Requirements" and "Apply now" together describe a
university application just as well as a job, so they are not sufficient alone.

Known job boards and ATS hosts, and any page carrying `JobPosting` structured
data, skip the check entirely. When the gate declines, the popup's "Add this job
to tracker" still injects on demand via `activeTab`.

`tests/job-posting-evidence.test.ts` holds the corpus, including the non-job
pages that previously mounted a widget.

### Dropdown selection

Native `<select>` and custom comboboxes share one matcher
(`chooseSmartDropdownOption` in `src/smart-dropdown.ts`). They used to have
separate rules and the `<select>` path was weaker, so a country list offering
"United States of America" never matched a profile holding "United States".

Matching is still equality, never fuzz — but it compares against
deterministically derived *pieces* of an option label, because one answer is
rendered many ways:

| Rendering | Handled by |
| --- | --- |
| `United States of America`, `USA`, `US` | country canonicalization |
| `United States (US)`, `🇺🇸 United States` | parenthetical strip, punctuation normalize |
| `US-CA — California` | separator segments |
| `+1`, `US +1`, `United States (+1)` | `phoneCountryCode` + `src/phone-country-codes.ts` |
| `New York, NY, United States` | ordered leading-segment run (places only) |

Guards, all covered by `tests/dropdown-option-shapes.test.ts`:

- two options reaching the same score select **nothing** — "Portland, OR" and
  "Portland, ME" are ambiguous for a profile holding only "Portland";
- a mid-string substring never matches, so "York" cannot select "New York";
- for places, only a *leading* run of comma segments counts, so the country tail
  of "New York, NY, United States" cannot match a country value;
- dial codes are matched longest-first, so `+1` never selects `+1809`.

The dial code comes from the applicant's phone number when it carries one, and
from their country otherwise — an Indian number stored by someone living in the
US still selects `+91`. The applicant's country only breaks ties between options
sharing a code (`+1` is both the US and Canada); it never vetoes one.

Two field kinds exist purely to stop mis-targeting: `phoneCountryCode` and
`phoneDeviceType`. Both label as "phone", so before they existed the dial-code
and device-type selects received the full phone number and matched nothing.

**Documented assumption:** `phoneDeviceType` fills "Mobile". The profile stores
one personal number given for recruiting, and "Mobile" is the only value in a
Home/Mobile/Work/Fax list that describes it. It is non-sensitive and visibly
highlighted, so it is one click to correct. Nothing else in prefill assumes a
value the user did not supply.

Sensitive dropdowns — veteran status, disability, gender, race/ethnicity, visa,
sponsorship, work authorization, clearance, compensation, DOB, SSN — are
**never** classified for ordinary prefill regardless of their options. They are
answerable only through the reviewed private-answer flow, which requires
explicit per-application confirmation.

### Telling the user what will happen

`src/resume-status-row.ts` owns both the status row above the Prefill button and
the copy for every Prefill control. There are three ways to start a prefill —
the in-page widget, the toolbar popup, and Continuous mode — and they must not
describe the same action differently.

| State | Row reads | Prefill control reads |
| --- | --- | --- |
| `checking` | Checking for a tailored resume… | Prefill this application |
| `none` | No tailored resume for this job | Prefill this application |
| `ready` | Tailored resume ready | Prefill application + resume |
| `attached` | Resume attached to this application | Prefill application + resume |

`attached` is set from the engine's own count of resume fields it filled, not
from whether a resume was available — a resume can resolve for the posting and
still not attach when the upload control is on a later step. An `attached` row
is never downgraded by a later availability re-check.

Two constraints the tests enforce: sublabels stay ≤36 characters so they do not
wrap in the 320px widget, and both text lines in the row take the tone colour
rather than `--tmo-widget-muted`, which measures 4.32:1 on the neutral surface —
below the 4.5:1 AA floor at this size. Worst measured contrast across all
states in both themes is 6.81:1.

Plan access is intentionally separate from rollout flags:

| Capability | Free | Pro / legacy Dedicated |
| --- | --- | --- |
| Manual Step-by-step prefill, history, skills, private-answer review | Included | Included |
| Continuous filling | Upgrade required | Included |
| Guided Autopilot | Upgrade required | Included |
| AI screening drafts | 5/month | Shared 25/day safety cap |
| AI cover letters | 1/month | Shared 25/day safety cap |

All AI allowances are enforced atomically on the server. Extension controls
also fail closed to Free access when plan status cannot be verified.

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
- use only one user-approved default job-portal credential across third-party
  portal hostnames; never use it on a TrackMyOPT page, in a password-change,
  security-answer, financial, SSN, DOB, authentication-code, OTP, MFA, PIN, or
  uncertain password-type field, or in a child-frame relay; the password stays
  masked in the review panel and exists only in isolated extension memory
  during the approved fill;
- never click Login, Continue, Next, Create Account, or Submit as part of
  credential filling;
- never click Add another, Review, Submit, Apply, Finish, or another final
  action; Guided Autopilot alone may click exact allowlisted non-submit
  Next/Continue/Done controls;
- never place resume, question, answer, employer, school, title, URL, hash, or
  PDF content in analytics or `chrome.storage.sync`.

## Chrome Web Store release checklist

### Code and packaging

- [x] Package and manifest versions match at `0.1.19`.
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
read directly. Job-portal login credentials are never included in the
child-frame payload. The engine still refuses final-action clicks, unapproved
sensitive fields, non-empty fields, and existing files.

- [x] Put this exact purpose in the Web Store permission/use justification.
- [x] Confirm the submitted manifest contains no permission added solely for
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

Chrome Web Store packaging, listing changes, and submission require explicit
owner authorization. Version `0.1.19` has authorization for draft preparation;
final submission remains gated by the manual release checks above.

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
