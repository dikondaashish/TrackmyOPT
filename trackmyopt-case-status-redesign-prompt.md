# TrackMyOPT — Case Status Page Full Redesign

## Context
This is the `case-status` page of **TrackMyOPT** (trackmyopt.com), a SaaS product for F-1/OPT students to track USCIS case statuses. The current page is functional but has critical UX problems:
- The same USCIS notice text appears **3 times** on a single page
- The urgent "PP overdue" alert is buried mid-page instead of being the first thing a user sees
- 11 sections stack with no visual hierarchy
- Monitor/tracking info is spread across 3 separate blocks
- Low-confidence predictions (4 sample cases) show "100% approval probability" — misleading
- Marketing copy ("Free: track in-app. Pro: daily auto-checks") appears inside the authenticated dashboard

The user is a stressed F-1 student who lands on this page to answer ONE question: **"What is happening with my case right now and what do I do?"** The redesign must answer that in under 3 seconds.

---

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Existing component library (shadcn/ui or equivalent)
- This is the `/dashboard/case-status` route

---

## Redesign Goal
Rebuild the entire `case-status` page from scratch. Keep all data and features — just restructure, consolidate, and prioritize them correctly.

**Core rule: One fact, one place, one purpose. Never show the same data in two places.**

---

## New Page Architecture (top to bottom)

### 1. STICKY CASE SWITCHER (top, below nav)
A horizontal tab strip showing all tracked cases. Sticky on scroll.

```
[I-765 IOE9822 🔴] [I-539 IOE9700 ⚠️] [I-140 IOE9655 ✅] [I-131 IOE9533 🔵] [+ 4 more ▼] [+ Add case]
```

- Sort order: 🔴 Urgent/overdue → ⚠️ Action needed (RFE) → 🔵 In progress → ⏳ Pending → ✅ Approved
- Color-coded pills per case state:
  - `urgent`: red background
  - `actionNeeded`: orange/amber background
  - `inProgress`: blue background
  - `pending`: gray background
  - `approved`: green background
- On mobile: horizontal scroll, no wrapping
- Active case is highlighted

**Case states enum:**
```ts
type CaseState = 'urgent' | 'actionNeeded' | 'inProgress' | 'pending' | 'approved'
```

---

### 2. URGENT ACTION BANNER (conditional — only renders when action needed)

Show this block ONLY when `caseState === 'urgent'` or `caseState === 'actionNeeded'`.
For normal/approved cases, this entire component should NOT render.

**For PP overdue (urgent):**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔴  PREMIUM PROCESSING OVERDUE — 11 business days past deadline         │
│ USCIS committed to a decision by Jun 3, 2026.                           │
│ You are entitled to contact the Premium Processing unit directly.       │
│                                                                         │
│  [📞 Call USCIS (800) 375-5283]    [🌐 Submit Online Inquiry]          │
└─────────────────────────────────────────────────────────────────────────┘
```

**For RFE (actionNeeded):**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️  REQUEST FOR EVIDENCE — Received Jun 11, 2026                        │
│ USCIS needs additional documents. Respond before the RFE deadline.      │
│                                                                         │
│  [📋 View RFE Guide]    [📞 Contact DSO]                               │
└─────────────────────────────────────────────────────────────────────────┘
```

Styling: Full-width banner, red/amber left border (4px), subtle colored background. High contrast text. Two CTA buttons inline.

---

### 3. MAIN CASE HERO CARD

One card that shows case identity, progress, and 4 key stats. No duplicate USCIS status text here.

```
┌───────────────────────────────────────────────────────────────────────┐
│  I-765  ·  IOE9822487119  ·  National Benefits Center                 │
│  Filed: Feb 25, 2026  ·  Day 94  ·  🟡 Premium Processing Active     │
│                                                                       │
│  [Received ✅] ──── [Biometrics ✅] ──── [Active Review 🔄] ──── [Decision ⬜] ──── [Card ⬜]  │
│                                          ↑ YOU ARE HERE              │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ 94 days  │  │ 5 updates│  │ May 12   │  │ 11d OVERDUE 🔴   │    │
│  │ since    │  │ from     │  │ last PP  │  │ PP deadline      │    │
│  │ filed    │  │ USCIS    │  │ change   │  │ exceeded         │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │
│                                                                       │
│  [🔄 Refresh]   [📋 Copy receipt]   [⚙️ Manage case]                │
└───────────────────────────────────────────────────────────────────────┘
```

