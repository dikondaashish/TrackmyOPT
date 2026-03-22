# Internal Architectural Overview

This document provides a technical deep-dive into the design patterns used in TrackMyOPT.

## 1. Data Layer (Supabase)

We use **Supabase** as our unified backend. 
- **PostgreSQL**: Stores user profiles, employment history, case status logs, and document metadata.
- **Supabase Auth**: Handles social logins and JWT-based session management.
- **Supabase Storage**: Stores user documents (I-20s, EAD cards, Resumes).

### Data Access Pattern
We use the `@supabase/ssr` and `@supabase/supabase-js` clients. 
- **Client-side**: `lib/supabaseClient.ts` provides a pre-configured client for use in Hooks and React components.
- **Server-side**: API routes and Server Components create a client on-the-fly to ensure proper session verification.

---

## 2. Component Design (Atomic & Feature-Based)

### Base UI (`components/ui/`)
We follow an atomic design approach for basic UI elements (Buttons, Inputs, Modals). These should be generic and reusable across the brand.

### Feature Subdirectories
Components related to a specific feature (e.g., the Document Vault) are grouped into their own subdirectories within `components/dashboard/`.
- **Pattern**: `DashboardContent.tsx` acts as the orchestrator for the main dashboard view, importing specialized "widgets" from the `widgets/` folder.
- **Reusability**: Shared feature components (like the `PremiumUpsellModal`) are kept in `widgets/` so they can be imported by different feature pages.

---

## 3. Security Model (Document Vault)

The Document Vault uses a multi-layer security approach:
1. **Server-Side Validation**: All document access is protected by Supabase RLS (Row Level Security).
2. **Client-Side Passcode**: High-sensitivity documents can be locked with a secondary PIN.
3. **Audit Trails**: Security actions (like passcode setup or verification) are logged for compliance.

---

## 4. AI & Resume Generation

The platform integrates AI directly into the user workflow.
- **Prompts**: All AI system prompts are centralized in `lib/ai/prompts/`.
- **OCR Pipeline**: 
  1. User uploads PDF.
  2. `AWS Textract` performs OCR to extract raw text.
  3. `Google Gemini` processes the text to generate optimized resume content.

---

## 5. Development Standards

- **TypeScript**: Strictly enforced. Avoid `any`. Define interfaces for all API responses in `lib/types`.
- **Imports**: Use the `@/` alias for absolute imports from the project root.
- **Performance**: Use Next.js dynamic imports (`next/dynamic`) for heavy dashboard components to improve initial load time.
- **Cleanliness**: Regularly audit for dead code. Every file in the root `components/dashboard/` should have a clear reason to exist; otherwise, it belongs in a sub-folder.
