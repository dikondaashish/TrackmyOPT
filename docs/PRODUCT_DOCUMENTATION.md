# TrackMyOPT — Complete Product Documentation

> **Version:** 2.0  
> **Last Updated:** January 2026  
> **Purpose:** UI/UX Design Reference for World-Class Landing Page Development

---

## 🎯 Executive Summary

**TrackMyOPT** is the **#1 comprehensive platform for international students on OPT (Optional Practical Training) and STEM OPT** in the United States. We solve the critical pain points that over 200,000+ international students face annually: tracking immigration deadlines, managing employment gaps, understanding tax obligations, finding H-1B sponsors, and navigating complex USCIS procedures.

### Mission Statement
*"Empowering international students to navigate their OPT journey with confidence, precision, and peace of mind."*

### Target Audience
- **Primary:** F-1 visa holders on OPT or STEM OPT (ages 22-35)
- **Secondary:** F-1 students approaching graduation planning for OPT
- **Tertiary:** DSOs (Designated School Officials) and immigration advisors

### Key Value Propositions
1. **Never Miss a Deadline** — Real-time countdown timers for every critical date
2. **Stay Employment Compliant** — 90/150-day unemployment tracking with alerts
3. **One Dashboard for Everything** — OPT, career tools, documents, tax guides all in one place
4. **AI-Powered Features** — Document analysis, resume parsing, ATS optimization

---

## 📊 Platform Statistics (For Social Proof on Landing Page)

| Metric | Value | Description |
|--------|-------|-------------|
| Active Users | 15,000+ | International students actively using the platform |
| Cases Tracked | 50,000+ | USCIS case status checks performed |
| Documents Secured | 25,000+ | Immigration documents stored safely |
| H-1B Sponsors | 80,000+ | Companies in our sponsor database |
| Countries Represented | 100+ | Global student community |
| Average Rating | 4.9/5 | User satisfaction score |

---

## 🏠 Core Feature Modules

### 1. OPT Timeline Dashboard (Main Dashboard)

**Purpose:** The command center for OPT timeline management.

#### What Users Can Do:
- View a **real-time countdown** to their OPT end date
- See **color-coded deadline cards** for:
  - OPT Filing Window (earliest & latest dates)
  - Next Upcoming Deadline
  - Unemployment Clock Status
  - STEM Extension Eligibility
- Visualize their **complete OPT timeline** from program end to EAD expiry
- Track **critical date milestones**:
  - Program End Date
  - DSO Recommendation Date
  - Earliest File Date (90 days before)
  - Recommended Target Date
  - Must Arrive By (hard deadline)
  - OPT Start Window (earliest to latest)
  - STEM Start Date (if applicable)

#### Key UI Elements:
- **Summary Cards Grid** (4 cards):
  - 📝 OPT Filing Window — date range
  - ⏰ Next Deadline — days countdown
  - ⏱️ Unemployment Clock — used/max days
  - 🎒 STEM Status — eligible/not eligible

- **Timeline Visualization:**
  - Vertical timeline with colored dots
  - Gray (informational), Blue (action items), Red (critical), Purple (STEM)

- **Date Selector Widget:**
  - Interactive calendar for entering/editing key dates
  - Links to dedicated OPT Dates page

#### SEO Keywords:
`OPT deadline tracker`, `OPT countdown timer`, `F-1 OPT timeline`, `OPT EAD end date calculator`, `90-day unemployment OPT`

---

### 2. Unemployment Clock

**Purpose:** Track the 90-day (OPT) or 150-day (STEM OPT) unemployment limit.

#### What Users Can Do:
- View **days used vs. days allowed** (e.g., "45 / 90 days")
- See **status badges** with traffic-light coloring:
  - 🟢 **Safe** — Plenty of buffer
  - 🟡 **Warning** — Getting close
  - 🔴 **Critical** — Immediate action needed
- Log **employment spans** with start/end dates
- Toggle between OPT (90 days) and STEM OPT (150 days) limits
- Receive **push notifications** as they approach limits

#### Key UI Elements:
- **Circular Progress Indicator** — Filled proportionally (green/yellow/red)
- **Days Used Counter** — Large numeric display
- **Employment History Log** — Accordion-style list of jobs
- **Add Employment Button** — Modal form

#### SEO Keywords:
`OPT unemployment days tracker`, `90 day rule OPT`, `STEM OPT 150 days`, `OPT employment gap counter`