**Important:**
- ❌ DO NOT show the 80% progress circle — it conflicts with the overdue state and confuses users
- ❌ DO NOT show the full USCIS notice text here — it only lives in the timeline section
- ✅ The 4-stat strip replaces the current scattered KPI tiles
- The stepper shows 5 steps specific to form type (I-765 steps differ from I-485)
- The overdue stat card gets a red tint background

---

### 4. MONITOR HEALTH STRIP (1 single line, not a section)

This replaces the current 3 separate blocks that show monitoring info. Just ONE line.

```
✅ Auto-monitor active  ·  Last checked Jun 16 @ 4:56 PM (16 min ago)  ·  Next check in 22h 07m  ·  📧 Email alerts: dikondaashish@gmail.com  [Edit]
```

Styling: Small text, muted color, subtle separator dividers. No card. No heading. Just a metadata strip.

---

### 5. ANALYTICS SECTION (3 tabs)

Use a tab component. Default active tab: "Prediction".

**Tab 1 — Prediction:**
```
Likely outcome:  ✅ Approval (87% probability · 96 completed cases)
Estimated decision:  Jun 18–27, 2026  ·  Median 92 days · You're on day 94

Your cohort: 142 cases filed within ±100 receipts
Fastest nearby: 61 days  ·  12 approvals in the last 24 hours

[Distribution bar chart: Days to approval]
<60: 8 | 60-75: 19 | 75-90: 34 | 90-105: 41 | 105-120: 23 | 120+: 17
                                   ↑ Day 94 falls in peak range

Cohort positioning: 7,236 cases behind you · 22,400 ahead · Top 24%
```

⚠️ DATA GATE: Only render prediction content if `cohortSize >= 20`. If below threshold, show:
```
🔍 Gathering data...
Not enough nearby I-765 cases yet for reliable predictions.
We'll show estimates once we have 20+ similar cases.
```
(Currently the page shows "Based on 4 similar cases" and "100% approval probability" — this is misleading and must be removed)

**Tab 2 — Nearby Cases:**
```
142 cases filed near IOE9822487119

Cohort range: [±25] [±50] [±100 active] [±250]    [Re-scan]

Recent nearby outcomes (anonymized receipts):
IOE••••7741   ✅ Approved    88 days    2 days ago
IOE••••3120   ✅ Approved    95 days    4 days ago
IOE••••9904   ⚠️ RFE         —          1 week ago
IOE••••2218   ✅ Approved    85 days    2 weeks ago
IOE••••6651   ⏳ Pending     day 80     now

Disclaimer: Anonymized nearby USCIS receipts. Not affiliated with USCIS. Not legal advice.
```

Also include:
- Cohort outcomes summary: Approved 87% / Denied X% / RFE X% / Pending X%
- Processing speed: "Normal pace · 90d average"

**Tab 3 — Processing Heatmap:**
- Table: Months (Jan–Jun) × Time buckets (<60d, 60-75d, 75-90d, 90-105d, 105-120d, 120d+)
- Toggle: Premium / Standard processing
- Label: "Approvals by filing month · I-765 at National Benefits Center"
- Color gradient: green (fast) → red (slow)

---

### 6. OPT JOURNEY SECTION

Combines: EAD tracker + STEM tracker + Milestone timeline + DSO deadlines into ONE unified section.

**Part A — Milestone Timeline (horizontal on desktop, vertical on mobile):**
```
F-1 Started    OPT Filed       EAD Decision      Employment     STEM Window     STEM Filed     H-1B
Aug 2024    →  Mar 12, 2026  → ~Jun 2026 🔄   →  Jul 2026 ⬜  → Mar 21, 2027 ⬜  →    —      →  2028
✅ Done         ✅ Done          In progress       Upcoming        Upcoming
```

**Part B — EAD & STEM Status Cards (2-column grid):**
```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ OPT EAD (projected)         │  │ Cap-gap status               │
│ Jun 2026 – Jun 2027         │  │ Not active                  │
│ 12-month post-completion    │  │ No H-1B petition on file    │
└─────────────────────────────┘  └─────────────────────────────┘
                                                                    
STEM window opens: Mar 21, 2027 (90 days before EAD expiry)
Reminders: 90 days before STEM window + before EAD expiry
```

