<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into TrackMyOPT, a Next.js 16 App Router application. The following changes were made:

- **`instrumentation-client.ts`** (new): Initializes PostHog on the client side using the Next.js 15.3+ instrumentation pattern. Enables automatic exception capture and reverse-proxy ingestion via `/ingest`.
- **`lib/posthog-server.ts`** (new): Server-side PostHog client factory used in API routes and Server Actions.
- **`next.config.js`**: Added `/ingest` reverse-proxy rewrites so PostHog requests go through your domain (better ad-blocker resilience), set `skipTrailingSlashRedirect: true`, and added PostHog domains to the Content Security Policy `connect-src`.
- **`.env.local`**: Added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.
- **`package.json`**: Added `posthog-js` and `posthog-node` dependencies.
- **12 event capture sites** across 8 files (see table below).

> **Action required:** Run `pnpm install` from the monorepo root to install `posthog-js` and `posthog-node`.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_up` | New user created via Google OAuth | `app/auth/callback/route.ts` |
| `user_signed_in` | Returning user signs in via Google OAuth | `app/auth/callback/route.ts` |
| `user_signed_out` | User signs out of the application | `app/auth/signout/route.ts` |
| `job_application_created` | User adds a job to their tracker (web dashboard) | `app/dashboard/career/job-tracker/actions.ts` |
| `job_application_status_updated` | User moves a job card to a new Kanban stage | `app/dashboard/career/job-tracker/actions.ts` |
| `job_application_deleted` | User deletes a job application | `app/dashboard/career/job-tracker/actions.ts` |
| `insurance_eligibility_checked` | User submits the insurance eligibility form | `app/dashboard/opt-health-insurance-finder/page.tsx` |
| `insurance_plan_clicked` | User clicks "Apply" or "View Plans" for a partner | `app/dashboard/opt-health-insurance-finder/results/page.tsx` |
| `document_uploaded` | User uploads a document to the Document Vault (premium) | `app/api/documents/upload/route.ts` |
| `receipt_added` | User saves a USCIS receipt number for the first time | `app/api/case-status/route.ts` |
| `receipt_updated` | User updates receipt or notification settings | `app/api/case-status/route.ts`, `app/api/case-status/notifications/route.ts` |
| `case_status_explainer_viewed` | Free-user status explainer card renders (client) | `components/dashboard/case-status/CaseStatusExplainerCard.tsx` |
| `resume_compiled` | User successfully compiles their LaTeX resume to PDF | `app/api/resume-generator/compile/route.ts` |
| `extension_job_added` | Chrome extension adds a job on behalf of the user | `app/api/extension/job-application/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/369087/dashboard/1430901
- **New Signups (Daily)**: https://us.posthog.com/project/369087/insights/rfLLZdQD
- **Job Tracker Activity**: https://us.posthog.com/project/369087/insights/rEDh0WX9
- **Insurance Finder Conversion Funnel**: https://us.posthog.com/project/369087/insights/R4aMGqzl
- **Premium Feature Engagement**: https://us.posthog.com/project/369087/insights/0YFEc44V
- **User Activation Funnel**: https://us.posthog.com/project/369087/insights/sbH7nfzE

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
