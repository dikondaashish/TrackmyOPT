# TrackMyOPT - Complete Project Overview

> **A comprehensive platform for OPT (Optional Practical Training) timeline management**, consisting of a Next.js web application and a Chrome browser extension.

---

## 📚 Table of Contents

- [What is TrackMyOPT?](#what-is-trackmyopt)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Web Application](#web-application-web)
- [Chrome Extension](#chrome-extension-extension)
- [Database Schema](#database-schema)
- [Key Features](#key-features)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Tech Stack Summary](#tech-stack-summary)
- [Getting Started](#getting-started)

---

## What is TrackMyOPT?

TrackMyOPT is a **SaaS platform designed specifically for international students and graduates in the United States** who are on F-1 visa status and utilizing Optional Practical Training (OPT) work authorization.

---

### 🎯 The Problem We Solve

**OPT (Optional Practical Training)** is a temporary work authorization that allows F-1 international students to work in the United States for up to 12 months after completing their academic program (or 24 additional months for STEM graduates). However, managing OPT comes with **critical compliance requirements** that, if missed, can result in **loss of legal status and deportation**:

| Challenge | Consequence if Missed |
|-----------|----------------------|
| **90-Day Unemployment Limit** | Exceeding 90 days without employment = automatic visa status violation |
| **60-Day STEM Unemployment Limit** | STEM OPT holders have 60 total unemployment days; exceeding = visa status violation |
| **EAD Card Expiration** | Working after expiration = unauthorized employment |
| **USCIS Filing Deadlines** | Missing deadlines = denial of OPT or STEM extension |
| **Document Expiration** | Expired passport/visa = travel restrictions, RFEs |
| **Address Reporting** | Failure to report = violation of F-1 regulations |

> **The stakes are high**: International students often struggle to track these complex, overlapping deadlines manually. A single missed date can end their ability to work and live in the U.S.

---

### 👥 Who Is This For?

TrackMyOPT serves the following target audiences:

#### 1. **F-1 International Students (Pre-OPT)**
Students in their final semester who are:
- Preparing to apply for OPT
- Need to understand filing windows (90 days before to 60 days after program end)
- Want to track their DSO recommendation date and USCIS deadlines

#### 2. **F-1 Graduates on Post-Completion OPT (Primary Audience)**
Recent graduates who:
- Are currently working on OPT EAD
- Need to track the **90-day unemployment clock** (most critical feature)
- Want reminders for EAD expiration
- Need to monitor their USCIS case status

#### 3. **STEM OPT Extension Holders**
Graduates with STEM degrees who:
- Have received a 24-month STEM OPT extension
- Need to track the **60-day unemployment limit** (60 STEM days)
- Have additional reporting requirements
- Need to ensure their I-983 training plan is valid

#### 4. **International Student Advisors (DSOs)**
Designated School Officials who:
- Advise students on OPT processes
- May recommend the tool to students
- Need to ensure students understand deadlines

---

### 🌍 Context: Why OPT Tracking Matters

**The Numbers:**
- ~1.1–1.2 million international students in the U.S. (2023)
- ~200,000+ OPT applications filed annually
- OPT is the **#1 pathway** for international talent to work in the U.S. before H-1B sponsorship

**The Pain Points:**
1. **Complex Calculations**: Filing windows depend on program end date, DSO recommendation date, and USCIS processing times
2. **No Official USCIS Tool**: USCIS provides no real-time tracking or countdown features
3. **Manual Tracking**: Most students use spreadsheets, calendar reminders, or nothing at all
4. **High Anxiety**: The consequences of errors are severe—students live in constant worry
5. **Scattered Documents**: Immigration documents are stored in emails, Google Drive, phone photos

---

### 💡 How TrackMyOPT Helps

| Feature | Problem Solved |
|---------|---------------|
| **OPT Countdown Dashboard** | Visualize days remaining until deadlines; no more manual calculations |
| **90/60-Day Unemployment Clock** | Real-time tracking with visual warnings at 60, 75, 85 days |
| **USCIS Case Status Checker** | Automatic status monitoring with email alerts on changes |
| **Document Vault** | Secure, organized storage with AI-powered expiry detection |
| **Email Reminders** | Proactive notifications before critical deadlines |
| **Chrome Extension** | Quick access to countdown without opening the full app |
| **STEM-Specific Tools** | Separate calculators for STEM extension timelines |

---

### 📋 Core Features Explained

1. **Track OPT Timeline** - Monitor critical OPT dates including program end, EAD expiration, STEM extension dates
2. **Calculate Unemployment Days** - Track the 90-day unemployment limit (or 60 days for STEM OPT) with real-time countdown
3. **USCIS Case Status Tracking** - Monitor case status updates with optional email notifications when status changes
4. **Document Vault** - Securely store and manage important immigration documents (I-20, EAD, Passport, Visa) with AI-powered analysis that auto-detects expiry dates
5. **Deadline Reminders** - Get email notifications 6 months, 3 months, 1 month, and 7 days before important dates

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TrackMyOPT Platform                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │   Chrome Extension      │◄───────►│      Web Application     │           │
│  │   (Manifest V3)         │   API   │      (Next.js 14)        │           │
│  │                         │         │                          │           │
│  │  • OPT Countdown        │         │  • Dashboard             │           │
│  │  • Clock Tracker        │         │  • Document Vault        │           │
│  │  • STEM Tools           │         │  • Case Status           │           │
│  │  • Quick Access         │         │  • Settings              │           │
│  └─────────────────────────┘         └───────────┬──────────────┘           │
│                                                  │                          │
│                                                  ▼                          │
│                              ┌───────────────────────────────┐              │
│                              │        Supabase                │              │
│                              │  • PostgreSQL Database         │              │
│                              │  • Authentication (OAuth)      │              │
│                              │  • Row Level Security          │              │
│                              └───────────────────────────────┘              │
│                                                                             │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │   External Services      │         │   Storage Services       │           │
│  │  • Stripe (Payments)     │         │  • AWS S3 (Documents)    │           │
│  │  • Resend (Emails)       │         │  • AI Analysis (Gemini)  │           │
│  │  • USCIS API (Cases)     │         │  • Virus Scanning        │           │
│  └─────────────────────────┘         └─────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
TrackMyOPT/
├── web/                         # Next.js 14 Web Application
│   ├── app/                     # App Router (pages & API routes)
│   │   ├── api/                 # 17 API route groups
│   │   ├── auth/                # Authentication pages
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── premium/             # Premium features
│   │   └── page.tsx             # Landing page
│   ├── components/              # React components
│   │   ├── dashboard/           # 35+ dashboard components
│   │   ├── ui/                  # Reusable UI components
│   │   └── opt-tools/           # OPT-specific components
│   ├── lib/                     # Utility libraries
│   │   ├── optCalculations.ts   # OPT date & unemployment calculations
│   │   ├── supabaseClient.ts    # Supabase client
│   │   ├── jwt.ts               # JWT token handling
│   │   ├── email-service.ts     # Email notifications
│   │   ├── s3.ts                # AWS S3 integration
│   │   ├── gemini-ai.ts         # AI document analysis
│   │   └── uscis-checker.ts     # USCIS case status checker
│   ├── supabase/                # Database configuration
│   │   ├── schema/              # 8 SQL schema files
│   │   └── migrations/          # Database migrations
│   └── middleware.ts            # Auth middleware
│
├── extension/                   # Chrome Extension (Manifest V3)
│   ├── src/
│   │   ├── popup.ts             # Extension popup entry point
│   │   ├── background.ts        # Service worker (auth, messaging)
│   │   ├── home.ts              # Home view renderer
│   │   ├── locked.ts            # Locked state view
│   │   ├── navigation.ts        # Page navigation
│   │   └── pages/               # 8 tool pages
│   │       ├── opt-apply.ts     # OPT application calculator
│   │       ├── opt-countdown.ts # OPT countdown display
│   │       ├── clock.ts         # Unemployment clock input
│   │       ├── clock-tracker.ts # Unemployment tracking
│   │       ├── stem-apply.ts    # STEM extension calculator
│   │       ├── stem-countdown.ts # STEM countdown display
│   │       ├── stem-clock.ts    # STEM unemployment input
│   │       └── stem-clock-tracker.ts # STEM unemployment tracking
│   ├── manifest.json            # Chrome extension manifest
│   └── public/icons/            # Extension icons
│
├── package.json                 # Root workspace config
└── pnpm-workspace.yaml          # pnpm workspace definition
```

---

## Web Application (`web/`)

### Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page with features & pricing |
| `/login` | User login page |
| `/auth/callback` | OAuth callback handler |
| `/auth/extension` | Authentication for Chrome extension |
| `/auth/reset-password` | Password reset flow |
| `/dashboard` | Main user dashboard |
| `/dashboard/opt-dates` | OPT dates management |
| `/dashboard/case-status` | USCIS case tracking |
| `/dashboard/documents` | Document vault |
| `/dashboard/opt-tools` | OPT calculation tools |
| `/dashboard/tax-filing` | Tax filing assistance |
| `/dashboard/opt-health-insurance-finder` | Health insurance finder |
| `/dashboard/settings` | User settings & preferences |
| `/dashboard/help` | Help & support |
| `/premium` | Premium upgrade page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### API Routes (17 Groups)

| API Group | Endpoints | Purpose |
|-----------|-----------|---------|
| `/api/auth` | Google OAuth, session management | Authentication |
| `/api/me` | Get current user profile & OPT status | User data |
| `/api/opt` | OPT dates CRUD operations | OPT management |
| `/api/employment` | Employment spans management | Unemployment tracking |
| `/api/case-status` | USCIS case tracking | Case monitoring |
| `/api/documents` | Upload, download, delete documents | Document vault |
| `/api/email` | Email sending & verification | Notifications |
| `/api/premium` | Stripe checkout & webhooks | Payments |
| `/api/user` | User profile updates | Profile management |
| `/api/profile` | Profile data access | Profile data |
| `/api/manual` | Manual signup/login (non-OAuth) | Auth |
| `/api/cron` | Scheduled tasks (reminders) | Automation |
| `/api/extension` | Extension-specific endpoints | Chrome extension |
| `/api/policy` | Policy consent management | Legal |
| `/api/insurance-eligibility` | Insurance eligibility check | Tools |
| `/api/admin` | Admin operations | Admin |
| `/api/employment-spans` | Employment history | OPT tracking |

### Key Components

#### Dashboard Components (`components/dashboard/`)

| Component | Description |
|-----------|-------------|
| `OptDatesSection.tsx` | Display & edit OPT dates |
| `CaseStatusSection.tsx` | USCIS case status with history |
| `DocumentVaultClient.tsx` | Document management interface |
| `UnemploymentTracker.tsx` | 90/150 day unemployment counter |
| `SettingsSection.tsx` | Comprehensive settings panel |
| `UpcomingDeadlinesPanel.tsx` | Deadline notifications |
| `PersonalizedTips.tsx` | AI-generated tips |
| `MetricCards.tsx` | Dashboard stats cards |
| `NotificationBanner.tsx` | System notifications |

#### OPT Tools Components (`components/dashboard/opt-tools/`)

| Component | Description |
|-----------|-------------|
| `TickingClock.tsx` | Real-time countdown display |
| `UnemploymentClock.tsx` | Unemployment days counter |
| `LiveStatsWidget.tsx` | Live statistics widget |
| `DateInput.tsx` | Date selection component |
| `EmailReminder.tsx` | Email reminder setup |

---

## Chrome Extension (`extension/`)

### How It Works

1. **Authentication**: Extension opens web app login page, user authenticates via Google OAuth or manual login
2. **Session Sharing**: After login, session is shared with extension via cookies
3. **API Access**: Extension calls web app APIs to fetch/display OPT data
4. **Offline Support**: Some data cached in `chrome.storage.sync`

### Extension Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `home.ts` | Main dashboard view |
| Locked | `locked.ts` | Sign-in required view |
| OPT Apply | `opt-apply.ts` | Calculate OPT application dates |
| OPT Countdown | `opt-countdown.ts` | Display countdown to deadlines |
| Clock | `clock.ts` | Input start date for unemployment |
| Clock Tracker | `clock-tracker.ts` | Track 90-day unemployment |
| STEM Apply | `stem-apply.ts` | STEM extension dates |
| STEM Countdown | `stem-countdown.ts` | STEM extension countdown |
| STEM Clock | `stem-clock.ts` | STEM unemployment input |
| STEM Clock Tracker | `stem-clock-tracker.ts` | Track 150-day STEM unemployment |

### Manifest Permissions

```json
{
  "permissions": ["identity", "storage", "tabs", "alarms", "notifications", "scripting"],
  "host_permissions": ["https://www.trackmyopt.com/*", "https://trackmyopt.com/*"]
}
```

---

## Database Schema

### Tables Overview (12 Total)

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1"
    auth_users ||--|| opt_status : "1:1"
    auth_users ||--o{ employment_spans : "1:N"
    auth_users ||--|| case_status : "1:1"
    auth_users ||--o{ documents : "1:N"
    auth_users ||--|| document_passcodes : "1:1"
    documents ||--o{ document_reminders : "1:N"
    auth_users ||--o{ email_queue : "1:N"
    auth_users ||--|| email_preferences : "1:1"
    auth_users ||--o{ payment_transactions : "1:N"
    auth_users ||--|| notification_settings : "1:1"
```

### Table Details

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profile & preferences | `email`, `timezone`, `premium_status`, `stripe_customer_id` |
| `opt_status` | OPT timeline dates | `program_end_date`, `opt_start_date`, `opt_ead_end_date`, `stem_start_date` |
| `employment_spans` | Employment history | `employer_name`, `start_date`, `end_date` |
| `case_status` | USCIS case tracking | `receipt_number`, `current_status`, `status_history` |
| `documents` | Document metadata | `file_name`, `document_type`, `s3_key`, `extracted_fields`, `expiry_date` |
| `document_passcodes` | Vault passcodes | `passcode_hash`, `failed_attempts`, `locked_until` |
| `document_reminders` | Expiry reminders | `reminder_type`, `send_at`, `status` |
| `email_preferences` | Email settings | `email_address`, `email_verified`, `email_enabled` |
| `email_queue` | Email history | `email_type`, `status`, `sent_at` |
| `payment_transactions` | Payment records | `stripe_payment_intent_id`, `amount`, `status` |
| `blocked_emails` | Blocked addresses | `email`, `reason` |
| `notification_settings` | Notification prefs | `email_notifications`, `push_notifications` |

---

## Key Features

### Free Features
- ✅ OPT dates tracking & countdown
- ✅ 90-day unemployment clock
- ✅ Basic deadline reminders
- ✅ Chrome extension access
- ✅ USCIS case status checking

### Premium Features ($2.99 one-time)
- 🔒 Document Vault with AI analysis
- 🔒 Automatic document expiry reminders
- 🔒 Advanced email notifications
- 🔒 Priority support

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant WebApp
    participant Supabase
    
    User->>Extension: Click "Sign In"
    Extension->>WebApp: Open /auth/extension
    User->>WebApp: Click "Google Sign In"
    WebApp->>Supabase: OAuth redirect
    Supabase->>WebApp: OAuth callback with tokens
    WebApp->>WebApp: Set session cookies
    WebApp->>Extension: Redirect to /dashboard
    Extension->>Extension: Detect dashboard URL
    Extension->>WebApp: GET /api/me
    WebApp->>Extension: User data + OPT status
    Extension->>User: Show home screen
```

---

## API Reference

### Core Endpoints

#### `GET /api/me`
Returns current user's profile and OPT status.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "premium_status": false
  },
  "opt_status": {
    "program_end_date": "2024-05-15",
    "opt_start_date": "2024-06-01",
    "opt_ead_end_date": "2025-05-31"
  }
}
```

#### `POST /api/opt`
Update OPT dates.

**Body:**
```json
{
  "program_end_date": "2024-05-15",
  "opt_start_date": "2024-06-01",
  "opt_ead_end_date": "2025-05-31"
}
```

#### `GET /api/case-status`
Get USCIS case status history.

#### `POST /api/documents/upload`
Upload document to vault (Premium).

---

## Tech Stack Summary

### Web Application
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Supabase** | PostgreSQL + Auth + RLS |
| **Stripe** | Payment processing |
| **AWS S3** | Document storage |
| **Resend** | Email delivery |
| **Google Gemini** | AI document analysis |
| **jose** | JWT handling |
| **Zod** | Validation |

### Chrome Extension
| Technology | Purpose |
|------------|---------|
| **Manifest V3** | Chrome extension standard |
| **TypeScript** | Type safety |
| **esbuild** | Bundling |
| **Chrome APIs** | Storage, notifications, alarms |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account
- Stripe account (for payments)
- AWS S3 bucket (for documents)

### Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd TrackMyOPT
pnpm install

# 2. Setup environment
cd web
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 3. Run database migrations in Supabase SQL Editor
# (Execute files in supabase/schema/ in order: 000 → 007)

# 4. Start development
pnpm dev:web     # Web app at http://localhost:3000
pnpm dev:ext     # Extension builds to extension/dist/

# 5. Load extension in Chrome
# chrome://extensions → Developer Mode → Load Unpacked → select extension/dist/
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SIGNING_SECRET` | Secret for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key |
| `AWS_S3_BUCKET` | S3 bucket name |
| `RESEND_API_KEY` | Resend email API key |
| `GEMINI_API_KEY` | Google Gemini AI key |

---

## OPT Calculation Logic

### Key Dates Explained

| Date | Formula | Purpose |
|------|---------|---------|
| **Earliest File Date** | `program_end_date - 90 days` | Earliest date to file OPT |
| **Latest File Date** | `program_end_date + 60 days` | Deadline to file OPT |
| **Must Arrive By** | `min(program_end + 60, dso_rec + 30)` | Latest EAD arrival date |
| **OPT Start Window** | `program_end_date → program_end + 60` | Valid OPT start dates |

### Unemployment Tracking

- **Regular OPT**: Maximum 90 days unemployed
- **STEM OPT**: Additional 60 days (60 days total)
- **Calculation**: Total days - Employed days = Unemployed days

---

## Support

For questions or issues:
- Email: support@trackmyopt.com
- Dashboard: `/dashboard/help`

---

*Last Updated: January 2026*
