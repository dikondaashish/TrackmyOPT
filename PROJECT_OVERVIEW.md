# TrackMyOPT - Complete Project Overview

> **A comprehensive platform for OPT (Optional Practical Training) timeline management**, consisting of a Next.js web application and a Chrome browser extension.

---

## 📚 Table of Contents

- [What is TrackMyOPT?](#what-is-trackmyopt)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Web Application](#web-application-web)
- [Chrome Extension](#chrome-extension-extension)
- [USCIS Case Status API Integration](#uscis-case-status-api-integration)
- [Career Tools](#career-tools)
- [Email Notification System](#email-notification-system)
- [Database Schema](#database-schema)
- [Key Features](#key-features)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Tech Stack Summary](#tech-stack-summary)
- [Security & Credentials](#security--credentials)
- [Getting Started](#getting-started)

---

## What is TrackMyOPT?

TrackMyOPT is a **SaaS platform designed specifically for international students and graduates in the United States** who are on F-1 visa status and utilizing Optional Practical Training (OPT) work authorization.

**Live URL:** [https://www.trackmyopt.com](https://www.trackmyopt.com)

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
| **H-1B Sponsorship Search** | Finding companies that sponsor H-1B is extremely difficult |

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
- Need help finding H-1B sponsoring employers

#### 3. **STEM OPT Extension Holders**
Graduates with STEM degrees who:
- Have received a 24-month STEM OPT extension
- Need to track the **60-day unemployment limit** (60 STEM days)
- Have additional reporting requirements
- Need to ensure their I-983 training plan is valid

---

### 💡 How TrackMyOPT Helps

| Feature | Problem Solved |
|---------|---------------|
| **OPT Countdown Dashboard** | Visualize days remaining until deadlines; no more manual calculations |
| **90/60-Day Unemployment Clock** | Real-time tracking with visual warnings at 60, 75, 85 days |
| **USCIS Case Status Checker** | Automatic status monitoring with email alerts on changes |
| **H-1B Sponsor Database** | Search 100,000+ companies that sponsor H-1B visas |
| **Job Application Tracker** | Kanban board to track job applications with follow-up reminders |
| **Document Vault** | Secure, organized storage with AI-powered expiry detection |
| **Email Reminders** | Proactive notifications before critical deadlines |
| **Chrome Extension** | Quick access to countdown without opening the full app |

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
│  │  • Clock Tracker        │         │  • Case Status Tracker   │           │
│  │  • STEM Tools           │         │  • H-1B Sponsor Database │           │
│  │  • Quick Access         │         │  • Job Application Tracker│          │
│  └─────────────────────────┘         │  • Document Vault        │           │
│                                      └───────────┬──────────────┘           │
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
│  │  • Nodemailer (Emails)   │         │  • AI Analysis (Gemini)  │           │
│  │  • USCIS API (Cases)     │         │  • Virus Scanning        │           │
│  │  • cron-job.org (Cron)   │         │                          │           │
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
│   │   ├── api/                 # 20+ API route groups
│   │   │   ├── case-status/     # USCIS case tracking APIs
│   │   │   ├── cron/            # Automated job endpoints
│   │   │   ├── documents/       # Document vault APIs
│   │   │   └── user/            # User settings
│   │   ├── auth/                # Authentication pages
│   │   └── dashboard/           # Dashboard pages
│   │       ├── case-status/     # USCIS case tracker
│   │       ├── career/          # Career tools
│   │       │   ├── h1b-sponsors/    # H-1B sponsor database
│   │       │   ├── job-tracker/     # Job application tracker
│   │       │   ├── ats-scanner/     # Resume ATS scanner
│   │       │   └── resume-generator/ # Resume builder
│   │       └── documents/       # Document vault
│   ├── components/              # React components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── career/              # Career tool components
│   │   │   ├── h1b/             # H-1B sponsor components
│   │   │   └── job-tracker/     # Job tracker components
│   │   └── ui/                  # Reusable UI components
│   ├── lib/                     # Utility libraries
│   │   ├── uscis-checker.ts     # USCIS Case Status API
│   │   ├── email-service.ts     # Email notifications
│   │   └── career/              # Career utilities
│   │       └── job-tracker/     # Job tracker utilities
│   └── supabase/                # Database configuration
│       ├── schema/              # SQL schema files
│       └── migrations/          # Database migrations
│
├── extension/                   # Chrome Extension (Manifest V3)
│   ├── src/                     # Extension source
│   └── manifest.json            # Chrome manifest
│
└── PROJECT_OVERVIEW.md          # This file
```

---

## Web Application (`web/`)

### Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page with features & pricing |
| `/dashboard` | Main user dashboard |
| `/dashboard/case-status` | **USCIS case tracking** |
| `/dashboard/career` | Career tools hub |
| `/dashboard/career/h1b-sponsors` | **H-1B Sponsor Database** (100K+ companies) |
| `/dashboard/career/job-tracker` | **Job Application Tracker** (Kanban board) |
| `/dashboard/career/ats-scanner` | Resume ATS scanner |
| `/dashboard/career/resume-generator` | Resume builder |
| `/dashboard/documents` | Document vault |
| `/dashboard/opt-dates` | OPT dates management |
| `/dashboard/opt-tools` | OPT calculation tools |
| `/premium` | Premium upgrade page |

---

## USCIS Case Status API Integration

### Overview

The application integrates with the **official USCIS Case Status API** to provide automatic case tracking.

### Current Mode: **Sandbox (Demo)**

| Property | Value |
|----------|-------|
| **API Provider** | USCIS (U.S. Citizenship and Immigration Services) |
| **Authentication** | OAuth 2.0 Client Credentials |
| **Sandbox URL** | `https://api-int.uscis.gov/case-status` |
| **Demo ID Header** | `demo_id: 3333` (required for sandbox) |

### Sandbox Limitations

| Limitation | Details |
|------------|---------|
| **Operating Hours** | Monday - Friday, 7:00 AM - 8:00 PM EST |
| **Receipt Numbers** | Only staging/test numbers work |
| **Rate Limits** | 5 TPS, 1,000 requests/day |

### Valid Staging Receipt Numbers

| Receipt Number | Status |
|----------------|--------|
| `EAC9999103403` | Approved case |
| `SRC9999102777` | Active case |
| `LIN9999106498` | Pending case |

### Error Handling

| Error Code | Meaning | User Message |
|------------|---------|--------------|
| **401** | Invalid/expired token | "🔐 Unauthorized: Your session has expired" |
| **404** | Receipt not found | "🔍 Receipt Not Found: Not valid in Sandbox mode" |
| **422** | Invalid format | "⚠️ Invalid Format: Must be 13 characters" |
| **429** | Rate limit exceeded | "⏱️ Rate Limit: Too many requests" |
| **503** | Service unavailable | "🔴 Sandbox is offline (Mon-Fri 7AM-8PM EST)" |

### Premium vs Free Features

| Feature | Free | Premium |
|---------|------|---------|
| Check case status | ✅ Manual refresh only | ✅ Auto-check every 6 hours |
| View current status | ✅ | ✅ |
| Status history | ✅ | ✅ |
| Email notifications | ❌ | ✅ On status change |
| Next check countdown | ❌ | ✅ |

---

## Career Tools

### 1. H-1B Sponsor Database

**Route:** `/dashboard/career/h1b-sponsors`

A searchable database of **100,000+ companies** that have sponsored H-1B visas.

| Feature | Description |
|---------|-------------|
| **Search** | Search by company name, location, industry |
| **Filters** | Filter by industry, state, visa petitions |
| **Sponsor Details** | View company info, petition counts, locations |
| **Save Sponsors** | Bookmark companies for later |

### 2. Job Application Tracker

**Route:** `/dashboard/career/job-tracker`

A Kanban-style board to track job applications through the hiring process.

| Feature | Description |
|---------|-------------|
| **Kanban Board** | 7 columns: Wishlist → Applied → Recruiter Screen → Interviewing → Final Round → Offer → Rejected |
| **Drag & Drop** | Move applications between stages |
| **Follow-ups** | Set and track follow-up reminders |
| **Toolbar** | Search, filter by status/follow-ups, sort |
| **Follow-ups Widget** | See overdue/due today/due this week |
| **Offer Details** | Track salary, start date, H-1B sponsorship |
| **Archive** | Archive old applications |

### 3. ATS Resume Scanner

**Route:** `/dashboard/career/ats-scanner`

Scan resumes for ATS compatibility.

### 4. Resume Generator

**Route:** `/dashboard/career/resume-generator`

Build professional resumes.

---

## Email Notification System

### Email Types

| Email Type | Trigger | Recipients |
|------------|---------|------------|
| **Case Status Change** | USCIS status changes | Premium users |
| **Document Expiry** | Document approaching expiry | Premium users |
| **Follow-up Reminder** | Scheduled follow-up due | All users (planned) |

### Email Flow

```
Status changes → Check if premium → Send email notification
```

---

## Automated Jobs (Cron)

### Cron Jobs

| Job | Frequency | Endpoint | Who Gets Checked |
|-----|-----------|----------|-----------------|
| **Case Status Check** | Every 6 hours | `/api/cron/check-case-status` | **Premium users only** |
| **Daily Reminders** | Daily 9 AM ET | `/api/cron/send-daily-reminders` | All users |

---

## Database Schema

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile & premium status |
| `opt_status` | OPT timeline dates |
| `case_status` | USCIS case tracking |
| `job_applications` | Job application tracker |
| `documents` | Document vault |
| `h1b_sponsors` | H-1B sponsor database |

### Job Applications Table

```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT,
  job_url TEXT,
  status TEXT NOT NULL, -- Wishlist, Applied, etc.
  applied_date DATE,
  notes TEXT,
  interviews JSONB DEFAULT '[]',
  followups JSONB DEFAULT '[]',
  offer_salary NUMERIC(10,2),
  offer_start_date DATE,
  offer_deadline DATE,
  sponsor_h1b BOOLEAN,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Key Features

### Free Features
- ✅ OPT dates tracking & countdown
- ✅ 90-day unemployment clock
- ✅ USCIS case status checking (manual refresh)
- ✅ H-1B Sponsor Database (search & filter)
- ✅ Job Application Tracker
- ✅ Chrome extension access

### Premium Features ($2.99 one-time)
- 🔒 **Automatic case status checks** (every 6 hours)
- 🔒 Email notifications on status change
- 🔒 Document Vault with AI analysis
- 🔒 Document expiry reminders
- 🔒 Priority support

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
| **Nodemailer** | Email delivery (SMTP) |
| **Google Gemini** | AI document analysis |
| **dnd-kit** | Drag and drop for Kanban |

### External Services
| Service | Purpose |
|---------|---------|
| **USCIS API** | Case status checking |
| **cron-job.org** | Scheduled job execution |
| **Vercel** | Hosting & deployment |

---

## Security & Credentials

### Environment Variables (Server-Side Only)

All sensitive credentials are stored as **environment variables on Vercel**, never in code:

| Variable | Description |
|----------|-------------|
| `USCIS_CLIENT_ID` | USCIS API client ID |
| `USCIS_CLIENT_SECRET` | USCIS API client secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Database admin access |
| `CRON_SECRET` | Cron job authentication |
| `STRIPE_SECRET_KEY` | Payment processing |
| `SMTP_*` | Email credentials |

### Security Practices

1. **Client credentials stored server-side only** - Never exposed to browser
2. **API routes use service role key** - Not the anon key for database writes
3. **CRON_SECRET protects cron endpoints** - External services must authenticate
4. **Row Level Security (RLS)** - Database enforces user isolation

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account
- Stripe account (for payments)

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

# 3. Start development
pnpm dev     # Web app at http://localhost:3000
```

---

## Recent Updates (January 2026)

1. **Job Application Tracker** - Full Kanban board with drag-and-drop
2. **Follow-ups Widget** - Track overdue/due today/this week
3. **Offer Details Section** - Track salary, dates, H-1B sponsorship
4. **H-1B Sponsor Database** - 100K+ companies searchable
5. **Premium vs Free Differentiation** - Auto-checks only for premium
6. **Column Empty States** - Friendly messages per Kanban column
7. **Enhanced Error Handling** - All USCIS 4xx errors displayed clearly

---

## Support

- **Website:** [https://www.trackmyopt.com](https://www.trackmyopt.com)
- **Email:** support@trackmyopt.com
- **Help:** `/dashboard/help`

---

*Last Updated: January 16, 2026*
