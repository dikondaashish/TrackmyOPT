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
matched separately against the user's saved private answers when they click
**Prefill this application**; there is no separate approval button. Unknown or
ambiguous answers and unsupported fields (including SSN) remain untouched.
Private answers are fetched on each manual click, stay in memory, and may be
reused by Continuous only within that application after the click. Opening a
page or the Private answers explanation does not fetch them. Portal credentials
use a separate credential-only request on the same explicit Prefill click.
Users review the form before continuing or submitting.

#### Login and create-account prefill

`portal-login-prefill.ts` runs from the popup and sidebar manual Prefill paths.
It fills saved email, password, and confirmation on supported HTTPS top-level
career/ATS pages, without a second approval panel. Credentials are not fetched
on page load, by Continuous, or by resume-ready automatic filling. Child-frame
credential requests are denied and credentials never join answer/frame payloads.
Unknown portals must show career URL or applicant/candidate heading evidence.
Different existing email/password values, reset/change forms, hidden/disabled
controls, uncertain password fields, TrackMyOPT pages, insecure pages, and
cross-origin form actions are skipped. Navigation, form replacement, Escape,
and expired requests cancel delivery. Guided navigation stops on password forms.
This is broad DOM-based support, not certification of every portal. Embedded
login frames, SSO, email-only login steps, CAPTCHA and OTP still need manual use.

### Telling the user what will happen

#### Sidebar stability and portal compatibility

The sidebar reconciles same-job posting/application routes in place, enriches
late metadata without replacing tool controls, and briefly tolerates an empty
SPA scrape. Async refreshes cannot restore an older job after navigation.
Extension-owned mutations are ignored by the page observer; removal of the
sidebar by the host page still triggers recovery. Busy Prefill/tool opening is
protected on the same job, while a genuinely different job replaces stale tools.

Tool opening is single-flight with bounded waits. Analysis and resume chooser
dialogs use the top layer, close on observed URL changes, and ignore stale
responses. Prefill failures show retry guidance; saved private answers remain
included only through the explicit Prefill workflow. No action submits a form.

`sidebar-stability.test.ts` and `sidebar-reconcile.test.ts` cover race conditions,
timeouts, focus semantics, retained DOM/scroll state and posting-to-apply URL
pairs for Lever, Greenhouse, Workday, Ashby, Workable, iCIMS and SmartRecruiters.
These are synthetic compatibility checks, not certification of every live ATS.
Run `node scripts/preview-sidebar-tools.mjs` for Chrome QA with the real sidebar
and fill engine, synthetic profile/private answers and simulated service replies.
Live AI/PDF service availability and employer-specific custom controls still
require release testing; this fixture does not spend credits or submit data.

#### Smart answers on explicit Prefill

Both the sidebar and popup Prefill actions now run `src/smart-answers.ts` after
profile/private fields. Eligible empty, visible text questions first look for
an exact saved user answer. Company/role-specific answers are not automatically
reused across employers. New questions use the existing screening AI endpoint,
the current job description, and a valid job-scoped generated resume snapshot.
Without a resume, saved answers still work; new drafts show manual-input guidance.

- The button click starts drafting and insertion, without extra Generate/Insert
  clicks. Each result is labeled `AI draft · Review` or `Saved answer · Review`.
- `Remember my answer` explicitly saves the current field text for reuse. AI
  drafts are not silently saved. Guided navigation pauses at pending/unreviewed
  smart answers; the user can navigate manually after checking them.
- No background generation on page load, Continuous, or resume-ready events.
  Smart answers currently run in the owning document, not inside child frames
  or shadow-root application controls. The existing profile frame relay is unchanged.
- Up to eight eligible questions per click, serial requests, existing server
  quotas, 45-second UI timeout, and per-field attempt deduplication prevent
  repeated charges on the same mounted form. A timed-out server request may
  still consume quota. Reload or a new form allows retry.
- Guard every async response against navigation, changed question text,
  disabled/hidden/removed controls, user input, and character limits. Sensitive
  questions, passwords, and unknown personal preferences are never sent to AI.
- Additional tool-name evidence checks reject unsupported technologies (including
  dbt/Snowflake) in the extension and server. These are conservative heuristics,
  not proof that every claim is true; applicants must review all generated text.
- The stronger server prompt/grounding changes require a web deployment. Local
  fixture QA uses synthetic responses and does not verify a live provider.

QA: `node scripts/preview-smart-answers.mjs` runs the actual controller with fake
responses and in-memory sample answer storage; no personal data or AI credits.

