# TrackMyOPT 🚀

A comprehensive platform designed to help F-1 students effortlessly manage their OPT, STEM OPT, and immigration journeys.

## 🏗 Architecture & Tech Stack

This project is built as a **PNPM Monorepo**, ensuring a clean separation between applications and shared configurations.

### Core Technologies
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **AI Engine**: Google Gemini API & AWS Textract (OCR)
- **Payments**: Stripe

---

## 📁 Project Structure

### `/apps/web`
The main Next.js application. It follows a feature-driven directory structure:

- **`/app`**: Next.js App Router. Contains all pages and API routes (Dashboard, Auth, Landing).
- **`/components`**:
  - **`/dashboard`**: Sub-divided into logical features:
    - `widgets/`: Dynamic dashboard tiles (Resource Center, Tools, Help).
    - `case-status/`: USCIS tracking and timeline visualizations.
    - `documents/`: The "Document Vault" for encrypted storage.
    - `opt/`: Specific tools for OPT/STEM OPT reporting.
    - `settings/` & `security/`: User profile and security (Passcode) management.
  - **`/layout`**: Global components like Sidebar, Header, and Theme Provider.
  - **`/landing`**: Marketing components and guest preview features.
  - **`/ui`**: Base atomic components (buttons, inputs, tooltips).
- **`/lib`**: Core business logic and utilities:
  - `auth/`: JWT handling and rate-limiting.
  - `aws/`: S3 and Textract OCR logic.
  - `immigration/`: Specialized USCIS and insurance eligibility tools.
  - `ai/`: AI prompt engineering and generator logic.

---

## 🚀 Key Features

### 1. USCIS Case Tracker 🕵️‍♂️
Real-time tracking of USCIS applications with automated status updates and timeline visualizations.

### 2. AI Resume Optimizer 📝
Advanced AI-powered resume generator specifically tuned for international students navigating the OPT job market. Uses OCR (AWS Textract) to parse existing resumes.

### 3. Document Vault 🔒
Encrypted document storage with multi-layer security (AES-256) and optional passcode protection.

### 4. OPT Clock & Deadlines ⏰
Automated calculation of unemployment days, filing windows, and critical reporting deadlines.

### 5. Health Insurance Finder 🏥
A state-by-state eligibility tool helping F-1 students find state-sponsored insurance plans.

---

## 🛠 Development Workflow

### Prerequisites
- [PNPM](https://pnpm.io/) installed.
- Node.js >= 18.17.0.

### Installation
```bash
pnpm install
```

### Running Locally
```bash
pnpm dev
```

### Deployment
The project is optimized for **Vercel**. Run the build locally to verify:
```bash
pnpm build
```

---

## 🤝 For New Developers
Welcome! To get started:
1. Review the [Architectural Overview](./docs/ARCHITECTURAL_OVERVIEW.md).
2. Explore a component in `apps/web/components/dashboard` to understand our pattern.
3. Check `apps/web/lib/supabaseClient.ts` for database interaction patterns.

**Stay lean**: We prioritize clean code and minimal redundancy. Use our specialized subdirectories rather than dumping files into roots.