**Part C — DSO Deadline Manager:**
```
DSO & Compliance Tasks  [3 open · 1 done]

🔴 Report new employer to DSO          Due Jun 24 (required within 10 days of starting work)
⬜ I-983 Training Plan signed           Pending (required for STEM extension)
⬜ 6-month self-evaluation              Due Dec 14
✅ Address change reported              Done
```

---

### 7. USCIS UPDATE HISTORY

Show latest 2 entries expanded. Collapse rest behind "View all X updates."
**CRITICAL: The USCIS notice text must NOT appear anywhere else on the page. Only here.**

```
USCIS Update History  (5 total)

May 11, 2026 — Most Recent
"We changed your case, IOE9822487119, from standard to premium processing. 
The premium-processing clock started on May 12, 2026..."
[Expand full notice ▼]

May 2, 2026
"We received your request to upgrade to premium processing."

[+ View 3 earlier updates]
```

---

### 8. TOOLS ACCORDION (collapsed by default)

All 4 tools live inside an accordion. Closed by default — user opens what they need.

```
[▶ E-Verify Employer Checker]
[▶ USCIS Status Decoder]
[▶ Premium Processing Contact Options]
[▶ Notification Settings]
```

**E-Verify Checker (when expanded):**
STEM OPT requires E-Verify enrolled employer. Input or preloaded employer name. Shows enrollment status.

**USCIS Status Decoder (when expanded):**
Table mapping official USCIS status strings → plain English → what to do next.
Cover: Received, Changed to PP, RFE, Actively Reviewed, Approved, Card Produced, Transferred, Denied.

**PP Contact Options (when expanded):**
```
USCIS Contact Center: (800) 375-5283  ·  Mon–Fri 8am–8pm ET
Ask IVR for: "premium processing"
Online: my.uscis.gov → Case inquiry → E-Request form
```

**Notification Settings (when expanded):**
```
Email alerts: dikondaashish@gmail.com  [Edit]  [Test]
Browser push: [Enable]
Alert on: any status change [toggle]
```

---

### 9. SMART NEXT STEPS (3 context-aware action cards)

Render based on current `caseState`. For this case (PP overdue + STEM pending):

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ ⚠️ PP Overdue        │  │ ✅ STEM Employer      │  │ 🔔 Case Monitored    │
│ Contact USCIS PP     │  │ Verify E-Verify       │  │ Auto-checks active   │
│ unit now             │  │ enrollment before     │  │ Email on any change  │
│                      │  │ filing extension      │  │                      │
│ [Call (800) 375-5283]│  │ [Check E-Verify →]   │  │ [Edit settings →]   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

### 10. FOOTER AREA (collapsed + disclaimer)

At the very bottom, always visible:
```
Case Information   [▶ expand]
Receipt: IOE9822487119 · Type: I-765 · Filed: Feb 25, 2026 · Center: National Benefits Center · Status: Premium Processing Active · 110 days

────────────────────────────────────────────────────
Case status information is provided for convenience and may be delayed, incomplete, or different from official USCIS notices. Always verify through official USCIS channels, your DSO, employer, or a licensed immigration attorney.
```

**Show the disclaimer ONCE — only here. Remove all other instances from the page.**

---

## What to Remove / Consolidate

| Remove this | Reason |
|---|---|
| Marketing copy "Free: track in-app. Pro: daily auto-checks" | User is already authenticated Pro member |
| Duplicate USCIS notice text (currently appears 3 times) | Show once in timeline only |
| 80% progress circle | Conflicts with overdue state, misleading |
| Second "Last checked" timestamp | Redundant — only in monitor strip |
| Second disclaimer block | Keep only in footer |
| "Based on 4 cases → 100% approval" prediction card | Under minimum threshold — hide |
| "YOUR CASES (1) Add case" block mid-page | Moved to sticky case switcher |

---

## Component File Structure (suggested)