Privacy/support source copy now explains one-click private answers and AI drafts
on explicit Prefill. Owner/legal publication review remains pending; this local
change does not publish a policy update. Follow the release gate in
`../../docs/compliance/EXTENSION_PRIVACY_RELEASE_REVIEW.md`.

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
| Manual Step-by-step prefill, history, skills, saved private answers | Included | Included |
| Continuous filling | Upgrade required | Included |
| Guided Autopilot | Upgrade required | Included |
| AI screening drafts | 2/month | Shared 100/month, 25/day safety cap |
| AI cover letters | 1/month | Shared 100/month, 25/day safety cap |

All AI allowances are enforced atomically on the server. Extension controls
also fail closed to Free access when plan status cannot be verified.
Allowance source: `apps/web/lib/pricing/plan-config.ts` (repository root).

Safe-default feature flags live in `src/autofill-feature-flags.ts`:

| Flag | Default | Release behavior |
| --- | --- | --- |
| `artifactPrefill` | on | Active artifact and profile prefill |
| `historyFields` | on | Experience and education fields |
| `atsAdapters` | on | Scoped Workday, Greenhouse, Lever, SmartRecruiters, and Ashby adapters; see the [verification record](../../docs/EXTENSION_PORTAL_COMPATIBILITY.md) for tested limits |
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
  answers; optional saved private answers are encrypted and loaded when the
  user clicks Prefill this application, without a separate approval panel.
  Matching empty fields can fill, including supported application frames;
  enabled Continuous mode may reuse these answers within the same application.
  Review all filled answers before submitting;
- use only one user-approved default job-portal credential across third-party
  portal hostnames; never use it on a TrackMyOPT page, in a password-change,
  security-answer, financial, SSN, DOB, authentication-code, OTP, MFA, PIN, or
  uncertain password-type field, or in a child-frame relay; credentials are
  requested only by an explicit Prefill click and are never displayed in status
  messages. The employer page can read them once filled;
- never click Login, Continue, Next, Create Account, or Submit as part of
  credential filling;
- never click Add another, Review, Submit, Apply, Finish, or another final
  action; Guided Autopilot alone may click exact allowlisted non-submit
  Next/Continue/Done controls;
- never place resume, question, answer, employer, school, title, URL, hash, or
  PDF content in analytics or `chrome.storage.sync`.

## OPT tool regression verification

Run `pnpm --dir apps/extension test` for unit and DOM regression tests, and
`pnpm --dir apps/extension test:opt-browser` for isolated headless Google Chrome
form tests (Chrome must be installed; override the Playwright channel with
`OPT_TEST_BROWSER`). The browser suite blocks external requests and mocks Chrome
storage/auth and API responses; it never changes a real account.

Coverage includes digit-by-digit date entry, invalid leap dates, field-scoped
saves after failed loads, save failures, navigation during save, delayed autosave,
Modify returning to the same tool, STEM recommendation deadlines, expired and
unopened windows, and sign-out cleanup. Browser flows run in New York, Los Angeles,
Kolkata, and UTC. These checks do **not** replace loaded-extension authentication,
service-worker, restart, or live API release checks below.