---

### 3. USCIS Case Status Tracker

**Purpose:** Real-time tracking of USCIS case progress.

#### What Users Can Do:
- **Add receipt numbers** (e.g., IOE1234567890) to track
- View **current case status** with plain-English explanations
- See the **processing service center** identified automatically
- Track **status history timeline** with dates
- Enable **email notifications** for status changes
- **Refresh status** on-demand or automatically

#### Key UI Elements:
- **Receipt Number Input** — Validation for 13-char format
- **Status Card:**
  - Large status title (e.g., "Case Was Received")
  - Service center badge (e.g., "NBC", "TSC")
  - Last checked timestamp
  - Status explanation tooltip
- **Status History Accordion** — Chronological timeline
- **Notification Toggle** — Enable/disable alerts

#### Premium Features:
- Unlimited case tracking (Free: 1 case)
- Priority notifications with faster refresh

#### SEO Keywords:
`USCIS case status tracker`, `EAD tracking`, `I-765 status`, `OPT case tracker`, `immigration case status`

---

### 4. Document Vault (Premium Feature)

**Purpose:** Secure, encrypted storage for immigration documents with AI analysis.

#### What Users Can Do:
- **Upload documents** (PDF, images) with AI extraction
- Store securely with **AES-256 encryption**
- **Passcode protection** (4-6 digit PIN + auto-lock)
- AI automatically extracts:
  - Document type (I-20, EAD, Passport, etc.)
  - Issue and expiry dates
  - Key fields (receipt numbers, validity)
- View **document expiry tracking** with reminders
- **Filter/search** by document type, category
- Set **email reminders** for upcoming expirations
- **Download** any stored document instantly

#### Document Types Supported:
- 📜 Form I-20
- 🪪 EAD Card
- 🛂 Passport
- 📝 I-797 Approval Notice
- 💼 Employment Authorization Documents
- 📑 Tax Forms (W-2, 1099)
- 🏠 Lease Agreements
- 🎓 Transcripts

#### Key UI Elements:
- **Premium Banner** — Upsell for free users
- **Security Badge** — "Bank-grade encryption"
- **Document Grid** — Card layout with:
  - Document type icon
  - Color-coded header by category
  - Expiry countdown badge (if applicable)
  - AI confidence score
  - Quick actions (View, Download, Delete)
- **Upload Modal** — Drag & drop, file picker
- **Filter Bar** — Category, date range, search
- **Stats Panel** — Total docs, categories, expiring soon

#### SEO Keywords:
`immigration document storage`, `secure OPT documents`, `I-20 storage`, `EAD card vault`, `immigration records`

---

### 5. Resume Generator & Manager

**Purpose:** Upload, parse, save, and manage resumes for job applications.

#### What Users Can Do:
- **Upload resume** (PDF, DOCX) or **paste text** or **enter URL**
- **AI-powered OCR** for scanned documents (via AWS Textract)
- **Save resumes** for future use with custom names
- **Auto-save** option enabled by default
- View **saved resumes** in a grid with:
  - Preview of content
  - Created date
  - Download original file
  - Use for new applications
  - Delete
- **Parse and extract** key resume sections
- Navigate to **Template Selection** for formatting

#### Key UI Elements:
- **Three-Tab Input:**
  - 📝 Direct Text — Textarea
  - 📁 File Upload — Drag & drop zone
  - 🔗 URL — Input field
- **Saved Resumes Grid:**
  - Premium-styled cards (Document Vault aesthetic)
  - Blue header with FileText icon
  - "Parsed" badge
  - Content preview (truncated)
  - Action buttons (Use, Download, Delete)
- **Save Controls:**
  - Resume name input
  - "Save for future use" checkbox (default: checked)
- **OCR Prompt Modal** — For scanned PDFs

#### SEO Keywords:
`OPT resume builder`, `international student resume`, `resume parser`, `resume storage`

---

### 6. Job Application Tracker (Kanban Board)

**Purpose:** Visual pipeline for managing job applications.

#### What Users Can Do:
- **Kanban-style board** with drag & drop
- Default columns: Wishlist → Applied → Interview → Offer → Rejected
- **Add applications** with:
  - Company name
  - Position title
  - Application date
  - URL/link
  - Notes
- **Move cards** between stages
- View **application analytics** (total, by stage)
- **Filter by** company, date, status

