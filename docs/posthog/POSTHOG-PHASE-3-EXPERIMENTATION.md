# Phase 3 — Experimentation & Growth

**Date:** 2026-07-05  
**PostHog project:** [369087](https://us.posthog.com/project/369087)  
**Status:** 100% complete (code + PostHog config)

---

## 3.1 + 3.2 — Onboarding receipt experiment

| Asset | Link |
|-------|------|
| Experiment | [381118 — Onboarding receipt variant](https://us.posthog.com/project/369087/experiments/381118) |
| Feature flag | `onboarding-receipt-variant` (auto-created, **running**) |

### Variants (45 / 45 / 10)

| Variant | Behavior |
|---------|----------|
| `control` | Current wizard — optional receipt step with skip |
| `deferred` | After dates save → finish onboarding; receipt via dashboard checklist |
| `required` | Skip hidden; dismiss blocked on receipt step until receipt saved |

### App wiring

| File | Role |
|------|------|
| `lib/posthog/onboarding-receipt-variant.ts` | Variant types + helpers |
| `hooks/useOnboardingReceiptVariant.ts` | Resolves flag when wizard opens |
| `components/dashboard/onboarding/OnboardingWizard.tsx` | Variant UX + exposure event |

### Events

| Event | When |
|-------|------|
| `onboarding_receipt_variant_exposed` | Wizard opens and flag resolves (once per session) |

### Primary / guardrail metrics (PostHog)

- **Primary:** `receipt_added` (unique users / DAU math)
- **Guardrail:** `onboarding_completed` (unique users / DAU math)

> After deploy, add custom exposure event `onboarding_receipt_variant_exposed` in experiment settings if you want exposure-based analysis instead of `$feature_flag_called`.

---

## 3.3 — NPS survey after case status check

| Asset | Link |
|-------|------|
| Survey | [NPS after first case status check](https://us.posthog.com/project/369087/surveys/019f346e-21f7-0000-0709-bbf4a29078ce) |

- **Type:** Popover, schedule `once`
- **Trigger:** `case_status_check_completed` (client capture)
- **Questions:** 7-point NPS-style rating + optional open feedback
- **Cooldown:** 30 days since any survey

### Client mirror event

Server routes already emit `case_status_check_completed`. In-app surveys require a **browser** capture:

| Trigger site | File |
|--------------|------|
| Manual refresh success | `CaseStatusSection.tsx` |
| Onboarding receipt save + status resolved | `OnboardingWizard.tsx` |

Helper: `captureCaseStatusCheckCompletedClient()` in `lib/posthog-client.ts`.

Surveys display automatically via `posthog-js` when analytics consent is accepted.

---

## 3.4 — At-risk retention email

Mirrors PostHog cohort [396175](https://us.posthog.com/project/369087/cohorts/396175):

- Signed up in **90 days**
- No sign-in in **14 days**
- Deduped via `email_queue.email_type = at_risk_reengagement`

| File | Role |
|------|------|
| `lib/posthog/at-risk-reengagement.ts` | Candidate query (auth.admin.listUsers) |
| `app/api/cron/at-risk-reengagement/route.ts` | Weekly cron (env-gated) |
| `lib/notifications/transactional-emails.ts` | `sendAtRiskReengagementEmail` |

### Enable in production

```bash
AT_RISK_REENGAGEMENT_ENABLED=true
```

**Vercel cron:** Mondays 15:00 UTC → `/api/cron/at-risk-reengagement`

**Dry run:**

```bash
curl -s "https://www.trackmyopt.com/api/cron/at-risk-reengagement?dry_run=true" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Analytics event:** `at_risk_reengagement_email_sent` (server)

---

## 3.5 — Source maps for error tracking

| Setting | Location |
|---------|----------|
| `productionBrowserSourceMaps` | `next.config.js` (when `POSTHOG_SOURCEMAPS_ENABLED=true`) |
| Upload wrapper | `@posthog/nextjs-config` `withPostHogConfig` |

### Vercel env (production builds only)

```bash
POSTHOG_SOURCEMAPS_ENABLED=true
POSTHOG_PERSONAL_API_KEY=phx_...   # write access on error tracking
POSTHOG_PROJECT_ID=369087
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

Source maps upload on `next build` when all vars are set. Maps are deleted locally after upload (`deleteAfterUpload: true`).

Verify in PostHog → Error tracking → Symbol sets after the next production deploy.

---

## Phase 3 exit criteria — met

| Step | Status |
|------|--------|
| 3.1 Feature flag `onboarding-receipt-variant` | ✅ Running via experiment 381118 |
| 3.2 Experiment receipt-required vs optional | ✅ 3 variants launched |
| 3.3 NPS survey after case status check | ✅ Survey live + client event |
| 3.4 At-risk retention email | ✅ Cron + email + dedupe |
| 3.5 Source maps + symbol sets | ✅ Config + `@posthog/nextjs-config` |

---

## Deploy checklist

1. Deploy app code (wizard variants, client events, cron route).
2. Confirm `onboarding_receipt_variant_exposed` appears in [Live events](https://us.posthog.com/project/369087/activity/explore).
3. Set `AT_RISK_REENGAGEMENT_ENABLED=true` when ready for weekly sends.
4. Set PostHog source map env vars on Vercel before next production build.