STEM filing uses the earlier of EAD expiration and 60 days after the STEM DSO
recommendation. Without that recommendation date the UI labels the result an
estimate. The STEM recommendation is saved separately as
`opt_status.stem_dso_recommendation_date` through `/api/opt/calculator`.
The extension, dashboard STEM tool, OPT Dates form, and reminder emails use it.
Clearing the field explicitly saves `null`; initial OPT recommendations remain
unchanged. Reopening a STEM countdown reloads server dates instead of trusting
its cached snapshot. Failed loads/saves do not silently clear saved dates.
Missing recommendations remain EAD-only estimates. Daily reminders and enrollment
emails distinguish the effective filing deadline from EAD expiry; passed
recommendation deadlines ask the user to consult their DSO.
Requires database migration `20260922140251_add_stem_dso_recommendation_date.sql`
and coordinated web/extension publication; local source changes alone are not a
published release.
Countdowns are local calendar-day estimates, not guarantees of USCIS receipt time.
Rule reference: [USCIS I-765 instructions](https://www.uscis.gov/sites/default/files/document/forms/i-765instr-feerule.pdf).

## Chrome Web Store release checklist

### First-install product tour

`tour.html` is packaged with the extension. A new install records pending
onboarding in local storage. The first successful extension sign-in/token save
opens the tour; token refreshes, later sign-ins, and updates do not relaunch it.
Closing the tab does not repeatedly interrupt the user. The popup's **Product
tour** button explicitly restarts the tour and reuses its open tab if present.

Seven sections cover profile setup, interactive Prefill, a prepared tailored
resume and AI explanation, a practice tracker, OPT tools, STEM tools, and links
to real setup/case status/help. A non-modal spotlight highlights one feature
per section with a short coach mark and consistent **Back / Next / Skip**
controls. Clicking Next alone completes the tour; demo actions are optional.
The coach follows scrolling/resizing, docks on narrow screens, and cleans up
on Skip/Finish. Highlighted controls remain usable. Skip, Back, section navigation, progress resume,
keyboard focus, reduced motion, and light/dark themes are supported. Completion
and dismissal are installation-scoped, not tied to an account identifier.

The Prefill example calls the production contact engine with fictional data.
Other demonstrations are labeled samples, not real generation or legal
calculations. The page's CSP blocks network connections and form submissions.
Demo controls never fetch private answers, create a resume, spend AI credits,
write a tracker entry, or submit an application. Only bounded chapter/status
progress is saved; setup links leave the demo and open the real dashboard.

Local preview: run `npm run build` then `node scripts/preview-tour.mjs` from
`apps/extension`. Open `http://127.0.0.1:59765/tour.html`; `/responsive` contains
a 390px dark-theme iframe. Preview mode does not persist progress. Automated
tests exercise packaged progress, the worker's install/token trigger, and
sender restrictions. Before Store release, also verify a fresh-profile install,
real sign-in, browser restart, Skip, and replay on the packaged extension.

### Code and packaging

- [x] Package and manifest versions match at `0.2.0`.
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
| Workday | Manager/referral-company and sensitive questions | Manager/referral traps stay blank; Prefill fills eligible empty sensitive controls from matching saved answers without a separate approval | [ ] |
| Workday | 30-minute expiry or URL/company/role change | Artifact is rejected; profile-only/regenerate guidance appears | [ ] |
| Greenhouse | Explicit prefill with a fresh matching artifact | Empty native contact/history fields fill; empty Resume/CV accepts the PDF | [ ] |
| Greenhouse | Custom dropdown, tag editor, existing file/value | Unsupported or populated controls stay unchanged | [ ] |
| Greenhouse | Sensitive screening and EEO fields | AI never receives them; an explicit Prefill click loads matching saved private answers | [ ] |
| Both | Continuous mode default | Available but off in user preferences until explicitly selected | [ ] |
| Both | Guided navigation | Non-submit Next/Continue/Done may advance; Review/Submit/Apply/Finish and submit-typed navigation are blocked | [ ] |

### Privacy and support verification

- [ ] Owner/legal reviews the autofill disclosure in
  `apps/web/lib/legal/legal-config.ts`; policy version/effective date is changed
  only with explicit approval.
- [x] `/privacy` describes the 30-minute artifact, empty-only behavior,
  sensitive-field exclusions, storage boundary, and content-free telemetry.
- [ ] `/dashboard/help` matches Continuous, Guided Autopilot, skills, AI
  drafts/answer reuse, cover letters, one-click saved private answers, and the
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
owner authorization. The current `0.2.0` build remains gated by the manual
release checks above and explicit owner authorization for draft preparation.

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

## Undo last Prefill

The application sidebar includes **Undo last Prefill**. A compact page control
also appears after popup-initiated prefill when no sidebar is present.

- Records only extension-owned writes from the latest run, including profile,
  saved private answers, portal login, skills/history, and smart-answer text.
  No form snapshots, credentials, or answers are sent to the undo backend or
  written to browser storage; the journal exists only in the page's isolated
  extension context and is lost on reload/navigation.
- Preserves subsequent edits, even if the user changes a value back to the
  extension-filled value. Changed field identities, replaced/removed elements,
  disabled/read-only controls, and another page URL are skipped.
- Supports native text fields, selects, checkboxes, and atomic radio groups.
  Native choices are conservatively kept when changing them could reset other
  user-entered fields in the same form. Arbitrary custom dropdowns and uploaded
  files require manual review: Undo does not delete a file already uploaded to
  a portal or reverse server-side actions.
- Pauses Continuous and Guided Autopilot before undo. Opaque run IDs bind
  embedded-frame rollback to the same prefill; undo requests can target only
  the requesting top frame's own tab. Stale/cancelled frame fills are rejected.
- Single-use, not a multi-level undo stack. A new changed run replaces the old
  journal. The UI reports restored, protected/skipped, and unsupported changes
  instead of claiming all fields were reverted.

Verification: `pnpm --dir apps/extension test`, `typecheck`, `build`, and
`pnpm --dir apps/extension test:undo-browser`. The browser fixture runs the real
profile/private fill engine on synthetic local forms at desktop/mobile sizes;
it does not submit applications or exercise production authentication. Before
publishing, smoke-test the reloaded extension on supported portals, including
embedded forms and live framework-controlled dependent dropdowns.

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