#### Key UI Elements:
- **Column Headers** — Colored by stage
- **Application Cards:**
  - Company logo (if available)
  - Position title
  - Date badge
  - H-1B sponsor badge (if known)
- **Quick Actions:** Edit, Archive, Delete
- **Add Button** per column or global
- **Search Bar** — Filter applications

#### SEO Keywords:
`job application tracker`, `OPT job search`, `job pipeline manager`, `application kanban`

---

### 7. H-1B Sponsor Database

**Purpose:** Searchable database of verified H-1B sponsoring companies.

#### What Users Can Do:
- **Search 80,000+ companies** that sponsor H-1B
- **Filter by:**
  - Industry (Tech, Finance, Healthcare, etc.)
  - Location (State/City)
  - Approval rate percentage
  - Number of visas filed
- View **company details:**
  - Company name & logo
  - H-1B approval rate
  - Total petitions filed (last year)
  - Top job titles sponsored
  - Hiring trend indicator
  - Sponsor Score (proprietary algorithm)
- **Save companies** to favorites
- **Add to Job Tracker** directly with prefilled info
- **View tabs:** All, Saved, Tech Giants, Fast Growing

#### Key UI Elements:
- **Search Bar** — Company name lookup
- **Filter Tabs** — Quick category switching
- **Sponsor Cards:**
  - Company header with logo
  - Approval % (green/yellow/red)
  - Petition count badge
  - Trend arrow (↑/↓/→)
  - Star-based sponsor score
  - Actions: Save, Add to Tracker
- **Pagination** or **Infinite Scroll**
- **Stats Header** — Total sponsors, avg. approval rate

#### SEO Keywords:
`H-1B sponsor list`, `companies that sponsor H-1B`, `H-1B employer database`, `OPT to H-1B`

---

### 8. ATS Resume Scanner (Coming Soon)

**Purpose:** Analyze resume compatibility with Applicant Tracking Systems.

#### What Users Can Do:
- Upload **resume + job description**
- Get **ATS match score** (0-100%)
- See **missing keywords** highlighted
- Receive **actionable suggestions** for improvement
- Compare against industry benchmarks

#### Key UI Elements:
- **Split Upload Zone** — Resume left, JD right
- **Score Meter** — Large circular gauge
- **Issues List** — Categorized (Critical, Warnings, Tips)
- **Keyword Cloud** — Found vs. Missing
- **Download Report** — PDF export

#### SEO Keywords:
`ATS resume checker`, `resume scanner`, `keyword optimization`, `resume score`

---

### 9. Tax Filing Guide

**Purpose:** Comprehensive guide for international student tax obligations.

#### What Users Can Do:
- Take **interactive quiz** to determine filing requirements:
  - Years in U.S.
  - Income status
  - Visa type
- See **personalized recommendation**:
  - Non-Resident (Form 1040-NR)
  - Resident (Form 1040)
  - Form 8843 requirement
- View **important tax deadlines** (IRS timeline)
- Access **FAQs** for common scenarios:
  - "Do I file if no income?"
  - "Can I get FICA refund?"
  - "Do I need state taxes?"
- Get **software recommendations** (Sprintax, Glacier)
- View **exclusive discounts** for tax prep services

#### Key UI Elements:
- **Status Quiz Wizard** — Step-by-step
- **Deadline Calendar** — W-2, 1042-S, filing dates
- **FAQ Accordion** — Expandable sections
- **Filing Recommendation Card:**
  - Form number
  - Description
  - Software link
  - Discount code (if partner)
- **Alert Boxes** — Critical reminders

#### SEO Keywords:
`F-1 student taxes`, `OPT tax filing`, `non-resident alien tax`, `1040-NR guide`

---

### 10. Health Insurance Finder

**Purpose:** Find affordable health insurance options for OPT students.

#### What Users Can Do:
- **Select state** — All 50 states + DC
- **Select visa type** — F-1, OPT, STEM OPT, J-1
- Check **state-specific options** (Medicaid eligibility by state)
- View **partner insurance plans** with:
  - Monthly cost
  - Coverage details
  - OPT-specific features
- Get **affiliate links** to apply directly
- Read **health insurance FAQs**:
  - "Why need insurance?"
  - "Does university accept this plan?"
  - "Is it legally required?"
  - "Free insurance options?"

