# TrackMyOPT — /dashboard Product & Engineering Spec

**Status:** Authoritative spec for MVP Dashboard  
**Audience:** Engineering (web + extension), Design, QA  
**Scope:** Web-only dashboard (protected); post-auth redirects from both extension and website; no anonymous access.  
**Version:** 1.0.0  
**Last Updated:** October 14, 2025

---

## 1) Purpose

Give signed-in users a clear, single place to:
- View their OPT/STEM status at a glance (filing windows, next deadline, unemployment clock).
- See/adjust the dates they provided at signup.
- Jump into calculators (OPT Apply Dates, STEM Apply Dates) and the Clock tracker.
- Manage reminders and profile basics.

The **/dashboard is protected**. Unauthenticated requests are redirected to the web sign-in flow. Anonymous users **must not** access any dashboard data.

### Key Product Goals

1. **Single Source of Truth:** Users manage all OPT data from one central location
2. **Visibility:** Critical dates and deadlines are immediately visible
3. **Control:** Users can edit their information and preferences
4. **Navigation Hub:** Jump to specialized tools (calculators, trackers)
5. **Security:** Zero access without authentication

---

## 2) Access Control & Redirect Rules (critical)

### 2.1 Route protection

- **Route:** `GET /dashboard`
- **Guard:** If `!supabase.session`, redirect to `/auth/extension?redirect=/dashboard`.
- **Rationale:** Unified login entry regardless of coming from extension or website.

**Implementation:**
```typescript
// web/app/dashboard/page.tsx (Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/extension?redirect=/dashboard');
  }
  
  // ... render dashboard
}
```

### 2.2 Post-auth redirect behavior (works for both origins)

**Inputs available on the auth pages:**
- `redirect_uri`: The Chrome extension redirect URI (if flow started from extension).
- `state`: CSRF token (opaque string).
- `redirect` (optional): Where the web should land after auth. Default: `/dashboard`.

**Rules:**

#### 1) **If the auth flow came from the extension** (presence of a valid `redirect_uri` for `*.chromiumapp.org`):

**Current Behavior (BROKEN):**
- User signs in → Redirects to `/auth/completing` → Redirects to extension URL → Tab closes
- **Problem:** User never sees the dashboard; web session is wasted

**New Behavior (FIXED):**
- User signs in → Redirects to `/auth/completing` with extension handshake
- `/auth/completing` does **TWO things simultaneously:**
  1. Redirects to `redirect_uri#id_token=...&state=...` (satisfies extension OAuth)
  2. After 500ms (giving extension time to capture token), navigates main tab to `/dashboard`

**Implementation Strategy:**
```typescript
// web/app/auth/completing/page.tsx
useEffect(() => {
  const token = searchParams.get('token');
  const state = searchParams.get('state');
  const redirectUri = searchParams.get('redirect_uri');
  const webRedirect = searchParams.get('redirect') || '/dashboard';

  if (token && state && redirectUri) {
    // Extension flow: Complete OAuth AND navigate to dashboard
    const extensionUrl = `${redirectUri}#id_token=${encodeURIComponent(token)}&state=${encodeURIComponent(state)}`;
    
    // Complete extension handshake
    window.location.replace(extensionUrl);
    
    // After extension captures token, navigate to dashboard
    setTimeout(() => {
      window.location.replace(webRedirect);
    }, 800); // Give extension time to close tab; if it doesn't, we navigate to dashboard
    
  } else if (token) {
    // Website-only flow: Go straight to dashboard
    window.location.replace(webRedirect);
  }
}, [searchParams]);
```

**Extension Background Script Update:**
```typescript
// extension/src/background.ts
// CHANGE: Don't close the tab immediately; let it redirect to dashboard
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, currentTab) => {
  // ... existing token capture logic ...
  
  await chrome.storage.sync.set({ 
    idToken: token, 
    signedIn: true, 
    signedInAt: Date.now() 
  });
  
  // DON'T close the tab - let it navigate to dashboard
  // OLD: chrome.tabs.remove(tabId)
  // NEW: Tab will auto-navigate to /dashboard after 800ms
});
```

#### 2) **If the auth flow came from the website** (no extension redirect_uri present):

- On auth completion, **skip the extension handshake** and `window.location.replace(redirect || '/dashboard')`.
- No extension URL involved; clean, direct navigation.

**Implementation:**
```typescript
// web/app/auth/extension/page.tsx - Manual Sign-In
const redirectUrl = redirectUri 
  ? `/auth/completing?token=${data.token}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&redirect=/dashboard`
  : `/dashboard`; // Direct to dashboard if no extension involved

window.location.href = redirectUrl;
```

**Summary Table:**

| Auth Origin | `redirect_uri` Present? | Behavior |
|-------------|------------------------|----------|
| Extension | ✅ Yes | Complete OAuth handshake → Navigate to `/dashboard` |
| Website | ❌ No | Direct navigation to `/dashboard` |

**Notes:**
- The CSRF `state` is validated server-side for extension-origin flows.
- The 10-minute app JWT used by the extension is **not** stored by the website; the website uses the Supabase session cookie.
- Extension receives its token via OAuth redirect; website maintains separate Supabase session.

---

## 3) Information Architecture

### 3.1 Top Bar

```
┌─────────────────────────────────────────────────────────┐
│  🔷 TrackMyOPT          🌙 🔔 [User Menu ▾] [Sign Out] │
│  Your complete toolkit for managing OPT requirements    │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- **Brand:** TrackMyOPT logo + name (links to `/`)
- **Theme Toggle:** 🌙 (light mode) / ☀️ (dark mode)
- **Notifications:** 🔔 (future: shows upcoming deadlines)
- **User Menu:** Dropdown with:
  - Profile Settings
  - Help & Support
  - Sign Out
- **Subheading:** "Your complete toolkit for managing OPT requirements"