```
app/dashboard/case-status/
├── page.tsx                        ← main page entry
├── components/
│   ├── StickyCaseSwitcher.tsx
│   ├── UrgentActionBanner.tsx
│   ├── CaseHeroCard.tsx
│   ├── MonitorHealthStrip.tsx
│   ├── AnalyticsTabs/
│   │   ├── index.tsx
│   │   ├── PredictionPanel.tsx
│   │   ├── NearbyCasesPanel.tsx
│   │   └── ProcessingHeatmapPanel.tsx
│   ├── OptJourneySection/
│   │   ├── index.tsx
│   │   ├── MilestoneTimeline.tsx
│   │   ├── EadStemCards.tsx
│   │   └── DsoDeadlineManager.tsx
│   ├── UscisHistorySection.tsx
│   ├── ToolsAccordion/
│   │   ├── index.tsx
│   │   ├── EVerifyChecker.tsx
│   │   ├── StatusDecoder.tsx
│   │   ├── PpContactOptions.tsx
│   │   └── NotificationSettings.tsx
│   ├── SmartNextSteps.tsx
│   └── CaseInfoFooter.tsx
```

---

## UX Rules (strictly follow)

1. **One red element per page max.** If PP is overdue, the banner is the only red thing on screen.
2. **One primary CTA per case state.** Don't show 4 call-to-action buttons fighting for attention.
3. **Same information = same place.** USCIS notice text lives ONLY in the timeline. Monitoring info lives ONLY in the monitor strip.
4. **Data gate.** Never show a prediction based on fewer than 20 comparable cases.
5. **Collapse secondary content.** Tools accordion closed by default. Case info table collapsed by default. History shows latest 2, rest collapsed.
6. **No marketing copy inside authenticated views.** The Free/Pro comparison text must not appear anywhere in the `/dashboard` route.
7. **Mobile-first.** The sticky case switcher scrolls horizontally. The stepper stacks vertically. The analytics tabs scroll. Minimum touch targets 44px.

---

## Data / Props Shape (reference)

```ts
interface CaseData {
  receiptNumber: string           // "IOE9822487119"
  formType: string                // "I-765"
  serviceCenter: string           // "National Benefits Center"
  filedDate: string               // "2026-02-25"
  daysSinceFiled: number          // 94
  currentStatus: string           // "Case Was Changed To A Premium Processing Case"
  lastStatusChange: string | null // "2026-05-12" or null
  updateCount: number             // 5
  caseState: CaseState            // "urgent"
  premiumProcessing?: {
    active: boolean
    startDate: string             // "2026-05-12"
    deadlineDate: string          // "2026-06-03"
    overdueBusinessDays: number   // 11
  }
  monitoring: {
    active: boolean
    lastChecked: string           // ISO timestamp
    nextCheck: string             // ISO timestamp
    emailAlerts: boolean
    emailAddress: string
  }
  progressStep: 1 | 2 | 3 | 4 | 5  // 1=Received, 2=Biometrics, 3=Review, 4=Decision, 5=Card
  history: {
    date: string
    status: string
    fullText: string
  }[]
  analytics?: {
    cohortSize: number            // must be >= 20 to show predictions
    approvalRate: number          // 0.87
    medianDays: number            // 92
    estimatedDecisionRange: [string, string]  // ["2026-06-18", "2026-06-27"]
    distribution: { label: string; count: number }[]
    cohortPosition: {
      behind: number
      ahead: number
      percentile: number
    }
    recentNearby: {
      maskedReceipt: string
      outcome: string
      days?: number
      timeAgo: string
    }[]
  }
  optJourney: {
    f1Start: string
    optFiled: string
    eadProjected: string
    stemWindowOpens: string
    stemFiled?: string
    capGapActive: boolean
  }
  dsoTasks: {
    id: string
    title: string
    dueDate?: string
    status: 'open' | 'done' | 'overdue'
    description: string
  }[]
}
```

---

## Design Notes

- Use the existing Tailwind config and design tokens from the project
- Match the current site's dark/light mode toggle behavior
- Font and color system should match trackmyopt.com exactly
- All icons should come from the existing icon library (Lucide React assumed)
- Animate transitions between tabs and accordion open/close states
- Loading states: show skeleton loaders for analytics data while fetching
- Error states: if case refresh fails, show inline error next to the refresh button (not a toast)