#### Key UI Elements:
- **Dropdown Selectors** — State & Visa type
- **Results Grid** — Insurance cards:
  - Provider logo
  - Plan name
  - Price per month
  - Coverage type
  - "Get Quote" button
- **FAQ Section** — Common questions
- **Disclaimer** — Non-advice notice

#### SEO Keywords:
`OPT health insurance`, `F-1 student insurance`, `cheap health insurance international students`

---

### 11. OPT/STEM Application Guides

**Purpose:** Step-by-step guides for initial OPT and STEM OPT extension applications.

#### What Users Can Do (OPT Apply):
- View **complete OPT application checklist**
- Understand **required documents**
- See **timeline recommendations**
- Access **form instructions** (I-765)

#### What Users Can Do (STEM Apply):
- Verify **STEM eligibility** criteria
- View **employer E-Verify requirements**
- Understand **I-983 Training Plan** requirements
- See **24-month extension process**

#### Key UI Elements:
- **Checklist Format** — Interactive checkboxes
- **Document Cards** — Required items
- **Timeline Visual** — Step sequence
- **Warning Boxes** — Critical requirements

#### SEO Keywords:
`how to apply for OPT`, `STEM OPT extension guide`, `I-765 instructions`, `STEM OPT I-983`

---

### 12. Settings & Profile

**Purpose:** User account management and preferences.

#### What Users Can Do:
- Update **profile information** (name, email, timezone)
- Set **STEM eligibility** status
- Manage **notification preferences**:
  - Email alerts
  - Browser notifications
  - Frequency settings
- View/manage **subscription**:
  - Current plan (Free/Premium)
  - Billing history
  - Upgrade/cancel options
- Export **all data** (GDPR compliance)
- Delete account

#### Key UI Elements:
- **Tabs/Sections:**
  - Profile
  - Dates
  - Notifications
  - Subscription
  - Privacy
- **Form Fields** with save buttons
- **Premium Badge** — For paid users
- **Plan Comparison** — Free vs. Premium

---

### 13. Help Center

**Purpose:** Comprehensive self-service support.

#### What Users Can Do:
- Browse **feature guides**
- Read **FAQs** by category:
  - Account & Billing
  - OPT Basics
  - Case Status
  - Document Vault
  - Career Tools
  - Tax & Insurance
- Access **video tutorials**
- Contact **support** via email
- View **glossary** of immigration terms

#### Key UI Elements:
- **Collapsible Sections** — By topic
- **Feature Cards** — Quick links
- **Search Bar** — Find answers
- **Contact Cards** — Support email, response time

---

## 💎 Premium Subscription

### Pricing Model
| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic OPT tracking, 1 case, 3 documents |
| **Premium** | $19.99 (lifetime) | All features, unlimited tracking, Document Vault |

### Premium-Only Features:
- ✅ **Unlimited** USCIS case tracking
- ✅ **Document Vault** with AI extraction
- ✅ **Expiry reminders** via email
- ✅ **Priority** case refresh
- ✅ **Advanced analytics**
- ✅ **Export** all data
- ✅ **Priority support**

### Why Lifetime?
International students prefer **one-time payment** over subscriptions due to:
- Uncertainty about OPT duration
- Budget constraints
- No recurring billing concerns

---

## 🎨 Design Language & Guidelines

### Brand Identity

