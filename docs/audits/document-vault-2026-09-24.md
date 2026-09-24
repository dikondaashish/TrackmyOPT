# Document Vault design and behavior audit

Date: 2026-09-24. Repository: `dikondaashish/TrackmyOPT`.
Base: `a53dd9a`. Scope: `/dashboard/documents` and its immediate dependencies.

## Outcome

Reduced the header and reminder panel, tightened page spacing, improved mobile
layouts, and retained the existing color classes and theme. The security explanation
remains after the document list. Fixed action feedback, preview recovery, upload
completion, expiry editing, reminder drafts, and modal keyboard access.

This is a page audit, not a whole-repository security certification. Production
data, database policies, billing, deployment configuration, and API contracts were
not changed.

## Architecture and inventory

Next.js App Router serves the authenticated page; client React components manage
the screen lock, list, forms and dialogs. Same-origin API routes check the signed-in
user and ownership. Supabase stores metadata, AWS S3 stores files, and upload calls
the existing scanning and AI analysis services. The passcode is a screen lock;
account authorization remains the server boundary.

Paths below are relative to `apps/web/`. All eight document production components
were inspected, together with the page and the directly used functions below.

| Area | Inspected source |
| --- | --- |
| Entry | `app/dashboard/documents/page.tsx` |
| UI | `components/dashboard/documents/DocumentVaultClient.tsx`, `DocumentGrid.tsx`, `DocumentCard.tsx`, `DocumentStats.tsx`, `DocumentFilters.tsx`, `DocumentViewModal.tsx`, `DocumentUploadModal.tsx`, new `DocumentReminderEmail.tsx` |
| Screen lock UI | `components/dashboard/security/PasscodeVerifyModal.tsx`, `components/dashboard/settings/PasscodeSetupModal.tsx` |
| Page API | `app/api/documents/route.ts`, `upload/route.ts`, `rate-limit/route.ts`, `[id]/route.ts`, `[id]/download/route.ts` |
| Account dependencies | `app/api/user/notification-email/route.ts`, `app/api/documents/passcode/status/route.ts`, `app/api/documents/passcode/verify/route.ts` |
| Utilities | `lib/documents/vault-utils.ts`, `lib/browser-download.ts`, `lib/document-type-icons.ts`, `lib/aws/s3.ts`, document reminder scheduling in `lib/notifications/reminders.ts` |
| External processing boundary | Upload scanning in `lib/aws/virus-scan.ts` and document-analysis fallback in `lib/ai/gemini-ai.ts`; unrelated functions in these services excluded |
| Existing tests | `components/dashboard/documents/DocumentUploadModal.test.tsx`, `lib/documents/vault-utils.test.ts`, `app/api/documents/[id]/route.test.ts` |
| Added coverage | `app/api/documents/upload/route.test.ts`, `app/api/documents/[id]/download/route.test.ts`, `e2e/documents.spec.ts`, `e2e/fixtures/vault/{index.html,main.tsx}`, `playwright.documents.config.ts` |

Configuration reviewed: repository and web package scripts, TypeScript, ESLint,
Next.js local guidance, Vitest, Playwright, global styling, Tailwind and test CI.
Generated files, dependencies, applied migrations, resume-template utilities,
unrelated dashboard pages, reminder delivery jobs, and settings-only passcode
change routes are excluded from this page redesign. Forgot-passcode reset code
was read for context only; its separate security finding is recorded below.

## Confirmed issues and fixes

All locations refer to the files in the inventory above.