### 3.2 Primary Summary Row (4 compact cards)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📝 OPT       │ ⏰ Next      │ ⏱️ Unemploy- │ 🎒 STEM     │
│ Filing       │ Deadline     │ ment Clock   │ Status       │
│ Window       │              │              │              │
│              │              │              │              │
│ Dec 1, 2025  │ 45 days left │ 25 / 90 days │ Eligible     │
│ → Feb 28     │ Must arrive  │ ⚠️ OK        │ Applied      │
│              │              │              │              │
│ See details  │ View timeline│ Open tracker │ View report  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Card 1: **OPT Filing Window (summary)**
- **Icon:** 📝
- **Title:** OPT Filing Window
- **Data Shown:**
  - Earliest file date: `program_end_date - 90 days`
  - Recommended target: `must_arrive_by - 14 days`
  - Must arrive by: `min(program_end_date + 60, dso_recommendation_date + 30)`
- **Button:** "See details" → Scrolls to Timeline section
- **Empty State:** "Add your dates to calculate"

#### Card 2: **Next Deadline**
- **Icon:** ⏰
- **Title:** Next Deadline
- **Data Shown:**
  - Countdown: "X days left" (relative to today)
  - Label: "Must arrive by" / "Next STEM report" / "OPT Start window closes"
  - Date: e.g., "March 30, 2026"
- **Button:** "View timeline" → Scrolls to Timeline
- **Logic:** Picks earliest future deadline from all computed dates
- **Color:** 
  - Green: > 30 days
  - Yellow: 10-30 days
  - Red: < 10 days

#### Card 3: **Unemployment Clock**
- **Icon:** ⏱️
- **Title:** Unemployment Clock
- **Data Shown:**
  - Used / Remaining: "25 / 90 days" (Regular OPT) or "25 / 150 days" (STEM)
  - Status chip:
    - ✅ OK: < 60 days
    - ⚠️ Warning: 60-79 days
    - 🚨 Critical: 80-89 days
    - 🛑 Limit: ≥ 90 days (Regular) or ≥ 150 (STEM)
  - Progress bar (visual)
- **Button:** "Open Clock Tracker" → Opens Clock section
- **Calculation:** 
  - Total days from `opt_start_date` (or `stem_start_date`) to today
  - Minus sum of `employment_spans` durations
  - Max: 90 (Regular) or 150 (STEM)

#### Card 4: **STEM Status**
- **Icon:** 🎒
- **Title:** STEM Status
- **Data Shown:**
  - STEM-eligible: Yes/No
  - STEM start date: If set
  - Next report checkpoint: "6-month report due: June 1, 2026"
  - Status: "Not applied" / "Pending" / "Approved" (future field)
- **Button:** "View report" → Opens STEM section
- **Empty State (not eligible):** "Mark as STEM-eligible to unlock"

### 3.3 Tiles (quick actions) — mirrors extension

```
┌──────────────────────┬──────────────────────┐
│ 📝 OPT Apply         │ 🎒 STEM OPT Apply    │
│ Start Dates          │ Start Dates          │
│                      │                      │
│ Calculate when you   │ Calculate STEM OPT   │
│ can start applying   │ extension dates      │
│ for OPT              │                      │
└──────────────────────┴──────────────────────┘
┌──────────────────────┬──────────────────────┐
│ ⏱️ OPT Clock        │ 📅 More Tools        │
│ Tracker              │ Coming               │
│                      │                      │
│ Track your           │ Stay tuned for       │
│ unemployment days    │ additional OPT       │
│ in real-time         │ resources            │
└──────────────────────┴──────────────────────┘
```

**Tiles:**
1. **📝 OPT Apply Start Dates** → Opens embedded calculator section (expands on page)
2. **🎒 STEM OPT Apply Start Dates** → Opens STEM calculator section
3. **⏱️ OPT Clock Tracker** → Opens unemployment tracker section (detailed view)
4. **📅 More Tools Coming** → Placeholder, links to `/tools/coming-soon`

**Behavior:**
- Click tile → Smooth scroll to corresponding section below
- Active tile gets highlighted border
- Each section has "Back to top" button

### 3.4 Timeline & Key Dates

```
┌─────────────────────────────────────────────┐
│  📅 Your OPT Timeline                       │
│  ────────────────────────────────────────   │
│                                             │
│  ⚪ Program End Date        Feb 28, 2026   │
│  │  (Last day of studies)                  │
│  │                                         │
│  ⚪ DSO Recommendation      Jan 15, 2026   │
│  │  (Optional, if received)                │
│  │                                         │
│  ⚪ Earliest File Date      Dec 1, 2025    │
│  │  (90 days before program end)           │
│  │                                         │
│  🔵 Recommended Target     Feb 14, 2026    │
│  │  (Recommended submission)               │
│  │                                         │
│  🔴 Must Arrive By         Feb 28, 2026    │
│  │  (Hard deadline)                        │
│  │                                         │
│  ⚪ OPT Start Window        Mar 1 - May 29 │
│  │  (Earliest - Latest)                    │
│  │                                         │
│  ⚪ STEM Start Date         Mar 1, 2027    │
│     (If STEM-eligible)                     │
│                                             │
│  [📥 Add to Calendar (.ics)]  [🖨️ Print]  │
└─────────────────────────────────────────────┘
```

**Data Points:**
- **Program End:** User-provided
- **DSO Recommendation:** User-provided (optional)
- **Earliest File Date:** `program_end_date - 90 days`
- **Recommended Target:** `must_arrive_by - 14 days` (buffer)
- **Must Arrive By:** `min(program_end_date + 60, dso_recommendation_date + 30 if present)`
- **OPT Start Window:** Based on USCIS rules (earliest/latest)
- **STEM Dates:** If applicable

**Features:**
- Visual timeline with connecting lines
- Color coding: Past (gray), Upcoming (blue), Critical (red)
- "Add to Calendar" downloads `.ics` file with all dates
- "Print" opens printer-friendly view

### 3.5 "Your Dates" (editable card)