| Element | Value |
|---------|-------|
| **Primary Colors** | Blue (#3B82F6), Purple (#8B5CF6) |
| **Accent Colors** | Green (#10B981), Amber (#F59E0B), Red (#EF4444) |
| **Backgrounds** | Light: White/Gray-50; Dark: Zinc-900/Slate-900 |
| **Border Radius** | xl (16px) for cards, full for buttons |
| **Typography** | System sans-serif (Inter recommended) |
| **Icon Style** | Lucide icons, 2px stroke |

### UI Patterns

1. **Cards** — Rounded-2xl with subtle borders, hover shadows
2. **Buttons** — Gradient backgrounds for CTAs, outlined for secondary
3. **Badges** — Colored backgrounds with rounded-full
4. **Modals** — Center-aligned, max-w-md
5. **Forms** — Labeled inputs with validation states
6. **Tables** — Striped rows, sticky headers
7. **Animations** — Subtle fade-in, scale-on-hover

### Dark Mode
Full dark mode support with:
- Zinc/Slate backgrounds
- Inverted text colors
- Muted accent colors

---

## 🔍 SEO & Content Strategy

### Primary Keywords (Target)
- `OPT timeline tracker`
- `USCIS case status tracker`
- `OPT unemployment days`
- `H-1B sponsor database`
- `F-1 student tax guide`
- `OPT health insurance`
- `international student job tracker`

### Long-tail Keywords
- `how many days of unemployment allowed on OPT`
- `how to track my OPT case status`
- `companies that sponsor H-1B for software engineers`
- `do F-1 students need to file taxes`
- `OPT EAD card expiration reminder`

### Meta Tags Recommendations

```html
<title>TrackMyOPT — The #1 OPT Timeline Tracker for International Students</title>
<meta name="description" content="Track your OPT deadlines, unemployment days, USCIS case status, and find H-1B sponsors. Join 15,000+ international students managing their OPT with confidence.">
<meta name="keywords" content="OPT tracker, STEM OPT, F-1 visa, international students, USCIS case status, H-1B sponsors, unemployment clock">
```

### Landing Page Sections (Recommended)

1. **Hero** — Bold headline, value prop, CTA
2. **Social Proof** — Stats bar (users, documents, etc.)
3. **Problem Statement** — Pain points addressed
4. **Features Grid** — 6-8 key features with icons
5. **How It Works** — 3-step process
6. **Testimonials** — Real student quotes
7. **Pricing** — Free vs. Premium comparison
8. **FAQs** — Common objections answered
9. **Final CTA** — Sign up / Get Started
10. **Footer** — Links, privacy, terms

---

## 🌍 Accessibility (AEO Considerations)

### Voice Search Optimization

**Questions users ask (optimize for featured snippets):**

- "How do I track my OPT status?"
- "How many unemployment days are allowed on OPT?"
- "What documents do I need for OPT application?"
- "Which companies sponsor H-1B visas?"
- "Do OPT students need health insurance?"

### Accessibility Features
- Semantic HTML (proper headings, labels)
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast color choices
- Screen reader-friendly

---

## 📱 Responsive Design Requirements

| Breakpoint | Target |
|------------|--------|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |

### Mobile Priorities:
1. Single-column layouts
2. Collapsible navigation (hamburger)
3. Touch-friendly buttons (44px min)
4. Full-width cards
5. Bottom navigation bar

### Desktop Enhancements:
1. Multi-column grids (3-4 cards)
2. Sidebar navigation
3. Hover states
4. Keyboard shortcuts
5. Data-dense views

---

## 🚀 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TailwindCSS |
| **Backend** | NestJS (Node.js) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Google, Email) |
| **Storage** | AWS S3 (documents) |
| **Payments** | Stripe |
| **AI/ML** | AWS Textract (OCR), OpenAI (parsing) |
| **Hosting** | Vercel (frontend), Render (API) |

---

## 📋 Appendix: User Journeys

### Journey 1: New OPT Tracking User
1. Land on homepage → Click "Get Started"
2. Sign up with Google
3. Prompted to enter key dates (program end, OPT dates)
4. Dashboard shows calculated timeline
5. Receives welcome email with tips

### Journey 2: Premium Document Vault User
1. Navigate to Document Vault
2. Sees premium upsell → Clicks to upgrade
3. Completes $19.99 payment via Stripe
4. Sets up passcode
5. Uploads first document
6. AI extracts fields, document saved
7. Receives expiry reminder email before document expires

### Journey 3: Job Seeker User
1. Browse H-1B Sponsor Database
2. Filters by Tech + California
3. Saves 5 companies
4. Adds 2 to Job Tracker
5. Uploads resume to Resume Generator
6. Navigates to applications, drags to "Applied"

---

## ✅ Summary for UI/UX Designer

**Your task:** Create a landing page that:

1. **Immediately communicates value** — OPT deadline stress solved
2. **Builds trust** — Stats, testimonials, security badges
3. **Shows features** — Visual grid with icons and short descriptions
4. **Drives conversion** — Clear CTA to sign up
5. **Supports SEO** — Proper headings, keyword-rich content
6. **Works beautifully** — On all devices, light/dark modes
7. **Feels premium** — Modern gradients, animations, polish

**Design inspiration:** Notion, Linear, Mercury Bank, Stripe Dashboard

---

*Document created for internal UI/UX design reference. Not for public distribution.*