| Priority | Location | Evidence / impact | Applied fix and verification |
| --- | --- | --- | --- |
| Medium | `DocumentViewModal.tsx:113` | Live Edit Expiry opened an input below the visible viewport without focus or an associated label. | Focus and scroll the editor into view; label inputs; keep failed drafts. Browser tests cover edit, failure, clear, reopen and three viewport widths. |
| Medium | `DocumentGrid.tsx:63`, `DocumentViewModal.tsx:91` | Downloads had no pending state, used alerts, and the viewer disabled download when preview failed. | Shared download handler, duplicate-click guard, inline errors; independent preview retry/refresh and original-file download. Browser tests cover success, failure, retry and pending requests. |
| Medium | `DocumentGrid.tsx:83` | Generic browser deletion confirmation lacked document context and useful retry feedback. | Named confirmation, Cancel initially focused, pending guard, retained record on failure, close viewer after success. Mocked browser and server tests verify cancellation, ownership and storage/DB failure behavior. |
| Medium | `DocumentUploadModal.tsx:46` | Empty files could be selected; advertised drop area lacked drop handling; completion timing/closing could miss the refresh. | Empty-file rejection, single-file drop handling, same-file reselection, explicit completion, Escape/X refresh after success. Browser and route tests cover upload/retry and validation. |
| Medium | `DocumentReminderEmail.tsx:6` | Shared saved/draft state and refetch-on-cancel made cancellation fragile, especially after emptying the input. | Separate saved value and draft, native email validation, abortable initial load, clear failure/retry status. Browser tests verify invalid input, failed saves, retry and cancel. |
| Medium | `PasscodeVerifyModal.tsx:123`, `PasscodeSetupModal.tsx:76` | Overlay containers did not provide native modal focus confinement or consistently associated input labels. | Native dialogs, named inputs and announced errors; existing verification/setup APIs unchanged. Keyboard, mismatch, unlock and auto-lock browser checks pass. |
| Low | `DocumentVaultClient.tsx:50` | Every mouse movement updated React state and restarted inactivity effects. | Store activity time in a ref. Fake-clock browser test verifies inactivity still locks and hides documents. |
| Low | Page, card, stats and filter components | Excess spacing, narrow-screen control crowding, long text and loading statistics weakened scanning. | Compact header/reminder row, two-column mobile stats, scrollable categories, responsive search/sort, consistent action sizes and loading placeholders. Screenshots inspected at 320, 390, 768 and 1280 pixels with light/dark coverage; overflow checks pass. |

Classification: user-authorized design and behavior fixes; small accessibility,
validation and feedback corrections were applied in the UI. Existing server
behavior was tested without changing its authorization or deletion contracts.

## Verification

- `pnpm --filter web test`: **248 files, 1,514 tests passed**.
- Focused document API/component/utility run: **7 files, 31 tests passed**.
- `pnpm --filter web exec playwright test --config playwright.documents.config.ts --reporter=line`: **12 passed**.
- `pnpm --filter web typecheck`: passed.
- `pnpm --filter web lint`: **0 errors, 286 existing warnings**. Before this work,
  the baseline had 293 warnings; the branch was subsequently updated from main.
- `pnpm --filter web build`: passed, including TypeScript and 400 generated pages.
- React Doctor, changed files including untracked additions: **78/100, no errors**,
  matching the earlier broad-audit score. Remaining warnings concern component
  size/state complexity and effect-based fetching; guarded async cleanup was
  reviewed. The missing submit-button type reported by the scan was corrected.
- `git diff --check`: passed.

The initial typecheck was blocked by four duplicate generated `.next/types/* 2.ts`
files. They were moved out of generated output, after which the check passed; no
source files were removed. One browser run timed out while the build and full test
suite competed for resources; subsequent full browser runs passed. The generic
skill commands `check:sizes`, `check:colors` and `check:migrations` do not exist in
this repository, so they were not claimed as checks.

The browser harness renders the actual vault components and stylesheet under
React Strict Mode, using synthetic documents and mocked API responses. Downloads
produce browser download events with the original filenames. PDF coverage verifies
iframe source and original-file download using a valid one-page synthetic PDF;
it does not assert Chrome's internal PDF renderer. API tests separately exercise
authentication, ownership filters, upload signatures, scanning failure, attachment
bytes and storage/database failure handling with mocked service boundaries.

## Live verification and remaining follow-up

The deployed image preview loaded successfully. The live expiry-focus defect was
reproduced before fixing it locally. The user unlocked the vault again, but the
Chrome connector reset and subsequently returned `User unavailable`; live PDF
rendering and live download verification could not be completed. No real documents
were uploaded, edited or deleted, and no reminder emails were sent during testing.

**Related security follow-up — Medium, Escalate:**
`app/api/documents/passcode/forgot/send-otp/route.ts:29` uses `Math.random()` for a
reset OTP. It should use a cryptographic generator such as `crypto.randomInt`.
This was observed while reviewing the separate forgot-passcode workflow, whose
successful reset permanently clears the vault. The
`full-codebase-audit-and-micro-completion` skill classifies auth-flow changes as
Escalate. This separate reset workflow is outside the page interactions changed
here; review its issuance throttling and reset regression tests together.

Remaining release verification: after deployment, confirm a real PDF renders and
downloads in the authenticated browser. Local checks and a successful Git push
alone do not establish deployment health or live storage availability.