```
┌─────────────────────────────────────────────┐
│  ✏️ Your Dates                              │
│  Edit your OPT information                  │
│  ────────────────────────────────────────   │
│                                             │
│  Program End Date *                         │
│  ┌──────────────┐                          │
│  │ 02/28/2026   │  MM/DD/YYYY              │
│  └──────────────┘                          │
│                                             │
│  DSO Recommendation Date (Optional)         │
│  ┌──────────────┐                          │
│  │ 01/15/2026   │  MM/DD/YYYY              │
│  └──────────────┘                          │
│                                             │
│  Current OPT EAD End Date *                 │
│  ┌──────────────┐                          │
│  │ 05/29/2027   │  MM/DD/YYYY              │
│  └──────────────┘                          │
│                                             │
│  OPT Start Date *                           │
│  ┌──────────────┐                          │
│  │ 03/01/2026   │  MM/DD/YYYY              │
│  └──────────────┘                          │
│                                             │
│  ☑ I'm STEM-eligible                        │
│                                             │
│  STEM OPT Start Date (if eligible)          │
│  ┌──────────────┐                          │
│  │ 03/01/2027   │  MM/DD/YYYY              │
│  └──────────────┘                          │
│                                             │
│  [Save Changes]  [Reset to Server Values]   │
└─────────────────────────────────────────────┘
```

**Fields:**
- **Program End Date** (required): Last day of academic program
- **DSO Recommendation Date** (optional): When DSO recommended OPT
- **Current OPT EAD End Date** (required): End date on your EAD card
- **OPT Start Date** (required): When your OPT period began
- **STEM-eligible** (checkbox): Toggles STEM fields
- **STEM OPT Start Date** (conditional): If STEM-eligible is checked

**Behavior:**
- Input mask: `MM/DD/YYYY` with auto-formatting
- Real-time validation: Show errors inline
- Optimistic UI: Save button → Loading state → Success toast
- "Reset to Server Values" appears only if local changes made
- On save → POST `/api/profile/update` → Refresh summary cards
- Validation errors:
  - "Date must be in MM/DD/YYYY format"
  - "Program end date must be in the past or within 1 year"
  - "OPT start date must be after program end"
  - etc.

**Success Toast:**
```
✅ Your dates have been saved successfully!
```

**Error Toast:**
```
❌ Failed to save: [error message]
[Retry]
```

### 3.6 Employment Spans (MVP stub)

```
┌─────────────────────────────────────────────┐
│  💼 Employment History                      │
│  Track your work periods to calculate       │
│  unemployment days                          │
│  ────────────────────────────────────────   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Employer      │ Start     │ End     │   │
│  ├─────────────────────────────────────┤   │
│  │ Tech Corp     │ 03/15/26  │ Current │🗑️│
│  │ Startup Inc   │ 06/01/26  │ 12/31/26│🗑️│
│  │ University    │ 01/15/27  │ 05/30/27│🗑️│
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ Add Employment]                         │
│                                             │
│  Unemployment Used: 25 days / 90            │
└─────────────────────────────────────────────┘
```

**Table Columns:**
- **Employer Name:** Text input
- **Start Date:** MM/DD/YYYY
- **End Date:** MM/DD/YYYY or "Current" (checkbox)
- **Actions:** Edit (✏️), Delete (🗑️)

**Features:**
- Add row: Opens modal with form
- Edit row: Opens modal with pre-filled values
- Delete row: Confirmation dialog → POST `/api/employment/delete`
- Auto-calculates unemployment used based on gaps
- "Current" employment: end_date = null

**Add/Edit Modal:**
```
┌─────────────────────────────────────────────┐
│  Add Employment                        ×    │
│  ────────────────────────────────────────   │
│                                             │
│  Employer Name *                            │
│  ┌──────────────────────────────────────┐  │
│  │ Tech Corp                            │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Start Date *                               │
│  ┌──────────────┐                          │
│  │ 03/15/2026   │  MM/DD/YYYY              │
│  └──────────────┘                          │
│                                             │
│  End Date                                   │
│  ┌──────────────┐  ☑ Currently working     │
│  │ 12/31/2026   │                          │
│  └──────────────┘                          │
│                                             │
│  [Cancel]  [Save]                           │
└─────────────────────────────────────────────┘
```

**Unemployment Calculation:**
- Total OPT days: `opt_ead_end_date - opt_start_date`
- Employed days: Sum of all `employment_spans` durations
- Unemployment: `Total - Employed`
- Max allowed: 90 days (Regular), 150 days (STEM)

### 3.7 Reminders

```
┌─────────────────────────────────────────────┐
│  🔔 Reminders & Notifications               │
│  Get email reminders for important dates    │
│  ────────────────────────────────────────   │
│                                             │
│  ⚠️ Verify your email to receive reminders │
│  your@email.com is not verified             │
│  [Resend Verification Email]                │
│  ────────────────────────────────────────   │
│                                             │
│  📝 Filing Window Reminders                 │
│  ☑ 60 days before deadline                  │
│  ☑ 30 days before deadline                  │
│  ☑ 10 days before deadline                  │
│                                             │
│  ⏱️ Unemployment Thresholds                 │
│  ☑ At 60 days used (Warning)                │
│  ☑ At 80 days used (Critical)               │
│  ☐ At 90 days used (Limit reached)          │
│                                             │
│  🎒 STEM Reporting Checkpoints              │
│  ☑ 6-month report reminder                  │
│  ☑ 12-month report reminder                 │
│  ☑ 18-month report reminder                 │
│  ☑ 24-month report reminder                 │
│                                             │
│  [Save Preferences]                         │
└─────────────────────────────────────────────┘
```

**Features:**
- Email verification banner (if not verified)
- Toggle groups for different reminder types
- Saves to user preferences in database
- Future: Push notifications, SMS (optional)

**Email Verification:**
- Shows banner if `email_verified` = false in Supabase
- "Resend Verification Email" → Sends Supabase confirmation email
- Hides banner after verification

### 3.8 Footer

```
┌─────────────────────────────────────────────┐
│  Privacy Policy · Terms & Conditions ·      │
│  Support · Help Center                      │
│                                             │
│  © 2025 TrackMyOPT. All rights reserved.    │
└─────────────────────────────────────────────┘
```

