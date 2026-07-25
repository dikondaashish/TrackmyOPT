# Directory Deep-Dive 📂

Getting lost in folders? Here is a map of the TrackMyOPT monorepo.

## 1. Root Directory

- **`apps/`**: The core applications (Web, API, Extension).
- **`scripts/`**: DevOps scripts for indexing and maintenance.
- **`docs/`**: (You are here) In-depth technical guides.
- **`render.yaml`**: Deployment instructions for Render.com.
- **`docker-compose.yml`**: Runs local Redis for testing.

---

## 2. Frontend (`apps/web`)

The frontend is the largest application. It follows Next.js 16 App Router patterns.

- **`app/`**: **The Routes**.
  - `(auth)/`: Authentication pages (Login, Signup, Callback).
  - `dashboard/`: The private user experience. Each folder (e.g., `/documents`) corresponds to a URL path.
  - `layout.tsx`: Global navigation and theme providers.
- **`components/`**: **The Bricks**.
  - `dashboard/widgets/`: **CRITICAL**. These are the "blocks" that make up the home dashboard (Resource Center, Tools Grid, etc.).
  - `layout/`: Global components like Sidebar and Header.
  - `ui/`: Base components (buttons, inputs) based on shadcn/radix patterns.
- **`lib/`**: **The Tools**.
  - `auth/`: JWT and session logic.
  - `immigration/`: Specialized data for OPT and H-1B logic.
  - `aws/`: S3 and Textract service wrappers.
  - `secure-logger.ts`: **IMPORTANT**. Sanitized logging to prevent secret leaks in production.

---

## 3. Backend Engine (`apps/api`)

Built with NestJS for enterprise-grade feature isolation.

- **`src/`**: All source code.
  - `uscis/`: Logic for checking case statuses via scrapers or official APIs.
  - `ocr/`: Logic for parsing documents.
  - `queues/`: BullMQ configuration for background workers.
  - `mail/`: Email templates and delivery logic.
- **`test/`**: Integration and unit tests.

---

## 4. Browser Extension (`apps/extension`)

A lightweight React app that lives in the browser.

- **`src/`**:
  - `content-scripts/`: Code that "injects" into other websites (like LinkedIn or USCIS).
  - `popup/`: The UI you see when clicking the extension icon.
  - `background/`: Long-running script that handles sync and state.

---

## 🔍 Naming Conventions
- **Files**: `kebab-case.tsx` (e.g., `user-profile.tsx`).
- **Components**: `PascalCase` inside the file (e.g., `export function UserProfile`).
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `JWT_EXPIRY_TIME`).
- **Hooks**: Start with "use" (e.g., `useAuth.ts`).