---

## 4) States & Empty States

### 4.1 No Dates Yet (First-Time User)

```
┌─────────────────────────────────────────────┐
│  🎉 Welcome to TrackMyOPT!                  │
│                                             │
│  Let's get started by adding your OPT dates │
│                                             │
│  We need a few dates to calculate your      │
│  filing windows and track your OPT status.  │
│                                             │
│  Required Information:                      │
│  • Program End Date                         │
│  • Current OPT EAD End Date                 │
│  • OPT Start Date                           │
│                                             │
│  Optional:                                  │
│  • DSO Recommendation Date (if received)    │
│                                             │
│  [Get Started →]                            │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Shows on first visit if `opt_status` table has no row for user
- "Get Started" button scrolls to "Your Dates" card
- Cards show empty state messages instead of data

### 4.2 STEM Not Eligible

```
┌─────────────────────────────────────────────┐
│  🎒 STEM OPT Extension                      │
│                                             │
│  You haven't marked yourself as STEM-       │
│  eligible yet.                              │
│                                             │
│  If you're in a STEM field and qualify for  │
│  a 24-month extension, enable STEM tracking.│
│                                             │
│  [I'm STEM-eligible]                        │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Shows in place of STEM summary card
- "I'm STEM-eligible" button → Opens "Your Dates" card with checkbox checked
- After enabling, STEM fields and timeline appear

### 4.3 Email Not Verified

```
┌─────────────────────────────────────────────┐
│  ⚠️ Email Not Verified                      │
│                                             │
│  To receive reminders, please verify your   │
│  email address: your@email.com              │
│                                             │
│  [Resend Verification Email]                │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Shows at top of dashboard (banner style)
- Dismissible (stores in localStorage, shows again next session)
- "Resend" button → Calls Supabase resend verification
- Success: "Verification email sent! Check your inbox."

### 4.4 Error Fetching Data

```
┌─────────────────────────────────────────────┐
│  ⚠️ Unable to Load Dashboard                │
│                                             │
│  We couldn't load your data. This might be  │
│  a temporary issue.                         │
│                                             │
│  Error: [error message]                     │
│                                             │
│  [Retry]  [Contact Support]                 │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Shows if API calls fail (network error, server error)
- "Retry" button → Reloads page or re-fetches data
- "Contact Support" → Opens `/support` page

---

## 5) Data Model (reads/writes)

### Tables (already created in Supabase)

#### 5.1 `profiles`
```sql
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone text DEFAULT 'America/New_York',
  is_stem_eligible boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**RLS Policy:**
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 5.2 `opt_status`
```sql
CREATE TABLE opt_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  program_end_date date NOT NULL,
  dso_recommendation_date date,
  opt_ead_end_date date NOT NULL,
  opt_start_date date NOT NULL,
  stem_start_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**RLS Policy:**
```sql
CREATE POLICY "Users can view own opt_status"
  ON opt_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opt_status"
  ON opt_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opt_status"
  ON opt_status FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 5.3 `employment_spans`
```sql
CREATE TABLE employment_spans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_name text NOT NULL,
  start_date date NOT NULL,
  end_date date, -- NULL = currently employed
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_employment_spans_user_id ON employment_spans(user_id);
```

**RLS Policy:**
```sql
CREATE POLICY "Users can view own employment_spans"
  ON employment_spans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employment_spans"
  ON employment_spans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employment_spans"
  ON employment_spans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own employment_spans"
  ON employment_spans FOR DELETE
  USING (auth.uid() = user_id);
```

### Reads on Page Load

**Server Component (Dashboard Page):**
```typescript
// 1. Get user session
const { data: { session } } = await supabase.auth.getSession();

// 2. Fetch profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', session.user.id)
  .single();

// 3. Fetch OPT status
const { data: optStatus } = await supabase
  .from('opt_status')
  .select('*')
  .eq('user_id', session.user.id)
  .single();

// 4. Fetch employment spans (latest 10)
const { data: employmentSpans } = await supabase
  .from('employment_spans')
  .select('*')
  .eq('user_id', session.user.id)
  .order('start_date', { ascending: false })
  .limit(10);
```

### Writes

**Update Profile & OPT Status:**
```typescript
// Upsert profile
await supabase
  .from('profiles')
  .upsert({
    user_id: session.user.id,
    timezone: 'America/New_York',
    is_stem_eligible: true,
  });

// Upsert opt_status
await supabase
  .from('opt_status')
  .upsert({
    user_id: session.user.id,
    program_end_date: '2026-02-28',
    dso_recommendation_date: '2026-01-15',
    opt_ead_end_date: '2027-05-29',
    opt_start_date: '2026-03-01',
    stem_start_date: '2027-03-01',
    updated_at: new Date().toISOString(),
  });
```

**Add/Update Employment Span:**
```typescript
// Insert new
await supabase
  .from('employment_spans')
  .insert({
    user_id: session.user.id,
    employer_name: 'Tech Corp',
    start_date: '2026-03-15',
    end_date: null, // Currently employed
  });

// Update existing
await supabase
  .from('employment_spans')
  .update({
    employer_name: 'Tech Corp Inc.',
    end_date: '2026-12-31',
  })
  .eq('id', spanId)
  .eq('user_id', session.user.id); // Double check ownership
```

**Delete Employment Span:**
```typescript
await supabase
  .from('employment_spans')
  .delete()
  .eq('id', spanId)
  .eq('user_id', session.user.id); // Double check ownership
```

---

## 6) API Contracts (JSON)

### 6.1 GET `/api/me`

**Purpose:** Fetch user profile, OPT status, and employment spans  
**Auth:** Bearer app JWT (for extension) OR Supabase session (for web)

**Request:**
```http
GET /api/me HTTP/1.1
Authorization: Bearer <app_jwt_or_session>
```

**Response (Success):**
```json
{
  "ok": true,
  "data": {
    "profile": {
      "user_id": "uuid",
      "timezone": "America/New_York",
      "is_stem_eligible": true,
      "created_at": "2025-01-01T00:00:00Z"
    },
    "status": {
      "program_end_date": "2026-02-28",
      "dso_recommendation_date": "2026-01-15",
      "opt_ead_end_date": "2027-05-29",
      "opt_start_date": "2026-03-01",
      "stem_start_date": "2027-03-01"
    },
    "employment_spans": [
      {
        "id": "uuid",
        "employer_name": "Tech Corp",
        "start_date": "2026-03-15",
        "end_date": null
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

### 6.2 POST `/api/profile/update`

**Purpose:** Update user profile and OPT status  
**Auth:** Supabase session (web only)

**Request:**
```json
{
  "timezone": "America/New_York",
  "is_stem_eligible": true,
  "program_end_date": "02/28/2026",
  "dso_recommendation_date": "01/15/2026",
  "opt_ead_end_date": "05/29/2027",
  "opt_start_date": "03/01/2026",
  "stem_start_date": "03/01/2027"
}
```

**Validations:**
- Required fields: `program_end_date`, `opt_ead_end_date`, `opt_start_date`
- Date format: `MM/DD/YYYY` (converted to `YYYY-MM-DD` internally)
- `opt_start_date` must be after `program_end_date`
- If `is_stem_eligible` is false, `stem_start_date` should be null
- Dates must be valid and parseable

**Response (Success):**
```json
{
  "ok": true
}
```

**Response (Validation Error):**
```json
{
  "ok": false,
  "error": "invalid_dates",
  "details": "OPT start date must be after program end date"
}
```

### 6.3 POST `/api/employment/upsert`

**Purpose:** Add or update an employment span  
**Auth:** Supabase session (web only)

**Request (New):**
```json
{
  "employer_name": "Tech Corp",
  "start_date": "03/15/2026",
  "end_date": "12/31/2026"
}
```

**Request (Update):**
```json
{
  "id": "existing-uuid",
  "employer_name": "Tech Corp Inc.",
  "start_date": "03/15/2026",
  "end_date": null
}
```

**Validations:**
- Required: `employer_name`, `start_date`
- Date format: `MM/DD/YYYY`
- `end_date` can be null (currently employed)
- If `id` provided, must belong to current user (RLS enforced)

**Response (Success):**
```json
{
  "ok": true,
  "id": "uuid"
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "Invalid date format"
}
```

### 6.4 POST `/api/employment/delete`

**Purpose:** Delete an employment span  
**Auth:** Supabase session (web only)

**Request:**
```json
{
  "id": "uuid"
}
```

**Validations:**
- Required: `id`
- Must belong to current user (RLS enforced)

**Response (Success):**
```json
{
  "ok": true
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "Not found or unauthorized"
}
```

### Error Envelope (Standard)

All API endpoints use this error format:

```json
{
  "ok": false,
  "error": "error_code_or_message",
  "details": "Optional detailed explanation"
}
```

**Common Error Codes:**
- `unauthorized`: No valid session
- `invalid_dates`: Date validation failed
- `missing_fields`: Required fields not provided
- `not_found`: Resource doesn't exist
- `rate_limit_exceeded`: Too many requests

---

## 7) Date Math (display-only on dashboard)

All calculations are **display-only** on the dashboard. No dates are stored except user-provided ones.

### Formulas

#### 7.1 Earliest File Date
```typescript
earliest_file_date = program_end_date - 90 days
```

**Example:**
- Program End: Feb 28, 2026
- Earliest File: Dec 1, 2025 (90 days before)

#### 7.2 Must Arrive By
```typescript
must_arrive_by = min(
  program_end_date + 60 days,
  dso_recommendation_date + 30 days  // if dso_recommendation_date is set
)
```

**Example 1 (No DSO Rec):**
- Program End: Feb 28, 2026
- Must Arrive By: Apr 29, 2026 (60 days after)

**Example 2 (With DSO Rec):**
- Program End: Feb 28, 2026
- DSO Rec: Jan 15, 2026
- Must Arrive By: Feb 14, 2026 (30 days after DSO, earlier than program + 60)

#### 7.3 Recommended Target
```typescript
recommended_target = must_arrive_by - 14 days  // 2-week buffer
```

**Example:**
- Must Arrive By: Feb 28, 2026
- Recommended Target: Feb 14, 2026

**Note:** Buffer of 14 days is configurable (future: user preference).

#### 7.4 OPT Start Window
Based on USCIS rules:
- **Earliest Start:** On or after program end date
- **Latest Start:** 60 days after program end date

```typescript
opt_start_earliest = program_end_date
opt_start_latest = program_end_date + 60 days
```

**Example:**
- Program End: Feb 28, 2026
- Start Window: Mar 1, 2026 → Apr 29, 2026

#### 7.5 Unemployment Days Used
```typescript
total_opt_days = opt_ead_end_date - opt_start_date
employed_days = sum of all employment_spans durations
unemployment_used = total_opt_days - employed_days

max_allowed = is_stem_eligible ? 150 : 90
```

**Example:**
- OPT Start: Mar 1, 2026
- OPT EAD End: May 29, 2027
- Total Days: 455
- Employment Span 1: Mar 15, 2026 → Dec 31, 2026 (291 days)
- Employment Span 2: Jan 15, 2027 → May 29, 2027 (135 days)
- Employed: 426 days
- Unemployment: 29 days

#### 7.6 Next Deadline
```typescript
all_deadlines = [
  must_arrive_by,
  opt_start_latest,
  stem_report_6_months,
  stem_report_12_months,
  ...
].filter(date => date > today)

next_deadline = min(all_deadlines)
```

**Note:** Only includes future dates.

---

## 8) UI Details (Tailwind skeleton)

### 8.1 Page Structure

```typescript
// web/app/dashboard/page.tsx
export default async function DashboardPage() {
  // ... auth check and data fetching ...
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Brand, theme, user menu */}
        </div>
      </header>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Email Verification Banner (if needed) */}
        {!emailVerified && <EmailVerificationBanner />}
        
        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SummaryCard1 />
          <SummaryCard2 />
          <SummaryCard3 />
          <SummaryCard4 />
        </div>
        
        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TileOPTApply />
          <TileSTEMApply />
          <TileClockTracker />
          <TileComingSoon />
        </div>
        
        {/* Timeline */}
        <TimelineSection />
        
        {/* Your Dates (Editable) */}
        <YourDatesCard />
        
        {/* Employment Spans */}
        <EmploymentSpansCard />
        
        {/* Reminders */}
        <RemindersCard />
      </div>
      
      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {/* Links */}
        </div>
      </footer>
    </main>
  );
}
```

### 8.2 Component Classes

**Container:**
```tsx
className="max-w-5xl mx-auto px-4 py-6"
```

**Summary Cards:**
```tsx
className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition"
```

**Tiles:**
```tsx
className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 cursor-pointer hover:scale-[1.02] transition"
```

**Buttons (Primary):**
```tsx
className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 transition"
```

**Buttons (Secondary):**
```tsx
className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl px-6 py-3 transition"
```

**Input Fields:**
```tsx
className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
```

**Input Mask Helper:**
```tsx
<input
  type="text"
  placeholder="MM/DD/YYYY"
  value={date}
  onChange={handleDateInput}
  className="..."
/>
<p className="mt-1 text-xs text-slate-500">Format: MM/DD/YYYY</p>
```

### 8.3 Iconography

Match extension icons:
- 📝 OPT Apply
- 🎒 STEM OPT
- ⏱️ Clock Tracker
- 📅 More Tools
- 🛡️ Compliance
- 🔔 Notifications
- ✅ Success
- ⚠️ Warning
- 🚨 Critical

**Status Chips:**
```tsx
// OK status
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  ✅ OK
</span>

// Warning status
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
  ⚠️ Warning
</span>

// Critical status
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
  🚨 Critical
</span>
```

---

## 9) Security

### 9.1 Route Protection

**Server Component Guard:**
```typescript
// web/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/extension?redirect=/dashboard');
  }
  
  // ... rest of component
}
```

### 9.2 CSRF Protection

- Auth flow maintains existing CSRF protection via `state` parameter
- Extension OAuth: `state` validated on callback
- Website-only: No extension handshake, direct Supabase session

### 9.3 JWT vs Supabase Session

**Extension:**
- Uses short-lived app JWT (10-minute expiry)
- Stored in `chrome.storage.sync`
- JWT validated on `/api/me` endpoint

**Website:**
- Uses Supabase session cookies
- Long-lived (default 1 hour, refresh token for longer)
- No app JWT stored in website cookies

**Why Separate:**
- Extension needs portable token (no cookies in extension context)
- Website benefits from Supabase's built-in session management
- No overlap or conflict

### 9.4 Row Level Security (RLS)

**All policies enforce `auth.uid() = user_id`:**

```sql
-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- opt_status
CREATE POLICY "Users can view own opt_status"
  ON opt_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own opt_status"
  ON opt_status FOR ALL
  USING (auth.uid() = user_id);

-- employment_spans
CREATE POLICY "Users can CRUD own employment_spans"
  ON employment_spans FOR ALL
  USING (auth.uid() = user_id);
```

**Testing RLS:**
```sql
-- As user A, try to access user B's data (should return 0 rows)
SELECT * FROM profiles WHERE user_id = 'user_b_uuid';
-- Returns: 0 rows (blocked by RLS)

-- Try to insert for another user (should fail)
INSERT INTO opt_status (user_id, ...) VALUES ('user_b_uuid', ...);
-- Returns: Error: new row violates row-level security policy
```

### 9.5 API Rate Limiting

**Current Supabase Limits:**
- 1800 requests/hour for token refreshes
- 360 requests/hour for anonymous sign-ins
- Custom limits configurable in Supabase dashboard

**Handling Rate Limits:**
```typescript
// If rate limit hit
if (error.message.includes('rate_limit_exceeded')) {
  return {
    ok: false,
    error: 'Too many requests. Please try again in a few minutes.',
  };
}
```

**User-Facing Error:**
```tsx
<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <p className="text-yellow-800">
    ⚠️ Too many requests. Please wait a moment and try again.
  </p>
</div>
```

### 9.6 Input Validation

**Date Validation:**
```typescript
function validateDate(dateString: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  // Parse and check if valid date
  const [month, day, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}
```

**SQL Injection Prevention:**
- All queries use Supabase client (parameterized queries)
- No raw SQL with user input
- RLS adds additional layer of protection

### 9.7 XSS Prevention

- All user input sanitized before rendering
- React escapes by default
- No `dangerouslySetInnerHTML` used
- CSP headers configured (future enhancement)

---

## 10) Telemetry (optional)

If analytics is enabled (future feature):

### Client Events

```typescript
// Example analytics calls
analytics.track('dashboard_viewed', {
  user_id: userId, // Anonymized or hashed
  has_opt_data: !!optStatus,
  is_stem_eligible: profile.is_stem_eligible,
});

analytics.track('profile_saved', {
  user_id: userId,
  fields_updated: ['program_end_date', 'opt_start_date'],
});

analytics.track('employment_span_added', {
  user_id: userId,
  total_spans: employmentSpans.length,
});

analytics.track('tile_clicked', {
  user_id: userId,
  tile: 'opt_apply_start_dates',
});
```

### Privacy

- Only anonymous IDs + user_id (UUID) logged
- No PII in event payloads (no email, name, dates)
- User can opt out in settings (future)
- GDPR-compliant data retention policies

### Tools

- Consider: PostHog, Mixpanel, Amplitude, or Plausible (privacy-focused)
- Self-hosted option: Umami, Matomo

---

## 11) QA Checklist

### 11.1 Authentication & Redirect

- [ ] **Direct URL `/dashboard` when not signed in** → Redirects to `/auth/extension?redirect=/dashboard`
- [ ] **Sign-in from website only (no extension)** → Ends at `/dashboard`
- [ ] **Sign-in from extension** → Extension receives token AND web tab lands on `/dashboard` (not closed)
- [ ] **Sign-up from website** → After OTP verification, lands on `/dashboard`
- [ ] **Sign-up from extension** → After OTP verification, extension gets token AND web tab lands on `/dashboard`
- [ ] **Google OAuth from website** → After callback, lands on `/dashboard`
- [ ] **Google OAuth from extension** → After callback, extension gets token AND web tab lands on `/dashboard`

### 11.2 Data Display

- [ ] **Missing dates** → Shows setup wizard card with "Get Started" button
- [ ] **Partial dates** → Shows what's available, prompts for missing required fields
- [ ] **All dates present** → All summary cards show correct calculated values
- [ ] **STEM not eligible** → Hides STEM fields and timeline; shows "I'm STEM-eligible" CTA
- [ ] **STEM eligible** → Shows STEM fields, timeline, and report checkpoints

### 11.3 Data Editing

- [ ] **Edit dates** → Form pre-fills with current values
- [ ] **Invalid date format** → Inline error shows (e.g., "Must be MM/DD/YYYY")
- [ ] **Save valid dates** → Success toast appears; summary cards update
- [ ] **Reload after save** → Shows updated values (persisted)
- [ ] **"Reset to Server Values"** → Reverts local changes; only shows if edited

### 11.4 Employment Spans

- [ ] **Add employment span** → Modal opens; save works; table updates
- [ ] **Edit employment span** → Modal opens with pre-filled values; save works
- [ ] **Delete employment span** → Confirmation dialog; deletion works
- [ ] **Unemployment calculation** → Updates correctly when spans added/edited/deleted
- [ ] **"Currently employed" checkbox** → Sets `end_date` to null

### 11.5 Reminders

- [ ] **Email unverified** → Banner shows at top with "Resend" button
- [ ] **Resend verification** → Success message; email received
- [ ] **Toggle reminders** → Save works; persists on reload
- [ ] **Email verified** → Banner hidden

### 11.6 UI/UX

- [ ] **Dark mode contrast** → All text readable; no white-on-white or black-on-black
- [ ] **Theme toggle** → Switches between light and dark; persists
- [ ] **Keyboard navigation** → Tab order logical; Enter/Space activate buttons
- [ ] **Focus states** → Visible focus rings on all interactive elements
- [ ] **Responsive design** → Works on mobile, tablet, desktop
- [ ] **Loading states** → Spinners/skeletons show during data fetches
- [ ] **Error states** → Friendly messages with retry options

### 11.7 Security

- [ ] **RLS: Cannot fetch another user's data** → Query returns 0 rows
- [ ] **RLS: Cannot edit another user's data** → Update/delete fails with permission error
- [ ] **RLS: Cannot insert data for another user** → Insert fails with permission error
- [ ] **Rate limit** → Friendly toast shows if limit hit; user can retry later
- [ ] **Session expiry** → Redirects to login when session expires

### 11.8 Edge Cases

- [ ] **No employment spans** → Shows empty state with "Add Employment" button
- [ ] **Future program end date** → Calculations work correctly
- [ ] **Past program end date** → Warnings/alerts show if deadlines missed
- [ ] **Timezone handling** → Dates display correctly in user's timezone
- [ ] **Leap year dates** → Feb 29 handled correctly

---

## 12) Acceptance Criteria (MVP)

### Must Have (Blocking)

1. ✅ `/dashboard` is inaccessible without sign-in (server-enforced redirect)
2. ✅ After Google / manual sign-in or signup, user always lands on `/dashboard`
3. ✅ If auth started from extension, extension receives token AND web tab lands on `/dashboard` (no tab close)
4. ✅ Dashboard shows:
   - Summary row (4 cards: Filing Window, Next Deadline, Unemployment Clock, STEM Status)
   - Tiles (4 quick action tiles matching extension)
   - Timeline (vertical list of key dates)
   - "Your Dates" editable card
   - Employment spans table (add/edit/delete)
   - Reminders section
5. ✅ All saves are persisted via Supabase (RLS-protected)
6. ✅ All data reflects on page refresh (no stale data)
7. ✅ Empty states handled gracefully (setup wizard, STEM CTA, etc.)
8. ✅ Error states handled gracefully (network errors, validation errors)

### Should Have (High Priority)

- ⚠️ Email verification banner and resend functionality
- ⚠️ Dark mode support with proper contrast
- ⚠️ Responsive design (mobile/tablet/desktop)
- ⚠️ Loading states for async operations
- ⚠️ Optimistic UI for saves (immediate feedback)
- ⚠️ Input masks for dates (MM/DD/YYYY auto-formatting)

### Could Have (Nice to Have)

- 📅 "Add to Calendar" (.ics download)
- 🖨️ Print-friendly view
- 📊 Visual charts for unemployment usage
- 🔔 Push notifications (browser)
- 📧 Email digest preferences
- 🌍 Timezone selector in settings

### Won't Have (Out of Scope for MVP)

- ❌ SMS reminders
- ❌ Mobile app
- ❌ PDF export
- ❌ Multi-language support
- ❌ Team/advisor sharing
- ❌ Document upload/storage

---

## 13) Implementation Plan

### Phase 1: Route Protection & Redirect (1 day)

**Tasks:**
1. Create `/dashboard/page.tsx` with session guard
2. Update `/auth/completing/page.tsx` to handle dual redirect (extension + website)
3. Update extension background script to not close tab
4. Test all auth flows (manual, Google, extension, website)

**Acceptance:**
- ✅ All auth flows land on `/dashboard`
- ✅ Extension gets token AND tab stays open

### Phase 2: Data Model & APIs (1 day)

**Tasks:**
1. Verify Supabase tables exist (`profiles`, `opt_status`, `employment_spans`)
2. Create/update RLS policies
3. Create API routes:
   - `GET /api/me` (update existing)
   - `POST /api/profile/update` (new)
   - `POST /api/employment/upsert` (new)
   - `POST /api/employment/delete` (new)
4. Add date validation utilities (`mmddyyyyToISO`)
5. Test all APIs with Postman/Insomnia

**Acceptance:**
- ✅ All APIs return correct data
- ✅ RLS blocks unauthorized access
- ✅ Date validation works

### Phase 3: Dashboard UI (2-3 days)

**Tasks:**
1. Create summary row (4 cards)
2. Create tiles grid (4 tiles)
3. Create timeline section
4. Create "Your Dates" editable card
5. Create employment spans table
6. Create reminders section
7. Add empty states
8. Add error states
9. Add loading states

**Acceptance:**
- ✅ All UI components render correctly
- ✅ Dark mode works
- ✅ Responsive on all screen sizes

### Phase 4: Interactivity (1-2 days)

**Tasks:**
1. Wire up "Your Dates" form to `/api/profile/update`
2. Wire up employment spans CRUD to APIs
3. Add optimistic UI updates
4. Add success/error toasts
5. Add input masks for dates
6. Add form validation

**Acceptance:**
- ✅ All forms save correctly
- ✅ Data persists on reload
- ✅ Validation errors show inline

### Phase 5: Polish & QA (1 day)

**Tasks:**
1. Run through QA checklist
2. Fix any bugs
3. Test on multiple browsers (Chrome, Firefox, Safari)
4. Test on multiple devices (mobile, tablet, desktop)
5. Performance audit (Lighthouse)
6. Accessibility audit (WAVE, axe)

**Acceptance:**
- ✅ All QA items pass
- ✅ Lighthouse score > 90
- ✅ No critical accessibility issues

**Total Estimated Time:** 6-8 days

---

## 14) Future Enhancements

### Short-Term (Next Sprint)

1. **Email Verification Flow:**
   - Send verification email on signup
   - Show banner until verified
   - Resend option

2. **Reminder Preferences:**
   - Toggle individual reminder types
   - Save to user preferences table
   - Wire up to CRON jobs

3. **Employment Tracking:**
   - Auto-calculate unemployment days
   - Visual progress bar
   - Warnings at thresholds (60, 80, 90 days)

### Medium-Term (1-2 Months)

1. **Calendar Integration:**
   - Generate `.ics` file with all dates
   - Add to Google Calendar button
   - Sync with iCal, Outlook

2. **Visual Charts:**
   - Timeline chart (Gantt-style)
   - Unemployment usage pie chart
   - Filing window visualization

3. **Notifications:**
   - Browser push notifications
   - Email digest (daily/weekly summary)
   - Deadline reminders

### Long-Term (3-6 Months)

1. **Document Management:**
   - Upload EAD card, I-20, etc.
   - OCR to extract dates automatically
   - Secure cloud storage

2. **Advisor Portal:**
   - DSOs can view student status
   - Bulk reminders for cohorts
   - Compliance reporting

3. **Mobile App:**
   - React Native or Flutter
   - Push notifications
   - Offline mode

4. **AI Assistant:**
   - Chat-based Q&A about OPT rules
   - Personalized recommendations
   - Auto-fill dates from documents

---

## 15) Open Questions

1. **Email Verification:**
   - Should we require email verification before showing dashboard?
   - Or show dashboard with banner?
   - **Decision:** Show dashboard with banner (less friction)

2. **Data Migration:**
   - Some users may have signed up without providing OPT dates
   - How do we prompt them to complete their profile?
   - **Decision:** Show setup wizard card as empty state

3. **STEM Reporting:**
   - Do we track STEM reporting submissions?
   - Or just remind users to report?
   - **Decision:** MVP: Just reminders. Future: Track submissions.

4. **Timezone:**
   - Should dates be stored in user's timezone or UTC?
   - **Decision:** Store as UTC DATE (no time component), display in user's timezone

5. **Extension Tab Closing:**
   - Should extension background script close the tab after token is captured?
   - Or let it navigate to dashboard?
   - **Decision:** Don't close tab; let it navigate to dashboard

---

## 16) Appendix: Sample Data

### Sample User Profile

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@university.edu",
  "firstName": "John",
  "lastName": "Doe",
  "timezone": "America/New_York",
  "is_stem_eligible": true,
  "email_verified": true
}
```

### Sample OPT Status

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "program_end_date": "2026-02-28",
  "dso_recommendation_date": "2026-01-15",
  "opt_ead_end_date": "2027-05-29",
  "opt_start_date": "2026-03-01",
  "stem_start_date": "2027-03-01",
  "created_at": "2025-10-14T12:00:00Z",
  "updated_at": "2025-10-14T12:00:00Z"
}
```

### Sample Employment Spans

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "employer_name": "Tech Corp",
    "start_date": "2026-03-15",
    "end_date": "2026-12-31",
    "created_at": "2025-10-14T12:00:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "employer_name": "Startup Inc",
    "start_date": "2027-01-15",
    "end_date": null,
    "created_at": "2025-10-14T12:00:00Z"
  }
]
```

### Sample Calculated Values

```json
{
  "earliest_file_date": "2025-12-01",
  "recommended_target": "2026-02-14",
  "must_arrive_by": "2026-02-28",
  "opt_start_earliest": "2026-03-01",
  "opt_start_latest": "2026-04-29",
  "unemployment_used": 29,
  "unemployment_remaining": 121,
  "unemployment_max": 150,
  "next_deadline": {
    "date": "2026-02-28",
    "label": "Must arrive by",
    "days_left": 137
  }
}
```

---

## 17) References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [USCIS OPT Rules](https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students)
- [Chrome Extension OAuth](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)

---

**End of Spec**

**Status:** Ready for Implementation  
**Version:** 1.0.0  
**Last Updated:** October 14, 2025  
**Authors:** Product & Engineering Team

---

**Change Log:**

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-14 | 1.0.0 | Initial spec created | Staff Product Engineer |

---

**Approval:**

- [ ] Product Manager
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] QA Lead

**Next Steps:**

1. Review spec with team
2. Break down into tasks (Jira/Linear/GitHub Issues)
3. Assign to sprint
4. Begin Phase 1 implementation

